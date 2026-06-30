FROM debian:stable

ENV APP_USER="appuser"
ENV APP_PASS="123mudar"
ENV APP_DB="appdb"

COPY init.sql /tmp/init.sql

RUN apt-get -y update && apt-get install -y postgresql
RUN pg_ctlcluster 17 main start \
    && su postgres -c "psql -c \"CREATE ROLE $APP_USER WITH LOGIN PASSWORD '$APP_PASS';\"" \
    && su postgres -c "psql -c \"CREATE DATABASE $APP_DB OWNER $APP_USER;\"" \
    && su postgres -c "psql -v ON_ERROR_STOP=1 -d $APP_DB -f /tmp/init.sql" \
    && su postgres -c "psql -d $APP_DB -c \"GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $APP_USER;\"" \
    && su postgres -c "psql -d $APP_DB -c \"GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $APP_USER;\"" \
    && echo "listen_addresses = '*'" >> /etc/postgresql/17/main/postgresql.conf \
    && echo "host all all 0.0.0.0/0 scram-sha-256" >> /etc/postgresql/17/main/pg_hba.conf \
    && pg_ctlcluster 17 main stop

USER postgres

CMD ["/usr/lib/postgresql/17/bin/postgres", "-g", "/var/lib/postgresql/17/main", "-c", "config_file=/etc/postgresql/17/main/postgresql.conf"]
