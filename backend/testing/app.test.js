import "dotenv/config";

import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import mongoose from "mongoose";

import { connectDB } from "../config/db.js";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET ??= "test-secret";

test("signup, login and logout flow", async (t) => {
  assert.ok(
    process.env.MONGO_TEST_URI,
    "MONGO_TEST_URI is required to run tests"
  );

  const { default: app } = await import("../server.js");

  // Setup
  await connectDB();
  await mongoose.connection.dropDatabase();

  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(0, resolve));

  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));

    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  const api = async (path, options = {}) => {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const body = await res.json();

    return { res, body };
  };

  // SIGNUP
  let { res, body } = await api("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      name: "Test User",
      email: "test@example.com",
      password: "secret123",
    }),
  });

  assert.equal(res.status, 201);
  assert.equal(body.user.email, "test@example.com");

  // LOGIN
  ({ res, body } = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "test@example.com",
      password: "secret123",
    }),
  }));

  assert.equal(res.status, 200);

  const cookie = res.headers.get("set-cookie");

  assert.ok(cookie);
  assert.match(cookie, /token=/);

  //LOGOUT
  ({ res, body } = await api("/api/auth/logout", {
    method: "POST",
    headers: {
      Cookie: cookie,
    },
  }));

  assert.equal(res.status, 200);
});