const GEMINI_API_KEY = "AIzaSyB_UF3j5dvO8Yn4Z1AKsqJSnWQhp9-RMG4";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

const translationCache = new Map();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "TRANSLATE_WORD") {
    const word = request.word.toLowerCase();

    if (translationCache.has(word)) {
      sendResponse({ success: true, data: translationCache.get(word) });
      return;
    }

    translateWord(request.word)
      .then(data => {
        translationCache.set(word, data);
        sendResponse({ success: true, data });
      })
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function translateWord(word) {
  const prompt = `
    Analyze the English word: "${word}".
    1. Translate it to Kannada.
    2. Provide a character-by-character breakdown of the Kannada translation.
    3. For each character, provide its pronunciation/transliteration and a brief description (vowel, consonant, matra/sign).

    Return the response ONLY as a JSON object with this structure:
    {
      "word": "English word",
      "translation": "Kannada word",
      "transliteration": "how it sounds in English chars",
      "breakdown": [
        { "char": "ಕ", "sound": "ka", "type": "consonant" },
        ...
      ]
    }
  `;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { response_mime_type: "application/json" }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `API Error ${response.status}`);
  }

  const result = await response.json();
  const content = result.candidates[0].content.parts[0].text;
  return JSON.parse(content);
}
