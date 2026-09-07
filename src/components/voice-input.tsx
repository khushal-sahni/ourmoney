import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import type { ExplainLocale } from '../domain/explain-types';
import { t } from '../i18n/strings';
import { CheckIcon, CloseIcon } from './ui-icons';

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
  onerror: ((event: { error?: string }) => void) | null;
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

function MicIcon(): ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="6" y="2" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 8a4 4 0 008 0M8 12v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Waveform(): ReactElement {
  return (
    <div className="voice-waveform" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className="voice-wave-bar" style={{ animationDelay: `${index * 0.12}s` }} />
      ))}
    </div>
  );
}

export function VoiceInputButton({
  locale,
  onCommit,
  onActiveChange,
  disabled
}: {
  locale: ExplainLocale;
  onCommit: (text: string) => void;
  onActiveChange?: (active: boolean) => void;
  disabled?: boolean;
}): ReactElement | null {
  const [listening, setListening] = useState(false);
  const [liveText, setLiveText] = useState('');
  const recognitionRef = useRef<ISpeechRecognitionLike | null>(null);
  const finalsRef = useRef('');
  const interimRef = useRef('');
  const sessionActiveRef = useRef(false);
  const intentionalStopRef = useRef(false);
  const supported = Boolean(getSpeechRecognitionCtor());

  const setActive = useCallback((active: boolean): void => {
    sessionActiveRef.current = active;
    setListening(active);
    onActiveChange?.(active);
  }, [onActiveChange]);

  const resetTranscript = useCallback((): void => {
    finalsRef.current = '';
    interimRef.current = '';
    setLiveText('');
  }, []);

  const combinedTranscript = useCallback((): string => {
    return `${finalsRef.current} ${interimRef.current}`.replace(/\s+/g, ' ').trim();
  }, []);

  useEffect(() => () => {
    intentionalStopRef.current = true;
    recognitionRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!listening) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        intentionalStopRef.current = true;
        recognitionRef.current?.abort();
        recognitionRef.current = null;
        resetTranscript();
        setActive(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [listening, resetTranscript, setActive]);

  const startRecognition = useCallback((): void => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = locale === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: ISpeechRecognitionEvent): void => {
      let interim = '';
      let newlyFinal = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const piece = result?.[0]?.transcript ?? '';
        if (!piece) continue;
        if (result.isFinal) newlyFinal += `${piece} `;
        else interim += piece;
      }
      if (newlyFinal) {
        finalsRef.current = `${finalsRef.current} ${newlyFinal}`.replace(/\s+/g, ' ').trim();
      }
      interimRef.current = interim;
      setLiveText(combinedTranscript());
    };

    recognition.onerror = (event: { error?: string }): void => {
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      intentionalStopRef.current = true;
      recognitionRef.current = null;
      resetTranscript();
      setActive(false);
    };

    recognition.onend = (): void => {
      if (!sessionActiveRef.current || intentionalStopRef.current) {
        recognitionRef.current = null;
        return;
      }
      // Chrome often ends on silence even with continuous — restart while still dictating.
      try {
        recognition.start();
      } catch {
        recognitionRef.current = null;
        setActive(false);
      }
    };

    recognitionRef.current = recognition;
    intentionalStopRef.current = false;
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      resetTranscript();
      setActive(false);
    }
  }, [combinedTranscript, locale, resetTranscript, setActive]);

  const begin = useCallback((): void => {
    if (disabled || sessionActiveRef.current) return;
    if (!getSpeechRecognitionCtor()) return;
    resetTranscript();
    setActive(true);
    startRecognition();
  }, [disabled, resetTranscript, setActive, startRecognition]);

  const cancel = useCallback((): void => {
    intentionalStopRef.current = true;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    resetTranscript();
    setActive(false);
  }, [resetTranscript, setActive]);

  const confirm = useCallback((): void => {
    intentionalStopRef.current = true;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    const text = combinedTranscript();
    resetTranscript();
    setActive(false);
    if (text) onCommit(text);
  }, [combinedTranscript, onCommit, resetTranscript, setActive]);

  if (!supported) return null;

  if (listening) {
    return (
      <div className="voice-dictation" role="status" aria-live="polite">
        <button
          type="button"
          className="voice-dictation-cancel"
          onClick={cancel}
          aria-label={t('voiceCancel', locale)}
          title={t('voiceCancel', locale)}
        >
          <CloseIcon />
        </button>
        <div className="voice-dictation-center">
          <Waveform />
          <span className="voice-dictation-live">
            {liveText || t('voiceListening', locale)}
          </span>
        </div>
        <button
          type="button"
          className="voice-dictation-confirm"
          onClick={confirm}
          aria-label={t('voiceConfirm', locale)}
          title={t('voiceConfirm', locale)}
        >
          <CheckIcon />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="voice-btn"
      onClick={begin}
      disabled={disabled}
      aria-label={t('voiceListen', locale)}
      title={t('voiceListen', locale)}
    >
      <MicIcon />
    </button>
  );
}
