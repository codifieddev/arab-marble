'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';

interface ARToolSectionProps {
  block: PageBlock;
  locale?: string;
  localePrefix?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

function parseIfJson(val: any): any {
  if (!val) return val;
  if (typeof val === 'object' && 'type' in val && 'value' in val) {
    val = val.value;
  }
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}

export default function ARToolSection({ block, locale = 'en', localePrefix = '', isEditable = false, onSave }: ARToolSectionProps) {
  const props = block.props || {};
  const stepsList: any[] = (() => {
    const parsed = parseIfJson(props.steps);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') return Object.values(parsed);
    return [];
  })();
  const [waist, setWaist] = useState('');
  const [length, setLength] = useState('');
  const [result, setResult] = useState<{ size: string; lengths: string } | null>(null);
  const [camActive, setCamActive] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [scanY, setScanY] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number | null>(null);

  const calcSize = useCallback(() => {
    const w = parseFloat(waist);
    if (!w || w < 5) { setResult(null); return; }
    let size: string, lengths: string;
    if (w >= 9 && w <= 12) { size = 'Extra Small (XS)'; lengths = '10" – 12"'; }
    else if (w >= 13 && w <= 16) { size = 'Small (SM)'; lengths = '12" – 16"'; }
    else if (w >= 17 && w <= 21) { size = 'Medium (MED)'; lengths = '14" – 18"'; }
    else if (w < 9) { size = 'Too Small'; lengths = 'Contact us'; }
    else { size = 'Too Large'; lengths = 'Contact us'; }
    setResult({ size, lengths });
  }, [waist]);

  useEffect(() => { calcSize(); }, [calcSize]);

  useEffect(() => {
    if (!demoMode) return;
    let y = 0, dir = 1;
    const animate = () => {
      y += 1.5 * dir;
      if (y >= 300) dir = -1;
      if (y <= 10) dir = 1;
      setScanY(y);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [demoMode]);

  const toggleCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setCamActive(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCamActive(true);
      setDemoMode(false);
    } catch {
      setDemoMode(true);
      setCamActive(false);
    }
  };

  const toggleDemo = () => {
    setDemoMode(d => !d);
    if (camActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
      }
      setCamActive(false);
    }
  };

  const headingField = props.heading ? 'props.heading' : 'props.title';
  const headingVal = t(props.heading, locale) || t(props.title, locale) || 'Find the Perfect Fit with AR Preview';

  return (
    <section className="ar-wrapper" style={{ padding: 'clamp(48px, 8vw, 80px) 0', background: 'var(--accent-soft)' }} id="ar-tool">
      <div style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none',
      }} />
      <div className="ar-inner" style={{
        maxWidth: 'var(--container)', margin: '0 auto', padding: '0 28px', position: 'relative', zIndex: 2,
      }}>
        <div>
          <div className="sec-tag whitespace-pre-wrap w-full" style={{ marginBottom: 16 }}>
            {onSave && isEditable ? (
              <EditableText
                value={t(props.tag, locale) || 'SMART SIZING'}
                onSave={(val) => onSave(block.id, 'props.tag', val)}
                isEditable={isEditable}
                className="block w-full"
                placeholder="Tag text..."
              />
            ) : (
              <span>{t(props.tag, locale) || 'SMART SIZING'}</span>
            )}
          </div>
          <h2 className="whitespace-pre-wrap w-full" style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(30px, 4vw, 50px)', color: 'var(--text)', lineHeight: 1.1, marginBottom: 18 }}>
            {onSave && isEditable ? (
              <EditableText
                value={headingVal}
                onSave={(val) => onSave(block.id, headingField, val)}
                isEditable={isEditable}
                multiline={true}
                className="block w-full"
                placeholder="Title..."
              />
            ) : (
              headingVal ? (
                <span>{headingVal}</span>
              ) : (
                <>Find the Perfect Fit with <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>AR Preview</em></>
              )
            )}
          </h2>
          <div className="whitespace-pre-wrap w-full" style={{ marginBottom: 28 }}>
            {onSave && isEditable ? (
              <EditableText
                value={t(props.subheading, locale) || 'Not sure which size fits your dog? Use our interactive AR Size Tool — point your camera at your dog and our guide overlays exactly where to measure.'}
                onSave={(val) => onSave(block.id, 'props.subheading', val)}
                isEditable={isEditable}
                multiline={true}
                className="block w-full"
                placeholder="Subheading..."
              />
            ) : (
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>
                {t(props.subheading, locale) || 'Not sure which size fits your dog? Use our interactive AR Size Tool — point your camera at your dog and our guide overlays exactly where to measure.'}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {stepsList.map((step: any, i: number) => {
              const stepTitle = t(step.title, locale) || '';
              const stepText = t(step.text, locale) || '';
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 16,
                  background: 'var(--white)', borderRadius: 'var(--radius-md)',
                  padding: '20px 22px', border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)',
                    color: 'white', fontSize: 13, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 2,
                  }}>{step.number ?? (i + 1)}</div>
                  {onSave && isEditable ? (
                    <div className="whitespace-pre-wrap w-full" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <EditableText
                        value={stepTitle}
                        onSave={(val) => onSave(block.id, `props.steps.${i}.title`, val)}
                        isEditable={isEditable}
                        className="block w-full font-bold text-[16px] text-[var(--text)]"
                        placeholder="Step title..."
                      />
                      <EditableText
                        value={stepText}
                        onSave={(val) => onSave(block.id, `props.steps.${i}.text`, val)}
                        isEditable={isEditable}
                        multiline={true}
                        className="block w-full text-[15px] text-[var(--text-secondary)]"
                        placeholder="Step text..."
                      />
                    </div>
                  ) : (
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 15,
                      margin: 0,
                      lineHeight: 1.75,
                      color: 'var(--text-secondary)',
                    }}>
                      {stepTitle && (
                        <strong style={{ fontWeight: 700, color: 'var(--text)', fontSize: 16 }}>
                          {stepTitle}{' '}
                        </strong>
                      )}
                      <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>
                        {stepText}
                      </span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <button onClick={toggleCamera} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 3l-4 4-4-4M8 21v-2M16 21v-2" />
            </svg>
            {onSave && isEditable ? (
              <EditableText
                value={t(props.launchButtonText, locale) || 'Launch AR Camera'}
                onSave={(val) => onSave(block.id, 'props.launchButtonText', val)}
                isEditable={isEditable}
                placeholder="Button text..."
              />
            ) : (
              camActive ? (t(props.stopButtonText, locale) || 'Stop Camera') : (t(props.launchButtonText, locale) || 'Launch AR Camera')
            )}
          </button>
        </div>

        <div style={{
          background: 'var(--white)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px', background: 'var(--background)', borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)' }}>
              {onSave && isEditable ? (
                <EditableText
                  value={t(props.widgetTitle, locale) || 'PeeKeeper AR Size Finder'}
                  onSave={(val) => onSave(block.id, 'props.widgetTitle', val)}
                  isEditable={isEditable}
                  placeholder="Widget Title..."
                />
              ) : (
                <span>{t(props.widgetTitle, locale) || 'PeeKeeper AR Size Finder'}</span>
              )}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
            </div>
          </div>

          <div id="arViewport" style={{
            position: 'relative', height: 'clamp(200px, 50vw, 320px)',
            background: demoMode ? 'linear-gradient(135deg, var(--background) 0%, var(--accent-soft) 50%, var(--border) 100%)' : 'var(--background)',
            overflow: 'hidden',
          }}>
            <video ref={videoRef} style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', zIndex: 1, display: camActive ? 'block' : 'none',
            }} autoPlay muted playsInline />

            {!camActive && !demoMode && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
                  <svg width="60" height="60" fill="none" stroke="var(--accent)" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 3l-4 4-4-4M8 21v-2M16 21v-2" />
                  </svg>
                  {onSave && isEditable ? (
                    <EditableText
                      value={t(props.instructionText, locale) || 'Click "Launch AR Camera" to begin or enter measurements manually below'}
                      onSave={(val) => onSave(block.id, 'props.instructionText', val)}
                      isEditable={isEditable}
                      multiline={true}
                      className="block text-center text-[13px] text-[var(--text-muted)]"
                      placeholder="Instructions..."
                    />
                  ) : (
                    <p style={{ fontSize: 13, margin: 0, whiteSpace: 'pre-line' }}>
                      {t(props.instructionText, locale) || (
                        <>Click &quot;Launch AR Camera&quot; to begin<br />or enter measurements manually below</>
                      )}
                    </p>
                  )}
                </div>
              </div>
            )}

            {(camActive || demoMode) && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
                <svg viewBox="0 0 540 320" style={{ width: '100%', height: '100%' }}>
                  <ellipse cx="270" cy="190" rx="140" ry="75" fill="none" stroke="rgba(45,106,79,0.2)" strokeWidth="1.5" strokeDasharray="8,5" />
                  <path className="ar-line" d="M210 170 Q270 145 330 170" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeDasharray="6,4" />
                  <circle cx="210" cy="170" r="5" fill="var(--primary)" className="ar-line" />
                  <circle cx="330" cy="170" r="5" fill="var(--primary)" className="ar-line" />
                  <rect x="230" y="132" width="82" height="24" rx="5" fill="var(--primary)" />
                  <text x="271" y="149" textAnchor="middle" fill="white" fontSize="11" fontFamily="Nunito,sans-serif" fontWeight="700">WAIST</text>
                  <line x1="210" y1="165" x2="210" y2="178" stroke="var(--primary)" strokeWidth="2" className="ar-line" />
                  <line x1="330" y1="165" x2="330" y2="178" stroke="var(--primary)" strokeWidth="2" className="ar-line" />
                  <line className="ar-line" x1="150" y1="190" x2="385" y2="190" stroke="var(--secondary)" strokeWidth="2.5" strokeDasharray="6,4" />
                  <circle cx="150" cy="190" r="5" fill="var(--secondary)" className="ar-line" />
                  <circle cx="385" cy="190" r="5" fill="var(--secondary)" className="ar-line" />
                  <rect x="228" y="196" width="84" height="24" rx="5" fill="var(--secondary)" />
                  <text x="270" y="213" textAnchor="middle" fill="white" fontSize="11" fontFamily="Nunito,sans-serif" fontWeight="700">LENGTH</text>
                  <line x1="150" y1="183" x2="150" y2="200" stroke="var(--secondary)" strokeWidth="2" className="ar-line" />
                  <line x1="385" y1="183" x2="385" y2="200" stroke="var(--secondary)" strokeWidth="2" className="ar-line" />
                  <path d="M30 30 L30 60 M30 30 L60 30" fill="none" stroke="rgba(45,106,79,0.3)" strokeWidth="2" />
                  <path d="M510 30 L510 60 M510 30 L480 30" fill="none" stroke="rgba(45,106,79,0.3)" strokeWidth="2" />
                  <path d="M30 290 L30 260 M30 290 L60 290" fill="none" stroke="rgba(45,106,79,0.3)" strokeWidth="2" />
                  <path d="M510 290 L510 260 M510 290 L480 290" fill="none" stroke="rgba(45,106,79,0.3)" strokeWidth="2" />
                  {demoMode && (
                    <line x1="0" y1={scanY} x2="540" y2={scanY} stroke="rgba(45,106,79,0.3)" strokeWidth="1.5" />
                  )}
                </svg>
              </div>
            )}
          </div>

          <div style={{ padding: 'clamp(12px, 2vw, 18px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <style>{`@media (max-width:600px){.ar-input-grid{grid-template-columns:1fr!important}}`}</style>
            <div className="ar-input-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  {onSave && isEditable ? (
                    <EditableText
                      value={t(props.waistLabel, locale) || 'Waist (inches)'}
                      onSave={(val) => onSave(block.id, 'props.waistLabel', val)}
                      isEditable={isEditable}
                      placeholder="Waist label..."
                    />
                  ) : (
                    t(props.waistLabel, locale) || 'Waist (inches)'
                  )}
                </label>
                <input
                  type="number"
                  placeholder={t(props.waistPlaceholder, locale) || 'e.g. 14'}
                  min={5}
                  max={30}
                  value={waist}
                  onChange={e => setWaist(e.target.value)}
                  style={{ background: 'var(--input-bg)', border: '1.5px solid var(--input-border)', borderRadius: 'var(--radius-sm)', padding: '9px 13px', color: 'var(--input-text)', fontSize: 14, fontWeight: 600, outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  {onSave && isEditable ? (
                    <EditableText
                      value={t(props.lengthLabel, locale) || 'Length (inches)'}
                      onSave={(val) => onSave(block.id, 'props.lengthLabel', val)}
                      isEditable={isEditable}
                      placeholder="Length label..."
                    />
                  ) : (
                    t(props.lengthLabel, locale) || 'Length (inches)'
                  )}
                </label>
                <input
                  type="number"
                  placeholder={t(props.lengthPlaceholder, locale) || 'e.g. 15'}
                  min={8}
                  max={25}
                  value={length}
                  onChange={e => setLength(e.target.value)}
                  style={{ background: 'var(--input-bg)', border: '1.5px solid var(--input-border)', borderRadius: 'var(--radius-sm)', padding: '9px 13px', color: 'var(--input-text)', fontSize: 14, fontWeight: 600, outline: 'none' }}
                />
              </div>
            </div>

            {result && (
              <div style={{
                background: 'rgba(45,106,79,0.08)', border: '1px solid rgba(45,106,79,0.2)',
                borderRadius: 'var(--radius-sm)', padding: '12px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 3 }}>
                    {onSave && isEditable ? (
                      <EditableText
                        value={t(props.recommendedSizeLabel, locale) || 'Recommended Size'}
                        onSave={(val) => onSave(block.id, 'props.recommendedSizeLabel', val)}
                        isEditable={isEditable}
                        placeholder="Recommended Size label..."
                      />
                    ) : (
                      t(props.recommendedSizeLabel, locale) || 'Recommended Size'
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, color: 'var(--primary)' }}>{result.size}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 3 }}>
                    {onSave && isEditable ? (
                      <EditableText
                        value={t(props.availableLengthsLabel, locale) || 'Available Lengths'}
                        onSave={(val) => onSave(block.id, 'props.availableLengthsLabel', val)}
                        isEditable={isEditable}
                        placeholder="Available Lengths label..."
                      />
                    ) : (
                      t(props.availableLengthsLabel, locale) || 'Available Lengths'
                    )}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{result.lengths}</div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={toggleCamera} className="btn-primary flex-1" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 3l-4 4-4-4" />
                </svg>
                {onSave && isEditable ? (
                  <EditableText
                    value={t(props.startText, locale) || 'Start'}
                    onSave={(val) => onSave(block.id, 'props.startText', val)}
                    isEditable={isEditable}
                    placeholder="Start text..."
                  />
                ) : (
                  camActive ? (t(props.stopText, locale) || 'Stop') : (t(props.startText, locale) || 'Start')
                )}
              </button>
              <button onClick={toggleDemo} className="btn-outline flex-1" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {onSave && isEditable ? (
                  <EditableText
                    value={t(props.showDemoText, locale) || 'Show Demo'}
                    onSave={(val) => onSave(block.id, 'props.showDemoText', val)}
                    isEditable={isEditable}
                    placeholder="Show Demo text..."
                  />
                ) : (
                  demoMode ? (t(props.hideDemoText, locale) || 'Hide Demo') : (t(props.showDemoText, locale) || 'Show Demo')
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
