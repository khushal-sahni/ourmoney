import type { ReactElement } from 'react';
import { StaticPage } from '../../components/static-page';
import { useSession } from '../../app/session-context';
import { useT } from '../../i18n/strings';
import type { AppRoute } from '../../app/routing';

export function ComparePage({ onBack }: { onBack: () => void }): ReactElement {
  const t = useT();
  const session = useSession();
  const hi = session.chatLocale === 'hi';

  return (
    <StaticPage
      title={hi ? 'आज के पोर्टल बनाम ourmoney' : 'Today\'s portals vs ourmoney'}
      lead={
        hi
          ? 'डेटा पहले से प्रकाशित है — नागरिक उसे पढ़ नहीं पाते।'
          : 'The data is already published. Citizens still cannot read it.'
      }
      badge="Before / after"
      onBack={onBack}
      backLabel={t('back')}
    >
      <section className="doc-callout">
        <p className="doc-callout-stat">
          {hi ? 'दर्जनों रिपोर्ट · दर्जनों कॉलम · कैप्चा हर वापसी पर' : 'Dozens of reports · dozens of columns · captcha on every back'}
        </p>
        <p>
          {hi
            ? 'जनता के लिए खुला ग्रामीण रोज़गार MIS आज भी एजेंसी रिपोर्टों का जंगल है। नीचे VB-G RAM G के सार्वजनिक स्क्रीनशॉट हैं — एक ही सवाल का जवाब ढूँढने का रास्ता।'
            : 'The public rural employment MIS is still a forest of agency reports. Below are public screenshots from VB-G RAM G — the path a citizen walks to answer one question about where reported money went.'}
        </p>
      </section>

      <div className="compare-grid">
        <article className="compare-card compare-before">
          <h2>{hi ? 'आज का सार्वजनिक MIS' : 'Current public MIS journey'}</h2>
          <figure className="compare-shot">
            <img
              src="/compare/mis-reports-index.jpg"
              alt="VB-G RAM G MIS reports index with many nested report categories"
              loading="lazy"
            />
            <figcaption>
              {hi
                ? 'R1–R25+ रिपोर्ट श्रेणियाँ — पहले चुनें कि कौन-सी तालिका।'
                : 'R1–R25+ report categories — pick the right table before you can even look.'}
            </figcaption>
          </figure>
          <figure className="compare-shot">
            <img
              src="/compare/mis-financial-wide.jpg"
              alt="Wide financial performance table with many columns for Uttar Pradesh districts"
              loading="lazy"
            />
            <figcaption>
              {hi
                ? 'ज़िला वित्तीय तालिका — दर्जनों कॉलम, क्षैतिज स्क्रॉल, कोई डेटा डिक्शनरी नहीं।'
                : 'District financial table — dozens of columns, horizontal scroll, no data dictionary.'}
            </figcaption>
          </figure>
          <figure className="compare-shot">
            <img
              src="/compare/mis-nested-zeros.png"
              alt="Agriculture works completed report showing zero values across districts"
              loading="lazy"
            />
            <figcaption>
              {hi
                ? 'एक और ड्रिल-डाउन — शून्य भरी पंक्तियाँ, फिर भी कोई साधारण भाषा स्पष्टीकरण नहीं।'
                : 'Another drill-down — rows of zeros, still no plain-language standing.'}
            </figcaption>
          </figure>
          <ol>
            <li>{hi ? 'कैप्चा पास करें; हर Back पर अक्सर फिर।' : 'Pass a captcha; often again on every Back.'}</li>
            <li>{hi ? 'सही रिपोर्ट श्रेणी खोजें (R1…R25+)।' : 'Find the right report category (R1…R25+).'}</li>
            <li>{hi ? 'राज्य / वर्ष चुनें; चौड़ी तालिका में स्क्रॉल करें।' : 'Pick state / year; scroll a table too wide for a phone.'}</li>
            <li>{hi ? 'कॉलम नाम बिना शब्दकोश के पढ़ें।' : 'Decode column names with no glossary.'}</li>
            <li>{hi ? 'फिर भी “मेरे ब्लॉक पर क्या बचा है?” का एक वाक्य न मिले।' : 'Still no one-sentence answer to “what is left on my block’s ledger?”'}</li>
          </ol>
          <p className="compare-note">
            {hi
              ? 'सार्वजनिक रिपोर्ट पेजों के स्क्रीनशॉट — सामान्य before/after अनुसंधान। यह प्रोटोटाइप लाइव सिस्टम से स्क्रैप या कनेक्ट नहीं करता।'
              : 'Screenshots of publicly viewable report pages — ordinary before/after research. This prototype never scrapes or connects to live systems.'}
          </p>
        </article>

        <article className="compare-card compare-after">
          <h2>{hi ? 'ourmoney नागरिक यात्रा' : 'ourmoney citizen journey'}</h2>
          <figure className="compare-shot">
            <img
              src="/compare/ourmoney-ask.png"
              alt="ourmoney Ask answering where money went for roads at Uttar Raital"
              loading="lazy"
            />
            <figcaption>
              {hi
                ? 'एक साधारण प्रश्न → जवाब + पथ + अभिलेख माँग।'
                : 'One plain question → answer + path + request the records.'}
            </figcaption>
          </figure>
          <figure className="compare-shot">
            <img
              src="/compare/ourmoney-explore.png"
              alt="ourmoney Explore flow map showing Raital district and block offices"
              loading="lazy"
            />
            <figcaption>
              {hi
                ? 'फ्लो मैप — प्राप्त / यहाँ उपयोग / नाम न दिया गया।'
                : 'Flow map — received / used here / not named.'}
            </figcaption>
          </figure>
          <figure className="compare-shot">
            <img
              src="/compare/ourmoney-rti.png"
              alt="ourmoney RTI composer drafting a record request for Bakul Gram Panchayat"
              loading="lazy"
            />
            <figcaption>
              {hi
                ? 'आरटीआई कंपोज़र — सही PIO, अभिलेख बिंदु, स्वतः फाइल नहीं।'
                : 'RTI composer — right PIO, record points, never auto-files.'}
            </figcaption>
          </figure>
          <ol>
            <li>{hi ? 'पूछें: “उत्तर रैतल में सड़कों का पैसा कहाँ?”' : 'Ask: “Where is the money for roads at Uttar Raital?”'}</li>
            <li>{hi ? 'डेमो लेजर से उद्धृत जवाब पढ़ें।' : 'Read a grounded answer from the demo ledger.'}</li>
            <li>{hi ? 'Explore में वही दफ़्तर खोलें।' : 'Open the same office on the flow map.'}</li>
            <li>{hi ? 'गैप पर अभिलेख माँग का मसौदा बनाएँ।' : 'On a gap, draft a record-based RTI — not a vague complaint.'}</li>
          </ol>
          <p className="compare-note">
            {hi
              ? 'सभी रुपये और स्थान काल्पनिक हैं। तुलना समझ की है — प्रकाशन बनाम नागरिक-पठनीय परत।'
              : 'All rupees and places are synthetic. The comparison is about comprehension — publication versus a citizen-readable layer.'}
          </p>
          <button
            type="button"
            className="doc-cta"
            onClick={() => session.openExplore({
              schemeId: 'rural-works-guarantee',
              nodeId: 'kharonda'
            })}
          >
            {hi ? 'Rural Works डेमो खोलें →' : 'Open the Rural Works demo →'}
          </button>
        </article>
      </div>

      <section>
        <h2>{hi ? 'हम क्या दावा नहीं करते' : 'What we are not claiming'}</h2>
        <p>
          {hi
            ? 'यह किसी जिले का लाइव फीड नहीं है। VB-G RAM G / NREGA पोर्टल के स्क्रीनशॉट केवल “पहले” की कठिनाई दिखाने के लिए हैं।'
            : 'This is not a live feed of any district. VB-G RAM G / NREGA portal screenshots only illustrate the “before” difficulty.'}
        </p>
        <div className="doc-inline-links">
          <NavLink label={t('features')} route="features" />
          <NavLink label={t('scale')} route="scale" />
          <NavLink label={t('about')} route="about" />
        </div>
      </section>
    </StaticPage>
  );
}

function NavLink({ label, route }: { label: string; route: AppRoute }): ReactElement {
  const session = useSession();
  return (
    <button type="button" className="doc-text-link" onClick={() => session.setRoute(route)}>
      {label} →
    </button>
  );
}
