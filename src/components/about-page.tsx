import type { ReactElement } from 'react';
import { StaticPage } from './static-page';
import { useSession } from '../app/session-context';
import { useT } from '../i18n/strings';

export function AboutPage({ onBack }: { onBack: () => void }): ReactElement {
  const t = useT();
  const session = useSession();
  const hi = session.chatLocale === 'hi';

  return (
    <StaticPage
      title={hi ? 'ईमानदारी और स्रोत' : 'Honesty and provenance'}
      lead={hi
        ? 'स्वतंत्र हैकथॉन प्रोटोटाइप। सरकारी समर्थन का दावा नहीं।'
        : 'Independent hackathon prototype. No government endorsement claimed.'}
      badge="Disclosure"
      onBack={onBack}
      backLabel={t('back')}
    >
      <section>
        <h2>{hi ? 'क्या वास्तविक है / क्या काल्पनिक' : 'What is real / what is mocked'}</h2>
        <div className="doc-table-wrap">
          <table className="doc-table">
            <thead>
              <tr>
                <th>{hi ? 'वस्तु' : 'Item'}</th>
                <th>{hi ? 'स्थिति' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ask + Explore citizen journey</td>
                <td><span className="pill pill-ok">Working</span></td>
              </tr>
              <tr>
                <td>Reconciliation engine + standing equation</td>
                <td><span className="pill pill-ok">Working (unit tested)</span></td>
              </tr>
              <tr>
                <td>RTI composer + filing guide</td>
                <td><span className="pill pill-ok">Working draft only — never auto-files</span></td>
              </tr>
              <tr>
                <td>All rupee amounts, places, transfer refs</td>
                <td><span className="pill pill-gap">Synthetic</span></td>
              </tr>
              <tr>
                <td>PFMS / treasury / scheme MIS connection</td>
                <td><span className="pill pill-gap">None — by design</span></td>
              </tr>
              <tr>
                <td>AI answers</td>
                <td><span className="pill pill-watch">Grounded on demo slice only; template fallback offline</span></td>
              </tr>
              <tr>
                <td>Applicant name / address in RTI flow</td>
                <td><span className="pill pill-ok">Browser-local only</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>{hi ? 'उत्पादन में क्या चाहिए' : 'What production would need'}</h2>
        <ul className="doc-list">
          <li>Licensed official extracts into <code>IFundFlowSource</code> adapters</li>
          <li>Legal review of citizen RTI helpers and authority directories</li>
          <li>Hosted AI with the same no-misconduct system prompt and citation constraints</li>
          <li>Moderated correction channel for nodal officers / RTI volunteers</li>
        </ul>
        <button type="button" className="doc-cta" onClick={() => session.setRoute('scale')}>
          {t('scale')} →
        </button>
      </section>

      <section>
        <h2>AI and safety</h2>
        <p>
          Built with Codex. Product Q&amp;A uses an OpenAI model via OpenRouter on a serverless proxy.
          The model may only cite nodes in the loaded scenario. It must not allege corruption, theft,
          or misconduct — only terms like <em>unreconciled</em>, <em>late report</em>, or
          <em> needs explanation</em>.
        </p>
      </section>

      <section className="about-footer-note">
        <p>
          See also:{' '}
          <button type="button" className="doc-text-link" onClick={() => session.setRoute('compare')}>
            {t('compare')}
          </button>
          {' · '}
          <button type="button" className="doc-text-link" onClick={() => session.setRoute('features')}>
            {t('features')}
          </button>
          . Calibration notes live in <code>docs/SYNTHETIC-CALIBRATION.md</code> in the repository.
        </p>
      </section>
    </StaticPage>
  );
}
