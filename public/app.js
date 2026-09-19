import { tr, setLocale, getLocale } from './i18n.js';
import { localDate, validDate, dueCue, sortTasks, validTask } from './task-utils.js';
const $ = id => document.getElementById(id);
const KEY = 'daywell.v1';
let tasks = [], large = false, currentPlan = null, busy = false, locale = 'hi';
const added = new Set();
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function storageWarning(message) { $('storage-warning').textContent = message; $('storage-warning').hidden = false; }
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (saved) {
    if (!Array.isArray(saved.tasks) || saved.tasks.length > 100 || !saved.tasks.every(validTask)) throw new Error('Invalid saved data');
    tasks = saved.tasks; large = saved.large === true; locale = saved.locale === 'en' ? 'en' : 'hi';
  }
} catch { storageWarning('Saved data could not be loaded. Your current changes may only last until you close this page. You can clear saved data in My day.'); }
function save() {
  try { localStorage.setItem(KEY, JSON.stringify({ tasks, large, locale })); return true; }
  catch { storageWarning('This browser could not save your changes. Keep this page open; changes may be lost when you reload.'); return false; }
}
function applyText() { document.body.classList.toggle('large-text', large); $('text-toggle').setAttribute('aria-pressed', String(large)); $('text-toggle').textContent = large ? 'Text size: Standard' : 'Text size: Larger'; }
applyText();
setLocale(locale);
$('text-toggle').addEventListener('click', () => { large = !large; applyText(); save(); });
function showPanel(name, focus = false) {
  $(`${name}-panel`).scrollIntoView({ block: 'start', behavior: 'instant' });
  for (const section of ['understand', 'day']) {
    const button = $(`${section}-tab`);
    if (name === section) button.setAttribute('aria-current', 'location'); else button.removeAttribute('aria-current');
  }
  if (name === 'day') renderTasks();
  if (focus) { const heading = $(`${name}-heading`); heading.tabIndex = -1; heading.focus(); }
  window.speechSynthesis?.cancel();
}
$('understand-tab').addEventListener('click', () => showPanel('understand', true));
$('day-tab').addEventListener('click', () => showPanel('day', true));
$('today').textContent = new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
function updateCount() { $('character-count').textContent = `${$('message').value.length.toLocaleString()} / 4,000`; }
$('message').addEventListener('input', updateCount);
$('example').addEventListener('click', () => {
  $('message').value = 'Appointment notice: Your routine eye check-up is on 24 September 2026 at 10:30 AM at your usual clinic. Please arrive 15 minutes early and bring your appointment letter and current glasses. If you cannot attend, contact the clinic using the number you already have.';
  updateCount(); $('message').focus();
});
const names = { validate_input: 'Message checked', explain_and_extract: 'Explanation and preparation', review_safety: 'Independent caution review', compose_plan: 'Suggestions combined', validate_output: 'Final response checked' };
function showExecution(execution) {
  $('execution-details').hidden = !execution;
  $('execution-list').replaceChildren();
  if (!execution) return;
  for (const node of execution.nodes) $('execution-list').append(element('li', `${locale === 'hi' ? ({validate_input:'संदेश की जाँच',explain_and_extract:'मतलब और तैयारी',review_safety:'सावधानी की अलग जाँच',compose_plan:'सुझाव जोड़े',validate_output:'अंतिम जवाब की जाँच'}[node.id] || node.id) : names[node.id] || node.id}: ${locale === 'hi' ? ({completed:'पूरी हुई',failed:'पूरी नहीं हुई',blocked:'रोक दी गई'}[node.status] || node.status) : node.status} (${(node.durationMs / 1000).toFixed(2)} ${locale === 'hi' ? 'सेकंड' : 'seconds'})`));
}
function showList(id, values) {
  $(id).replaceChildren(...values.map(value => element('li', value)));
  $(`${id}-block`).hidden = values.length === 0;
}
function showPlan(plan) {
  currentPlan = plan; added.clear(); $('summary').textContent = plan.summary;
  showList('cautions', plan.cautions); showList('questions', plan.questions); showList('preparation', plan.preparation);
  $('risk-notice').hidden = !plan.instructionsWithheld;
  $('risk-notice').textContent = plan.instructionsWithheld ? 'Pause and verify. The caution review found significant concerns. Steps that act on the request have been withheld; the choices below are verification steps.' : '';
  $('suggestions').replaceChildren(); $('suggestion-date').value = ''; $('selection-status').textContent = '';
  plan.steps.forEach((step, index) => {
    const label = element('label', undefined, 'suggestion');
    const input = document.createElement('input'); input.type = 'checkbox'; input.value = index; input.name = 'step';
    label.append(input, element('span', step)); $('suggestions').append(label);
  });
  $('selection-form').hidden = !plan.steps.length;
  $('result').hidden = false; $('result-heading').focus();
}
async function understand(event) {
  event?.preventDefault(); if (busy) return;
  const message = $('message').value;
  $('request-error').hidden = true;
  if (!message.trim() || message.length > 4000) {
    $('error-text').textContent = message.trim() ? 'Please shorten your message to 4,000 characters or fewer.' : 'Please paste a message first, or try the appointment example.';
    $('request-error').hidden = false; $('retry').hidden = true; $('message').focus(); return;
  }
  stopDictation(true); busy = true; $('language-hi').disabled = true; $('language-en').disabled = true; $('voice-input').disabled = true; $('understand-button').disabled = true; $('example').disabled = true; $('message').readOnly = true;
  $('result').hidden = true; currentPlan = null; showExecution(null); window.speechSynthesis?.cancel();
  $('request-status').textContent = 'Reading your message and checking for anything that needs care. This can take up to 45 seconds.';
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 50000);
  try {
    const response = await fetch('/api/understand', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, locale }), signal: controller.signal });
    const data = await response.json(); showExecution(data.execution);
    if (!response.ok) throw new Error(data.error || 'We could not finish. Please try again.');
    showPlan(data.plan); currentPlan.locale = data.locale; $('request-status').textContent = 'Your explanation and caution check are ready. Choose any steps you want to keep.';
  } catch (error) {
    $('error-text').textContent = error.name === 'AbortError' ? 'This took longer than expected. Your message is still here. Please try again.' : (error instanceof TypeError ? 'We could not connect. Check your internet connection and try again. Your message is still here.' : error.message);
    $('request-error').hidden = false; $('retry').hidden = false; $('request-status').textContent = '';
  } finally {
    clearTimeout(timeout); busy = false; $('language-hi').disabled = false; $('language-en').disabled = false; $('voice-input').disabled = !Recognition; $('understand-button').disabled = false; $('example').disabled = false; $('message').readOnly = false;
  }
}
$('message-form').addEventListener('submit', understand); $('retry').addEventListener('click', understand);
$('selection-form').addEventListener('submit', event => {
  event.preventDefault(); if (!currentPlan) return;
  const inputs = [...$('suggestions').querySelectorAll('input:checked:not(:disabled)')];
  const due = $('suggestion-date').value;
  if (!inputs.length) { $('selection-status').textContent = 'Choose at least one step using the checkboxes.'; return; }
  if (!validDate(due)) { $('selection-status').textContent = 'Please choose a valid date.'; return; }
  if (tasks.length + inputs.length > 100) { $('selection-status').textContent = 'Your list can hold 100 tasks. Delete some tasks before adding more.'; return; }
  for (const input of inputs) {
    const index = Number(input.value); if (added.has(index)) continue;
    tasks.push({ id: crypto.randomUUID(), title: currentPlan.steps[index], due, done: false, preparation: [...currentPlan.preparation], created: Date.now() });
    added.add(index); input.disabled = true;
  }
  const saved = save(); renderTasks();
  $('selection-status').textContent = `${inputs.length} ${inputs.length === 1 ? 'step added' : 'steps added'} to My day.${saved ? ' Saved in this browser.' : ' Could not save to this browser.'}`;
});
$('manual-form').addEventListener('submit', event => {
  event.preventDefault(); const title = $('task-title').value.trim(), due = $('task-date').value;
  if (!title || title.length > 280 || !validDate(due)) { $('task-status').textContent = 'Enter a task and a valid optional date.'; return; }
  if (tasks.length >= 100) { $('task-status').textContent = 'Your list can hold 100 tasks. Delete a task to make room.'; return; }
  tasks.push({ id: crypto.randomUUID(), title, due, done: false, preparation: [], created: Date.now() });
  save(); renderTasks(); $('manual-form').reset(); $('task-title').focus(); $('task-status').textContent = 'Task added to My day.';
});
function formattedDate(date) { return new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`)); }
function renderTasks() {
  const sorted = sortTasks(tasks), pending = sorted.filter(t => !t.done), today = localDate();
  const overdue = pending.filter(t => t.due && t.due < today).length, dueToday = pending.filter(t => t.due === today).length, upcoming = pending.filter(t => t.due > today).length;
  $('task-count').textContent = pending.length; $('day-total').textContent = `${pending.length} still to do`;
  $('day-total').textContent = pending.length ? `${overdue} overdue · ${dueToday} today · ${upcoming} upcoming` : '0 tasks';
  $('next-action').textContent = pending.length ? `${locale === 'hi' ? 'अगला काम' : 'Next useful step'}: ${pending[0].title}${pending[0].due ? `. ${tr(dueCue(pending[0], today))}: ${formattedDate(pending[0].due)}.` : (locale === 'hi' ? '। चाहें तो तारीख चुनें।' : '. Choose a date if it would help.')}` : tr('Nothing planned yet. Add a task when you’re ready.');
  const list = $('task-list'); list.replaceChildren();
  if (!tasks.length) { const empty = element('div', undefined, 'empty'); empty.append(element('p', 'Steps you choose from an explanation will appear here, too.')); list.append(empty); }
  for (const task of sorted) {
    const row = element('article', undefined, `task-row${task.done ? ' done' : ''}`), content = element('div', undefined, 'task-content');
    const label = element('label', undefined, 'task-label'), check = document.createElement('input'); check.type = 'checkbox'; check.className = 'task-check'; check.checked = task.done;
    check.setAttribute('aria-label', `${task.done ? 'Mark incomplete' : 'Mark as done'}: ${task.title}`);
    check.addEventListener('change', () => { task.done = check.checked; save(); renderTasks(); $('task-status').textContent = task.done ? 'Task marked as done.' : 'Task marked incomplete.'; const replacement = [...list.querySelectorAll('input[type=checkbox]')].find(n => n.dataset.id === task.id); replacement?.focus(); });
    check.dataset.id = task.id;
    label.append(check, element('span', task.title, 'task-name')); content.append(label);
    const meta = element('div', undefined, 'task-meta'), cue = dueCue(task, today);
    meta.append(element('span', cue, `due-badge${cue === 'Overdue' ? ' overdue' : ''}`));
    const dateLabel = element('label', 'Due date (optional)'), date = document.createElement('input'); date.type = 'date'; date.value = task.due; date.min = '1900-01-01'; date.max = '2100-12-31'; date.setAttribute('aria-label', `Due date for ${task.title}`);
    date.addEventListener('change', () => { if (!validDate(date.value)) return; task.due = date.value; save(); renderTasks(); $('task-status').textContent = 'Due date updated.'; });
    dateLabel.append(date); meta.append(dateLabel); content.append(meta);
    if (task.preparation.length && !task.done) {
      const details = element('details', undefined, 'task-prep'), ul = element('ul');
      details.append(element('summary', 'Before you start · AI preparation suggestions'));
      for (const tip of task.preparation) ul.append(element('li', tip)); details.append(ul); content.append(details);
    }
    const remove = element('button', 'Delete'); remove.setAttribute('aria-label', `Delete task: ${task.title}`);
    remove.addEventListener('click', () => { tasks = tasks.filter(t => t.id !== task.id); save(); renderTasks(); $('task-status').textContent = 'Task deleted.'; $('task-title').focus(); });
    row.append(content, remove); list.append(row);
  }
}
renderTasks();
// Refresh local date cues when returning to the page and across midnight while it stays open.
document.addEventListener('visibilitychange', () => { if (!document.hidden) renderTasks(); });
setInterval(() => { if (!document.hidden && localDate() !== lastDate) { lastDate = localDate(); renderTasks(); } }, 30000);
let lastDate = localDate();
$('clear-data').addEventListener('click', () => { $('clear-confirm').hidden = false; $('cancel-clear').focus(); });
$('cancel-clear').addEventListener('click', () => { $('clear-confirm').hidden = true; $('clear-data').focus(); });
$('confirm-clear').addEventListener('click', () => {
  try { localStorage.removeItem(KEY); tasks = []; large = false; applyText(); renderTasks(); $('clear-confirm').hidden = true; $('storage-warning').hidden = true; $('task-status').textContent = 'Your saved tasks and display preference have been cleared.'; $('task-title').focus(); }
  catch { storageWarning('This browser did not allow Daywell to clear saved data. Use your browser settings to remove site data.'); }
});

function changeLanguage(value) {
  if (busy) return;
  stopDictation(true); window.speechSynthesis?.cancel(); locale = value; setLocale(locale); save(); renderTasks();
  $('today').textContent = new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  if (currentPlan) { currentPlan = null; $('result').hidden = true; showExecution(null); $('request-status').textContent = tr('Language changed. Explain the message again for a new answer. Saved tasks keep their original text.'); }
  updateVoiceAvailability();
}
$('language-hi').addEventListener('click', () => changeLanguage('hi'));
$('language-en').addEventListener('click', () => changeLanguage('en'));
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null, listening = false, voiceError = false, speechReceived = false;
function stopDictation(discard = false) {
  if (recognition && listening) { listening = false; if (discard) recognition.abort(); else recognition.stop(); }
  $('voice-stop').hidden = true;
}
if (!Recognition) { $('voice-input').disabled = true; $('voice-status').textContent = tr('Voice typing is not available in this browser. You can type or paste your message.'); }
$('voice-input').addEventListener('click', () => {
  if (!Recognition || listening || busy) return;
  window.speechSynthesis?.cancel();
  recognition = new Recognition(); recognition.lang = locale === 'hi' ? 'hi-IN' : 'en-IN';
  recognition.continuous = false; recognition.interimResults = false; recognition.maxAlternatives = 1;
  voiceError = false; speechReceived = false;
  recognition.onstart = () => { listening = true; $('voice-stop').hidden = false; $('voice-input').disabled = true; $('voice-status').textContent = tr('Listening. Speak now, then choose Stop dictation.'); };
  recognition.onresult = event => {
    if (busy || document.hidden) return;
    let addition = '';
    for (let i = event.resultIndex; i < event.results.length; i++) if (event.results[i].isFinal) addition += event.results[i][0].transcript + ' ';
    if (!addition.trim()) return;
    speechReceived = true;
    const source = $('message').value, separator = source && !/\s$/.test(source) ? ' ' : '';
    const combined = source + separator + addition.trim();
    if (combined.length > 4000) { $('voice-status').textContent = tr('The message is full. Review or shorten it before adding more.'); voiceError = true; }
    else { $('message').value = combined; updateCount(); }
    stopDictation();
  };
  recognition.onerror = event => {
    voiceError = true;
    const messages = { 'not-allowed':'Microphone access was denied. You can allow it in browser settings, or type your message.', 'service-not-allowed':'Microphone access was denied. You can allow it in browser settings, or type your message.', 'no-speech':'No speech was heard. Try again, or type your message.', 'network':'Voice typing could not connect. Check your connection, or type your message.', 'audio-capture':'Microphone is unavailable. You can type or paste your message.' };
    if (event.error !== 'aborted') $('voice-status').textContent = tr(messages[event.error] || 'Voice typing could not start. You can still type your message.');
  };
  recognition.onend = () => { listening = false; $('voice-stop').hidden = true; $('voice-input').disabled = busy; if (!voiceError) $('voice-status').textContent = tr(speechReceived ? 'Voice typing stopped. Review and edit your message before sending.' : 'No speech was heard. Try again, or type your message.'); };
  try { listening = true; $('voice-input').disabled = true; recognition.start(); } catch { listening = false; $('voice-input').disabled = false; $('voice-status').textContent = tr('Voice typing could not start. You can still type your message.'); }
});
$('voice-stop').addEventListener('click', () => stopDictation());
document.addEventListener('visibilitychange', () => { if (document.hidden) { stopDictation(true); window.speechSynthesis?.cancel(); } });
window.addEventListener('pagehide', () => { stopDictation(true); window.speechSynthesis?.cancel(); });
let voices = [];
function updateVoiceAvailability() {
  voices = window.speechSynthesis?.getVoices() || [];
  $('read-aloud').disabled = !window.speechSynthesis;
  $('stop-reading').disabled = !window.speechSynthesis;
  if (!window.speechSynthesis) $('speech-status').textContent = tr('Read aloud is not available in this browser.');
  else if (!voices.some(v => v.lang.toLowerCase().startsWith(locale))) $('speech-status').textContent = tr(locale === 'hi' ? 'No Hindi voice is available in this browser. You can read the text on screen.' : 'No English voice is available in this browser. You can read the text on screen.');
  else $('speech-status').textContent = '';
}
window.speechSynthesis?.addEventListener('voiceschanged', updateVoiceAvailability);
updateVoiceAvailability();
$('read-aloud').addEventListener('click', () => {
  if (!currentPlan || !window.speechSynthesis) return;
  stopDictation(true); speechSynthesis.cancel();
  const voiceLocale = currentPlan.locale || locale;
  const matching = voices.filter(v => v.lang.toLowerCase().startsWith(voiceLocale));
  const voice = matching.find(v => v.lang.toLowerCase() === `${voiceLocale}-in`) || matching[0];
  if (!voice) { $('speech-status').textContent = tr(voiceLocale === 'hi' ? 'No Hindi voice is available in this browser. You can read the text on screen.' : 'No English voice is available in this browser. You can read the text on screen.'); return; }
  const text = [currentPlan.summary, ...(currentPlan.instructionsWithheld ? [$('risk-notice').textContent] : []), ...currentPlan.cautions, ...currentPlan.questions, ...currentPlan.preparation, ...currentPlan.steps].join('. ');
  const utterance = new SpeechSynthesisUtterance(text); utterance.lang = voiceLocale === 'hi' ? 'hi-IN' : 'en-IN'; utterance.voice = voice; utterance.rate = .85;
  utterance.onend = () => { $('speech-status').textContent = tr('Reading finished.'); };
  utterance.onerror = event => { if (!['interrupted', 'canceled'].includes(event.error)) $('speech-status').textContent = tr('Read aloud could not start. You can still read the explanation here.'); };
  speechSynthesis.speak(utterance); $('speech-status').textContent = tr('Reading your explanation. Choose Stop reading to stop.');
});
$('stop-reading').addEventListener('click', () => { window.speechSynthesis?.cancel(); $('speech-status').textContent = tr('Reading stopped.'); });
