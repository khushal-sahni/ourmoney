import type { ReactElement } from 'react';
import { StaticPage } from '../../components/static-page';
import { useSession } from '../../app/session-context';
import { useT } from '../../i18n/strings';

export function ScalePage({ onBack }: { onBack: () => void }): ReactElement {
  const t = useT();
  const session = useSession();
  const hi = session.chatLocale === 'hi';

  return (
    <StaticPage
      title={hi ? 'वास्तविक डेटा पर कैसे चले' : 'How this runs on real data'}
      lead={hi
        ? 'नया सिस्टम नहीं चाहिए — ये फ़ील्ड सार्वजनिक करने होंगे।'
        : 'This does not need a new system. It needs these fields exposed.'}
      badge="Adapters"
      onBack={onBack}
      backLabel={t('back')}
    >
      <section className="doc-callout">
        <p>
          Production ourmoney is a <strong>citizen-facing layer on PFMS + scheme MIS</strong>,
          not a replacement. Official extracts flow through source adapters into the same canonical
          model the UI already uses.
        </p>
      </section>

      <section>
        <h2>Adapter contract</h2>
        <pre className="doc-code">{`interface IFundFlowSource {
  loadCatalog(): Promise<readonly ISchemeSummary[]>;
  loadScenario(schemeId: string): Promise<ISchemeScenario>;
}`}</pre>
        <p>
          Today <code>SyntheticScenarioSource</code> fills that contract.
          Tomorrow a licensed MGNREGA MIS or PFMS extract adapter can swap in without rewriting Ask, Explore, or reconciliation.
        </p>
      </section>

      <section>
        <h2>Canonical fields ↔ what already exists</h2>
        <div className="doc-table-wrap">
          <table className="doc-table">
            <thead>
              <tr>
                <th>Canonical field</th>
                <th>Likely source today</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Scheme / period</td>
                <td>PFMS scheme codes · MIS programme year</td>
                <td><span className="pill pill-ok">Already published</span></td>
              </tr>
              <tr>
                <td>FundingNode hierarchy</td>
                <td>State → district → block → GP trees in NREGASoft / JJM IMIS</td>
                <td><span className="pill pill-ok">Already published</span></td>
              </tr>
              <tr>
                <td>Transfer amount + date + reference</td>
                <td>PFMS / SNA releases · FTO numbers</td>
                <td><span className="pill pill-ok">Mostly published</span></td>
              </tr>
              <tr>
                <td>Received / reported utilisation</td>
                <td>EAT modules · UC filings</td>
                <td><span className="pill pill-ok">Mostly published</span></td>
              </tr>
              <tr>
                <td>Component (wage / material / admin)</td>
                <td>MGNREGA wage vs material streams</td>
                <td><span className="pill pill-ok">Scheme-specific</span></td>
              </tr>
              <tr>
                <td>usedHerePaise (allowed own spend)</td>
                <td>Admin / contingency lines</td>
                <td><span className="pill pill-watch">Needs clearer citizen extract</span></td>
              </tr>
              <tr>
                <td>unpublishedPaise / unnamed next office</td>
                <td>Often only visible as residual in internal MIS</td>
                <td><span className="pill pill-gap">Needs new disclosure</span></td>
              </tr>
              <tr>
                <td>Reconciliation narrative</td>
                <td>File notings, pending signatory status</td>
                <td><span className="pill pill-gap">Needs new disclosure</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>First post-hackathon adapter target</h2>
        <p>
          <strong>MGNREGA MIS</strong> public expenditure reports at panchayat level — already published —
          after licensing and legal review. No scraping. No reverse-engineering of private APIs.
        </p>
        <button type="button" className="doc-cta" onClick={() => session.setRoute('compare')}>
          See the before / after →
        </button>
      </section>
    </StaticPage>
  );
}
