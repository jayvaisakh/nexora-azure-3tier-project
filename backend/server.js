"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const requiredEnvironmentVariables = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME"
];

const missingVariables = requiredEnvironmentVariables.filter(
  (name) => !process.env[name]
);

if (missingVariables.length > 0) {
  console.error(
    `Missing required environment variables: ${missingVariables.join(", ")}`
  );
  process.exit(1);
}

const app = express();
const port = Number(process.env.PORT || 5000);

app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "100kb" }));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "nexora-backend",
    backend: "vm-nexora-backend"
  });
});

app.get("/api/db-test", async (_request, response) => {
  try {
    const result = await pool.query("SELECT NOW() AS time");
    response.json({
      database: "connected",
      db_server: process.env.DB_SERVER_NAME || process.env.DB_HOST,
      time: result.rows[0].time
    });
  } catch (error) {
    console.error("Database connectivity check failed:", error);
    response.status(503).json({
      database: "disconnected",
      error: "Unable to connect to PostgreSQL"
    });
  }
});

app.get("/api/products", async (_request, response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, price, category, image_url
       FROM products
       ORDER BY id`
    );
    response.json(result.rows);
  } catch (error) {
    console.error("Product query failed:", error);
    response.status(500).json({ error: "Unable to load products" });
  }
});

app.use((request, response) => {
  response.status(404).json({
    error: "Route not found",
    path: request.originalUrl
  });
});

app.use((error, _request, response, _next) => {
  console.error("Unhandled application error:", error);
  response.status(500).json({ error: "Internal server error" });
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Nexora backend listening on port ${port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully.`);
  server.close(async () => {
    try {
      await pool.end();
      process.exit(0);
    } catch (error) {
      console.error("Error while closing PostgreSQL pool:", error);
      process.exit(1);
    }
  });

  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
