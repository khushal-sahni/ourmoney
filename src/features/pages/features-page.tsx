import type { ReactElement } from 'react';
import { StaticPage } from '../../components/static-page';
import { useSession } from '../../app/session-context';
import { useT } from '../../i18n/strings';

export function FeaturesPage({ onBack }: { onBack: () => void }): ReactElement {
  const t = useT();
  const session = useSession();
  const hi = session.chatLocale === 'hi';

  return (
    <StaticPage
      title={hi ? 'नागरिक क्या कर सकता है' : 'What a citizen can do'}
      lead={hi
        ? 'एक प्रश्न से लेजर तक, फिर अभिलेख अनुरोध तक — पूरा रास्ता।'
        : 'From one question to the ledger to a record request — the full path.'}
      badge="Product"
      onBack={onBack}
      backLabel={t('back')}
    >
      <div className="feature-grid">
        <FeatureCard
          title={hi ? 'साधारण भाषा में पूछें' : 'Ask in plain language'}
          body={hi
            ? 'हिंदी या अंग्रेज़ी में पूछें। जवाब केवल डेमो लेजर से, उद्धरणों के साथ।'
            : 'Ask in Hindi or English. Answers are grounded on the demo ledger with citations.'}
          actionLabel={hi ? 'Ask खोलें' : 'Open Ask'}
          onAction={() => session.setRoute('ask')}
        />
        <FeatureCard
          title={hi ? 'फ्लो मैप' : 'Flow map'}
          body={hi
            ? 'राष्ट्रीय से गाँव तक — कहाँ रुका, कहाँ उपयोग हुआ।'
            : 'National to village — see where funds stopped or were used.'}
          actionLabel={hi ? 'Explore खोलें' : 'Open Explore'}
          onAction={() => session.openExplore({ schemeId: 'water-access', nodeId: 'piprahi-paani' })}
        />
        <FeatureCard
          title={hi ? 'नागरिक समीकरण' : 'Citizen standing equation'}
          body={hi
            ? 'प्राप्त = आगे भेजा + यहाँ उपयोग + बचा। कोई आरोप नहीं।'
            : 'Received = sent onward + used here + what\'s left. No accusations.'}
          actionLabel={hi ? 'जल योजना देखें' : 'See water scheme'}
          onAction={() => session.openExplore({ schemeId: 'water-access', nodeId: 'raital' })}
        />
        <FeatureCard
          title={hi ? 'मेल-मिलाप की स्थिति' : 'Reconciliation statuses'}
          body={hi
            ? 'मिलान, ध्यान दें, स्पष्टीकरण चाहिए — सटीक शब्द।'
            : 'Clear, watch, needs explanation — precise vocabulary only.'}
          actionLabel={hi ? 'गैप वाला नोड' : 'Open a gap node'}
          onAction={() => session.openExplore({ schemeId: 'rural-works-guarantee', nodeId: 'kharonda' })}
        />
        <FeatureCard
          title={hi ? 'साक्ष्य दराज' : 'Evidence drawer'}
          body={hi
            ? 'हर आँकड़े के पीछे समीकरण, हस्तांतरण और स्रोत नोट।'
            : 'Equation, transfers, and source notes behind every figure.'}
          actionLabel={hi ? 'Explore में खोलें' : 'Open in Explore'}
          onAction={() => session.openExplore({ schemeId: 'neighbourhood-health', nodeId: 'piprahi-vhc' })}
        />
        <FeatureCard
          title={hi ? 'आरटीआई कंपोज़र' : 'RTI composer'}
          body={hi
            ? 'अभिलेख माँगें — सही प्राधिकारी, बिंदु, और फाइलिंग गाइड।'
            : 'Request records — right authority, points, and a filing guide.'}
          actionLabel={hi ? 'डेमो पर आरटीआई' : 'Draft RTI on demo'}
          onAction={() => {
            session.openExplore({ schemeId: 'rural-works-guarantee', nodeId: 'kharonda' });
            session.openRti('rural-works-guarantee', 'kharonda');
          }}
        />
        <FeatureCard
          title={hi ? 'हिंदी + आवाज़' : 'Hindi + voice'}
          body={hi
            ? 'पूरा UI भाषा टॉगल; जहाँ ब्राउज़र अनुमति दे, बोलकर पूछें।'
            : 'Full UI language toggle; speak your question where the browser allows.'}
          actionLabel={hi ? 'हिंदी पर स्विच' : 'Switch to Hindi'}
          onAction={() => {
            session.setChatLocale('hi');
            session.setRoute('ask');
          }}
        />
        <FeatureCard
          title={hi ? 'चार योजना आकृतियाँ' : 'Four scheme shapes'}
          body={hi
            ? 'SNA कार्य, मजदूरी माँग, केंद्रीय DBT, मिलान सोसायटी।'
            : 'Works SNA, demand wage, central DBT, matching society.'}
          actionLabel={hi ? 'स्वास्थ्य मिशन' : 'Health mission'}
          onAction={() => session.openExplore({ schemeId: 'neighbourhood-health', nodeId: 'raital' })}
        />
      </div>
    </StaticPage>
  );
}

function FeatureCard({
  title,
  body,
  actionLabel,
  onAction
}: {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}): ReactElement {
  return (
    <article className="feature-card">
      <h2>{title}</h2>
      <p>{body}</p>
      <button type="button" className="doc-cta" onClick={onAction}>{actionLabel}</button>
    </article>
  );
}
