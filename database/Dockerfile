FROM mcr.microsoft.com/mssql/server:2022-latest

USER root

RUN apt-get update && \
    apt-get install -y curl locales && \
    rm -rf /var/lib/apt/lists/*
RUN echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && \
    locale-gen
ENV LC_ALL en_US.UTF-8

RUN apt-get update && \
    ACCEPT_EULA=Y apt-get install -y mssql-tools && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /docker-entrypoint-initdb.d

COPY ./scripts/DDL.sql /docker-entrypoint-initdb.d/
COPY ./scripts/DML.sql /docker-entrypoint-initdb.d/
COPY ./init-db.sh /init-db.sh

RUN chmod +x /init-db.sh
EXPOSE 1433

CMD /bin/bash -c "(/opt/mssql/bin/sqlservr &) && sleep 30 && /init-db.sh && tail -f /dev/null"