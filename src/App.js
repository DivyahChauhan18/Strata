import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  base:       "#0A0E1A",
  surface:    "#111827",
  surfaceMid: "#1A2235",
  border:     "rgba(184,169,154,0.15)",
  borderMid:  "rgba(184,169,154,0.30)",
  borderHigh: "rgba(184,169,154,0.55)",
  ink:        "#FFFFFF",
  inkOff:     "rgba(255,255,255,0.92)",
  inkMid:     "rgba(255,255,255,0.65)",
  inkDim:     "rgba(255,255,255,0.38)",
  inkFaint:   "rgba(255,255,255,0.16)",
  beige:      "#B8A99A",
  beigeLight: "#D4C9BC",
  beigeDark:  "#8A7B6E",
  beigeFaint: "rgba(184,169,154,0.12)",
  beigeMid:   "rgba(184,169,154,0.28)",
  beigeGlow:  "rgba(184,169,154,0.06)",
  risk:       "#6B8CAE",
  riskDim:    "rgba(107,140,174,0.12)",
  riskBorder: "rgba(107,140,174,0.28)",
  go:         "#7BA591",
  goBorder:   "rgba(123,165,145,0.28)",
  serif:      "'DM Serif Display', Georgia, serif",
  mono:       "'IBM Plex Mono', monospace",
};

const SP = {
  snap:   { type:"spring", stiffness:500, damping:32 },
  arrive: { type:"spring", stiffness:360, damping:28, mass:1 },
  press:  { type:"spring", stiffness:600, damping:36, mass:0.8 },
  gentle: { type:"spring", stiffness:260, damping:28, mass:1.2 },
  page:   { type:"spring", stiffness:280, damping:32, mass:1 },
};

const INDUSTRIES = [
  "Technology / SaaS","Manufacturing","Financial Services","Healthcare",
  "Retail / E-commerce","Professional Services","Education",
  "Logistics / Supply Chain","Media / Creative","FMCG","Real Estate","Other",
];
const STAGES = [
  "Scaling fast (>30% YoY growth)","Stable growth (10–30% YoY)",
  "Steady state","Restructuring / Cost optimisation","Post-acquisition integration",
];
const STRATA_COLORS = [
  "#B8A99A","#9A8B7C","#D4C9BC","#7A6B5E","#C8BAA8","#8A7B6E","#E0D4C4","#6E5F52",
];

// ── PARTICLE CANVAS (overview ambient background) ──
function ParticleCanvas() {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight;

    // Create particles
    for (let i = 0; i < 80; i++) {
      particles.current.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.012;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184,169,154,${a})`;
        ctx.fill();
      });
      frameRef.current = requestAnimationFrame(draw);
    };
    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none",
    }}/>
  );
}

// ── LOADING CANVAS (briefing generation) ──
function LoadingCanvas({ sections }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const t = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t.current += 0.02;

      // Animated horizontal bars — the Strata Line expanding
      const barCount = 6;
      const barH = 2;
      const spacing = H / (barCount + 1);

      for (let i = 0; i < barCount; i++) {
        const y = spacing * (i + 1);
        const phase = t.current + i * 0.5;
        const w = (0.3 + 0.7 * Math.abs(Math.sin(phase))) * W * 0.8;
        const x = (W - w) / 2;
        const alpha = 0.15 + 0.35 * Math.abs(Math.sin(phase + 1));

        const grad = ctx.createLinearGradient(x, 0, x + w, 0);
        grad.addColorStop(0, `rgba(184,169,154,0)`);
        grad.addColorStop(0.3, `rgba(184,169,154,${alpha})`);
        grad.addColorStop(0.7, `rgba(184,169,154,${alpha})`);
        grad.addColorStop(1, `rgba(184,169,154,0)`);

        ctx.beginPath();
        ctx.roundRect(x, y - barH/2, w, barH, 1);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Scanning line
      const scanX = ((t.current * 0.4) % 1) * W;
      const scanGrad = ctx.createLinearGradient(scanX - 80, 0, scanX + 80, 0);
      scanGrad.addColorStop(0, "rgba(184,169,154,0)");
      scanGrad.addColorStop(0.5, "rgba(184,169,154,0.4)");
      scanGrad.addColorStop(1, "rgba(184,169,154,0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(scanX - 80, 0, 160, H);

      frameRef.current = requestAnimationFrame(draw);
    };
    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div style={{ position:"relative", width:"100%", height:"100%" }}>
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}/>
      <div style={{
        position:"absolute", inset:0, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", gap:32,
      }}>
        <div style={{ fontFamily:C.serif, fontSize:36, color:C.beige, letterSpacing:"-1px", textAlign:"center" }}>
          Assembling your briefing
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12, width:400 }}>
          {sections.map((s, i) => (
            <motion.div key={s}
              initial={{ opacity:0, x:-20 }}
              animate={{ opacity:1, x:0 }}
              transition={{ delay: i * 0.4, ...SP.arrive }}
              style={{ display:"flex", alignItems:"center", gap:12 }}>
              <motion.div
                animate={{ scale:[1, 1.3, 1], opacity:[0.4, 1, 0.4] }}
                transition={{ duration:1.2, repeat:Infinity, delay: i * 0.4 }}
                style={{ width:6, height:6, borderRadius:"50%", background:C.beige, flexShrink:0 }}
              />
              <div style={{ fontFamily:C.mono, fontSize:11, color:C.inkDim, letterSpacing:"0.18em", textTransform:"uppercase" }}>{s}</div>
              <motion.div
                initial={{ width:0 }}
                animate={{ width:"100%" }}
                transition={{ delay: i * 0.4 + 0.2, duration:1.5, ease:"easeInOut" }}
                style={{ height:1, background:`linear-gradient(90deg, ${C.beige}, transparent)`, flex:1 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ANIMATED S LOGO ──
function SLogo({ size="nav" }) {
  const isNav = size === "nav";
  const w = isNav ? 28 : 64;
  const h = isNav ? 28 : 64;
  const bh = isNav ? 6 : 13;
  const bw = isNav ? 19 : 42;
  const gap = isNav ? 11 : 25;

  const barStyle = (top, fromLeft, delay, opacity) => ({
    position:"absolute", height:bh, width:bw, borderRadius:2,
    background:C.beige,
    top, [fromLeft?"left":"right"]: 0,
    opacity,
    animation:`${fromLeft?"sfLeft":"sfRight"} 2.4s cubic-bezier(0.4,0,0.2,1) ${delay}s infinite`,
  });

  return (
    <div style={{ position:"relative", width:w, height:h, overflow:"hidden", flexShrink:0 }}>
      <div style={barStyle(0, true, 0, 0.95)} />
      <div style={barStyle(gap, false, 0.18, 0.70)} />
      <div style={barStyle(gap * 2, true, 0.36, 0.42)} />
    </div>
  );
}

// ── STRATA LINE ──
function StrataLine({ departments, headcount, fullWidth=false }) {
  const valid = departments.filter(d => d.name && parseInt(d.count) > 0);
  const total = valid.reduce((s,d) => s + parseInt(d.count), 0);
  return (
    <div style={{ width:"100%" }}>
      <div style={{ display:"flex", gap:3, height: fullWidth ? 4 : 3, width:"100%" }}>
        {valid.length === 0 ? (
          <motion.div
            style={{ flex:1, background:"rgba(184,169,154,0.2)", borderRadius:2 }}
            animate={{ opacity:[0.3, 0.7, 0.3] }}
            transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }}
          />
        ) : valid.map((d, i) => {
          const pct = (parseInt(d.count)/total)*100;
          return (
            <motion.div key={d.id}
              initial={{ width:0, opacity:0 }}
              animate={{ width:`${pct}%`, opacity:1 }}
              transition={{ ...SP.gentle, delay: i*0.06 }}
              style={{ height:"100%", background:STRATA_COLORS[i % STRATA_COLORS.length], borderRadius:2, minWidth:3, flexShrink:0 }}
              whileHover={{ scaleY:2.5, originY:1 }}
              title={`${d.name}: ${parseInt(d.count).toLocaleString()}`}
            />
          );
        })}
      </div>
      {!fullWidth && (
        <div style={{ marginTop:6, fontFamily:C.mono, fontSize:10, color:C.inkDim, letterSpacing:"0.06em" }}>
          {valid.length === 0
            ? headcount ? `${parseInt(headcount).toLocaleString()} people · add departments to map` : "Enter data to map composition"
            : `${valid.length} dept${valid.length>1?"s":""} · ${total.toLocaleString()} mapped${headcount && parseInt(headcount) > total ? ` · ${(parseInt(headcount)-total).toLocaleString()} unassigned` : ""}`}
        </div>
      )}
    </div>
  );
}

// ── PULSE NUMBER ──
function PulseNumber({ value, large=false }) {
  const [disp, setDisp] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const target = parseInt(value)||0;
    const from = prev.current; prev.current = target;
    if (from === target) return;
    const dur = 800, start = performance.now();
    const step = now => {
      const p = Math.min((now-start)/dur, 1);
      const e = 1-Math.pow(1-p, 3);
      setDisp(Math.round(from+(target-from)*e));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  if (!value) return null;
  return (
    <motion.span
      animate={{ scale:[1, 1.018, 1] }}
      transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }}
      style={{
        fontFamily:C.mono, fontWeight:300,
        fontSize: large ? 96 : 48,
        color: large ? C.beige : "rgba(184,169,154,0.4)",
        lineHeight:1, letterSpacing:"-0.03em", display:"block",
      }}
    >{disp.toLocaleString()}</motion.span>
  );
}

// ── NAV ──
function NavBar({ screen, setScreen, hasData, tone, setTone }) {
  const tabs = [
    { id:"overview", label:"Overview" },
    { id:"entry",    label:"Data Entry" },
    { id:"briefing", label:"Briefing", locked: !hasData },
  ];
  return (
    <motion.nav
      initial={{ opacity:0, y:-10 }}
      animate={{ opacity:1, y:0 }}
      transition={{ ...SP.arrive, delay:0.05 }}
      style={{
        position:"fixed", top:0, left:0, right:0, zIndex:200,
        background:"rgba(10,14,26,0.95)", backdropFilter:"blur(24px)",
        borderBottom:`1px solid rgba(184,169,154,0.18)`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 48px", height:64,
      }}
    >
      <div style={{ display:"flex", alignItems:"center", gap:14, cursor:"pointer" }} onClick={() => setScreen("overview")}>
        <SLogo size="nav" />
        <div>
          <div style={{ fontFamily:C.mono, fontSize:17, fontWeight:700, letterSpacing:"0.18em", color:C.ink, textTransform:"uppercase", lineHeight:1 }}>Strata</div>
          <div style={{ fontFamily:C.mono, fontSize:10, color:C.beige, letterSpacing:"0.12em", marginTop:2 }}>by Divyah</div>
        </div>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        {tabs.map(tab => (
          <motion.button key={tab.id}
            onClick={() => !tab.locked && setScreen(tab.id)}
            whileTap={tab.locked ? {} : { scale:0.96, transition:SP.press }}
            style={{
              background: screen === tab.id ? C.beigeFaint : "transparent",
              border: screen === tab.id ? `1px solid ${C.borderMid}` : "1px solid transparent",
              borderRadius:4,
              color: tab.locked ? C.inkFaint : screen === tab.id ? C.beigeLight : C.inkMid,
              fontFamily:C.mono, fontSize:11, fontWeight:screen === tab.id ? 600 : 400,
              letterSpacing:"0.12em", textTransform:"uppercase",
              padding:"9px 20px", cursor: tab.locked ? "not-allowed" : "pointer",
              transition:"all 0.18s ease",
            }}
          >{tab.label}</motion.button>
        ))}
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontFamily:C.mono, fontSize:10, color:C.inkDim, letterSpacing:"0.1em" }}>TONE</span>
        <div style={{ display:"flex", background:C.surfaceMid, borderRadius:4, border:`1px solid ${C.border}`, overflow:"hidden" }}>
          {["board","internal"].map(t => (
            <motion.button key={t}
              onClick={() => setTone(t)}
              whileTap={{ scale:0.96, transition:SP.press }}
              style={{
                background: tone===t ? C.beige : "transparent",
                border:"none", color: tone===t ? C.base : C.inkDim,
                fontFamily:C.mono, fontSize:10, fontWeight:600,
                letterSpacing:"0.14em", textTransform:"uppercase",
                padding:"8px 16px", cursor:"pointer",
                transition:"all 0.2s ease",
              }}
            >{t}</motion.button>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}

// ── INPUT COMPONENTS ──
const baseInput = {
  background: "rgba(184,169,154,0.06)",
  border: `1px solid rgba(184,169,154,0.22)`,
  borderRadius:5, color:"#FFFFFF",
  fontFamily:"'IBM Plex Mono', monospace",
  fontSize:15, fontWeight:500,
  padding:"13px 16px", width:"100%", outline:"none",
  transition:"all 0.18s ease",
  appearance:"none", WebkitAppearance:"none",
};

function Inp({ type="text", placeholder, value, onChange, min, max, step }) {
  const [f, setF] = useState(false);
  return (
    <input type={type} placeholder={placeholder} value={value}
      onChange={onChange} min={min} max={max} step={step}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{
        ...baseInput,
        borderColor: f ? C.beige : "rgba(184,169,154,0.22)",
        background: f ? "rgba(184,169,154,0.10)" : "rgba(184,169,154,0.06)",
        boxShadow: f ? `0 0 0 1px ${C.beige}22` : "none",
      }}
    />
  );
}

function Sel({ value, onChange, children }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ position:"relative" }}>
      <select value={value} onChange={onChange}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{
          ...baseInput,
          cursor:"pointer", paddingRight:36,
          borderColor: f ? C.beige : "rgba(184,169,154,0.22)",
          background: f ? "rgba(184,169,154,0.10)" : "rgba(184,169,154,0.06)",
          color: value ? "#FFFFFF" : "rgba(255,255,255,0.35)",
        }}>
        {children}
      </select>
      <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:C.beige, pointerEvents:"none", fontSize:11 }}>▾</div>
    </div>
  );
}

function Textarea({ placeholder, value, onChange }) {
  const [f, setF] = useState(false);
  return (
    <textarea placeholder={placeholder} value={value} onChange={onChange}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{
        ...baseInput, resize:"vertical", minHeight:80, lineHeight:1.7,
        borderColor: f ? C.beige : "rgba(184,169,154,0.22)",
        background: f ? "rgba(184,169,154,0.10)" : "rgba(184,169,154,0.06)",
      }}
    />
  );
}

function FieldLabel({ children, hint }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:9 }}>
      <div style={{ fontFamily:C.mono, fontSize:12, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:C.beigeLight }}>{children}</div>
      {hint && <div style={{ fontFamily:C.mono, fontSize:10, color:C.inkFaint }}>{hint}</div>}
    </div>
  );
}

function SectionBlock({ label }) {
  return (
    <div style={{
      background:C.beige, borderRadius:3, padding:"6px 16px",
      fontFamily:C.mono, fontSize:11, fontWeight:700,
      letterSpacing:"0.22em", textTransform:"uppercase",
      color:C.base, display:"inline-block", marginBottom:24,
    }}>{label}</div>
  );
}

// ── OUTPUT COMPONENTS ──
function OutSection({ children, delay=0 }) {
  return (
    <motion.div
      initial={{ opacity:0, y:16 }}
      animate={{ opacity:1, y:0 }}
      transition={{ ...SP.arrive, delay }}
      style={{ marginBottom:64 }}
    >{children}</motion.div>
  );
}

function OutMarker({ label, critical, positive }) {
  const col = critical ? C.risk : positive ? C.go : C.beige;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
      <div style={{ fontFamily:C.mono, fontSize:11, fontWeight:700, letterSpacing:"0.24em", textTransform:"uppercase", color:col, flexShrink:0 }}>{label}</div>
      <motion.div initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ duration:0.45, ease:"easeOut", delay:0.1 }}
        style={{ flex:1, height:1, background:`linear-gradient(90deg,${col}66,transparent)`, transformOrigin:"left" }}/>
    </div>
  );
}

function PlaybookCard({ what, why, how, index }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
      transition={{ ...SP.arrive, delay:index*0.12 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(184,169,154,0.10)" : "rgba(184,169,154,0.05)",
        border:`1px solid ${hov ? C.borderMid : C.border}`,
        borderLeft:`3px solid ${C.beige}`,
        borderRadius:5, padding:"26px 26px 22px",
        marginBottom:14, transition:"all 0.2s ease",
        transform: hov ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <div style={{ fontFamily:C.serif, fontSize:21, color:C.ink, marginBottom:12, lineHeight:1.3 }}>{what}</div>
      <div style={{ fontFamily:C.mono, fontSize:13, color:C.inkMid, lineHeight:1.85, marginBottom:18 }}>{why}</div>
      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:14, fontFamily:C.mono, fontSize:12, color:C.beigeLight, lineHeight:1.65 }}>
        <span style={{ color:C.inkDim, fontSize:10, letterSpacing:"0.16em", marginRight:8 }}>FIRST STEP —</span>
        {how}
      </div>
    </motion.div>
  );
}

function DataCallout({ label, value }) {
  return (
    <div style={{
      background:"rgba(184,169,154,0.08)", border:`1px solid rgba(184,169,154,0.25)`,
      borderRadius:5, padding:"18px 22px",
    }}>
      <div style={{ fontFamily:C.mono, fontSize:10, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:C.beige, marginBottom:8 }}>{label}</div>
      <div style={{ fontFamily:C.serif, fontSize:30, color:C.beigeLight, lineHeight:1.1 }}>{value}</div>
    </div>
  );
}

const LOADING_SECTIONS = ["The Real Story","Workforce Snapshot","Risk Signals","Momentum Indicators","Forward Look","Strategic Playbook"];

export default function Strata() {
  const [screen, setScreen] = useState("overview");
  const [tone, setTone] = useState("board");
  const [deptCounter, setDeptCounter] = useState(3);
  const [departments, setDepartments] = useState([
    { id:1, name:"", count:"" },
    { id:2, name:"", count:"" },
  ]);
  const [form, setForm] = useState({
    headcount:"", attrition:"", voluntary:"", involuntary:"",
    tenure:"", recentHires:"", openRoles:"",
    managers:"", ics:"", industry:"", stage:"",
    upcoming:"", additional:"",
  });
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const outputTopRef = useRef(null);

  const set = k => e => setForm(f => ({ ...f, [k]:e.target.value }));

  function addDept() {
    setDepartments(d => [...d, { id:deptCounter, name:"", count:"" }]);
    setDeptCounter(c => c+1);
  }
  function removeDept(id) { setDepartments(d => d.filter(x => x.id !== id)); }
  function updateDept(id, field, value) { setDepartments(d => d.map(x => x.id === id ? {...x, [field]:value} : x)); }

  const buildPrompt = useCallback(() => {
    const toneInstr = tone === "board"
      ? "Write formally in third-person. Suitable for a board deck. Precise, no fluff."
      : "Write warmly in first-person plural. For an internal HR leadership meeting.";
    const valid = departments.filter(d => d.name && parseInt(d.count) > 0);
    const deptText = valid.length > 0 ? valid.map(d => `${d.name}: ${d.count}`).join(", ") : "Not specified";
    const mRatio = form.managers && form.ics ? `1:${Math.round(parseInt(form.ics)/parseInt(form.managers))}` : "Not provided";
    return `You are a senior People Analytics advisor. ${toneInstr}

DATA:
- Headcount: ${form.headcount||"N/A"}
- Attrition: ${form.attrition ? form.attrition+"%" : "N/A"} (Voluntary: ${form.voluntary ? form.voluntary+"%" : "N/A"}, Involuntary: ${form.involuntary ? form.involuntary+"%" : "N/A"})
- Avg tenure: ${form.tenure ? form.tenure+" yrs" : "N/A"}
- Hires last 6mo: ${form.recentHires||"N/A"}, Open roles: ${form.openRoles||"N/A"}
- Manager:IC ratio: ${mRatio}
- Industry: ${form.industry||"N/A"}, Stage: ${form.stage||"N/A"}
- Departments: ${deptText}
- Upcoming: ${form.upcoming||"None"}
- Additional: ${form.additional||"None"}

Output EXACTLY these six sections with markers. Be sharp — infer, don't restate.

---REAL_STORY---
One paragraph, 3-5 sentences. Most critical signal right now. No preamble.

---SNAPSHOT---
2-3 paragraphs. What does this workforce actually look like?

---RISKS---
2-3 paragraphs. What is the data quietly saying? What could go wrong?

---MOMENTUM---
1-2 paragraphs. What is working? Be honest if nothing is.

---FORWARD---
2 paragraphs. If nothing changes in 6 months, what happens?

---PLAYBOOK---
Exactly 3 recommendations:
WHAT: [action in one sentence]
WHY: [why this matters tied to their specific data, 2-3 sentences]
HOW: [one concrete first step they can take this week]`;
  }, [form, departments, tone]);

  async function generate() {
    if (!form.headcount) return;
    setLoading(true); setError(""); setOutput(null);
    try {
      const res = await fetch("/api/v1/messages", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "x-api-key":process.env.REACT_APP_API_KEY,
          "anthropic-version":"2023-06-01",
          "anthropic-dangerous-direct-browser-access":"true",
        },
        body:JSON.stringify({
          model:"claude-sonnet-4-6", max_tokens:1500,
          messages:[{ role:"user", content:buildPrompt() }],
        }),
      });
      if (!res.ok) { setError(`Error ${res.status}`); setLoading(false); return; }
      const data = await res.json();
      const text = data.content?.map(b => b.text||"").join("")||"";
      const parsed = parseOutput(text);
      setOutput(parsed);
      setScreen("briefing");
      setTimeout(() => outputTopRef.current?.scrollIntoView({ behavior:"smooth" }), 100);
    } catch(e) { setError(e.message); }
    setLoading(false);
  }

  function parseOutput(text) {
    const extract = (s, e) => {
      const si = text.indexOf(`---${s}---`); if (si === -1) return "";
      const from = si + `---${s}---`.length;
      if (!e) return text.slice(from).trim();
      const ei = text.indexOf(`---${e}---`, from);
      return ei === -1 ? text.slice(from).trim() : text.slice(from, ei).trim();
    };
    const prose = raw => raw.split("\n\n").filter(p => p.trim() && !p.startsWith("---")).map(p => p.trim());
    const pbRaw = extract("PLAYBOOK", null);
    const playbooks = [];
    pbRaw.split(/WHAT:/i).filter(b => b.trim()).forEach(block => {
      const what = block.match(/^([^\n]+)/)?.[1]?.trim()||"";
      const why = block.match(/WHY:\s*([^]*?)(?=HOW:|$)/i)?.[1]?.trim()||"";
      const how = block.match(/HOW:\s*([^]*?)(?=WHAT:|$)/i)?.[1]?.trim()||"";
      if (what) playbooks.push({ what, why, how });
    });
    return {
      realStory: prose(extract("REAL_STORY","SNAPSHOT")),
      snapshot: prose(extract("SNAPSHOT","RISKS")),
      risks: prose(extract("RISKS","MOMENTUM")),
      momentum: prose(extract("MOMENTUM","FORWARD")),
      forward: prose(extract("FORWARD","PLAYBOOK")),
      playbooks, tone,
      headcount:form.headcount, attrition:form.attrition,
      tenure:form.tenure, openRoles:form.openRoles,
    };
  }

  const proseStyle = {
    fontFamily: tone==="board" ? C.serif : C.mono,
    fontStyle: tone==="board" ? "italic" : "normal",
    fontSize: tone==="board" ? 18 : 15,
    color:C.inkOff, lineHeight:1.9,
  };

  const pv = {
    hidden:{ opacity:0, y:16 },
    show:{ opacity:1, y:0, transition:{ ...SP.page, staggerChildren:0.06 } },
    exit:{ opacity:0, y:-10, transition:{ duration:0.16 } },
  };
  const iv = { hidden:{ opacity:0, y:12 }, show:{ opacity:1, y:0, transition:SP.arrive } };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{-webkit-font-smoothing:antialiased;}
        body{background:#0A0E1A;}
        ::placeholder{color:rgba(255,255,255,0.22)!important;}
        ::selection{background:rgba(184,169,154,0.2);color:#D4C9BC;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(184,169,154,0.22);border-radius:2px;}
        select option{background:#111827;color:#fff;}
        input:focus,select:focus,textarea:focus{outline:none;}
        @keyframes sfLeft{
          0%{transform:translateX(-115%);opacity:0;}
          18%{transform:translateX(0);opacity:1;}
          70%{transform:translateX(0);opacity:1;}
          85%{transform:translateX(0);opacity:0;}
          100%{transform:translateX(-115%);opacity:0;}
        }
        @keyframes sfRight{
          0%{transform:translateX(115%);opacity:0;}
          18%{transform:translateX(0);opacity:1;}
          70%{transform:translateX(0);opacity:1;}
          85%{transform:translateX(0);opacity:0;}
          100%{transform:translateX(115%);opacity:0;}
        }
        @media(prefers-reduced-motion:reduce){
          *{animation-duration:0.01ms!important;transition-duration:0.01ms!important;}
        }
      `}</style>

      <div style={{ minHeight:"100vh", background:C.base, fontFamily:C.mono, color:C.ink }}>
        <NavBar screen={screen} setScreen={setScreen} hasData={!!output} tone={tone} setTone={setTone}/>

        <AnimatePresence mode="wait">

          {/* ════ OVERVIEW ════ */}
          {screen === "overview" && (
            <motion.div key="overview" variants={pv} initial="hidden" animate="show" exit="exit"
              style={{ minHeight:"100vh", paddingTop:64, position:"relative", overflow:"hidden" }}>
              <ParticleCanvas />
              <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"calc(100vh - 64px)", padding:"80px 48px", textAlign:"center" }}>

                <motion.div variants={iv} style={{ marginBottom:40 }}>
                  <div style={{ position:"relative", width:96, height:96, overflow:"hidden", margin:"0 auto" }}>
                    {[{top:8,left:true,delay:0,op:0.95},{top:37,left:false,delay:0.18,op:0.68},{top:66,left:true,delay:0.36,op:0.40}].map((b,i) => (
                      <div key={i} style={{
                        position:"absolute", height:18, width:66, borderRadius:3,
                        background:C.beige, top:b.top, [b.left?"left":"right"]:0,
                        opacity:b.op,
                        animation:`${b.left?"sfLeft":"sfRight"} 2.4s cubic-bezier(0.4,0,0.2,1) ${b.delay}s infinite`,
                      }}/>
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={iv}>
                  <h1 style={{ fontFamily:C.serif, fontSize:80, fontWeight:400, color:C.ink, lineHeight:1.05, letterSpacing:"-3px", marginBottom:8 }}>Strata</h1>
                  <div style={{ fontFamily:C.mono, fontSize:13, color:C.beige, letterSpacing:"0.26em", textTransform:"uppercase", marginBottom:36 }}>Workforce Intelligence</div>
                </motion.div>

                <motion.div variants={iv} style={{ fontFamily:C.mono, fontSize:15, color:C.inkMid, lineHeight:1.85, maxWidth:500, marginBottom:52 }}>
                  Paste your workforce data. Get a board-ready narrative briefing — not a dashboard, not charts. Something worth reading in a leadership meeting.
                </motion.div>

                {form.headcount && (
                  <motion.div variants={iv} style={{ marginBottom:40, textAlign:"center" }}>
                    <PulseNumber value={form.headcount} large />
                    <div style={{ fontFamily:C.mono, fontSize:12, color:C.inkDim, letterSpacing:"0.18em", marginTop:10 }}>PEOPLE IN YOUR WORKFORCE</div>
                  </motion.div>
                )}

                <motion.div variants={iv} style={{ width:"100%", maxWidth:600, marginBottom:52 }}>
                  <StrataLine departments={departments} headcount={form.headcount} fullWidth />
                </motion.div>

                <motion.div variants={iv} style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center", marginBottom:52 }}>
                  {["The Real Story","Risk Signals","Momentum Indicators","Forward Look","Strategic Playbook"].map((l,i) => (
                    <div key={i} style={{
                      background:"rgba(184,169,154,0.10)", border:`1px solid rgba(184,169,154,0.28)`,
                      borderRadius:3, padding:"8px 18px",
                      fontFamily:C.mono, fontSize:11, fontWeight:500, color:C.beige, letterSpacing:"0.12em",
                    }}>{l}</div>
                  ))}
                </motion.div>

                <motion.div variants={iv} style={{ display:"flex", gap:16 }}>
                  <motion.button
                    whileHover={{ scale:1.02, transition:SP.snap }}
                    whileTap={{ scale:0.97, transition:SP.press }}
                    onClick={() => setScreen("entry")}
                    style={{
                      background:C.beige, border:"none", borderRadius:5,
                      color:C.base, fontFamily:C.mono, fontWeight:700,
                      fontSize:12, letterSpacing:"0.2em", textTransform:"uppercase",
                      padding:"16px 40px", cursor:"pointer",
                    }}>Enter Data →</motion.button>
                  {output && (
                    <motion.button
                      whileHover={{ scale:1.02, transition:SP.snap }}
                      whileTap={{ scale:0.97, transition:SP.press }}
                      onClick={() => setScreen("briefing")}
                      style={{
                        background:"transparent", border:`1px solid ${C.borderMid}`,
                        borderRadius:5, color:C.inkMid, fontFamily:C.mono,
                        fontSize:12, letterSpacing:"0.2em", textTransform:"uppercase",
                        padding:"16px 40px", cursor:"pointer",
                      }}>View Briefing →</motion.button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ════ DATA ENTRY ════ */}
          {screen === "entry" && (
            <motion.div key="entry" variants={pv} initial="hidden" animate="show" exit="exit"
              style={{ minHeight:"100vh", paddingTop:64 }}>
              <div style={{ maxWidth:800, margin:"0 auto", padding:"56px 40px 100px" }}>

                <motion.div variants={iv} style={{ marginBottom:56 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
                    <div style={{ height:1, width:32, background:C.beige }}/>
                    <span style={{ fontFamily:C.mono, fontSize:10, fontWeight:600, color:C.beige, letterSpacing:"0.22em", textTransform:"uppercase" }}>Step 01 — Data Entry</span>
                  </div>
                  <h2 style={{ fontFamily:C.serif, fontSize:52, fontWeight:400, color:C.ink, letterSpacing:"-2px", marginBottom:12 }}>
                    Tell us about<br/><span style={{ color:C.beige }}>your workforce.</span>
                  </h2>
                  <p style={{ fontFamily:C.mono, fontSize:14, color:C.inkMid, lineHeight:1.8 }}>The more you provide, the sharper the briefing.</p>
                </motion.div>

                {/* Live bar */}
                <motion.div variants={iv} style={{
                  background:"rgba(184,169,154,0.06)", border:`1px solid rgba(184,169,154,0.20)`,
                  borderRadius:8, padding:"22px 26px", marginBottom:44,
                }}>
                  <div style={{ fontFamily:C.mono, fontSize:10, fontWeight:700, color:C.beige, letterSpacing:"0.22em", textTransform:"uppercase", marginBottom:14 }}>Live Workforce Composition</div>
                  <StrataLine departments={departments} headcount={form.headcount} />
                </motion.div>

                {/* CORE METRICS */}
                <motion.div variants={iv} style={{ marginBottom:52 }}>
                  <SectionBlock label="Core Metrics" />
                  <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                    <div><FieldLabel>Total Headcount</FieldLabel><Inp type="number" placeholder="e.g. 340" value={form.headcount} onChange={set("headcount")} min="1"/></div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
                      <div><FieldLabel>Overall Attrition %</FieldLabel><Inp type="number" placeholder="e.g. 18" value={form.attrition} onChange={set("attrition")} min="0" max="100"/></div>
                      <div><FieldLabel>Avg Tenure (yrs)</FieldLabel><Inp type="number" placeholder="e.g. 2.4" value={form.tenure} onChange={set("tenure")} min="0" step="0.1"/></div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
                      <div><FieldLabel>Voluntary Attrition %</FieldLabel><Inp type="number" placeholder="e.g. 12" value={form.voluntary} onChange={set("voluntary")} min="0" max="100"/></div>
                      <div><FieldLabel>Involuntary Attrition %</FieldLabel><Inp type="number" placeholder="e.g. 6" value={form.involuntary} onChange={set("involuntary")} min="0" max="100"/></div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
                      <div><FieldLabel>Hires (last 6 months)</FieldLabel><Inp type="number" placeholder="e.g. 42" value={form.recentHires} onChange={set("recentHires")} min="0"/></div>
                      <div><FieldLabel>Open Vacancies</FieldLabel><Inp type="number" placeholder="e.g. 17" value={form.openRoles} onChange={set("openRoles")} min="0"/></div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
                      <div><FieldLabel>Managers</FieldLabel><Inp type="number" placeholder="e.g. 28" value={form.managers} onChange={set("managers")} min="0"/></div>
                      <div><FieldLabel>Individual Contributors</FieldLabel><Inp type="number" placeholder="e.g. 312" value={form.ics} onChange={set("ics")} min="0"/></div>
                    </div>
                  </div>
                </motion.div>

                {/* ORGANISATION */}
                <motion.div variants={iv} style={{ marginBottom:52 }}>
                  <SectionBlock label="Organisation" />
                  <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                    <div><FieldLabel>Industry / Sector</FieldLabel>
                      <Sel value={form.industry} onChange={set("industry")}>
                        <option value="">Select industry</option>
                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                      </Sel>
                    </div>
                    <div><FieldLabel>Growth Stage</FieldLabel>
                      <Sel value={form.stage} onChange={set("stage")}>
                        <option value="">Select stage</option>
                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </Sel>
                    </div>
                  </div>
                </motion.div>

                {/* DEPARTMENTS */}
                <motion.div variants={iv} style={{ marginBottom:52 }}>
                  <SectionBlock label="Department Breakdown" />
                  <AnimatePresence>
                    {departments.map(dept => (
                      <motion.div key={dept.id}
                        initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, height:0 }}
                        transition={SP.arrive}
                        style={{ display:"grid", gridTemplateColumns:"1fr 110px 34px", gap:12, marginBottom:12, alignItems:"center" }}>
                        <Inp placeholder="Department name" value={dept.name} onChange={e => updateDept(dept.id,"name",e.target.value)}/>
                        <Inp type="number" placeholder="Count" value={dept.count} onChange={e => updateDept(dept.id,"count",e.target.value)} min="0"/>
                        <motion.button whileTap={{ scale:0.92, transition:SP.press }} onClick={() => removeDept(dept.id)}
                          style={{
                            background:"transparent", border:`1px solid rgba(184,169,154,0.20)`,
                            borderRadius:5, color:C.inkDim, height:46, width:34,
                            cursor:"pointer", fontSize:16, display:"flex",
                            alignItems:"center", justifyContent:"center", transition:"all 0.15s ease",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor=C.risk; e.currentTarget.style.color=C.risk; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(184,169,154,0.20)"; e.currentTarget.style.color=C.inkDim; }}
                        >×</motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <motion.button whileTap={{ scale:0.98, transition:SP.press }} onClick={addDept}
                    style={{
                      background:"transparent", border:`1px dashed rgba(184,169,154,0.28)`,
                      borderRadius:5, color:C.inkDim, fontFamily:C.mono,
                      fontSize:12, letterSpacing:"0.1em", padding:"11px 16px",
                      cursor:"pointer", width:"100%", textAlign:"left", marginTop:4,
                      transition:"all 0.15s ease",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=C.beige; e.currentTarget.style.color=C.beigeLight; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(184,169,154,0.28)"; e.currentTarget.style.color=C.inkDim; }}
                  >+ Add department</motion.button>
                </motion.div>

                {/* CONTEXT */}
                <motion.div variants={iv} style={{ marginBottom:52 }}>
                  <SectionBlock label="Forward Context" />
                  <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                    <div><FieldLabel hint="optional">Upcoming Changes</FieldLabel>
                      <Textarea placeholder="Restructure, hiring freeze, new office, merger..." value={form.upcoming} onChange={set("upcoming")}/>
                    </div>
                    <div><FieldLabel hint="optional">Anything else leadership should know</FieldLabel>
                      <Textarea placeholder="Cultural concerns, retention initiatives, market pressures..." value={form.additional} onChange={set("additional")}/>
                    </div>
                  </div>
                </motion.div>

                {/* ERROR */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                      style={{ background:"rgba(107,140,174,0.12)", border:`1px solid rgba(107,140,174,0.28)`, borderRadius:5, padding:"13px 16px", fontFamily:C.mono, fontSize:12, color:C.risk, marginBottom:20 }}>
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* GENERATE */}
                <motion.button variants={iv}
                  whileHover={!form.headcount || loading ? {} : { scale:1.01, transition:SP.snap }}
                  whileTap={!form.headcount || loading ? {} : { scale:0.98, transition:SP.press }}
                  onClick={generate}
                  disabled={!form.headcount || loading}
                  style={{
                    background: !form.headcount || loading ? "rgba(184,169,154,0.08)" : C.beige,
                    border:`1px solid ${!form.headcount || loading ? C.border : "transparent"}`,
                    borderRadius:5,
                    color: !form.headcount || loading ? C.inkDim : C.base,
                    fontFamily:C.mono, fontWeight:700, fontSize:13,
                    letterSpacing:"0.2em", textTransform:"uppercase",
                    padding:"18px", width:"100%",
                    cursor:!form.headcount || loading ? "not-allowed" : "pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:12,
                    transition:"all 0.2s ease",
                  }}
                >
                  {loading ? "Generating..." : "Generate Briefing →"}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ════ LOADING SCREEN ════ */}
          {loading && screen !== "briefing" && (
            <motion.div key="loading-screen"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{
                position:"fixed", inset:0, zIndex:300,
                background:"rgba(10,14,26,0.97)", backdropFilter:"blur(20px)",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
              <div style={{ width:"100%", maxWidth:600, height:400 }}>
                <LoadingCanvas sections={LOADING_SECTIONS}/>
              </div>
            </motion.div>
          )}

          {/* ════ BRIEFING ════ */}
          {screen === "briefing" && output && (
            <motion.div key="briefing" variants={pv} initial="hidden" animate="show" exit="exit"
              style={{ minHeight:"100vh", paddingTop:64 }}>
              <div style={{ maxWidth:720, margin:"0 auto", padding:"56px 40px 120px" }} ref={outputTopRef}>

                <motion.div variants={iv} style={{ marginBottom:56 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
                    <div style={{ height:1, width:32, background:C.beige }}/>
                    <span style={{ fontFamily:C.mono, fontSize:10, fontWeight:600, color:C.beige, letterSpacing:"0.22em", textTransform:"uppercase" }}>
                      {output.tone === "board" ? "Board Briefing" : "Internal Update"} · Strata
                    </span>
                  </div>
                  <h2 style={{ fontFamily:C.serif, fontSize:52, fontWeight:400, color:C.ink, letterSpacing:"-2px", marginBottom:28 }}>
                    Workforce<br/><span style={{ color:C.beige }}>Intelligence Briefing</span>
                  </h2>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
                    {output.headcount && <DataCallout label="Headcount" value={parseInt(output.headcount).toLocaleString()}/>}
                    {output.attrition && <DataCallout label="Attrition" value={`${output.attrition}%`}/>}
                    {output.tenure && <DataCallout label="Avg Tenure" value={`${output.tenure}y`}/>}
                    {output.openRoles && <DataCallout label="Open Roles" value={output.openRoles}/>}
                  </div>
                </motion.div>

                <OutSection delay={0.08}>
                  <OutMarker label="The Real Story" critical/>
                  <div style={{ fontFamily:C.serif, fontSize:26, lineHeight:1.5, color:C.ink }}>
                    {output.realStory.map((p,i) => <p key={i} style={{ marginBottom: i < output.realStory.length-1 ? 16 : 0 }}>{p}</p>)}
                  </div>
                </OutSection>

                <OutSection delay={0.16}>
                  <OutMarker label="Workforce Snapshot"/>
                  <div style={proseStyle}>{output.snapshot.map((p,i) => <p key={i} style={{ marginBottom: i < output.snapshot.length-1 ? 18 : 0 }}>{p}</p>)}</div>
                </OutSection>

                <OutSection delay={0.22}>
                  <OutMarker label="Risk Signals" critical/>
                  <div style={proseStyle}>{output.risks.map((p,i) => <p key={i} style={{ marginBottom: i < output.risks.length-1 ? 18 : 0 }}>{p}</p>)}</div>
                </OutSection>

                <OutSection delay={0.28}>
                  <OutMarker label="Momentum Indicators" positive/>
                  <div style={proseStyle}>{output.momentum.map((p,i) => <p key={i} style={{ marginBottom: i < output.momentum.length-1 ? 18 : 0 }}>{p}</p>)}</div>
                </OutSection>

                <OutSection delay={0.33}>
                  <OutMarker label="Forward Look"/>
                  <div style={proseStyle}>{output.forward.map((p,i) => <p key={i} style={{ marginBottom: i < output.forward.length-1 ? 18 : 0 }}>{p}</p>)}</div>
                </OutSection>

                <OutSection delay={0.38}>
                  <OutMarker label="Strategic Playbook"/>
                  {output.playbooks.map((pb,i) => <PlaybookCard key={i} index={i} {...pb}/>)}
                </OutSection>

                <motion.div variants={iv} style={{ display:"flex", gap:14, paddingTop:24, borderTop:`1px solid ${C.border}` }}>
                  <motion.button whileTap={{ scale:0.97, transition:SP.press }} onClick={generate}
                    style={{ background:C.beige, border:"none", borderRadius:5, color:C.base, fontFamily:C.mono, fontWeight:700, fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase", padding:"13px 26px", cursor:"pointer" }}>
                    Regenerate →
                  </motion.button>
                  <motion.button whileTap={{ scale:0.97, transition:SP.press }} onClick={() => setScreen("entry")}
                    style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:5, color:C.inkDim, fontFamily:C.mono, fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase", padding:"13px 26px", cursor:"pointer", transition:"all 0.15s ease" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=C.borderMid; e.currentTarget.style.color=C.inkMid; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.inkDim; }}>
                    ← Edit Data
                  </motion.button>
                </motion.div>

              </div>
            </motion.div>
          )}

          {screen === "briefing" && !output && (
            <motion.div key="briefing-empty"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ minHeight:"100vh", paddingTop:64, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:24 }}>
              <div style={{ fontFamily:C.serif, fontSize:36, color:C.inkDim }}>No briefing yet.</div>
              <motion.button whileTap={{ scale:0.97 }} onClick={() => setScreen("entry")}
                style={{ background:C.beige, border:"none", borderRadius:5, color:C.base, fontFamily:C.mono, fontWeight:700, fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase", padding:"13px 30px", cursor:"pointer" }}>
                Enter Data →
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  );
}