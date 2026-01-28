const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "phase3_db",
  password: "5053293",
  port: 5432,
});

module.exports = pool;
