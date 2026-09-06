import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement
} from 'react';
import type { IFundingNode, ISchemeScenario } from '../domain/fund-flow';
import { citizenStanding } from '../domain/citizen-standing';
import {
  assembleRtiApplication,
  buildRtiPoints,
  formatFilingChannelLabel,
  replyDueDate,
  resolveRtiAuthority,
  RTI_STATUTORY,
  RTI_TEXT_OF_APPLICATION_LIMIT,
  type IRtiAuthority,
  type IRtiPoint
} from '../domain/rti-request';
import { useT } from '../i18n/strings';
import { CloseIcon } from './ui-icons';

type RtiStep = 'subject' | 'points' | 'details' | 'review';

const STEPS: readonly RtiStep[] = ['subject', 'points', 'details', 'review'];

export function RtiComposer({
  scenario,
  node,
  onClose
}: {
  scenario: ISchemeScenario;
  node: IFundingNode;
  onClose: () => void;
}): ReactElement {
  const t = useT();
  const reconciliation = scenario.reconciliations.find((item) => item.nodeId === node.id);
  const standing = useMemo(() => citizenStanding(scenario, node), [scenario, node]);
  const seedAuthority = useMemo(() => resolveRtiAuthority(scenario, node), [scenario, node]);
  const seedPoints = useMemo(
    () => buildRtiPoints(scenario, node, standing, reconciliation),
    [scenario, node, standing, reconciliation]
  );

  const [step, setStep] = useState<RtiStep>('subject');
  const [authority, setAuthority] = useState<IRtiAuthority>(seedAuthority);
  const [points, setPoints] = useState<readonly IRtiPoint[]>(seedPoints);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    () => new Set(seedPoints.map((point) => point.id))
  );
  const [customDraft, setCustomDraft] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [applicantAddress, setApplicantAddress] = useState('');
  const [isBpl, setIsBpl] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setAuthority(seedAuthority);
    setPoints(seedPoints);
    setSelectedIds(new Set(seedPoints.map((point) => point.id)));
    setStep('subject');
  }, [seedAuthority, seedPoints]);

  const selectedTexts = useMemo(
    () => points.filter((point) => selectedIds.has(point.id)).map((point) => point.text),
    [points, selectedIds]
  );

  const assembled = useMemo(
    () => assembleRtiApplication({
      authority,
      scenario,
      node,
      points: selectedTexts,
      applicantName: applicantName.trim() || undefined,
      applicantAddress: applicantAddress.trim() || undefined,
      isBpl
    }),
    [authority, scenario, node, selectedTexts, applicantName, applicantAddress, isBpl]
  );

  const due = useMemo(() => replyDueDate(), []);
  const stepIndex = STEPS.indexOf(step);

  const togglePoint = useCallback((id: string): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const updatePointText = useCallback((id: string, text: string): void => {
    setPoints((prev) => prev.map((point) => (point.id === id ? { ...point, text } : point)));
  }, []);

  const addCustomPoint = useCallback((): void => {
    const text = customDraft.trim();
    if (!text) return;
    const id = `custom-${Date.now()}`;
    setPoints((prev) => [...prev, { id, text, source: 'base' }]);
    setSelectedIds((prev) => new Set([...prev, id]));
    setCustomDraft('');
  }, [customDraft]);

  const copyDraft = useCallback(async (): Promise<void> => {
    await navigator.clipboard.writeText(assembled.fullText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [assembled.fullText]);

  const downloadDraft = useCallback((): void => {
    const blob = new Blob([assembled.fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `rti-draft-${node.shortName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [assembled.fullText, node.shortName]);

  const printDraft = useCallback((): void => {
    const popup = window.open('', '_blank', 'noopener,noreferrer,width=720,height=900');
    if (!popup) return;
    popup.document.write(
      `<!doctype html><html><head><title>RTI draft</title>`
      + `<style>body{font:14px/1.5 system-ui,sans-serif;padding:24px;white-space:pre-wrap}</style>`
      + `</head><body></body></html>`
    );
    popup.document.body.textContent = assembled.fullText;
    popup.document.close();
    popup.focus();
    popup.print();
  }, [assembled.fullText]);

  const whatsappUrl = useMemo(() => {
    const text = encodeURIComponent(assembled.fullText.slice(0, 1800));
    return `https://wa.me/?text=${text}`;
  }, [assembled.fullText]);

  const goNext = (): void => {
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next);
  };

  const goBack = (): void => {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev);
  };

  return (
    <div className="rti-overlay" role="dialog" aria-modal="true" aria-labelledby="rti-title">
      <div className="rti-card">
        <header className="rti-header">
          <div>
            <p className="rti-kicker">{t('rtiDisclaimer')}</p>
            <h2 id="rti-title">{t('rtiTitle')}</h2>
            <ol className="rti-steps" aria-label="Steps">
              {STEPS.map((entry, index) => (
                <li key={entry} className={index === stepIndex ? 'active' : index < stepIndex ? 'done' : ''}>
                  {t(
                    entry === 'subject'
                      ? 'rtiStepSubject'
                      : entry === 'points'
                        ? 'rtiStepPoints'
                        : entry === 'details'
                          ? 'rtiStepDetails'
                          : 'rtiStepReview'
                  )}
                </li>
              ))}
            </ol>
          </div>
          <button type="button" className="rti-close" onClick={onClose} aria-label={t('rtiClose')}>
            <CloseIcon />
          </button>
        </header>

        <div className="rti-body">
          {step === 'subject' ? (
            <section className="rti-section">
              <p className="rti-meta">
                <strong>{scenario.schemeName}</strong>
                <span>{scenario.period}</span>
                <span>{node.name}</span>
              </p>
              <label className="rti-field">
                <span>Public authority</span>
                <input
                  value={authority.publicAuthority}
                  onChange={(event) => setAuthority({ ...authority, publicAuthority: event.target.value })}
                />
              </label>
              <label className="rti-field">
                <span>PIO designation</span>
                <input
                  value={authority.pioDesignation}
                  onChange={(event) => setAuthority({ ...authority, pioDesignation: event.target.value })}
                />
              </label>
              <label className="rti-field">
                <span>First Appellate Authority</span>
                <input
                  value={authority.appellateDesignation}
                  onChange={(event) => setAuthority({ ...authority, appellateDesignation: event.target.value })}
                />
              </label>
              <p className="rti-hint">
                Filing channel: {formatFilingChannelLabel(authority.filingChannel)}
                {authority.filingUrl ? ` · ${authority.filingUrl}` : ''}
              </p>
            </section>
          ) : null}

          {step === 'points' ? (
            <section className="rti-section">
              <p className="rti-hint">
                Points ask for <strong>records</strong> under Section 2(f) — not opinions or explanations.
              </p>
              <ul className="rti-point-list">
                {points.map((point) => (
                  <li key={point.id}>
                    <label className="rti-point">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(point.id)}
                        onChange={() => togglePoint(point.id)}
                      />
                      <textarea
                        value={point.text}
                        rows={3}
                        onChange={(event) => updatePointText(point.id, event.target.value)}
                        aria-label={`Point ${point.id}`}
                      />
                    </label>
                  </li>
                ))}
              </ul>
              <div className="rti-add-point">
                <input
                  value={customDraft}
                  onChange={(event) => setCustomDraft(event.target.value)}
                  placeholder={t('rtiAddPoint')}
                  aria-label={t('rtiAddPoint')}
                />
                <button type="button" onClick={addCustomPoint} disabled={!customDraft.trim()}>
                  {t('rtiAdd')}
                </button>
              </div>
            </section>
          ) : null}

          {step === 'details' ? (
            <section className="rti-section">
              <p className="rti-hint">{t('rtiLocalOnly')}</p>
              <label className="rti-field">
                <span>{t('rtiName')}</span>
                <input
                  value={applicantName}
                  onChange={(event) => setApplicantName(event.target.value)}
                  autoComplete="name"
                />
              </label>
              <label className="rti-field">
                <span>{t('rtiAddress')}</span>
                <textarea
                  value={applicantAddress}
                  onChange={(event) => setApplicantAddress(event.target.value)}
                  rows={3}
                  autoComplete="street-address"
                />
              </label>
              <label className="rti-check">
                <input
                  type="checkbox"
                  checked={isBpl}
                  onChange={(event) => setIsBpl(event.target.checked)}
                />
                <span>{t('rtiBpl')}</span>
              </label>
            </section>
          ) : null}

          {step === 'review' ? (
            <section className="rti-section rti-review">
              <div className="rti-char-meter" data-over={assembled.exceedsLimit ? 'true' : 'false'}>
                <span>Text of Application</span>
                <strong>
                  {assembled.charCount} / {RTI_TEXT_OF_APPLICATION_LIMIT}
                </strong>
              </div>
              {assembled.exceedsLimit ? (
                <p className="rti-hint warn">
                  Portal field capped at {RTI_TEXT_OF_APPLICATION_LIMIT} characters.
                  Paste the short block into <em>Text of Application</em>, then attach Annexure A.
                </p>
              ) : null}

              <label className="rti-field">
                <span>Subject</span>
                <textarea readOnly value={assembled.subject} rows={2} />
              </label>
              <label className="rti-field">
                <span>Text of Application (paste into portal)</span>
                <textarea readOnly value={assembled.textOfApplication} rows={10} />
              </label>
              {assembled.annexure ? (
                <label className="rti-field">
                  <span>Annexure A</span>
                  <textarea readOnly value={assembled.annexure} rows={8} />
                </label>
              ) : null}

              <div className="rti-filing-guide">
                <h3>How to file</h3>
                {authority.filingChannel === 'rtionline' ? (
                  <ol>
                    <li>Open <a href="https://rtionline.gov.in/" target="_blank" rel="noopener noreferrer">rtionline.gov.in</a> and register / sign in.</li>
                    <li>Choose the public authority closest to: <strong>{authority.publicAuthority}</strong>.</li>
                    <li>Paste <strong>Subject</strong> into the Subject field.</li>
                    <li>Paste <strong>Text of Application</strong> into the Text of Application field (max {RTI_TEXT_OF_APPLICATION_LIMIT} chars).</li>
                    <li>If Annexure A appears above, upload or paste it as an attachment / additional text.</li>
                    <li>
                      Pay Rs {RTI_STATUTORY.feeRupees}
                      {isBpl ? ' (or claim BPL exemption with proof)' : ''}.
                    </li>
                    <li>Save the registration number from the acknowledgement.</li>
                  </ol>
                ) : authority.filingChannel === 'state-portal' ? (
                  <ol>
                    <li>Find your state&apos;s RTI online portal, or prepare a physical application to the PIO.</li>
                    <li>Address it to: <strong>{authority.pioDesignation}</strong>.</li>
                    <li>Attach the full draft (and Annexure A if shown).</li>
                    <li>
                      Include Rs {RTI_STATUTORY.feeRupees} Indian Postal Order / prescribed fee
                      {isBpl ? ', or BPL proof for exemption' : ''}.
                    </li>
                    <li>Keep a dated copy and proof of delivery.</li>
                  </ol>
                ) : (
                  <ol>
                    <li>Print the full draft.</li>
                    <li>Address the envelope / covering letter to: <strong>{authority.pioDesignation}</strong> at <strong>{authority.publicAuthority}</strong>.</li>
                    <li>
                      Enclose Rs {RTI_STATUTORY.feeRupees} IPO (or BPL proof).
                    </li>
                    <li>Send by registered post / speed post and keep the receipt.</li>
                  </ol>
                )}
              </div>

              <div className="rti-tracking">
                <h3>Tracking checklist</h3>
                <ul>
                  <li>Filed on: _______________ (write the date you submit)</li>
                  <li>
                    Reply due by: <strong>{due.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                    {' '}({RTI_STATUTORY.replyDays} days; {RTI_STATUTORY.lifeLibertyHours} hours if life/liberty)
                  </li>
                  <li>{RTI_STATUTORY.deemedRefusalNote}</li>
                  <li>
                    First appeal to {authority.appellateDesignation} within {RTI_STATUTORY.firstAppealDays} days of reply / deemed refusal
                  </li>
                  <li>
                    Second appeal to CIC/SIC within {RTI_STATUTORY.secondAppealDays} days of the first-appeal order
                  </li>
                </ul>
              </div>

              <div className="rti-actions">
                <button type="button" onClick={() => void copyDraft()}>
                  {copied ? 'Copied' : t('rtiCopy')}
                </button>
                <button type="button" onClick={downloadDraft}>{t('rtiDownload')}</button>
                <button type="button" onClick={printDraft}>{t('rtiPrint')}</button>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">{t('rtiWhatsApp')}</a>
              </div>
            </section>
          ) : null}
        </div>

        <footer className="rti-footer">
          {stepIndex > 0 ? (
            <button type="button" className="rti-secondary" onClick={goBack}>{t('rtiBack')}</button>
          ) : (
            <span />
          )}
          {stepIndex < STEPS.length - 1 ? (
            <button
              type="button"
              className="rti-primary"
              onClick={goNext}
              disabled={step === 'points' && selectedTexts.length === 0}
            >
              {t('rtiNext')}
            </button>
          ) : (
            <button type="button" className="rti-secondary" onClick={onClose}>{t('rtiClose')}</button>
          )}
        </footer>
      </div>
    </div>
  );
}
