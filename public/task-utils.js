export function localDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function validDate(value) {
  if (value === '') return true;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1900-01-01' || value > '2100-12-31') return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && localDate(date) === value;
}
export function dueCue(task, today = localDate()) {
  if (task.done) return 'Completed';
  if (!task.due) return 'No due date';
  if (task.due < today) return 'Overdue';
  if (task.due === today) return 'Due today';
  return 'Upcoming';
}
export function sortTasks(tasks) {
  return [...tasks].sort((a, b) => Number(a.done) - Number(b.done) || (a.due || '9999').localeCompare(b.due || '9999') || a.created - b.created);
}
export function validTask(t) {
  return t && typeof t.id === 'string' && t.id.length < 80 && typeof t.title === 'string' && t.title.trim().length > 0 && t.title.length <= 280 && typeof t.done === 'boolean' && validDate(t.due) && Number.isFinite(t.created) && Array.isArray(t.preparation) && t.preparation.length <= 3 && t.preparation.every(s => typeof s === 'string' && s.length <= 280);
}
