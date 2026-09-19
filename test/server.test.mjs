import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../server.mjs";
import { createWorkflow } from "../lib/workflow.mjs";
async function withServer(workflow, action, limit = 20) {
  const server = createApp({ workflow, limit });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  try {
    await action(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((r) => server.close(r));
  }
}
const post = (base, message) =>
  fetch(`${base}/api/understand`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
test("HTTP health, CSP, static routes, invalid input and oversized body", async () => {
  let calls = 0;
  await withServer(
    createWorkflow(async () => {
      calls++;
    }),
    async (base) => {
      assert.equal((await fetch(`${base}/health`)).status, 200);
      const home = await fetch(base);
      assert.equal(home.status, 200);
      assert.match(
        home.headers.get("content-security-policy"),
        /script-src 'self'/,
      );
      assert.equal((await fetch(`${base}/.env`)).status, 404);
      assert.equal((await post(base, "")).status, 400);
      assert.equal((await post(base, "x".repeat(4001))).status, 400);
      assert.equal((await post(base, "x".repeat(21000))).status, 413);
    },
  );
  assert.equal(calls, 0);
});
test("upstream failure returns explicit retryable error with blocked DAG nodes", async () => {
  await withServer(
    createWorkflow(async () => {
      throw new Error("secret upstream details");
    }),
    async (base) => {
      const response = await post(base, "a notice");
      const body = await response.json();
      assert.equal(response.status, 502);
      assert.equal(body.retryable, true);
      assert.ok(!JSON.stringify(body).includes("secret"));
      assert.equal(
        body.execution.nodes.find((n) => n.id === "compose_plan").status,
        "blocked",
      );
    },
  );
});
test("request throttle has a retry-after header", async () => {
  await withServer(
    async () => ({}),
    async (base) => {
      assert.equal((await post(base, "a")).status, 200);
      const second = await post(base, "b");
      assert.equal(second.status, 429);
      assert.equal(second.headers.get("retry-after"), "60");
    },
    1,
  );
});
