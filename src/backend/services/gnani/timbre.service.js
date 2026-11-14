// Gnani Timbre Text-to-Speech (TTS) Adapter
// Connects to api.vachana.ai with X-API-Key-ID for multilingual Indian speech synthesis
import axios from 'axios';
import { ENV } from '../../config/env.js';

export class GnaniTimbreService {
  static API_URL = 'https://api.vachana.ai/api/v1/tts/inference';

  /**
   * Synthesize natural speech audio from text using Gnani Timbre
   * @param {string} text - Text to synthesize
   * @param {string} language - 'hi-IN', 'mr-IN', 'en-IN', 'kn-IN', etc.
   * @param {string} voice - 'Nalini', 'Meera', 'Arvind'
   */
  static async synthesizeSpeech(text, language = 'hi-IN', voice = 'Nalini') {
    const apiKey = ENV.GNANI_API_KEY;

    if (!apiKey) {
      console.warn('[Gnani Timbre] No GNANI_API_KEY configured');
      return {
        success: false,
        source: 'unconfigured',
        error: 'GNANI_API_KEY is not configured',
      };
    }

    try {
      const payload = {
        text,
        voice,
        model: 'timbre-v2.5',
        language,
        speed: 1.0,
        audio_config: {
          sample_rate: 24000,
          encoding: 'linear_pcm',
          container: 'wav',
        },
      };

      const response = await axios.post(this.API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key-ID': apiKey,
        },
        responseType: 'arraybuffer',
        timeout: 15000,
      });

      // Gnani Timbre returns raw audio/wav binary data
      let audioBase64 = null;
      if (response.data) {
        if (Buffer.isBuffer(response.data)) {
          audioBase64 = response.data.toString('base64');
        } else if (response.data instanceof ArrayBuffer) {
          audioBase64 = Buffer.from(response.data).toString('base64');
        } else if (typeof response.data === 'string') {
          audioBase64 = Buffer.from(response.data).toString('base64');
        }
      }

      return {
        success: true,
        source: 'gnani_timbre_api',
        audioBase64,
        contentType: response.headers?.['content-type'] || 'audio/wav',
        audioBytes: response.data ? (response.data.byteLength || response.data.length) : 0,
        language,
        voice,
      };
    } catch (error) {
      const statusCode = error.response?.status;
      let errorDetail = error.message;

      if (error.response?.data) {
        try {
          const rawText = Buffer.isBuffer(error.response.data)
            ? error.response.data.toString('utf-8')
            : (error.response.data instanceof ArrayBuffer
                ? Buffer.from(error.response.data).toString('utf-8')
                : String(error.response.data));
          const parsed = typeof rawText === 'string' ? JSON.parse(rawText) : rawText;
          errorDetail = parsed.detail || parsed.message || parsed.error || parsed;
        } catch {
          errorDetail = error.response.data.toString?.() || error.message;
        }
      }

      console.warn(
        `[Gnani Timbre] API HTTP ${statusCode}:`,
        typeof errorDetail === 'object' ? JSON.stringify(errorDetail) : errorDetail
      );

      const isScopeError =
        statusCode === 403 &&
        (String(errorDetail).includes('SCOPE_NOT_ALLOWED') ||
          String(errorDetail).includes('Service \'TTS\' not in allowed scopes') ||
          (typeof errorDetail === 'object' && errorDetail?.type === 'SCOPE_NOT_ALLOWED'));

      return {
        success: false,
        source: isScopeError ? 'gnani_scope_error' : 'gnani_timbre_api_error',
        statusCode,
        error: isScopeError
          ? "API key lacks 'TTS' service scope. In your Gnani/Vachana developer console (api.vachana.ai), edit your API key permissions and enable the 'TTS' service scope."
          : (typeof errorDetail === 'object' ? JSON.stringify(errorDetail) : errorDetail),
        scopeRequired: isScopeError ? 'TTS' : undefined,
      };
    }
  }
}

