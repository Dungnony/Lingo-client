"use client";

import { useEffect, useRef, useState } from "react";
import {
  scorePronunciation,
  type PronunciationScore,
} from "@/lib/pronunciation-score";

const RECOGNITION_LANG = "en-US";
const MAX_ALTERNATIVES = 5;

/** The subset of the Web Speech API recogniser we use. TypeScript's DOM lib
 * types its results but not the recogniser itself (still prefixed in Chrome). */
interface BrowserSpeechRecognition {
  lang: string;
  maxAlternatives: number;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
}

type RecognitionConstructor = new () => BrowserSpeechRecognition;

function getRecognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const ERROR_VI: Record<string, string> = {
  "not-allowed": "Chưa có quyền dùng micro. Cho phép micro trong cài đặt trang web rồi thử lại.",
  "service-not-allowed": "Trình duyệt đang chặn nhận dạng giọng nói trên trang này.",
  "no-speech": "Chưa nghe thấy gì. Nói to, rõ hơn rồi thử lại.",
  "audio-capture": "Không tìm thấy micro. Kiểm tra thiết bị ghi âm.",
  network: "Không kết nối được dịch vụ nhận dạng giọng nói. Kiểm tra mạng rồi thử lại.",
};

/**
 * Listens once and scores what was heard against `target`. Uses the
 * browser's speech recognition (Chrome/Edge send the audio to their speech
 * service); `supported` is false elsewhere so the page can fall back to
 * record-and-replay only.
 */
export function useSpeechCheck(target: string) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<PronunciationScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recognition = useRef<BrowserSpeechRecognition | null>(null);

  useEffect(() => {
    // Feature detection must run after mount: the server render has no window.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(getRecognitionConstructor() !== null);
    return () => recognition.current?.abort();
  }, []);

  function start(onScored: (score: PronunciationScore) => void) {
    const Recognition = getRecognitionConstructor();
    if (!Recognition) return;
    recognition.current?.abort();
    const rec = new Recognition();
    rec.lang = RECOGNITION_LANG;
    rec.maxAlternatives = MAX_ALTERNATIVES;
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (event) => {
      const first = event.results[0];
      const heard = first
        ? Array.from({ length: first.length }, (_, i) => first[i].transcript)
        : [];
      const score = scorePronunciation(target, heard);
      setResult(score);
      onScored(score);
    };
    rec.onerror = (event) => {
      if (event.error === "aborted") return;
      setError(ERROR_VI[event.error] ?? "Nhận dạng giọng nói bị lỗi. Thử lại nhé.");
    };
    rec.onend = () => setListening(false);
    recognition.current = rec;
    setError(null);
    setResult(null);
    setListening(true);
    rec.start();
  }

  function stop() {
    recognition.current?.abort();
    setListening(false);
  }

  return { supported, listening, result, error, start, stop };
}
