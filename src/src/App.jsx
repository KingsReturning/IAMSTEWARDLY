jsx
  import { useState, useEffect, useRef } from "react";

const CYCLES = ["Monthly", "Yearly", "Weekly"];
const FREE_LIMIT = 10;

const DEFAULT_CATEGORIES = [
  { name: "Streaming", color: "#ff6b6b" },
  { name: "Software", color: "#4ecdc4" },
  { name: "Utilities", color: "#ffe66d" },
  { name: "Insurance", color: "#a8e6cf" },
  { name: "Loans", color: "#ff8b94" },
  { name: "Other", color: "#c7b8ea" },
];

const PALETTE = [
  "#ff6b6b","#ff8b50","#ffe66d","#a8e6cf","#4ecdc4","#45b7d1",
  "#96ceb4","#88d8b0","#c7b8ea","#ff9ff3","#f8b500","#6c5ce7",
];

const DEFAULT_BILLS = [
  { id: 1, name: "Netflix", amount: 15.99, cycle: "Monthly", category: "Streaming", dueDay: 5, active: true, notes: "" },
  { id: 2, name: "Spotify", amount: 9.99, cycle: "Monthly", category: "Streaming", dueDay: 12, active: true, notes: "" },
  { id: 3, name: "Electric Bill", amount: 120.00, cycle: "Monthly", category: "Utilities", dueDay: 20, active: true, notes: "" },
  { id: 4, name: "Gym", amount: 45.00, cycle: "Monthly", category: "Other", dueDay: 1, active: true, notes: "" },
];

const today = new Date().getDate();

function getDaysUntilDue(dueDay) {
  const diff = dueDay - today;
  return diff < 0 ? diff + 30 : diff;
}
function getStatusLabel(dueDay) {
  const days = getDaysUntilDue(dueDay);
  if (days === 0) return { label: "DUE TODAY", urgent: true };
  if (days <= 3) return { label: `${days}d left`, urgent: true };
  if (days <= 7) return { label: `${days}d left`, urgent: false };
  return { label: `${days}d`, urgent: false };
}
function toMonthly(amount, cycle) {
  if (cycle === "Yearly") return amount / 12;
  if (cycle === "Weekly") return amount * 4.33;
  return amount;
}

function DonutChart({ categories, bills, getCatColor, monthlyTotal }) {
  const size = 140, cx = 70, cy = 70, r = 52, stroke = 18;
  const circ = 2 * Math.PI * r;
  const slices = categories.map(cat => {
    const val = bills.filter(b => b.active && b.category === cat.name)
      .reduce((s, b) => s + toMonthly(b.amount, b.cycle), 0);
    return { name: cat.name, color: getCatColor(cat.name), val };
  }).filter(s => s.val > 0);
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e1e22" strokeWidth={stroke} />
      {slices.map((s, i) => {
        const pct = s.val / monthlyTotal;
        const dash = pct * circ;
        const gap = circ - dash;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset * circ + circ / 4}
            style={{ transition: "stroke-dasharray 0.5s" }}
          />
        );
        offset += pct;
        return el;
      })}
    </svg>
  );
}

function WelcomeScreen({ onStart, darkMode }) {
  const bg = darkMode ? "#0d0d0f" : "#f8f6f1";
  const fg = darkMode ? "#f0ede8" : "#1a1a1e";
  const sub = darkMode ? "#555" : "#999";
  const card = darkMode ? "#13131a" : "#fff";
  const border = darkMode ? "#1e1e22" : "#e8e4de";
  return (
    <div style={{ minHeight: "100vh", background: bg, color: fg, fontFamily: "'DM Mono','Courier New',monospace", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>
        IAMSTEWARD<span style={{ color: "#ffe66d" }}>LY</span>
      </div>
      <div style={{ fontSize: 13, color: sub, letterSpacing: "0.12em", marginBottom: 48 }}>SPEND WISELY, SAVE MORE, STEWARD WELL.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, maxWidth: 640, width: "100%", marginBottom: 48 }}>
        {[
          { icon: "📋", title: "Track Bills", desc: "Keep all your subscriptions and bills in one place." },
          { icon: "📊", title: "See the Picture", desc: "Visual breakdown of where your money goes each month." },
          { icon: "🎯", title: "Stay Ahead", desc: "Know what's due and never get caught off guard again." },
          { icon: "💾", title: "Saves Locally", desc: "Your data stays private on your device — no account needed." },
        ].map(f => (
          <div key={f.title} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: "20px 18px", textAlign: "left" }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{f.title}</div>
            <div style={{ fontSize: 11, color: sub, lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
      <button onClick={onStart} style={{
        background: "#ffe66d", color: "#0d0d0f", border: "none", borderRadius: 10,
        padding: "14px 40px", fontSize: 15, fontWeight: 700, fontFamily: "'Syne',sans-serif",
        cursor: "pointer", letterSpacing: "0.02em", transition: "transform 0.15s"
      }}
        onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
        onMouseLeave={e => e.target.style.transform = "none"}
      >Get Started →</button>
      <div style={{ fontSize: 11, color: sub, marginTop: 16 }}>Free for up to {FREE_LIMIT} bills · No sign-up required</div>
    </div>
  );
}

export default function Stewardly() {
  const [seen, setSeen] = useState(() => {
    try { return localStorage.getItem("stwrd_seen") === "1"; } catch { return false; }
  });
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("stwrd_dark") !== "0"; } catch { return true; }
  });
  const [bills, setBills] = useState(() => {
    try { const s = localStorage.getItem("stwrd_bills"); return s ? JSON.parse(s) : DEFAULT_BILLS; } catch { return DEFAULT_BILLS; }
  });
  const [categories, setCategories] = useState(() => {
    try { const s = localStorage.getItem("stwrd_cats"); return s ? JSON.parse(s) : DEFAULT_CATEGORIES; } catch { return DEFAULT_CATEGORIES; }
  });
  const [monthlyIncome, setMonthlyIncome] = useState(() => {
    try { return parseFloat(localStorage.getItem("stwrd_income") || "5000"); } catch { return 5000; }
  });
  const [isPro, setIsPro] = useState(() => {
    try { return localStorage.getItem("stwrd_pro") === "1"; } catch { return false; }
  });

  const [showForm, setShowForm] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({ name: "", amount: "", cycle: "Monthly", category: "Streaming", dueDay: 1, notes: "" });
  const [deleted, setDeleted] = useState(null);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(PALETTE[0]);
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeInput, setIncomeInput] = useState(String(monthlyIncome));
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => { try { localStorage.setItem("stwrd_bills", JSON.stringify(bills)); } catch {} }, [bills]);
  useEffect(() => { try { localStorage.setItem("stwrd_cats", JSON.stringify(categories)); } catch {} }, [categories]);
  useEffect(() => { try { localStorage.setItem("stwrd_income", String(monthlyIncome)); } catch {} }, [monthlyIncome]);
  useEffect(() => { try { localStorage.setItem("stwrd_dark", darkMode ? "1" : "0"); } catch {} }, [darkMode]);
  useEffect(() => { try { localStorage.setItem("stwrd_pro", isPro ? "1" : "0"); } catch {} }, [isPro]);

  const getCatColor = (name) => categories.find(c => c.name === name)?.color || "#888";
  const activeBills = bills.filter(b => b.active);
  const monthlyTotal = activeBills.reduce((sum, b) => sum + toMonthly(b.amount, b.cycle), 0);
  const yearlyTotal = monthlyTotal * 12;
  const yearlyIncome = monthlyIncome * 12;
  const monthlyNet = monthlyIncome - monthlyTotal;
  const spendPct = monthlyIncome > 0 ? Math.min((monthlyTotal / monthlyIncome) * 100, 100) : 0;
  const filtered = filter === "All" ? bills : bills.filter(b => b.category === filter);
  const dueThisWeek = activeBills.filter(b => getDaysUntilDue(b.dueDay) <= 7).sort((a, b) => getDaysUntilDue(a.dueDay) - getDaysUntilDue(b.dueDay));

  const D = darkMode;
  const bg     = D ? "#0d0d0f" : "#f8f6f1";
  const bgCard = D ? "#13131a" : "#ffffff";
  const bgRow0 = D ? "#0d0d0f" : "#ffffff";
  const bgRow1 = D ? "#111114" : "#fafaf8";
  const bgHdr  = D ? "#0d0d0f" : "#ffffff";
  const border = D ? "#1e1e22" : "#e8e4de";
  const borderMid = D ? "#1a1a1e" : "#eeebe5";
  const fg     = D ? "#f0ede8" : "#1a1a1e";
  const fgSub  = D ? "#555"    : "#999";
  const fgMid  = D ? "#888"    : "#666";
  const bgInput= D ? "#111"    : "#f4f2ed";
  const bgModal= D ? "#18181b" : "#ffffff";
  const bgHover= D ? "#1a1a1e" : "#f5f3ee";
  const bgPill = D ? "#1e1e22" : "#f0ede6";
  const bgIconHover = D ? "#2a2a2e" : "#eeebe5";

  function handleStart() {
    setSeen(true);
    try { localStorage.setItem("stwrd_seen", "1"); } catch {}
  }
  function openAdd() {
    if (!isPro && bills.length >= FREE_LIMIT) { setShowUpgrade(true); return; }
    setForm({ name: "", amount: "", cycle: "Monthly", category: categories[0]?.name || "", dueDay: 1, notes: "" });
    setEditId(null);
    setShowForm(true);
  }
  function openEdit(bill) {
    setForm({ name: bill.name, amount: bill.amount, cycle: bill.cycle, category: bill.category, dueDay: bill.dueDay, notes: bill.notes || "" });
    setEditId(bill.id);
    setShowForm(true);
  }
  function saveForm() {
    if (!form.name || !form.amount) return;
    if (editId !== null) {
      setBills(bills.map(b => b.id === editId ? { ...b, ...form, amount: parseFloat(form.amount) } : b));
    } else {
      setBills([...bills, { ...form, amount: parseFloat(form.amount), id: Date.now(), active: true }]);
    }
    setShowForm(false);
  }
  function deleteBill(id) {
    const bill = bills.find(b => b.id === id);
    setBills(bills.filter(b => b.id !== id));
    setDeleted(bill);
    setTimeout(() => setDeleted(null), 4500);
  }
  function undoDelete() {
    if (deleted) { setBills(prev => [...prev, deleted]); setDeleted(null); }
  }
  function toggleActive(id) {
    setBills(bills.map(b => b.id === id ? { ...b, active: !b.active } : b));
  }
  function moveBill(id, dir) {
    const filteredIds = filtered.map(b => b.id);
    const pos = filteredIds.indexOf(id);
    if (dir === "up" && pos <= 0) return;
    if (dir === "down" && pos >= filteredIds.length - 1) return;
    const swapId = dir === "up" ? filteredIds[pos - 1] : filteredIds[pos + 1];
    const nb = [...bills];
    const iA = nb.findIndex(b => b.id === id), iB = nb.findIndex(b => b.id === swapId);
    [nb[iA], nb[iB]] = [nb[iB], nb[iA]];
    setBills(nb);
  }
  function addCategory() {
    const name = newCatName.trim();
    if (!name || categories.find(c => c.name.toLowerCase() === name.toLowerCase())) return;
    setCategories([...categories, { name, color: newCatColor }]);
    setNewCatName("");
    setNewCatColor(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
  }
  function deleteCategory(name) {
    const fallback = categories.find(c => c.name !== name)?.name || "";
    setCategories(categories.filter(c => c.name !== name));
    setBills(bills.map(b => b.category === name ? { ...b, category: fallback } : b));
    if (filter === name) setFilter("All");
  }
  function exportCSV() {
    const header = "Name,Amount,Cycle,Category,Due Day,Active,Monthly Equivalent,Notes";
    const rows = bills.map(b =>
      `"${b.name}",${b.amount},${b.cycle},"${b.category}",${b.dueDay},${b.active},${toMonthly(b.amount, b.cycle).toFixed(2)},"${(b.notes||"").replace(/"/g,'""')}"`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "iamstewardly-bills.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  if (!seen) return <WelcomeScreen onStart={handleStart} darkMode={darkMode} />;

  const btnStyle = (primary) => ({
    background: primary ? "#ffe66d" : bgPill,
    color: primary ? "#0d0d0f" : fgMid,
    border: `1px solid ${primary ? "transparent" : border}`,
    borderRadius: 8, padding: "9px 16px", fontSize: 13,
    fontWeight: primary ? 500 : 400, fontFamily: "inherit",
    cursor: "pointer", transition: "all 0.15s"
  });

  return (
    <div style={{ minHeight: "100vh", background: bg, color: fg, fontFamily: "'DM Mono','Courier New',monospace", transition: "background 0.2s, color 0.2s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        .bill-row { transition: background 0.12s; }
        .pill-btn { transition: all 0.15s; cursor: pointer; border: none; }
        .pill-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .icon-btn { background: none; border: none; cursor: pointer; transition: all 0.12s; padding: 3px 5px; border-radius: 4px; font-size: 11px; line-height: 1; }
        .icon-btn:disabled { opacity: 0.15; cursor: default; pointer-events: none; }
        .cat-chip { display: inline-block; border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 500; letter-spacing: 0.04em; white-space: nowrap; }
        input, select, textarea { outline: none; }
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(6px); padding: 16px; }
        .modal { border-radius: 14px; padding: 28px; width: 100%; max-width: 400px; max-height: 92vh; overflow-y: auto; }
        .modal-input { width: 100%; border-radius: 6px; padding: 10px 12px; font-family: inherit; font-size: 14px; }
        .undo-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); border-radius: 10px; padding: 12px 20px; display: flex; gap: 14px; align-items: center; z-index: 200; animation: fadein 0.2s; white-space: nowrap; }
        @keyframes fadein { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        .progress-bar { height: 3px; border-radius: 2px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 2px; transition: width 0.4s; }
        .color-swatch { width: 22px; height: 22px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: transform 0.1s; flex-shrink: 0; }
        .color-swatch:hover { transform: scale(1.18); }
        .color-swatch.selected { border-color: #fff; }
        .cat-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; }
        @media (max-width: 600px) {
          .summary-grid { grid-template-columns: 1fr 1fr !important; }
          .income-grid { grid-template-columns: 1fr !important; }
          .bill-due { display: none !important; }
          .header-actions { gap: 6px !important; }
          .header-actions .cat-btn { display: none; }
        }
      `}</style>

      <div style={{ borderBottom: `1px solid ${border}`, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: bgHdr, position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}>
            IAMSTEWARD<span style={{ color: "#ffe66d" }}>LY</span>
            {isPro && <span style={{ fontSize: 10, background: "#ffe66d", color: "#0d0d0f", borderRadius: 4, padding: "2px 6px", marginLeft: 8, fontFamily: "inherit", fontWeight: 700 }}>PRO</span>}
          </div>
          <div style={{ fontSize: 10, color: fgSub, marginTop: 2, letterSpacing: "0.08em" }}>SPEND WISELY, SAVE MORE, STEWARD WELL.</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }} className="header-actions">
          <button title="Toggle dark/light mode" onClick={() => setDarkMode(!darkMode)} style={{ ...btnStyle(false), padding: "8px 10px", fontSize: 15, border: "none" }}>{darkMode ? "☀️" : "🌙"}</button>
          <button onClick={exportCSV} style={{ ...btnStyle(false), padding: "8px 12px", fontSize: 12 }}>⬇ CSV</button>
          <button className="cat-btn" onClick={() => setShowCatManager(true)} style={btnStyle(false)}>⊞ Categories</button>
          <button onClick={openAdd} style={btnStyle(true)}>+ Add Bill</button>
        </div>
      </div>

      <div style={{ padding: "20px", maxWidth: 860, margin: "0 auto" }}>

        {!isPro && (
          <div style={{ background: D ? "#1a160a" : "#fffbe8", border: `1px solid ${D ? "#3a2e10" : "#f5e08a"}`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 12, color: D ? "#c8a84b" : "#7a6010" }}>Free plan · {bills.length}/{FREE_LIMIT} bills used</span>
            <button onClick={() => setShowUpgrade(true)} style={{ background: "#ffe66d", color: "#0d0d0f", border: "none", borderRadius: 6, padding: "5px 14px", fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>Upgrade to Pro →</button>
          </div>
        )}

        <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: fgSub, letterSpacing: "0.1em" }}>INCOME</div>
            {!editingIncome
              ? <button className="icon-btn" onClick={() => { setIncomeInput(String(monthlyIncome)); setEditingIncome(true); }} style={{ fontSize: 11, color: fgSub }}>✏️ edit</button>
              : <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: fgSub }}>$/mo</span>
                  <input type="number" min="0" step="100" value={incomeInput}
                    onChange={e => setIncomeInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { setMonthlyIncome(parseFloat(incomeInput)||0); setEditingIncome(false); } if (e.key === "Escape") setEditingIncome(false); }}
                    autoFocus
                    style={{ width: 100, background: bgInput, border: `1px solid ${border}`, color: fg, borderRadius: 5, padding: "4px 8px", fontFamily: "inherit", fontSize: 13 }}
                  />
                  <button className="pill-btn" onClick={() => { setMonthlyIncome(parseFloat(incomeInput)||0); setEditingIncome(false); }} style={{ background: "#ffe66d", color: "#0d0d0f", borderRadius: 5, padding: "4px 10px", fontSize: 12, fontFamily: "inherit", fontWeight: 500, border: "none" }}>OK</button>
                </div>
            }
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="income-grid">
            <div>
              <div style={{ fontSize: 10, color: fgSub, marginBottom: 4 }}>MONTHLY INCOME</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#a8e6cf" }}>${monthlyIncome.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: fgSub, marginBottom: 4 }}>YEARLY INCOME</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#a8e6cf" }}>${yearlyIncome.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 12 }} className="summary-grid">
          {[
            { label: "MONTHLY SPEND", val: `$${monthlyTotal.toFixed(0)}`, color: "#ffe66d" },
            { label: "YEARLY SPEND", val: `$${yearlyTotal.toFixed(0)}`, color: fg },
            { label: "MONTHLY LEFT", val: `${monthlyNet >= 0 ? "+" : ""}$${monthlyNet.toFixed(0)}`, color: monthlyNet >= 0 ? "#a8e6cf" : "#ff8b94" },
            { label: "ACTIVE BILLS", val: activeBills.length, color: fg },
          ].map(c => (
            <div key={c.label} style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 9, color: fgSub, letterSpacing: "0.1em", marginBottom: 6 }}>{c.label}</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: c.color }}>{c.val}</div>
            </div>
          ))}
        </div>

        <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}>
            <span style={{ color: fgSub, letterSpacing: "0.08em" }}>BILLS AS % OF INCOME</span>
            <span style={{ color: spendPct > 80 ? "#ff8b94" : spendPct > 50 ? "#ffe66d" : "#a8e6cf", fontWeight: 500 }}>{spendPct.toFixed(1)}%</span>
          </div>
          <div style={{ height: 6, background: D ? "#1e1e22" : "#eeebe5", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 3, transition: "width 0.5s, background 0.3s", width: `${spendPct}%`, background: spendPct > 80 ? "#ff8b94" : spendPct > 50 ? "#ffe66d" : "#a8e6cf" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, marginBottom: 20, alignItems: "start" }}>
          <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 12, padding: "18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 10, color: fgSub, letterSpacing: "0.1em" }}>BY CATEGORY</div>
            <DonutChart categories={categories} bills={bills} getCatColor={getCatColor} monthlyTotal={monthlyTotal || 1} />
            <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%" }}>
              {categories.map(cat => {
                const val = activeBills.filter(b => b.category === cat.name).reduce((s, b) => s + toMonthly(b.amount, b.cycle), 0);
                if (!val) return null;
                return (
                  <div key={cat.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: getCatColor(cat.name), flexShrink: 0 }} />
                    <span style={{ flex: 1, color: fgMid }}>{cat.name}</span>
                    <span style={{ color: fg }}>${val.toFixed(0)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 12, padding: "18px" }}>
            <div style={{ fontSize: 10, color: fgSub, letterSpacing: "0.1em", marginBottom: 14 }}>DUE THIS WEEK</div>
            {dueThisWeek.length === 0
              ? <div style={{ fontSize: 12, color: fgSub, paddingTop: 8 }}>🎉 Nothing due in the next 7 days</div>
              : dueThisWeek.map(b => {
                  const status = getStatusLabel(b.dueDay);
                  return (
                    <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${borderMid}` }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: status.urgent ? "#ff8b50" : "#ffe66d", flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13 }}>{b.name}</span>
                      <span style={{ fontSize: 12, color: fgMid }}>${b.amount.toFixed(2)}</span>
                      <span style={{ fontSize: 11, color: status.urgent ? "#ff8b50" : fgSub, minWidth: 52, textAlign: "right" }}>{status.label}</span>
                    </div>
                  );
                })
            }
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: fgSub, letterSpacing: "0.1em", marginBottom: 10 }}>FILTER BY CATEGORY</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["All", ...categories.map(c => c.name)].map(cat => {
              const catColor = cat === "All" ? "#ffe66d" : getCatColor(cat);
              const catTotal = cat === "All" ? monthlyTotal : activeBills.filter(b => b.category === cat).reduce((s, b) => s + toMonthly(b.amount, b.cycle), 0);
              const active = filter === cat;
              return (
                <button key={cat} className="pill-btn" onClick={() => setFilter(cat)} style={{
                  background: active ? catColor : bgPill, color: active ? "#0d0d0f" : fgMid,
                  border: `1px solid ${active ? "transparent" : border}`,
                  borderRadius: 6, padding: "6px 14px", fontSize: 12, fontFamily: "inherit"
                }}>
                  {cat}{cat !== "All" && catTotal > 0 ? ` · $${catTotal.toFixed(0)}` : ""}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, color: fgSub, letterSpacing: "0.1em", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
            <span>{filter === "All" ? "ALL BILLS" : filter.toUpperCase()} · {filtered.length} items</span>
            <button onClick={() => setShowCatManager(true)} style={{ background: "none", border: "none", color: fgSub, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>⊞ Manage categories</button>
          </div>
          <div style={{ border: `1px solid ${border}`, borderRadius: 12, overflow: "hidden" }}>
            {filtered.length === 0 && <div style={{ padding: "32px", textAlign: "center", color: fgSub, fontSize: 13 }}>No bills in this category</div>}
            {filtered.map((bill, i) => {
              const status = getStatusLabel(bill.dueDay);
              const pct = monthlyTotal > 0 ? (toMonthly(bill.amount, bill.cycle) / monthlyTotal) * 100 : 0;
              const catColor = getCatColor(bill.category);
              return (
                <div key={bill.id} className="bill-row" style={{
                  background: i % 2 === 0 ? bgRow0 : bgRow1,
                  borderTop: i > 0 ? `1px solid ${borderMid}` : "none",
                  padding: "11px 14px", opacity: bill.active ? 1 : 0.45,
                }}
                  onMouseEnter={e => e.currentTarget.style.background = bgHover}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? bgRow0 : bgRow1}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
                      <button className="icon-btn" onClick={() => moveBill(bill.id, "up")} disabled={i === 0} style={{ color: fgSub }}>▲</button>
                      <button className="icon-btn" onClick={() => moveBill(bill.id, "down")} disabled={i === filtered.length - 1} style={{ color: fgSub }}>▼</button>
                    </div>
                    <div style={{ fontSize: 10, color: D ? "#2e2e36" : "#ccc", minWidth: 14, textAlign: "center" }}>{i + 1}</div>
                    <div onClick={() => toggleActive(bill.id)} style={{ width: 8, height: 8, borderRadius: "50%", background: bill.active ? catColor : (D ? "#2e2e2e" : "#ccc"), cursor: "pointer", flexShrink: 0 }} title={bill.active ? "Active — click to pause" : "Paused"} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{bill.name}</span>
                        <span className="cat-chip" style={{ background: catColor + "22", color: catColor }}>{bill.category}</span>
                        {!bill.active && <span style={{ fontSize: 10, color: fgSub, letterSpacing: "0.08em" }}>PAUSED</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="progress-bar" style={{ width: 120, background: D ? "#1e1e22" : "#eeebe5" }}>
                          <div className="progress-fill" style={{ width: `${pct}%`, background: catColor }} />
                        </div>
                        {bill.notes && <span style={{ fontSize: 10, color: fgSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>📝 {bill.notes}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 80 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>${bill.amount.toFixed(2)}</div>
                      <div style={{ fontSize: 10, color: fgSub }}>{bill.cycle.toLowerCase()}</div>
                    </div>
                    <div className="bill-due" style={{ textAlign: "center", minWidth: 54 }}>
                      <div style={{ fontSize: 11, color: status.urgent && bill.active ? "#ff8b50" : fgSub }}>{status.label}</div>
                      <div style={{ fontSize: 10, color: D ? "#333" : "#bbb" }}>day {bill.dueDay}</div>
                    </div>
                    <div style={{ display: "flex", gap: 2 }}>
                      <button className="icon-btn" onClick={() => openEdit(bill)} style={{ color: fgSub, fontSize: 13 }}
                        onMouseEnter={e => { e.currentTarget.style.color = fg; e.currentTarget.style.background = bgIconHover; }}
                        onMouseLeave={e => { e.currentTarget.style.color = fgSub; e.currentTarget.style.background = "none"; }}>✏️</button>
                      <button className="icon-btn" onClick={() => deleteBill(bill.id)} style={{ color: "#ff4a4a44", fontSize: 13 }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#ff6b6b"; e.currentTarget.style.background = bgIconHover; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "#ff4a4a44"; e.currentTarget.style.background = "none"; }}>✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <button onClick={() => setShowFeedback(true)} style={{ background: "none", border: `1px solid ${border}`, color: fgSub, borderRadius: 8, padding: "9px 20px", fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>
            💬 Give Feedback
          </button>
        </div>
      </div>

      {showForm && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" style={{ background: bgModal, border: `1px solid ${border}` }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 20, color: fg }}>{editId !== null ? "Edit Bill" : "New Bill"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: fgSub, marginBottom: 5, letterSpacing: "0.08em" }}>NAME</div>
                <input className="modal-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Netflix" style={{ background: bgInput, border: `1px solid ${border}`, color: fg }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: fgSub, marginBottom: 5, letterSpacing: "0.08em" }}>AMOUNT ($)</div>
                  <input className="modal-input" type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0.00" style={{ background: bgInput, border: `1px solid ${border}`, color: fg }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: fgSub, marginBottom: 5, letterSpacing: "0.08em" }}>CYCLE</div>
                  <select className="modal-input" value={form.cycle} onChange={e => setForm({...form, cycle: e.target.value})} style={{ background: bgInput, border: `1px solid ${border}`, color: fg }}>
                    {CYCLES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: fgSub, marginBottom: 5, letterSpacing: "0.08em" }}>CATEGORY</div>
                  <select className="modal-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ background: bgInput, border: `1px solid ${border}`, color: fg }}>
                    {categories.map(c => <option key={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: fgSub, marginBottom: 5, letterSpacing: "0.08em" }}>DUE DAY (1–31)</div>
                  <input className="modal-input" type="number" min="1" max="31" value={form.dueDay} onChange={e => setForm({...form, dueDay: parseInt(e.target.value)||1})} style={{ background: bgInput, border: `1px solid ${border}`, color: fg }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: fgSub, marginBottom: 5, letterSpacing: "0.08em" }}>NOTES (optional)</div>
                <textarea className="modal-input" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="e.g. cancel before renewal, shared with partner…" rows={2} style={{ background: bgInput, border: `1px solid ${border}`, color: fg, resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button className="pill-btn" onClick={saveForm} style={{ flex: 1, background: "#ffe66d", color: "#0d0d0f", borderRadius: 7, padding: "11px", fontSize: 13, fontWeight: 500, fontFamily: "inherit", border: "none" }}>Save</button>
                <button className="pill-btn" onClick={() => setShowForm(false)} style={{ flex: 1, background: bgPill, color: fgMid, borderRadius: 7, padding: "11px", fontSize: 13, fontFamily: "inherit", border: `1px solid ${border}` }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCatManager && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowCatManager(false)}>
          <div className="modal" style={{ background: bgModal, border: `1px solid ${border}` }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 6, color: fg }}>Manage Categories</div>
            <div style={{ fontSize: 12, color: fgSub, marginBottom: 18 }}>Add custom categories or remove existing ones.</div>
            <div style={{ marginBottom: 20 }}>
              {categories.map(cat => (
                <div key={cat.name} className="cat-row" style={{ borderBottom: `1px solid ${borderMid}` }}>
                  <div style={{ width: 11, height: 11, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: fg }}>{cat.name}</span>
                  <span style={{ fontSize: 11, color: fgSub }}>{bills.filter(b => b.category === cat.name).length} bills</span>
                  <button className="icon-btn" onClick={() => deleteCategory(cat.name)} disabled={categories.length <= 1} style={{ color: "#ff4a4a55", fontSize: 13, marginLeft: 4 }}
                    onMouseEnter={e => e.currentTarget.style.color = "#ff6b6b"}
                    onMouseLeave={e => e.currentTarget.style.color = "#ff4a4a55"}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ borderTop: `1px solid ${border}`, paddingTop: 16 }}>
              <div style={{ fontSize: 11, color: fgSub, letterSpacing: "0.08em", marginBottom: 8 }}>NEW CATEGORY</div>
              <input value={newCatName} onChange={e => setNewCatName(e.target.value)} onKeyDown={e => e.key === "Enter" && addCategory()} placeholder="Category name…"
                style={{ width: "100%", background: bgInput, border: `1px solid ${border}`, color: fg, borderRadius: 6, padding: "9px 12px", fontFamily: "inherit", fontSize: 14, marginBottom: 10, outline: "none" }} />
              <div style={{ fontSize: 11, color: fgSub, letterSpacing: "0.08em", marginBottom: 8 }}>COLOR</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                {PALETTE.map(color => (
                  <div key={color} className={`color-swatch${newCatColor === color ? " selected" : ""}`} style={{ background: color }} onClick={() => setNewCatColor(color)} />
                ))}
              </div>
              <button className="pill-btn" onClick={addCategory} style={{ width: "100%", background: newCatName.trim() ? "#ffe66d" : bgPill, color: newCatName.trim() ? "#0d0d0f" : fgSub, borderRadius: 7, padding: "10px", fontSize: 13, fontWeight: 500, fontFamily: "inherit", border: `1px solid ${border}` }}>+ Add Category</button>
            </div>
            <button className="pill-btn" onClick={() => setShowCatManager(false)} style={{ width: "100%", background: "transparent", color: fgSub, borderRadius: 7, padding: "9px", fontSize: 13, fontFamily: "inherit", marginTop: 10, border: "none" }}>Done</button>
          </div>
        </div>
      )}

      {showUpgrade && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowUpgrade(false)}>
          <div className="modal" style={{ background: bgModal, border: `1px solid ${border}`, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⭐</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 8, color: fg }}>Upgrade to IAmStewardly Pro</div>
            <div style={{ fontSize: 13, color: fgSub, marginBottom: 24, lineHeight: 1.7 }}>
              You've reached the free plan limit of {FREE_LIMIT} bills.<br />Unlock the full experience:
            </div>
            <div style={{ textAlign: "left", marginBottom: 24 }}>
              {["Unlimited bills", "Priority reordering", "CSV export", "Spending charts", "Notes on bills", "Dark & light mode", "All future features"].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid ${borderMid}`, fontSize: 13, color: fg }}>
                  <span style={{ color: "#a8e6cf" }}>✓</span> {f}
                </div>
              ))}
            </div>
            <button className="pill-btn" onClick={() => { setIsPro(true); setShowUpgrade(false); }} style={{ width: "100%", background: "#ffe66d", color: "#0d0d0f", borderRadius: 9, padding: "13px", fontSize: 15, fontWeight: 700, fontFamily: "'Syne',sans-serif", border: "none", marginBottom: 10 }}>
              Unlock Pro — $4.99/mo
            </button>
            <div style={{ fontSize: 11, color: fgSub, marginBottom: 14 }}>or $39/year · Cancel anytime</div>
            <button className="pill-btn" onClick={() => setShowUpgrade(false)} style={{ background: "none", border: "none", color: fgSub, fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>Maybe later</button>
          </div>
        </div>
      )}

      {showFeedback && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowFeedback(false)}>
          <div className="modal" style={{ background: bgModal, border: `1px solid ${border}` }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 6, color: fg }}>Share Your Thoughts</div>
            <div style={{ fontSize: 12, color: fgSub, marginBottom: 18 }}>What's working? What's missing? We read everything.</div>
            {feedbackSent
              ? <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🙏</div>
                  <div style={{ fontSize: 14, color: fg, marginBottom: 6 }}>Thank you for your feedback!</div>
                  <div style={{ fontSize: 12, color: fgSub }}>It genuinely helps us improve IAmStewardly.</div>
                  <button className="pill-btn" onClick={() => { setShowFeedback(false); setFeedbackSent(false); setFeedbackText(""); }} style={{ marginTop: 20, background: bgPill, color: fgMid, borderRadius: 7, padding: "9px 20px", fontSize: 13, fontFamily: "inherit", border: `1px solid ${border}` }}>Close</button>
                </div>
              : <>
                  <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} placeholder="Tell us what you think…" rows={5}
                    style={{ width: "100%", background: bgInput, border: `1px solid ${border}`, color: fg, borderRadius: 8, padding: "12px", fontFamily: "inherit", fontSize: 13, resize: "vertical", outline: "none", marginBottom: 14 }} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="pill-btn" onClick={() => { if (feedbackText.trim()) setFeedbackSent(true); }} style={{ flex: 1, background: feedbackText.trim() ? "#ffe66d" : bgPill, color: feedbackText.trim() ? "#0d0d0f" : fgSub, borderRadius: 7, padding: "11px", fontSize: 13, fontWeight: 500, fontFamily: "inherit", border: `1px solid ${border}` }}>Send Feedback</button>
                    <button className="pill-btn" onClick={() => setShowFeedback(false)} style={{ flex: 1, background: bgPill, color: fgMid, borderRadius: 7, padding: "11px", fontSize: 13, fontFamily: "inherit", border: `1px solid ${border}` }}>Cancel</button>
                  </div>
                </>
            }
          </div>
        </div>
      )}

      {deleted && (
        <div className="undo-toast" style={{ background: D ? "#2a2a2e" : "#fff", border: `1px solid ${border}` }}>
          <span style={{ fontSize: 13, color: fgMid }}>Deleted <strong style={{ color: fg }}>{deleted.name}</strong></span>
          <button className="pill-btn" onClick={undoDelete} style={{ background: "#ffe66d", color: "#0d0d0f", borderRadius: 5, padding: "5px 12px", fontSize: 12, fontFamily: "inherit", fontWeight: 500, border: "none" }}>Undo</button>
        </div>
      )}
    </div>
  );
}
