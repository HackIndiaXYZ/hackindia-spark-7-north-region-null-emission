import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const { data: coefficients = [] } = useQuery({
  queryKey: ['llm-coefficients'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('llm_coefficients')
      .select('*');

    if (error) throw error;
    return data || [];
  },
});
import { useQuery } from '@tanstack/react-query';

// ─── Provider colours ───────────────────────────────────────────────
const PROVIDER_COLORS = {
  OpenAI:     '#3b82f6',
  Anthropic:  '#f97316',
  Google:     '#14b8a6',
  Meta:       '#a855f7',
  Mistral:    '#ec4899',
  Cohere:     '#84cc16',
  Databricks: '#f59e0b',
  xAI:        '#e2e8f0',
  Microsoft:  '#60a5fa',
};

// ─── Particle canvas ────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 45;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.4 + 0.15,
      opacity: Math.random() * 0.25 + 0.08,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(127,255,0,${p.opacity})`;
        ctx.fill();
        p.y -= p.speed;
        if (p.y < -4) {
          p.y = canvas.height + 4;
          p.x = Math.random() * canvas.width;
        }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}

// ─── Live counters ───────────────────────────────────────────────────
const COUNTER_DEFS = [
  { label: 'kWh consumed today',   start: 48_000_000, rate: 1200,  suffix: '' },
  { label: 'kg CO₂ emitted today', start: 22_500_000, rate: 560,   suffix: '' },
  { label: 'litres of water used', start: 38_000_000, rate: 950,   suffix: '' },
];

function LiveCounters() {
  const refs  = [useRef(null), useRef(null), useRef(null)];
  const vals  = useRef(COUNTER_DEFS.map(d => d.start));
  const fmter = new Intl.NumberFormat('en-US');

  useEffect(() => {
    const id = setInterval(() => {
      COUNTER_DEFS.forEach((def, i) => {
        vals.current[i] += def.rate * 0.1;
        if (refs[i].current) {
          refs[i].current.textContent = fmter.format(Math.round(vals.current[i]));
        }
      });
    }, 100);
    return () => clearInterval(id);
  }, []);

  return (
    <section style={{ background: '#060f0d', padding: '72px 24px' }}>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(26px,4vw,40px)', color: '#fff', textAlign: 'center', letterSpacing: '0.05em', marginBottom: 56 }}>
        AI IS CONSUMING THE PLANET. RIGHT NOW.
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px 64px', maxWidth: 1000, margin: '0 auto' }}>
        {COUNTER_DEFS.map((def, i) => (
          <div key={i} style={{ textAlign: 'center', flex: '1 1 220px' }}>
            <div ref={refs[i]} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(42px,6vw,68px)', color: '#7fff00', lineHeight: 1 }}>
              {new Intl.NumberFormat('en-US').format(def.start)}
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#a0b8a8', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 10 }}>
              {def.label}
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#3d5a47', textAlign: 'center', marginTop: 40 }}>
        * Figures are estimates based on published research. Actual values may vary.
      </p>
    </section>
  );
}

// ─── How it works ────────────────────────────────────────────────────
const HOW_STEPS = [
  { n: '01', title: 'PASTE YOUR PROMPT', body: 'Type or paste any prompt you\'ve sent to an AI. LLumen counts the tokens and identifies the task type automatically.' },
  { n: '02', title: 'PICK YOUR MODEL',   body: 'Select from 28 supported LLMs across OpenAI, Anthropic, Google, Meta, Mistral, and more. See real cost differences.' },
  { n: '03', title: 'SEE THE FOOTPRINT', body: 'Get an instant breakdown: energy in kWh, CO₂ in grams, water in millilitres — plus which lighter model could do the same job.' },
];

function HowItWorks() {
  const cardRefs = useRef([]);
  const [visible, setVisible] = useState([false, false, false]);

  useEffect(() => {
    const observers = cardRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(v => { const n=[...v]; n[i]=true; return n; }), i * 150);
          obs.disconnect();
        }
      }, { threshold: 0.2 });
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  return (
    <section style={{ background: '#f0ede4', padding: '96px 24px' }}>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(32px,5vw,56px)', color: '#0d1f1a', textAlign: 'center', letterSpacing: '0.05em', marginBottom: 64 }}>
        THREE STEPS. ZERO GUESSWORK.
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center', maxWidth: 1100, margin: '0 auto' }}>
        {HOW_STEPS.map((step, i) => (
          <div
            key={i}
            ref={el => cardRefs.current[i] = el}
            style={{
              flex: '1 1 280px', maxWidth: 320, position: 'relative', overflow: 'hidden',
              background: '#fff', border: '1px solid rgba(13,31,26,0.08)',
              borderRadius: 4, padding: '40px 32px 36px',
              opacity: visible[i] ? 1 : 0,
              transform: visible[i] ? 'translateY(0)' : 'translateY(28px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 120, color: '#7fff00', opacity: 0.15, position: 'absolute', top: -20, right: 16, lineHeight: 1 }}>{step.n}</div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#0d1f1a', marginBottom: 14, position: 'relative' }}>{step.title}</h3>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: '#3d5247', lineHeight: 1.7, position: 'relative' }}>{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Model showcase ──────────────────────────────────────────────────
function ModelShowcase({ coefficients }) {
  const maxCo2 = Math.max(...coefficients.map(c => c.co2_grams));

  return (
    <section style={{ background: '#0d1f1a', padding: '96px 0' }}>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(32px,5vw,56px)', color: '#fff', textAlign: 'center', letterSpacing: '0.05em', marginBottom: 12 }}>
        28 MODELS. ONE COMPARISON.
      </h2>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: '#a0b8a8', textAlign: 'center', marginBottom: 48 }}>
        From the most powerful to the most efficient — see what your choice really costs.
      </p>
      <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, padding: '8px 32px', minWidth: 'max-content' }}>
          {[...coefficients].sort((a,b) => a.co2_grams - b.co2_grams).map(c => {
            const pct = (c.co2_grams / maxCo2) * 100;
            const color = PROVIDER_COLORS[c.provider] || '#9ca3af';
            return (
              <div
                key={c.model}
                style={{
                  background: '#0a1a15', border: '1px solid rgba(127,255,0,0.12)',
                  borderRadius: 6, padding: '20px 18px', width: 190, flexShrink: 0,
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                  cursor: 'default',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform='scale(1.04)'; e.currentTarget.style.borderColor='rgba(127,255,0,0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.borderColor='rgba(127,255,0,0.12)'; }}
              >
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{c.provider}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: '#fff', marginBottom: 14, lineHeight: 1.1 }}>{c.model}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#7fff00', lineHeight: 1.9 }}>
                  <div>⚡ {c.energy_kwh} kWh/1k tok</div>
                  <div>🌿 {c.co2_grams}g CO₂/1k tok</div>
                  <div>💧 {c.water_ml}ml /1k tok</div>
                </div>
                <div style={{ marginTop: 14, height: 3, background: '#0d2a1e', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: '#7fff00', borderRadius: 2, transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#5a7060', marginTop: 5 }}>
                  {Math.round(pct)}% of max CO₂
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Stat ticker ─────────────────────────────────────────────────────
const TICKERS = [
  '⚡  10 Wh — avg energy per GPT-4 conversation',
  '💧  500 ml — water spent per training query',
  '🌿  4.3g CO₂ — emitted per GPT-4o prompt',
];

function StatTicker() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i+1) % TICKERS.length); setVisible(true); }, 400);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      fontFamily: "'DM Mono', monospace", fontSize: 'clamp(13px,1.8vw,16px)',
      color: '#7fff00', letterSpacing: '0.02em',
      opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease',
      minHeight: 28, textAlign: 'center', margin: '28px 0',
    }}>
      {TICKERS[idx]}
    </div>
  );
}

// ─── Scroll arrow ────────────────────────────────────────────────────
function ScrollArrow() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const onScroll = () => { if (window.scrollY > 80) setShow(false); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <div style={{
      position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      animation: 'bounce 1.6s ease-in-out infinite',
      color: 'rgba(127,255,0,0.6)', fontSize: 22, userSelect: 'none',
    }}>
      ↓
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────
export default function Home() {
  const { data: coefficients = [] } = useQuery({
    queryKey: ['llm-coefficients'],
    queryFn: () => base44.entities.LlmCoefficient.list(),
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%,100% { transform: translateX(-50%) translateY(0); }
          50%      { transform: translateX(-50%) translateY(10px); }
        }

        .hero-line1 { animation: fadeUp 0.7s ease 0.0s both; }
        .hero-line2 { animation: fadeUp 0.7s ease 0.15s both; }
        .hero-sub   { animation: fadeUp 0.7s ease 0.3s both; }
        .hero-tick  { animation: fadeUp 0.7s ease 0.45s both; }
        .hero-ctas  { animation: fadeUp 0.7s ease 0.6s both; }

        .cta-primary {
          display: inline-block;
          background: #7fff00; color: #0d1f1a;
          font-family: 'Bebas Neue', sans-serif; font-size: 18px;
          padding: 14px 32px; border-radius: 2px; border: none; cursor: pointer;
          text-decoration: none; transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .cta-primary:hover { transform: translateY(-2px); box-shadow: 0 0 20px rgba(127,255,0,0.4); }

        .cta-secondary {
          display: inline-block;
          background: transparent; color: #7fff00;
          font-family: 'Bebas Neue', sans-serif; font-size: 18px;
          padding: 13px 32px; border-radius: 2px; border: 1.5px solid #7fff00; cursor: pointer;
          text-decoration: none; transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .cta-secondary:hover { transform: translateY(-2px); box-shadow: 0 0 20px rgba(127,255,0,0.25); }

        .cta-big {
          display: inline-block;
          background: #0d1f1a; color: #fff;
          font-family: 'Bebas Neue', sans-serif; font-size: 20px;
          padding: 18px 48px; border-radius: 2px; border: none; cursor: pointer;
          text-decoration: none; transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .cta-big:hover { transform: scale(1.03); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
      `}</style>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '100vh', background: '#0d1f1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 60px', overflow: 'hidden' }}>
        <ParticleCanvas />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 900 }}>
          <div className="hero-line1" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(52px,9vw,120px)', color: '#fff', lineHeight: 0.95, letterSpacing: '0.02em' }}>
            EVERY PROMPT
          </div>
          <div className="hero-line2" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(52px,9vw,120px)', color: '#7fff00', lineHeight: 0.95, letterSpacing: '0.02em', marginBottom: 32 }}>
            HAS A COST.
          </div>

          <div className="hero-sub">
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 'clamp(13px,1.6vw,16px)', color: '#a0b8a8', maxWidth: 520, margin: '0 auto', lineHeight: 1.75 }}>
              LLumen calculates the real environmental footprint of your AI usage —
              energy consumed, CO₂ emitted, water spent. Model by model. Prompt by prompt.
            </p>
          </div>

          <div className="hero-tick">
            <StatTicker />
          </div>

          <div className="hero-ctas" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
            <Link to="/calculator" className="cta-primary">Calculate Your Impact →</Link>
            <a href="#how-it-works" className="cta-secondary">See How It Works</a>
          </div>
        </div>

        <ScrollArrow />
      </section>

      {/* LIVE COUNTERS */}
      <LiveCounters />

      {/* HOW IT WORKS */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* MODEL SHOWCASE */}
      {coefficients.length > 0 && <ModelShowcase coefficients={coefficients} />}

      {/* QUOTE */}
      <section style={{ background: '#060f0d', padding: '80px 24px', textAlign: 'center' }}>
        <blockquote style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(26px,4vw,44px)', color: '#fff', maxWidth: 820, margin: '0 auto', lineHeight: 1.15, letterSpacing: '0.02em' }}>
          "Training GPT-3 emitted as much carbon<br />as a car driving 700,000 kilometres."
        </blockquote>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: '#5a7060', marginTop: 24 }}>
          — University of Massachusetts Amherst, 2019
        </p>
      </section>

      {/* CTA FOOTER */}
      <section style={{ background: '#7fff00', padding: '96px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(52px,8vw,80px)', color: '#0d1f1a', letterSpacing: '0.03em', marginBottom: 16 }}>
          START COUNTING.
        </h2>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, color: '#1a3d2a', marginBottom: 40 }}>
          Free to use. No credit card. Just clarity.
        </p>
        <Link to="/calculator" className="cta-big">Calculate My Impact →</Link>
      </section>
    </>
  );
}