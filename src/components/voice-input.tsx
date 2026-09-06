import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import type { ExplainLocale } from '../domain/explain-types';
import { t } from '../i18n/strings';

interface ISpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly 0: { readonly transcript: string };
}

interface ISpeechRecognitionEvent {
  readonly resultIndex: number;
  readonly results: ArrayLike<ISpeechRecognitionResult>;
}

interface ISpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionCtor = new () => ISpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | undefined {
  const scope = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition;
}

export function VoiceInputButton({
  locale,
  onTranscript,
  disabled
}: {
  locale: ExplainLocale;
  onTranscript: (text: string) => void;
  disabled?: boolean;
}): ReactElement | null {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<ISpeechRecognitionLike | null>(null);
  const supported = Boolean(getSpeechRecognitionCtor());

  useEffect(() => () => {
    recognitionRef.current?.abort();
  }, []);

  const toggle = useCallback((): void => {
    if (disabled) return;
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new Ctor();
    recognition.lang = locale === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: ISpeechRecognitionEvent): void => {
      const result = event.results[event.resultIndex];
      const transcript = result?.[0]?.transcript?.trim();
      if (transcript) onTranscript(transcript);
    };
    recognition.onerror = (): void => setListening(false);
    recognition.onend = (): void => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [disabled, listening, locale, onTranscript]);

  if (!supported) return null;

  return (
    <button
      type="button"
      className={`voice-btn ${listening ? 'listening' : ''}`}
      onClick={toggle}
      disabled={disabled}
      aria-label={listening ? t('voiceStop', locale) : t('voiceListen', locale)}
      title={listening ? t('voiceStop', locale) : t('voiceListen', locale)}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="6" y="2" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M4 8a4 4 0 008 0M8 12v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </button>
  );
}
