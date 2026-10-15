
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("required portal and deployment files exist", () => {
  for (const file of [
    "index.html",
    "styles.css",
    "script.js",
    "Dockerfile",
    "healthz",
    "deployment.yaml"
  ]) {
    assert.ok(fs.existsSync(path.join(root, file)), `${file} must exist`);
  }
});

test("HTML includes the main event portal sections", () => {
  const html = read("index.html");
  for (const section of [
    'id="events"',
    'id="schedule"',
    'id="registration"',
    'id="faculty"',
    'id="updates"'
  ]) {
    assert.ok(html.includes(section), `Missing ${section}`);
  }
});

test("JavaScript implements search, registration and event creation", () => {
  const js = read("script.js");
  for (const feature of [
    "renderEvents",
    "registerForEvent",
    "status-form",
    "event-form",
    "renderMonitor"
  ]) {
    assert.ok(js.includes(feature), `Missing feature: ${feature}`);
  }
});

test("Kubernetes configuration uses three replicas and NodePort", () => {
  const yaml = read("deployment.yaml");
  assert.match(yaml, /replicas:\s*3/);
  assert.match(yaml, /type:\s*NodePort/);
  assert.match(yaml, /nodePort:\s*30015/);
  assert.match(yaml, /RollingUpdate/);
});

test("container has a health check and exposes port 80", () => {
  const dockerfile = read("Dockerfile");
  assert.match(dockerfile, /EXPOSE 80/);
  assert.match(dockerfile, /HEALTHCHECK/);
  assert.match(read("healthz").trim(), /^ok$/);
});

test("application does not use unsafe dynamic evaluation or document.write", () => {
  const js = read("script.js");
  assert.doesNotMatch(js, /\beval\s*\(/);
  assert.doesNotMatch(js, /\bdocument\s*\.\s*write\s*\(/);
});
