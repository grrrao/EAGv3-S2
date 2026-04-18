Video: https://youtu.be/yreCoDrVq8s

# ಕ Kannada Character Breakdown

A Chrome browser extension that translates any English word to Kannada and provides a **character-by-character breakdown** — on demand, right on the page.

---

## ✨ Features

- **Click-to-Translate** — Select any single word, click the floating **ಕ** icon that appears, and get an instant Kannada translation
- **Character Breakdown** — Each Kannada letter is broken down with its sound, transliteration, and type (consonant / vowel / matra)
- **Session Caching** — Translating the same word twice makes zero API calls; results are served from memory
- **Selection Debouncing** — Rapid or accidental selections are ignored
- **Persistent Popup** — Popup stays visible until you close it with the ✕ button or click elsewhere on the page
- **Viewport-aware** — The popup repositions itself if it overflows the screen edge
- **Premium UI** — Glassmorphic design with smooth animations and micro-interactions

---

## 📁 File Structure

```
kannada-extension/
├── manifest.json     # Chrome Extension Manifest V3 config
├── background.js     # Service worker – Gemini API calls + session cache
├── content.js        # Injected into every page – selection detection & popup UI
├── styles.css        # Popup styles (injected alongside content.js)
└── icon.png          # Extension icon
```

---

## 🚀 Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right)
4. Click **Load unpacked**
5. Select the `kannada-extension/` folder

---

## ⚙️ Configuration

The Gemini API key is stored in the `.env` file at the root of the project and is hardcoded into `background.js` at setup time.

**`.env` format:**
```
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note:** If you change the API key in `.env`, update the corresponding value in `background.js` line 1 and reload the extension.

**Model used:** `gemini-2.5-flash-lite` (confirmed available for the free tier)

---

## 🧠 How It Works

```
User selects a word
       │
       ▼ (200ms debounce)
Floating ಕ button appears above selection
       │
       ▼ (user clicks ✕ button)
Loading popup shown
       │
       ▼
background.js checks session cache
  ├─ Cache HIT  → instant response, no API call
  └─ Cache MISS → Gemini API called with structured JSON prompt
                        │
                        ▼
                  Response parsed & rendered
                  { translation, transliteration, breakdown[] }
```

---

## 🎨 UI

| State | Appearance |
|---|---|
| Word selected | Small purple **ಕ** circle floats above the word |
| Loading | Glassmorphic popup with spinner |
| Translated | Kannada word + transliteration + character grid |
| Error | Red error message inside popup |

---

## 🛑 Limitations

- **Single-word only** — Multi-word selections are intentionally ignored
- **English input only** — The extension is designed for English → Kannada translation
- **API quota** — Subject to Gemini API rate limits; see [Google AI rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- **Session cache only** — Cache is cleared when the browser service worker restarts

---

## 📦 Dependencies

- [Google Gemini API](https://ai.google.dev/) — Translation and character analysis
- No npm packages, no build step — pure vanilla JS + CSS

---

## 📄 License

MIT
