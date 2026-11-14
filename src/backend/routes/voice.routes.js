import { Router } from 'express';
import { VoiceController } from '../controllers/voice.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Full voice interaction flow (Base64 audio or text -> STT -> NLP Intent -> DB Exec / Confirmation -> TTS)
router.post('/command', authenticate, VoiceController.processVoiceCommand);

// Dedicated Gnani Prisma STT (Speech-to-Text)
router.post('/transcribe', authenticate, VoiceController.transcribeAudio);

// Dedicated Gnani Timbre TTS (Text-to-Speech)
router.post('/synthesize', authenticate, VoiceController.synthesizeSpeech);

export default router;

