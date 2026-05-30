/**
 * UserPortal.jsx — TalentBridge User Portal
 * Route 1: / (root)
 *
 * Persona split:
 *   role === "employer"  → EmployerShell  (talent search + pipeline + company profile)
 *   role === "candidate" → CandidateShell (profile builder + completion + invitations)
 *
 * No admin code, no admin state, no admin navigation exists in this file.
 */

import { useState } from "react";

// ─── SHARED DESIGN SYSTEM ────────────────────────────────────────────────────
// Single source of truth for all colors used in the User Portal.
// AdminPortal has its own copy so the two apps are truly independent.
export const C = {
  navy:"#0A1628",      navyLight:"#112240",
  gold:"#C9A84C",      goldFaint:"rgba(201,168,76,0.12)",
  cream:"#F8F4EE",     white:"#FFFFFF",
  slate:"#4A5568",     slateLight:"#718096",
  lightGray:"#E8EDF4", midGray:"#CBD5E0",
  green:"#1A7A4A",     greenLight:"#E8F5EE",
  red:"#C0392B",       redLight:"#FDECEA",
  purple:"#6B46C1",    purpleLight:"#EDE9F9",
  blue:"#2C5F8A",      blueLight:"#E8F0F7",
  orange:"#E05C2A",    orangeLight:"#FEF0EB",
  teal:"#0D7377",
};

// ─── SHARED UI PRIMITIVES ────────────────────────────────────────────────────
// These are reusable across both employer and candidate views.

/** Avatar circle with initials */
export const Av = ({ initials, color, size=48, radius=12 }) => (
  <div style={{ width:size, height:size, borderRadius:radius, background:color,
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:size*0.34, fontWeight:800, color:C.white, flexShrink:0 }}>
    {initials}
  </div>
);

/** Skill / label chip, optionally removable */
export const Tag = ({ label, onRemove, style:s={} }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:5,
    background:C.lightGray, color:C.navy, borderRadius:6,
    padding:"4px 10px", fontSize:12, fontWeight:600, ...s }}>
    {label}
    {onRemove && (
      <button onClick={onRemove}
        style={{ background:"none", border:"none", cursor:"pointer",
          color:C.slateLight, fontSize:14, padding:0, lineHeight:1 }}>×</button>
    )}
  </span>
);

/** White rounded card */
export const Card = ({ children, style:s={} }) => (
  <div style={{ background:C.white, borderRadius:16, padding:"24px 28px",
    marginBottom:16, boxShadow:"0 2px 16px rgba(10,22,40,0.07)", ...s }}>
    {children}
  </div>
);

/** Gold-labelled section divider */
export const SecLbl = ({ children }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
    <span style={{ fontSize:11, fontWeight:700, color:C.gold,
      letterSpacing:"2px", textTransform:"uppercase", whiteSpace:"nowrap" }}>
      {children}
    </span>
    <div style={{ flex:1, height:1, background:C.lightGray }}/>
  </div>
);

/** Labeled text input */
export const FIn = ({ label, ...p }) => (
  <div style={{ marginBottom:16 }}>
    {label && (
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.slate,
        letterSpacing:"1px", textTransform:"uppercase", marginBottom:6 }}>{label}</label>
    )}
    <input style={{ width:"100%", border:`1.5px solid ${C.lightGray}`, borderRadius:8,
      padding:"10px 14px", fontSize:14, color:C.navy, background:C.cream,
      outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} {...p}/>
  </div>
);

/** Labeled textarea */
export const FTa = ({ label, ...p }) => (
  <div style={{ marginBottom:16 }}>
    {label && (
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.slate,
        letterSpacing:"1px", textTransform:"uppercase", marginBottom:6 }}>{label}</label>
    )}
    <textarea style={{ width:"100%", border:`1.5px solid ${C.lightGray}`, borderRadius:8,
      padding:"10px 14px", fontSize:14, color:C.navy, background:C.cream,
      outline:"none", fontFamily:"inherit", resize:"vertical", minHeight:80,
      boxSizing:"border-box" }} {...p}/>
  </div>
);

/** Labeled select */
export const FSe = ({ label, children, ...p }) => (
  <div style={{ marginBottom:16 }}>
    {label && (
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.slate,
        letterSpacing:"1px", textTransform:"uppercase", marginBottom:6 }}>{label}</label>
    )}
    <select style={{ width:"100%", border:`1.5px solid ${C.lightGray}`, borderRadius:8,
      padding:"10px 14px", fontSize:14, color:C.navy, background:C.cream,
      outline:"none", fontFamily:"inherit", cursor:"pointer", boxSizing:"border-box" }} {...p}>
      {children}
    </select>
  </div>
);

// ─── AUTH ────────────────────────────────────────────────────────────────────
/**
 * Simulated user credentials.
 * In production: replace with a real API call to your auth backend.
 * The admin portal has a COMPLETELY SEPARATE credential store — never shared here.
 */
const USER_CREDENTIALS = [
  { id:"u1", email:"employer@demo.com",  password:"demo2025", role:"employer",  name:"Sarah Johnson",   company:"Flutterwave",  initials:"SJ", avatarColor:C.blue   },
  { id:"u2", email:"candidate@demo.com", password:"demo2025", role:"candidate", name:"Adaeze Okonkwo",  initials:"AO",          avatarColor:C.green  },
  { id:"u3", email:"hr@andela.com",      password:"andela25", role:"employer",  name:"Michael Chen",    company:"Andela",       initials:"MC", avatarColor:C.purple },
  { id:"u4", email:"emeka@email.com",    password:"emeka25",  role:"candidate", name:"Emeka Nwachukwu", initials:"EN",          avatarColor:C.blue   },
];

function authenticateUser(email, password) {
  return USER_CREDENTIALS.find(u => u.email === email && u.password === password) || null;
}

// ─── SEED DATA ───────────────────────────────────────────────────────────────
const SEED_CANDIDATES = [
  { id:1, name:"Adaeze Okonkwo",   role:"Senior Product Manager", location:"Lagos, Nigeria",         origin:"Anambra State", dob:"1991-03-14", email:"adaeze.okonkwo@email.com",   phone:"+234 801 234 5678", initials:"AO", avatarColor:C.green,    skills:["Product Strategy","Agile/Scrum","User Research","Roadmapping","Stakeholder Mgmt","Data Analysis"], desiredRole:"Head of Product / VP Product", preferredLocation:"Lagos or Remote", salaryExpectation:"₦800,000 – ₦1,200,000/month", status:"approved", experience:[{company:"Flutterwave",role:"Senior Product Manager",duration:"2021 – Present",responsibilities:"Led cross-functional teams to deliver payment infrastructure used by 500K+ merchants.",achievements:"Increased merchant onboarding conversion by 38%; launched Flutterwave Store to 12 African markets."},{company:"Interswitch Group",role:"Product Manager",duration:"2018 – 2021",responsibilities:"Managed Quickteller consumer app with 2M+ active users.",achievements:"Reduced app crash rate by 62%; grew DAU by 45%."}], cv:"adaeze_okonkwo_cv.pdf", photo:true,  profileViews:[{company:"Flutterwave",role:"Head of Product Recruiter",time:"2 hours ago"},{company:"Andela",role:"Talent Partner",time:"Yesterday"},{company:"Paystack",role:"HR Manager",time:"2 days ago"},{company:"Kuda Bank",role:"Head of Talent",time:"3 days ago"},{company:"Carbon",role:"People Operations",time:"5 days ago"}] },
  { id:2, name:"Emeka Nwachukwu",  role:"Full Stack Engineer",    location:"Abuja, Nigeria",         origin:"Imo State",     dob:"1993-07-22", email:"emeka.nwachukwu@email.com",  phone:"+234 802 345 6789", initials:"EN", avatarColor:C.blue,     skills:["React","Node.js","TypeScript","PostgreSQL","AWS","Docker","GraphQL"],                                              desiredRole:"Senior Engineer / Tech Lead",          preferredLocation:"Remote / Abuja",   salaryExpectation:"₦600,000 – ₦900,000/month",     status:"approved", experience:[{company:"Andela",role:"Senior Software Engineer",duration:"2020 – Present",responsibilities:"Built scalable APIs and frontend systems for US-based fintech clients.",achievements:"Architected microservices system handling 10M daily transactions."},{company:"Paystack",role:"Software Engineer",duration:"2017 – 2020",responsibilities:"Developed merchant dashboard and payment integration SDKs.",achievements:"Built the Paystack WooCommerce plugin used by 80K+ merchants."}], cv:"emeka_nwachukwu_cv.pdf", photo:true,  profileViews:[] },
  { id:3, name:"Fatima Al-Hassan", role:"Marketing Director",     location:"Kano, Nigeria",          origin:"Kano State",    dob:"1988-11-05", email:"fatima.alhassan@email.com",  phone:"+234 803 456 7890", initials:"FA", avatarColor:C.purple,   skills:["Brand Strategy","Digital Marketing","Campaign Management","SEO/SEM","Content Strategy","Team Leadership"],      desiredRole:"CMO / Marketing Director",             preferredLocation:"Kano, Lagos or Remote", salaryExpectation:"₦700,000 – ₦1,000,000/month", status:"approved", experience:[{company:"MTN Nigeria",role:"Head of Digital Marketing",duration:"2019 – Present",responsibilities:"Led 15-person digital team managing ₦2B+ annual marketing budget.",achievements:"Grew digital subscriber acquisition by 55%."},{company:"Unilever Nigeria",role:"Brand Manager",duration:"2015 – 2019",responsibilities:"Managed Closeup and Lipton brand portfolios.",achievements:"Grew Closeup market share by 12% in 2 years."}], cv:"fatima_alhassan_cv.pdf", photo:false, profileViews:[] },
  { id:4, name:"Chidi Obi",        role:"Finance Manager",        location:"Port Harcourt, Nigeria", origin:"Rivers State",  dob:"1990-01-30", email:"chidi.obi@email.com",        phone:"+234 804 567 8901", initials:"CO", avatarColor:C.gold,     skills:["Financial Modeling","IFRS Reporting","Budget Planning","Audit","Excel/Power BI","Tax Compliance"],              desiredRole:"CFO / Finance Director",               preferredLocation:"Port Harcourt or Lagos", salaryExpectation:"₦650,000 – ₦950,000/month",  status:"approved", experience:[{company:"Shell Nigeria",role:"Finance Manager",duration:"2018 – Present",responsibilities:"Oversaw financial reporting, audits, and compliance.",achievements:"Saved ₦450M annually through cost optimization."},{company:"Deloitte Nigeria",role:"Senior Auditor",duration:"2014 – 2018",responsibilities:"Audited financial statements for oil & gas clients.",achievements:"Identified ₦120M in undeclared liabilities."}], cv:"chidi_obi_cv.pdf", photo:false, profileViews:[] },
  { id:5, name:"Ngozi Adeleke",    role:"HR Business Partner",    location:"Lagos, Nigeria",         origin:"Ogun State",    dob:"1992-09-18", email:"ngozi.adeleke@email.com",    phone:"+234 805 678 9012", initials:"NA", avatarColor:C.orange,   skills:["Talent Acquisition","Performance Management","HR Policy","L&D","Compensation & Benefits","HRIS"],             desiredRole:"HR Director / CHRO",                   preferredLocation:"Lagos",            salaryExpectation:"₦500,000 – ₦750,000/month",     status:"approved", experience:[{company:"Access Bank",role:"HR Business Partner",duration:"2019 – Present",responsibilities:"Strategic HR partner to 3 business units.",achievements:"Reduced turnover by 28%; built graduate trainee program."},{company:"Guaranty Trust Bank",role:"HR Officer",duration:"2016 – 2019",responsibilities:"Handled recruitment, onboarding, and performance reviews.",achievements:"Digitized HR processes, cutting onboarding time by 40%."}], cv:"ngozi_adeleke_cv.pdf", photo:true,  profileViews:[] },
  { id:6, name:"Babatunde Fashola",role:"Data Scientist",         location:"Lagos, Nigeria",         origin:"Lagos State",   dob:"1994-05-12", email:"babatunde.fashola@email.com",phone:"+234 806 789 0123", initials:"BF", avatarColor:"#1A6B8A", skills:["Python","Machine Learning","TensorFlow","SQL","Data Visualization","NLP","A/B Testing"],                       desiredRole:"Lead Data Scientist / Head of AI",     preferredLocation:"Remote / Lagos",   salaryExpectation:"₦700,000 – ₦1,100,000/month",  status:"approved", experience:[{company:"Kuda Bank",role:"Senior Data Scientist",duration:"2021 – Present",responsibilities:"Built ML models for credit scoring and fraud detection.",achievements:"Reduced fraud losses by ₦2.1B in 2023."},{company:"Jumia Nigeria",role:"Data Analyst",duration:"2018 – 2021",responsibilities:"Analyzed customer behavior and built recommendation systems.",achievements:"Recommendation engine increased average order value by 22%."}], cv:"babatunde_fashola_cv.pdf", photo:false, profileViews:[] },
];

const SEED_EMPLOYERS = [
  { id:1, slug:"flutterwave", company:"Flutterwave", tagline:"Building payments infrastructure for Africa",                    industry:"Fintech",    location:"Lagos, Nigeria",              founded:"2016", size:"501–1,000 employees",   website:"flutterwave.com", contact:"Sarah Johnson",  email:"sarah@flutterwave.com",  status:"active", invitesSent:14, hires:3, accentColor:"#F5622D", about:"Flutterwave is a leading African payments technology company.",                                                  culture:"We are bold, data-driven, and deeply collaborative.",                                                            perks:["Competitive salary & equity","Hybrid & remote work","Health insurance (HMO)","Learning & development budget","Annual team retreats","Paid parental leave"], openRoles:[{title:"Head of Product",type:"Full-time",location:"Lagos / Remote",level:"Senior"},{title:"Senior Backend Engineer",type:"Full-time",location:"Remote",level:"Senior"},{title:"Data Analyst",type:"Full-time",location:"Lagos",level:"Mid-level"}], team:[{name:"Olugbenga Agboola",role:"CEO & Co-founder",initials:"OA",color:C.orange},{name:"Sarah Johnson",role:"VP Talent & People",initials:"SJ",color:C.blue}],   stats:{countries:"34",merchants:"900K+",transactions:"$26B+"}, verified:true },
  { id:2, slug:"andela",       company:"Andela",       tagline:"Connecting Africa's top engineers to world-class opportunities", industry:"Tech / Talent", location:"Lagos, Nigeria (Remote-first)", founded:"2014", size:"1,001–5,000 employees", website:"andela.com",        contact:"Michael Chen",   email:"michael@andela.com",     status:"active", invitesSent:22, hires:7, accentColor:"#2C5F8A", about:"Andela builds and manages high-performing engineering teams.",                                                  culture:"Remote-first and globally minded. We champion inclusion and technical excellence.",                               perks:["Fully remote work","Above-market pay","Equipment stipend","Health & wellness allowance","Career coaching"],        openRoles:[{title:"Engineering Director",type:"Full-time",location:"Remote",level:"Director"},{title:"Senior React Developer",type:"Contract",location:"Remote",level:"Senior"}],                                               team:[{name:"Jeremy Johnson",role:"CEO",initials:"JJ",color:C.teal},{name:"Michael Chen",role:"CTO",initials:"MC",color:C.blue}], stats:{countries:"80+",engineers:"175K+",companies:"200+"}, verified:true },
  { id:3, slug:"mtn",          company:"MTN Nigeria",  tagline:"Everywhere you go",                                             industry:"Telecom",    location:"Lagos, Nigeria",              founded:"2001", size:"5,000+ employees",       website:"mtnonline.com",    contact:"Amara Diallo",   email:"amara@mtn.com",          status:"active", invitesSent:8,  hires:2, accentColor:"#B7791F", about:"MTN Nigeria is the country's largest telecommunications company, serving over 76 million subscribers.",              culture:"Purpose-led and people-first. We foster a culture of diversity, innovation, and shared ownership.",               perks:["Strong pension scheme","Medical coverage","Staff data & call allowances","Structured career development","Annual bonus scheme"], openRoles:[{title:"Head of Digital Marketing",type:"Full-time",location:"Lagos",level:"Senior"},{title:"Product Manager — Fintech",type:"Full-time",location:"Lagos",level:"Mid-level"}], team:[{name:"Karl Toriola",role:"CEO",initials:"KT",color:C.navy},{name:"Amara Diallo",role:"Chief People Officer",initials:"AD",color:C.purple}], stats:{subscribers:"76M+",states:"36",revenue:"₦2.5T+"}, verified:true },
];

// ─── PIPELINE DATA ────────────────────────────────────────────────────────────
const PIPELINE_STAGES = ["Invited","Confirmed","Interviewed","Offer Sent","Hired","Declined"];
const STAGE_COLORS = {
  "Invited":    { bg:"#EBF4FF", color:C.blue,    border:"#BFDBFE", icon:"📨" },
  "Confirmed":  { bg:"#F0FDF4", color:C.green,   border:"#BBF7D0", icon:"✅" },
  "Interviewed":{ bg:"#F5F3FF", color:C.purple,  border:"#DDD6FE", icon:"🎙️" },
  "Offer Sent": { bg:"#FFFBEB", color:"#B45309", border:"#FDE68A", icon:"📄" },
  "Hired":      { bg:C.greenLight, color:C.green, border:"#6EE7B7", icon:"🏆" },
  "Declined":   { bg:C.redLight, color:C.red,    border:"#FECACA", icon:"✕" },
};

const INITIAL_PIPELINE = [
  { id:1, candidateId:1, candidateName:"Adaeze Okonkwo",   initials:"AO", avatarColor:C.green,    role:"Head of Product",         stage:"Confirmed",   date:"Apr 17, 2025", notes:"Strong case study, very articulate." },
  { id:2, candidateId:2, candidateName:"Emeka Nwachukwu",  initials:"EN", avatarColor:C.blue,     role:"Engineering Director",    stage:"Invited",     date:"Apr 21, 2025", notes:"" },
  { id:3, candidateId:3, candidateName:"Fatima Al-Hassan", initials:"FA", avatarColor:C.purple,   role:"Head of Digital Marketing",stage:"Interviewed", date:"Apr 9, 2025",  notes:"Great brand experience. Awaiting panel feedback." },
  { id:4, candidateId:4, candidateName:"Chidi Obi",        initials:"CO", avatarColor:C.gold,     role:"CFO",                     stage:"Offer Sent",  date:"Apr 5, 2025",  notes:"Offer: ₦950K/month. Awaiting response." },
  { id:5, candidateId:5, candidateName:"Ngozi Adeleke",    initials:"NA", avatarColor:C.orange,   role:"HR Director",             stage:"Hired",       date:"Mar 28, 2025", notes:"Start date: May 1, 2025." },
  { id:6, candidateId:6, candidateName:"Babatunde Fashola",initials:"BF", avatarColor:"#1A6B8A",  role:"Lead Data Scientist",     stage:"Declined",    date:"Apr 3, 2025",  notes:"Accepted offer from another company." },
];

const SKILL_SUGGESTIONS = ["React","Node.js","Python","TypeScript","AWS","Docker","SQL","Product Strategy","Agile/Scrum","User Research","Brand Strategy","Digital Marketing","Financial Modeling","Data Analysis","Machine Learning","HR Policy","Talent Acquisition","Team Leadership","Project Management","Power BI","SEO/SEM","Content Strategy","Budget Planning"];
const NIGERIA_STATES = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT Abuja","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"];

// ─── PROFILE COMPLETION ENGINE ────────────────────────────────────────────────
const COMPLETION_CHECKS = [
  { key:"photo",       label:"Profile photo",         points:15, tip:"Profiles with photos get 3× more views." },
  { key:"fullName",    label:"Full name",              points:5,  tip:"Make sure your full name is filled in." },
  { key:"phone",       label:"Phone number",           points:5,  tip:"Add your phone number." },
  { key:"dob",         label:"Date of birth",          points:5,  tip:"Add your date of birth." },
  { key:"state",       label:"State of origin",        points:5,  tip:"Add your state of origin." },
  { key:"skills",      label:"At least 3 skills",      points:15, tip:"Add skills so employers can find you." },
  { key:"currentRole", label:"Current job title",      points:10, tip:"Add your current role." },
  { key:"exp1",        label:"Work experience added",  points:15, tip:"Add at least one work experience." },
  { key:"expAchieve",  label:"Achievements filled in", points:10, tip:"Quantify your achievements." },
  { key:"desiredRole", label:"Desired role",           points:5,  tip:"Tell employers what role you want." },
  { key:"salary",      label:"Salary expectation",     points:5,  tip:"Set your salary range." },
  { key:"cv",          label:"CV uploaded",            points:5,  tip:"Upload your CV." },
];

function calcCompletion(c) {
  const checks = {
    photo:       !!c.photo,
    fullName:    !!(c.name?.trim()),
    phone:       !!(c.phone?.trim()),
    dob:         !!(c.dob?.trim()),
    state:       !!(c.origin?.trim()),
    skills:      c.skills?.length >= 3,
    currentRole: !!(c.role?.trim()),
    exp1:        c.experience?.length > 0 && !!c.experience[0].company,
    expAchieve:  c.experience?.length > 0 && !!c.experience[0].achievements,
    desiredRole: !!(c.desiredRole?.trim()),
    salary:      !!(c.salaryExpectation?.trim()),
    cv:          !!(c.cv?.trim()),
  };
  const score   = COMPLETION_CHECKS.reduce((s,ch) => s + (checks[ch.key] ? ch.points : 0), 0);
  const missing = COMPLETION_CHECKS.filter(ch => !checks[ch.key]);
  return { score, checks, missing };
}

const completionColor = s => s >= 90 ? C.green : s >= 70 ? C.teal : s >= 50 ? C.gold : C.red;
const completionLabel = s => s >= 90 ? "Excellent" : s >= 70 ? "Good" : s >= 50 ? "Fair" : "Incomplete";

// ─── ONBOARDING FLOWS ────────────────────────────────────────────────────────
const EMPLOYER_STEPS = [
  { icon:"🔍", title:"Search & filter talent",       body:"Browse verified Nigerian professionals. Filter by skills, location, salary, and role.",                                            cta:"Got it"      },
  { icon:"👤", title:"Read full candidate profiles",  body:"Each profile is a clean digital CV — skills, work history, achievements, salary expectations. Assess fit in seconds.",             cta:"Next"        },
  { icon:"📅", title:"Invite candidates",             body:"One click sends a structured interview invitation. Candidate responds directly in the platform.",                                  cta:"Next"        },
  { icon:"📊", title:"Track your pipeline",           body:"Use the Pipeline Board to move candidates through stages — Invited, Confirmed, Interviewed, Offer Sent, Hired. No spreadsheets.", cta:"Let's go →"  },
];

const CANDIDATE_STEPS = [
  { icon:"✍️", title:"Build your profile",              body:"Your profile is your digital CV. The more complete it is, the more visible you are to employers.",              cta:"Got it"           },
  { icon:"👁️", title:"Get discovered by employers",     body:"Once approved, you appear in search results for 380+ Nigerian companies. Track views weekly.",                  cta:"Next"             },
  { icon:"🔔", title:"Receive interview invitations",   body:"When an employer is interested you get a notification with full details — company, role, date, format. Accept or decline with one tap.", cta:"Next" },
  { icon:"🏢", title:"Research companies before you accept", body:"Tap 'View Company' on any invitation to read their story, culture, perks, and open roles.",              cta:"Start my profile →" },
];

function OnboardingFlow({ role, onDone }) {
  const steps   = role === "employer" ? EMPLOYER_STEPS : CANDIDATE_STEPS;
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast  = step === steps.length - 1;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,22,40,0.78)", zIndex:300,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:C.white, borderRadius:24, maxWidth:460, width:"100%",
        overflow:"hidden", boxShadow:"0 24px 80px rgba(10,22,40,0.38)" }}>
        {/* Progress bar */}
        <div style={{ height:4, background:C.lightGray }}>
          <div style={{ height:"100%", background:C.gold, borderRadius:4,
            width:`${((step+1)/steps.length)*100}%`, transition:"width 0.4s ease" }}/>
        </div>
        <div style={{ padding:"40px 36px 32px" }}>
          {/* Step indicator dots */}
          <div style={{ display:"flex", gap:6, marginBottom:32 }}>
            {steps.map((_,i) => (
              <div key={i} style={{ height:6, flex:1, borderRadius:3,
                background:i <= step ? C.navy : C.lightGray, transition:"background 0.3s" }}/>
            ))}
          </div>
          {/* Icon */}
          <div style={{ width:72, height:72, borderRadius:20,
            background:`linear-gradient(135deg, ${C.navy} 0%, #1a3a6b 100%)`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, marginBottom:24 }}>
            {current.icon}
          </div>
          <div style={{ fontSize:22, fontWeight:800, color:C.navy, lineHeight:1.25, marginBottom:12 }}>
            {current.title}
          </div>
          <div style={{ fontSize:14, color:C.slate, lineHeight:1.7, marginBottom:32 }}>
            {current.body}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <button onClick={onDone}
              style={{ background:"none", border:"none", cursor:"pointer",
                fontSize:13, color:C.slateLight, fontWeight:500 }}>
              Skip tour
            </button>
            <button
              onClick={() => isLast ? onDone() : setStep(s => s+1)}
              style={{ background:isLast ? C.gold : C.navy,
                color:isLast ? C.navy : C.white, border:"none", borderRadius:10,
                padding:"12px 28px", fontSize:14, fontWeight:700, cursor:"pointer" }}>
              {current.cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── USER PORTAL LOGIN ────────────────────────────────────────────────────────
/**
 * Single login page for BOTH employers and candidates.
 * Role is determined by credentials — not by a dropdown.
 * This page never mentions /admin or the admin portal.
 */
function UserLoginPage({ onLogin }) {
  const [form,  setForm]  = useState({ email:"", password:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!form.email || !form.password) { setError("Please enter your email and password."); return; }
    setError(""); setLoading(true);
    setTimeout(() => {
      const user = authenticateUser(form.email, form.password);
      if (!user) {
        setError("Incorrect email or password. Please try again.");
        setLoading(false);
        return;
      }
      onLogin(user);
    }, 500);
  };

  return (
    <div style={{ minHeight:"100vh", width:"100vw", display:"flex",
      background:`linear-gradient(135deg, ${C.navy} 0%, #1a3a6b 100%)` }}>

      {/* Left panel — branding, grows to fill all available space */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center",
        padding:"60px 8vw",
        background:"linear-gradient(160deg, rgba(201,168,76,0.06) 0%, transparent 60%)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:56 }}>
          <div style={{ width:40, height:40, background:C.gold, borderRadius:10,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontWeight:900, fontSize:18, color:C.navy }}>T</div>
          <div>
            <div style={{ color:C.white, fontWeight:800, fontSize:20 }}>TalentBridge</div>
            <div style={{ color:C.gold, fontSize:10, letterSpacing:"2px", textTransform:"uppercase" }}>Curated Talent</div>
          </div>
        </div>
        <div style={{ fontSize:"clamp(28px,3.5vw,42px)", fontWeight:800, color:C.white,
          lineHeight:1.2, marginBottom:16, letterSpacing:"-0.5px" }}>
          Nigeria's premier<br/><span style={{ color:C.gold }}>talent marketplace</span>
        </div>
        <div style={{ fontSize:15, color:"rgba(255,255,255,0.55)", lineHeight:1.7, marginBottom:40 }}>
          Connecting 2,400+ verified professionals with 380+ leading Nigerian employers.
          Fast, structured, and efficient.
        </div>
        {[["👤 Candidates","Build a rich profile & get invited by top companies"],
          ["🏢 Employers","Search, filter, and hire in one seamless pipeline"]].map(([t,d]) => (
          <div key={t} style={{ display:"flex", gap:12, marginBottom:16 }}>
            <div style={{ width:36, height:36, borderRadius:9, background:"rgba(201,168,76,0.12)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
              {t.split(" ")[0]}
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.white }}>{t.slice(2)}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginTop:2 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Right panel — login form */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
        padding:"40px 5vw", flex:"0 0 480px" }}>
        <div style={{ width:"100%", maxWidth:420 }}>
          <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:20, padding:"36px 32px", backdropFilter:"blur(12px)" }}>
            <div style={{ fontSize:22, fontWeight:800, color:C.white, marginBottom:4 }}>Sign In</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:26 }}>
              Employers and candidates use the same login
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700,
                color:"rgba(255,255,255,0.5)", letterSpacing:"1px",
                textTransform:"uppercase", marginBottom:6 }}>Email Address</label>
              <input type="email" value={form.email}
                onChange={e => setForm(p => ({...p, email:e.target.value}))}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="you@company.com"
                style={{ width:"100%", border:"1.5px solid rgba(255,255,255,0.12)", borderRadius:8,
                  padding:"11px 14px", fontSize:14, color:C.white,
                  background:"rgba(255,255,255,0.07)", outline:"none",
                  fontFamily:"inherit", boxSizing:"border-box" }}/>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700,
                color:"rgba(255,255,255,0.5)", letterSpacing:"1px",
                textTransform:"uppercase", marginBottom:6 }}>Password</label>
              <input type="password" value={form.password}
                onChange={e => setForm(p => ({...p, password:e.target.value}))}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
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
              style={{ width:"100%", background:loading ? "rgba(201,168,76,0.5)" : C.gold,
                color:C.navy, border:"none", borderRadius:10, padding:"13px",
                fontSize:14, fontWeight:700, cursor:loading ? "not-allowed" : "pointer",
                transition:"all 0.2s" }}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>

            {/* Demo hint — remove in production */}
            <div style={{ marginTop:20, background:"rgba(201,168,76,0.06)",
              border:"1px solid rgba(201,168,76,0.12)", borderRadius:8,
              padding:"10px 13px", fontSize:11, color:"rgba(255,255,255,0.35)", lineHeight:1.7 }}>
              <strong style={{ color:"rgba(201,168,76,0.6)" }}>Demo credentials:</strong><br/>
              employer@demo.com / demo2025 (Employer)<br/>
              candidate@demo.com / demo2025 (Candidate)
            </div>
          </div>
          <div style={{ textAlign:"center", marginTop:16, fontSize:12, color:"rgba(255,255,255,0.25)" }}>
            New to TalentBridge? Contact your HR team or recruiter to get access.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
/**
 * Role-aware nav: employers see Talent Pool + Pipeline + Our Profile.
 * Candidates see My Profile + Invitations. Neither sees admin links.
 */
function Nav({ user, view, onNav, onLogout, notifCount=0 }) {
  return (
    <nav style={{ background:C.navy, padding:"0 40px", display:"flex", alignItems:"center",
      justifyContent:"space-between", height:60, width:"100%", position:"sticky", top:0, zIndex:100,
      boxShadow:"0 2px 20px rgba(10,22,40,0.3)", gap:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer", flexShrink:0 }}
        onClick={() => onNav("dashboard")}>
        <div style={{ width:30, height:30, background:C.gold, borderRadius:7,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontWeight:900, fontSize:14, color:C.navy }}>T</div>
        <div>
          <span style={{ color:C.white, fontWeight:700, fontSize:15 }}>TalentBridge</span>
          <span style={{ color:C.gold, fontSize:9, letterSpacing:"2px", textTransform:"uppercase",
            display:"block", lineHeight:1 }}>Curated Talent</span>
        </div>
      </div>

      <div style={{ display:"flex", gap:4, alignItems:"center", flexWrap:"wrap" }}>
        {/* Employer tabs */}
        {user.role === "employer" && <>
          <NBtn active={view==="talent-pool"} onClick={() => onNav("talent-pool")}>Talent Pool</NBtn>
          <NBtn active={view==="pipeline"}    onClick={() => onNav("pipeline")}>Pipeline 📊</NBtn>
          <NBtn active={view==="company-profile"} onClick={() => onNav("company-profile")}>Our Profile</NBtn>
        </>}
        {/* Candidate tabs */}
        {user.role === "candidate" && <>
          <NBtn active={view==="profile-view"} onClick={() => onNav("profile-view")}>My Profile</NBtn>
          <NBtn active={view==="notifications"} onClick={() => onNav("notifications")}>
            Invitations
            {notifCount > 0 && (
              <span style={{ marginLeft:5, background:C.gold, color:C.navy, borderRadius:10,
                padding:"1px 6px", fontSize:10, fontWeight:800 }}>{notifCount}</span>
            )}
          </NBtn>
        </>}
      </div>

      {/* User identity + sign out */}
      <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        <Av initials={user.initials} color={user.avatarColor} size={30} radius={7}/>
        <div style={{ display:"flex", flexDirection:"column" }}>
          <div style={{ fontSize:11, color:C.white, fontWeight:600 }}>{user.name}</div>
          <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)", textTransform:"uppercase" }}>
            {user.role === "employer" ? user.company || "Employer" : "Candidate"}
          </div>
        </div>
        <button onClick={onLogout}
          style={{ padding:"6px 14px", borderRadius:6, border:"1.5px solid rgba(255,255,255,0.2)",
            background:"transparent", color:"rgba(255,255,255,0.6)", fontSize:12,
            fontWeight:600, cursor:"pointer" }}>Sign Out</button>
      </div>
    </nav>
  );
}

const NBtn = ({ active, children, onClick }) => (
  <button onClick={onClick}
    style={{ padding:"6px 13px", borderRadius:6, border:"none", cursor:"pointer",
      fontSize:12, fontWeight:600,
      background:active ? C.gold : "transparent",
      color:active ? C.navy : "rgba(255,255,255,0.65)",
      transition:"all 0.15s", display:"flex", alignItems:"center", gap:3 }}>
    {children}
  </button>
);

// ─── COMPLETION WIDGET ────────────────────────────────────────────────────────
function CompletionWidget({ candidate, onEdit }) {
  const { score, missing } = calcCompletion(candidate);
  const col = completionColor(score);
  const [expanded, setExpanded] = useState(false);
  const weekViews = [3,5,2,8,6,4,9], days=["M","T","W","T","F","S","S"];
  const maxV = 9;
  const r = 39, circ = 2*Math.PI*r, offset = circ - (score/100)*circ;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
      {/* Strength */}
      <div style={{ background:C.white, borderRadius:16, padding:"22px 24px",
        boxShadow:"0 2px 16px rgba(10,22,40,0.07)" }}>
        <div style={{ fontSize:11, fontWeight:700, color:C.gold, letterSpacing:"2px",
          textTransform:"uppercase", marginBottom:16 }}>Profile Strength</div>
        <div style={{ display:"flex", alignItems:"center", gap:18, marginBottom:16 }}>
          <div style={{ position:"relative", flexShrink:0, width:90, height:90 }}>
            <svg width={90} height={90} style={{ transform:"rotate(-90deg)" }}>
              <circle cx={45} cy={45} r={r} fill="none" stroke={C.lightGray} strokeWidth={8}/>
              <circle cx={45} cy={45} r={r} fill="none" stroke={col} strokeWidth={8}
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                style={{ transition:"stroke-dashoffset 0.8s ease" }}/>
            </svg>
            <div style={{ position:"absolute", inset:0, display:"flex",
              flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <div style={{ fontSize:20, fontWeight:900, color:col, lineHeight:1 }}>{score}%</div>
              <div style={{ fontSize:9, fontWeight:700, color:col, marginTop:2 }}>
                {completionLabel(score).toUpperCase()}
              </div>
            </div>
          </div>
          <div style={{ flex:1 }}>
            {[{sec:"Personal",keys:["photo","fullName","phone","dob","state"]},
              {sec:"Professional",keys:["skills","currentRole"]},
              {sec:"Experience",keys:["exp1","expAchieve"]},
              {sec:"Preferences",keys:["desiredRole","salary"]},
              {sec:"Documents",keys:["cv"]}
            ].map(({sec, keys}) => {
              const checks  = calcCompletion(candidate).checks;
              const total   = COMPLETION_CHECKS.filter(c => keys.includes(c.key)).reduce((a,c) => a+c.points, 0);
              const done    = COMPLETION_CHECKS.filter(c => keys.includes(c.key) && checks[c.key]).reduce((a,c) => a+c.points, 0);
              const pct     = total > 0 ? Math.round((done/total)*100) : 0;
              return (
                <div key={sec} style={{ marginBottom:6 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                    <span style={{ fontSize:10, fontWeight:600, color:C.slate }}>{sec}</span>
                    <span style={{ fontSize:10, fontWeight:700, color:pct===100?C.green:C.slateLight }}>
                      {pct===100 ? "✓" : pct+"%"}
                    </span>
                  </div>
                  <div style={{ height:4, borderRadius:4, background:C.lightGray, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, borderRadius:4,
                      background:pct===100?C.green:col, transition:"width 0.6s ease" }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {missing.length > 0 && <>
          <button onClick={() => setExpanded(e => !e)}
            style={{ width:"100%", display:"flex", justifyContent:"space-between",
              alignItems:"center", background:C.cream, border:"none", borderRadius:8,
              padding:"8px 12px", cursor:"pointer", fontSize:12, fontWeight:600, color:C.navy }}>
            <span>🔧 {missing.length} item{missing.length!==1?"s":""} to improve</span>
            <span style={{ fontSize:11, color:C.slateLight }}>{expanded?"▲":"▼"}</span>
          </button>
          {expanded && (
            <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:6 }}>
              {missing.slice(0,4).map(item => (
                <div key={item.key} style={{ background:`${col}10`, borderRadius:8,
                  padding:"8px 11px", border:`1px solid ${col}25` }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.navy }}>
                    {item.label} <span style={{ color:col, fontWeight:800 }}>+{item.points}pts</span>
                  </div>
                  <div style={{ fontSize:11, color:C.slateLight, marginTop:1 }}>{item.tip}</div>
                </div>
              ))}
              <button onClick={onEdit}
                style={{ background:C.navy, color:C.white, border:"none", borderRadius:8,
                  padding:"9px", fontSize:12, fontWeight:700, cursor:"pointer", marginTop:2 }}>
                ✏️ Complete My Profile
              </button>
            </div>
          )}
          {!expanded && (
            <button onClick={onEdit}
              style={{ width:"100%", background:col, color:C.white, border:"none",
                borderRadius:8, padding:"8px", fontSize:12, fontWeight:700,
                cursor:"pointer", marginTop:8 }}>
              ✏️ Improve Profile →
            </button>
          )}
        </>}
        {missing.length === 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:7, background:C.greenLight,
            borderRadius:8, padding:"9px 12px" }}>
            <span>🏆</span>
            <span style={{ fontSize:12, fontWeight:700, color:C.green }}>100% complete!</span>
          </div>
        )}
      </div>

      {/* Views */}
      <div style={{ background:C.white, borderRadius:16, padding:"22px 24px",
        boxShadow:"0 2px 16px rgba(10,22,40,0.07)" }}>
        <div style={{ fontSize:11, fontWeight:700, color:C.gold, letterSpacing:"2px",
          textTransform:"uppercase", marginBottom:16 }}>Profile Views</div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:12, marginBottom:16 }}>
          <div>
            <div style={{ fontSize:38, fontWeight:900, color:C.navy, lineHeight:1 }}>
              {candidate.profileViews.length}
            </div>
            <div style={{ fontSize:12, color:C.slate, marginTop:4 }}>views this month</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:C.greenLight,
              borderRadius:20, padding:"4px 10px", fontSize:11, fontWeight:700, color:C.green }}>
              ↑ 42% vs last month
            </div>
          </div>
        </div>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:10, fontWeight:600, color:C.slateLight, marginBottom:8,
            textTransform:"uppercase" }}>This week</div>
          <div style={{ display:"flex", gap:4, alignItems:"flex-end", height:44 }}>
            {weekViews.map((v,i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                <div style={{ width:"100%", borderRadius:4,
                  background:i===6 ? C.gold : C.blue,
                  height:`${Math.round((v/maxV)*40)}px`, opacity:i===6?1:0.4 }}/>
                <div style={{ fontSize:8, color:C.slateLight, fontWeight:600 }}>{days[i]}</div>
              </div>
            ))}
          </div>
        </div>
        {candidate.profileViews.length > 0 ? (
          <div>
            <div style={{ fontSize:10, fontWeight:600, color:C.slateLight, marginBottom:7,
              textTransform:"uppercase" }}>Recent Viewers</div>
            {candidate.profileViews.slice(0,3).map((v,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:9, padding:"7px 0",
                borderBottom:i<2?`1px solid ${C.lightGray}`:"none" }}>
                <div style={{ width:30, height:30, borderRadius:7, background:C.navy,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🏢</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.navy }}>{v.company}</div>
                  <div style={{ fontSize:11, color:C.slateLight }}>{v.role}</div>
                </div>
                <div style={{ fontSize:10, color:C.slateLight, whiteSpace:"nowrap" }}>{v.time}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign:"center", padding:"12px 0", color:C.slateLight, fontSize:12 }}>
            <div style={{ fontSize:28, marginBottom:8 }}>👁️</div>
            Complete your profile to appear in searches.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PIPELINE BOARD (Employer only) ──────────────────────────────────────────
function PipelineBoard({ pipeline, setPipeline }) {
  const [selected,      setSelected]      = useState(null);
  const [noteEdit,      setNoteEdit]      = useState("");
  const [dragging,      setDragging]      = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [filter,        setFilter]        = useState("all");

  const moveCard = (id, toStage) => setPipeline(prev => prev.map(c => c.id===id ? {...c, stage:toStage} : c));
  const saveNote = () => {
    setPipeline(prev => prev.map(c => c.id===selected.id ? {...c, notes:noteEdit} : c));
    setSelected(prev => ({...prev, notes:noteEdit}));
  };

  const counts = PIPELINE_STAGES.reduce((acc,s) => ({...acc, [s]: pipeline.filter(c=>c.stage===s).length}), {});
  const hired  = counts["Hired"] || 0;
  const active = pipeline.filter(c => !["Hired","Declined"].includes(c.stage)).length;

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"34px 40px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
        marginBottom:22, flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:800, color:C.navy }}>Interview Pipeline</div>
          <div style={{ fontSize:13, color:C.slate, marginTop:3 }}>Track every candidate from invite to hire</div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {[{label:"Total",val:pipeline.length,color:C.navy},{label:"Active",val:active,color:C.blue},{label:"Hired",val:hired,color:C.green}].map(k => (
            <div key={k.label} style={{ background:C.white, borderRadius:12, padding:"10px 18px",
              textAlign:"center", boxShadow:"0 2px 10px rgba(10,22,40,0.07)", minWidth:60 }}>
              <div style={{ fontSize:22, fontWeight:800, color:k.color }}>{k.val}</div>
              <div style={{ fontSize:10, color:C.slateLight, fontWeight:600, textTransform:"uppercase" }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stage filter pills */}
      <div style={{ display:"flex", gap:7, marginBottom:20, flexWrap:"wrap" }}>
        <button onClick={() => setFilter("all")}
          style={{ padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer",
            fontSize:12, fontWeight:600,
            background:filter==="all" ? C.navy : C.white, color:filter==="all" ? C.white : C.slate,
            boxShadow:"0 1px 6px rgba(10,22,40,0.08)" }}>
          All ({pipeline.length})
        </button>
        {PIPELINE_STAGES.map(s => {
          const sc = STAGE_COLORS[s];
          return (
            <button key={s} onClick={() => setFilter(s)}
              style={{ padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer",
                fontSize:12, fontWeight:600,
                background:filter===s ? sc.color : C.white,
                color:filter===s ? C.white : C.slate,
                boxShadow:"0 1px 6px rgba(10,22,40,0.08)" }}>
              {sc.icon} {s} ({counts[s]||0})
            </button>
          );
        })}
      </div>

      {/* Kanban columns */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(190px, 1fr))", gap:12 }}>
        {PIPELINE_STAGES.map(stage => {
          const sc    = STAGE_COLORS[stage];
          const cards = (filter==="all" ? pipeline : pipeline.filter(c=>c.stage===filter)).filter(c=>c.stage===stage);
          return (
            <div key={stage}
              onDragOver={e  => { e.preventDefault(); setDragOverStage(stage); }}
              onDrop={e      => { e.preventDefault(); if(dragging) moveCard(dragging, stage); setDragging(null); setDragOverStage(null); }}
              onDragLeave={() => setDragOverStage(null)}
              style={{ background:dragOverStage===stage ? sc.bg : C.lightGray, borderRadius:14,
                padding:"12px 10px", minHeight:200,
                border:`2px dashed ${dragOverStage===stage ? sc.color : "transparent"}`,
                transition:"all 0.15s" }}>
              {/* Column header */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                marginBottom:10, padding:"0 4px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:14 }}>{sc.icon}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:C.navy }}>{stage}</span>
                </div>
                <span style={{ background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`,
                  borderRadius:10, padding:"1px 8px", fontSize:11, fontWeight:700 }}>{cards.length}</span>
              </div>

              {/* Cards */}
              {cards.map(card => (
                <div key={card.id} draggable
                  onDragStart={() => setDragging(card.id)}
                  onDragEnd={() => { setDragging(null); setDragOverStage(null); }}
                  onClick={() => { setSelected(card); setNoteEdit(card.notes||""); }}
                  onMouseEnter={e => e.currentTarget.style.transform="translateY(-1px)"}
                  onMouseLeave={e => e.currentTarget.style.transform=""}
                  style={{ background:C.white, borderRadius:10, padding:"12px", marginBottom:8,
                    boxShadow:"0 1px 8px rgba(10,22,40,0.08)", cursor:"grab",
                    border:`1px solid ${C.lightGray}`, transition:"transform 0.1s", userSelect:"none" }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6 }}>
                    <Av initials={card.initials} color={card.avatarColor} size={30} radius={7}/>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:C.navy, lineHeight:1.2 }}>{card.candidateName}</div>
                      <div style={{ fontSize:10, color:C.slateLight }}>{card.role}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:10, color:C.slateLight, marginBottom:6 }}>📅 {card.date}</div>
                  {card.notes && (
                    <div style={{ fontSize:10, color:C.slate, background:C.cream, borderRadius:6,
                      padding:"4px 7px", lineHeight:1.4, overflow:"hidden",
                      textOverflow:"ellipsis", whiteSpace:"nowrap" }}>💬 {card.notes}</div>
                  )}
                  {/* Quick-move dropdown */}
                  <select value={card.stage}
                    onChange={e => { e.stopPropagation(); moveCard(card.id, e.target.value); }}
                    onClick={e => e.stopPropagation()}
                    style={{ width:"100%", marginTop:8, border:`1px solid ${C.lightGray}`,
                      borderRadius:6, padding:"4px 7px", fontSize:10, color:C.slate,
                      background:C.cream, outline:"none", fontFamily:"inherit", cursor:"pointer" }}>
                    {PIPELINE_STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              ))}

              {cards.length === 0 && (
                <div style={{ textAlign:"center", padding:"20px 8px",
                  color:C.slateLight, fontSize:11 }}>Drop candidates here</div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign:"center", marginTop:14, fontSize:11, color:C.slateLight }}>
        💡 Drag cards between columns or use the dropdown to update stage
      </div>

      {/* Detail modal */}
      {selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(10,22,40,0.6)", zIndex:200,
          display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
          onClick={() => setSelected(null)}>
          <div style={{ background:C.white, borderRadius:20, padding:"30px", maxWidth:440, width:"100%",
            boxShadow:"0 20px 60px rgba(10,22,40,0.3)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", gap:14, alignItems:"center", marginBottom:20 }}>
              <Av initials={selected.initials} color={selected.avatarColor} size={52} radius={13}/>
              <div>
                <div style={{ fontSize:18, fontWeight:800, color:C.navy }}>{selected.candidateName}</div>
                <div style={{ fontSize:13, color:C.gold, fontWeight:600 }}>{selected.role}</div>
                <div style={{ marginTop:6 }}>
                  <span style={{ background:STAGE_COLORS[selected.stage]?.bg,
                    color:STAGE_COLORS[selected.stage]?.color,
                    border:`1px solid ${STAGE_COLORS[selected.stage]?.border}`,
                    borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700 }}>
                    {STAGE_COLORS[selected.stage]?.icon} {selected.stage}
                  </span>
                </div>
              </div>
            </div>
            {/* Stage selector */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.slate,
                letterSpacing:"1px", textTransform:"uppercase", marginBottom:6 }}>Move to Stage</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {PIPELINE_STAGES.map(s => {
                  const sc = STAGE_COLORS[s];
                  return (
                    <button key={s}
                      onClick={() => { moveCard(selected.id, s); setSelected(p => ({...p, stage:s})); }}
                      style={{ padding:"6px 12px", borderRadius:8,
                        border:`1.5px solid ${selected.stage===s ? sc.color : C.lightGray}`,
                        background:selected.stage===s ? sc.bg : C.white,
                        color:selected.stage===s ? sc.color : C.slate,
                        fontSize:11, fontWeight:600, cursor:"pointer" }}>
                      {sc.icon} {s}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Notes */}
            <div style={{ marginBottom:4 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.slate,
                letterSpacing:"1px", textTransform:"uppercase", marginBottom:6 }}>Notes</label>
              <textarea value={noteEdit} onChange={e => setNoteEdit(e.target.value)}
                placeholder="Add notes about this candidate…"
                style={{ width:"100%", border:`1.5px solid ${C.lightGray}`, borderRadius:8,
                  padding:"10px 12px", fontSize:13, color:C.navy, background:C.cream,
                  outline:"none", fontFamily:"inherit", resize:"vertical", minHeight:80,
                  boxSizing:"border-box" }}/>
            </div>
            <div style={{ display:"flex", gap:9, marginTop:16 }}>
              <button onClick={() => setSelected(null)}
                style={{ flex:1, background:C.lightGray, color:C.navy, border:"none",
                  borderRadius:8, padding:"11px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Close</button>
              <button onClick={() => { saveNote(); setSelected(null); }}
                style={{ flex:2, background:C.navy, color:C.white, border:"none",
                  borderRadius:8, padding:"11px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Save Notes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── COMPANY PROFILE (Employer only) ─────────────────────────────────────────
function CompanyProfilePage({ employer, isOwner=false, onBack }) {
  const e = employer;
  const [activeTab, setActiveTab] = useState("about");
  const [form, setForm] = useState({ about:e.about, culture:e.culture, tagline:e.tagline });
  const [editMode, setEditMode] = useState(false);
  const accent = e.accentColor || C.navy;

  if (editMode && isOwner) return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"34px 40px" }}>
      <div style={{ background:C.navy, borderRadius:16, padding:"20px 24px", marginBottom:20,
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ color:C.white, fontWeight:700, fontSize:17 }}>Edit Company Profile</div>
          <div style={{ color:"rgba(255,255,255,0.45)", fontSize:12, marginTop:2 }}>
            Changes visible to all candidates
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => setEditMode(false)}
            style={{ background:"rgba(255,255,255,0.1)", color:C.white,
              border:"1px solid rgba(255,255,255,0.2)", borderRadius:8,
              padding:"9px 18px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Cancel</button>
          <button onClick={() => setEditMode(false)}
            style={{ background:C.gold, color:C.navy, border:"none", borderRadius:8,
              padding:"9px 20px", fontSize:13, fontWeight:700, cursor:"pointer" }}>✓ Save Changes</button>
        </div>
      </div>
      <Card>
        <SecLbl>Basic Information</SecLbl>
        <FIn label="Company Tagline" value={form.tagline} onChange={ev => setForm(p => ({...p,tagline:ev.target.value}))}/>
      </Card>
      <Card>
        <SecLbl>About & Culture</SecLbl>
        <FTa label="About the Company" value={form.about}
          onChange={ev => setForm(p => ({...p,about:ev.target.value}))} style={{ minHeight:140 }}/>
        <FTa label="Culture Statement" value={form.culture}
          onChange={ev => setForm(p => ({...p,culture:ev.target.value}))} style={{ minHeight:100 }}/>
      </Card>
    </div>
  );

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"34px 40px" }}>
      {onBack && (
        <button onClick={onBack}
          style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"none",
            cursor:"pointer", color:C.slate, fontSize:13, fontWeight:600, marginBottom:20 }}>← Back</button>
      )}
      {/* Hero banner */}
      <div style={{ borderRadius:20, overflow:"hidden", marginBottom:16,
        boxShadow:"0 4px 24px rgba(10,22,40,0.12)" }}>
        <div style={{ height:120, background:`linear-gradient(135deg, ${accent} 0%, ${C.navy} 100%)`,
          position:"relative" }}>
          <div style={{ position:"absolute", inset:0, opacity:0.07,
            backgroundImage:"radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize:"40px 40px" }}/>
          {isOwner && (
            <button onClick={() => setEditMode(true)}
              style={{ position:"absolute", top:12, right:12, background:"rgba(255,255,255,0.15)",
                color:C.white, border:"1px solid rgba(255,255,255,0.3)", borderRadius:7,
                padding:"6px 14px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
              ✏️ Edit Profile
            </button>
          )}
        </div>
        <div style={{ background:C.white, padding:"0 28px 24px" }}>
          <div style={{ display:"flex", gap:18, alignItems:"flex-end", flexWrap:"wrap" }}>
            <div style={{ width:72, height:72, borderRadius:14, background:C.navy,
              border:`4px solid ${C.white}`, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:30, marginTop:-36, flexShrink:0,
              boxShadow:"0 4px 14px rgba(10,22,40,0.15)" }}>🏢</div>
            <div style={{ flex:1, paddingTop:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <div style={{ fontSize:22, fontWeight:800, color:C.navy }}>{e.company}</div>
                {e.verified && (
                  <span style={{ background:C.blueLight, color:C.blue, borderRadius:20,
                    padding:"3px 10px", fontSize:11, fontWeight:700 }}>✓ Verified</span>
                )}
              </div>
              <div style={{ fontSize:13, color:C.slate, marginTop:3 }}>{form.tagline}</div>
            </div>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", marginTop:14, paddingTop:14,
            borderTop:`1px solid ${C.lightGray}` }}>
            {[["🏭",e.industry],["📍",e.location],["👥",e.size],["📅","Founded "+e.founded],["🌐",e.website]].map(([ic,v]) => (
              <div key={v} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12,
                color:C.slate, marginRight:18, marginBottom:6 }}>
                <span>{ic}</span><span>{v}</span>
              </div>
            ))}
          </div>
          {e.stats && (
            <div style={{ display:"flex", gap:8, marginTop:14 }}>
              {Object.entries(e.stats).map(([k,v],i) => (
                <div key={k} style={{ flex:1, textAlign:"center", padding:"12px 8px",
                  background:i%2===0 ? C.cream : `${accent}10`, borderRadius:10 }}>
                  <div style={{ fontSize:20, fontWeight:900, color:accent }}>{v}</div>
                  <div style={{ fontSize:10, color:C.slate, fontWeight:600,
                    textTransform:"uppercase", letterSpacing:"0.5px", marginTop:2 }}>{k}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Tabs */}
      <div style={{ display:"flex", background:C.white, borderRadius:12, padding:4,
        marginBottom:16, boxShadow:"0 2px 10px rgba(10,22,40,0.06)" }}>
        {[["about","About"],["roles","Open Roles"],["team","Our Team"],["culture","Culture & Perks"]].map(([id,label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ flex:1, padding:"9px 4px", border:"none", borderRadius:8, cursor:"pointer",
              fontSize:12, fontWeight:600,
              background:activeTab===id ? C.navy : "transparent",
              color:activeTab===id ? C.white : C.slate, transition:"all 0.15s" }}>{label}</button>
        ))}
      </div>
      {activeTab==="about"   && <Card><SecLbl>About {e.company}</SecLbl><p style={{ fontSize:14, color:C.slate, lineHeight:1.8, marginBottom:0 }}>{form.about}</p></Card>}
      {activeTab==="roles"   && (
        <div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:16, fontWeight:700, color:C.navy, marginBottom:4 }}>Currently Hiring</div>
            <div style={{ fontSize:13, color:C.slate }}>{e.openRoles.length} open positions</div>
          </div>
          {e.openRoles.map((role,i) => (
            <div key={i} style={{ background:C.white, borderRadius:14, padding:"18px 22px", marginBottom:12,
              boxShadow:"0 2px 12px rgba(10,22,40,0.07)", display:"flex", alignItems:"center",
              gap:16, flexWrap:"wrap" }}>
              <div style={{ width:44, height:44, borderRadius:10, background:`${accent}15`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>💼</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color:C.navy, marginBottom:4 }}>{role.title}</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <Tag label={role.type}     style={{ background:`${accent}15`, color:accent, fontSize:11 }}/>
                  <Tag label={role.location} style={{ fontSize:11 }}/>
                  <Tag label={role.level}    style={{ background:C.greenLight, color:C.green, fontSize:11 }}/>
                </div>
              </div>
              <button style={{ background:accent, color:C.white, border:"none", borderRadius:9,
                padding:"10px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Apply Now</button>
            </div>
          ))}
        </div>
      )}
      {activeTab==="team" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:14 }}>
          {e.team.map((m,i) => (
            <div key={i} style={{ background:C.white, borderRadius:14, padding:"22px 20px",
              boxShadow:"0 2px 12px rgba(10,22,40,0.07)", textAlign:"center" }}>
              <Av initials={m.initials} color={m.color} size={56} radius={14}/>
              <div style={{ fontSize:14, fontWeight:700, color:C.navy, marginTop:12 }}>{m.name}</div>
              <div style={{ fontSize:12, color:C.slateLight, marginTop:3 }}>{m.role}</div>
            </div>
          ))}
        </div>
      )}
      {activeTab==="culture" && <>
        <Card><SecLbl>Our Culture</SecLbl><p style={{ fontSize:14, color:C.slate, lineHeight:1.8, marginBottom:0 }}>{form.culture}</p></Card>
        <Card>
          <SecLbl>Benefits & Perks</SecLbl>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(210px, 1fr))", gap:10 }}>
            {e.perks.map((perk,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, background:C.cream,
                borderRadius:10, padding:"11px 14px" }}>
                <div style={{ width:30, height:30, borderRadius:8, background:`${accent}20`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>
                  {["💰","🏠","🏥","📚","✈️","👶","🎯","💻","🤝","⚡"][i%10]}
                </div>
                <div style={{ fontSize:13, color:C.navy, fontWeight:500 }}>{perk}</div>
              </div>
            ))}
          </div>
        </Card>
      </>}
      {!isOwner && (
        <div style={{ background:`linear-gradient(135deg, ${C.navy} 0%, #1a3a6b 100%)`,
          borderRadius:16, padding:"22px 24px", marginTop:8,
          display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:700, color:C.white, marginBottom:4 }}>
              Interested in {e.company}?
            </div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.6)" }}>
              Complete your profile so {e.company} can find and invite you.
            </div>
          </div>
          <button style={{ background:C.gold, color:C.navy, border:"none", borderRadius:9,
            padding:"11px 22px", fontSize:13, fontWeight:800, cursor:"pointer", flexShrink:0 }}>
            Complete My Profile →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── TALENT POOL (Employer only) ──────────────────────────────────────────────
function TalentPool({ candidates, onViewProfile }) {
  const [filters, setFilters] = useState({ search:"", skill:"", location:"" });
  const approved   = candidates.filter(c => c.status === "approved");
  const ALL_SKILLS = [...new Set(approved.flatMap(c => c.skills))].sort();
  const ALL_LOCS   = [...new Set(approved.map(c => c.location))];

  const filtered = approved.filter(c => {
    const q = filters.search.toLowerCase();
    return (
      (!q || c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q) || c.skills.some(s => s.toLowerCase().includes(q)))
      && (!filters.skill     || c.skills.includes(filters.skill))
      && (!filters.location  || c.location === filters.location)
    );
  });

  return (
    <div style={{ maxWidth:1300, margin:"0 auto", padding:"34px 40px" }}>
      <div style={{ marginBottom:22 }}>
        <div style={{ fontSize:22, fontWeight:800, color:C.navy }}>Talent Pool</div>
        <div style={{ fontSize:13, color:C.slate, marginTop:2 }}>{filtered.length} candidates available</div>
      </div>

      {/* Filters */}
      <div style={{ background:C.white, borderRadius:14, padding:"16px 20px", marginBottom:20,
        boxShadow:"0 2px 14px rgba(10,22,40,0.06)", display:"flex", gap:10,
        flexWrap:"wrap", alignItems:"flex-end" }}>
        <div style={{ flex:2, minWidth:180 }}>
          <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.slate,
            letterSpacing:"1px", textTransform:"uppercase", marginBottom:5 }}>Search</label>
          <input style={{ width:"100%", border:`1.5px solid ${C.lightGray}`, borderRadius:8,
            padding:"9px 12px", fontSize:13, color:C.navy, background:C.cream,
            outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}
            placeholder="Name, role, skill…" value={filters.search}
            onChange={e => setFilters(p => ({...p, search:e.target.value}))}/>
        </div>
        {[["skill","Skill",ALL_SKILLS],["location","Location",ALL_LOCS]].map(([k,l,opts]) => (
          <div key={k} style={{ flex:1, minWidth:140 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.slate,
              letterSpacing:"1px", textTransform:"uppercase", marginBottom:5 }}>{l}</label>
            <select style={{ width:"100%", border:`1.5px solid ${C.lightGray}`, borderRadius:8,
              padding:"9px 12px", fontSize:13, color:C.navy, background:C.cream,
              outline:"none", fontFamily:"inherit", cursor:"pointer", boxSizing:"border-box" }}
              value={filters[k]} onChange={e => setFilters(p => ({...p, [k]:e.target.value}))}>
              <option value="">All</option>
              {opts.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <button onClick={() => setFilters({ search:"", skill:"", location:"" })}
          style={{ background:C.lightGray, color:C.navy, border:"none", borderRadius:8,
            padding:"9px 16px", fontSize:13, fontWeight:600, cursor:"pointer", alignSelf:"flex-end" }}>
          Reset
        </button>
      </div>

      {filtered.length === 0
        ? <div style={{ textAlign:"center", padding:"56px 20px" }}>
            <div style={{ fontSize:32, marginBottom:10 }}>🔍</div>
            <div style={{ fontSize:17, fontWeight:700, color:C.navy }}>No candidates found</div>
          </div>
        : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:16 }}>
            {filtered.map(c => {
              const { score } = calcCompletion(c);
              const col = completionColor(score);
              return (
                <div key={c.id}
                  onClick={() => onViewProfile(c)}
                  onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.borderColor=C.gold; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.borderColor="transparent"; }}
                  style={{ background:C.white, borderRadius:16, padding:"20px",
                    boxShadow:"0 2px 14px rgba(10,22,40,0.07)", cursor:"pointer",
                    border:"1.5px solid transparent", transition:"all 0.18s" }}>
                  <div style={{ display:"flex", gap:11, marginBottom:12 }}>
                    <Av initials={c.initials} color={c.avatarColor} size={48} radius={11}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:C.navy }}>{c.name}</div>
                      <div style={{ fontSize:12, color:C.gold, fontWeight:600 }}>{c.role}</div>
                      <div style={{ fontSize:11, color:C.slate, marginTop:1 }}>📍 {c.location}</div>
                    </div>
                    {/* Mini completion ring */}
                    <div style={{ position:"relative", width:32, height:32, flexShrink:0 }}>
                      <svg width={32} height={32} style={{ transform:"rotate(-90deg)" }}>
                        <circle cx={16} cy={16} r={11} fill="none" stroke={C.lightGray} strokeWidth={4}/>
                        <circle cx={16} cy={16} r={11} fill="none" stroke={col} strokeWidth={4}
                          strokeDasharray={2*Math.PI*11}
                          strokeDashoffset={2*Math.PI*11*(1-score/100)} strokeLinecap="round"/>
                      </svg>
                      <div style={{ position:"absolute", inset:0, display:"flex",
                        alignItems:"center", justifyContent:"center",
                        fontSize:7, fontWeight:800, color:col }}>{score}%</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:11 }}>
                    {c.skills.slice(0,3).map(s => <Tag key={s} label={s}/>)}
                    {c.skills.length > 3 && <Tag label={`+${c.skills.length-3}`} style={{ background:C.goldFaint, color:C.gold }}/>}
                  </div>
                  <div style={{ fontSize:11, color:C.slate, marginBottom:11 }}>
                    🏢 {c.experience[0].company} · 👁️ {c.profileViews.length} views
                  </div>
                  <div style={{ height:1, background:C.lightGray, marginBottom:11 }}/>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:10, color:C.slateLight, fontWeight:600, textTransform:"uppercase" }}>Expectation</div>
                      <div style={{ fontSize:13, color:C.navy, fontWeight:700 }}>{c.salaryExpectation.split("–")[0]}+</div>
                    </div>
                    <span style={{ background:C.navy, color:C.white, borderRadius:7,
                      padding:"6px 13px", fontSize:12, fontWeight:600 }}>View →</span>
                  </div>
                </div>
              );
            })}
          </div>
      }
    </div>
  );
}

// ─── CANDIDATE PROFILE PAGE (employer view) ───────────────────────────────────
function CandidateProfilePage({ candidate:c, onBack }) {
  const [modal,   setModal]   = useState(false);
  const [sent,    setSent]    = useState(false);
  const [inv,     setInv]     = useState({ role:c.desiredRole, date:"", format:"", instructions:"" });
  const { score } = calcCompletion(c);
  const col = completionColor(score);

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"34px 40px" }}>
      <button onClick={onBack}
        style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"none",
          cursor:"pointer", color:C.slate, fontSize:13, fontWeight:600, marginBottom:20 }}>
        ← Back to Candidates
      </button>

      <Card style={{ display:"flex", gap:20, alignItems:"flex-start", flexWrap:"wrap" }}>
        <Av initials={c.initials} color={c.avatarColor} size={80} radius={16}/>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:24, fontWeight:800, color:C.navy }}>{c.name}</div>
          <div style={{ fontSize:15, color:C.gold, fontWeight:600, marginBottom:8 }}>{c.role}</div>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
            {[["📍",c.location],["🏠",c.origin],["✉️",c.email],["📞",c.phone]].map(([ic,v]) => (
              <span key={v} style={{ fontSize:12, color:C.slate, display:"flex", alignItems:"center", gap:4 }}>
                {ic} {v}
              </span>
            ))}
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:10,
            background:`${col}15`, borderRadius:20, padding:"4px 12px" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:col }}/>
            <span style={{ fontSize:11, fontWeight:700, color:col }}>
              Profile {score}% — {completionLabel(score)}
            </span>
          </div>
        </div>
        <button onClick={() => { setModal(true); setSent(false); }}
          style={{ background:C.gold, color:C.navy, border:"none", borderRadius:10,
            padding:"12px 20px", fontSize:13, fontWeight:800, cursor:"pointer",
            display:"flex", alignItems:"center", gap:6, alignSelf:"center", flexShrink:0 }}>
          📅 Invite for Interview
        </button>
      </Card>

      <Card><SecLbl>Skills</SecLbl>
        <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
          {c.skills.map(s => <Tag key={s} label={s} style={{ fontSize:13, padding:"5px 12px" }}/>)}
        </div>
      </Card>

      <Card><SecLbl>Work Experience</SecLbl>
        {c.experience.map((exp,i) => (
          <div key={i} style={{ borderLeft:`3px solid ${C.gold}`, paddingLeft:15,
            marginBottom:i<c.experience.length-1?20:0 }}>
            <div style={{ fontSize:15, fontWeight:700, color:C.navy }}>{exp.company}</div>
            <div style={{ fontSize:13, color:C.gold, fontWeight:600 }}>{exp.role}</div>
            <div style={{ fontSize:12, color:C.slate, marginBottom:6 }}>🗓 {exp.duration}</div>
            <div style={{ fontSize:13, color:C.slate, lineHeight:1.6, marginBottom:6 }}>{exp.responsibilities}</div>
            <div style={{ display:"inline-flex", gap:5, background:C.greenLight, color:C.green,
              borderRadius:6, padding:"4px 10px", fontSize:12, fontWeight:600, alignItems:"center" }}>
              ✦ {exp.achievements}
            </div>
          </div>
        ))}
      </Card>

      <Card><SecLbl>Career Preferences</SecLbl>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(190px, 1fr))", gap:12 }}>
          {[["Looking For",c.desiredRole],["Location",c.preferredLocation],["Salary",c.salaryExpectation]].map(([l,v]) => (
            <div key={l} style={{ background:C.cream, borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontSize:10, color:C.slate, fontWeight:600, textTransform:"uppercase", marginBottom:4 }}>{l}</div>
              <div style={{ fontSize:13, color:C.navy, fontWeight:700 }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card><SecLbl>Documents</SecLbl>
        <div style={{ display:"inline-flex", alignItems:"center", gap:10, background:C.cream,
          borderRadius:10, padding:"12px 16px", border:`1.5px solid ${C.lightGray}` }}>
          <span style={{ fontSize:20 }}>📄</span>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:C.navy }}>{c.cv}</div>
            <div style={{ fontSize:11, color:C.slateLight }}>Curriculum Vitae</div>
          </div>
          <button style={{ background:C.navy, color:C.white, border:"none", borderRadius:6,
            padding:"5px 12px", fontSize:12, fontWeight:600, cursor:"pointer", marginLeft:6 }}>Download</button>
        </div>
      </Card>

      {/* Invite modal */}
      {modal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(10,22,40,0.65)", zIndex:200,
          display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
          onClick={() => setModal(false)}>
          <div style={{ background:C.white, borderRadius:20, padding:"32px", maxWidth:450, width:"100%",
            boxShadow:"0 20px 60px rgba(10,22,40,0.3)" }}
            onClick={e => e.stopPropagation()}>
            {!sent ? <>
              <div style={{ fontSize:20, fontWeight:800, color:C.navy, marginBottom:3 }}>Invite for Interview</div>
              <div style={{ fontSize:13, color:C.slate, marginBottom:20 }}>Sending to <strong>{c.name}</strong></div>
              <FIn label="Role Being Considered" value={inv.role} onChange={e => setInv(p => ({...p,role:e.target.value}))} placeholder="e.g. Head of Product"/>
              <FIn label="Interview Date & Time"  value={inv.date} onChange={e => setInv(p => ({...p,date:e.target.value}))} placeholder="e.g. Monday April 14, 2:00 PM WAT"/>
              <FSe label="Format" value={inv.format} onChange={e => setInv(p => ({...p,format:e.target.value}))}>
                <option value="">Select…</option>
                <option>Video Call (Google Meet)</option>
                <option>Video Call (Zoom)</option>
                <option>In-Person</option>
                <option>Phone Call</option>
              </FSe>
              <FTa label="Instructions" value={inv.instructions} onChange={e => setInv(p => ({...p,instructions:e.target.value}))} placeholder="Preparation notes, links…"/>
              <div style={{ display:"flex", gap:9, marginTop:18 }}>
                <button onClick={() => setModal(false)}
                  style={{ flex:1, background:C.lightGray, color:C.navy, border:"none",
                    borderRadius:8, padding:"12px", fontSize:14, fontWeight:600, cursor:"pointer" }}>Cancel</button>
                <button onClick={() => setSent(true)}
                  style={{ flex:2, background:C.navy, color:C.white, border:"none",
                    borderRadius:8, padding:"12px", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                  📨 Send Invitation
                </button>
              </div>
            </> : (
              <div style={{ textAlign:"center", padding:"8px 0" }}>
                <div style={{ width:62, height:62, background:C.greenLight, borderRadius:"50%",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:26,
                  margin:"0 auto 14px" }}>✅</div>
                <div style={{ fontSize:20, fontWeight:800, color:C.navy, marginBottom:7 }}>Invitation Sent!</div>
                <div style={{ fontSize:13, color:C.slate, lineHeight:1.7 }}>
                  <strong>{c.name}</strong> has been notified about the <strong>{inv.role}</strong> interview.
                </div>
                <button onClick={() => setModal(false)}
                  style={{ background:C.navy, color:C.white, border:"none", borderRadius:10,
                    padding:"11px 26px", fontSize:14, fontWeight:700, cursor:"pointer", marginTop:20 }}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PROFILE BUILDER (Candidate only) ────────────────────────────────────────
const STEPS = ["Personal Info","Professional","Experience","Preferences","Review & Submit"];

function ProfileBuilder({ onComplete, onCancel }) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName:"", dob:"", state:"", email:"", phone:"",
    currentRole:"", skills:[], skillInput:"",
    experience:[{ company:"", role:"", startYear:"", endYear:"", current:false, responsibilities:"", achievements:"" }],
    desiredRole:"", preferredLocation:"", salaryMin:"", salaryMax:"", cvName:"",
  });

  const set = (k,v) => setForm(p => ({...p, [k]:v}));
  const addSkill    = s  => { const t=s.trim(); if(t && !form.skills.includes(t)) set("skills",[...form.skills,t]); set("skillInput",""); };
  const removeSkill = s  => set("skills", form.skills.filter(x => x!==s));
  const setExp = (i,k,v) => { const e=[...form.experience]; e[i]={...e[i],[k]:v}; set("experience",e); };
  const addExp      = () => set("experience",[...form.experience,{ company:"",role:"",startYear:"",endYear:"",current:false,responsibilities:"",achievements:"" }]);
  const removeExp   = i  => set("experience", form.experience.filter((_,idx) => idx!==i));

  const canNext = () => {
    if (step===0) return form.fullName && form.email && form.phone && form.state;
    if (step===1) return form.currentRole && form.skills.length >= 1;
    if (step===2) return form.experience[0].company && form.experience[0].role;
    if (step===3) return form.desiredRole && form.salaryMin;
    return true;
  };

  if (submitted) return (
    <div style={{ minHeight:"100vh", background:C.cream, display:"flex", alignItems:"center",
      justifyContent:"center", padding:20 }}>
      <div style={{ background:C.white, borderRadius:20, padding:"48px 38px", maxWidth:440, width:"100%",
        textAlign:"center", boxShadow:"0 8px 40px rgba(10,22,40,0.12)" }}>
        <div style={{ width:70, height:70, background:C.greenLight, borderRadius:"50%",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, margin:"0 auto 18px" }}>✅</div>
        <div style={{ fontSize:24, fontWeight:800, color:C.navy, marginBottom:8 }}>Profile Submitted!</div>
        <div style={{ fontSize:14, color:C.slate, lineHeight:1.7, marginBottom:28 }}>
          Your profile has been submitted for review.<br/>
          You'll receive confirmation at <strong>{form.email}</strong> within 24 hours.
        </div>
        <button onClick={onComplete}
          style={{ background:C.navy, color:C.white, border:"none", borderRadius:10,
            padding:"13px 30px", fontSize:14, fontWeight:700, cursor:"pointer" }}>
          Go to My Dashboard →
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", width:"100%", background:C.cream }}>
      {/* Step header */}
      <div style={{ background:C.navy, padding:"18px 24px 0" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <div>
              <div style={{ color:C.white, fontWeight:700, fontSize:17 }}>Build Your Profile</div>
              <div style={{ color:"rgba(255,255,255,0.45)", fontSize:12, marginTop:2 }}>
                Step {step+1} of {STEPS.length} — {STEPS[step]}
              </div>
            </div>
            <button onClick={onCancel}
              style={{ color:"rgba(255,255,255,0.45)", background:"none", border:"none", cursor:"pointer", fontSize:13 }}>
              ✕ Cancel
            </button>
          </div>
          <div style={{ display:"flex" }}>
            {STEPS.map((s,i) => (
              <div key={s} style={{ flex:1, paddingBottom:10,
                borderBottom:`3px solid ${i<=step ? C.gold : "rgba(255,255,255,0.1)"}`,
                transition:"border-color 0.3s" }}>
                <div style={{ fontSize:9, fontWeight:700, color:i<=step?C.gold:"rgba(255,255,255,0.25)",
                  letterSpacing:"0.5px", textTransform:"uppercase", textAlign:"center" }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1000, margin:"0 auto", padding:"32px 40px" }}>
        {/* Step 0 — Personal */}
        {step===0 && (
          <Card>
            <SecLbl>Personal Information</SecLbl>
            <FIn label="Full Name *" placeholder="e.g. Adaeze Okonkwo" value={form.fullName} onChange={e => set("fullName",e.target.value)}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
              <FIn label="Date of Birth *" type="date" value={form.dob} onChange={e => set("dob",e.target.value)}/>
              <FSe label="State of Origin *" value={form.state} onChange={e => set("state",e.target.value)}>
                <option value="">Select state…</option>
                {NIGERIA_STATES.map(s => <option key={s}>{s}</option>)}
              </FSe>
              <FIn label="Email Address *" type="email" placeholder="you@email.com" value={form.email} onChange={e => set("email",e.target.value)}/>
              <FIn label="Phone Number *" placeholder="+234 800 000 0000" value={form.phone} onChange={e => set("phone",e.target.value)}/>
            </div>
            <div style={{ background:C.blueLight, borderRadius:10, padding:"11px 15px", fontSize:13, color:C.blue }}>
              ℹ️ Contact details are only shared after you accept an interview invitation.
            </div>
          </Card>
        )}

        {/* Step 1 — Professional */}
        {step===1 && (
          <Card>
            <SecLbl>Professional Information</SecLbl>
            <FIn label="Current / Most Recent Job Title *" placeholder="e.g. Senior Product Manager"
              value={form.currentRole} onChange={e => set("currentRole",e.target.value)}/>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.slate,
                letterSpacing:"1px", textTransform:"uppercase", marginBottom:6 }}>Skills *</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:10, minHeight:30 }}>
                {form.skills.map(s => <Tag key={s} label={s} onRemove={() => removeSkill(s)}/>)}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <input style={{ flex:1, border:`1.5px solid ${C.lightGray}`, borderRadius:8,
                  padding:"9px 12px", fontSize:13, color:C.navy, background:C.cream,
                  outline:"none", fontFamily:"inherit" }}
                  placeholder="Type a skill and press Enter…"
                  value={form.skillInput} onChange={e => set("skillInput",e.target.value)}
                  onKeyDown={e => { if(e.key==="Enter"){ e.preventDefault(); addSkill(form.skillInput); } }}/>
                <button onClick={() => addSkill(form.skillInput)}
                  style={{ background:C.navy, color:C.white, border:"none", borderRadius:8,
                    padding:"9px 15px", fontSize:13, fontWeight:600, cursor:"pointer" }}>+ Add</button>
              </div>
              <div style={{ marginTop:11 }}>
                <div style={{ fontSize:11, color:C.slateLight, marginBottom:7, fontWeight:600 }}>QUICK ADD:</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).slice(0,14).map(s => (
                    <button key={s} onClick={() => addSkill(s)}
                      style={{ background:C.goldFaint, color:"#7A5F1E",
                        border:"1px solid rgba(201,168,76,0.3)", borderRadius:6,
                        padding:"3px 10px", fontSize:11, fontWeight:600, cursor:"pointer" }}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2 — Experience */}
        {step===2 && <>
          {form.experience.map((exp,i) => (
            <Card key={i}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <SecLbl>{form.experience.length>1 ? `Experience #${i+1}` : "Work Experience"}</SecLbl>
                {i > 0 && (
                  <button onClick={() => removeExp(i)}
                    style={{ background:C.redLight, color:C.red, border:"none", borderRadius:6,
                      padding:"4px 11px", fontSize:12, fontWeight:600, cursor:"pointer", marginTop:-14 }}>Remove</button>
                )}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <FIn label="Company Name *" placeholder="e.g. Flutterwave" value={exp.company} onChange={e => setExp(i,"company",e.target.value)}/>
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <FIn label="Role / Position *" placeholder="e.g. Senior Product Manager" value={exp.role} onChange={e => setExp(i,"role",e.target.value)}/>
                </div>
                <FIn label="Start Year" placeholder="2020" value={exp.startYear} onChange={e => setExp(i,"startYear",e.target.value)}/>
                <div>
                  <FIn label="End Year" placeholder="2024" value={exp.current?"Present":exp.endYear} onChange={e => setExp(i,"endYear",e.target.value)} disabled={exp.current}/>
                  <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:C.slate,
                    marginTop:-10, marginBottom:14, cursor:"pointer" }}>
                    <input type="checkbox" checked={exp.current} onChange={e => setExp(i,"current",e.target.checked)}/> Currently work here
                  </label>
                </div>
              </div>
              <FTa label="Key Responsibilities" placeholder="Describe your main duties…" value={exp.responsibilities} onChange={e => setExp(i,"responsibilities",e.target.value)}/>
              <FTa label="Major Achievements"   placeholder="Quantify your impact — numbers matter…" value={exp.achievements} onChange={e => setExp(i,"achievements",e.target.value)}/>
            </Card>
          ))}
          <button onClick={addExp}
            style={{ width:"100%", border:`2px dashed ${C.midGray}`, background:"transparent",
              borderRadius:12, padding:"13px", fontSize:13, fontWeight:600, color:C.slate,
              cursor:"pointer", marginBottom:8 }}>+ Add Another Role</button>
        </>}

        {/* Step 3 — Preferences */}
        {step===3 && (
          <Card>
            <SecLbl>Preferences & Documents</SecLbl>
            <FIn label="Desired Job Role(s) *" placeholder="e.g. Head of Product" value={form.desiredRole} onChange={e => set("desiredRole",e.target.value)}/>
            <FIn label="Preferred Location" placeholder="e.g. Lagos or Remote" value={form.preferredLocation} onChange={e => set("preferredLocation",e.target.value)}/>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.slate,
                letterSpacing:"1px", textTransform:"uppercase", marginBottom:6 }}>
                Salary Expectation (₦/month) *
              </label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 18px 1fr", gap:8, alignItems:"center" }}>
                <input style={{ border:`1.5px solid ${C.lightGray}`, borderRadius:8, padding:"10px 14px",
                  fontSize:14, color:C.navy, background:C.cream, outline:"none", fontFamily:"inherit" }}
                  placeholder="Min e.g. 600,000" value={form.salaryMin} onChange={e => set("salaryMin",e.target.value)}/>
                <span style={{ color:C.slate, fontWeight:600, textAlign:"center" }}>–</span>
                <input style={{ border:`1.5px solid ${C.lightGray}`, borderRadius:8, padding:"10px 14px",
                  fontSize:14, color:C.navy, background:C.cream, outline:"none", fontFamily:"inherit" }}
                  placeholder="Max e.g. 900,000" value={form.salaryMax} onChange={e => set("salaryMax",e.target.value)}/>
              </div>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.slate,
                letterSpacing:"1px", textTransform:"uppercase", marginBottom:6 }}>Upload CV (PDF)</label>
              <div style={{ border:`2px dashed ${C.midGray}`, borderRadius:10, padding:"18px",
                textAlign:"center", background:C.cream, cursor:"pointer" }}
                onClick={() => set("cvName", form.cvName ? "" : form.fullName.replace(/\s/g,"_").toLowerCase()+"_cv.pdf")}>
                {form.cvName
                  ? <div style={{ color:C.green, fontWeight:600, fontSize:13 }}>📄 {form.cvName}</div>
                  : <div style={{ color:C.slateLight, fontSize:13 }}>📎 Click to upload (PDF, max 5MB)</div>}
              </div>
            </div>
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.slate,
                letterSpacing:"1px", textTransform:"uppercase", marginBottom:6 }}>Profile Photo</label>
              <div style={{ border:`2px dashed ${C.midGray}`, borderRadius:10, padding:"18px",
                textAlign:"center", background:C.cream, cursor:"pointer" }}>
                <div style={{ color:C.slateLight, fontSize:13 }}>📸 Upload a professional headshot</div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 4 — Review */}
        {step===4 && <>
          <div style={{ background:C.goldFaint, border:"1px solid rgba(201,168,76,0.3)", borderRadius:12,
            padding:"12px 16px", marginBottom:18, fontSize:13, color:"#7A5F1E", lineHeight:1.6 }}>
            ✦ Review carefully. Your profile goes to the TalentBridge review queue once submitted.
          </div>
          <Card>
            <SecLbl>Personal</SecLbl>
            {[["Full Name",form.fullName],["Date of Birth",form.dob],["State",form.state],["Email",form.email],["Phone",form.phone]].map(([l,v]) => (
              <div key={l} style={{ display:"flex", gap:12, marginBottom:8 }}>
                <span style={{ fontSize:11, fontWeight:700, color:C.slateLight, textTransform:"uppercase", width:100, flexShrink:0 }}>{l}</span>
                <span style={{ fontSize:13, color:C.navy }}>{v||"—"}</span>
              </div>
            ))}
          </Card>
          <Card>
            <SecLbl>Professional</SecLbl>
            <div style={{ display:"flex", gap:12, marginBottom:12 }}>
              <span style={{ fontSize:11, fontWeight:700, color:C.slateLight, textTransform:"uppercase", width:100, flexShrink:0 }}>Role</span>
              <span style={{ fontSize:13, color:C.navy }}>{form.currentRole||"—"}</span>
            </div>
            <div style={{ fontSize:11, fontWeight:700, color:C.slateLight, textTransform:"uppercase", marginBottom:7 }}>Skills</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {form.skills.map(s => <Tag key={s} label={s}/>)}
            </div>
          </Card>
          <Card>
            <SecLbl>Experience</SecLbl>
            {form.experience.map((e,i) => (
              <div key={i} style={{ borderLeft:`3px solid ${C.gold}`, paddingLeft:14,
                marginBottom:i<form.experience.length-1?18:0 }}>
                <div style={{ fontWeight:700, color:C.navy }}>{e.company||"—"}</div>
                <div style={{ fontSize:13, color:C.gold, fontWeight:600 }}>{e.role}</div>
                {e.achievements && <div style={{ fontSize:12, color:C.green, marginTop:4, fontWeight:600 }}>✦ {e.achievements}</div>}
              </div>
            ))}
          </Card>
          <Card>
            <SecLbl>Preferences</SecLbl>
            {[["Desired Role",form.desiredRole],["Location",form.preferredLocation||"Not specified"],
              ["Salary",form.salaryMin?`₦${form.salaryMin}${form.salaryMax?" – ₦"+form.salaryMax:""}+/month`:"Not specified"],
              ["CV",form.cvName||"Not uploaded"]].map(([l,v]) => (
              <div key={l} style={{ display:"flex", gap:12, marginBottom:8 }}>
                <span style={{ fontSize:11, fontWeight:700, color:C.slateLight, textTransform:"uppercase", width:100, flexShrink:0 }}>{l}</span>
                <span style={{ fontSize:13, color:C.navy }}>{v}</span>
              </div>
            ))}
          </Card>
        </>}

        {/* Navigation buttons */}
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
          <button onClick={() => step > 0 ? setStep(s => s-1) : onCancel()}
            style={{ background:C.lightGray, color:C.navy, border:"none", borderRadius:8,
              padding:"12px 22px", fontSize:14, fontWeight:600, cursor:"pointer" }}>
            {step === 0 ? "Cancel" : "← Back"}
          </button>
          <button
            onClick={() => step < STEPS.length-1 ? setStep(s => s+1) : setSubmitted(true)}
            disabled={!canNext()}
            style={{ background:canNext() ? C.navy : C.midGray, color:C.white, border:"none",
              borderRadius:8, padding:"12px 26px", fontSize:14, fontWeight:700,
              cursor:canNext() ? "pointer" : "not-allowed" }}>
            {step === STEPS.length-1 ? "✓ Submit Profile" : `Next: ${STEPS[step+1]} →`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CANDIDATE PROFILE VIEW (own profile) ────────────────────────────────────
function CandidateProfileView({ candidate, onEdit }) {
  const c = candidate;
  const { score } = calcCompletion(c);
  const col = completionColor(score);

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"36px 40px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        marginBottom:18, flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:800, color:C.navy }}>My Profile</div>
          <div style={{ fontSize:12, fontWeight:700, color:col, marginTop:4 }}>
            {score}% complete · {completionLabel(score)}
          </div>
        </div>
        <button onClick={onEdit}
          style={{ background:C.navy, color:C.white, border:"none", borderRadius:8,
            padding:"10px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}>✏️ Edit Profile</button>
      </div>
      <CompletionWidget candidate={c} onEdit={onEdit}/>
      <Card style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
        <Av initials={c.initials} color={c.avatarColor} size={78} radius={16}/>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:24, fontWeight:800, color:C.navy }}>{c.name}</div>
          <div style={{ fontSize:15, color:C.gold, fontWeight:600, marginBottom:8 }}>{c.role}</div>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
            {[["📍",c.location],["🏠",c.origin],["✉️",c.email],["📞",c.phone]].map(([ic,v]) => (
              <span key={v} style={{ fontSize:12, color:C.slate, display:"flex", alignItems:"center", gap:4 }}>
                {ic} {v}
              </span>
            ))}
          </div>
        </div>
      </Card>
      <Card><SecLbl>Skills</SecLbl>
        <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
          {c.skills.map(s => <Tag key={s} label={s} style={{ fontSize:13, padding:"5px 12px" }}/>)}
        </div>
      </Card>
      <Card><SecLbl>Work Experience</SecLbl>
        {c.experience.map((exp,i) => (
          <div key={i} style={{ borderLeft:`3px solid ${C.gold}`, paddingLeft:15,
            marginBottom:i<c.experience.length-1?20:0 }}>
            <div style={{ fontSize:15, fontWeight:700, color:C.navy }}>{exp.company}</div>
            <div style={{ fontSize:13, color:C.gold, fontWeight:600 }}>{exp.role}</div>
            <div style={{ fontSize:12, color:C.slate, marginBottom:6 }}>🗓 {exp.duration}</div>
            <div style={{ fontSize:13, color:C.slate, lineHeight:1.6, marginBottom:6 }}>{exp.responsibilities}</div>
            <div style={{ display:"inline-flex", gap:5, background:C.greenLight, color:C.green,
              borderRadius:6, padding:"4px 10px", fontSize:12, fontWeight:600, alignItems:"center" }}>
              ✦ {exp.achievements}
            </div>
          </div>
        ))}
      </Card>
      <Card><SecLbl>Career Preferences</SecLbl>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(190px, 1fr))", gap:12 }}>
          {[["Looking For",c.desiredRole],["Location",c.preferredLocation],["Salary",c.salaryExpectation]].map(([l,v]) => (
            <div key={l} style={{ background:C.cream, borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontSize:10, color:C.slate, fontWeight:600, textTransform:"uppercase", marginBottom:4 }}>{l}</div>
              <div style={{ fontSize:13, color:C.navy, fontWeight:700 }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── NOTIFICATIONS (Candidate only) ──────────────────────────────────────────
const SEED_NOTIFS = [
  { id:1, company:"Flutterwave", role:"Head of Product",        interviewer:"Sarah Johnson, VP Talent", date:"Thursday April 17, 2025 — 10:00 AM WAT", format:"Video call via Google Meet",    instructions:"Prepare a 5-min product case study.",   unread:true,  status:null },
  { id:2, company:"Andela",      role:"Engineering Director",   interviewer:"Michael Chen, CTO",        date:"Monday April 21, 2025 — 2:00 PM WAT",   format:"In-person at Victoria Island, Lagos", instructions:"Bring a printed portfolio.", unread:true,  status:null },
  { id:3, company:"MTN Nigeria", role:"Head of Digital Marketing",interviewer:"Amara Diallo, CPO",     date:"April 9, 2025 — 11:00 AM WAT",           format:"Video call via Zoom",             instructions:"30-min intro call.",            unread:false, status:"accepted" },
];

function NotificationsPage({ onViewCompany }) {
  const [notifs, setNotifs] = useState(SEED_NOTIFS);
  const respond = (id, s) => setNotifs(prev => prev.map(n => n.id===id ? {...n, status:s, unread:false} : n));
  const unread  = notifs.filter(n => n.unread).length;

  return (
    <div style={{ maxWidth:1300, margin:"0 auto", padding:"36px 40px" }}>
      <div style={{ marginBottom:26 }}>
        <div style={{ fontSize:23, fontWeight:800, color:C.navy }}>Interview Invitations</div>
        <div style={{ fontSize:13, color:C.slate, marginTop:3 }}>
          {unread} new invitation{unread!==1?"s":""} waiting
        </div>
      </div>
      {notifs.map(n => {
        const emp = SEED_EMPLOYERS.find(e => e.company === n.company);
        return (
          <div key={n.id}
            style={{ background:n.unread ? `linear-gradient(to right, ${C.goldFaint}, ${C.white})` : C.white,
              borderRadius:14, padding:"18px 20px", marginBottom:13,
              boxShadow:"0 2px 14px rgba(10,22,40,0.07)",
              border:`1.5px solid ${n.unread ? "rgba(201,168,76,0.25)" : "transparent"}` }}>
            <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              {n.unread && <div style={{ width:8, height:8, borderRadius:"50%", background:C.gold, marginTop:5, flexShrink:0 }}/>}
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
                  flexWrap:"wrap", gap:8, marginBottom:4 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:C.navy }}>{n.company} — {n.role}</div>
                  {emp && (
                    <button onClick={() => onViewCompany(emp)}
                      style={{ background:C.goldFaint, color:C.gold, border:"1px solid rgba(201,168,76,0.3)",
                        borderRadius:6, padding:"4px 11px", fontSize:11, fontWeight:700,
                        cursor:"pointer", whiteSpace:"nowrap" }}>
                      View Company →
                    </button>
                  )}
                </div>
                <div style={{ fontSize:13, color:C.slate, lineHeight:1.7, marginBottom:11 }}>
                  <strong>Interviewer:</strong> {n.interviewer}<br/>
                  <strong>When:</strong> {n.date}<br/>
                  <strong>Format:</strong> {n.format}<br/>
                  <strong>Notes:</strong> {n.instructions}
                </div>
                {n.status === null && (
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => respond(n.id,"accepted")}
                      style={{ background:C.green, color:C.white, border:"none", borderRadius:7,
                        padding:"8px 17px", fontSize:12, fontWeight:700, cursor:"pointer" }}>✓ Accept</button>
                    <button onClick={() => respond(n.id,"declined")}
                      style={{ background:C.lightGray, color:C.slate, border:"none", borderRadius:7,
                        padding:"8px 17px", fontSize:12, fontWeight:600, cursor:"pointer" }}>✕ Decline</button>
                  </div>
                )}
                {n.status==="accepted" && <span style={{ background:C.greenLight, color:C.green, borderRadius:20, padding:"4px 12px", fontSize:12, fontWeight:700 }}>✓ Accepted</span>}
                {n.status==="declined" && <span style={{ background:C.redLight,  color:C.red,   borderRadius:20, padding:"4px 12px", fontSize:12, fontWeight:700 }}>✕ Declined</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── EMPLOYER SHELL ───────────────────────────────────────────────────────────
/**
 * Wraps all employer views. Candidates can never reach this shell
 * because the auth layer checks role before mounting it.
 */
function EmployerShell({ user, onLogout }) {
  const [view,              setView]              = useState("talent-pool");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedCompany,   setSelectedCompany]   = useState(null);
  const [prevView,          setPrevView]          = useState(null);
  const [pipeline,          setPipeline]          = useState(INITIAL_PIPELINE);
  const [showOnboarding,    setShowOnboarding]    = useState(true);

  const employers = SEED_EMPLOYERS;

  const nav = (target) => {
    setSelectedCandidate(null);
    setSelectedCompany(null);
    setView(target);
  };

  const viewCompany = (emp) => {
    setPrevView(view);
    setSelectedCompany(emp);
    setView("company-profile-public");
  };

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", minHeight:"100vh", width:"100%", background:C.cream }}>
      {showOnboarding && <OnboardingFlow role="employer" onDone={() => setShowOnboarding(false)}/>}
      <Nav user={user} view={view} onNav={nav} onLogout={onLogout}/>

      {view==="talent-pool" && (
        <TalentPool candidates={SEED_CANDIDATES}
          onViewProfile={c => { setSelectedCandidate(c); setView("candidate-profile"); }}/>
      )}
      {view==="candidate-profile" && selectedCandidate && (
        <CandidateProfilePage candidate={selectedCandidate} onBack={() => setView("talent-pool")}/>
      )}
      {view==="pipeline" && (
        <PipelineBoard pipeline={pipeline} setPipeline={setPipeline}/>
      )}
      {view==="company-profile" && (
        <CompanyProfilePage employer={employers[0]} isOwner={true} onBack={null}/>
      )}
      {view==="company-profile-public" && selectedCompany && (
        <CompanyProfilePage employer={selectedCompany} isOwner={false}
          onBack={() => setView(prevView || "notifications")}/>
      )}
    </div>
  );
}

// ─── CANDIDATE SHELL ──────────────────────────────────────────────────────────
/**
 * Wraps all candidate views. Employers can never reach this shell.
 */
function CandidateShell({ user, onLogout }) {
  const [view,           setView]           = useState("profile-view");
  const [selectedCompany,setSelectedCompany]= useState(null);
  const [prevView,       setPrevView]       = useState(null);
  const [buildingProfile,setBuildingProfile]= useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const nav = (target) => {
    setSelectedCompany(null);
    setView(target);
  };

  const viewCompany = (emp) => {
    setPrevView(view);
    setSelectedCompany(emp);
    setView("company-profile-public");
  };

  const unreadNotifs = 2;

  if (buildingProfile) return (
    <ProfileBuilder
      onComplete={() => { setBuildingProfile(false); setView("profile-view"); }}
      onCancel={() => setBuildingProfile(false)}/>
  );

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", minHeight:"100vh", width:"100%", background:C.cream }}>
      {showOnboarding && <OnboardingFlow role="candidate" onDone={() => setShowOnboarding(false)}/>}
      <Nav user={user} view={view} onNav={nav} onLogout={onLogout} notifCount={unreadNotifs}/>

      {view==="profile-view" && (
        <CandidateProfileView
          candidate={SEED_CANDIDATES[0]}
          onEdit={() => setBuildingProfile(true)}/>
      )}
      {view==="notifications" && (
        <NotificationsPage onViewCompany={viewCompany}/>
      )}
      {view==="company-profile-public" && selectedCompany && (
        <CompanyProfilePage employer={selectedCompany} isOwner={false}
          onBack={() => setView(prevView || "notifications")}/>
      )}
    </div>
  );
}

// ─── ROOT USER PORTAL ─────────────────────────────────────────────────────────
/**
 * This is the exported root component for Route 1 (/).
 * It owns auth state. On login, it mounts the correct shell based on role.
 * Admin portal is a completely separate component (AdminPortal.jsx / /admin route).
 */
export default function UserPortal() {
  const [user, setUser] = useState(null); // null = not logged in

  const handleLogin  = (u) => setUser(u);
  const handleLogout = ()  => setUser(null);

  // Not logged in → show user login page
  if (!user) return <UserLoginPage onLogin={handleLogin}/>;

  // Logged in as employer → employer shell only
  if (user.role === "employer") return <EmployerShell user={user} onLogout={handleLogout}/>;

  // Logged in as candidate → candidate shell only
  if (user.role === "candidate") return <CandidateShell user={user} onLogout={handleLogout}/>;

  // Safety fallback
  return <UserLoginPage onLogin={handleLogin}/>;
}
