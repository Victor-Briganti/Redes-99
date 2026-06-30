FROM debian:stable

ENV APP_USER="appuser"
ENV APP_PASS="123mudar"
ENV APP_DB="appdb"

RUN apt -y update && apt install -y postgresql \
    && pg_ctlcluster 17 main start \
    && su postgres -c "psql -c \"CREATE ROLE $APP_USER WITH LOGIN PASSWORD '$APP_PASS';\"" \
    && su postgres -c "psql -c \"CREATE DATABASE $APP_DB OWNER $APP_USER;\"" \
    && echo "listen_addresses = '*'" >> /etc/postgresql/17/main/postgresql.conf \
    && echo "host all all 0.0.0.0/0 scram-sha-256" >> /etc/postgresql/17/main/pg_hba.conf \
    && pg_ctlcluster 17 main stop

USER postgres

CMD ["/usr/lib/postgresql/17/bin/postgres", "-D", "/var/lib/postgresql/17/main", "-c", "config_file=/etc/postgresql/17/main/postgresql.conf"]
