import { useState, useEffect } from "react";
import "./App.css";

function AnimPreview({ caption, style, animKey }) {
  const words = caption.replace(/[#\n]/g, " ").split(" ").filter(Boolean).slice(0, 14);
  const lines = [];
  for (let i = 0; i < words.length; i += 4) {
    lines.push(words.slice(i, i + 4).join(" "));
  }

  // Typewriter effect
  const [displayed, setDisplayed] = useState("");
  const fullText = words.slice(0, 14).join(" ");

  useEffect(() => {
    if (style !== "typewriter") return;
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, [animKey, style, fullText]);

  return (
    <div className="anim-preview">
      <span className="anim-badge">PREVIEW</span>

      {style === "slide-up" && (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 4, maxWidth: 280 }}>
          {words.map((word, i) => (
            <span key={`${animKey}-${i}`} className="anim-word"
              style={{ animationDelay: `${i * 0.08}s` }}>
              {word}
            </span>
          ))}
        </div>
      )}

      {style === "fade-in" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
          {lines.map((line, i) => (
            <div key={`${animKey}-${i}`} className={`anim-line${i === 0 ? " highlight" : ""}`}
              style={{ animationDelay: `${i * 0.9}s` }}>
              {line}
            </div>
          ))}
        </div>
      )}

      {style === "typewriter" && (
        <div className="anim-typewriter">
          {displayed}
          <span className="anim-cursor" />
        </div>
      )}
    </div>
  );
}

const PLATFORMS = [
  { id: "Instagram", label: "📸 Instagram" },
  { id: "TikTok", label: "🎵 TikTok" },
  { id: "Facebook", label: "👥 Facebook" },
  { id: "Twitter/X", label: "🐦 Twitter/X" },
  { id: "YouTube Shorts", label: "▶️ YouTube" },
  { id: "LINE", label: "💚 LINE" },
];

const GOALS = [
  { id: "awareness", label: "🌱 สร้างการรับรู้" },
  { id: "engagement", label: "💬 เพิ่มการมีส่วนร่วม" },
  { id: "sale", label: "🛒 กระตุ้นการขาย" },
  { id: "community", label: "🤝 สร้างชุมชน" },
];

const FIELDS = [
  "ดนตรี", "ศิลปะภาพ / จิตรกรรม", "เซรามิก / เครื่องปั้นดินเผา",
  "เครื่องประดับ", "งานหนัง", "งานไม้", "แฟชั่น / สิ่งทอ",
  "ถ่ายภาพ", "ดิจิทัลอาร์ต / NFT", "อาหาร / เบเกอรี่",
  "งานเขียน / บทกวี", "งานฝีมืออื่นๆ",
];

const STAGES = ["อธิบาย", "กลยุทธ์", "คอนเทนต์", "เผยแพร่"];

export default function App() {
  const [lang, setLang] = useState("th");
  const [desc, setDesc] = useState("");
  const [field, setField] = useState("");
  const [price, setPrice] = useState("");
  const [voice, setVoice] = useState("");
  const [platforms, setPlatforms] = useState(["Instagram"]);
  const [goal, setGoal] = useState("awareness");
  const [numVariants, setNumVariants] = useState(1);
  const [stage, setStage] = useState(0);
  const [activeTab, setActiveTab] = useState("strategy");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [activeVariant, setActiveVariant] = useState({});
  const [animPlatform, setAnimPlatform] = useState(null);
  const [animStyle, setAnimStyle] = useState("slide-up");
  const [animKey, setAnimKey] = useState(0);
  const [imgB64, setImgB64] = useState(null);
  const [imgType, setImgType] = useState(null);
  const [imgAnalysis, setImgAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const togglePlatform = (id) =>
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgType(file.type);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target.result.split(",")[1];
      setImgB64(b64);
      analyzeImage(b64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (b64, type) => {
    setAnalyzing(true);
    setImgAnalysis("");
    try {
      //const res = await fetch("http://localhost:3000/api/generate", {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: type, data: b64 } },
                {
                  type: "text",
                  text: lang === "th"
                    ? "วิเคราะห์รูปนี้และอธิบายสินค้า/ผลงานที่เห็นในภาษาไทย 2-3 ประโยค เน้นวัสดุ สี สไตล์ และความโดดเด่น"
                    : "Analyse this image and describe the item in 2-3 sentences. Focus on materials, colours, style, and what makes it distinctive.",
                },
              ],
            },
          ],
        }),
      });
      const data = await res.json();
      const txt = data.content?.map((b) => b.text || "").join("") || "";
      setImgAnalysis(txt);
      if (!desc.trim()) setDesc(txt);
    } catch {
      setImgAnalysis("");
    }
    setAnalyzing(false);
  };

  const generate = async () => {
    if (!desc.trim()) return;
    if (platforms.length === 0) return;
    setLoading(true);
    setError("");
    setResult(null);
    setStage(1);

    const variantInstr =
      numVariants === 1
        ? "Generate 1 caption per platform (variants array with 1 item)"
        : numVariants === 2
        ? "Generate 2 caption variants (A and B) per platform for A/B testing"
        : "Generate 3 caption variants (A, B, C) per platform";

    const langInstr =
      lang === "th"
        ? "ตอบเป็นภาษาไทยทั้งหมด รวมถึง caption, กลยุทธ์, แฮชแท็ก และคำแนะนำ"
        : "Respond entirely in English.";

    const prompt = `You are an expert social media strategist for independent creators and artisans.
${langInstr}

CREATOR INFO:
- Item: ${desc}
- Creative field: ${field || "craft"}
- Price/offer: ${price || "not specified"}
- Voice/style: ${voice || "authentic and personal"}
- Target platforms: ${platforms.join(", ")}
- Goal: ${goal}
- Variants: ${variantInstr}

Respond ONLY with valid JSON, no markdown, no preamble:
{
  "strategy":{
    "hook":"compelling headline max 12 words",
    "insight":"key audience insight 2 sentences",
    "tactics":["tactic 1","tactic 2","tactic 3"],
    "best_time":"optimal posting recommendation"
  },
  "scores":{"reach":72,"engagement":65,"conversion":58},
  "platforms":[
    {
      "platform":"name",
      "icon":"single emoji",
      "variants":[
        {"label":"A","caption":"full caption with emojis and CTA","angle":"what makes this variant different max 8 words"}
      ],
      "format_tip":"platform tip max 12 words"
    }
  ],
  "schedule":{
    "best_days":[1,3,5],
    "best_times":["09:00","19:00","21:00"],
    "frequency":"e.g. 3-4 times per week",
    "tip":"one scheduling insight max 15 words"
  },
  "funnel":[
    {"stage":"${lang === "th" ? "ค้นพบ" : "Discover"}","action":"scroll-stop trigger","color":"#C8963E"},
    {"stage":"${lang === "th" ? "สนใจ" : "Interest"}","action":"builds desire","color":"#A07830"},
    {"stage":"${lang === "th" ? "ตัดสินใจ" : "Consider"}","action":"nudges decision","color":"#7A5A20"},
    {"stage":"${lang === "th" ? "ซื้อ" : "Purchase"}","action":"conversion moment","color":"#543A10"}
  ],
  "hashtags":["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8","tag9","tag10"],
  "storyboard":[
    {"frame":1,"duration":"0-3s","scene":"describe exactly what to film for the hook","action":"what the creator does or shows on camera","caption":"text overlay for this frame","spoken":"what to say out loud","music_mood":"e.g. upbeat, calm, dramatic"},
    {"frame":2,"duration":"3-10s","scene":"describe the main story scene","action":"creator action","caption":"text overlay","spoken":"spoken line","music_mood":"music mood"},
    {"frame":3,"duration":"10-20s","scene":"show the product detail or process","action":"creator action","caption":"text overlay","spoken":"spoken line","music_mood":"music mood"},
    {"frame":4,"duration":"20-27s","scene":"social proof or result moment","action":"creator action","caption":"text overlay","spoken":"spoken line","music_mood":"music mood"},
    {"frame":5,"duration":"27-30s","scene":"call to action closing shot","action":"creator action","caption":"strong CTA text overlay","spoken":"closing CTA line","music_mood":"music mood"}
  ]
}`;

    const messages = imgB64
      ? [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: imgType, data: imgB64 } },
          { type: "text", text: prompt },
        ]}]
      : [{ role: "user", content: prompt }];

    try {
      setStage(2);
      //const res = await fetch("http://localhost:3000/api/generate", {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json();
      const txt = data.content?.map((b) => b.text || "").join("") || "";
      const clean = txt.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setStage(3);
      setActiveTab("strategy");
      setActiveVariant({});
    } catch (e) {
      setError(lang === "th" ? "เกิดข้อผิดพลาด กรุณาลองใหม่: " + e.message : "Error: " + e.message);
      setStage(0);
    }
    setLoading(false);
  };

  const copy = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 2000);
    });
  };

  const getVariantIdx = (platId) => activeVariant[platId] || 0;

  const T = {
    th: {
      title: "Creator Broadcast Agent",
      sub: "เอเจนต์สร้างคอนเทนต์โซเชียลมีเดีย สำหรับนักสร้างสรรค์และช่างฝีมือไทย",
      imgLabel: "อัปโหลดรูปผลงาน",
      imgHint: "คลิกเพื่ออัปโหลด — AI จะวิเคราะห์และอธิบายให้อัตโนมัติ",
      analyzing: "กำลังวิเคราะห์รูป...",
      analysisLabel: "AI วิเคราะห์:",
      aboutLabel: "เกี่ยวกับผลงาน",
      whatLabel: "คุณสร้างอะไร?",
      whatPh: "อธิบายผลงาน: เช่น ชามเซรามิกเคลือบสีทะเล, เพลงกีตาร์แจ๊สต้นฉบับ...",
      fieldLabel: "สาขา",
      fieldPh: "เลือกสาขา...",
      priceLabel: "ราคา / ข้อเสนอ",
      pricePh: "เช่น ฿1,200, ดาวน์โหลดฟรี",
      voiceLabel: "สไตล์การสื่อสาร",
      voicePh: "เช่น อบอุ่น เป็นกันเอง, มินิมอล, เล่าเรื่อง",
      platLabel: "แพลตฟอร์ม",
      goalLabel: "เป้าหมาย",
      varLabel: "จำนวน Variants",
      vars: ["1 แบบ", "2 แบบ (A/B)", "3 แบบ (A/B/C)"],
      genBtn: "✦ สร้างกลยุทธ์คอนเทนต์",
      regenBtn: "↻ สร้างใหม่",
      loadingBtn: "กำลังสร้าง...",
      tabs: ["กลยุทธ์", "คอนเทนต์", "ตารางโพสต์", "Funnel", "🎬 Storyboard"],
      stratLabel: "กลยุทธ์",
      insightLabel: "Insight:",
      bestTimeLabel: "⏰ เวลาที่เหมาะสม:",
      scoresLabel: "คะแนนที่คาดการณ์",
      scoreNames: ["การเข้าถึง", "การมีส่วนร่วม", "โอกาสขาย"],
      schedLabel: "ตารางโพสต์",
      daysLabel: "วันที่ดีที่สุด:",
      timesLabel: "เวลาแนะนำ:",
      freqLabel: "ความถี่:",
      funnelLabel: "เส้นทางผู้ชม",
      hashLabel: "แฮชแท็กแนะนำ",
      copyBtn: "คัดลอก",
      copiedBtn: "คัดลอกแล้ว ✓",
      days: ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"],
    },
    en: {
      title: "Creator Broadcast Agent",
      sub: "AI-powered social media content for independent creators and artisans",
      imgLabel: "Upload your work",
      imgHint: "Click to upload — AI will analyse it automatically",
      analyzing: "Analysing image...",
      analysisLabel: "AI analysis:",
      aboutLabel: "About your work",
      whatLabel: "What did you create?",
      whatPh: "Describe your item: handmade ceramic bowl, original jazz track...",
      fieldLabel: "Field",
      fieldPh: "Select field...",
      priceLabel: "Price / offer",
      pricePh: "e.g. $85, free download, DM to order",
      voiceLabel: "Voice / style",
      voicePh: "e.g. warm and personal, bold & minimal, storytelling",
      platLabel: "Platforms",
      goalLabel: "Goal",
      varLabel: "Variants",
      vars: ["1 variant", "2 variants (A/B)", "3 variants (A/B/C)"],
      genBtn: "✦ Generate Content Strategy",
      regenBtn: "↻ Regenerate",
      loadingBtn: "Generating...",
      tabs: ["Strategy", "Content", "Schedule", "Funnel", "🎬 Storyboard"],
      stratLabel: "Strategy",
      insightLabel: "Insight:",
      bestTimeLabel: "🕐 Best time:",
      scoresLabel: "Predicted scores",
      scoreNames: ["Reach", "Engagement", "Conversion"],
      schedLabel: "Posting schedule",
      daysLabel: "Best days:",
      timesLabel: "Best times:",
      freqLabel: "Frequency:",
      funnelLabel: "Audience funnel",
      hashLabel: "Suggested hashtags",
      copyBtn: "Copy",
      copiedBtn: "Copied ✓",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
  };
  const t = T[lang];

  return (
    <div className="app">
      {/* Header */}
      <header className="hdr">
        <h1>{t.title}</h1>
        <p>{t.sub}</p>
        <div className="lang-row">
          <button className={`lbtn${lang === "en" ? " on" : ""}`} onClick={() => setLang("en")}>🇬🇧 English</button>
          <button className={`lbtn${lang === "th" ? " on" : ""}`} onClick={() => setLang("th")}>🇹🇭 ภาษาไทย</button>
        </div>
      </header>

      {/* Stage pills */}
      <div className="stages">
        {STAGES.map((s, i) => (
          <div key={s} className={`stage-pill${stage === i ? " active" : stage > i ? " done" : ""}`}>
            <span className="dot" />
            {lang === "th" ? s : ["Describe", "Strategy", "Content", "Broadcast"][i]}
          </div>
        ))}
      </div>

      {/* Input card */}
      <div className="card">
        {/* Image upload */}
        <div className="clabel">{t.imgLabel}</div>
        <label className={`img-zone${imgB64 ? " has-img" : ""}`}>
          <input type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
          {imgB64
            ? <img src={`data:${imgType};base64,${imgB64}`} alt="preview" className="img-preview" />
            : <p className="img-hint">{t.imgHint}</p>}
        </label>
        {analyzing && <p className="img-analysis">{t.analyzing}</p>}
        {imgAnalysis && !analyzing && (
          <p className="img-analysis"><strong>{t.analysisLabel}</strong> {imgAnalysis}</p>
        )}

        {/* About */}
        <div className="clabel" style={{ marginTop: 18 }}>{t.aboutLabel}</div>
        <div className="field">
          <label>{t.whatLabel}</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t.whatPh} />
        </div>
        <div className="row2">
          <div className="field">
            <label>{t.fieldLabel}</label>
            <select value={field} onChange={(e) => setField(e.target.value)}>
              <option value="">{t.fieldPh}</option>
              {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="field">
            <label>{t.priceLabel}</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder={t.pricePh} />
          </div>
        </div>
        <div className="field">
          <label>{t.voiceLabel}</label>
          <input value={voice} onChange={(e) => setVoice(e.target.value)} placeholder={t.voicePh} />
        </div>

        {/* Platforms */}
        <div className="field">
          <label>{t.platLabel}</label>
          <div className="chips">
            {PLATFORMS.map((p) => (
              <button key={p.id} className={`chip${platforms.includes(p.id) ? " on" : ""}`}
                onClick={() => togglePlatform(p.id)}>{p.label}</button>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div className="field">
          <label>{t.goalLabel}</label>
          <div className="chips">
            {GOALS.map((g) => (
              <button key={g.id} className={`chip${goal === g.id ? " on" : ""}`}
                onClick={() => setGoal(g.id)}>
                {lang === "th" ? g.label : ["🌱 Awareness", "💬 Engagement", "🛒 Convert to sale", "🤝 Community"][GOALS.indexOf(g)]}
              </button>
            ))}
          </div>
        </div>

        {/* Variants */}
        <div className="field">
          <label>{t.varLabel}</label>
          <div className="chips">
            {[1, 2, 3].map((v, i) => (
              <button key={v} className={`chip${numVariants === v ? " on" : ""}`}
                onClick={() => setNumVariants(v)}>{t.vars[i]}</button>
            ))}
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <button className="gen-btn" onClick={generate} disabled={loading || !desc.trim() || platforms.length === 0}>
          {loading ? t.loadingBtn : result ? t.regenBtn : t.genBtn}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="results">
          {/* Tabs */}
          <div className="tabs">
            {t.tabs.map((tab, i) => {
              const ids = ["strategy", "content", "schedule", "funnel", "storyboard"];
              return (
                <button key={tab} className={`tab${activeTab === ids[i] ? " on" : ""}`}
                  onClick={() => setActiveTab(ids[i])}>{tab}</button>
              );
            })}
          </div>

          {/* Strategy tab */}
          {activeTab === "strategy" && (
            <div>
              <div className="strat-box">
                <h2 className="strat-hook">{result.strategy.hook}</h2>
                <p className="strat-insight"><strong>{t.insightLabel}</strong> {result.strategy.insight}</p>
                <div className="tactics">
                  {result.strategy.tactics.map((tac, i) => (
                    <div key={i} className="tactic"><span className="tac-num">{i + 1}.</span>{tac}</div>
                  ))}
                </div>
                <p className="best-time">{t.bestTimeLabel} {result.strategy.best_time}</p>
              </div>
              <div className="card">
                <div className="clabel">{t.scoresLabel}</div>
                {[result.scores.reach, result.scores.engagement, result.scores.conversion].map((val, i) => (
                  <div key={i} className="score-row">
                    <span className="score-lbl">{t.scoreNames[i]}</span>
                    <div className="score-track"><div className="score-fill" style={{ width: val + "%" }} /></div>
                    <span className="score-val">{val}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content tab */}
          {activeTab === "content" && (
            <div>
              {result.platforms
                .filter((p) => platforms.some((s) =>
                  p.platform.toLowerCase().includes(s.toLowerCase()) ||
                  s.toLowerCase().includes(p.platform.toLowerCase())
                ))
                .map((p) => {
                  const idx = getVariantIdx(p.platform);
                  const variant = p.variants?.[idx];
                  return (
                    <div key={p.platform} className="p-card">
                      <div className="p-head">
                        <span className="p-name"><span className="p-icon">{p.icon}</span>{p.platform}</span>
                        <div className="p-actions">
                          {p.variants?.length > 1 && (
                            <div className="ab-tabs">
                              {p.variants.map((v, vi) => (
                              <button key={v.label}
                                className={`ab-tab${idx === vi ? " on" : ""}`}
                                onClick={() => setActiveVariant({ ...activeVariant, [p.platform]: vi })}>
                                {v.label}
                              </button>
                              ))}
                            </div>
                          )}
                          <button className="anim-ctrl-btn"
                            onClick={() => { setAnimPlatform(animPlatform === p.platform ? null : p.platform); setAnimKey(k => k + 1); }}>
                            {animPlatform === p.platform ? "✕ Close" : "▶ Preview"}
                          </button>
                          <button className={`copy-btn${copiedId === p.platform ? " ok" : ""}`}
                            onClick={() => copy(variant?.caption || "", p.platform)}>
                            {copiedId === p.platform ? t.copiedBtn : t.copyBtn}
                          </button>
                        </div>
                      </div>
                      {variant?.angle && p.variants?.length > 1 && (
                        <p className="variant-angle">🎯 {variant.angle}</p>
                      )}
                      <p className="p-body">{variant?.caption}</p>
                      <p className="p-tip">💡 {p.format_tip}</p>
                      {animPlatform === p.platform && (
                        <div style={{ padding: "0 14px 14px" }}>
                          <AnimPreview
                            caption={variant?.caption || ""}
                            style={animStyle}
                            animKey={animKey}
                          />
                          <div className="anim-controls">
                            {["slide-up", "fade-in", "typewriter"].map((s) => (
                              <button key={s} className={`anim-ctrl-btn${animStyle === s ? " on" : ""}`}
                                onClick={() => { setAnimStyle(s); setAnimKey(k => k + 1); }}>
                                {s === "slide-up" ? "⬆ Word Fly" : s === "fade-in" ? "✨ Blur Fade" : "⌨ Typewriter"}
                              </button>
                            ))}
                            <button className="anim-ctrl-btn" onClick={() => setAnimKey(k => k + 1)}>↻ Replay</button>
                            <button className="anim-ctrl-btn" onClick={() => setAnimPlatform(null)}>✕ Close</button>
                          </div>
                        </div>
                      )}                      
                    </div>
                  );
                })}
            </div>
          )}

          {/* Schedule tab */}
          {activeTab === "schedule" && result.schedule && (
            <div className="card">
              <div className="clabel">{t.schedLabel}</div>
              <p className="sched-sub">{t.daysLabel}</p>
              <div className="day-grid">
                {t.days.map((d, i) => (
                  <div key={d} className={`day-cell${result.schedule.best_days?.includes(i + 1) ? " best" : ""}`}>{d}</div>
                ))}
              </div>
              <p className="sched-sub" style={{ marginTop: 14 }}>{t.timesLabel}</p>
              <div className="time-slots">
                {result.schedule.best_times?.map((ts, i) => (
                  <span key={ts} className={`time-slot${i === 0 ? " best" : ""}`}>{ts}</span>
                ))}
              </div>
              <p className="sched-freq"><strong>{t.freqLabel}</strong> {result.schedule.frequency}</p>
              {result.schedule.tip && <p className="sched-tip">{result.schedule.tip}</p>}
            </div>
          )}

          {/* Funnel tab */}
          {activeTab === "funnel" && (
            <div>
              <div className="card">
                <div className="clabel">{t.funnelLabel}</div>
                <div className="funnel">
                  {result.funnel?.map((step, i) => (
                    <div key={i}>
                      <div className="funnel-step" style={{
                        background: step.color,
                        width: ["100%", "82%", "65%", "48%"][i],
                      }}>
                        <strong>{step.stage}</strong> — {step.action}
                      </div>
                      {i < result.funnel.length - 1 && <div className="funnel-arrow">↓</div>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="clabel">{t.hashLabel}</div>
                <div className="hashtags">
                  {result.hashtags?.map((h) => (
                    <span key={h} className="hashtag">#{h.replace(/^#/, "")}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Storyboard tab */}
          {activeTab === "storyboard" && result.storyboard && (
            <div>
              {result.storyboard.map((frame) => (
                <div key={frame.frame} className="card" style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--ink)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500 }}>{frame.frame}</div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Frame {frame.frame}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 10px", borderRadius: 100, background: "#F0D9A8", color: "#7A5A1E" }}>{frame.duration}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>🎥 Scene</div>
                      <div style={{ fontSize: 12, lineHeight: 1.6, color: "var(--ink)" }}>{frame.scene}</div>
                    </div>
                    <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>🎬 Action</div>
                      <div style={{ fontSize: 12, lineHeight: 1.6, color: "var(--ink)" }}>{frame.action}</div>
                    </div>
                  </div>
                  <div style={{ background: "#1A1814", borderRadius: 8, padding: "10px 12px", marginBottom: 8, textAlign: "center" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#C8963E", marginBottom: 4 }}>Caption overlay</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#fff", lineHeight: 1.5 }}>{frame.caption}</div>
                  </div>
                  {frame.spoken && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 16 }}>🎙️</span>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 2 }}>Spoken</div>
                        <div style={{ fontSize: 13, fontStyle: "italic", color: "var(--ink)", lineHeight: 1.6 }}>"{frame.spoken}"</div>
                      </div>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>🎵</span>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{frame.music_mood}</span>
                  </div>
                </div>
              ))}
              <div style={{ padding: "12px 16px", background: "var(--surface2)", borderRadius: 10, fontSize: 12, color: "var(--muted)", lineHeight: 1.7 }}>
                💡 {lang === "th" ? "นี่คือแผนการถ่ายทำ — ผู้สร้างถ่ายทำทุกเฟรมด้วยตัวเอง AI ช่วยวางแผนลำดับเรื่องราว" : "This is your shooting plan — you film every frame yourself. The AI planned the sequence; you bring it to life."}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}