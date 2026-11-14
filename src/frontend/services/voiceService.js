import api from './api.js';

export const voiceService = {
  /**
   * Helper to convert an audio Blob (from MediaRecorder) to a Base64 string
   */
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // reader.result will be "data:audio/webm;base64,...."
        // resolve full base64 data string
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  /**
   * Send voice command (with base64 audio or text) to voice orchestrator
   */
  async sendVoiceCommand({ audioBase64, textQuery, language = 'indic-auto', pendingActionId, confirmAction }) {
    const res = await api.post('/voice/command', {
      audioBase64,
      textQuery,
      language,
      pendingActionId,
      confirmAction,
    });
    return res.data;
  },

  /**
   * Transcribe audio using Gnani Prisma STT
   */
  async transcribeAudio(audioBase64, languageCode = 'indic-auto') {
    const res = await api.post('/voice/transcribe', {
      audioBase64,
      languageCode,
    });
    return res.data;
  },

  /**
   * Synthesize speech using Gnani Timbre TTS
   */
  async synthesizeSpeech(text, language = 'hi-IN', voice = 'female_01') {
    const res = await api.post('/voice/synthesize', {
      text,
      language,
      voice,
    });
    return res.data;
  },
};

export default voiceService;

