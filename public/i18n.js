let locale = 'hi';
const translations = {
  'Daywell | Your day, one step at a time':'Daywell | हर दिन के काम, आसान कदम',
  'Skip to main content':'मुख्य हिस्से पर जाएँ','Daywell home':'Daywell का मुख्य पेज','Language':'भाषा',
  'Understand a message':'संदेश समझें','My day':'आज के काम','Text size: Larger':'अक्षर: बड़े करें','Text size: Standard':'अक्षर: सामान्य करें',
  'What would you like help with?':'आज किस काम में मदद चाहिए?','Understand a message and decide what to do next.':'संदेश समझें और अगला कदम खुद चुनें।',
  'Your message or notice':'यहाँ संदेश लिखें या चिपकाएँ','Try an example':'उदाहरण देखें',
  'Paste an appointment notice, a bill, or a message you’re unsure about.':'अपॉइंटमेंट, बिल या कोई ऐसा संदेश लिखें जिसे समझने में मदद चाहिए।',
  'Paste or type your message here':'अपना संदेश यहाँ लिखें या चिपकाएँ','Example: an appointment notice':'उदाहरण: अपॉइंटमेंट का संदेश',
  'Your message is sent to Google Gemini to prepare an explanation. Leave out passwords, payment details, and private information.':'संदेश समझाने के लिए इसे Google Gemini को भेजा जाता है। पासवर्ड, भुगतान की जानकारी और निजी बातें न लिखें।',
  'Explain this message':'संदेश समझाएँ','Try again':'फिर कोशिश करें',
  'Your pasted message is not saved by Daywell. You choose which steps to keep.':'Daywell आपका लिखा संदेश सेव नहीं करता। कौन से काम रखने हैं, यह आप चुनते हैं।',
  'Explanation':'संदेश का मतलब','Here’s what the message means':'इस संदेश का मतलब है',
  'Listen':'सुनें','Stop reading':'रोकें','Things to check':'इन बातों की जाँच करें','A detail to clarify':'यह बात साफ करनी है',
  'You can update the message above with the missing details and ask again. Please don’t include sensitive information.':'ऊपर संदेश में ज़रूरी जानकारी जोड़कर फिर पूछ सकते हैं। निजी जानकारी न लिखें।',
  'Before you start':'शुरू करने से पहले','Choose your next steps':'अगले कदम चुनें',
  'Nothing is added until you choose it. Dates are always yours to set.':'आपके चुने बिना कोई काम नहीं जुड़ता। तारीख भी आप ही चुनते हैं।',
  'Due date for selected steps':'चुने हुए कामों की तारीख','(optional)':'(चाहें तो)',
  'Add to my day':'आज के कामों में जोड़ें',
  'AI suggestions are advisory. A caution check cannot guarantee a message is safe. Daywell has not contacted anyone or completed any action.':'AI की बातें सुझाव हैं। जाँच के बाद भी संदेश सुरक्षित होने की गारंटी नहीं है। Daywell ने किसी से संपर्क या कोई काम पूरा नहीं किया है।',
  'How this was prepared':'यह जवाब कैसे तैयार हुआ','Two separate Google Gemini checks must both succeed before a plan is shown.':'सुझाव दिखाने से पहले Google Gemini की दोनों अलग जाँच पूरी होनी चाहिए।',
  'Your saved tasks':'आपके सेव किए काम',
  'Your tasks and text preference stay in this browser on this device. Dates are checked while Daywell is open. No background reminders or notifications are sent.':'आपके काम और अक्षरों का आकार इसी डिवाइस के इस ब्राउज़र में रहते हैं। Daywell खुला होने पर तारीख दिखती है। ऐप बंद होने पर कोई रिमाइंडर या सूचना नहीं आती।',
  'Add a task':'काम जोड़ें','For example, call a friend':'जैसे, किसी दोस्त को फ़ोन करना','Due date (optional)':'तारीख (चाहें तो)',
  'Using a shared device? You can remove Daywell’s saved tasks and preferences.':'क्या यह डिवाइस और लोग भी इस्तेमाल करते हैं? आप अपने सेव किए काम और सेटिंग मिटा सकते हैं।',
  'Clear my saved data':'मेरी सेव की जानकारी मिटाएँ',
  'This will remove all Daywell tasks and reset your text preference in this browser. This cannot be undone.':'इस ब्राउज़र में Daywell के सभी काम और अक्षरों की सेटिंग मिट जाएँगी। इन्हें वापस नहीं लाया जा सकेगा।',
  'Yes, clear my data':'हाँ, मेरी जानकारी मिटाएँ','Keep my data':'जानकारी रहने दें',
  'Please enable JavaScript to understand messages and manage your day.':'संदेश समझने और काम जोड़ने के लिए JavaScript चालू करें।',
  'Check important details with someone you trust. Daywell can make mistakes and does not provide medical or financial advice.':'ज़रूरी बातें किसी भरोसेमंद व्यक्ति से पक्की कर लें। Daywell से गलती हो सकती है। यह इलाज या पैसों की सलाह नहीं देता।',
  'Saved data could not be loaded. Your current changes may only last until you close this page. You can clear saved data in My day.':'सेव की जानकारी खुल नहीं सकी। पेज बंद होने पर नए बदलाव खो सकते हैं। आज के काम में सेव की जानकारी मिटा सकते हैं।',
  'This browser could not save your changes. Keep this page open; changes may be lost when you reload.':'ब्राउज़र बदलाव सेव नहीं कर सका। पेज खुला रखें। दोबारा खोलने पर बदलाव खो सकते हैं।',
  'Please paste a message first, or try the appointment example.':'पहले संदेश लिखें या अपॉइंटमेंट का उदाहरण देखें।',
  'Please shorten your message to 4,000 characters or fewer.':'संदेश छोटा करें। इसमें ज़्यादा से ज़्यादा 4,000 अक्षर हो सकते हैं।',
  'Reading your message and checking for anything that needs care. This can take up to 45 seconds.':'आपका संदेश पढ़ रहे हैं और ध्यान देने वाली बातें जाँच रहे हैं। इसमें 45 सेकंड तक लग सकते हैं।',
  'Your explanation and caution check are ready. Choose any steps you want to keep.':'संदेश का मतलब और ध्यान देने वाली बातें तैयार हैं। जो काम रखना चाहते हैं, उन्हें चुनें।',
  'We could not finish. Please try again.':'अभी जवाब पूरा नहीं हो सका। फिर कोशिश करें।',
  'This took longer than expected. Your message is still here. Please try again.':'इसमें ज़्यादा समय लग गया। आपका संदेश यहीं है। फिर कोशिश करें।',
  'We could not connect. Check your internet connection and try again. Your message is still here.':'कनेक्शन नहीं हो सका। इंटरनेट जाँचकर फिर कोशिश करें। आपका संदेश यहीं है।',
  'We couldn’t read this message right now. Your text is still here. Please try again.':'अभी यह संदेश समझ नहीं पाए। आपका लिखा यहीं है। फिर कोशिश करें।',
  'We couldn’t read this message right now. Your text is still here. Please try again. Both the explanation and caution check must finish before we can show suggestions.':'अभी यह संदेश समझ नहीं पाए। आपका लिखा यहीं है। फिर कोशिश करें। सुझाव दिखाने से पहले संदेश समझने और सावधानी की दोनों जाँच पूरी होनी चाहिए।',
  'Daywell is busy. Please wait a minute and try again.':'Daywell अभी व्यस्त है। एक मिनट रुककर फिर कोशिश करें।',
  'This took too long. Your message is still here. Please try again.':'इसमें ज़्यादा समय लग गया। आपका संदेश यहीं है। फिर कोशिश करें।',
  'Please paste a message first.':'पहले कोई संदेश लिखें।','The message could not be read. Please try again.':'संदेश पढ़ नहीं पाए। फिर कोशिश करें।',
  'Pause and verify. The caution review found significant concerns. Steps that act on the request have been withheld; the choices below are verification steps instead.':'रुककर जाँच करें। संदेश में कुछ गंभीर चिंताएँ मिली हैं। अनुरोध पर अमल करने वाले कदम रोक दिए गए हैं। नीचे केवल जाँच करने के कदम हैं।',
  'Pause and verify. The caution review found significant concerns. Steps that act on the request have been withheld; the choices below are verification steps.':'रुककर जाँच करें। संदेश में कुछ गंभीर चिंताएँ मिली हैं। अनुरोध पर अमल करने वाले कदम रोक दिए गए हैं। नीचे केवल जाँच करने के कदम हैं।',
  'Choose at least one step using the checkboxes.':'कम से कम एक काम के सामने वाला बॉक्स चुनें।','Please choose a valid date.':'कृपया सही तारीख चुनें।',
  'Your list can hold 100 tasks. Delete some tasks before adding more.':'सूची में 100 काम रख सकते हैं। नए काम जोड़ने से पहले कुछ काम हटाएँ।',
  'Your list can hold 100 tasks. Delete a task to make room.':'सूची में 100 काम रख सकते हैं। नया काम जोड़ने के लिए कोई काम हटाएँ।',
  'Enter a task and a valid optional date.':'काम लिखें। तारीख देना चाहें तो सही तारीख चुनें।','Task added to My day.':'काम आज के कामों में जुड़ गया।',
  'Nothing planned yet. Add a task when you’re ready.':'अभी कोई काम नहीं है। जब चाहें, काम जोड़ें।','Steps you choose from an explanation will appear here, too.':'संदेश से चुने हुए काम भी यहीं दिखेंगे।',
  'Task marked as done.':'काम पूरा हो गया है।','Task marked incomplete.':'काम फिर से बाकी कामों में आ गया।','Due date updated.':'तारीख बदल गई।','Task deleted.':'काम हटा दिया गया।',
  'Completed':'पूरा हुआ','No due date':'तारीख नहीं चुनी','Overdue':'तारीख निकल गई','Due today':'आज करना है','Upcoming':'आने वाला काम','Delete':'हटाएँ',
  'Before you start · AI preparation suggestions':'शुरू करने से पहले · AI के तैयारी के सुझाव',
  'Your saved tasks and display preference have been cleared.':'आपके सेव किए काम और अक्षरों की सेटिंग मिट गई है।',
  'This browser did not allow Daywell to clear saved data. Use your browser settings to remove site data.':'ब्राउज़र ने जानकारी मिटाने की अनुमति नहीं दी। ब्राउज़र की सेटिंग से इस साइट की जानकारी मिटाएँ।',
  'Speak to type':'बोलकर लिखें','Stop dictation':'लिखना रोकें',
  'Your browser may use an online service to turn speech into text. Review the words before sending.':'आवाज़ को शब्दों में बदलने के लिए ब्राउज़र ऑनलाइन सेवा इस्तेमाल कर सकता है। भेजने से पहले शब्द जाँच लें।',
  'Voice typing is not available in this browser. You can type or paste your message.':'इस ब्राउज़र में बोलकर लिखना उपलब्ध नहीं है। आप संदेश लिख या चिपका सकते हैं।',
  'Listening. Speak now, then choose Stop dictation.':'सुन रहे हैं। बोलें, फिर लिखना रोकें चुनें।',
  'Voice typing stopped. Review and edit your message before sending.':'बोलकर लिखना रुक गया। भेजने से पहले संदेश पढ़ें और सुधारें।',
  'Microphone access was denied. You can allow it in browser settings, or type your message.':'माइक्रोफ़ोन की अनुमति नहीं मिली। ब्राउज़र की सेटिंग में अनुमति दे सकते हैं या संदेश लिख सकते हैं।',
  'No speech was heard. Try again, or type your message.':'आवाज़ सुनाई नहीं दी। फिर कोशिश करें या संदेश लिखें।',
  'Voice typing could not connect. Check your connection, or type your message.':'बोलकर लिखने की सेवा से कनेक्शन नहीं हुआ। इंटरनेट जाँचें या संदेश लिखें।',
  'Microphone is unavailable. You can type or paste your message.':'माइक्रोफ़ोन उपलब्ध नहीं है। आप संदेश लिख या चिपका सकते हैं।',
  'Voice typing could not start. You can still type your message.':'बोलकर लिखना शुरू नहीं हुआ। आप संदेश लिख सकते हैं।',
  'The message is full. Review or shorten it before adding more.':'संदेश की सीमा पूरी हो गई। और जोड़ने से पहले इसे छोटा करें।',
  'Read aloud is not available in this browser.':'इस ब्राउज़र में पढ़कर सुनाना उपलब्ध नहीं है।',
  'No Hindi voice is available in this browser. You can read the text on screen.':'इस ब्राउज़र में हिन्दी आवाज़ उपलब्ध नहीं है। आप स्क्रीन पर जवाब पढ़ सकते हैं।',
  'No English voice is available in this browser. You can read the text on screen.':'इस ब्राउज़र में अंग्रेज़ी आवाज़ उपलब्ध नहीं है। आप स्क्रीन पर जवाब पढ़ सकते हैं।',
  'Reading finished.':'पढ़ना पूरा हुआ।','Reading stopped.':'पढ़ना रुक गया।',
  'Read aloud could not start. You can still read the explanation here.':'पढ़कर सुनाना शुरू नहीं हुआ। आप जवाब यहाँ पढ़ सकते हैं।',
  'Reading your explanation. Choose Stop reading to stop.':'जवाब पढ़ रहे हैं। बंद करने के लिए रोकें चुनें।',
  'Language changed. Explain the message again for a new answer. Saved tasks keep their original text.':'भाषा बदल गई। नई भाषा में जवाब के लिए संदेश फिर समझाएँ। सेव किए कामों का लिखा नहीं बदलेगा।',
};
const templates = [
  [/^(\d+) step added to My day\. Saved in this browser\.$/, '$1 काम जुड़ गया। इसी ब्राउज़र में सेव है।'],
  [/^(\d+) steps added to My day\. Saved in this browser\.$/, '$1 काम जुड़ गए। इसी ब्राउज़र में सेव हैं।'],
  [/^(\d+) steps? added to My day\. Could not save to this browser\.$/, '$1 काम जुड़ गए। ब्राउज़र में सेव नहीं हो सके।'],
  [/^(\d+) still to do$/, '$1 काम बाकी हैं'], [/^(\d+) tasks$/, '$1 काम'],
  [/^(\d+) overdue · (\d+) today · (\d+) upcoming$/, '$1 की तारीख निकली · $2 आज · $3 आने वाले'],
  [/^Mark as done: (.*)$/, 'पूरा हुआ चुनें: $1'], [/^Mark incomplete: (.*)$/, 'अधूरा चुनें: $1'],
  [/^Delete task: (.*)$/, 'काम हटाएँ: $1'], [/^Due date for (.*)$/, 'इस काम की तारीख: $1'],
];
export function tr(text) {
  if (typeof text !== 'string') return text;
  if (locale !== 'hi') return Object.entries(translations).find(([, value]) => value === text)?.[0] || text;
  if (translations[text]) return translations[text];
  for (const [pattern, replacement] of templates) if (pattern.test(text)) return text.replace(pattern,replacement);
  return text;
}
export function getLocale() { return locale; }
const originals = new WeakMap(), attributes = new WeakMap();
const generated = '#summary,#cautions,#questions,#preparation,#suggestions span,.task-name,.task-prep li,#message';
function translateDom() {
  document.documentElement.lang = locale;
  document.title = tr('Daywell | Your day, one step at a time');
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (!node.parentElement || node.parentElement.closest(generated)) continue;
    const current = node.nodeValue, record = originals.get(node);
    const original = record && current === record.translated ? record.original : current;
    const translated = original.replace(original.trim(), tr(original.trim()));
    originals.set(node, { original, translated });
    if (current !== translated) node.nodeValue = translated;
  }
  for (const el of document.querySelectorAll('[placeholder],[aria-label]')) {
    const record = attributes.get(el) || {};
    for (const key of ['placeholder', 'aria-label']) {
      if (!el.hasAttribute(key)) continue;
      const value = el.getAttribute(key), prior = record[key];
      const original = prior && value === prior.translated ? prior.original : value;
      const translated = tr(original); record[key] = { original, translated };
      if (translated !== value) el.setAttribute(key, translated);
    }
    attributes.set(el, record);
  }
}
let observer;
export function setLocale(value) {
  locale = value === 'en' ? 'en' : 'hi';
  observer?.disconnect(); translateDom();
  document.getElementById('language-hi').setAttribute('aria-pressed', String(locale === 'hi'));
  document.getElementById('language-en').setAttribute('aria-pressed', String(locale === 'en'));
  observer ||= new MutationObserver(() => { observer.disconnect(); translateDom(); observe(); });
  observe();
}
function observe() { observer.observe(document.body, {subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder']}); }
