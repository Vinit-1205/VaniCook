# Gnani AI Integration Architecture: CookConnect (VaniCook)

**Platform Submission:** Gnani AI Multilingual Hackathon 2026  
**Integrated Products:** Gnani Prisma Speech-to-Text (STT) & Gnani Timbre Text-to-Speech (TTS)  
**Enterprise API Gateway:** `https://api.vachana.ai`  
**Authentication Standard:** `X-API-Key-ID` Header Authentication

---

## 1. Overview of Voice AI Capabilities

CookConnect uses **Gnani AI** as its foundational voice interface layer. The application is designed to be accessible to domestic cooks, household staff, and regional residents who may struggle with English text interfaces.

Through **Vani AI**, users can speak in **Hindi, Marathi, Kannada, English, or Hinglish** to perform end-to-end tasks:
1. Discover verified cooks in their residential society.
2. Query forming neighbourhood cooking pools.
3. Calculate cost savings for sharing a cook with neighbours.
4. Form a new cooking pool with safe confirmation gates.
5. Check daily cooking schedules and pending household requests.

---

## 2. Gnani API Specifications & Endpoints

| Product / Service | Exact Endpoint URL | HTTP Method | Payload Format | Authentication | Models / Voices |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **Gnani Prisma STT** | `https://api.vachana.ai/stt/v3` | `POST` | `multipart/form-data` | Header: `X-API-Key-ID` | `model: prisma-v3.0` |
| **Gnani Timbre TTS** | `https://api.vachana.ai/api/v1/tts/inference` | `POST` | `application/json` | Header: `X-API-Key-ID` | `model: timbre-v2.5`<br>Voices: `Nalini` (Hindi), `Meera` (Marathi), `Arvind` (English) |

> *Note: All API keys and secrets are strictly retained inside server-side environment variables and are never exposed to the client.*

---

## 3. End-to-End Voice Interaction Architecture

The voice lifecycle is structured across five sequential stages:

```
[1. Client Audio Capture]
  Browser Mic (WavRecorder) ──► 16kHz 16-bit Mono PCM ──► Standard RIFF WAVE Blob ──► Base64 String
                                                                                           │
[2. Controller Ingestion]                                                                  │
  VoiceController.processVoiceCommand() ◄──────────────────────────────────────────────────┘
  ├── extractAudioBuffer() removes data URL scheme prefixes
  └── verifies minimum length & RIFF/WAVE magic bytes
                               │
[3. Gnani Prisma STT]          ▼
  POST https://api.vachana.ai/stt/v3 (Multipart FormData)
  ├── audio_file: voice_input.wav (audio/wav)
  ├── model: prisma-v3.0
  └── language_code: indic-auto / hi-IN / mr-IN / en-IN / kn-IN
                               │
                               ▼
  Returns: { transcript: "Sunita Devi ko lunch ke liye book karo", detected_language: "hi-IN" }
                               │
[4. CookConnect Orchestrator]  ▼
  VoiceOrchestratorService.extractIntentAndEntities()
  ├── Intent: CREATE_GROUP_REQUEST / FIND_COOKS / CALCULATE_PRICING
  ├── Entities: { cookName: "Sunita Devi", mealType: "LUNCH", households: 3 }
  ├── Enters State: CONFIRMATION_REQUIRED (Safety Gate)
  └── Persists VoiceSession record in PostgreSQL
                               │
[5. Gnani Timbre TTS]          ▼
  POST https://api.vachana.ai/api/v1/tts/inference (JSON)
  ├── text: "Aapke Prestige Falcon City mein Sunita Devi uplabdh hain..."
  ├── language: hi-IN (or mr-IN / en-IN)
  └── voice: Nalini (or Meera / Arvind)
                               │
                               ▼
  Returns: Binary Audio Buffer (24kHz WAV) ──► Base64 ──► Audio Element Autoplay in Client
```

---

## 4. Key Engineering Implementations

### A. Overcoming Browser WebM vs. Gnani Prisma Audio Rejection
**The Challenge:**
Modern web browsers (Chrome, Edge, Firefox) capture microphone streams via `MediaRecorder` in `audio/webm; codecs=opus`. However, the Gnani Vachana STT engine strictly requires uncompressed linear PCM formats (`wav`, `mp3`, `ogg`, `flac`) and rejects WebM with `HTTP 400 UNSUPPORTED_AUDIO_FORMAT`.

**The CookConnect Solution:**
Rather than relying on lossy server-side transcoding tools (which introduce latency), CookConnect implements a **browser-native PCM WAV recorder** in [`src/frontend/utils/wavRecorder.js`](file:///d:/codesVinit/Cookconnect/src/frontend/utils/wavRecorder.js):
- Uses `AudioContext` and `ScriptProcessorNode` to capture raw audio chunks.
- Dynamically resamples hardware input rates (44.1kHz or 48kHz) down to **16,000 Hz** using linear interpolation.
- Quantizes 32-bit float samples into **16-bit signed integers**.
- Constructs a compliant **44-byte standard RIFF WAVE header** with `fmt ` chunk and PCM format code `1`.
- Sends authentic 16kHz mono WAV bytes directly to Gnani Prisma STT.

### B. Base64 Data URL Prefix Sanitization
To prevent audio header corruption:
[`src/backend/controllers/voice.controller.js`](file:///d:/codesVinit/Cookconnect/src/backend/controllers/voice.controller.js) implements:
```javascript
function extractAudioBuffer(input) {
  if (!input || typeof input !== 'string') return null;
  const commaIndex = input.indexOf(',');
  const rawBase64 = commaIndex !== -1 ? input.slice(commaIndex + 1) : input;
  const sanitized = rawBase64.replace(/\s+/g, '');
  if (!sanitized) return null;
  return Buffer.from(sanitized, 'base64');
}
```
This guarantees that regardless of whether the browser submits `data:audio/wav;base64,`, `data:audio/x-wav;base64,`, or raw Base64, byte offset `0` begins with ASCII `"RIFF"` (`0x52 0x49 0x46 0x46`).

### C. Voice Confirmation Safety Gate
Write actions (such as booking a cook or forming a binding group request) are never executed immediately from raw speech recognition:
1. When `VoiceOrchestratorService` extracts a mutation intent (`CREATE_GROUP_REQUEST`), it assigns `state: 'CONFIRMATION_REQUIRED'`.
2. It persists the staged payload into the `VoiceSession` table.
3. The frontend `VoiceAssistantModal` renders an amber **Safety Confirmation Gate**:
   - Shows the exact action parameters.
   - Provides an immediate "Confirm Action" button.
4. Only upon explicit user confirmation is `VoiceOrchestratorService.executeConfirmedVoiceAction()` invoked to commit the record to PostgreSQL.

---

## 5. Technical Division of Responsibilities

| Responsibility | Handled By Gnani AI | Handled By CookConnect Logic |
| :--- | :---: | :---: |
| **Acoustic Audio Ingestion & Feature Extraction** | ✅ **Yes** | ❌ No |
| **Multilingual Indian Language Identification** | ✅ **Yes** | ❌ No |
| **Speech-to-Text Transcription (Indic ASR)** | ✅ **Yes** | ❌ No |
| **16kHz PCM WAV Audio Conditioning** | ❌ No | ✅ **Yes** (`wavRecorder.js`) |
| **Domain Intent & Entity Extraction (Cuisines, Cooks, Flats)** | ❌ No | ✅ **Yes** (`voice-orchestrator.service.js`) |
| **Society Geolocation & Database Lookups** | ❌ No | ✅ **Yes** (Prisma ORM) |
| **Stateful Conversation Session Tracking** | ❌ No | ✅ **Yes** (`VoiceSession` model) |
| **Confirmation Safety Gate Enforcement** | ❌ No | ✅ **Yes** (Voice state machine) |
| **Text-to-Speech Voice Waveform Synthesis** | ✅ **Yes** | ❌ No |
| **Client UI Playback & Soundwave Visuals** | ❌ No | ✅ **Yes** (`VoiceAssistantModal.jsx`) |

---

## 6. Supported Indic Languages in Production

1. **हिन्दी (Hindi - `hi-IN`):** Supported with natural speech synthesis using the `Nalini` voice model.
2. **मराठी (Marathi - `mr-IN`):** Tailored for Western Indian societies (Mumbai/Pune/Thane) using the `Meera` voice model.
3. **English (India - `en-IN`):** Standard Indian-accented English using the `Arvind` voice model.
4. **ಕನ್ನಡ (Kannada - `kn-IN`):** Configured for Bengaluru apartment clusters.
5. **Auto / Hinglish (`indic-auto`):** Automatically detects mixed Hindi/English queries (e.g., *"Sunita Devi ko lunch ke liye book karo"*).

