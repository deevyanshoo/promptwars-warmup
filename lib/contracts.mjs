export const MAX_INPUT = 4000;
export class InputError extends Error {}
export function validateInput(value) {
  if (typeof value !== "string" || !value.trim())
    throw new InputError("Please paste a message first.");
  if (value.length > MAX_INPUT)
    throw new InputError(
      "Please shorten your message to 4,000 characters or fewer.",
    );
  return value;
}
const string = { type: "string" };
const list = (max) => ({ type: "array", items: string, maxItems: max });
export const explanationSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: string,
    candidateSteps: list(5),
    preparation: list(3),
    questions: list(3),
    dateNeedsClarification: { type: "boolean" },
  },
  required: [
    "summary",
    "candidateSteps",
    "preparation",
    "questions",
    "dateNeedsClarification",
  ],
};
export const safetySchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    risk: { type: "string", enum: ["ordinary", "uncertain", "substantial"] },
    cautions: list(5),
    verificationSteps: list(5),
    questions: list(3),
  },
  required: ["risk", "cautions", "verificationSteps", "questions"],
};
export function validateLocale(value = "hi") {
  if (!["hi", "en"].includes(value))
    throw new InputError("Please choose Hindi or English.");
  return value;
}
function exact(value, keys) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).length !== keys.length ||
    keys.some((k) => !Object.hasOwn(value, k))
  )
    throw new Error("Invalid output fields");
}
function text(value, max) {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value.length > max ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
  )
    throw new Error("Invalid output text");
}
function texts(value, count, max = 280) {
  if (!Array.isArray(value) || value.length > count)
    throw new Error("Invalid output list");
  value.forEach((v) => text(v, max));
}
export function validateExplanation(value) {
  exact(value, Object.keys(explanationSchema.properties));
  text(value.summary, 800);
  texts(value.candidateSteps, 5);
  texts(value.preparation, 3);
  texts(value.questions, 3);
  if (typeof value.dateNeedsClarification !== "boolean")
    throw new Error("Invalid date flag");
  return value;
}
export function validateSafety(value) {
  exact(value, Object.keys(safetySchema.properties));
  if (!["ordinary", "uncertain", "substantial"].includes(value.risk))
    throw new Error("Invalid risk");
  texts(value.cautions, 5);
  texts(value.verificationSteps, 5);
  texts(value.questions, 3);
  if (
    value.risk === "substantial" &&
    (!value.cautions.length || !value.verificationSteps.length)
  )
    throw new Error("Incomplete safety review");
  return value;
}
export function composePlan(explanation, safety, locale = "en") {
  // Normalize only generated display copy. The original input is never altered.
  const clean = (value) =>
    typeof value === "string"
      ? value.replace(/[\u2013\u2014]/g, ", ")
      : Array.isArray(value)
        ? value.map(clean)
        : value;
  explanation = Object.fromEntries(
    Object.entries(explanation).map(([k, v]) => [k, clean(v)]),
  );
  safety = Object.fromEntries(
    Object.entries(safety).map(([k, v]) => [k, clean(v)]),
  );
  const risky = safety.risk === "substantial";
  return {
    summary: explanation.summary,
    steps: risky ? safety.verificationSteps : explanation.candidateSteps,
    preparation: risky ? [] : explanation.preparation,
    cautions: safety.cautions,
    questions: [
      ...new Set([
        ...explanation.questions,
        ...safety.questions,
        ...(explanation.dateNeedsClarification
          ? [
              locale === "hi"
                ? "सही तारीख क्या है? काम की तारीख चुनने से पहले इसे पक्का कर लें।"
                : "What is the exact date? Please confirm it before choosing a due date.",
            ]
          : []),
      ]),
    ],
    risk: safety.risk,
    dateNeedsClarification: explanation.dateNeedsClarification,
    instructionsWithheld: risky,
  };
}
export function validatePlan(value) {
  exact(value, [
    "summary",
    "steps",
    "preparation",
    "cautions",
    "questions",
    "risk",
    "dateNeedsClarification",
    "instructionsWithheld",
  ]);
  text(value.summary, 800);
  texts(value.steps, 5);
  texts(value.preparation, 3);
  texts(value.cautions, 5);
  texts(value.questions, 7);
  if (
    !["ordinary", "uncertain", "substantial"].includes(value.risk) ||
    typeof value.dateNeedsClarification !== "boolean" ||
    typeof value.instructionsWithheld !== "boolean"
  )
    throw new Error("Invalid final values");
  if (value.instructionsWithheld !== (value.risk === "substantial"))
    throw new Error("Invalid safety composition");
  return value;
}
