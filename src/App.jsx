import { useState } from "react";
import UserPortal from "./UserPortal";
import AdminPortal from "./AdminPortal";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .tb-root {
    min-height: 100vh;
    background: #0A1628;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .tb-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(201,168,76,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(201,168,76,0.06) 1px, transparent 1px);
    background-size: 60px 60px;
    animation: gridDrift 20s linear infinite;
  }

  @keyframes gridDrift {
    0%   { transform: translateY(0); }
    100% { transform: translateY(60px); }
  }

  .tb-glow {
    position: absolute;
    width: 700px;
    height: 700px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: pulse 4s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
    50%       { opacity: 1;   transform: translate(-50%, -50%) scale(1.08); }
  }

  .tb-corner { position: absolute; width: 120px; height: 120px; opacity: 0.3; }
  .tb-corner.tl { top: 32px; left: 32px; border-top: 1px solid #C9A84C; border-left: 1px solid #C9A84C; }
  .tb-corner.tr { top: 32px; right: 32px; border-top: 1px solid #C9A84C; border-right: 1px solid #C9A84C; }
  .tb-corner.bl { bottom: 32px; left: 32px; border-bottom: 1px solid #C9A84C; border-left: 1px solid #C9A84C; }
  .tb-corner.br { bottom: 32px; right: 32px; border-bottom: 1px solid #C9A84C; border-right: 1px solid #C9A84C; }

  .tb-card {
    position: relative;
    z-index: 10;
    text-align: center;
    padding: 64px 72px;
    animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .tb-wordmark {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    margin-bottom: 8px;
  }

  .tb-wordmark-line { width: 48px; height: 1px; background: linear-gradient(90deg, transparent, #C9A84C); }
  .tb-wordmark-line.right { background: linear-gradient(90deg, #C9A84C, transparent); }

  .tb-logo-mark {
    width: 48px; height: 48px;
    border: 1.5px solid #C9A84C;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(201,168,76,0.08);
  }

  .tb-eyebrow {
    font-size: 10px; font-weight: 600;
    letter-spacing: 0.28em; color: #C9A84C;
    text-transform: uppercase; margin-bottom: 16px;
  }

  .tb-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(52px, 7vw, 80px);
    font-weight: 700; color: #F8F4EE;
    line-height: 1; letter-spacing: -0.02em; margin-bottom: 6px;
  }
  .tb-title span { color: #C9A84C; }

  .tb-subtitle {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(14px, 2vw, 18px);
    color: rgba(248,244,238,0.45);
    letter-spacing: 0.04em; margin-bottom: 48px;
  }

  .tb-divider {
    display: flex; align-items: center;
    justify-content: center; gap: 16px; margin-bottom: 40px;
  }
  .tb-divider-line { width: 60px; height: 1px; background: rgba(201,168,76,0.3); }
  .tb-divider-diamond { width: 6px; height: 6px; background: #C9A84C; transform: rotate(45deg); opacity: 0.7; }

  .tb-portals { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }

  .tb-portal-btn {
    position: relative; width: 220px;
    padding: 28px 24px;
    border: 1px solid rgba(201,168,76,0.25);
    border-radius: 16px;
    background: rgba(255,255,255,0.03);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
    text-align: left; overflow: hidden;
    backdrop-filter: blur(8px);
  }
  .tb-portal-btn::before {
    content: ''; position: absolute; inset: 0; border-radius: 16px;
    background: linear-gradient(135deg, rgba(201,168,76,0.1), transparent);
    opacity: 0; transition: opacity 0.3s;
  }
  .tb-portal-btn:hover {
    border-color: rgba(201,168,76,0.7);
    transform: translateY(-4px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,168,76,0.2);
  }
  .tb-portal-btn:hover::before { opacity: 1; }

  .tb-portal-btn.admin { border-color: rgba(107,70,193,0.3); background: rgba(107,70,193,0.04); }
  .tb-portal-btn.admin::before { background: linear-gradient(135deg, rgba(107,70,193,0.15), transparent); }
  .tb-portal-btn.admin:hover {
    border-color: rgba(107,70,193,0.7);
    box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(107,70,193,0.2);
  }

  .tb-portal-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px; font-size: 18px;
  }
  .tb-portal-btn:not(.admin) .tb-portal-icon { background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.25); }
  .tb-portal-btn.admin .tb-portal-icon { background: rgba(107,70,193,0.15); border: 1px solid rgba(107,70,193,0.3); }

  .tb-portal-label {
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: #C9A84C; margin-bottom: 6px;
  }
  .tb-portal-btn.admin .tb-portal-label { color: #9F7AEA; }

  .tb-portal-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px; font-weight: 700;
    color: #F8F4EE; margin-bottom: 8px; line-height: 1.1;
  }

  .tb-portal-desc {
    font-size: 12px; color: rgba(248,244,238,0.4);
    line-height: 1.5; margin-bottom: 20px;
  }

  .tb-portal-arrow {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.12em;
    text-transform: uppercase; color: rgba(201,168,76,0.6);
    transition: color 0.2s, gap 0.2s;
  }
  .tb-portal-btn:hover .tb-portal-arrow { color: #C9A84C; gap: 10px; }
  .tb-portal-btn.admin .tb-portal-arrow { color: rgba(107,70,193,0.6); }
  .tb-portal-btn.admin:hover .tb-portal-arrow { color: #9F7AEA; gap: 10px; }

  .tb-footer {
    position: absolute; bottom: 28px; left: 0; right: 0;
    text-align: center; z-index: 10;
    font-size: 11px; color: rgba(248,244,238,0.2); letter-spacing: 0.08em;
  }
`;

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return (
      <>
        <style>{styles}</style>
        <div className="tb-root">
          <div className="tb-grid" />
          <div className="tb-glow" />
          <div className="tb-corner tl" />
          <div className="tb-corner tr" />
          <div className="tb-corner bl" />
          <div className="tb-corner br" />

          <div className="tb-card">
            <p className="tb-eyebrow">Executive Talent Platform</p>

            <div className="tb-wordmark">
              <div className="tb-wordmark-line" />
              <div className="tb-logo-mark">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="tb-wordmark-line right" />
            </div>

            <h1 className="tb-title">Talent<span>Bridge</span></h1>
            <p className="tb-subtitle">Where exceptional talent meets opportunity</p>

            <div className="tb-divider">
              <div className="tb-divider-line" />
              <div className="tb-divider-diamond" />
              <div className="tb-divider-line" />
            </div>

            <div className="tb-portals">
              <button className="tb-portal-btn" onClick={() => setUser({ role: "user" })}>
                <div className="tb-portal-icon">🌐</div>
                <p className="tb-portal-label">Gateway</p>
                <h3 className="tb-portal-name">User Portal</h3>
                <p className="tb-portal-desc">For employers & candidates seeking connections</p>
                <span className="tb-portal-arrow">Enter →</span>
              </button>

              <button className="tb-portal-btn admin" onClick={() => setUser({ role: "admin" })}>
                <div className="tb-portal-icon">⚙️</div>
                <p className="tb-portal-label">Restricted</p>
                <h3 className="tb-portal-name">Admin Portal</h3>
                <p className="tb-portal-desc">Platform management & oversight dashboard</p>
                <span className="tb-portal-arrow">Enter →</span>
              </button>
            </div>
          </div>

          <p className="tb-footer">© 2026 TalentBridge Marketplace · All rights reserved</p>
        </div>
      </>
    );
  }

  return user.role === "admin" ? <AdminPortal /> : <UserPortal />;
}
