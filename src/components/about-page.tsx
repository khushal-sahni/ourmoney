import type { ReactElement } from 'react';

export function AboutPage({ onBack }: { onBack: () => void }): ReactElement {
  return (
    <main className="about-page">
      <header className="about-header">
        <button type="button" className="about-back" onClick={onBack}>← Back</button>
        <h1>About the data</h1>
        <p>Ask-first citizen entry · Explore flow map · honesty disclosure</p>
      </header>

      <article className="about-content">
        <section>
          <h2>Who this is for</h2>
          <p>
            A citizen who heard that a scheme was sanctioned for their village but cannot tell whether
            reported funds are still at the state nodal account, used here as admin, sent onward to a named
            office, or waiting on a late utilisation report.
          </p>
        </section>

        <section>
          <h2>What is difficult today</h2>
          <ul>
            <li><strong>PFMS</strong> tracks fund flow for agencies; citizens mainly see “Know Your Payment” by bank account, not a walkable scheme tree.</li>
            <li><strong>OpenBudgetsIndia</strong> publishes budget documents — not a continuous last-mile ledger.</li>
            <li><strong>eGramSwaraj / NREGA MIS / JJM IMIS</strong> hold operational detail behind scheme-specific portals and jargon.</li>
          </ul>
        </section>

        <section>
          <h2>What ourmoney changes</h2>
          <p>
            Two modes: <strong>Ask</strong> answers in plain language from the displayed synthetic ledger;
            <strong> Explore</strong> is the full flow map and inspector for citizens who want to poke the tree.
            Reconciliation language never alleges wrongdoing.
          </p>
        </section>

        <section>
          <h2>What is mocked in this build</h2>
          <ul>
            <li>All rupee amounts, place names, and transfer references are <strong>synthetic</strong>.</li>
            <li>No connection to PFMS, treasuries, or scheme MIS portals.</li>
            <li>Information-request drafts are copy-ready text only — nothing is filed automatically.</li>
            <li>Place search uses a fictional gazetteer, not live PIN or constituency lookup.</li>
          </ul>
        </section>

        <section>
          <h2>How this could work at scale</h2>
          <p>
            Production would be a <strong>citizen-facing layer on PFMS + scheme MIS</strong>, not a replacement.
            Official extracts would flow through source adapters into the same canonical model
            (<code>Scheme</code>, <code>FundingNode</code>, <code>Transfer</code>, <code>Reconciliation</code>).
          </p>
          <p>
            First post-hackathon adapter target: <strong>MGNREGA MIS</strong> public expenditure reports
            (panchayat-level, already published) — after licensing and legal review.
          </p>
          <p>
            Updates: district nodal officers or empanelled RTI volunteers submit corrections through a
            moderated form; citizen “mark this work as seen” verification is on the roadmap, not built yet.
          </p>
        </section>

        <section>
          <h2>AI and safety</h2>
          <p>
            Built with Codex. Product Q&amp;A is powered by an OpenAI model via OpenRouter on a serverless proxy.
            The model may only cite nodes present in the loaded scenario. It must not allege corruption, theft,
            or misconduct — only precise terms like <em>unreconciled</em>, <em>late report</em>, or
            <em>needs explanation</em>.
          </p>
        </section>

        <section className="about-footer-note">
          <p>
            Independent hackathon prototype. Not an official government product. No government endorsement implied.
            See SYNTHETIC-CALIBRATION.md in the project repository for calibration sources.
          </p>
        </section>
      </article>
    </main>
  );
}
