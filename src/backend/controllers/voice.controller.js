import { VoiceOrchestratorService } from '../services/gnani/voice-orchestrator.service.js';
import { GnaniPrismaService } from '../services/gnani/prisma.service.js';
import { GnaniTimbreService } from '../services/gnani/timbre.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Safely extracts audio Buffer from base64 string or data URI
 * Strips any data URI scheme (e.g. data:audio/wav;base64, data:audio/x-wav;base64, etc.)
 */
function extractAudioBuffer(input) {
  if (!input || typeof input !== 'string') return null;
  const commaIndex = input.indexOf(',');
  const rawBase64 = commaIndex !== -1 ? input.slice(commaIndex + 1) : input;
  const sanitized = rawBase64.replace(/\s+/g, '');
  if (!sanitized) return null;
  return Buffer.from(sanitized, 'base64');
}

export class VoiceController {
  /**
   * Handle complete voice command (audio buffer from Base64 or text fallback)
   */
  static async processVoiceCommand(req, res, next) {
    try {
      let audioBuffer = null;
      if (req.body?.audioBase64) {
        audioBuffer = extractAudioBuffer(req.body.audioBase64);
      } else if (req.file?.buffer) {
        audioBuffer = req.file.buffer;
      }

      const { textQuery, language, pendingActionId, confirmAction } = req.body;

      const result = await VoiceOrchestratorService.processVoiceInteraction({
        userId: req.user.id,
        userRole: req.user.role,
        audioBuffer,
        textQuery,
        language: language || 'indic-auto',
        pendingActionId,
        confirmAction: confirmAction === 'true' || confirmAction === true,
      });

      return ApiResponse.success(res, 'Voice interaction processed', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Dedicated STT endpoint (Gnani Prisma)
   */
  static async transcribeAudio(req, res, next) {
    try {
      let audioBuffer = null;
      if (req.body?.audioBase64) {
        audioBuffer = extractAudioBuffer(req.body.audioBase64);
      } else if (req.file?.buffer) {
        audioBuffer = req.file.buffer;
      }

      if (!audioBuffer) {
        return ApiResponse.error(res, 'No audio data provided (expected audioBase64)', 400);
      }

      const languageCode = req.body.languageCode || 'indic-auto';
      const result = await GnaniPrismaService.transcribeAudio(audioBuffer, languageCode);

      return ApiResponse.success(res, 'Audio transcription completed', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Dedicated TTS endpoint (Gnani Timbre)
   */
  static async synthesizeSpeech(req, res, next) {
    try {
      const { text, language, voice } = req.body;
      if (!text) {
        return ApiResponse.error(res, 'Text is required for speech synthesis', 400);
      }

      const result = await GnaniTimbreService.synthesizeSpeech(text, language, voice);
      return ApiResponse.success(res, 'Speech synthesis completed', result);
    } catch (error) {
      next(error);
    }
  }
}
