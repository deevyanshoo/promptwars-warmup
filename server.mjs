import http from "node:http";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { GoogleGenAI } from "@google/genai";
import { createWorkflow } from "./lib/workflow.mjs";
import { InputError } from "./lib/contracts.mjs";

const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT || "promptwars-divyanshu-260919",
  location: process.env.GOOGLE_CLOUD_LOCATION || "global",
  httpOptions: { timeout: 40000, retryOptions: { attempts: 1 } },
});
let aiActive = 0;
async function generate({ message, locale, prompt, schema, signal }) {
  if (aiActive >= 4) throw new Error("AI concurrency capacity reached");
  aiActive++;
  try {
    const response = await ai.models.generateContent({
      model,
      contents: JSON.stringify({ untrustedMessage: message }),
      config: {
        systemInstruction: `${prompt}\nToday's date is ${new Date().toISOString().slice(0, 10)}. Write every display string in ${locale === "hi" ? "simple conversational Hindi using Devanagari" : "plain English"}. Accept Hindi or English source text. Preserve source names, dates, times, amounts and uncertainties accurately. Do not translate or modify the source message itself. Keep JSON keys and enum values in English.`,
        responseMimeType: "application/json",
        responseJsonSchema: schema,
        maxOutputTokens: 3000,
        thinkingConfig: { thinkingLevel: "LOW" },
        abortSignal: signal,
      },
    });
    if (!response.text || response.candidates?.[0]?.finishReason !== "STOP")
      throw new Error("Incomplete AI response");
    return JSON.parse(response.text);
  } finally {
    aiActive--;
  }
}

const staticFiles = new Map([
  ["/", ["public/index.html", "text/html; charset=utf-8"]],
  ["/i18n.js", ["public/i18n.js", "text/javascript; charset=utf-8"]],
  ["/app.js", ["public/app.js", "text/javascript; charset=utf-8"]],
  ["/styles.css", ["public/styles.css", "text/css; charset=utf-8"]],
  [
    "/task-utils.js",
    ["public/task-utils.js", "text/javascript; charset=utf-8"],
  ],
]);
export function createApp({
  workflow = createWorkflow(generate),
  limit = 20,
} = {}) {
  let active = 0;
  let requests = [];
  return http.createServer(async (req, res) => {
    const headers = {
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Permissions-Policy": "camera=(), microphone=(self), geolocation=()",
      "Cache-Control": "no-store",
    };
    const send = (status, body, extra = {}) => {
      if (res.destroyed || res.writableEnded) return;
      res.writeHead(status, {
        ...headers,
        "Content-Type": "application/json; charset=utf-8",
        ...extra,
      });
      res.end(JSON.stringify(body));
    };
    const path = new URL(req.url, "http://localhost").pathname;
    if (req.method === "GET" && path === "/health")
      return send(200, {
        status: "ok",
        service: "daywell",
        commit: process.env.APP_COMMIT || "local",
      });
    if (req.method === "GET" && staticFiles.has(path)) {
      try {
        const [file, type] = staticFiles.get(path);
        const content = await readFile(new URL(file, import.meta.url));
        res.writeHead(200, { ...headers, "Content-Type": type });
        res.end(content);
      } catch {
        send(500, { error: "The page could not load. Please refresh." });
      }
      return;
    }
    if (req.method !== "POST" || path !== "/api/understand")
      return send(404, { error: "Page not found." });
    if (!req.headers["content-type"]?.startsWith("application/json"))
      return send(415, { error: "Please send a JSON message." });
    if (req.headers["sec-fetch-site"] === "cross-site")
      return send(403, { error: "Please use Daywell directly." });
    const now = Date.now();
    requests = requests.filter((t) => now - t < 60000);
    // Global per-instance admission limit also works behind a proxy without trusting spoofable IP headers.
    if (requests.length >= limit || active >= 2)
      return send(
        429,
        {
          error: "Daywell is busy. Please wait a minute and try again.",
          retryable: true,
        },
        { "Retry-After": "60" },
      );
    requests.push(now);
    active++;
    const controller = new AbortController();
    const disconnect = () => {
      if (!res.writableEnded) controller.abort();
    };
    res.on("close", disconnect);
    const timer = setTimeout(() => {
      controller.abort();
      send(408, {
        error:
          "This took too long. Your message is still here. Please try again.",
        retryable: true,
      });
    }, 50000);
    try {
      let length = 0;
      const chunks = [];
      for await (const chunk of req) {
        length += chunk.length;
        if (length > 20000) {
          send(413, {
            error: "Please shorten your message to 4,000 characters or fewer.",
          });
          req.resume();
          return;
        }
        chunks.push(chunk);
      }
      let body;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch {
        return send(400, {
          error: "The message could not be read. Please try again.",
        });
      }
      const result = await workflow(body?.message, {
        timeoutMs: 45000,
        signal: controller.signal,
        locale: body?.locale,
      });
      if (!res.writableEnded) send(200, result);
    } catch (error) {
      if (res.writableEnded) return;
      const invalid = error.cause instanceof InputError;
      send(invalid ? 400 : 502, {
        error: invalid
          ? error.cause.message
          : "We couldn’t read this message right now. Your text is still here. Please try again. Both the explanation and caution check must finish before we can show suggestions.",
        retryable: !invalid,
        ...(error.execution ? { execution: error.execution } : {}),
      });
      if (!invalid)
        console.error(
          JSON.stringify({
            event: "workflow_failed",
            type: error.name,
            category: error.cause?.message?.startsWith("Invalid")
              ? error.cause.message
              : "upstream_or_timeout",
          }),
        );
    } finally {
      active--;
      clearTimeout(timer);
      res.off("close", disconnect);
    }
  });
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const server = createApp();
  server.requestTimeout = 55000;
  server.headersTimeout = 10000;
  server.listen(Number(process.env.PORT) || 8080, "0.0.0.0", () =>
    console.log("Daywell listening"),
  );
}
