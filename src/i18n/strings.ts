import type { ExplainLocale } from '../domain/explain-types';
import { useSession } from '../app/session-context';

const STRINGS = {
  ask: { en: 'Ask', hi: 'पूछें' },
  explore: { en: 'Explore', hi: 'खोजें' },
  compare: { en: 'Compare', hi: 'तुलना' },
  features: { en: 'Features', hi: 'विशेषताएँ' },
  scale: { en: 'How it scales', hi: 'वास्तविक डेटा' },
  about: { en: 'About', hi: 'परिचय' },
  back: { en: '← Back', hi: '← वापस' },
  language: { en: 'Language', hi: 'भाषा' },
  footerDisclosure: {
    en: 'Independent hackathon prototype · all figures synthetic · not a government product',
    hi: 'स्वतंत्र हैकथॉन प्रोटोटाइप · सभी आँकड़े काल्पनिक · सरकारी उत्पाद नहीं'
  },
  heroBadge: {
    en: 'Independent hackathon prototype · synthetic data',
    hi: 'स्वतंत्र हैकथॉन प्रोटोटाइप · काल्पनिक डेटा'
  },
  heroTitle: {
    en: 'Where did the reported rupee go?',
    hi: 'रिपोर्ट किया गया रुपया कहाँ गया?'
  },
  heroLead: {
    en: 'Ask in plain language. We answer only from fictional demo ledgers — not live government data.',
    hi: 'साधारण भाषा में पूछें। जवाब केवल काल्पनिक डेमो लेजर से — लाइव सरकारी डेटा से नहीं।'
  },
  askPlaceholder: {
    en: 'e.g. Where is the money going for roads at Uttar Raital?',
    hi: 'उदा. उत्तर रैतल में सड़कों के लिए पैसा कहाँ जा रहा है?'
  },
  followUpPlaceholder: {
    en: 'Ask a follow-up…',
    hi: 'और पूछें…'
  },
  send: { en: 'Send', hi: 'भेजें' },
  readingLedger: { en: 'Reading the ledger…', hi: 'लेजर पढ़ रहे हैं…' },
  openExplore: { en: 'Or open the flow map →', hi: 'या फ्लो मैप खोलें →' },
  requestRecords: { en: 'Request the records', hi: 'अभिलेख माँगें' },
  requestRecordsHint: {
    en: 'Draft an RTI-style information request for this office',
    hi: 'इस कार्यालय के लिए आरटीआई शैली का मसौदा बनाएँ'
  },
  voiceListen: { en: 'Speak your question', hi: 'अपना प्रश्न बोलें' },
  voiceStop: { en: 'Stop listening', hi: 'सुनना बंद करें' },
  voiceUnsupported: {
    en: 'Voice input is not supported in this browser',
    hi: 'इस ब्राउज़र में आवाज़ इनपुट उपलब्ध नहीं है'
  },
  offlineBanner: {
    en: 'You are offline. Explore still works from cached data; Ask falls back to offline explanations.',
    hi: 'आप ऑफ़लाइन हैं। Explore कैश से चलेगा; Ask ऑफ़लाइन स्पष्टीकरण दिखाएगा।'
  },
  rtiTitle: { en: 'Request the records', hi: 'अभिलेख माँगें' },
  rtiStepSubject: { en: 'What you are asking about', hi: 'आप किस बारे में पूछ रहे हैं' },
  rtiStepPoints: { en: 'Your points', hi: 'आपके बिंदु' },
  rtiStepDetails: { en: 'Your details', hi: 'आपका विवरण' },
  rtiStepReview: { en: 'Review and file', hi: 'जाँचें और दर्ज करें' },
  rtiNext: { en: 'Continue', hi: 'आगे' },
  rtiBack: { en: 'Back', hi: 'पीछे' },
  rtiClose: { en: 'Close', hi: 'बंद करें' },
  rtiCopy: { en: 'Copy draft', hi: 'कॉपी करें' },
  rtiDownload: { en: 'Download .txt', hi: '.txt डाउनलोड' },
  rtiPrint: { en: 'Print / PDF', hi: 'प्रिंट / PDF' },
  rtiWhatsApp: { en: 'WhatsApp', hi: 'व्हाट्सऐप' },
  rtiDisclaimer: {
    en: 'Synthetic demo draft. Does not allege wrongdoing. Nothing is filed automatically. Review before using.',
    hi: 'काल्पनिक डेमो मसौदा। कोई आरोप नहीं। स्वतः दर्ज नहीं होता। उपयोग से पहले जाँचें।'
  },
  rtiName: { en: 'Your name', hi: 'आपका नाम' },
  rtiAddress: { en: 'Postal address', hi: 'डाक पता' },
  rtiBpl: {
    en: 'I am below the poverty line (BPL) — claim fee exemption',
    hi: 'मैं गरीबी रेखा से नीचे हूँ (BPL) — शुल्क छूट का दावा'
  },
  rtiLocalOnly: {
    en: 'Name and address stay in this browser only. They are never sent to our servers.',
    hi: 'नाम और पता केवल इस ब्राउज़र में रहते हैं। हमारे सर्वर पर नहीं भेजे जाते।'
  },
  rtiAddPoint: { en: 'Add a custom point', hi: 'अपना बिंदु जोड़ें' },
  rtiAdd: { en: 'Add', hi: 'जोड़ें' },
  citePrefix: { en: 'Cites:', hi: 'संदर्भ:' },
  offlineExplanation: {
    en: 'Offline explanation (API unavailable)',
    hi: 'ऑफ़लाइन स्पष्टीकरण (API उपलब्ध नहीं)'
  },
  backupAnswer: { en: 'Answered via backup model', hi: 'बैकअप मॉडल से उत्तर' },
  suggestedQuestions: { en: 'Suggested questions', hi: 'सुझाए गए प्रश्न' },
  placeMatches: { en: 'Place matches', hi: 'स्थान मिलान' }
} as const;

export type StringKey = keyof typeof STRINGS;

export function t(key: StringKey, locale: ExplainLocale): string {
  return STRINGS[key][locale];
}

export function useT(): (key: StringKey) => string {
  const { chatLocale } = useSession();
  return (key: StringKey) => t(key, chatLocale);
}
