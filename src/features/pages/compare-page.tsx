import type { ReactElement } from 'react';
import { StaticPage } from '../../components/static-page';
import { useSession } from '../../app/session-context';
import { useT } from '../../i18n/strings';
import type { AppRoute } from '../../app/routing';

export function ComparePage({ onBack }: { onBack: () => void }): ReactElement {
  const t = useT();
  const session = useSession();

  return (
    <StaticPage
      title={session.chatLocale === 'hi' ? 'आज के पोर्टल बनाम ourmoney' : 'Today\'s portals vs ourmoney'}
      lead={
        session.chatLocale === 'hi'
          ? 'डेटा पहले से प्रकाशित है — नागरिक उसे पढ़ नहीं पाते।'
          : 'The data is already published. Citizens still cannot read it.'
      }
      badge="Before / after"
      onBack={onBack}
      backLabel={t('back')}
    >
      <section className="doc-callout">
        <p className="doc-callout-stat">14 clicks · 6 undefined acronyms</p>
        <p>
          That is a realistic path on the public MGNREGA MIS to answer one citizen question:
          <em> “Is the wage FTO stuck, and who still has to sign?”</em>
          ourmoney answers the same shape of question in one plain-language Ask, then opens the
          exact office on the flow map.
        </p>
      </section>

      <div className="compare-grid">
        <article className="compare-card compare-before">
          <h2>Current public MIS journey</h2>
          <ol>
            <li>Open the scheme portal and find the right state / district report tree.</li>
            <li>Drill through nested tables with no data dictionary.</li>
            <li>Meet the same field under two names: <strong>Payment Date</strong> in the Mustroll Report, <strong>Second Signatory Date</strong> in the FTO report.</li>
            <li>Discover that “Payment Date” is not the date the worker was paid.</li>
            <li>Hit historic access limits — the MIS was long available only 6 a.m. to 6 p.m. IST.</li>
            <li>Still cannot compare regions without exporting or scraping.</li>
          </ol>
          <p className="compare-note">
            Documented usability failures of India&apos;s flagship public employment MIS
            (The Hindu; Yale Inclusion Economics / BCURE; The Wire). Viewing public report pages
            is ordinary before/after research — this prototype never probes or scrapes live systems.
          </p>
        </article>

        <article className="compare-card compare-after">
          <h2>ourmoney citizen journey</h2>
          <ol>
            <li>Ask: “Where is the money for roads at Uttar Raital?”</li>
            <li>Read a grounded answer from the synthetic ledger, with citations.</li>
            <li>Open the path on the flow map — see Received / Sent onward / Used here / What&apos;s left.</li>
            <li>When a gap is <em>needs explanation</em>, draft a record-based RTI — not a vague complaint.</li>
          </ol>
          <p className="compare-note">
            Our Rural Works fixtures already model an <strong>FTO pending second signatory</strong> gap —
            the legible version of the confusing real-world report field.
          </p>
          <button
            type="button"
            className="doc-cta"
            onClick={() => session.openExplore({
              schemeId: 'rural-works-guarantee',
              nodeId: 'kharonda'
            })}
          >
            Open the Rural Works demo →
          </button>
        </article>
      </div>

      <section>
        <h2>What we are not claiming</h2>
        <p>
          This is not a live feed of any district. All rupees and places are synthetic.
          The comparison is about <strong>comprehension</strong>: published data versus a citizen-readable layer.
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
