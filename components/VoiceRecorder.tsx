'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  onFinalTranscript: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ onFinalTranscript, disabled }: Props) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const SpeechRecognitionCtor =
      typeof window !== 'undefined'
        ? window.SpeechRecognition ?? window.webkitSpeechRecognition
        : undefined;

    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'ja-JP';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalChunk = '';
      let interimChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalChunk += result[0].transcript;
        } else {
          interimChunk += result[0].transcript;
        }
      }
      if (finalChunk) onFinalTranscript(finalChunk);
      setInterim(interimChunk);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterim('');
    };

    recognitionRef.current = recognition;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle() {
    const recognition = recognitionRef.current;
    if (!recognition) {
      toast.error('このブラウザは音声入力に対応していません。下のテキスト欄に直接入力してください');
      return;
    }
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      recognition.start();
      setListening(true);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-label={listening ? '録音を停止' : '録音を開始'}
        className={cn(
          'flex h-24 w-24 items-center justify-center rounded-full text-4xl text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50',
          listening ? 'animate-pulse bg-destructive' : 'bg-primary'
        )}
      >
        🎤
      </button>
      <p className="min-h-[1.5rem] text-sm text-muted-foreground">
        {listening ? '聞き取り中…話してください' : 'タップして話す'}
      </p>
      {interim && <p className="px-4 text-center text-sm text-muted-foreground italic">{interim}</p>}
    </div>
  );
}
