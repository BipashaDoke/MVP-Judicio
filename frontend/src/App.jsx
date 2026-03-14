import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
];

// ─── Shared helpers ──────────────────────────────────────────────────────────
const getRiskColor = (risk) => {
  const r = risk?.toLowerCase() || '';
  if (r.includes('high') || r.includes('उच्च') || r.includes('जास्त'))
    return 'bg-red-500/20 text-red-300 border-red-500/40';
  if (r.includes('medium') || r.includes('मध्यम'))
    return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  if (r.includes('low') || r.includes('कमी'))
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
};

// ─── Animated background particles ───────────────────────────────────────────
const ParticleBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div style={{
      position:'absolute', inset:0,
      background:'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%)'
    }}/>
    <div style={{
      position:'absolute', inset:0,
      background:'radial-gradient(ellipse 60% 50% at 80% 80%, rgba(16,185,129,0.10) 0%, transparent 70%)'
    }}/>
    {[...Array(22)].map((_, i) => (
      <div key={i} style={{
        position:'absolute',
        width: `${2 + (i % 4)}px`,
        height: `${2 + (i % 4)}px`,
        borderRadius:'50%',
        background: i % 3 === 0 ? 'rgba(99,102,241,0.5)' : i % 3 === 1 ? 'rgba(16,185,129,0.4)' : 'rgba(251,191,36,0.35)',
        top: `${(i * 37 + 11) % 100}%`,
        left: `${(i * 53 + 7) % 100}%`,
        animation: `floatDot ${6 + (i % 5)}s ease-in-out ${i * 0.4}s infinite alternate`,
        filter:'blur(0.5px)'
      }}/>
    ))}
    <style>{`
      @keyframes floatDot {
        0%   { transform: translateY(0px) translateX(0px); opacity:0.4; }
        100% { transform: translateY(-22px) translateX(10px); opacity:1; }
      }
    `}</style>
  </div>
);

// ─── Navigation ───────────────────────────────────────────────────────────────
const Navbar = ({ i18n, t }) => {
  const location = useLocation();
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/analyze', label: 'Analyze' },
    { to: '/about', label: 'About' },
    { to: '/how-it-works', label: 'How It Works' },
  ];
  return (
    <header style={{
      position:'sticky', top:0, zIndex:50,
      background:'rgba(10,10,30,0.82)',
      backdropFilter:'blur(18px)',
      borderBottom:'1px solid rgba(99,102,241,0.18)',
      boxShadow:'0 2px 32px rgba(0,0,0,0.4)'
    }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:68 }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:42, height:42,
            background:'linear-gradient(135deg,#6366f1,#10b981)',
            borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 18px rgba(99,102,241,0.5)',
            fontSize:20
          }}>⚖️</div>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:20, color:'#e2e8f0', letterSpacing:'-0.5px' }}>
              {t('appName')}
            </div>
            <div style={{ fontSize:10, color:'#6366f1', letterSpacing:2, textTransform:'uppercase', marginTop:-2 }}>
              {t('appTagline')}
            </div>
          </div>
        </Link>

        {/* Nav links */}
        <nav style={{ display:'flex', gap:4, alignItems:'center' }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              padding:'7px 16px', borderRadius:8, fontSize:14, fontWeight:500,
              color: location.pathname === link.to ? '#fff' : '#94a3b8',
              background: location.pathname === link.to ? 'rgba(99,102,241,0.25)' : 'transparent',
              border: location.pathname === link.to ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
              textDecoration:'none', transition:'all .2s',
            }}>{link.label}</Link>
          ))}
        </nav>

        {/* Language Selector */}
        <select
          value={i18n.language}
          onChange={e => i18n.changeLanguage(e.target.value)}
          style={{
            background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.35)',
            color:'#c7d2fe', borderRadius:8, padding:'7px 12px', fontSize:13,
            cursor:'pointer', outline:'none'
          }}
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code} style={{ background:'#1e1b4b' }}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
};

// ─── Home / Landing Page ──────────────────────────────────────────────────────
const HomePage = ({ t }) => {
  const navigate = useNavigate();
  const stats = [
    { value: '50K+', label: 'Documents Analyzed' },
    { value: '99.2%', label: 'Accuracy Rate' },
    { value: '3', label: 'Languages Supported' },
    { value: '<30s', label: 'Avg. Analysis Time' },
  ];
  const features = [
    { icon: '🔍', title: 'AI-Powered Extraction', desc: 'Automatically extracts case numbers, parties, dates, and judgments using advanced LLM technology.' },
    { icon: '🌐', title: 'Multilingual Support', desc: 'Full support for English, Hindi, and Marathi — results in your preferred language.' },
    { icon: '⚠️', title: 'Risk Assessment', desc: 'Instantly identifies high, medium, and low risk factors from legal documents.' },
    { icon: '📅', title: 'Timeline View', desc: 'Visual chronological timeline of all important dates and legal events.' },
    { icon: '📋', title: 'Plain Language Summary', desc: 'Complex legal jargon translated into citizen-friendly explanations.' },
    { icon: '🔒', title: 'Secure Processing', desc: 'Documents processed securely — never stored or shared.' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={{ textAlign:'center', padding:'100px 24px 80px', position:'relative' }}>
        <div style={{
          display:'inline-block', padding:'6px 18px', borderRadius:20,
          background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.35)',
          color:'#a5b4fc', fontSize:12, letterSpacing:3, textTransform:'uppercase',
          marginBottom:28, fontWeight:600
        }}>AI Legal Intelligence Platform</div>

        <h1 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:'clamp(42px, 6vw, 80px)',
          fontWeight:700, lineHeight:1.1,
          background:'linear-gradient(135deg, #e2e8f0 0%, #a5b4fc 40%, #34d399 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          marginBottom:24, letterSpacing:'-2px'
        }}>
          Understand Any<br/>Legal Document
        </h1>

        <p style={{ color:'#94a3b8', fontSize:18, maxWidth:560, margin:'0 auto 48px', lineHeight:1.7 }}>
          Upload a court order or legal PDF and get an instant AI-powered analysis — 
          case details, timelines, risk flags, and plain-language summaries.
        </p>

        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
          <button
            onClick={() => navigate('/analyze')}
            style={{
              padding:'16px 40px', borderRadius:12, fontSize:16, fontWeight:700,
              background:'linear-gradient(135deg,#6366f1,#4f46e5)',
              color:'#fff', border:'none', cursor:'pointer',
              boxShadow:'0 0 32px rgba(99,102,241,0.5)',
              transition:'all .2s', letterSpacing:.5
            }}
            onMouseOver={e => e.currentTarget.style.transform='scale(1.04)'}
            onMouseOut={e => e.currentTarget.style.transform='scale(1)'}
          >
            ⚡ Analyze a Document
          </button>
          <button
            onClick={() => navigate('/how-it-works')}
            style={{
              padding:'16px 40px', borderRadius:12, fontSize:16, fontWeight:600,
              background:'transparent', color:'#a5b4fc',
              border:'1px solid rgba(99,102,241,0.4)', cursor:'pointer', transition:'all .2s'
            }}
            onMouseOver={e => { e.currentTarget.style.background='rgba(99,102,241,0.1)'; e.currentTarget.style.transform='scale(1.04)'; }}
            onMouseOut={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='scale(1)'; }}
          >
            Learn How It Works →
          </button>
        </div>

        {/* Glow orb */}
        <div style={{
          position:'absolute', top:'30%', left:'50%', transform:'translate(-50%,-50%)',
          width:500, height:300, borderRadius:'50%',
          background:'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)',
          pointerEvents:'none', zIndex:-1
        }}/>
      </section>

      {/* Stats */}
      <section style={{ padding:'0 24px 80px' }}>
        <div style={{
          maxWidth:900, margin:'0 auto',
          display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background:'rgba(255,255,255,0.03)',
              border:'1px solid rgba(99,102,241,0.2)',
              borderRadius:16, padding:'28px 20px', textAlign:'center',
              backdropFilter:'blur(8px)',
              transition:'transform .2s, box-shadow .2s'
            }}
              onMouseOver={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(99,102,241,0.2)'; }}
              onMouseOut={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
            >
              <div style={{
                fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:700,
                background:'linear-gradient(135deg,#a5b4fc,#34d399)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'
              }}>{s.value}</div>
              <div style={{ color:'#64748b', fontSize:13, marginTop:6, letterSpacing:.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding:'0 24px 100px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <h2 style={{
            fontFamily:"'Playfair Display',serif", textAlign:'center',
            fontSize:'clamp(28px,4vw,44px)', fontWeight:700,
            color:'#e2e8f0', marginBottom:16
          }}>Everything You Need</h2>
          <p style={{ textAlign:'center', color:'#64748b', marginBottom:60, fontSize:16 }}>
            Comprehensive legal document intelligence in one platform
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background:'rgba(255,255,255,0.02)',
                border:'1px solid rgba(99,102,241,0.15)',
                borderRadius:20, padding:'28px 24px',
                transition:'all .25s',
                position:'relative', overflow:'hidden'
              }}
                onMouseOver={e => {
                  e.currentTarget.style.background='rgba(99,102,241,0.08)';
                  e.currentTarget.style.borderColor='rgba(99,102,241,0.4)';
                  e.currentTarget.style.transform='translateY(-4px)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background='rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor='rgba(99,102,241,0.15)';
                  e.currentTarget.style.transform='';
                }}
              >
                <div style={{ fontSize:32, marginBottom:14 }}>{f.icon}</div>
                <div style={{ fontWeight:600, fontSize:17, color:'#e2e8f0', marginBottom:8 }}>{f.title}</div>
                <div style={{ color:'#64748b', fontSize:14, lineHeight:1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// ─── Analyze Page ─────────────────────────────────────────────────────────────
const AnalyzePage = ({ t, i18n }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const getLocalizedText = useCallback((field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    const langMap = { en: 'english', hi: 'hindi', mr: 'marathi' };
    const key = langMap[i18n.language] || i18n.language;
    return field[key] || field.english || Object.values(field)[0] || '';
  }, [i18n.language]);

  const handleDrag = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const f = e.dataTransfer.files[0];
      if (f.type === 'application/pdf') { setFile(f); setError(''); }
      else setError(t('invalidFileType'));
    }
  }, [t]);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      if (f.type === 'application/pdf') { setFile(f); setError(''); }
      else setError(t('invalidFileType'));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setLoadingMessage(t('analyzingDocument'));
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      setLoadingMessage(t('extractingText'));
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
      });
      setLoadingMessage(t('processingAI'));
      setTimeout(() => { setResult(response.data); setLoading(false); }, 1000);
    } catch (err) {
      setLoading(false);
      if (err.response) setError(err.response.data.detail || t('processError'));
      else if (err.request) setError('Network error. Please check if the backend is running.');
      else setError(err.message || t('processError'));
    }
  };

  const resetAnalysis = () => { setFile(null); setResult(null); setError(''); };

  if (result) {
    return (
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px 24px' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
          <div>
            <div style={{ color:'#10b981', fontSize:13, letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>✓ Analysis Complete</div>
            <h2 style={{
              fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:700,
              background:'linear-gradient(90deg,#e2e8f0,#a5b4fc)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', margin:0
            }}>{t('analysisComplete')}</h2>
          </div>
          <button onClick={resetAnalysis} style={{
            padding:'10px 22px', borderRadius:10, background:'rgba(255,255,255,0.05)',
            border:'1px solid rgba(255,255,255,0.12)', color:'#94a3b8',
            cursor:'pointer', fontSize:14, transition:'all .2s'
          }}
            onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
            onMouseOut={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
          >+ {t('newAnalysis')}</button>
        </div>

        {/* Case + Parties */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          {[
            {
              label: t('caseNumber'), accent:'#6366f1',
              content: <div style={{
                fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700,
                color:'#a5b4fc', marginTop:4
              }}>{result.case_number || result.caseNumber || 'N/A'}</div>
            },
            {
              label: t('parties'), accent:'#10b981',
              content: (
                <div style={{ marginTop:4 }}>
                  {result.parties?.petitioner && <p style={{ color:'#94a3b8', fontSize:14, margin:'4px 0' }}><span style={{ color:'#34d399', fontWeight:600 }}>Petitioner:</span> {result.parties.petitioner}</p>}
                  {result.parties?.respondent && <p style={{ color:'#94a3b8', fontSize:14, margin:'4px 0' }}><span style={{ color:'#f59e0b', fontWeight:600 }}>Respondent:</span> {result.parties.respondent}</p>}
                </div>
              )
            }
          ].map((card, i) => (
            <div key={i} style={{
              background:'rgba(255,255,255,0.03)', border:`1px solid ${card.accent}33`,
              borderRadius:16, padding:'24px', position:'relative', overflow:'hidden'
            }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${card.accent},transparent)` }}/>
              <div style={{ fontSize:12, color:'#64748b', letterSpacing:2, textTransform:'uppercase', marginBottom:8 }}>{card.label}</div>
              {card.content}
            </div>
          ))}
        </div>

        {/* Judgment + Risk Tags */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:16, padding:24 }}>
            <div style={{ fontSize:12, color:'#64748b', letterSpacing:2, textTransform:'uppercase', marginBottom:12 }}>{t('judgmentOutcome')}</div>
            <p style={{ color:'#cbd5e1', lineHeight:1.7, margin:0 }}>{getLocalizedText(result.judgment_outcome) || getLocalizedText(result.judgmentOutcome) || 'N/A'}</p>
          </div>
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:16, padding:24 }}>
            <div style={{ fontSize:12, color:'#64748b', letterSpacing:2, textTransform:'uppercase', marginBottom:12 }}>{t('riskTags')}</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {result.risk_tags?.map((tag, i) => {
                const display = typeof tag === 'object' ? getLocalizedText(tag) : tag;
                return (
                  <span key={i} style={{
                    padding:'5px 14px', borderRadius:20, fontSize:13, fontWeight:600,
                    border:'1px solid', ...getRiskColorObj(display)
                  }}>{display}</span>
                );
              })}
              {(!result.risk_tags || result.risk_tags.length === 0) && <span style={{ color:'#475569' }}>No risk tags detected</span>}
            </div>
          </div>
        </div>

        {/* Timeline */}
        {result.important_dates?.length > 0 && (
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:16, padding:28, marginBottom:16 }}>
            <div style={{ fontSize:12, color:'#64748b', letterSpacing:2, textTransform:'uppercase', marginBottom:24 }}>{t('timeline')}</div>
            <div style={{ position:'relative' }}>
              <div style={{ position:'absolute', left:12, top:0, bottom:0, width:2, background:'linear-gradient(to bottom,#6366f1,#10b981,transparent)' }}/>
              {result.important_dates.map((item, i) => (
                <div key={i} style={{ display:'flex', gap:24, paddingLeft:36, marginBottom:20, position:'relative', alignItems:'flex-start' }}>
                  <div style={{
                    position:'absolute', left:6, top:4,
                    width:14, height:14, borderRadius:'50%',
                    background:'linear-gradient(135deg,#6366f1,#10b981)',
                    boxShadow:'0 0 8px rgba(99,102,241,0.6)', border:'2px solid #0f172a'
                  }}/>
                  <div style={{ minWidth:110, fontWeight:600, fontSize:14, color:'#a5b4fc' }}>{item.date}</div>
                  <div style={{ color:'#94a3b8', fontSize:14, lineHeight:1.6 }}>{getLocalizedText(item.description)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legal Directions */}
        {result.legal_directions?.length > 0 && (
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:16, padding:28, marginBottom:16 }}>
            <div style={{ fontSize:12, color:'#64748b', letterSpacing:2, textTransform:'uppercase', marginBottom:18 }}>{t('legalDirections')}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {result.legal_directions.map((dir, i) => (
                <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                  <span style={{ color:'#10b981', marginTop:2, flexShrink:0 }}>✓</span>
                  <span style={{ color:'#cbd5e1', fontSize:14, lineHeight:1.65 }}>{getLocalizedText(dir)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Professional Summary */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:16, padding:28, marginBottom:16 }}>
          <div style={{ fontSize:12, color:'#64748b', letterSpacing:2, textTransform:'uppercase', marginBottom:14 }}>{t('professionalSummary')}</div>
          <p style={{ color:'#94a3b8', lineHeight:1.8, margin:0 }}>{getLocalizedText(result.professional_summary) || getLocalizedText(result.professionalSummary) || 'No summary available'}</p>
        </div>

        {/* Citizen Explanation */}
        <div style={{
          background:'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(16,185,129,0.06))',
          border:'1px solid rgba(99,102,241,0.25)', borderRadius:16, padding:28, marginBottom:24
        }}>
          <div style={{ fontSize:12, color:'#64748b', letterSpacing:2, textTransform:'uppercase', marginBottom:14 }}>{t('citizenExplanation')}</div>
          <p style={{ color:'#cbd5e1', lineHeight:1.8, margin:0 }}>{getLocalizedText(result.citizen_explanation) || getLocalizedText(result.citizenExplanation) || 'No explanation available'}</p>
        </div>

        {/* Raw JSON */}
        <details style={{ background:'#0a0a1a', borderRadius:12, padding:'14px 20px', border:'1px solid rgba(255,255,255,0.06)' }}>
          <summary style={{ color:'#64748b', cursor:'pointer', fontSize:13, userSelect:'none' }}>View Raw JSON Response</summary>
          <pre style={{ color:'#34d399', fontSize:12, marginTop:14, overflow:'auto', maxHeight:400 }}>{JSON.stringify(result, null, 2)}</pre>
        </details>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:700, margin:'0 auto', padding:'60px 24px' }}>
      <div style={{ textAlign:'center', marginBottom:48 }}>
        <h2 style={{
          fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,4vw,42px)', fontWeight:700,
          background:'linear-gradient(135deg,#e2e8f0,#a5b4fc)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:12
        }}>{t('uploadTitle')}</h2>
        <p style={{ color:'#64748b', fontSize:16 }}>{t('uploadDescription')}</p>
      </div>

      {/* Drop Zone */}
      <div
        style={{
          position:'relative', border:`2px dashed ${dragActive ? '#6366f1' : 'rgba(99,102,241,0.3)'}`,
          borderRadius:24, padding:'64px 40px', textAlign:'center',
          background: dragActive ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
          transition:'all .2s',
          boxShadow: dragActive ? '0 0 40px rgba(99,102,241,0.2) inset' : 'none'
        }}
        onDragEnter={handleDrag} onDragLeave={handleDrag}
        onDragOver={handleDrag} onDrop={handleDrop}
      >
        <input type="file" accept=".pdf" onChange={handleFileChange}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0, cursor:'pointer' }}/>
        <div style={{
          width:72, height:72, margin:'0 auto 20px',
          background:'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(16,185,129,0.15))',
          borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32,
          border:'1px solid rgba(99,102,241,0.3)'
        }}>📄</div>
        <div style={{ fontSize:18, fontWeight:600, color:'#e2e8f0', marginBottom:8 }}>
          {file ? file.name : t('dragDropText')}
        </div>
        <div style={{ fontSize:13, color:'#475569' }}>{t('supportedFormats')}</div>
        {file && (
          <div style={{
            marginTop:16, display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)',
            borderRadius:8, padding:'6px 14px', color:'#34d399', fontSize:13
          }}>✓ {file.name} ready</div>
        )}
      </div>

      {error && (
        <div style={{
          marginTop:16, padding:'14px 20px', borderRadius:12,
          background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
          color:'#fca5a5', fontSize:14, textAlign:'center'
        }}>{error}</div>
      )}

      {file && !loading && (
        <div style={{ marginTop:28, textAlign:'center' }}>
          <button onClick={handleUpload} style={{
            padding:'16px 48px', borderRadius:14, fontSize:16, fontWeight:700,
            background:'linear-gradient(135deg,#6366f1,#4f46e5)',
            color:'#fff', border:'none', cursor:'pointer',
            boxShadow:'0 0 40px rgba(99,102,241,0.4)',
            transition:'all .2s'
          }}
            onMouseOver={e => { e.currentTarget.style.transform='scale(1.04)'; e.currentTarget.style.boxShadow='0 0 60px rgba(99,102,241,0.6)'; }}
            onMouseOut={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 0 40px rgba(99,102,241,0.4)'; }}
          >
            ⚡ {t('analyzingDocument').replace('...', '')}
          </button>
        </div>
      )}

      {loading && (
        <div style={{ marginTop:40, textAlign:'center' }}>
          <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', gap:16 }}>
            <div style={{
              width:48, height:48,
              border:'4px solid rgba(99,102,241,0.2)',
              borderTop:'4px solid #6366f1',
              borderRadius:'50%',
              animation:'spin 1s linear infinite'
            }}/>
            <div style={{ color:'#a5b4fc', fontWeight:500 }}>{loadingMessage}</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      )}
    </div>
  );
};

// helper returning style object instead of className (for inline styles)
const getRiskColorObj = (risk) => {
  const r = risk?.toLowerCase() || '';
  if (r.includes('high') || r.includes('उच्च') || r.includes('जास्त'))
    return { background:'rgba(239,68,68,0.15)', color:'#fca5a5', borderColor:'rgba(239,68,68,0.4)' };
  if (r.includes('medium') || r.includes('मध्यम'))
    return { background:'rgba(245,158,11,0.15)', color:'#fcd34d', borderColor:'rgba(245,158,11,0.4)' };
  if (r.includes('low') || r.includes('कमी'))
    return { background:'rgba(16,185,129,0.15)', color:'#6ee7b7', borderColor:'rgba(16,185,129,0.4)' };
  return { background:'rgba(100,116,139,0.15)', color:'#94a3b8', borderColor:'rgba(100,116,139,0.4)' };
};

// ─── About Page ───────────────────────────────────────────────────────────────
const AboutPage = ({ t }) => (
  <div style={{ maxWidth:900, margin:'0 auto', padding:'60px 24px' }}>
    <h2 style={{
      fontFamily:"'Playfair Display',serif", fontSize:42, fontWeight:700,
      background:'linear-gradient(135deg,#e2e8f0,#a5b4fc)',
      WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:12
    }}>About Judicio</h2>
    <p style={{ color:'#64748b', fontSize:18, marginBottom:48, lineHeight:1.7 }}>
      Empowering citizens and legal professionals with AI-powered legal document intelligence.
    </p>
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:48 }}>
      {[
        { title:'Our Mission', icon:'🎯', text:'To democratize legal knowledge by making complex court orders and legal documents understandable for every citizen, regardless of their legal background or language preference.' },
        { title:'Who We Serve', icon:'👥', text:'From lawyers needing fast document summaries to citizens trying to understand their rights — Judicio bridges the gap between legal complexity and everyday understanding.' },
        { title:'Technology', icon:'🤖', text:'Powered by state-of-the-art large language models, Judicio extracts, analyzes, and translates legal content with high accuracy across English, Hindi, and Marathi.' },
        { title:'Privacy First', icon:'🔒', text:'Your documents are processed securely and never stored on our servers. We take data privacy seriously — your legal documents are yours alone.' },
      ].map((c,i) => (
        <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:20, padding:'28px 24px' }}>
          <div style={{ fontSize:28, marginBottom:12 }}>{c.icon}</div>
          <div style={{ fontWeight:700, fontSize:18, color:'#e2e8f0', marginBottom:10 }}>{c.title}</div>
          <p style={{ color:'#64748b', lineHeight:1.7, margin:0, fontSize:14 }}>{c.text}</p>
        </div>
      ))}
    </div>
    <div style={{
      background:'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(16,185,129,0.06))',
      border:'1px solid rgba(99,102,241,0.25)', borderRadius:20, padding:'36px 32px', textAlign:'center'
    }}>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, color:'#e2e8f0', marginBottom:10 }}>
        {t('aboutJudicio')}
      </div>
      <div style={{ color:'#64748b', fontSize:14 }}>{t('version')} 1.0.0 © 2026</div>
    </div>
  </div>
);

// ─── How It Works Page ────────────────────────────────────────────────────────
const HowItWorksPage = ({ t }) => {
  const navigate = useNavigate();
  const steps = [
    { n:'01', icon:'📄', title:'Upload Your PDF', desc:'Drag and drop any court order, legal notice, or judgment PDF onto the analyzer. We support all standard Indian court document formats.' },
    { n:'02', icon:'🔎', title:'Text Extraction', desc:'Our engine extracts all text from the PDF, handling scanned documents and complex formatting to ensure complete data capture.' },
    { n:'03', icon:'🤖', title:'AI Analysis', desc:'The extracted text is analyzed by our AI model, which identifies case numbers, parties, dates, legal directions, and risk factors.' },
    { n:'04', icon:'🌐', title:'Multilingual Output', desc:'Results are generated in your chosen language — English, Hindi, or Marathi — with both professional summaries and plain-language citizen explanations.' },
    { n:'05', icon:'📊', title:'Structured Results', desc:'View results in a clean dashboard with risk tags, a visual timeline, legal directions checklist, and downloadable JSON data.' },
  ];
  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'60px 24px' }}>
      <div style={{ textAlign:'center', marginBottom:64 }}>
        <h2 style={{
          fontFamily:"'Playfair Display',serif", fontSize:42, fontWeight:700,
          background:'linear-gradient(135deg,#e2e8f0,#a5b4fc)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:14
        }}>How It Works</h2>
        <p style={{ color:'#64748b', fontSize:17 }}>Five simple steps from PDF to full legal intelligence</p>
      </div>
      <div style={{ position:'relative' }}>
        <div style={{ position:'absolute', left:26, top:0, bottom:0, width:2, background:'linear-gradient(to bottom,#6366f1,#10b981,transparent)' }}/>
        {steps.map((s, i) => (
          <div key={i} style={{ display:'flex', gap:32, marginBottom:40, paddingLeft:64, position:'relative' }}>
            <div style={{
              position:'absolute', left:0, top:0,
              width:54, height:54, borderRadius:'50%',
              background:'linear-gradient(135deg,#6366f1,#4f46e5)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#fff', fontSize:13,
              boxShadow:'0 0 20px rgba(99,102,241,0.4)', border:'3px solid #0f172a'
            }}>{s.n}</div>
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:16, padding:'22px 24px', flex:1 }}>
              <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:10 }}>
                <span style={{ fontSize:22 }}>{s.icon}</span>
                <span style={{ fontWeight:700, fontSize:17, color:'#e2e8f0' }}>{s.title}</span>
              </div>
              <p style={{ color:'#64748b', margin:0, lineHeight:1.7, fontSize:14 }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign:'center', marginTop:48 }}>
        <button onClick={() => navigate('/analyze')} style={{
          padding:'16px 44px', borderRadius:14, fontSize:16, fontWeight:700,
          background:'linear-gradient(135deg,#6366f1,#4f46e5)',
          color:'#fff', border:'none', cursor:'pointer',
          boxShadow:'0 0 32px rgba(99,102,241,0.4)', transition:'all .2s'
        }}
          onMouseOver={e => e.currentTarget.style.transform='scale(1.04)'}
          onMouseOut={e => e.currentTarget.style.transform='scale(1)'}
        >Try It Now →</button>
      </div>
    </div>
  );
};

// ─── 404 ──────────────────────────────────────────────────────────────────────
const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign:'center', padding:'100px 24px' }}>
      <div style={{ fontSize:80, marginBottom:16 }}>⚖️</div>
      <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:48, color:'#e2e8f0', marginBottom:12 }}>404</h2>
      <p style={{ color:'#64748b', fontSize:18, marginBottom:36 }}>This page doesn't exist in our jurisdiction.</p>
      <button onClick={() => navigate('/')} style={{
        padding:'14px 36px', borderRadius:12,
        background:'linear-gradient(135deg,#6366f1,#4f46e5)',
        color:'#fff', border:'none', cursor:'pointer', fontSize:15, fontWeight:600
      }}>Return Home</button>
    </div>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────
function AppContent() {
  const { t, i18n } = useTranslation();
  return (
    <div style={{ minHeight:'100vh', background:'#080818', color:'#e2e8f0', fontFamily:"'DM Sans',sans-serif", position:'relative' }}>
      <ParticleBackground/>
      <Navbar i18n={i18n} t={t}/>
      <div style={{ position:'relative', zIndex:1 }}>
        <Routes>
          <Route path="/" element={<HomePage t={t}/>}/>
          <Route path="/analyze" element={<AnalyzePage t={t} i18n={i18n}/>}/>
          <Route path="/about" element={<AboutPage t={t}/>}/>
          <Route path="/how-it-works" element={<HowItWorksPage t={t}/>}/>
          <Route path="*" element={<NotFoundPage/>}/>
        </Routes>
      </div>
      {/* Footer */}
      <footer style={{
        borderTop:'1px solid rgba(99,102,241,0.12)',
        padding:'28px 24px', textAlign:'center', position:'relative', zIndex:1,
        background:'rgba(0,0,0,0.3)'
      }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <span style={{ color:'#334155', fontSize:13 }}>{t('aboutJudicio')} © 2026</span>
          <div style={{ display:'flex', gap:24 }}>
            {['/', '/analyze', '/about', '/how-it-works'].map((p, i) => (
              <Link key={p} to={p} style={{ color:'#334155', fontSize:13, textDecoration:'none', transition:'color .2s' }}
                onMouseOver={e => e.currentTarget.style.color='#6366f1'}
                onMouseOut={e => e.currentTarget.style.color='#334155'}
              >{['Home','Analyze','About','How It Works'][i]}</Link>
            ))}
          </div>
          <span style={{ color:'#1e293b', fontSize:13 }}>{t('version')} 1.0.0</span>
        </div>
      </footer>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; background: #0a0a1a; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 3px; }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent/>
    </Router>
  );
}
