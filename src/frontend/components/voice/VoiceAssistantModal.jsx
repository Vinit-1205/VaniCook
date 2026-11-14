import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { voiceService } from '../../services/voiceService.js';
import { WavRecorder } from '../../utils/wavRecorder.js';
import { useAuth } from '../../hooks/useAuth.js';
import {
  Mic,
  MicOff,
  Sparkles,
  Send,
  Volume2,
  Users,
  CheckCircle2,
  AlertCircle,
  Globe,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';

const LANGUAGES = [
  { code: 'indic-auto', label: 'Auto (Hinglish)' },
  { code: 'hi-IN', label: 'हिन्दी (Hindi)' },
  { code: 'mr-IN', label: 'मराठी (Marathi)' },
  { code: 'en-IN', label: 'English' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)' },
];

export const VoiceAssistantModal = ({ isOpen, onClose }) => {
  const { user, isCook } = useAuth();

  // Assistant State: 'IDLE' | 'LISTENING' | 'PROCESSING' | 'UNDERSTANDING' | 'CONFIRMATION_REQUIRED' | 'EXECUTING' | 'SPEAKING' | 'SUCCESS' | 'ERROR'
  const [voiceState, setVoiceState] = useState('IDLE');
  const [selectedLanguage, setSelectedLanguage] = useState('indic-auto');
  const [query, setQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Conversation history
  const [conversation, setConversation] = useState([
    {
      sender: 'assistant',
      text: "Namaste! I'm Vani, your neighbourhood cooking assistant. Speak in Hindi, Marathi, Kannada, or English to find cooks, calculate shared savings, or coordinate your daily schedule.",
      language: 'en-IN',
    },
  ]);

  // Pending action requiring user confirmation gate
  const [pendingAction, setPendingAction] = useState(null);

  // Audio recording refs
  const wavRecorderRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Role-aware sample voice prompts
  const customerPrompts = [
    'Find a cook near my apartment.',
    'I need a cook for dinner tomorrow.',
    'Show vegetarian cooks in my society.',
    'What happens if four families share a cook?',
  ];

  const cookPrompts = [
    'Show my bookings today.',
    'Update my availability.',
    'Show pending requests.',
    'Show my monthly earnings.',
  ];

  const activePrompts = isCook ? cookPrompts : customerPrompts;

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, voiceState]);

  // Clean up audio on close
  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setVoiceState('IDLE');
      setPendingAction(null);
      setErrorMessage('');
    }
  }, [isOpen]);

  /**
   * Start PCM WAV audio capture (Web Audio API)
   * Produces clean 16kHz 16-bit mono RIFF WAVE directly compatible with Gnani Prisma STT
   */
  const startRecording = async () => {
    try {
      setErrorMessage('');
      const recorder = new WavRecorder(16000);
      await recorder.start();
      wavRecorderRef.current = recorder;
      setVoiceState('LISTENING');
    } catch (err) {
      console.warn('WAV Recorder init failed, falling back to MediaRecorder:', err);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorder.mimeType || 'audio/wav',
          });
          stream.getTracks().forEach((track) => track.stop());
          await handleAudioCaptured(audioBlob);
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setVoiceState('LISTENING');
      } catch (fallbackErr) {
        console.warn('Microphone permission or hardware issue:', fallbackErr);
        setErrorMessage(
          'Microphone access is unavailable. Please grant microphone permissions or type your query below.'
        );
        setVoiceState('IDLE');
      }
    }
  };

  /**
   * Stop audio capture and process
   */
  const stopRecording = async () => {
    if (wavRecorderRef.current && wavRecorderRef.current.isRecording) {
      try {
        setVoiceState('PROCESSING');
        const audioBlob = await wavRecorderRef.current.stop();
        wavRecorderRef.current = null;
        await handleAudioCaptured(audioBlob);
      } catch (err) {
        console.error('Stop WAV recording error:', err);
        setErrorMessage(err.message || 'Audio capture failed. Please try again.');
        setVoiceState('IDLE');
      }
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  /**
   * Process Captured Audio Blob -> Base64 -> Gnani Orchestrator
   */
  const handleAudioCaptured = async (audioBlob) => {
    try {
      setVoiceState('PROCESSING');
      const audioBase64 = await voiceService.blobToBase64(audioBlob);

      setVoiceState('UNDERSTANDING');
      const response = await voiceService.sendVoiceCommand({
        audioBase64,
        language: selectedLanguage,
      });

      handleOrchestratorResult(response);
    } catch (err) {
      console.error('Voice processing error:', err);
      setErrorMessage(err.message || 'Voice recognition failed. Please try again or type.');
      setVoiceState('ERROR');
    }
  };

  /**
   * Send text command fallback
   */
  const handleTextSubmit = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    const userText = query.trim();
    setQuery('');
    setErrorMessage('');

    setConversation((prev) => [
      ...prev,
      { sender: 'user', text: userText },
    ]);

    setVoiceState('UNDERSTANDING');

    try {
      const response = await voiceService.sendVoiceCommand({
        textQuery: userText,
        language: selectedLanguage,
      });

      handleOrchestratorResult(response, userText);
    } catch (err) {
      console.error('Text command error:', err);
      setErrorMessage(err.message || 'Failed to process command.');
      setVoiceState('ERROR');
    }
  };

  /**
   * Handle Gnani orchestrator response (Confirmation gate, DB execution, TTS audio)
   */
  const handleOrchestratorResult = (res, rawQuery) => {
    const data = res.data || res;

    // 1. If STT transcribed user text, show it in conversation
    if ((data.transcribedText || data.transcript) && !rawQuery) {
      setConversation((prev) => [
        ...prev,
        {
          sender: 'user',
          text: data.transcribedText || data.transcript,
          language: data.detectedLanguage,
        },
      ]);
    }

    // 2. Check confirmation gate
    if (data.status === 'CONFIRMATION_REQUIRED' && data.pendingAction) {
      setVoiceState('CONFIRMATION_REQUIRED');
      setPendingAction(data.pendingAction);

      setConversation((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: data.spokenResponse || 'Action requires confirmation. Please verify below.',
          isGate: true,
        },
      ]);
      playAudioResponse(data.audioBase64, data.spokenResponse);
      return;
    }

    // 3. Normal executed response
    setVoiceState('SPEAKING');
    setPendingAction(null);

    const reply = data.spokenResponse || data.message || 'Command executed successfully.';
    setConversation((prev) => [
      ...prev,
      {
        sender: 'assistant',
        text: reply,
        metadata: data.payload,
      },
    ]);

    playAudioResponse(data.audioBase64, reply);
  };

  /**
   * User confirms pending action gate
   */
  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    setVoiceState('EXECUTING');
    try {
      const response = await voiceService.sendVoiceCommand({
        pendingActionId: pendingAction.id,
        confirmAction: true,
        language: selectedLanguage,
      });

      handleOrchestratorResult(response);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to confirm action.');
      setVoiceState('ERROR');
    }
  };

  /**
   * User cancels pending action gate
   */
  const handleCancelAction = () => {
    setPendingAction(null);
    setVoiceState('IDLE');
    setConversation((prev) => [
      ...prev,
      {
        sender: 'assistant',
        text: 'Action cancelled. How else may I assist you?',
      },
    ]);
  };

  /**
   * Play TTS Spoken Audio (Base64 from Gnani Timbre)
   */
  const playAudioResponse = (audioBase64, fallbackText) => {
    if (audioBase64) {
      try {
        const isWav = audioBase64.startsWith('UklGR');
        const mimeType = isWav ? 'audio/wav' : 'audio/mp3';
        const audioSrc = audioBase64.startsWith('data:')
          ? audioBase64
          : `data:${mimeType};base64,${audioBase64}`;
        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = audioSrc;
          audioPlayerRef.current.play().catch((err) => {
            console.log('Autoplay restriction, falling back:', err);
          });
        }
      } catch (err) {
        console.error('Audio playback error:', err);
      }
    } else if (window.speechSynthesis && fallbackText) {
      try {
        const utterance = new SpeechSynthesisUtterance(fallbackText);
        utterance.rate = 1.0;
        utterance.onend = () => setVoiceState('IDLE');
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        setVoiceState('IDLE');
      }
    } else {
      setTimeout(() => setVoiceState('IDLE'), 2000);
    }
  };

  // State text and visual indicators
  const stateMeta = {
    IDLE: {
      text: "Hi, I'm Vani. How can I help?",
      badge: 'Ready to Listen',
      color: 'bg-forest/10 text-forest',
    },
    LISTENING: {
      text: "I'm listening...",
      badge: 'Listening',
      color: 'bg-red-50 text-red-700 animate-pulse',
    },
    PROCESSING: {
      text: 'Transcribing speech with Gnani Prisma...',
      badge: 'Transcribing',
      color: 'bg-amber-50 text-amber-800',
    },
    UNDERSTANDING: {
      text: 'Understanding your request...',
      badge: 'Processing',
      color: 'bg-forest/10 text-forest',
    },
    CONFIRMATION_REQUIRED: {
      text: 'Would you like me to submit this booking request?',
      badge: 'Confirmation Required',
      color: 'bg-amber-100 text-amber-900',
    },
    EXECUTING: {
      text: 'Executing your request...',
      badge: 'Executing',
      color: 'bg-forest/10 text-forest',
    },
    SPEAKING: {
      text: "Here's what I found.",
      badge: 'Responding',
      color: 'bg-leaf/20 text-forest-deep',
    },
    SUCCESS: {
      text: 'Your request has been submitted.',
      badge: 'Completed',
      color: 'bg-emerald-50 text-emerald-800',
    },
    ERROR: {
      text: "I couldn't process that request. Please try again.",
      badge: 'Error',
      color: 'bg-red-50 text-red-700',
    },
  };

  const currentMeta = stateMeta[voiceState] || stateMeta.IDLE;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vani — Voice Companion"
      subtitle="Multilingual Speech Recognition (Prisma) & Synthesis (Timbre)"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 font-sans">
        
        {/* Top Control Bar: Language Selection & Status */}
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#E7E3D9]">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <Globe className="w-3.5 h-3.5 text-[#173D2E] shrink-0 mr-0.5" />
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelectedLanguage(lang.code)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                  selectedLanguage === lang.code
                    ? 'bg-[#173D2E] text-white shadow-sm'
                    : 'bg-white text-[#252923]/70 border border-[#E7E3D9] hover:bg-[#F0EBDD]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${currentMeta.color}`}>
            {currentMeta.badge}
          </span>
        </div>

        {/* Hidden Audio Player for Gnani Timbre TTS */}
        <audio
          ref={audioPlayerRef}
          onEnded={() => setVoiceState('IDLE')}
          onError={() => setVoiceState('IDLE')}
          className="hidden"
        />

        {/* Conversation Stream */}
        <div className="h-64 sm:h-72 overflow-y-auto space-y-3 p-4 bg-[#F8F5EC] rounded-2xl border border-[#E7E3D9]">
          {conversation.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-[#173D2E] flex items-center justify-center text-[#A5BE83] shrink-0 text-xs shadow-sm">
                  <Mic className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#173D2E] text-white rounded-tr-none shadow-soft'
                    : 'bg-white text-[#252923] border border-[#E7E3D9] shadow-soft rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>
                {msg.isGate && (
                  <span className="inline-block mt-2 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Awaiting confirmation below
                  </span>
                )}
              </div>
            </motion.div>
          ))}

          {/* Dynamic Voice State Indicator Banner */}
          {voiceState === 'LISTENING' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold"
            >
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-4 bg-red-500 animate-pulse rounded-full" />
                <span className="w-1.5 h-6 bg-red-600 animate-bounce rounded-full" />
                <span className="w-1.5 h-4 bg-red-500 animate-pulse rounded-full" />
              </div>
              <span>I'm listening... Speak in your preferred language, then tap stop.</span>
            </motion.div>
          )}

          {voiceState === 'PROCESSING' && (
            <div className="flex items-center gap-2 p-3 bg-[#A5BE83]/15 border border-[#173D2E]/20 text-[#173D2E] rounded-2xl text-xs font-semibold animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Transcribing speech with Gnani Prisma STT...</span>
            </div>
          )}

          {voiceState === 'UNDERSTANDING' && (
            <div className="flex items-center gap-2 p-3 bg-[#A5BE83]/15 border border-[#173D2E]/20 text-[#173D2E] rounded-2xl text-xs font-semibold animate-pulse">
              <Sparkles className="w-4 h-4 animate-bounce" />
              <span>Understanding your request and checking community records...</span>
            </div>
          )}

          {voiceState === 'SPEAKING' && (
            <div className="flex items-center gap-2 p-3 bg-[#A5BE83]/20 border border-[#173D2E]/20 text-[#173D2E] rounded-2xl text-xs font-semibold">
              <Volume2 className="w-4 h-4 text-[#173D2E] animate-pulse" />
              <span>Speaking response via Gnani Timbre TTS...</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Confirmation Gate Card */}
        <AnimatePresence>
          {voiceState === 'CONFIRMATION_REQUIRED' && pendingAction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                    Action Confirmation Required
                  </h5>
                </div>
                <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                  Safety Gate
                </span>
              </div>

              <p className="text-xs text-amber-900 font-medium">
                {pendingAction.summary || 'Would you like to execute this action?'}
              </p>

              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={handleCancelAction}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmAction}
                  className="bg-amber-800 hover:bg-amber-900 text-white"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Confirm Action
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggested Voice Commands */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#77796F] mb-1.5">
            Suggested commands:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {activePrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQuery(prompt)}
                className="text-[11px] bg-white hover:bg-[#F0EBDD] text-[#252923] border border-[#E7E3D9] rounded-xl px-2.5 py-1 transition-colors text-left font-medium"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Voice Microphone + Text Input Bar */}
        <form onSubmit={handleTextSubmit} className="flex items-center gap-2 pt-1">
          {voiceState === 'LISTENING' ? (
            <button
              type="button"
              onClick={stopRecording}
              className="w-12 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all animate-bounce shadow-soft shrink-0"
              title="Stop recording"
            >
              <MicOff className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              disabled={voiceState === 'PROCESSING' || voiceState === 'UNDERSTANDING' || voiceState === 'EXECUTING'}
              className="w-12 h-12 rounded-2xl bg-[#173D2E] hover:bg-[#102B21] text-[#A5BE83] flex items-center justify-center transition-all shadow-soft shrink-0 group"
              title="Tap to speak with Vani"
            >
              <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          )}

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Speak naturally or type your cooking request..."
            className="flex-1 bg-white border border-[#E7E3D9] focus:border-[#173D2E] focus:ring-2 focus:ring-[#173D2E]/20 rounded-2xl px-4 py-3 text-xs text-[#252923] outline-none transition-all"
          />

          <Button
            type="submit"
            size="sm"
            variant="primary"
            disabled={!query.trim() || voiceState === 'UNDERSTANDING'}
            className="h-12 px-4 rounded-2xl bg-[#173D2E] text-white shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-[#77796F] pt-2 border-t border-[#E7E3D9]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#A5BE83]" />
            Gnani Prisma STT & Timbre TTS Engine
          </span>
          <span>16kHz PCM WAV Standard</span>
        </div>
      </div>
    </Modal>
  );
};

export default VoiceAssistantModal;
