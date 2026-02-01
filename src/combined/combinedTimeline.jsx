import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import supabase from "../supabaseClient.js";
import "../brez_ai2/styles/timeline.css";
import "../ai/ai-styles/timeline.css";

// A/B sekcije
import { Sections as SectionsA } from "../brez_ai2/components/sections.jsx";
import { Sections as SectionsB, sections as AI_SECTIONS } from "../ai/ai-components/sections.jsx";

const nowISO = () => new Date().toISOString();

//supabase analytics saving !! connect
export async function saveAnalytics(runId, data) {
 const { error } = await supabase
   .from('analytics')
   .upsert({  // stored in the jsonb column; chnaged to upsert (one row for each run_id, save often in case user leaves)
      run_id: runId,
      data, 
      project_order: data.project_order ?? null},
    {
    onConflict: "run_id",
    });
 if (error) console.error(error)
}

/*
//changed to supabse, dont need
function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
*/

// SESSION & ORDER

function getOrCreateSessionId(explicitUserId) {
  if (explicitUserId) return explicitUserId;
  const KEY = "combined:sessionId";
  const existing = sessionStorage.getItem(KEY);
  if (existing) return existing;
  const gen =
    (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
    `u_${Math.random().toString(36).slice(2)}${Date.now()}`; 
  sessionStorage.setItem(KEY, gen);
  return gen;
}
/*
//base order on run id -- old
function getOrderFromRunId(runId) {
  const firstHex = runId[0];
  const value = parseInt(firstHex, 16);
  return value % 2 === 0 ? "A-B" : "B-A";
}

*/
//decide order from supabase: count how many A-B and B-A entries there are, pick the one with less entries; if equal, random
async function decideOrderFromSupabase(runId) {
  try {
    // Count A-B
    const { count: countAB, error: errAB } = await supabase
      .from("analytics")
      .select("*", { count: "exact", head: true })
      .eq("project_order", "A-B");         // <-- updated

    // Count B-A
    const { count: countBA, error: errBA } = await supabase
      .from("analytics")
      .select("*", { count: "exact", head: true })
      .eq("project_order", "B-A");         // <-- updated

    if (errAB || errBA) {
      console.error("Error fetching counts", errAB || errBA);
      return Math.random() < 0.5 ? "A-B" : "B-A";
    }

    if ((countAB ?? 0) < (countBA ?? 0)) return "A-B";
    if ((countBA ?? 0) < (countAB ?? 0)) return "B-A";

    return Math.random() < 0.5 ? "A-B" : "B-A";
  } catch (e) {
    console.error("Unexpected error in decideOrderFromSupabase", e);
    return Math.random() < 0.5 ? "A-B" : "B-A";
  }
}


/* dont need
function getOrCreateOrder() {
  const KEY = "combined:order";
  const saved = sessionStorage.getItem(KEY);
  if (saved === "A-B" || saved === "B-A") return saved;
  const roll = Math.random() < 0.5 ? "A-B" : "B-A";
  sessionStorage.setItem(KEY, roll);
  return roll;
}*/

// SURVEYS

// Knowledge survey 
function KnowledgeSurvey({ onSubmit }) {
  const QUESTIONS = [
    {
      id: "q1",
      type: "single",
      prompt: "Kako nastane zvezda, kot je Sonce?",
      options: [
        { id: "a", label: "Iz ledene kepe, ki se stopi." },
        { id: "b", label: "Iz oblaka plina in prahu, ki se zaradi gravitacije sesede." }, // correct
        { id: "c", label: "Iz eksplozije planeta." },
        { id: "d", label: "Iz padca kometov v Sonce." },
        { id: "unknown", label: "Ne vem" }, 
      ],
      correct: "b",
    },
    {
      id: "q2",
      type: "single",
      prompt: "Kako so v zgodnjem Osončju nastali planeti?",
      options: [
        { id: "a", label: "Iz delcev v disku okoli mladega Sonca, ki so se zlepljali." }, // correct
        { id: "b", label: "Z zamrzovanjem Sončeve svetlobe." },
        { id: "c", label: "Z izparevanjem kamnin." },
        { id: "d", label: "S preselitvijo z druge zvezde." },
        { id: "unknown", label: "Ne vem" }, 
      ],
      correct: "a",
    },
    { id: "q3", type: "boolean", prompt: "Luna je verjetno nastala po trku Zemlje z objektom velikosti Marsa.", correct: true },
    {
      id: "q4",
      type: "single",
      prompt: "Kaj pomeni pozno obdobje težkega bombardiranja?",
      options: [
        { id: "a", label: "Čas, ko je Sonce ugasnilo." },
        { id: "b", label: "Čas pogostih trkov asteroidov in kometov v planete in lune." }, // correct
        { id: "c", label: "Čas, ko so planeti izginili." },
        { id: "d", label: "Čas, ko je nastala Zemljina atmosfera." },
        { id: "unknown", label: "Ne vem" }, 
      ],
      correct: "b",
    },
    { id: "q5", type: "boolean", prompt: "V zadnjih približno treh milijardah let planeti večinoma mirno krože okoli Sonca.", correct: true },
    {
      id: "q6",
      type: "single",
      prompt: "Kdaj bo Sonce postalo rdeča orjakinja?",
      options: [
        { id: "a", label: "Čez približno 5 milijard let." }, // correct
        { id: "b", label: "Jutri." },
        { id: "c", label: "Pred 4,5 milijardami let." },
        { id: "d", label: "Nikoli." },
        { id: "unknown", label: "Ne vem" }, 
      ],
      correct: "a",
     },
     { id: "q7", type: "boolean", prompt: "Ko Sonce odvrže zunanje plasti, nastane planetarna meglica, v središču ostane bela pritlikavka.", correct: true },
     {
       id: "q8",
       type: "single",
       prompt: "Kako se imenuje majhno, vroče zvezdno jedro, ki ostane po Soncu?",
       options: [
         { id: "a", label: "Rdeča orjakinja" },
         { id: "b", label: "Bela pritlikavka" }, // correct
         { id: "c", label: "Črna luknja" },
         { id: "d", label: "Modra superorjakinja" },
         { id: "unknown", label: "Ne vem" }, 
       ],
       correct: "b",
     },
     {
       id: "q9",
       type: "single",
       prompt: "Kaj se bo zgodilo po zelo dolgem času (trilijoni let)?",
       options: [
         { id: "a", label: "Bela pritlikavka se ohladi v črno pritlikavko; planeti bodo zelo mrzli." }, // correct
         { id: "b", label: "Zemlja postane zvezda." },
         { id: "c", label: "Sonce znova postane mlada zvezda." },
         { id: "d", label: "Planeti dobijo več Sončeve energije kot danes." },
         { id: "unknown", label: "Ne vem" }, 
       ],
       correct: "a",
     },
     {
       id: "q10",
       type: "single",
       prompt: "Koliko je približno stara naša zvezda, Sonce?",
       options: [
         { id: "a", label: "Okoli 4,6 milijarde let." }, // correct
         { id: "b", label: "Okoli 46 milijard let." },
         { id: "c", label: "Okoli 460 tisoč let." },
         { id: "d", label: "Okoli 46 milijonov let." },
         { id: "unknown", label: "Ne vem" }, 
       ],
       correct: "a",
     },
   ];

  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(QUESTIONS.map(q => [q.id, q.type === "boolean" ? null : ""]))
  );
  const [errors, setErrors] = useState(() =>
    Object.fromEntries(QUESTIONS.map(q => [q.id, ""]))
  );
  const refs = useRef(Object.fromEntries(QUESTIONS.map(q => [q.id, React.createRef()])));
  const submittedRef = useRef(false);

  const validate = useCallback((data) => {
    const e = {};
    for (const q of QUESTIONS) {
      const v = data[q.id];
      if (q.type === "boolean") e[q.id] = (v === null || v === "") ? "Prosimo, izberite Da/Ne/Ne vem." : "";
      else e[q.id] = v ? "" : "To vprašanje je obvezno.";
    }
    return e;
  }, []);

  const handleChange = (id, value) => {
    setAnswers((s) => ({ ...s, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: (value === null || value === "") ? prev[id] : "" }));
  };

  const grade = (data) => {
    const correctness = {};
    let score = 0;
    for (const q of QUESTIONS) {
      const v = data[q.id];
      const ok = (q.type === "single" || q.type === "boolean") ? v === q.correct : false;
      correctness[q.id] = !!ok;
      if (ok) score++;
    }
    return { score, total: QUESTIONS.length, correctness };
  };

  const handleSubmit = () => {
    if (submittedRef.current) return;
    const e = validate(answers);
    setErrors(e);
    const firstInvalid = QUESTIONS.find(q => e[q.id]);
    if (firstInvalid) {
      refs.current[firstInvalid.id]?.current?.focus?.();
      return;
    }
    submittedRef.current = true;
    const result = grade(answers);
    onSubmit({
      answers,
      ...result,
      questionsMeta: QUESTIONS.map(({ id, type, prompt, correct }) => ({ id, type, prompt, correct })),
      ts: nowISO(),
    });
  };

  return (
    <div style={{ maxWidth: 780, margin: "40px auto", padding: 20 }}>
      <h2>Preverjanje znanja</h2>
      <p>Označi pravilen odgovor pri vsakem vprašanju. Vsa vprašanja so obvezna.</p>

      {QUESTIONS.map((q, idx) => (
        <div key={q.id} style={{ margin: "18px 0 22px" }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>
            {idx + 1}) {q.prompt}
          </div>

          {q.type === "single" && (
            <div>
              {q.options.map(opt => (
                <label key={opt.id} style={{ display: "block", margin: "6px 0" }}>
                  <input
                    ref={!answers[q.id] ? refs.current[q.id] : undefined}
                    type="radio"
                    name={q.id}
                    value={opt.id}
                    checked={answers[q.id] === opt.id}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                  />{" "}
                  {opt.label}
                </label>
              ))}
            </div>
          )}

          {q.type === "boolean" && (
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <label>
                <input
                  ref={answers[q.id] === null ? refs.current[q.id] : undefined}
                  type="radio"
                  name={q.id}
                  value="true"
                  checked={answers[q.id] === true}
                  onChange={() => handleChange(q.id, true)}
                />{" "}
                Da
              </label>
              <label>
                <input
                  type="radio"
                  name={q.id}
                  value="false"
                  checked={answers[q.id] === false}
                  onChange={() => handleChange(q.id, false)}
                />{" "}
                Ne
              </label>
              <label>
                <input
                  type="radio"
                  name={q.id}
                  value="unknown"
                  checked={answers[q.id] === "unknown"}
                  onChange={() => handleChange(q.id, "unknown")}
                />{" "}
                Ne vem
              </label>
            </div>
          )}

          {errors[q.id] && (
            <div style={{ color: "#d00", fontSize: 14, marginTop: 6 }}>
              {errors[q.id]}
            </div>
          )}
        </div>
      ))}

      <div style={{ marginTop: 16 }}>
        <button onClick={handleSubmit}>
          Oddaj
        </button>
      </div>
    </div>
  );
}

//  UEQ (short) + SUS 
function SusUeqSurvey({ order, onSubmit }) {
  // UEQ 
  const UEQ_ITEMS = [
    { id: "ctrl", left: "se ne da uporabljati", right: "se z lahkoto uporablja" },
    { id: "complex", left: "komplicirano", right: "enostavno" },
    { id: "ineffective", left: "ni učinkovito", right: "učinkovito" },
    { id: "confusing", left: "ustvarja zmedo", right: "pregledno" },
    { id: "boring", left: "dolgočasno", right: "zabavno" },
    { id: "uninteresting", left: "nezanimivo", right: "zanimivo" },
    { id: "old", left: "navadno", right: "inovativno" },
    { id: "outdated", left: "zastarelo", right: "moderno" },
  ];
  const UEQ_SCALE = [1, 2, 3, 4, 5, 6, 7];

  // SUS (1–5 Likert)
  const SUS_ITEMS = [
    { id: "sus1",  text: "Aplikacijo bi uporabljal/a pogosto." },
    { id: "sus2",  text: "Aplikacija je po nepotrebnem zapletena." },
    { id: "sus3",  text: "Aplikacija je enostavna za uporabo." },
    { id: "sus4",  text: "Za uporabo aplikacije bi potreboval/a pomoč tehnične osebe." },
    { id: "sus5",  text: "Funkcije aplikacije so dobro povezane v smiselno celoto." },
    { id: "sus6",  text: "Aplikacija je preveč nekonsistentna." },
    { id: "sus7",  text: "Večina ljudi bi se hitro naučila uporabljati aplikacijo." },
    { id: "sus8",  text: "Aplikacija je zelo zapletena za uporabo." },
    { id: "sus9",  text: "Aplikacijo sem uporabljal/a zelo samozavestno." },
    { id: "sus10", text: "Veliko sem se moral/a naučiti, da sem lahko uporabljal/a aplikacijo." },
  ];
  const SUS_SCALE = [1, 2, 3, 4, 5];

  const [answers, setAnswers] = useState({
    ueq: Object.fromEntries(UEQ_ITEMS.map(i => [i.id, ""])),
    sus: Object.fromEntries(SUS_ITEMS.map(i => [i.id, ""])),
  });
  const [errors, setErrors] = useState({});

  const ueqRefs = useRef(Object.fromEntries(UEQ_ITEMS.map(i => [i.id, React.createRef()])));
  const susRefs = useRef(Object.fromEntries(SUS_ITEMS.map(i => [i.id, React.createRef()])));
  const submittedRef = useRef(false);

  const setUEQ = (id, value) => {
    setAnswers(s => ({ ...s, ueq: { ...s.ueq, [id]: value } }));
    setErrors(prev => ({ ...prev, [`ueq_${id}`]: "" }));
  };
  const setSUS = (id, value) => {
    setAnswers(s => ({ ...s, sus: { ...s.sus, [id]: value } }));
    setErrors(prev => ({ ...prev, [`sus_${id}`]: "" }));
  };

  const validate = (a) => {
    const e = {};
    for (const item of UEQ_ITEMS) if (!a.ueq[item.id]) e[`ueq_${item.id}`] = "Obvezno polje.";
    for (const item of SUS_ITEMS) if (!a.sus[item.id]) e[`sus_${item.id}`] = "Obvezno polje.";
    return e;
  };

  const focusFirstError = (e) => {
    for (const item of UEQ_ITEMS) {
      if (e[`ueq_${item.id}`]) { ueqRefs.current[item.id]?.current?.focus?.(); return; }
    }
    for (const item of SUS_ITEMS) {
      if (e[`sus_${item.id}`]) { susRefs.current[item.id]?.current?.focus?.(); return; }
    }
  };

  const handleSubmit = () => {
    if (submittedRef.current) return;
    const e = validate(answers);
    setErrors(e);
    if (Object.values(e).some(Boolean)) { focusFirstError(e); return; }
    submittedRef.current = true;
    onSubmit(answers);
  };

  const UEQRow = ({ item }) => (
    <div style={{ margin: "14px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ minWidth: 160 }}>{item.left}</span>
        <div role="radiogroup" aria-label={`${item.left} ↔ ${item.right}`} style={{ display: "flex", gap: 10 }}>
          {UEQ_SCALE.map(v => (
            <label key={v}>
              <input
                ref={!answers.ueq[item.id] ? ueqRefs.current[item.id] : undefined}
                type="radio"
                name={`ueq_${item.id}`}
                value={v}
                checked={String(answers.ueq[item.id]) === String(v)}
                onChange={(e) => setUEQ(item.id, e.target.value)}
              />
              {v}
            </label>
          ))}
        </div>
        <span style={{ minWidth: 120 }}>{item.right}</span>
      </div>
      {errors[`ueq_${item.id}`] && <div style={{ color: "#d00", fontSize: 14 }}>{errors[`ueq_${item.id}`]}</div>}
    </div>
  );

  const SUSRow = ({ item }) => (
    <div style={{ margin: "12px 0" }}>
      <div style={{ marginBottom: 6 }}>{item.text}</div>
      <div role="radiogroup" aria-label={item.text} style={{ display: "flex", gap: 10 }}>
        {SUS_SCALE.map(v => (
          <label key={v}>
            <input
              ref={!answers.sus[item.id] ? susRefs.current[item.id] : undefined}
              type="radio"
              name={item.id}
              value={v}
              checked={String(answers.sus[item.id]) === String(v)}
              onChange={(e) => setSUS(item.id, e.target.value)}
            />
            {v}
          </label>
        ))}
      </div>
      {errors[`sus_${item.id}`] && <div style={{ color: "#d00", fontSize: 14 }}>{errors[`sus_${item.id}`]}</div>}
    </div>
  );

  return (
    <div style={{ maxWidth: 860, margin: "40px auto", padding: 20 }}>
      <h2>UEQ + SUS vprašalnika</h2>

      <h3>1. Del: UEQ (vprašalnik o uporabniški izkušnji)</h3>
      <p>
        V vsaki vrstici sta lastnosti z nasprotnim pomenom. Označi krog, ki najbolj ustreza tvojemu vtisu o aplikaciji.
        Ni pravilnih ali napačnih odgovorov.
      </p>
      {UEQ_ITEMS.map(item => <UEQRow key={item.id} item={item} />)}

      <h3>2. Del: SUS (vprašalnik o uporabnosti sistema)</h3>
      <p>Označi odgovor na lestvici 1–5 (1 = močno se ne strinjam, 5 = močno se strinjam).</p>
      {SUS_ITEMS.map(item => <SUSRow key={item.id} item={item} />)}

      <div style={{ marginTop: 16 }}>
        <button onClick={handleSubmit}>Oddaj</button>
      </div>
    </div>
  );
}

//  Comparison survey 
function ComparisonSurvey({ order, onSubmit, videoPosters = [], imagePosters = [] }) {
  const [answers, setAnswers] = useState({
    preference_overall: "",       // images | videos | equal | none
    images_quality: "",           // 1..5
    videos_quality: "",           // 1..5
    would_recommend: "",          // images | videos | equal | none
    content_known: "",            // yes | no | partial
    favorite_video: "",           // optional (id)
    favorite_image: "",           // optional (id)
    comments: "",                 // open ended (optional)
    sex: "",                      // male | female | other
    age: "",                      // <10 | 10-12 | 13-15 | >15  
  });

  const refs = {
    preference_overall: useRef(null),
    images_quality: useRef(null),
    videos_quality: useRef(null),
    would_recommend: useRef(null),
    content_known: useRef(null),
    sex: useRef(null),
    age: useRef(null)
  };

  const [errors, setErrors] = useState({});
  const submittedRef = useRef(false);

  const setField = (k, v) => setAnswers(s => ({ ...s, [k]: v }));

  const validate = (a) => {
    const e = {};
    if (!a.preference_overall) e.preference_overall = "Obvezno polje.";
    if (!a.images_quality) e.images_quality = "Obvezno polje.";
    if (!a.videos_quality) e.videos_quality = "Obvezno polje.";
    if (!a.would_recommend) e.would_recommend = "Obvezno polje.";
    if (!a.content_known) e.content_known = "Obvezno polje.";
    if (!a.sex) e.sex = "Obvezno polje.";
    if (!a.age) e.age = "Obvezno polje."
    return e;
  };

  const focusFirstError = (e) => {
    if (e.preference_overall && refs.preference_overall.current) refs.preference_overall.current.focus();
    else if (e.images_quality && refs.images_quality.current) refs.images_quality.current.focus();
    else if (e.videos_quality && refs.videos_quality.current) refs.videos_quality.current.focus();
    else if (e.would_recommend && refs.would_recommend.current) refs.would_recommend.current.focus();
    else if (e.content_known && refs.content_known.current) refs.content_known.current.focus();
    else if (e.sex && refs.sex.current) refs.sex.current.focus();
    else if (e.age && refs.age.current) refs.age.current.focus();
  };

  const handleSubmit = () => {
    if (submittedRef.current) return;
    const e = validate(answers);
    setErrors(e);
    if (Object.values(e).some(Boolean)) { focusFirstError(e); return; }
    submittedRef.current = true;
    onSubmit(answers);
  };

  const LikertRow = ({ id, label }) => (
    <div style={{ margin: "10px 0" }}>
      <div style={{ marginBottom: 6 }}>{label}</div>
      <div ref={refs[id]} style={{ display: "flex", gap: 10 }}>
        {[1,2,3,4,5].map(v => (
          <label key={v}>
            <input
              type="radio"
              name={id}
              value={v}
              checked={String(answers[id]) === String(v)}
              onChange={(e)=>setField(id, e.target.value)}
            /> {v}
          </label>
        ))}
      </div>
      {errors[id] && <div style={{ color: "#d00", fontSize: 14 }}>{errors[id]}</div>}
    </div>
  );

  const ChoiceRow = ({ id, label, options }) => (
    <div style={{ margin: "10px 0" }}>
      <div style={{ marginBottom: 6 }}>{label}</div>
      <div ref={refs[id]} style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {options.map(o => (
          <label key={o.value}>
            <input
              type="radio"
              name={id}
              value={o.value}
              checked={answers[id] === o.value}
              onChange={(e)=>setField(id, e.target.value)}
            /> {o.label}
          </label>
        ))}
      </div>
      {errors[id] && <div style={{ color: "#d00", fontSize: 14 }}>{errors[id]}</div>}
    </div>
  );

  const PosterPicker = ({ title, items, value, onChange, nonelabel }) => {
    if (!items?.length) return null;
    return (
      <div style={{ margin: "12px 0" }}>
        <div style={{ marginBottom: 8 }}>{title} <span style={{ opacity:.7 }}>(neobvezno)</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
          {items.map(it => (
            <label key={it.id} style={{ display: "block", border: value===it.id ? "2px solid #13294f" : "1px solid #ccc", borderRadius: 8, padding: 8, cursor: "pointer" }}>
              <input
                type="radio"
                name={title}
                value={it.id}
                checked={value === it.id}
                onChange={() => onChange(it.id)}
                style={{ display: "none" }}
              />
              <div style={{ width: "100%", aspectRatio: "16 / 9", overflow: "hidden", borderRadius: 6, background: "#eee" }}>
                <img src={it.src} alt={it.label ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              {it.label && <div style={{ marginTop: 6, fontSize: 13 }}>{it.label}</div>}
            </label>
          ))}

       <label
          key="none"
          style={{
            display: "flex",
            fontSize: 13,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: value === "none" ? "2px solid #13294f" : "1px solid #ccc",
            borderRadius: 8,
            padding: 8,
            cursor: "pointer",
            minHeight: 120
          }}
        >
          <input
            type="radio"
            name={title}
            value="none"
            checked={value === "none"}
            onChange={() => onChange("none")}
            style={{ display: "none" }}
          />
          {nonelabel}
        </label>
      </div>
    </div>
  );
};

  return (
    <div style={{ maxWidth: 820, margin: "40px auto", padding: 20 }}>
      <h2>Primerjava</h2>
      <p>
        Vrstni red v tem poskusu: <b>{order === "A-B" ? "A (s slikami) nato B (z AI videi)" : "B (z AI videi) nato A (s slikami)"}</b>.
      </p>

      <ChoiceRow
        id="preference_overall"
        label="1) Kateri vmesnik ti je bil bolj všeč/zanimiv/ljubši?"
        options={[
          { value: "images", label: "S slikami" },
          { value: "videos", label: "Z videi" },
          { value: "equal",  label: "Oboja enako" },
          { value: "none",   label: "Noben od njiju (raje brez slik/videov)" },
        ]}
      />

      <LikertRow id="images_quality" label="2) Vmesnik s slikami — Kako bi ocenil(a) kakovost slik? (1 = slabe, 5 = dobre)" />
      <LikertRow id="videos_quality" label="3) Vmesnik z videi — Kako bi ocenil(a) kakovost videov? (1 = slabi, 5 = dobri)" />

      <ChoiceRow
        id="would_recommend"
        label="4) Kateri vmesnik bi priporočil(a) sošolcu?"
        options={[
          { value: "images", label: "S slikami" },
          { value: "videos", label: "Z videi" },
          { value: "equal",  label: "Oboja enako" },
          { value: "none",   label: "Nobenega od njiju (raje brez slik/videov)" },
        ]}
      />

      <PosterPicker
        title="5) Kateri video ti je bil najbolj zanimiv"
        items={videoPosters}
        value={answers.favorite_video}
        onChange={(id)=>setField("favorite_video", id)}
        nonelabel="Noben"
      />

      <PosterPicker
        title="6) Katera slika ti je bila najbolj zanimiva"
        items={imagePosters}
        value={answers.favorite_image}
        onChange={(id)=>setField("favorite_image", id)}
        nonelabel="Nobena"
      />

      
      <ChoiceRow
        id="content_known"
        label="7) Ali ti je bila vsebina že znana?"
        options={[
          { value: "yes", label: "Da" },
          { value: "no", label: "Ne" },
          { value: "partial", label: "Delno" },
        ]}
      />

      <div style={{ margin: "12px 0" }}>
        <div style={{ marginBottom: 8 }}>
          8) Bi še kaj povedal/a? Ti je bilo kaj res všeč, ti kaj ni bilo dobro, si našel/la kakšne napake?
          <span style={{ opacity:.7 }}> (neobvezno)</span>
        </div>
        <textarea
          value={answers.comments}
          onChange={(e)=>setField("comments", e.target.value)}
          rows={4}
          style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          placeholder="Tvoje povratne informacije..."
        />
      </div>

      <ChoiceRow
        id="sex"
        label="9) Spol?"
        options={[
          { value: "M", label: "Moški" },
          { value: "F", label: "Ženski" },
          { value: "X", label: "Drugo" },
        ]}
      />

      <ChoiceRow
        id="age"
        label="10) Starost?"
        options={[
          { value: "<10", label: "<10" },
          { value: "10-12", label: "10-12" },
          { value: "13-15", label: "13-15" },
          { value: ">15", label: ">15" }
        ]}
      />

      <div style={{ marginTop: 16 }}>
        <button onClick={handleSubmit}>Oddaj</button>
      </div>
    </div>
  );
}

function useSectionTimer({ enabled, project, index, pushEvent }) {
  const tokenRef = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    const viewId = `${project}-${index}-${(crypto.randomUUID?.() ?? Math.random()).toString()}`;
    const start = performance.now();
    tokenRef.current = { viewId, start };
    pushEvent({ type: "section_view", project, index, viewId, startedAt: nowISO() });
    return () => {
      const t = tokenRef.current;
      if (!t || t.viewId !== viewId) return;
      const durationMs = performance.now() - t.start;
      pushEvent({ type: "section_view", project, index, viewId, endedAt: nowISO(), durationMs });
      tokenRef.current = null;
    };
  }, [enabled, project, index, pushEvent]);
}



  function createRunId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `r_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

  //RUN ID !! dont create new run id if user is navigating back/forward

  function getInitialRunId() {
  // Detect how we arrived on this page
  let navType = "navigate";
  if (typeof performance !== "undefined" && performance.getEntriesByType) {
    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries && navEntries[0]) {
      // 'navigate' | 'reload' | 'back_forward' | 'prerender' browser values
      navType = navEntries[0].type;
    }
  }

  const prevState = (typeof history !== "undefined" && history.state) || {};

  // CASE 1: user is coming back/forward in history → keep old runId
  if (navType === "back_forward" && prevState.runId) {
    return prevState.runId;
  }

  // CASE 2: first visit OR reload OR new tab → new runId
  const newId = createRunId();

  // store it in history.state for potential back/forward later
  if (typeof history !== "undefined" && history.replaceState) {
    history.replaceState(
      { ...prevState, runId: newId },
      document.title
    );
  }

  return newId;
}


// MAIN
export default function CombinedTimeline({ userId }) {
  const sessionId = useMemo(() => getOrCreateSessionId(userId), [userId]);

  //run id !!
  const runId = useMemo(() => getInitialRunId(), []);

  //base order on run id
  //const order = useMemo(() => getOrderFromRunId(runId), [runId]);

  const [order, setOrder] = useState(null);

  const [analytics, setAnalytics] = useState(null);

  // decide order from Supabase once we have runId
useEffect(() => {
  let cancelled = false;
  (async () => {
    const decided = await decideOrderFromSupabase(runId);
    if (!cancelled) {
      setOrder(decided);
    }
  })();
  return () => { cancelled = true; };
}, [runId]);

  /* old analytics state, not based on order
  const [analytics, setAnalytics] = useState(() => ({
    runId,
    sessionId,
    project_order: order,
    startedAt: nowISO(),
    events: [],
    surveys: { knowledge: null, comparison: null, sus_ueq: null },
  })); */

  // initialize analytics when order is set
  useEffect(() => {
  if (!order) return;
  setAnalytics({
    runId,
    sessionId,
    project_order: order,
    startedAt: nowISO(),
    events: [],
    surveys: { knowledge: null, comparison: null, sus_ueq: null },
  });
}, [order, runId, sessionId]);


  const seenEventKeysRef = useRef(new Set());
  const pushEvent = useCallback((evt) => {
    const { ts, ...rest } = evt;
    const key = JSON.stringify(rest);
    if (seenEventKeysRef.current.has(key)) return;
    seenEventKeysRef.current.add(key);

     setAnalytics((s) => {
    if (!s) return s; // analytics not initialized yet, ignore
    return { ...s, events: [...s.events, evt] };
  });
}, []);

 // Save analytics to Supabase, but only after user interaction
useEffect(() => {
  if (!analytics) return;

  // Prevent saving analytics from preload / prerender / no interaction yet
  if (!analytics.events || analytics.events.length === 0) return;

  saveAnalytics(runId, analytics).catch(console.error);
}, [runId, analytics]);


  // Uvod → A/B → (>=11) → knowledge → vmes(→ SUS/UEQ) → SUS/UEQ → vmes(→ next project) → second A/B → (>=11) → comparison → done
  const [phase, setPhase] = useState(() => ({ kind: "intro" }));

  // indexi
  const [idxA, setIdxA] = useState(0);
  const [idxB, setIdxB] = useState(0);

  const idxARef = useRef(idxA);
  const idxBRef = useRef(idxB);
  //const savedToSupabaseRef = useRef(false);

  useEffect(() => { idxARef.current = idxA; }, [idxA]);
  useEffect(() => { idxBRef.current = idxB; }, [idxB]);

  // timers
  useSectionTimer({
    enabled: phase.kind === "project" && phase.project === "A",
    project: "A",
    index: idxA,
    pushEvent,
  });

  useSectionTimer({
    enabled: phase.kind === "project" && phase.project === "B",
    project: "B",
    index: idxB,
    pushEvent,
  });

  const logNav = useCallback(
    (project, action, from, to) =>
      pushEvent({ type: "nav_click", project, action, from, to, ts: nowISO() }),
    [pushEvent]
  );

  // order selection

  
  const startFirstProject = useCallback(() => {
    const first = order === "A-B" ? "A" : "B";
    setPhase({ kind: "project", project: first });
    pushEvent({ type: "intro_start", firstProject: first, ts: nowISO() });
  }, [order, pushEvent]);

  // switch to survey when n >= 11
  const makeSetIndex = useCallback(
    (project) => (n) => {
      const from = project === "A" ? idxARef.current : idxBRef.current;
      if (n >= 11) {
        logNav(project, "end", from);
        const firstWas = order === "A-B" ? "A" : "B";
        if (project === firstWas) {
          const nextProject = order === "A-B" ? "B" : "A";
          setPhase({ kind: "survey", which: "knowledge", nextProject }); // carry nextProject to SUS/UEQ
        } else {
          setPhase({ kind: "survey", which: "comparison" });
        }
        if (project === "A") setIdxA(0); else setIdxB(0);
        return;
      }
      if (n === from) return;
      if (project === "A") setIdxA(n); else setIdxB(n);
      logNav(project, "jump", from, n);
    },
    [logNav, order]
  );

  // go/back/next
  const goBackA = useCallback(() => {
    const from = idxARef.current;
    const to = Math.max(0, from - 1);
    if (to === from) return;
    setIdxA(to);
    logNav("A", "goBack", from, to);
  }, [logNav]);

  const goNextA = useCallback(() => {
    const from = idxARef.current;
    const to = Math.min(10, from + 1);
    if (to === from) return;
    setIdxA(to);
    logNav("A", "goNext", from, to);
  }, [logNav]);

  const goBackB = useCallback(() => {
    const from = idxBRef.current;
    const to = Math.max(0, from - 1);
    if (to === from) return;
    setIdxB(to);
    logNav("B", "goBack", from, to);
  }, [logNav]);

  const goNextB = useCallback(() => {
    const from = idxBRef.current;
    const to = Math.min(10, from + 1);
    if (to === from) return;
    setIdxB(to);
    logNav("B", "goNext", from, to);
  }, [logNav]);

  // survey submit handlers
  const handleKnowledgeSubmit = useCallback(
    (payload) => {
      setAnalytics((s) => ({
        ...s,
        surveys: { ...s.surveys, knowledge: { payload, ts: nowISO() } },
      }));
      pushEvent({ type: "survey_submit", which: "knowledge", score: payload.score, total: payload.total, ts: nowISO() });

      const nextProject = (phase.kind === "survey" && phase.nextProject) || (order === "A-B" ? "B" : "A");

      setPhase({
        kind: "notice",
        title: "Oddano!",
        message: "Hvala za izpolnjen vprašalnik o znanju. Zdaj boš prešel/prešla na drugi vprašalnik glede te predstavitve.",
        cta: "Naprej",
        next: { kind: "survey", which: "sus_ueq", project: nextProject },
      });
    },
    [order, phase.kind, phase.nextProject, pushEvent]
  );

  const handleSusUeqSubmit = useCallback(
    (payload) => {
      setAnalytics((s) => ({
        ...s,
        surveys: { ...s.surveys, sus_ueq: { payload, ts: nowISO() } },
      }));
      pushEvent({ type: "survey_submit", which: "sus_ueq", ts: nowISO() });

      const nextProject = phase.project; // vhod v SUS/UEQ

      const message =
      nextProject === "B"
        ? "Hvala za izpolnjena vprašalnika. Zdaj boš nadaljeval/a z enako predstavitvijo, le da bodo namesto slik uporabljeni videi."
        : "Hvala za izpolnjena vprašalnika. Zdaj boš nadaljeval/a z enako predstavitvijo, le da bodo namesto videov uporabljene slike.";

      setPhase({
        kind: "notice",
        title: "Hvala!",
        message,
        cta: "Nadaljuj",
        next: { kind: "project", project: nextProject },
      });
    },
    [pushEvent, phase.project]
  );

  const handleComparisonSubmit = useCallback(
    (payload) => {
      setAnalytics((s) => ({
        ...s,
        surveys: { ...s.surveys, comparison: { payload, ts: nowISO() } },
      }));
      pushEvent({ type: "survey_submit", which: "comparison", ts: nowISO() });
      setPhase({ kind: "done" });
    },
    [pushEvent]
  );

  /*
  useEffect(() => {
  if (phase.kind === "done" && !savedToSupabaseRef.current) {
    savedToSupabaseRef.current = true;

    saveAnalytics(analytics).catch((err) => {
      console.error("Unexpected error while saving analytics:", err);
    });
  }
}, [phase.kind, analytics]);
*/

// while we are deciding order / initializing analytics - show waiting screen !!!
if (!order || !analytics) {
  return (
    <div className="timeline-container" style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
      <div style={{ maxWidth: 720, padding: 24, textAlign: "center" }}>
        <h1 style={{ marginTop: 0 }}>Pripravljamo predstavitev...</h1>
        <p>Prosim počakaj trenutek.</p>
      </div>
    </div>
  );
}


  // router

  if (phase.kind === "intro") {
    return (
      <div className="timeline-container" style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
        <div style={{ maxWidth: 720, padding: 24, textAlign: "center" }}>
          <h1 style={{ marginTop: 0 }}>Pozdravljen/a!</h1>
          <p style={{ fontSize: "1.5rem" }}>
            Sodeluješ v raziskavi, kjer preizkušamo, kako učinkoviti sta dve orodji za učenje iste vsebine z različnim pristopom. Raziskava je anonimna, ne bomo zbirali nobenih osebnih podatkov, razen tvojih odgovorov in časa, ki jih porabiš za vsak del predstavitve.
            <br />S klikom na <strong>Začni</strong> se strinjaš, da se lahko podatki, zbrani med testom, uporabijo v raziskavi.
            <br />Pripravljen/a?
          </p>
          <button onClick={startFirstProject} style={{ marginTop: 16, fontSize: "1.2rem", padding: "8px 16px" }}>
            Začni
          </button>
        </div>
      </div>
    );
  }

  if (phase.kind === "project" && phase.project === "A") {
    return (
      <div className="projectA">
        <SectionsA
          project="A"
          currentIndex={idxA}
          goBack={goBackA}
          goNext={goNextA}
          setCurrentIndex={makeSetIndex("A")}
          pushEvent={pushEvent}
        />
      </div>
    );
  }

  if (phase.kind === "project" && phase.project === "B") {
    return (
      <div className="projectB">
        <SectionsB
          project="B"
          currentIndex={idxB}
          goBack={goBackB}
          goNext={goNextB}
          setCurrentIndex={makeSetIndex("B")}
          pushEvent={pushEvent}
        />
      </div>
    );
  }

  if (phase.kind === "survey" && phase.which === "knowledge") {
    return (
      <div className="timeline-container">
        <KnowledgeSurvey onSubmit={handleKnowledgeSubmit} />
      </div>
    );
  }

  // vmes
  if (phase.kind === "notice") {
    return (
      <div className="timeline-container" style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
        <div style={{ maxWidth: 720, padding: 24, textAlign: "center" }}>
          <h1 style={{ marginTop: 0 }}>{phase.title}</h1>
          <p style={{ fontSize: "1.5rem" }}>{phase.message}</p>
          <button onClick={() => setPhase(phase.next)} style={{ marginTop: 16, fontSize: "1.2rem", padding: "8px 16px" }}>
            {phase.cta}
          </button>
        </div>
      </div>
    );
  }

  if (phase.kind === "survey" && phase.which === "sus_ueq") {
    return (
      <div className="timeline-container">
        <SusUeqSurvey order={order} onSubmit={handleSusUeqSubmit} />
      </div>
    );
  }

  if (phase.kind === "survey" && phase.which === "comparison") {
    const videoPosters = [
      { id: "sunBirthVid",          src: AI_SECTIONS[1].image, label: "AI video: Nastanek Sonca" },
      { id: "planetBirthVid",       src: AI_SECTIONS[2].image, label: "AI video: Nastanek planetov" },
      { id: "moonCreationVid",      src: AI_SECTIONS[3].image, label: "AI video: Nastanek Lune" },
      { id: "bombardmentVid",       src: AI_SECTIONS[4].image, label: "AI video: Pozno težko bombardiranje" },
      { id: "stableSolarSystemVid", src: AI_SECTIONS[5].image, label: "AI video: Stabilno Osončje" },
      { id: "redGiantVid",          src: AI_SECTIONS[6].image, label: "AI video: Rdeča orjakinja" },
      { id: "planetaryNebulaVid",   src: AI_SECTIONS[7].image, label: "AI video: Planetarna meglica" },
      { id: "whiteDwarfVid",        src: AI_SECTIONS[8].image, label: "AI video: Bela pritlikavka" },
      { id: "planetDeathVid",       src: AI_SECTIONS[9].image, label: "AI video: Konec svetlosti Osončja" },
    ];

    const imagePosters = [
      { id: "img_sun",        src: AI_SECTIONS[1].image, label: "Slika: Nastanek Sonca" },
      { id: "img_planets",    src: AI_SECTIONS[2].image, label: "Slika: Nastanek planetov" },
      { id: "img_moon",       src: AI_SECTIONS[3].image, label: "Slika: Nastanek Lune" },
      { id: "img_lhb",        src: AI_SECTIONS[4].image, label: "Slika: Pozno težko bombardiranje" },
      { id: "img_stable",     src: AI_SECTIONS[5].image, label: "Slika: Stabilno Osončje" },
      { id: "img_red_giant",  src: AI_SECTIONS[6].image, label: "Slika: Rdeča orjakinja" },
      { id: "img_nebula",     src: AI_SECTIONS[7].image, label: "Slika: Planetarna meglica" },
      { id: "img_white_dw",   src: AI_SECTIONS[8].image, label: "Slika: Bela pritlikavka" },
      { id: "img_end",        src: AI_SECTIONS[9].image, label: "Slika: Konec svetlosti Osončja" },
    ];

    return (
      <div className="timeline-container">
        <ComparisonSurvey
          order={order}
          onSubmit={handleComparisonSubmit}
          videoPosters={videoPosters}
          imagePosters={imagePosters}
        />
      </div>
    );
  }

  if (phase.kind === "done") {
    return (
      <div className="timeline-container">
        <div className="timeline-end" style={{ background: "#13294f", color: "white", padding: 40, textAlign: "center" }}>
          <h1>Hvala! Poskus je zaključen.</h1>
          <p style={{ fontSize: "1.5rem", opacity: .9, marginTop: 8 }}>Podatki poskusa so shranjeni v bazo.</p>
        </div>
      </div>
    );
  }

  return null;
}
