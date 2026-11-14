// Gnani Prisma Speech-to-Text (ASR) Adapter
// Connects to enterprise API at api.vachana.ai with X-API-Key-ID
import axios from 'axios';
import { ENV } from '../../config/env.js';

export class GnaniPrismaService {
  static API_URL = 'https://api.vachana.ai/stt/v3';

  static detectAudioFormat(buffer) {
    if (!buffer || buffer.length < 4) {
      return { format: 'unknown', mimeType: 'application/octet-stream', ext: 'bin' };
    }
    // WAV: 'RIFF' at 0, 'WAVE' at 8
    if (
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.length >= 12 &&
      buffer.toString('ascii', 8, 12) === 'WAVE'
    ) {
      return { format: 'wav', mimeType: 'audio/wav', ext: 'wav' };
    }
    // Ogg: 'OggS'
    if (buffer.toString('ascii', 0, 4) === 'OggS') {
      return { format: 'ogg', mimeType: 'audio/ogg', ext: 'ogg' };
    }
    // FLAC: 'fLaC'
    if (buffer.toString('ascii', 0, 4) === 'fLaC') {
      return { format: 'flac', mimeType: 'audio/flac', ext: 'flac' };
    }
    // MP3: 'ID3' or MPEG frame sync
    if (buffer.toString('ascii', 0, 3) === 'ID3' || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0)) {
      return { format: 'mp3', mimeType: 'audio/mp3', ext: 'mp3' };
    }
    // WebM / EBML: 0x1A 0x45 0xDF 0xA3
    if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
      return { format: 'webm', mimeType: 'audio/webm', ext: 'webm' };
    }
    return { format: 'unknown', mimeType: 'application/octet-stream', ext: 'bin' };
  }

  /**
   * Transcribe audio using Gnani Prisma
   * @param {Buffer} audioBuffer - Audio bytes (wav/ogg/mp3/flac)
   * @param {string} languageCode - 'indic-auto', 'hi-IN', 'mr-IN', 'en-IN', 'kn-IN'
   */
  static async transcribeAudio(audioBuffer, languageCode = 'indic-auto') {
    const apiKey = ENV.GNANI_API_KEY;

    if (!apiKey) {
      console.warn('[Gnani Prisma] No GNANI_API_KEY configured in .env');
      return {
        success: false,
        source: 'unconfigured',
        error: 'GNANI_API_KEY is not configured',
      };
    }

    if (!audioBuffer || !Buffer.isBuffer(audioBuffer) || audioBuffer.length < 12) {
      console.warn('[Gnani Prisma] Invalid or truncated audio buffer received');
      return {
        success: false,
        source: 'invalid_audio_buffer',
        error: 'Audio buffer is empty or too short (< 12 bytes).',
      };
    }

    const audioInfo = this.detectAudioFormat(audioBuffer);

    // If client sent WebM/Opus, Gnani vachana STT strictly rejects it (HTTP 400 UNSUPPORTED_AUDIO_FORMAT)
    if (audioInfo.format === 'webm') {
      return {
        success: false,
        source: 'gnani_prisma_unsupported_format',
        detectedFormat: 'webm',
        detectedMimeType: 'audio/webm',
        error: 'Gnani Prisma STT requires wav, mp3, ogg, or flac. Browser WebM format is not accepted directly by the API. Use PCM WAV recording in the browser.',
      };
    }

    if (audioInfo.format === 'unknown') {
      const headerHex = audioBuffer.slice(0, 4).toString('hex');
      const headerAscii = audioBuffer.slice(0, 4).toString('ascii').replace(/[^\x20-\x7E]/g, '.');
      console.warn(`[Gnani Prisma] Unrecognized audio format header: 0x${headerHex} ("${headerAscii}"), size: ${audioBuffer.length} bytes`);
      return {
        success: false,
        source: 'unsupported_audio_format',
        error: `Unrecognized audio stream (magic: 0x${headerHex}). Gnani Prisma STT requires standard WAV, MP3, OGG, or FLAC.`,
      };
    }

    try {
      console.info(`[Gnani Prisma] Dispatching STT request: ${audioInfo.format.toUpperCase()} (${audioBuffer.length} bytes, lang: ${languageCode})`);

      // Build form-data payload for Gnani Prisma STT
      const FormData = (await import('form-data')).default;
      const form = new FormData();
      form.append('audio_file', audioBuffer, {
        filename: `voice_input.${audioInfo.ext}`,
        contentType: audioInfo.mimeType,
      });
      form.append('model', 'prisma-v3.0');
      form.append('language_code', languageCode);

      const response = await axios.post(this.API_URL, form, {
        headers: {
          ...form.getHeaders(),
          'X-API-Key-ID': apiKey,
        },
        timeout: 15000,
      });

      const transcript =
        response.data?.transcript ||
        response.data?.text ||
        response.data?.results?.[0]?.transcript ||
        '';

      return {
        success: true,
        source: 'gnani_prisma_api',
        transcript,
        detectedLanguage: response.data?.detected_language || languageCode,
        detectedFormat: audioInfo.format,
        raw: response.data,
      };
    } catch (error) {
      const statusCode = error.response?.status;
      let errorDetail = error.message;

      if (error.response?.data) {
        try {
          const raw = Buffer.isBuffer(error.response.data)
            ? error.response.data.toString('utf-8')
            : error.response.data;
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
          errorDetail = parsed.detail || parsed.message || parsed;
        } catch {
          errorDetail = error.response.data.toString?.() || error.message;
        }
      }

      console.warn(
        `[Gnani Prisma] API HTTP ${statusCode}:`,
        typeof errorDetail === 'object' ? JSON.stringify(errorDetail) : errorDetail
      );

      // Return clean failure payload with upstream detail
      return {
        success: false,
        source: 'gnani_prisma_api_error',
        statusCode,
        error: errorDetail,
      };
    }
  }
}

