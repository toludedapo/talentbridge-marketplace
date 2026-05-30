/**
 * LandingPage.jsx — TalentBridge Public Landing Page
 * Route: / (root)
 *
 * Two clear CTAs:
 *   "I'm looking for a job"  → navigates to /portal?role=candidate
 *   "I want to hire talent"  → navigates to /portal?role=employer
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  navy:       "#0A1628",
  navyMid:    "#112240",
  navyLight:  "#1a3a6b",
  gold:       "#C9A84C",
  goldLight:  "#E8C96A",
  goldFaint:  "rgba(201,168,76,0.10)",
  cream:      "#F8F4EE",
  white:      "#FFFFFF",
  slate:      "rgba(248,244,238,0.55)",
  slateLight: "rgba(248,244,238,0.30)",
};

// ─── INLINE STYLES ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Outfit:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { margin: 0; padding: 0; width: 100%; min-height: 100vh; background: #0A1628; overflow-x: hidden; }

  /* ── Animated background noise grain ── */
  @keyframes grain {
    0%,100%{ transform: translate(0,0) }
    10%    { transform: translate(-2%,-3%) }
    30%    { transform: translate(3%,-1%) }
    50%    { transform: translate(-1%, 3%) }
    70%    { transform: translate(2%, 1%) }
    90%    { transform: translate(-3%, 2%) }
  }

  @keyframes floatUp {
    from { opacity:0; transform: translateY(40px); }
    to   { opacity:1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity:0; }
    to   { opacity:1; }
  }

  @keyframes slideLeft {
    from { opacity:0; transform: translateX(-30px); }
    to   { opacity:1; transform: translateX(0); }
  }

  @keyframes slideRight {
    from { opacity:0; transform: translateX(30px); }
    to   { opacity:1; transform: translateX(0); }
  }

  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }

  @keyframes gridScroll {
    0%   { transform: translateY(0); }
    100% { transform: translateY(64px); }
  }

  @keyframes orb1 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%     { transform: translate(30px,-20px) scale(1.1); }
  }
  @keyframes orb2 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%     { transform: translate(-20px,30px) scale(0.95); }
  }

  .tb-land { 
    font-family: 'Outfit', sans-serif;
    width: 100%; min-width: 100vw;
    min-height: 100vh;
    background: ${C.navy};
    color: ${C.cream};
    overflow-x: hidden;
    position: relative;
  }

  /* Grid overlay */
  .tb-grid {
    position: fixed; inset: 0; z-index: 0;
    background-image:
      linear-gradient(rgba(201,168,76,0.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(201,168,76,0.045) 1px, transparent 1px);
    background-size: 64px 64px;
    animation: gridScroll 24s linear infinite;
    pointer-events: none;
  }

  /* Ambient orbs */
  .tb-orb {
    position: fixed; border-radius: 50%;
    filter: blur(80px); pointer-events: none; z-index: 0;
  }
  .tb-orb-1 {
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(201,168,76,0.11) 0%, transparent 70%);
    top: -200px; left: -100px;
    animation: orb1 12s ease-in-out infinite;
  }
  .tb-orb-2 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(26,58,107,0.6) 0%, transparent 70%);
    bottom: -150px; right: -100px;
    animation: orb2 15s ease-in-out infinite;
  }

  /* Navbar */
  .tb-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 48px;
    background: rgba(10,22,40,0.7);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(201,168,76,0.08);
    animation: fadeIn 0.6s ease both;
  }

  .tb-nav-logo {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none;
  }

  .tb-nav-mark {
    width: 36px; height: 36px;
    background: ${C.gold};
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 17px; color: ${C.navy};
    letter-spacing: -1px;
    box-shadow: 0 4px 16px rgba(201,168,76,0.35);
  }

  .tb-nav-name { font-size: 17px; font-weight: 700; color: ${C.white}; letter-spacing: -0.3px; }
  .tb-nav-sub  { font-size: 9px; font-weight: 600; color: ${C.gold}; letter-spacing: 2.5px; text-transform: uppercase; }

  .tb-nav-links { display: flex; align-items: center; gap: 28px; }
  .tb-nav-link  {
    font-size: 13px; font-weight: 500; color: rgba(248,244,238,0.55);
    text-decoration: none; transition: color 0.2s; letter-spacing: 0.2px;
  }
  .tb-nav-link:hover { color: ${C.cream}; }

  .tb-nav-cta {
    font-size: 13px; font-weight: 600; color: ${C.navy};
    background: ${C.gold}; border: none; border-radius: 8px;
    padding: 9px 20px; cursor: pointer;
    transition: all 0.2s; letter-spacing: 0.2px;
  }
  .tb-nav-cta:hover { background: ${C.goldLight}; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,168,76,0.35); }

  /* Hero */
  .tb-hero {
    position: relative; z-index: 10;
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center;
    padding: 120px 24px 80px;
  }

  .tb-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(201,168,76,0.1);
    border: 1px solid rgba(201,168,76,0.25);
    border-radius: 100px;
    padding: 6px 16px;
    font-size: 11px; font-weight: 600; color: ${C.gold};
    letter-spacing: 1.5px; text-transform: uppercase;
    margin-bottom: 32px;
    animation: floatUp 0.7s 0.1s cubic-bezier(0.16,1,0.3,1) both;
  }

  .tb-badge-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: ${C.gold};
    animation: fadeIn 1s ease infinite alternate;
  }

  .tb-hero-h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(46px, 7.5vw, 92px);
    font-weight: 900;
    line-height: 1.02;
    letter-spacing: -0.03em;
    color: ${C.white};
    margin-bottom: 10px;
    animation: floatUp 0.8s 0.2s cubic-bezier(0.16,1,0.3,1) both;
  }

  .tb-hero-h1 em {
    font-style: italic;
    background: linear-gradient(90deg, ${C.gold}, ${C.goldLight}, ${C.gold});
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 4s linear infinite;
  }

  .tb-hero-sub {
    font-size: clamp(15px, 2vw, 18px);
    font-weight: 400; color: ${C.slate};
    max-width: 560px; line-height: 1.7;
    margin: 20px auto 56px;
    animation: floatUp 0.8s 0.35s cubic-bezier(0.16,1,0.3,1) both;
  }

  /* CTA split section */
  .tb-split {
    display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;
    animation: floatUp 0.9s 0.5s cubic-bezier(0.16,1,0.3,1) both;
  }

  .tb-cta-card {
    position: relative;
    width: 280px;
    padding: 36px 32px 32px;
    border-radius: 20px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.32s cubic-bezier(0.16,1,0.3,1);
    text-align: left;
    overflow: hidden;
    outline: none;
    background: none;
    color: inherit;
  }

  /* Candidate card — gold */
  .tb-cta-card.candidate {
    background: linear-gradient(145deg, rgba(201,168,76,0.10), rgba(201,168,76,0.04));
    border-color: rgba(201,168,76,0.28);
  }
  .tb-cta-card.candidate:hover {
    border-color: ${C.gold};
    transform: translateY(-6px);
    box-shadow: 0 28px 72px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.35), inset 0 1px 0 rgba(201,168,76,0.15);
  }

  /* Employer card — blue */
  .tb-cta-card.employer {
    background: linear-gradient(145deg, rgba(44,95,138,0.22), rgba(44,95,138,0.06));
    border-color: rgba(44,95,138,0.35);
  }
  .tb-cta-card.employer:hover {
    border-color: rgba(44,95,138,0.8);
    transform: translateY(-6px);
    box-shadow: 0 28px 72px rgba(0,0,0,0.5), 0 0 0 1px rgba(44,95,138,0.4), inset 0 1px 0 rgba(44,95,138,0.15);
  }

  .tb-cta-card::before {
    content: '';
    position: absolute; inset: 0; border-radius: 20px;
    opacity: 0; transition: opacity 0.32s;
  }
  .tb-cta-card.candidate::before { background: radial-gradient(circle at top left, rgba(201,168,76,0.09), transparent 60%); }
  .tb-cta-card.employer::before  { background: radial-gradient(circle at top left, rgba(44,95,138,0.12), transparent 60%); }
  .tb-cta-card:hover::before { opacity: 1; }

  .tb-cta-icon {
    width: 52px; height: 52px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; margin-bottom: 22px; position: relative; z-index: 1;
  }
  .candidate .tb-cta-icon { background: rgba(201,168,76,0.14); border: 1px solid rgba(201,168,76,0.25); }
  .employer  .tb-cta-icon { background: rgba(44,95,138,0.22);   border: 1px solid rgba(44,95,138,0.35); }

  .tb-cta-eyebrow {
    font-size: 10px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    margin-bottom: 8px; position: relative; z-index: 1;
  }
  .candidate .tb-cta-eyebrow { color: ${C.gold}; }
  .employer  .tb-cta-eyebrow { color: #6BA3C8; }

  .tb-cta-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px; font-weight: 700; color: ${C.white};
    line-height: 1.15; margin-bottom: 12px; position: relative; z-index: 1;
  }

  .tb-cta-desc {
    font-size: 13px; font-weight: 400; color: ${C.slate};
    line-height: 1.65; margin-bottom: 28px; position: relative; z-index: 1;
  }

  .tb-cta-btn {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 13px; font-weight: 600; letter-spacing: 0.3px;
    padding: 12px 22px; border-radius: 10px; border: none; cursor: pointer;
    transition: all 0.25s; position: relative; z-index: 1;
  }
  .candidate .tb-cta-btn {
    background: ${C.gold}; color: ${C.navy};
  }
  .candidate .tb-cta-btn:hover { background: ${C.goldLight}; gap: 12px; }
  .employer  .tb-cta-btn {
    background: rgba(44,95,138,0.35); color: #A8D0EF;
    border: 1px solid rgba(44,95,138,0.5);
  }
  .employer  .tb-cta-btn:hover { background: rgba(44,95,138,0.55); gap: 12px; }

  .tb-cta-arrow { transition: transform 0.25s; font-size: 16px; }
  .tb-cta-btn:hover .tb-cta-arrow { transform: translateX(4px); }

  /* Stats bar */
  .tb-stats {
    display: flex; gap: 0; justify-content: center;
    margin-top: 72px; flex-wrap: wrap;
    animation: floatUp 1s 0.7s cubic-bezier(0.16,1,0.3,1) both;
  }

  .tb-stat {
    padding: 0 40px;
    text-align: center;
    border-right: 1px solid rgba(201,168,76,0.15);
  }
  .tb-stat:last-child { border-right: none; }

  .tb-stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 36px; font-weight: 700; color: ${C.white};
    line-height: 1;
  }
  .tb-stat-num span { color: ${C.gold}; }
  .tb-stat-label {
    font-size: 11px; font-weight: 500; color: ${C.slateLight};
    margin-top: 6px; letter-spacing: 0.5px;
  }

  /* Scroll hint */
  .tb-scroll-hint {
    position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    animation: floatUp 1s 1s cubic-bezier(0.16,1,0.3,1) both;
    cursor: default;
  }
  .tb-scroll-hint span { font-size: 10px; font-weight: 500; color: ${C.slateLight}; letter-spacing: 1.5px; text-transform: uppercase; }
  .tb-scroll-line {
    width: 1px; height: 40px;
    background: linear-gradient(to bottom, ${C.gold}, transparent);
    animation: fadeIn 1.5s ease-in-out infinite alternate;
  }

  /* Social proof strip */
  .tb-proof {
    position: relative; z-index: 10;
    padding: 48px 48px;
    border-top: 1px solid rgba(201,168,76,0.08);
    background: rgba(10,22,40,0.5);
    backdrop-filter: blur(8px);
    text-align: center;
  }
  .tb-proof-label {
    font-size: 11px; font-weight: 600; color: ${C.slateLight};
    letter-spacing: 2px; text-transform: uppercase; margin-bottom: 28px;
  }
  .tb-proof-logos {
    display: flex; justify-content: center; align-items: center;
    gap: 48px; flex-wrap: wrap;
  }
  .tb-proof-logo {
    font-size: 14px; font-weight: 700; color: rgba(248,244,238,0.25);
    letter-spacing: 1px; text-transform: uppercase;
    transition: color 0.3s;
  }
  .tb-proof-logo:hover { color: rgba(248,244,238,0.5); }

  /* How it works section */
  .tb-how {
    position: relative; z-index: 10;
    padding: 100px 48px;
  }
  .tb-section-label {
    text-align: center;
    font-size: 10px; font-weight: 700; color: ${C.gold};
    letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px;
  }
  .tb-section-title {
    font-family: 'Playfair Display', serif;
    text-align: center;
    font-size: clamp(32px, 4vw, 48px); font-weight: 700; color: ${C.white};
    margin-bottom: 64px; line-height: 1.2;
  }
  .tb-steps {
    display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; max-width: 960px; margin: 0 auto;
  }
  .tb-step {
    flex: 1; min-width: 200px; max-width: 260px;
    padding: 32px 28px;
    border: 1px solid rgba(201,168,76,0.10);
    border-radius: 16px;
    background: rgba(255,255,255,0.02);
    text-align: center;
    transition: border-color 0.3s;
  }
  .tb-step:hover { border-color: rgba(201,168,76,0.25); }
  .tb-step-num {
    font-family: 'Playfair Display', serif;
    font-size: 48px; font-weight: 900;
    color: rgba(201,168,76,0.15); line-height: 1; margin-bottom: 16px;
  }
  .tb-step-title { font-size: 16px; font-weight: 700; color: ${C.white}; margin-bottom: 10px; }
  .tb-step-desc  { font-size: 13px; color: ${C.slate}; line-height: 1.65; }

  /* Bottom CTA banner */
  .tb-bottom-cta {
    position: relative; z-index: 10;
    margin: 0 48px 80px;
    border-radius: 24px;
    padding: 72px 48px;
    text-align: center;
    background: linear-gradient(135deg, rgba(201,168,76,0.10) 0%, rgba(26,58,107,0.4) 100%);
    border: 1px solid rgba(201,168,76,0.18);
    overflow: hidden;
  }
  .tb-bottom-cta::before {
    content: '';
    position: absolute; inset: 0; border-radius: 24px;
    background: radial-gradient(ellipse at center top, rgba(201,168,76,0.08), transparent 70%);
  }
  .tb-bottom-h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 4vw, 44px); font-weight: 700; color: ${C.white};
    margin-bottom: 12px; position: relative;
  }
  .tb-bottom-p { font-size: 15px; color: ${C.slate}; margin-bottom: 36px; position: relative; }
  .tb-bottom-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; position: relative; }

  .tb-btn-gold {
    font-size: 14px; font-weight: 600; color: ${C.navy};
    background: ${C.gold}; border: none; border-radius: 10px;
    padding: 14px 28px; cursor: pointer;
    transition: all 0.25s; letter-spacing: 0.2px;
  }
  .tb-btn-gold:hover { background: ${C.goldLight}; transform: translateY(-2px); box-shadow: 0 10px 32px rgba(201,168,76,0.4); }

  .tb-btn-ghost {
    font-size: 14px; font-weight: 600; color: ${C.cream};
    background: transparent;
    border: 1px solid rgba(248,244,238,0.2); border-radius: 10px;
    padding: 14px 28px; cursor: pointer;
    transition: all 0.25s; letter-spacing: 0.2px;
  }
  .tb-btn-ghost:hover { border-color: rgba(248,244,238,0.5); background: rgba(248,244,238,0.06); transform: translateY(-2px); }

  /* Footer */
  .tb-footer {
    position: relative; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    padding: 28px 48px;
    border-top: 1px solid rgba(201,168,76,0.08);
    flex-wrap: wrap; gap: 12px;
  }
  .tb-footer-brand { font-size: 13px; font-weight: 600; color: rgba(248,244,238,0.35); }
  .tb-footer-brand span { color: ${C.gold}; }
  .tb-footer-copy { font-size: 12px; color: rgba(248,244,238,0.2); }

  @media (max-width: 640px) {
    .tb-nav { padding: 16px 20px; }
    .tb-nav-links { display: none; }
    .tb-hero { padding: 100px 20px 60px; }
    .tb-stats { gap: 0; }
    .tb-stat { padding: 0 20px; }
    .tb-how { padding: 60px 20px; }
    .tb-bottom-cta { margin: 0 20px 60px; padding: 48px 24px; }
    .tb-footer { padding: 24px 20px; flex-direction: column; text-align: center; }
    .tb-proof { padding: 40px 20px; }
    .tb-proof-logos { gap: 28px; }
  }
`;

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();

  const goCandidate = () => navigate("/portal?role=candidate");
  const goEmployer  = () => navigate("/portal?role=employer");

  return (
    <>
      <style>{css}</style>
      <div className="tb-land">

        {/* Background effects */}
        <div className="tb-grid" />
        <div className="tb-orb tb-orb-1" />
        <div className="tb-orb tb-orb-2" />

        {/* ── Navbar ── */}
        <nav className="tb-nav">
          <div className="tb-nav-logo">
            <div className="tb-nav-mark">T</div>
            <div>
              <div className="tb-nav-name">TalentBridge</div>
              <div className="tb-nav-sub">Curated Talent</div>
            </div>
          </div>
          <div className="tb-nav-links">
            <a href="#how" className="tb-nav-link">How it works</a>
            <a href="#companies" className="tb-nav-link">Companies</a>
          </div>
          <button className="tb-nav-cta" onClick={goCandidate}>Get Started</button>
        </nav>

        {/* ── Hero ── */}
        <section className="tb-hero">
          <div className="tb-badge">
            <div className="tb-badge-dot" />
            Nigeria's Premier Talent Marketplace
          </div>

          <h1 className="tb-hero-h1">
            Your next great<br/>
            <em>opportunity</em><br/>
            starts here
          </h1>

          <p className="tb-hero-sub">
            Connecting 2,400+ verified Nigerian professionals with 380+ leading employers. 
            Whether you're building a career or building a team — TalentBridge is your edge.
          </p>

          {/* ── The TWO main CTAs ── */}
          <div className="tb-split">

            {/* Candidate card */}
            <button className="tb-cta-card candidate" onClick={goCandidate}>
              <div className="tb-cta-icon">🎯</div>
              <p className="tb-cta-eyebrow">For Talent</p>
              <h2 className="tb-cta-title">I'm looking<br/>for a job</h2>
              <p className="tb-cta-desc">
                Build your profile once. Get discovered by 380+ companies. 
                Receive structured interview invitations — no cold applications.
              </p>
              <button className="tb-cta-btn" onClick={goCandidate}>
                Find Opportunities
                <span className="tb-cta-arrow">→</span>
              </button>
            </button>

            {/* Employer card */}
            <button className="tb-cta-card employer" onClick={goEmployer}>
              <div className="tb-cta-icon">🏢</div>
              <p className="tb-cta-eyebrow">For Recruiters</p>
              <h2 className="tb-cta-title">I want to<br/>hire talent</h2>
              <p className="tb-cta-desc">
                Search vetted candidates by skill, role, and location. 
                Invite, track, and hire through one clean pipeline — no spreadsheets.
              </p>
              <button className="tb-cta-btn" onClick={goEmployer}>
                Start Hiring
                <span className="tb-cta-arrow">→</span>
              </button>
            </button>
          </div>

          {/* Stats */}
          <div className="tb-stats">
            <div className="tb-stat">
              <div className="tb-stat-num">2,400<span>+</span></div>
              <div className="tb-stat-label">Verified Candidates</div>
            </div>
            <div className="tb-stat">
              <div className="tb-stat-num">380<span>+</span></div>
              <div className="tb-stat-label">Hiring Companies</div>
            </div>
            <div className="tb-stat">
              <div className="tb-stat-num">36<span></span></div>
              <div className="tb-stat-label">Nigerian States</div>
            </div>
            <div className="tb-stat">
              <div className="tb-stat-num">94<span>%</span></div>
              <div className="tb-stat-label">Placement Rate</div>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="tb-scroll-hint">
            <span>Scroll</span>
            <div className="tb-scroll-line" />
          </div>
        </section>

        {/* ── Social proof ── */}
        <div className="tb-proof" id="companies">
          <p className="tb-proof-label">Trusted by leading Nigerian companies</p>
          <div className="tb-proof-logos">
            {["Flutterwave","Andela","MTN Nigeria","Paystack","Kuda Bank","Access Bank","Jumia"].map(name => (
              <div key={name} className="tb-proof-logo">{name}</div>
            ))}
          </div>
        </div>

        {/* ── How it works ── */}
        <section className="tb-how" id="how">
          <p className="tb-section-label">The Process</p>
          <h2 className="tb-section-title">Built for speed.<br/>Designed for results.</h2>
          <div className="tb-steps">
            {[
              { n:"01", title:"Create your profile",   desc:"Candidates build a rich digital CV. Employers set up a verified company page." },
              { n:"02", title:"Get matched",            desc:"Our platform surfaces the right fit — candidates see relevant companies, employers see top talent." },
              { n:"03", title:"Connect directly",       desc:"Employers send structured invitations. Candidates accept or decline in one tap." },
              { n:"04", title:"Close the deal",         desc:"Track every stage of your pipeline — from invite to offer — in one clean dashboard." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="tb-step">
                <div className="tb-step-num">{n}</div>
                <div className="tb-step-title">{title}</div>
                <div className="tb-step-desc">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <div className="tb-bottom-cta">
          <h2 className="tb-bottom-h2">Ready to make your move?</h2>
          <p className="tb-bottom-p">Join thousands of professionals and companies already on TalentBridge.</p>
          <div className="tb-bottom-btns">
            <button className="tb-btn-gold" onClick={goCandidate}>I'm Looking for a Job</button>
            <button className="tb-btn-ghost" onClick={goEmployer}>I Want to Hire Talent</button>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="tb-footer">
          <div className="tb-footer-brand">Talent<span>Bridge</span> Marketplace</div>
          <div className="tb-footer-copy">© 2026 TalentBridge · All rights reserved</div>
        </footer>

      </div>
    </>
  );
}
