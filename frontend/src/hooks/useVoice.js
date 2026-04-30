/* eslint-disable */
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for Speech-to-Text (STT) and Text-to-Speech (TTS)
 */
export default function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [browserSupport, setBrowserSupport] = useState({ stt: false, tts: false });

  const recognitionRef = useRef(null);
  const synthesisRef = useRef(window.speechSynthesis);

  useEffect(() => {
    // Check for STT support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const text = result[0].transcript;
        setTranscript(text);
      };

      recognitionRef.current = recognition;
      setBrowserSupport(prev => ({ ...prev, stt: true }));
    }

    // Check for TTS support
    if ('speechSynthesis' in window) {
      setBrowserSupport(prev => ({ ...prev, tts: true }));
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setTranscript('');
      recognitionRef.current.start();
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const speak = useCallback((text) => {
    if (!synthesisRef.current || !text) return;

    // Stop any current speech
    synthesisRef.current.cancel();

    // Clean text (remove markdown for better speech)
    const cleanText = text
      .replace(/```[\s\S]*?```/g, ' [Code example skipped] ') // Skip large code blocks
      .replace(/[*#_`~]/g, '') // Remove markdown symbols
      .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
      .replace(/(\n)+/g, '. ') // Replace newlines with pauses
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05; // Slightly faster for a professional feel
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // Personality fix: pick a better voice if available
    const voices = synthesisRef.current.getVoices();
    // Prefer Google/Natural voices, then common professional sounding ones on Windows/Mac
    const preferredVoice = voices.find(v => 
      v.name.includes('Google') || 
      v.name.includes('Natural') || 
      v.name.includes('Microsoft David') || 
      v.name.includes('Samantha') ||
      v.name.includes('Daniel')
    ) || voices[0];

    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
    };

    synthesisRef.current.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    browserSupport,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}

