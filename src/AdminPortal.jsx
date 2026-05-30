/**
 * AdminPortal.jsx — TalentBridge Admin Portal
 * Route 2: /admin
 *
 * Completely isolated from UserPortal.jsx:
 *   - Separate credential store (never shared with user auth)
 *   - Separate visual identity (purple admin accent, dark login)
 *   - No employer/candidate nav, no pipeline board, no profile builder
 *   - No import from UserPortal — design tokens are duplicated intentionally
 *
 * In production:
 *   - Serve /admin from a separate subdomain or hardened server route
 *   - Add IP allowlist / VPN requirement at the infrastructure level
 *   - Replace credential check with a real backend auth endpoint
 */

import { useState } from "react";

// ─── THEME (duplicated from UserPortal intentionally — total isolation) ───────
const C = {
  navy:"#0A1628",      navyLight:"#112240",
  gold:"#C9A84C",      goldFaint:"rgba(201,168,76,0.12)",
  cream:"#F8F4EE",     white:"#FFFFFF",
  slate:"#4A5568",     slateLight:"#718096",
  lightGray:"#E8EDF4", midGray:"#CBD5E0",
  green:"#1A7A4A",     greenLight:"#E8F5EE",
  red:"#C0392B",       redLight:"#FDECEA",
  purple:"#6B46C1",    purpleLight:"#EDE9FE",
  blue:"#2C5F8A",      blueLight:"#E8F0F7",
  orange:"#E05C2A",    orangeLight:"#FEF0EB",
  teal:"#0D7377",
  // Admin-only accent — never used in UserPortal
  adminAccent:"#7C3AED", adminAccentLight:"#EDE9FE",
};

// ─── ADMIN CREDENTIALS ────────────────────────────────────────────────────────
// Completely separate from USER_CREDENTIALS in UserPortal.jsx.
// In production: call a hardened /admin/auth API endpoint.
const ADMIN_CREDENTIALS = [
  { email:"admin@talentbridge.com", password:"admin2025", name:"Chinyere Obi",  role:"super_admin", initials:"CO" },
  { email:"ops@talentbridge.com",   password:"ops2025",   name:"Dele Adeyemo", role:"ops_admin",   initials:"DA" },
];

function adminAuthenticate(email, password) {
  return ADMIN_CREDENTIALS.find(u => u.email === email && u.password === password) || null;
}

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_CANDIDATES = [
  { id:1,  name:"Adaeze Okonkwo",    role:"Senior Product Manager", location:"Lagos",         origin:"Anambra State", email:"adaeze.okonkwo@email.com",    phone:"+234 801 234 5678", initials:"AO", avatarColor:C.green,    skills:["Product Strategy","Agile/Scrum","User Research","Roadmapping","Data Analysis"],    status:"approved",  joinDate:"2025-01-12", profileViews:5, cv:true,  photo:true  },
  { id:2,  name:"Emeka Nwachukwu",   role:"Full Stack Engineer",    location:"Abuja",         origin:"Imo State",     email:"emeka.nwachukwu@email.com",   phone:"+234 802 345 6789", initials:"EN", avatarColor:C.blue,     skills:["React","Node.js","TypeScript","PostgreSQL","AWS"],                                status:"approved",  joinDate:"2025-01-18", profileViews:0, cv:true,  photo:true  },
  { id:3,  name:"Fatima Al-Hassan",  role:"Marketing Director",     location:"Kano",          origin:"Kano State",    email:"fatima.alhassan@email.com",    phone:"+234 803 456 7890", initials:"FA", avatarColor:C.purple,   skills:["Brand Strategy","Digital Marketing","SEO/SEM"],                                  status:"approved",  joinDate:"2025-02-03", profileViews:0, cv:true,  photo:false },
  { id:4,  name:"Chidi Obi",         role:"Finance Manager",        location:"Port Harcourt", origin:"Rivers State",  email:"chidi.obi@email.com",          phone:"+234 804 567 8901", initials:"CO", avatarColor:C.gold,     skills:["Financial Modeling","IFRS","Audit","Tax Compliance"],                             status:"approved",  joinDate:"2025-03-10", profileViews:0, cv:true,  photo:false },
  { id:5,  name:"Ngozi Adeleke",     role:"HR Business Partner",    location:"Lagos",         origin:"Ogun State",    email:"ngozi.adeleke@email.com",      phone:"+234 805 678 9012", initials:"NA", avatarColor:C.orange,   skills:["Talent Acquisition","Performance Mgmt","HRIS"],                                  status:"approved",  joinDate:"2025-03-14", profileViews:0, cv:true,  photo:true  },
  { id:6,  name:"Babatunde Fashola", role:"Data Scientist",         location:"Lagos",         origin:"Lagos State",   email:"babatunde.fashola@email.com",  phone:"+234 806 789 0123", initials:"BF", avatarColor:"#1A6B8A", skills:["Python","Machine Learning","TensorFlow","NLP"],                                  status:"approved",  joinDate:"2025-02-28", profileViews:0, cv:true,  photo:false },
  { id:7,  name:"Tunde Bakare",      role:"Software Architect",     location:"Lagos",         origin:"Oyo State",     email:"tunde.bakare@email.com",       phone:"+234 807 890 1234", initials:"TB", avatarColor:"#5B21B6", skills:["Java","Microservices","Kubernetes","System Design"],                             status:"pending",   joinDate:"2025-04-01", profileViews:0, cv:true,  photo:true  },
  { id:8,  name:"Amaka Eze",         role:"UX Designer",            location:"Enugu",         origin:"Enugu State",   email:"amaka.eze@email.com",          phone:"+234 808 901 2345", initials:"AE", avatarColor:"#0891B2", skills:["Figma","User Research","Prototyping","Design Systems"],                          status:"pending",   joinDate:"2025-04-03", profileViews:0, cv:false, photo:true  },
  { id:9,  name:"Ibrahim Musa",      role:"DevOps Engineer",        location:"Kano",          origin:"Kano State",    email:"ibrahim.musa@email.com",       phone:"+234 809 012 3456", initials:"IM", avatarColor:"#047857", skills:["AWS","Terraform","CI/CD","Docker"],                                               status:"pending",   joinDate:"2025-04-05", profileViews:0, cv:true,  photo:false },
  { id:10, name:"Chioma Nwosu",      role:"Legal Counsel",          location:"Lagos",         origin:"Imo State",     email:"chioma.nwosu@email.com",       phone:"+234 810 123 4567", initials:"CN", avatarColor:"#B45309", skills:["Corporate Law","Contract Drafting","Compliance"],                                status:"rejected",  joinDate:"2025-03-20", profileViews:0, cv:false, photo:false },
];

const SEED_EMPLOYERS = [
  { id:1, company:"Flutterwave",   industry:"Fintech",    location:"Lagos",       contact:"Sarah Johnson",  email:"sarah@flutterwave.com",  status:"active",   joined:"2025-01-10", invitesSent:14, hires:3,  verified:true,  initials:"FL", avatarColor:"#F5622D" },
  { id:2, company:"Andela",        industry:"Tech",       location:"Lagos",       contact:"Michael Chen",   email:"michael@andela.com",     status:"active",   joined:"2025-01-14", invitesSent:22, hires:7,  verified:true,  initials:"AN", avatarColor:C.blue    },
  { id:3, company:"MTN Nigeria",   industry:"Telecom",    location:"Lagos",       contact:"Amara Diallo",   email:"amara@mtn.com",          status:"active",   joined:"2025-01-20", invitesSent:8,  hires:2,  verified:true,  initials:"MT", avatarColor:"#B7791F" },
  { id:4, company:"Kuda Bank",     industry:"Fintech",    location:"Lagos",       contact:"Aisha Bello",    email:"aisha@kuda.com",         status:"active",   joined:"2025-02-01", invitesSent:5,  hires:1,  verified:false, initials:"KU", avatarColor:"#6D28D9" },
  { id:5, company:"Jumia Nigeria", industry:"E-commerce", location:"Lagos",       contact:"Emeka Osei",     email:"emeka@jumia.com",        status:"pending",  joined:"2025-04-02", invitesSent:0,  hires:0,  verified:false, initials:"JU", avatarColor:"#F59E0B" },
  { id:6, company:"Paystack",      industry:"Fintech",    location:"Lagos",       contact:"Zainab Musa",    email:"zainab@paystack.com",    status:"suspended",joined:"2025-02-15", invitesSent:3,  hires:0,  verified:true,  initials:"PS", avatarColor:"#10B981" },
];

const SEED_AUDIT = [
  { id:1, time:"10:42 AM",  action:"Candidate approved",        actor:"Chinyere Obi",  target:"Tunde Bakare",    type:"approve"  },
  { id:2, time:"10:30 AM",  action:"Employer suspended",        actor:"Dele Adeyemo",  target:"Paystack",        type:"suspend"  },
  { id:3, time:"10:15 AM",  action:"Candidate rejected",        actor:"Chinyere Obi",  target:"Chioma Nwosu",    type:"reject"   },
  { id:4, time:"09:58 AM",  action:"New employer registered",   actor:"System",        target:"Jumia Nigeria",   type:"info"     },
  { id:5, time:"09:44 AM",  action:"New candidate registered",  actor:"System",        target:"Ibrahim Musa",    type:"info"     },
  { id:6, time:"09:30 AM",  action:"Employer verified",         actor:"Chinyere Obi",  target:"Kuda Bank",       type:"approve"  },
  { id:7, time:"Yesterday", action:"Candidate approved",        actor:"Dele Adeyemo",  target:"Ngozi Adeleke",   type:"approve"  },
  { id:8, time:"Yesterday", action:"Platform settings updated", actor:"Chinyere Obi",  target:"Global Settings", type:"settings" },
];

// ─── SHARED UI PRIMITIVES (admin scope) ──────────────────────────────────────
const Av = ({ initials, color, size=40, radius=10 }) => (
  <div style={{ width:size, height:size, borderRadius:radius, background:color,
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:size*0.34, fontWeight:800, color:C.white, flexShrink:0 }}>
    {initials}
  </div>
);

const Card = ({ children, style:s={} }) => (
  <div style={{ background:C.white, borderRadius:14, padding:"20px 22px",
    boxShadow:"0 2px 14px rgba(10,22,40,0.07)", marginBottom:16, ...s }}>
    {children}
  </div>
);

const SecLbl = ({ children }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
    <span style={{ fontSize:11, fontWeight:700, color:C.adminAccent,
      letterSpacing:"2px", textTransform:"uppercase", whiteSpace:"nowrap" }}>{children}</span>
    <div style={{ flex:1, height:1, background:C.lightGray }}/>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    approved:  { bg:C.greenLight,  color:C.green,   label:"Approved"  },
    pending:   { bg:"#FEF3C7",     color:"#92400E", label:"Pending"   },
    rejected:  { bg:C.redLight,    color:C.red,     label:"Rejected"  },
    active:    { bg:C.greenLight,  color:C.green,   label:"Active"    },
    suspended: { bg:C.redLight,    color:C.red,     label:"Suspended" },
    inactive:  { bg:C.lightGray,   color:C.slate,   label:"Inactive"  },
  };
  const s = map[status] || map.inactive;
  return (
    <span style={{ background:s.bg, color:s.color, borderRadius:20,
      padding:"3px 10px", fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>
      {s.label}
    </span>
  );
};

// ─── ADMIN LOGIN PAGE ─────────────────────────────────────────────────────────
function AdminLoginPage({ onLogin }) {
  const [form,    setForm]    = useState({ email:"", password:"" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!form.email || !form.password) { setError("Please enter your admin credentials."); return; }
    setError(""); setLoading(true);
    setTimeout(() => {
      const admin = adminAuthenticate(form.email, form.password);
      if (!admin) {
        setError("Invalid admin credentials. This portal is for authorised administrators only.");
        setLoading(false);
        return;
      }
      onLogin(admin);
    }, 600);
  };

  return (
    <div style={{ minHeight:"100vh", width:"100%", display:"flex", alignItems:"center", justifyContent:"center",
      padding:20, position:"relative", overflow:"hidden",
      background:"linear-gradient(135deg, #1e0a3c 0%, #0A1628 60%, #0f2a1a 100%)" }}>

      {/* Ambient glow blobs */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:"radial-gradient(circle at 15% 50%, rgba(124,58,237,0.12) 0%, transparent 50%), radial-gradient(circle at 85% 20%, rgba(201,168,76,0.08) 0%, transparent 50%)" }}/>

      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:420 }}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)",
            borderRadius:20, padding:"5px 14px", marginBottom:16 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:C.adminAccent,
              boxShadow:`0 0 6px ${C.adminAccent}` }}/>
            <span style={{ fontSize:10, fontWeight:700, color:"#A78BFA",
              letterSpacing:"2px", textTransform:"uppercase" }}>Admin Portal</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:6 }}>
            <div style={{ width:36, height:36, background:C.gold, borderRadius:9,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontWeight:900, fontSize:16, color:C.navy }}>T</div>
            <span style={{ color:C.white, fontWeight:800, fontSize:22 }}>TalentBridge</span>
          </div>
          <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>Super Admin Dashboard</div>
        </div>

        {/* Form card */}
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:20, padding:"36px 32px", backdropFilter:"blur(10px)" }}>
          <div style={{ fontSize:20, fontWeight:800, color:C.white, marginBottom:4 }}>
            Administrator Sign In
          </div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:26 }}>
            Restricted access · Authorised personnel only
          </div>

          {/* Email */}
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700,
              color:"rgba(255,255,255,0.5)", letterSpacing:"1px",
              textTransform:"uppercase", marginBottom:6 }}>Email Address</label>
            <input type="email" value={form.email}
              onChange={e => setForm(p => ({...p, email:e.target.value}))}
              onKeyDown={e => e.key==="Enter" && handleLogin()}
              placeholder="admin@talentbridge.com"
              style={{ width:"100%", border:"1.5px solid rgba(255,255,255,0.12)", borderRadius:8,
                padding:"11px 14px", fontSize:14, color:C.white,
                background:"rgba(255,255,255,0.07)", outline:"none",
                fontFamily:"inherit", boxSizing:"border-box" }}/>
          </div>

          {/* Password */}
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700,
              color:"rgba(255,255,255,0.5)", letterSpacing:"1px",
              textTransform:"uppercase", marginBottom:6 }}>Password</label>
            <input type="password" value={form.password}
              onChange={e => setForm(p => ({...p, password:e.target.value}))}
              onKeyDown={e => e.key==="Enter" && handleLogin()}
              placeholder="••••••••"
              style={{ width:"100%", border:"1.5px solid rgba(255,255,255,0.12)", borderRadius:8,
                padding:"11px 14px", fontSize:14, color:C.white,
                background:"rgba(255,255,255,0.07)", outline:"none",
                fontFamily:"inherit", boxSizing:"border-box" }}/>
          </div>

          {error && (
            <div style={{ background:"rgba(192,57,43,0.15)", border:"1px solid rgba(192,57,43,0.3)",
              borderRadius:8, padding:"10px 13px", fontSize:12, color:"#FCA5A5",
              marginBottom:16, lineHeight:1.5 }}>⚠️ {error}</div>
          )}

          <button onClick={handleLogin} disabled={loading}
            style={{ width:"100%", background:loading ? "rgba(124,58,237,0.5)" : C.adminAccent,
              color:C.white, border:"none", borderRadius:10, padding:"13px",
              fontSize:14, fontWeight:700, cursor:loading ? "not-allowed" : "pointer",
              transition:"all 0.2s" }}>
            {loading ? "Authenticating…" : "🔐 Sign In to Admin Portal"}
          </button>

          {/* Demo hint — remove in production */}
          <div style={{ marginTop:20, background:"rgba(201,168,76,0.08)",
            border:"1px solid rgba(201,168,76,0.15)", borderRadius:8,
            padding:"10px 13px", fontSize:11, color:"rgba(255,255,255,0.4)", lineHeight:1.7 }}>
            <strong style={{ color:"rgba(201,168,76,0.7)" }}>Demo credentials:</strong><br/>
            admin@talentbridge.com / admin2025<br/>
            ops@talentbridge.com / ops2025
          </div>
        </div>

        <div style={{ textAlign:"center", marginTop:18, fontSize:11, color:"rgba(255,255,255,0.2)" }}>
          Candidate or employer?{" "}
          <span style={{ color:"rgba(201,168,76,0.6)", fontWeight:600 }}>
            Visit talentbridge.io
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN NAV ────────────────────────────────────────────────────────────────
function AdminNav({ admin, activeTab, onTab, onLogout, pendingCount }) {
  const tabs = [
    { id:"overview",   label:"Overview",   icon:"📊" },
    { id:"candidates", label:"Candidates", icon:"👥", badge:pendingCount },
    { id:"employers",  label:"Employers",  icon:"🏢" },
    { id:"settings",   label:"Settings",   icon:"⚙️" },
    { id:"audit",      label:"Audit Log",  icon:"📋" },
  ];

  return (
    <nav style={{ background:C.navy, height:60, display:"flex", alignItems:"center",
      justifyContent:"space-between", padding:"0 22px", position:"sticky", top:0,
      zIndex:100, boxShadow:"0 2px 20px rgba(10,22,40,0.4)", gap:12 }}>

      {/* Logo + admin badge */}
      <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        <div style={{ width:28, height:28, background:C.adminAccent, borderRadius:7,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontWeight:900, fontSize:13, color:C.white }}>T</div>
        <div>
          <span style={{ color:C.white, fontWeight:700, fontSize:14 }}>TalentBridge</span>
          <span style={{ background:C.adminAccent, color:C.white, fontSize:8, fontWeight:700,
            letterSpacing:"1px", textTransform:"uppercase", borderRadius:4,
            padding:"2px 6px", marginLeft:6 }}>ADMIN</span>
        </div>
      </div>

      {/* Tab buttons */}
      <div style={{ display:"flex", gap:3, alignItems:"center" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => onTab(t.id)}
            style={{ position:"relative", padding:"7px 12px", borderRadius:6, border:"none",
              cursor:"pointer", fontSize:12, fontWeight:600,
              background:activeTab===t.id ? C.adminAccent : "transparent",
              color:activeTab===t.id ? C.white : "rgba(255,255,255,0.6)",
              transition:"all 0.15s", display:"flex", alignItems:"center", gap:4 }}>
            <span>{t.icon}</span><span>{t.label}</span>
            {t.badge > 0 && (
              <span style={{ background:C.gold, color:C.navy, borderRadius:10,
                padding:"1px 6px", fontSize:9, fontWeight:800, marginLeft:2 }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Admin identity + sign out */}
      <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        <Av initials={admin.initials} color={C.adminAccent} size={30} radius={7}/>
        <div>
          <div style={{ fontSize:11, color:C.white, fontWeight:600 }}>{admin.name}</div>
          <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.5px" }}>
            {admin.role === "super_admin" ? "Super Admin" : "Ops Admin"}
          </div>
        </div>
        <button onClick={onLogout}
          style={{ padding:"5px 11px", borderRadius:6, border:"1.5px solid rgba(255,255,255,0.15)",
            background:"transparent", color:"rgba(255,255,255,0.5)", fontSize:11,
            fontWeight:600, cursor:"pointer" }}>Sign Out</button>
      </div>
    </nav>
  );
}

// ─── STATS BAR ────────────────────────────────────────────────────────────────
function StatsBar({ candidates, employers }) {
  const approved   = candidates.filter(c => c.status==="approved").length;
  const pending    = candidates.filter(c => c.status==="pending").length;
  const rejected   = candidates.filter(c => c.status==="rejected").length;
  const activeEmp  = employers.filter(e => e.status==="active").length;
  const pendingEmp = employers.filter(e => e.status==="pending").length;
  const totalHires = employers.reduce((s,e) => s+e.hires, 0);

  const stats = [
    { label:"Total Candidates", val:candidates.length, color:C.navy,        icon:"👥" },
    { label:"Approved",         val:approved,          color:C.green,       icon:"✅" },
    { label:"Pending Review",   val:pending,           color:"#B45309",     icon:"⏳", highlight:pending>0 },
    { label:"Rejected",         val:rejected,          color:C.red,         icon:"✕"  },
    { label:"Active Employers", val:activeEmp,         color:C.blue,        icon:"🏢" },
    { label:"Pending Employers",val:pendingEmp,        color:"#B45309",     icon:"🕐", highlight:pendingEmp>0 },
    { label:"Total Hires",      val:totalHires,        color:C.adminAccent, icon:"🏆" },
  ];

  return (
    <div style={{ display:"flex", gap:14, marginBottom:28, width:"100%" }}>
      {stats.map(s => (
        <div key={s.label} style={{ flex:1, minWidth:0,
            background:s.highlight ? `${s.color}10` : C.white, borderRadius:14,
            padding:"20px 16px 18px", boxShadow:"0 2px 12px rgba(10,22,40,0.08)",
            border:s.highlight ? `1.5px solid ${s.color}40` : `1px solid ${C.lightGray}` }}>
          <div style={{ fontSize:18, marginBottom:10 }}>{s.icon}</div>
          <div style={{ fontSize:48, fontWeight:900, color:s.color, lineHeight:1, marginBottom:8 }}>{s.val}</div>
          <div style={{ fontSize:11, color:C.slateLight, fontWeight:600,
            textTransform:"uppercase", letterSpacing:"0.8px", lineHeight:1.3 }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────
function AuditLog({ log }) {
  const iconMap  = { approve:"✅", reject:"✕", suspend:"🚫", info:"ℹ️", settings:"⚙️" };
  const colorMap = { approve:C.green, reject:C.red, suspend:C.red, info:C.blue, settings:C.adminAccent };

  return (
    <Card>
      <SecLbl>Recent Activity</SecLbl>
      {log.map((entry, i) => (
        <div key={entry.id}
          style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"10px 0",
            borderBottom:i<log.length-1 ? `1px solid ${C.lightGray}` : "none" }}>
          <div style={{ width:30, height:30, borderRadius:8,
            background:`${colorMap[entry.type]}15`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:14, flexShrink:0 }}>{iconMap[entry.type]}</div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
              <div>
                <span style={{ fontSize:13, fontWeight:600, color:C.navy }}>{entry.action}</span>
                <span style={{ fontSize:12, color:C.slateLight }}> · {entry.target}</span>
              </div>
              <span style={{ fontSize:11, color:C.slateLight, whiteSpace:"nowrap" }}>{entry.time}</span>
            </div>
            <div style={{ fontSize:11, color:C.slateLight, marginTop:2 }}>by {entry.actor}</div>
          </div>
        </div>
      ))}
    </Card>
  );
}

// ─── OVERVIEW DASHBOARD ───────────────────────────────────────────────────────
function OverviewDashboard({ candidates, employers, auditLog, onTab }) {
  const pending    = candidates.filter(c => c.status==="pending");
  const topEmps    = [...employers].sort((a,b) => b.hires-a.hires).slice(0,4);

  return (
    <div>
      <StatsBar candidates={candidates} employers={employers}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        {/* Pending approvals */}
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:800, color:C.navy }}>⏳ Pending Approvals</div>
            {pending.length > 0 && (
              <button onClick={() => onTab("candidates")}
                style={{ background:C.adminAccentLight, color:C.adminAccent, border:"none",
                  borderRadius:6, padding:"4px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                Review all →
              </button>
            )}
          </div>
          {pending.length === 0
            ? <div style={{ textAlign:"center", padding:"18px 0", color:C.slateLight, fontSize:13 }}>🎉 No pending approvals</div>
            : pending.map(c => (
              <div key={c.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0",
                borderBottom:`1px solid ${C.lightGray}` }}>
                <Av initials={c.initials} color={c.avatarColor} size={32} radius={8}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.navy }}>{c.name}</div>
                  <div style={{ fontSize:11, color:C.slateLight }}>{c.role} · {c.location}</div>
                </div>
                <span style={{ background:"#FEF3C7", color:"#92400E", borderRadius:20,
                  padding:"2px 8px", fontSize:10, fontWeight:700 }}>Pending</span>
              </div>
            ))
          }
        </Card>

        {/* Top employers */}
        <Card>
          <div style={{ fontSize:13, fontWeight:800, color:C.navy, marginBottom:14 }}>🏆 Top Employers by Hires</div>
          {topEmps.map((e,i) => (
            <div key={e.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0",
              borderBottom:i<topEmps.length-1 ? `1px solid ${C.lightGray}` : "none" }}>
              <Av initials={e.initials} color={e.avatarColor} size={32} radius={8}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.navy }}>{e.company}</div>
                <div style={{ fontSize:11, color:C.slateLight }}>{e.invitesSent} invites sent</div>
              </div>
              <div style={{ fontSize:16, fontWeight:900, color:C.green }}>{e.hires}</div>
            </div>
          ))}
        </Card>
      </div>
      <AuditLog log={auditLog}/>
    </div>
  );
}

// ─── CANDIDATE APPROVAL QUEUE ─────────────────────────────────────────────────
function CandidateApprovalQueue({ candidates, onUpdateStatus }) {
  const [filter,        setFilter]        = useState("pending");
  const [search,        setSearch]        = useState("");
  const [selected,      setSelected]      = useState(null);
  const [note,          setNote]          = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const counts = {
    all:      candidates.length,
    pending:  candidates.filter(c => c.status==="pending").length,
    approved: candidates.filter(c => c.status==="approved").length,
    rejected: candidates.filter(c => c.status==="rejected").length,
  };

  const filtered = candidates.filter(c => {
    const matchStatus = filter==="all" || c.status===filter;
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q) || c.location.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const handleAction = (id, action) => setConfirmAction({ id, action });

  const confirmDo = () => {
    if (!confirmAction) return;
    const newStatus = confirmAction.action==="approve" ? "approved" : "rejected";
    onUpdateStatus(confirmAction.id, newStatus);
    if (selected?.id === confirmAction.id) setSelected(p => ({...p, status:newStatus}));
    setConfirmAction(null);
  };

  const FILTER_TABS = [
    { key:"pending",  label:`Pending (${counts.pending})`,  color:"#92400E", bg:"#FEF3C7"   },
    { key:"approved", label:`Approved (${counts.approved})`,color:C.green,   bg:C.greenLight },
    { key:"rejected", label:`Rejected (${counts.rejected})`,color:C.red,     bg:C.redLight   },
    { key:"all",      label:`All (${counts.all})`,          color:C.navy,    bg:C.lightGray  },
  ];

  return (
    <div>
      {/* Filters row */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap",
        alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {FILTER_TABS.map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              style={{ padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer",
                fontSize:12, fontWeight:600,
                background:filter===t.key ? t.color : C.white,
                color:filter===t.key ? C.white : C.slate,
                boxShadow:"0 1px 6px rgba(10,22,40,0.08)", transition:"all 0.15s" }}>
              {t.label}
            </button>
          ))}
        </div>
        <input placeholder="Search name, role, location…" value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ border:`1.5px solid ${C.lightGray}`, borderRadius:8, padding:"7px 12px",
            fontSize:13, color:C.navy, background:C.cream, outline:"none",
            fontFamily:"inherit", width:220 }}/>
      </div>

      {/* Table */}
      <Card style={{ padding:0, overflow:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
          <thead>
            <tr style={{ background:C.cream }}>
              {["Candidate","Role","Location","Joined","Status","Actions"].map(h => (
                <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:10,
                  fontWeight:700, color:C.slate, textTransform:"uppercase",
                  letterSpacing:"1px", borderBottom:`1px solid ${C.lightGray}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding:"32px", textAlign:"center",
                color:C.slateLight, fontSize:13 }}>No candidates found for this filter.</td></tr>
            )}
            {filtered.map((c,i) => (
              <tr key={c.id}
                onMouseEnter={e => e.currentTarget.style.background=C.cream}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}
                style={{ borderBottom:i<filtered.length-1?`1px solid ${C.lightGray}`:"none",
                  transition:"background 0.1s" }}>
                <td style={{ padding:"12px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Av initials={c.initials} color={c.avatarColor} size={34} radius={8}/>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:C.navy, cursor:"pointer" }}
                        onClick={() => { setSelected(c); setNote(""); }}>{c.name}</div>
                      <div style={{ fontSize:11, color:C.slateLight }}>{c.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding:"12px 16px", fontSize:12, color:C.slate }}>{c.role}</td>
                <td style={{ padding:"12px 16px", fontSize:12, color:C.slate }}>{c.location}</td>
                <td style={{ padding:"12px 16px", fontSize:11, color:C.slateLight, whiteSpace:"nowrap" }}>{c.joinDate}</td>
                <td style={{ padding:"12px 16px" }}><StatusBadge status={c.status}/></td>
                <td style={{ padding:"12px 16px" }}>
                  <div style={{ display:"flex", gap:6 }}>
                    {c.status!=="approved" && (
                      <button onClick={() => handleAction(c.id,"approve")}
                        style={{ background:C.greenLight, color:C.green, border:"none",
                          borderRadius:6, padding:"5px 10px", fontSize:11,
                          fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>✓ Approve</button>
                    )}
                    {c.status!=="rejected" && (
                      <button onClick={() => handleAction(c.id,"reject")}
                        style={{ background:C.redLight, color:C.red, border:"none",
                          borderRadius:6, padding:"5px 10px", fontSize:11,
                          fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>✕ Reject</button>
                    )}
                    <button onClick={() => { setSelected(c); setNote(""); }}
                      style={{ background:C.lightGray, color:C.navy, border:"none",
                        borderRadius:6, padding:"5px 10px", fontSize:11,
                        fontWeight:600, cursor:"pointer" }}>View</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Candidate detail slide-in */}
      {selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(10,22,40,0.55)", zIndex:200,
          display:"flex", alignItems:"center", justifyContent:"flex-end" }}
          onClick={() => setSelected(null)}>
          <div style={{ background:C.white, width:"100%", maxWidth:420, height:"100%",
            overflowY:"auto", boxShadow:"-8px 0 40px rgba(10,22,40,0.2)", padding:"28px 24px" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ fontSize:15, fontWeight:800, color:C.navy }}>Candidate Detail</div>
              <button onClick={() => setSelected(null)}
                style={{ background:C.lightGray, border:"none", borderRadius:6,
                  padding:"5px 10px", cursor:"pointer", fontSize:13, color:C.navy }}>✕</button>
            </div>
            <div style={{ display:"flex", gap:14, alignItems:"center", marginBottom:20 }}>
              <Av initials={selected.initials} color={selected.avatarColor} size={56} radius={13}/>
              <div>
                <div style={{ fontSize:18, fontWeight:800, color:C.navy }}>{selected.name}</div>
                <div style={{ fontSize:13, color:C.gold, fontWeight:600 }}>{selected.role}</div>
                <div style={{ marginTop:6 }}><StatusBadge status={selected.status}/></div>
              </div>
            </div>

            <SecLbl>Contact</SecLbl>
            {[["📍 Location",selected.location],["🏠 Origin",selected.origin],
              ["✉️ Email",selected.email],["📞 Phone",selected.phone]].map(([l,v]) => (
              <div key={l} style={{ display:"flex", gap:10, marginBottom:8 }}>
                <span style={{ fontSize:11, color:C.slateLight, width:90, flexShrink:0, fontWeight:600 }}>{l}</span>
                <span style={{ fontSize:13, color:C.navy }}>{v}</span>
              </div>
            ))}

            <SecLbl>Documents</SecLbl>
            <div style={{ display:"flex", gap:8, marginBottom:16 }}>
              <span style={{ background:selected.cv?C.greenLight:C.redLight,
                color:selected.cv?C.green:C.red, borderRadius:6, padding:"4px 10px",
                fontSize:12, fontWeight:700 }}>
                {selected.cv ? "✓ CV Uploaded" : "✕ No CV"}
              </span>
              <span style={{ background:selected.photo?C.greenLight:C.redLight,
                color:selected.photo?C.green:C.red, borderRadius:6, padding:"4px 10px",
                fontSize:12, fontWeight:700 }}>
                {selected.photo ? "✓ Photo" : "✕ No Photo"}
              </span>
            </div>

            <SecLbl>Skills</SecLbl>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
              {selected.skills.map(s => (
                <span key={s} style={{ background:C.lightGray, color:C.navy, borderRadius:6,
                  padding:"4px 10px", fontSize:12, fontWeight:600 }}>{s}</span>
              ))}
            </div>

            <SecLbl>Admin Note</SecLbl>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Add an internal note (not visible to users)…"
              style={{ width:"100%", border:`1.5px solid ${C.lightGray}`, borderRadius:8,
                padding:"10px 12px", fontSize:13, color:C.navy, background:C.cream,
                outline:"none", fontFamily:"inherit", resize:"vertical", minHeight:80,
                boxSizing:"border-box", marginBottom:14 }}/>

            {selected.status === "pending" && (
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => handleAction(selected.id,"approve")}
                  style={{ flex:1, background:C.green, color:C.white, border:"none",
                    borderRadius:8, padding:"11px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                  ✓ Approve
                </button>
                <button onClick={() => handleAction(selected.id,"reject")}
                  style={{ flex:1, background:C.red, color:C.white, border:"none",
                    borderRadius:8, padding:"11px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                  ✕ Reject
                </button>
              </div>
            )}
            {selected.status === "approved" && (
              <button onClick={() => handleAction(selected.id,"reject")}
                style={{ width:"100%", background:C.redLight, color:C.red, border:"none",
                  borderRadius:8, padding:"11px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                Revoke Approval
              </button>
            )}
            {selected.status === "rejected" && (
              <button onClick={() => handleAction(selected.id,"approve")}
                style={{ width:"100%", background:C.greenLight, color:C.green, border:"none",
                  borderRadius:8, padding:"11px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                Re-approve
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      {confirmAction && (
        <div style={{ position:"fixed", inset:0, background:"rgba(10,22,40,0.6)", zIndex:300,
          display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
          onClick={() => setConfirmAction(null)}>
          <div style={{ background:C.white, borderRadius:16, padding:"28px 26px", maxWidth:380, width:"100%",
            boxShadow:"0 16px 50px rgba(10,22,40,0.25)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:16, fontWeight:800, color:C.navy, marginBottom:8 }}>
              Confirm {confirmAction.action === "approve" ? "Approval" : "Rejection"}
            </div>
            <div style={{ fontSize:13, color:C.slate, lineHeight:1.6, marginBottom:22 }}>
              Are you sure you want to <strong>{confirmAction.action}</strong> this candidate?
              This will update their status and notify them by email.
            </div>
            <div style={{ display:"flex", gap:9 }}>
              <button onClick={() => setConfirmAction(null)}
                style={{ flex:1, background:C.lightGray, color:C.navy, border:"none",
                  borderRadius:8, padding:"11px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Cancel</button>
              <button onClick={confirmDo}
                style={{ flex:2,
                  background:confirmAction.action==="approve" ? C.green : C.red,
                  color:C.white, border:"none", borderRadius:8, padding:"11px",
                  fontSize:13, fontWeight:700, cursor:"pointer" }}>
                {confirmAction.action==="approve" ? "✓ Yes, Approve" : "✕ Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EMPLOYER MANAGEMENT ──────────────────────────────────────────────────────
function EmployerManagement({ employers, onUpdateStatus }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const counts = {
    all:       employers.length,
    active:    employers.filter(e => e.status==="active").length,
    pending:   employers.filter(e => e.status==="pending").length,
    suspended: employers.filter(e => e.status==="suspended").length,
  };

  const filtered = employers.filter(e => {
    const matchStatus = filter==="all" || e.status===filter;
    const q = search.toLowerCase();
    const matchSearch = !q || e.company.toLowerCase().includes(q) || e.contact.toLowerCase().includes(q) || e.industry.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div>
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap",
        alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {[["all","All"],["active","Active"],["pending","Pending"],["suspended","Suspended"]].map(([k,l]) => (
            <button key={k} onClick={() => setFilter(k)}
              style={{ padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer",
                fontSize:12, fontWeight:600,
                background:filter===k ? C.navy : C.white, color:filter===k ? C.white : C.slate,
                boxShadow:"0 1px 6px rgba(10,22,40,0.08)" }}>
              {l} ({counts[k]})
            </button>
          ))}
        </div>
        <input placeholder="Search company, contact, industry…" value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ border:`1.5px solid ${C.lightGray}`, borderRadius:8, padding:"7px 12px",
            fontSize:13, color:C.navy, background:C.cream, outline:"none", fontFamily:"inherit", width:240 }}/>
      </div>

      <Card style={{ padding:0, overflow:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:800 }}>
          <thead>
            <tr style={{ background:C.cream }}>
              {["Company","Industry","Contact","Invites","Hires","Verified","Status","Actions"].map(h => (
                <th key={h} style={{ padding:"11px 14px", textAlign:"left", fontSize:10,
                  fontWeight:700, color:C.slate, textTransform:"uppercase",
                  letterSpacing:"1px", borderBottom:`1px solid ${C.lightGray}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e,i) => (
              <tr key={e.id}
                onMouseEnter={ev => ev.currentTarget.style.background=C.cream}
                onMouseLeave={ev => ev.currentTarget.style.background="transparent"}
                style={{ borderBottom:i<filtered.length-1?`1px solid ${C.lightGray}`:"none" }}>
                <td style={{ padding:"11px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Av initials={e.initials} color={e.avatarColor} size={32} radius={7}/>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:C.navy }}>{e.company}</div>
                      <div style={{ fontSize:10, color:C.slateLight }}>{e.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding:"11px 14px", fontSize:12, color:C.slate }}>{e.industry}</td>
                <td style={{ padding:"11px 14px", fontSize:12, color:C.slate }}>{e.contact}</td>
                <td style={{ padding:"11px 14px", fontSize:13, fontWeight:700, color:C.navy, textAlign:"center" }}>{e.invitesSent}</td>
                <td style={{ padding:"11px 14px", fontSize:13, fontWeight:700, color:C.green, textAlign:"center" }}>{e.hires}</td>
                <td style={{ padding:"11px 14px", textAlign:"center" }}>
                  <span style={{ fontSize:14 }}>{e.verified ? "✅" : "—"}</span>
                </td>
                <td style={{ padding:"11px 14px" }}><StatusBadge status={e.status}/></td>
                <td style={{ padding:"11px 14px" }}>
                  <div style={{ display:"flex", gap:5 }}>
                    {e.status==="pending"   && <button onClick={() => onUpdateStatus(e.id,"active")}    style={{ background:C.greenLight, color:C.green, border:"none", borderRadius:6, padding:"4px 9px", fontSize:11, fontWeight:700, cursor:"pointer" }}>Activate</button>}
                    {e.status==="active"    && <button onClick={() => onUpdateStatus(e.id,"suspended")} style={{ background:C.redLight,   color:C.red,   border:"none", borderRadius:6, padding:"4px 9px", fontSize:11, fontWeight:700, cursor:"pointer" }}>Suspend</button>}
                    {e.status==="suspended" && <button onClick={() => onUpdateStatus(e.id,"active")}    style={{ background:C.greenLight, color:C.green, border:"none", borderRadius:6, padding:"4px 9px", fontSize:11, fontWeight:700, cursor:"pointer" }}>Reinstate</button>}
                    {!e.verified            && <button onClick={() => onUpdateStatus(e.id,"verify")}    style={{ background:C.blueLight,  color:C.blue,  border:"none", borderRadius:6, padding:"4px 9px", fontSize:11, fontWeight:600, cursor:"pointer" }}>Verify</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── PLATFORM SETTINGS ────────────────────────────────────────────────────────
function PlatformSettings() {
  const [settings, setSettings] = useState({
    autoApprove:         false,
    requirePhoto:        true,
    requireCV:           false,
    maxSkills:           15,
    minSkills:           3,
    profileVisibility:   "approved_only",
    allowSelfSignup:     true,
    emailNotifications:  true,
    maintenanceMode:     false,
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key) => setSettings(p => ({...p, [key]: !p[key]}));
  const save   = ()    => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const Toggle = ({ k, label, desc }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"14px 0", borderBottom:`1px solid ${C.lightGray}` }}>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:600, color:C.navy }}>{label}</div>
        {desc && <div style={{ fontSize:12, color:C.slateLight, marginTop:2 }}>{desc}</div>}
      </div>
      <div onClick={() => toggle(k)}
        style={{ width:44, height:24, borderRadius:12,
          background:settings[k] ? C.adminAccent : C.midGray,
          cursor:"pointer", position:"relative", transition:"background 0.25s",
          flexShrink:0, marginLeft:16 }}>
        <div style={{ position:"absolute", top:3, left:settings[k]?20:3, width:18, height:18,
          borderRadius:"50%", background:C.white, transition:"left 0.25s",
          boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:1200 }}>
      <Card>
        <SecLbl>Candidate Settings</SecLbl>
        <Toggle k="autoApprove"  label="Auto-approve candidates"  desc="Bypass manual review — not recommended for production"/>
        <Toggle k="requirePhoto" label="Require profile photo"    desc="Candidates must upload a headshot before going live"/>
        <Toggle k="requireCV"    label="Require CV upload"        desc="Candidates must upload a CV to be approved"/>
        <div style={{ padding:"14px 0", borderBottom:`1px solid ${C.lightGray}` }}>
          <div style={{ fontSize:14, fontWeight:600, color:C.navy, marginBottom:10 }}>Minimum skills required</div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <input type="number" value={settings.minSkills}
              onChange={e => setSettings(p => ({...p, minSkills:parseInt(e.target.value)||0}))}
              style={{ width:70, border:`1.5px solid ${C.lightGray}`, borderRadius:8,
                padding:"7px 10px", fontSize:14, color:C.navy, background:C.cream,
                outline:"none", textAlign:"center" }}/>
            <span style={{ fontSize:13, color:C.slateLight }}>skills minimum to be searchable</span>
          </div>
        </div>
        <div style={{ padding:"14px 0" }}>
          <div style={{ fontSize:14, fontWeight:600, color:C.navy, marginBottom:10 }}>Profile visibility</div>
          <select value={settings.profileVisibility}
            onChange={e => setSettings(p => ({...p, profileVisibility:e.target.value}))}
            style={{ width:"100%", border:`1.5px solid ${C.lightGray}`, borderRadius:8,
              padding:"9px 12px", fontSize:13, color:C.navy, background:C.cream,
              outline:"none", fontFamily:"inherit", cursor:"pointer" }}>
            <option value="approved_only">Approved candidates only</option>
            <option value="all_verified">All verified candidates</option>
            <option value="public">Public (all registered)</option>
          </select>
        </div>
      </Card>

      <Card>
        <SecLbl>Platform Settings</SecLbl>
        <Toggle k="allowSelfSignup"    label="Allow self-signup"      desc="Employers and candidates can register without an invite"/>
        <Toggle k="emailNotifications" label="Email notifications"    desc="Send automated emails on approvals, invites, and hires"/>
        <Toggle k="maintenanceMode"    label="Maintenance mode"       desc="Take the platform offline for users (admin access still works)"/>
      </Card>

      <button onClick={save}
        style={{ background:saved ? C.green : C.adminAccent, color:C.white, border:"none",
          borderRadius:10, padding:"13px 28px", fontSize:14, fontWeight:700,
          cursor:"pointer", transition:"background 0.3s" }}>
        {saved ? "✓ Settings Saved!" : "Save Platform Settings"}
      </button>
    </div>
  );
}

// ─── ROOT ADMIN PORTAL ────────────────────────────────────────────────────────
/**
 * Exported default — mounted only when path starts with /admin.
 * Shares zero state or context with UserPortal.
 */
export default function AdminPortal() {
  const [admin,      setAdmin]      = useState(null);
  const [candidates, setCandidates] = useState(SEED_CANDIDATES);
  const [employers,  setEmployers]  = useState(SEED_EMPLOYERS);
  const [auditLog,   setAuditLog]   = useState(SEED_AUDIT);
  const [activeTab,  setActiveTab]  = useState("overview");

  const handleLogin  = (adminUser) => { setAdmin(adminUser); setActiveTab("overview"); };
  const handleLogout = ()           => setAdmin(null);

  const updateCandidateStatus = (id, newStatus) => {
    setCandidates(prev => prev.map(c => c.id===id ? {...c, status:newStatus} : c));
    const c = candidates.find(c => c.id===id);
    if (c) setAuditLog(prev => [{
      id: Date.now(),
      time: new Date().toLocaleTimeString("en-NG",{hour:"2-digit",minute:"2-digit"}),
      action: `Candidate ${newStatus}`,
      actor: admin.name, target: c.name,
      type: newStatus==="approved" ? "approve" : "reject",
    }, ...prev]);
  };

  const updateEmployerStatus = (id, action) => {
    setEmployers(prev => prev.map(e => {
      if (e.id !== id) return e;
      if (action==="verify") return {...e, verified:true};
      return {...e, status:action};
    }));
    const e = employers.find(e => e.id===id);
    if (e) setAuditLog(prev => [{
      id: Date.now(),
      time: new Date().toLocaleTimeString("en-NG",{hour:"2-digit",minute:"2-digit"}),
      action: action==="verify" ? "Employer verified" : `Employer ${action}`,
      actor: admin.name, target: e.company,
      type: action==="active" ? "approve" : action==="suspended" ? "suspend" : "approve",
    }, ...prev]);
  };

  const pendingCount = candidates.filter(c => c.status==="pending").length;

  // Not logged in → isolated admin login
  if (!admin) return <AdminLoginPage onLogin={handleLogin}/>;

  // Logged in → admin dashboard
  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", minHeight:"100vh", width:"100%", background:C.cream }}>
      <AdminNav
        admin={admin}
        activeTab={activeTab}
        onTab={setActiveTab}
        onLogout={handleLogout}
        pendingCount={pendingCount}
      />
      <div style={{ maxWidth:1400, margin:"0 auto", padding:"30px 40px" }}>
        {/* Page title */}
        <div style={{ marginBottom:22 }}>
          <div style={{ fontSize:22, fontWeight:800, color:C.navy }}>
            {activeTab==="overview"   && "Platform Overview"}
            {activeTab==="candidates" && "Candidate Management"}
            {activeTab==="employers"  && "Employer Management"}
            {activeTab==="settings"   && "Platform Settings"}
            {activeTab==="audit"      && "Audit Log"}
          </div>
          <div style={{ fontSize:12, color:C.slateLight, marginTop:3 }}>
            Welcome back, {admin.name} ·{" "}
            {new Date().toLocaleDateString("en-NG",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
          </div>
        </div>

        {activeTab==="overview"   && <OverviewDashboard candidates={candidates} employers={employers} auditLog={auditLog} onTab={setActiveTab}/>}
        {activeTab==="candidates" && <CandidateApprovalQueue candidates={candidates} onUpdateStatus={updateCandidateStatus}/>}
        {activeTab==="employers"  && <EmployerManagement employers={employers} onUpdateStatus={updateEmployerStatus}/>}
        {activeTab==="settings"   && <PlatformSettings/>}
        {activeTab==="audit"      && <AuditLog log={auditLog}/>}
      </div>
    </div>
  );
}
