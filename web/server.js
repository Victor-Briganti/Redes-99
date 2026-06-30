const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  host: "db",
  port: 5432,
  user: "appuser",
  password: "123mudar",
  database: "appdb",

  // Avoid waiting forever when PostgreSQL is down
  connectionTimeoutMillis: 2000,

  // Remove idle clients after some time
  idleTimeoutMillis: 10000,

  max: 10,
});

pool.on("error", (error) => {
  console.error("Idle database connection error:", error.message);
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isConnectionError(error) {
  const connectionErrorCodes = [
    "ECONNREFUSED",
    "ECONNRESET",
    "ETIMEDOUT",
    "EPIPE",
    "ENOTFOUND",

    // PostgreSQL connection errors
    "08000",
    "08003",
    "08006",

    // PostgreSQL server shutdown / unavailable
    "57P01",
    "57P02",
    "57P03",
  ];

  return (
    connectionErrorCodes.includes(error.code) ||
    /Connection terminated/i.test(error.message) ||
    /Connection ended unexpectedly/i.test(error.message) ||
    /terminating connection/i.test(error.message)
  );
}

async function queryDatabase(sql, params = []) {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await pool.query(sql, params);
    } catch (error) {
      if (!isConnectionError(error)) {
        throw error;
      }

      console.error(
        `Database connection failed, attempt ${attempt}/${maxAttempts}:`,
        error.message
      );

      if (attempt === maxAttempts) {
        throw error;
      }

      await sleep(1000);
    }
  }
}

function redirectWithMessage(res, message) {
  res.redirect(`/?message=${encodeURIComponent(message)}`);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

app.get("/", async (req, res) => {
  let message = req.query.message || "";
  let users = [];

  try {
    const result = await queryDatabase("SELECT * FROM users ORDER BY id");
    users = result.rows;
  } catch (error) {
    console.error("Could not load users:", error.message);

    message =
      "Database is not available right now. The application is still running and will reconnect when possible.";
  }

  let rows = "";

  for (const user of users) {
    rows += `
      <tr>
        <td>${escapeHtml(user.id)}</td>
        <td>${escapeHtml(user.name)}</td>
        <td>${escapeHtml(user.email)}</td>
        <td>
          <form action="/delete/${escapeHtml(user.id)}" method="POST">
            <button type="submit">Delete</button>
          </form>
        </td>
      </tr>
    `;
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Users</title>
    </head>
    <body>
      <h1>Users</h1>

      ${message
      ? `<p style="color: red;"><strong>${escapeHtml(message)}</strong></p>`
      : ""
    }

      <form action="/add" method="POST">
        <input type="text" name="name" placeholder="Name" required>
        <input type="email" name="email" placeholder="Email" required>
        <button type="submit">Add user</button>
      </form>

      <br>

      <table border="1" cellpadding="8">
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Action</th>
        </tr>
        ${rows}
      </table>
    </body>
    </html>
  `);
});

app.post("/add", async (req, res) => {
  const { name, email } = req.body;

  try {
    await queryDatabase(
      "INSERT INTO users (name, email) VALUES ($1, $2)",
      [name, email]
    );

    res.redirect("/");
  } catch (error) {
    if (error.code === "23505") {
      redirectWithMessage(res, "This email is already registered");
      return;
    }

    if (isConnectionError(error)) {
      redirectWithMessage(
        res,
        "Database is not available right now. Try again in a few seconds."
      );
      return;
    }

    console.error("Could not add user:", error.message);
    redirectWithMessage(res, "Unexpected error while adding user");
  }
});

app.post("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await queryDatabase(
      "DELETE FROM users WHERE id = $1",
      [id]
    );

    res.redirect("/");
  } catch (error) {
    if (isConnectionError(error)) {
      redirectWithMessage(
        res,
        "Database is not available right now. Try again in a few seconds."
      );
      return;
    }

    console.error("Could not delete user:", error.message);
    redirectWithMessage(res, "Unexpected error while deleting user");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
