import test from 'node:test';
import assert from 'node:assert/strict';
import { tr, getLocale } from '../public/i18n.js';

test('Hindi is the first-visit locale; formatted multiline interface copy still translates', () => {
  assert.equal(getLocale(), 'hi');
  assert.equal(tr('What would you like help with?'), 'आज किस काम में मदद चाहिए?');
  assert.match(tr('Your message is sent to Google Gemini to prepare an\n  explanation. Leave out passwords, payment details, and private\n information.'), /संदेश समझाने/);
  assert.match(tr('Paste an appointment notice, a bill, or a message you’re\n unsure about.'), /अपॉइंटमेंट/);
});
