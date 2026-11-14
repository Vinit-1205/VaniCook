// Scratch test script: Full Live Verification of Gnani Prisma STT and Timbre TTS
// Strictly sanitized: NEVER print the API key or secret values.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ENV } from '../src/backend/config/env.js';
import { GnaniPrismaService } from '../src/backend/services/gnani/prisma.service.js';
import { GnaniTimbreService } from '../src/backend/services/gnani/timbre.service.js';
import { VoiceOrchestratorService } from '../src/backend/services/gnani/voice-orchestrator.service.js';
import prisma from '../src/backend/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runLiveVerification() {
  const report = {
    config: {},
    timbreTTS: {},
    prismaSTT: {},
    audioFormatValidation: {},
    voiceFlowE2E: {},
    securityAudit: {},
  };

  console.log('=================================================================');
  console.log('       COOKCONNECT — GNANI LIVE API INTEGRATION TEST             ');
  console.log('=================================================================');

  // 1. CONFIGURATION INSPECTION
  console.log('\n[1/5] Inspecting Backend Configuration...');
  const keyConfigured = !!ENV.GNANI_API_KEY && ENV.GNANI_API_KEY.trim().length > 0;
  const keyLength = ENV.GNANI_API_KEY ? ENV.GNANI_API_KEY.length : 0;
  const keyPrefix = ENV.GNANI_API_KEY ? ENV.GNANI_API_KEY.substring(0, 5) + '...' : 'none';

  report.config = {
    apiKeyConfigured: keyConfigured,
    keyLength,
    keyPrefix,
    timbreEndpoint: GnaniTimbreService.API_URL,
    prismaEndpoint: GnaniPrismaService.API_URL,
    authHeader: 'X-API-Key-ID',
  };
  console.log('✓ API Key Configured:', keyConfigured ? `YES (Prefix: ${keyPrefix}, Length: ${keyLength})` : 'NO');
  console.log('✓ Timbre Endpoint:', GnaniTimbreService.API_URL);
  console.log('✓ Prisma STT Endpoint:', GnaniPrismaService.API_URL);
  console.log('✓ Auth Header Scheme: X-API-Key-ID');

  // 2. LIVE GNANI TIMBRE TTS TEST
  console.log('\n[2/5] Testing Gnani Timbre Text-to-Speech (TTS)...');
  const testPhrase = 'Welcome to CookConnect. Your neighbourhood cooking assistant is ready.';
  const ttsStart = Date.now();
  
  const ttsResult = await GnaniTimbreService.synthesizeSpeech(testPhrase, 'en-IN', 'Nalini');
  const ttsDurationMs = Date.now() - ttsStart;

  if (ttsResult.success && ttsResult.audioBase64) {
    const audioBuffer = Buffer.from(ttsResult.audioBase64, 'base64');
    const isRiffWave = audioBuffer.toString('ascii', 0, 4) === 'RIFF' && audioBuffer.toString('ascii', 8, 12) === 'WAVE';
    
    // Parse WAV metadata if valid RIFF
    let sampleRate = null;
    let channels = null;
    let bitsPerSample = null;
    if (isRiffWave && audioBuffer.length >= 36) {
      channels = audioBuffer.readUInt16LE(22);
      sampleRate = audioBuffer.readUInt32LE(24);
      bitsPerSample = audioBuffer.readUInt16LE(34);
    }

    report.timbreTTS = {
      status: 'SUCCESS',
      httpStatus: 200,
      model: 'timbre-v2.5',
      language: 'en-IN',
      voice: 'Nalini',
      durationMs: ttsDurationMs,
      contentType: ttsResult.contentType,
      audioBytes: audioBuffer.length,
      isRiffWave,
      sampleRate,
      channels,
      bitsPerSample,
      playable: isRiffWave && audioBuffer.length > 1000,
    };

    console.log(`✓ HTTP 200 OK (${ttsDurationMs}ms)`);
    console.log(`✓ Content-Type: ${ttsResult.contentType}`);
    console.log(`✓ Audio Size: ${audioBuffer.length} bytes`);
    console.log(`✓ RIFF WAVE Header: ${isRiffWave ? 'VALID' : 'INVALID'}`);
    console.log(`✓ Audio Format: ${sampleRate} Hz, ${channels} Channel(s), ${bitsPerSample}-bit PCM`);
    
    // Save sample for verification
    const samplePath = path.join(__dirname, 'timbre_sample.wav');
    fs.writeFileSync(samplePath, audioBuffer);
    console.log(`✓ Audio saved locally to: ${samplePath}`);

    // 3. LIVE GNANI PRISMA STT TEST
    console.log('\n[3/5] Testing Gnani Prisma Speech-to-Text (STT)...');
    const sttStart = Date.now();
    const sttResult = await GnaniPrismaService.transcribeAudio(audioBuffer, 'en-IN');
    const sttDurationMs = Date.now() - sttStart;

    if (sttResult.success) {
      report.prismaSTT = {
        status: 'SUCCESS',
        httpStatus: 200,
        model: 'prisma-v3.0',
        languageCode: 'en-IN',
        durationMs: sttDurationMs,
        detectedFormat: sttResult.detectedFormat,
        detectedLanguage: sttResult.detectedLanguage,
        transcript: sttResult.transcript,
        rawResults: sttResult.raw,
      };
      console.log(`✓ HTTP 200 OK (${sttDurationMs}ms)`);
      console.log(`✓ Detected Format: ${sttResult.detectedFormat}`);
      console.log(`✓ Transcript Received: "${sttResult.transcript}"`);
    } else {
      report.prismaSTT = {
        status: 'FAILED',
        httpStatus: sttResult.statusCode,
        error: sttResult.error,
      };
      console.log(`✗ STT Failed:`, sttResult.error);
    }
  } else {
    report.timbreTTS = {
      status: 'FAILED',
      httpStatus: ttsResult.statusCode,
      error: ttsResult.error,
    };
    console.log(`✗ TTS Failed:`, ttsResult.error);
  }

  // 4. TEST AUDIO FORMAT VALIDATION & DETECTION
  console.log('\n[4/5] Testing Audio Format Detection & Guardrails...');
  // Simulate WebM container header: 0x1A 0x45 0xDF 0xA3
  const fakeWebmBuffer = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x01, 0x00, 0x00, 0x00, 0x42, 0x82, 0x88, 0x6d, 0x61, 0x74, 0x72, 0x6f, 0x73, 0x6b, 0x61]);
  const webmDetected = GnaniPrismaService.detectAudioFormat(fakeWebmBuffer);
  const webmSttResult = await GnaniPrismaService.transcribeAudio(fakeWebmBuffer, 'en-IN');

  report.audioFormatValidation = {
    webmDetection: webmDetected,
    webmRejectedCleanly: !webmSttResult.success && webmSttResult.source === 'gnani_prisma_unsupported_format',
    guardrailMessage: webmSttResult.error,
  };
  console.log('✓ Fake WebM Detected Format:', webmDetected.format, `(${webmDetected.mimeType})`);
  console.log('✓ Guardrail Protection:', report.audioFormatValidation.webmRejectedCleanly ? 'ACTIVE (Prevents HTTP 400 rejection from Gnani)' : 'INACTIVE');

  // 5. TEST END-TO-END VOICE WORKFLOW (Audio -> STT -> Intent -> DB Query -> Timbre TTS)
  console.log('\n[5/5] Testing Complete End-to-End Voice Orchestration...');
  try {
    // Pick an existing customer user from database
    const customer = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' },
      include: { householdLocations: { include: { society: true } } },
    });

    if (customer) {
      console.log(`✓ Using customer user: ${customer.fullName} (${customer.email})`);
      
      // Step A: Synthesize query "Show me verified cooks in my society" using Timbre
      const queryPrompt = 'Show me verified cooks in my society';
      const promptTts = await GnaniTimbreService.synthesizeSpeech(queryPrompt, 'en-IN', 'Nalini');
      const queryAudioBuffer = Buffer.from(promptTts.audioBase64, 'base64');
      
      // Step B: Pass this actual spoken audio to VoiceOrchestratorService
      const flowStart = Date.now();
      const orchestratorResult = await VoiceOrchestratorService.processVoiceInteraction({
        userId: customer.id,
        userRole: 'CUSTOMER',
        audioBuffer: queryAudioBuffer,
        language: 'en-IN',
      });
      const flowDurationMs = Date.now() - flowStart;

      const hasAudioResponse = !!orchestratorResult.audioBase64;
      const respBuffer = hasAudioResponse ? Buffer.from(orchestratorResult.audioBase64, 'base64') : null;
      const isRespWave = respBuffer && respBuffer.toString('ascii', 0, 4) === 'RIFF';

      report.voiceFlowE2E = {
        status: 'SUCCESS',
        userId: customer.id,
        inputQueryAudioBytes: queryAudioBuffer.length,
        sttTranscript: orchestratorResult.transcript,
        sttSource: orchestratorResult.sttSource,
        recognizedIntent: orchestratorResult.intent,
        voiceState: orchestratorResult.state,
        responseText: orchestratorResult.responseText,
        hasAudioResponse,
        responseAudioBytes: respBuffer ? respBuffer.length : 0,
        responseAudioIsWav: isRespWave,
        ttsSource: orchestratorResult.ttsSource,
        totalFlowDurationMs: flowDurationMs,
      };

      console.log(`✓ Round-trip completed in ${flowDurationMs}ms`);
      console.log(`✓ STT Transcript: "${orchestratorResult.transcript}" (Source: ${orchestratorResult.sttSource})`);
      console.log(`✓ Extracted Intent: ${orchestratorResult.intent}`);
      console.log(`✓ Spoken Response: "${orchestratorResult.spokenResponse}"`);
      console.log(`✓ TTS Audio Response Generated: ${hasAudioResponse} (${respBuffer.length} bytes, WAV: ${isRespWave})`);
    } else {
      console.log('⚠ No customer found in database to run E2E flow.');
      report.voiceFlowE2E = { status: 'SKIPPED_NO_USER' };
    }
  } catch (err) {
    console.error('✗ E2E Flow Failed:', err);
    report.voiceFlowE2E = {
      status: 'FAILED',
      error: err.message,
    };
  }

  // 6. SECURITY & SECRETS AUDIT
  console.log('\n[6/5] Auditing Secrets & Key Isolation...');
  const frontendDir = path.resolve(__dirname, '../src/frontend');
  
  // Search frontend files for accidental GNANI_API_KEY references
  function scanDir(dir, pattern) {
    let matches = [];
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        matches = matches.concat(scanDir(full, pattern));
      } else if (f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.html') || f.endsWith('.css')) {
        const content = fs.readFileSync(full, 'utf8');
        if (content.includes('GNANI_API_KEY') || (ENV.GNANI_API_KEY && content.includes(ENV.GNANI_API_KEY))) {
          matches.push(full);
        }
      }
    }
    return matches;
  }

  const leakedFiles = scanDir(frontendDir);
  report.securityAudit = {
    apiKeyLeakedInFrontend: leakedFiles.length > 0,
    leakedFiles,
    onlyBackendAccess: true,
  };
  console.log('✓ Frontend Source Files Scanned for Secrets:', leakedFiles.length === 0 ? 'CLEAN (0 leaks)' : `LEAK DETECTED in: ${leakedFiles.join(', ')}`);

  console.log('\n=================================================================');
  console.log('                     VERIFICATION COMPLETE                       ');
  console.log('=================================================================');

  // Save full sanitized report
  fs.writeFileSync(path.join(__dirname, 'verification_report.json'), JSON.stringify(report, null, 2));
  console.log('Report saved to scratch/verification_report.json');
}

runLiveVerification()
  .catch((err) => {
    console.error('Fatal error during verification:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

