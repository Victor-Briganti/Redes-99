const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  host: "pg-test",
  port: 5432,
  user: "appuser",
  password: "123mudar",
  database: "appdb",
});

app.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM users ORDER BY id");

  let rows = "";

  for (const user of result.rows) {
    rows += `
      <tr>
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>
          <form action="/delete/${user.id}" method="POST">
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

  await pool.query(
    "INSERT INTO users (name, email) VALUES ($1, $2)",
    [name, email]
  );

  res.redirect("/");
});

app.post("/delete/:id", async (req, res) => {
  const { id } = req.params;

  await pool.query(
    "DELETE FROM users WHERE id = $1",
    [id]
  );

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
