/**
 * Browser-native PCM WAV Recorder
 * Captures clean 16kHz 16-bit mono PCM audio in standard RIFF WAVE format.
 * Fully compatible with Gnani Prisma STT (which requires wav/mp3/ogg/flac).
 */
export class WavRecorder {
  constructor(sampleRate = 16000) {
    this.sampleRate = sampleRate;
    this.audioContext = null;
    this.stream = null;
    this.processor = null;
    this.source = null;
    this.samples = [];
    this.isRecording = false;
  }

  async start() {
    this.samples = [];
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error('Web Audio API is not supported in this browser.');
    }

    this.audioContext = new AudioContextClass({ sampleRate: this.sampleRate });
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    this.source = this.audioContext.createMediaStreamSource(this.stream);
    // 4096 buffer size gives smooth streaming chunks
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      if (!this.isRecording) return;
      const input = e.inputBuffer.getChannelData(0);
      this.samples.push(new Float32Array(input));
    };

    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
    this.isRecording = true;
  }

  async stop() {
    this.isRecording = false;

    if (this.processor) {
      this.processor.disconnect();
      this.processor.onaudioprocess = null;
    }
    if (this.source) {
      this.source.disconnect();
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        await this.audioContext.close();
      } catch (e) {
        // Ignore audioContext close errors
      }
    }

    return this.encodeWav();
  }

  encodeWav() {
    let totalLength = 0;
    for (const chunk of this.samples) {
      totalLength += chunk.length;
    }

    if (totalLength === 0) {
      throw new Error('No audio captured. Please speak into the microphone and try again.');
    }

    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of this.samples) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    const inputSampleRate = this.audioContext?.sampleRate || this.sampleRate;
    const targetSampleRate = this.sampleRate || 16000;
    let resampled = merged;

    if (inputSampleRate !== targetSampleRate && inputSampleRate > 0) {
      // Downsample/upsample using linear interpolation for clean PCM timing
      const ratio = inputSampleRate / targetSampleRate;
      const newLength = Math.round(merged.length / ratio);
      resampled = new Float32Array(newLength);
      for (let i = 0; i < newLength; i++) {
        const originIndex = i * ratio;
        const indexFloor = Math.floor(originIndex);
        const indexCeil = Math.min(merged.length - 1, Math.ceil(originIndex));
        const fraction = originIndex - indexFloor;
        resampled[i] = merged[indexFloor] * (1 - fraction) + merged[indexCeil] * fraction;
      }
    }

    // Convert float samples to 16-bit PCM
    const pcm16 = new Int16Array(resampled.length);
    for (let i = 0; i < resampled.length; i++) {
      const s = Math.max(-1, Math.min(1, resampled[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    // Build 44-byte standard RIFF WAVE header
    const buffer = new ArrayBuffer(44 + pcm16.byteLength);
    const view = new DataView(buffer);

    const writeString = (view, offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + pcm16.byteLength, true); // file size - 8
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, 1, true); // NumChannels (1 = mono)
    view.setUint32(24, targetSampleRate, true); // SampleRate
    view.setUint32(28, targetSampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
    view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
    view.setUint16(34, 16, true); // BitsPerSample (16 bits)
    writeString(view, 36, 'data');
    view.setUint32(40, pcm16.byteLength, true); // SubChunk2Size (data size)

    // Append 16-bit PCM samples
    const pcmBytes = new Uint8Array(pcm16.buffer);
    const wavBytes = new Uint8Array(buffer, 44);
    wavBytes.set(pcmBytes);

    return new Blob([buffer], { type: 'audio/wav' });
  }
}

