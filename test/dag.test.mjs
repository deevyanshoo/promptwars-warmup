import test from 'node:test';
import assert from 'node:assert/strict';
import { executeDag, validateGraph, DagError } from '../lib/dag.mjs';
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const tick = () => new Promise(r => setImmediate(r));

test('independent branches start concurrently; join waits for both; results only reach dependents; nodes run once', async () => {
  const a = deferred(), b = deferred(), events = [];
  const result = executeDag([
    { id: 'root', dependsOn: [], async run() { events.push('root'); return 'source'; } },
    { id: 'a', dependsOn: ['root'], async run(_, deps) { assert.deepEqual(deps, { root: 'source' }); events.push('a'); await a.promise; return 'A'; } },
    { id: 'b', dependsOn: ['root'], async run(_, deps) { assert.deepEqual(deps, { root: 'source' }); events.push('b'); await b.promise; return 'B'; } },
    { id: 'join', dependsOn: ['a', 'b'], async run(_, deps) { events.push('join'); assert.deepEqual(deps, { a: 'A', b: 'B' }); return 'joined'; } },
  ], {});
  await tick(); assert.deepEqual(events, ['root', 'a', 'b']);
  a.resolve(); await tick(); assert.deepEqual(events, ['root', 'a', 'b']);
  b.resolve(); const done = await result;
  assert.deepEqual(events, ['root', 'a', 'b', 'join']);
  assert.deepEqual(done.outputs, { join: 'joined' });
  assert.ok(done.execution.nodes.every(n => n.status === 'completed'));
});
test('failed required branch blocks downstream join and final node', async () => {
  let joined = false;
  await assert.rejects(executeDag([
    { id: 'a', dependsOn: [], async run() { throw new Error('upstream'); } },
    { id: 'b', dependsOn: [], async run() { return 'ok'; } },
    { id: 'join', dependsOn: ['a', 'b'], async run() { joined = true; } },
    { id: 'final', dependsOn: ['join'], async run() { joined = true; } },
  ], {}), error => {
    assert.ok(error instanceof DagError);
    assert.deepEqual(error.execution.nodes.map(n => n.status), ['failed', 'completed', 'blocked', 'blocked']); return true;
  }); assert.equal(joined, false);
});
test('duplicate IDs, missing dependencies and cycles are rejected', () => {
  const node = (id, dependsOn) => ({ id, dependsOn, async run() {} });
  assert.throws(() => validateGraph([node('a', []), node('a', [])]), /Duplicate/);
  assert.throws(() => validateGraph([node('a', ['missing'])]), /Missing/);
  assert.throws(() => validateGraph([node('a', ['b']), node('b', ['a'])]), /Cycle/);
});
test('execution has a bounded deadline even if a node ignores cancellation', async () => {
  const started = Date.now();
  await assert.rejects(executeDag([
    { id: 'stuck', dependsOn: [], async run() { return new Promise(() => {}); } },
    { id: 'downstream', dependsOn: ['stuck'], async run() { assert.fail('must not run'); } },
  ], {}, { timeoutMs: 25 }), error => {
    assert.equal(error.execution.nodes[0].status, 'failed');
    assert.equal(error.execution.nodes[1].status, 'blocked'); return true;
  }); assert.ok(Date.now() - started < 1000);
});
test('concurrent request input and output state are isolated', async () => {
  const nodes = [{ id: 'one', dependsOn: [], async run({ input }) { await tick(); return input.value; } }];
  const results = await Promise.all([executeDag(nodes, { value: 'first' }), executeDag(nodes, { value: 'second' })]);
  assert.equal(results[0].outputs.one, 'first'); assert.equal(results[1].outputs.one, 'second');
});
