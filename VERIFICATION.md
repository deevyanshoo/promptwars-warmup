# Verification evidence, 19 September 2026

## Automated tests

`npm test`: **16 passed, 0 failed** after locale support. Tests cover concurrent branch starts, join ordering, dependency-only outputs, at-most-once execution, failure blocking, duplicate IDs, missing dependencies, cycles, deadlines, request isolation, invalid input without AI calls, malformed AI outputs, risk replacement, dates, HTTP validation, throttling, locale propagation and source preservation.

Palette contrast checks: main text on white 13.13:1; secondary text 7.33:1; primary button 8.53:1; placeholder 5.86:1; input border 4.38:1; focus ring on canvas 6.22:1; warning text 7.81:1. Hover and disabled states also passed their checks.

## Real Gemini and public app

- Local real Gemini explanation and selected-task persistence passed before 10:42 IST.
- Hindi-first localhost:8082 loaded with “आज किस काम में मदद चाहिए?” and “संदेश समझाएँ”. An English appointment notice returned Hindi summary, steps, cautions and preparation. Both AI branches and all five DAG nodes completed, around 5.2 seconds in one recorded run.
- Public service deployed by 10:53 IST. Anonymous curl homepage and health returned HTTP 200 without an identity token. Browser context had no cookies for the app.
- First public model request returned HTTP 502 after one required branch failed; downstream nodes were blocked, text stayed visible, and no task was added. Manual retry returned HTTP 200 with all five nodes completed in 3.41 seconds. The app makes no canned-success substitution or automatic retry. Transient upstream failure remains possible.
- On the public app, selected Hindi steps became dated tasks. Completion persisted after reload. A manual overdue task appeared in the count and next-action cue. Switching to English persisted and left Hindi task text intact. No raw appointment message was found in localStorage.

## Browser and accessibility checks

- Inspected desktop at 1366px, mobile at 390px, and larger text at 24px. Mobile page width equaled viewport width. A 683px layout reflow check (equivalent CSS width of a 1366px viewport at 200% zoom) had no horizontal overflow. This was a reflow check, not a physical browser zoom measurement.
- Keyboard Tab from the textarea reached the microphone control with a visible 3px focus outline.
- Inspected empty, loading, successful AI and failure states. A simulated HTTP 502 confirmed input preservation, duplicate-submit disabling, and a working retry control. Real upstream failure also exercised the same UI.
- Hindi visible-interface audit found no untranslated English strings outside brand/provider names, the English selector, and preserved user/generated content. Generated example copy had no prohibited dash punctuation or generic marketing phrases.
- Final compact layout places the main Hindi action within a 1366x768 viewport (button bottom approximately 748px in the measured standard-text state).

## Voice evidence and boundaries

- User explicitly reported “microphone check succeeded” after being asked to test real Hindi dictation at localhost:8082. This is user-confirmed live input evidence.
- The automated demo browser exposed `SpeechRecognition` and the Hindi `hi-IN` voice “Lekha”. Clicking Listen entered `speechSynthesis.speaking === true`; Stop returned it to false. This verifies browser playback state, not an independent auditory assessment of pronunciation.
- Isolated browser API doubles verified `hi-IN` selection, appending a Hindi transcript without overwriting existing text, editable review before submission, denied microphone messaging, and unavailable-Hindi-voice fallback. Typing remained usable. These were explicitly simulated edge cases, not live microphone or AI success claims.
- Speech services are browser features, separate from Gemini. Support and online-service availability can vary between browsers and devices.

## Repository and deployment hygiene

Tracked source was approximately 120 KB before final documentation, well below 10 MB. Credential-pattern scan found no private keys or common Google token/key patterns. Git and deployment ignores exclude credentials, dependencies, local environments, screenshots and recordings. Upload allowlist contains only runtime code, public assets, manifests and Dockerfile. Remote branch check showed only `main`.

Cloud Run configuration was read back: runtime identity `promptwars-runtime`, builder `promptwars-build`, 1 CPU, 512 MiB, request-based CPU, maximum one instance, minimum zero. Only the warmup service was made public. No event submission or recording was performed.
