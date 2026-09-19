/** A dependency-driven, request-isolated DAG scheduler. No node sees unrelated outputs. */
export function validateGraph(nodes) {
  const byId = new Map();
  for (const node of nodes) {
    if (!node.id || !Array.isArray(node.dependsOn) || typeof node.run !== 'function') throw new Error('Invalid node');
    if (byId.has(node.id)) throw new Error(`Duplicate node: ${node.id}`);
    byId.set(node.id, node);
  }
  const visiting = new Set(), visited = new Set();
  function visit(id) {
    if (!byId.has(id)) throw new Error(`Missing dependency: ${id}`);
    if (visiting.has(id)) throw new Error(`Cycle at: ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of byId.get(id).dependsOn) visit(dependency);
    visiting.delete(id); visited.add(id);
  }
  for (const id of byId.keys()) visit(id);
  return byId;
}

export class DagError extends Error {
  constructor(cause, execution) {
    super('Workflow did not complete', { cause });
    this.name = 'DagError';
    this.execution = execution;
  }
}

export async function executeDag(nodes, input, { timeoutMs = 45000, signal } = {}) {
  validateGraph(nodes);
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) abort();
  const started = performance.now();
  const state = new Map(nodes.map(n => [n.id, { id: n.id, status: 'pending', durationMs: 0 }]));
  const results = new Map(), running = new Map();
  const context = Object.freeze({ input: structuredClone(input), signal: controller.signal });
  let firstError;
  let timer;
  const deadline = new Promise(resolve => {
    timer = setTimeout(() => { controller.abort(); resolve('timeout'); }, timeoutMs);
  });
  const metadata = () => ({ durationMs: Math.round(performance.now() - started), nodes: [...state.values()].map(s => ({ ...s })) });
  try {
    while ([...state.values()].some(s => ['pending', 'running'].includes(s.status))) {
      for (const node of nodes) {
        const record = state.get(node.id);
        if (record.status !== 'pending') continue;
        if (node.dependsOn.some(id => ['failed', 'blocked'].includes(state.get(id).status))) {
          record.status = 'blocked'; continue;
        }
        if (!node.dependsOn.every(id => state.get(id).status === 'completed')) continue;
        if (controller.signal.aborted) break;
        record.status = 'running';
        const start = performance.now();
        const dependencies = Object.freeze(Object.fromEntries(node.dependsOn.map(id => [id, structuredClone(results.get(id))])));
        const promise = Promise.resolve().then(() => node.run(context, dependencies)).then(output => {
          if (record.status !== 'running') return;
          results.set(node.id, structuredClone(output)); record.status = 'completed';
        }, error => {
          if (record.status !== 'running') return;
          firstError ||= error; record.status = 'failed';
        }).finally(() => {
          if (record.status !== 'failed' || record.durationMs === 0) record.durationMs = Math.round(performance.now() - start);
          running.delete(node.id);
        });
        running.set(node.id, promise);
      }
      if (controller.signal.aborted || (running.size && await Promise.race([...running.values(), deadline]) === 'timeout')) {
        firstError ||= new Error('Workflow timed out');
        for (const record of state.values()) {
          if (record.status === 'running') { record.status = 'failed'; record.durationMs = Math.round(performance.now() - started); }
          else if (record.status === 'pending') record.status = 'blocked';
        }
        break;
      }
      if (!running.size && ![...state.values()].some(s => s.status === 'pending')) break;
    }
    const execution = metadata();
    if (firstError) throw new DagError(firstError, execution);
    const sinks = nodes.filter(n => !nodes.some(other => other.dependsOn.includes(n.id)));
    return { outputs: Object.fromEntries(sinks.map(n => [n.id, results.get(n.id)])), execution };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
