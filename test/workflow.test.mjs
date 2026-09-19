import test from "node:test";
import assert from "node:assert/strict";
import { createWorkflow } from "../lib/workflow.mjs";
import { validDate, dueCue, sortTasks } from "../public/task-utils.js";
const explanation = {
  summary: "The message asks you to attend.",
  candidateSteps: ["Attend your appointment."],
  preparation: ["You may want your glasses."],
  questions: [],
  dateNeedsClarification: false,
};
const safety = {
  risk: "ordinary",
  cautions: ["Confirm important details."],
  verificationSteps: [],
  questions: [],
};
const fake = async ({ schema }) =>
  structuredClone(schema.properties.summary ? explanation : safety);
test("invalid input does not make any AI call", async () => {
  let calls = 0;
  const run = createWorkflow(async () => {
    calls++;
  });
  for (const input of [null, 42, "", "  ", "a".repeat(4001)])
    await assert.rejects(run(input));
  assert.equal(calls, 0);
});
test("two validated branches produce five completed nodes", async () => {
  const result = await createWorkflow(fake)("Appointment notice");
  assert.equal(result.execution.nodes.length, 5);
  assert.ok(result.execution.nodes.every((n) => n.status === "completed"));
  assert.deepEqual(result.plan.steps, explanation.candidateSteps);
});
test("substantial risk replaces candidate instructions and removes preparation; questions retained", async () => {
  const result = await createWorkflow(async ({ schema }) =>
    schema.properties.summary
      ? {
          ...explanation,
          questions: ["Which clinic?"],
          dateNeedsClarification: true,
        }
      : {
          ...safety,
          risk: "substantial",
          verificationSteps: ["Call a number you already trust."],
          questions: ["Who sent it?"],
        },
  )("Untrusted notice");
  assert.deepEqual(result.plan.steps, ["Call a number you already trust."]);
  assert.deepEqual(result.plan.preparation, []);
  assert.equal(result.plan.instructionsWithheld, true);
  assert.equal(result.plan.questions.length, 3);
});
test("malformed AI branch and upstream failure cannot bypass join", async () => {
  for (const branch of ["summary", "risk"]) {
    await assert.rejects(
      createWorkflow(async ({ schema }) => {
        if (schema.properties[branch]) return {};
        return fake({ schema });
      })("notice"),
      (error) => {
        assert.equal(
          error.execution.nodes.find((n) => n.id === "compose_plan").status,
          "blocked",
        );
        return true;
      },
    );
  }
  await assert.rejects(
    createWorkflow(async () => {
      throw new Error("upstream unavailable");
    })("notice"),
  );
});
test("date cues use local calendar strings, not UTC conversion; completed tasks are not overdue", () => {
  assert.equal(
    dueCue({ due: "2026-09-18", done: false }, "2026-09-19"),
    "Overdue",
  );
  assert.equal(
    dueCue({ due: "2026-09-19", done: false }, "2026-09-19"),
    "Due today",
  );
  assert.equal(
    dueCue({ due: "2026-09-20", done: false }, "2026-09-19"),
    "Upcoming",
  );
  assert.equal(
    dueCue({ due: "2026-09-18", done: true }, "2026-09-19"),
    "Completed",
  );
  assert.equal(validDate("2026-02-30"), false);
  assert.equal(validDate("2028-02-29"), true);
  assert.equal(
    sortTasks([
      { due: "", done: false, created: 1 },
      { due: "2026-09-18", done: false, created: 2 },
    ])[0].due,
    "2026-09-18",
  );
});
test("selected locale reaches both AI branches; invalid locale makes no calls; source stays unchanged", async () => {
  const seen = [];
  const source = "  English appointment notice.\n";
  const run = createWorkflow(async (args) => {
    seen.push({ message: args.message, locale: args.locale });
    return fake(args);
  });
  const result = await run(source, { locale: "hi" });
  assert.equal(result.locale, "hi");
  assert.deepEqual(seen, [
    { message: source, locale: "hi" },
    { message: source, locale: "hi" },
  ]);
  await assert.rejects(run(source, { locale: "unsupported" }));
  assert.equal(seen.length, 2);
});
test("generated dash punctuation is normalized without changing original input", async () => {
  const result = await createWorkflow(async (args) =>
    args.schema.properties.summary
      ? {
          ...explanation,
          summary: "Read this\u2014then decide.",
          candidateSteps: ["Check time\u2013carefully."],
        }
      : safety,
  )("Original\u2014message");
  assert.ok(!/[\u2013\u2014]/.test(JSON.stringify(result.plan)));
});
