/* ==========================================================================
   DLU Classroom Request Master - Application Controller
   ========================================================================== */

(function () {
  "use strict";

  const DATA = window.DLU_DATA;
  const STORAGE_KEY = "dlu_request_master_v1";

  // ------------------------------------------------------------------------
  // 1. State Manager (LocalStorage Persistence)
  // ------------------------------------------------------------------------
  const defaultState = {
    theme: "dark",
    xrayBlue: true,
    xp: 0,
    streak: 0,
    gamesWon: 0,
    solvedExercises: {}, // id -> true
    srsRatings: {}       // vocabId -> "easy" | "medium" | "hard"
  };

  let state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultState };
      const parsed = JSON.parse(raw);
      return {
        ...defaultState,
        ...parsed,
        solvedExercises: parsed.solvedExercises || {},
        srsRatings: parsed.srsRatings || {}
      };
    } catch {
      return { ...defaultState };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
    updateGlobalStatsUI();
  }

  function addXP(amount, isSuccess = true) {
    if (isSuccess) {
      state.xp += amount;
      state.streak += 1;
    } else {
      state.streak = 0;
    }
    saveState();
  }

  function markExerciseSolved(id, xpReward = 15) {
    if (!state.solvedExercises[id]) {
      state.solvedExercises[id] = true;
      addXP(xpReward, true);
    } else {
      addXP(5, true);
    }
  }

  // ------------------------------------------------------------------------
  // 2. Audio Engine (Web Speech API - Oxford UK Preferred)
  // ------------------------------------------------------------------------
  const AudioEngine = {
    getVoice() {
      if (!("speechSynthesis" in window)) return null;
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return null;
      return (
        voices.find((v) => v.lang === "en-GB" && /google|libby|hazel|daniel|serena/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith("en-GB")) ||
        voices.find((v) => v.lang.startsWith("en-")) ||
        voices[0]
      );
    },
    speak(text, rateOverride = null) {
      if (!("speechSynthesis" in window)) {
        alert("Trình duyệt hiện tại không hỗ trợ Web Speech API.");
        return;
      }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      const voice = this.getVoice();
      if (voice) utter.voice = voice;
      utter.lang = "en-GB";
      const speedSelect = document.getElementById("voice-speed");
      const rate = rateOverride || (speedSelect ? parseFloat(speedSelect.value) : 1);
      utter.rate = rate;
      utter.pitch = 1;
      window.speechSynthesis.speak(utter);
    }
  };

  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => AudioEngine.getVoice();
  }

  // ------------------------------------------------------------------------
  // 3. Utilities & Highlighting
  // ------------------------------------------------------------------------
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function highlightBlueGlue(sentence, blueParts = []) {
    if (!blueParts || !blueParts.length) return escapeHTML(sentence);
    let safe = escapeHTML(sentence);
    // Sort longer phrases first so multi-word phrases wrap cleanly
    const sorted = [...new Set(blueParts)].sort((a, b) => b.length - a.length);
    const placeholders = [];
    sorted.forEach((part) => {
      const escapedPart = escapeHTML(part);
      const regex = new RegExp(`(^|\\b|[\\s.,?!])(${escapeRegex(escapedPart)})(?=\\b|[\\s.,?!]|$)`, "gi");
      safe = safe.replace(regex, (_, prefix, match) => {
        const idx = placeholders.length;
        placeholders.push(`<span class="glue-word">${match}</span>`);
        return `${prefix}__PH_${idx}__`;
      });
    });
    placeholders.forEach((html, idx) => {
      safe = safe.replace(`__PH_${idx}__`, html);
    });
    return safe;
  }

  function normalizeText(str) {
    return String(str || "")
      .replace(/[’‘`]/g, "'")
      .replace(/don't/gi, "do not")
      .replace(/i'd/gi, "i would")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function stripPunctuation(str) {
    return normalizeText(str).replace(/[.?!,;:"()]/g, "").trim();
  }

  function levelBadgeClass(level) {
    if (level === "A1") return "badge-a1";
    if (level === "A2") return "badge-a2";
    if (level === "B1") return "badge-b1";
    if (level === "B1+") return "badge-b1plus";
    return "badge-b2";
  }

  // Smart 3-Criteria Evaluator (Grammar, Clarity, Appropriateness)
  function evaluateRequest(userInput, item) {
    const raw = (userInput || "").trim();
    if (!raw) {
      return {
        isCorrect: false,
        score: 0,
        grammar: "Chưa nhập câu.",
        clarity: "Thiếu nội dung.",
        appropriateness: "Chưa xác định.",
        diffHtml: ""
      };
    }

    const acceptedList = item.acceptedAnswers && item.acceptedAnswers.length
      ? item.acceptedAnswers
      : [item.answer];

    const normUser = normalizeText(raw);
    const strippedUser = stripPunctuation(raw);

    let exactMatch = acceptedList.some((ans) => normalizeText(ans) === normUser);
    let punctuationWarning = false;
    if (!exactMatch && acceptedList.some((ans) => stripPunctuation(ans) === strippedUser)) {
      exactMatch = true;
      punctuationWarning = true;
    }

    // Check 3 criteria
    const requiresQuestion = Boolean(item.isQuestion || (item.prompt && item.prompt.includes("?")));
    const startsPoliteQ = /^(could|would|can|will|do)\s+you/i.test(raw);
    const hasPleaseOrMind = /\b(please|would you mind|do you mind|appreciate)\b/i.test(raw);
    const hasEndQuestionMark = raw.endsWith("?");

    let grammarOk = true;
    let grammarNote = "Đúng cấu trúc động từ & từ hạn định.";
    if (/\bplease\s+to\b/i.test(raw)) {
      grammarOk = false;
      grammarNote = "Lỗi: Sau 'Please' dùng V(nguyên mẫu), không dùng 'to V'.";
    } else if (/\bwould\s+you\s+mind\s+to\b/i.test(raw)) {
      grammarOk = false;
      grammarNote = "Lỗi: Sau 'Would you mind' phải dùng V-ing.";
    } else if (/\bcould\s+you\s+(?:please\s+)?\w+ing\b/i.test(raw)) {
      grammarOk = false;
      grammarNote = "Lỗi: Sau 'Could you' phải dùng V(nguyên mẫu).";
    }

    let appOk = true;
    let appNote = "Phù hợp giọng điệu giáo viên tại lớp học.";
    if (requiresQuestion && !startsPoliteQ) {
      appOk = false;
      appNote = "Đề bài có dấu '?' → bắt buộc dùng câu nghi vấn lịch sự (Could you / Would you...).";
    } else if (requiresQuestion && !hasEndQuestionMark) {
      punctuationWarning = true;
      appNote = "Thiếu dấu hỏi chấm (?) ở cuối câu nghi vấn.";
    } else if (!hasPleaseOrMind) {
      appNote = "Gợi ý: Thêm 'please' hoặc cấu trúc lịch sự để đạt điểm Appropriateness tối đa.";
    }

    // Token diff against canonical answer
    const targetWords = item.answer.split(/\s+/);
    const userWordsSet = new Set(strippedUser.split(/\s+/));
    const diffHtml = targetWords
      .map((w) => {
        const cleanW = stripPunctuation(w);
        if (userWordsSet.has(cleanW)) {
          return `<span style="color: var(--accent-emerald); font-weight: 700;">${escapeHTML(w)}</span>`;
        }
        return `<span class="glue-word" title="Từ còn thiếu/khác">${escapeHTML(w)}</span>`;
      })
      .join(" ");

    const clarityOk = exactMatch || targetWords.filter((w) => userWordsSet.has(stripPunctuation(w))).length >= targetWords.length - 1;

    return {
      isCorrect: exactMatch && grammarOk && appOk,
      punctuationWarning,
      grammar: grammarNote,
      clarity: exactMatch
        ? "Đầy đủ ý nghĩa & các mảnh ghép xanh dương."
        : "Còn thiếu hoặc lệch một số từ nối/mạo từ/giới từ (xem chữ tô xanh).",
      appropriateness: appNote,
      diffHtml
    };
  }

  // ------------------------------------------------------------------------
  // 4. Global UI Initialization (Theme, Hero Criteria, Hero Simulator, Stats)
  // ------------------------------------------------------------------------
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.textContent = state.theme === "dark" ? "🌙" : "☀️";
  }

  function applyXrayState() {
    document.body.classList.toggle("xray-off", !state.xrayBlue);
    const btn = document.getElementById("xray-toggle-btn");
    if (btn) {
      btn.textContent = state.xrayBlue
        ? "💙 Đang bật Tô Xanh Dương Mảnh Ghép"
        : "🤍 Đang tắt Tô Xanh Dương (Click để bật)";
    }
  }

  function updateGlobalStatsUI() {
    const totalExercises =
      DATA.exercises.type1.length +
      DATA.exercises.type2.length +
      DATA.exercises.type3.length +
      DATA.exercises.type4.length; // 47
    const solvedCount = Object.keys(state.solvedExercises).length;
    const totalVocab =
      DATA.vocabulary.coreWords.length +
      DATA.vocabulary.phrasalVerbs.length +
      DATA.vocabulary.prepositions.length; // 40

    const ratedVocab = Object.entries(state.srsRatings).filter(([, v]) => v === "easy" || v === "medium").length;
    const hardCount = Object.values(state.srsRatings).filter((v) => v === "hard").length;

    const masteryPct = Math.min(
      100,
      Math.round(((solvedCount + ratedVocab) / (totalExercises + totalVocab)) * 100)
    );

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl("nav-xp", state.xp);
    setEl("nav-streak", state.streak);
    setEl("stat-exercises", `${solvedCount} / ${totalExercises}`);
    setEl("stat-vocab", `${ratedVocab} / ${totalVocab}`);
    setEl("stat-games", state.gamesWon);
    setEl("stat-srs-hard", hardCount);
    setEl("hard-count-badge", hardCount);
    setEl("mastery-percent", `${masteryPct}%`);

    const fill = document.getElementById("mastery-fill");
    if (fill) fill.style.width = `${masteryPct}%`;
  }

  function renderHeroSection() {
    const criteriaWrap = document.getElementById("hero-criteria");
    if (criteriaWrap) {
      criteriaWrap.innerHTML = DATA.examCriteria
        .map(
          (c) => `
          <div class="criteria-mini-card">
            <span class="tag">${c.badge}</span>
            <strong>${c.title}</strong>
            <p>${c.desc}</p>
          </div>`
        )
        .join("");
    }

    // Interactive Quick Formula Preview
    let selectedFormulaIdx = 0;
    let useEndPos = false;
    const pillsWrap = document.getElementById("hero-formula-pills");
    const previewText = document.getElementById("hero-preview-text");

    function updatePreview() {
      const f = DATA.formulas[selectedFormulaIdx];
      const sentence = useEndPos ? f.transformer.endPlease : f.transformer.startPlease;
      previewText.innerHTML = `
        <div style="font-size:0.75rem; color: var(--text-secondary); margin-bottom:4px;">
          Prompt: <span class="mono">${escapeHTML(f.transformer.prompt)}</span>
        </div>
        <div>${highlightBlueGlue(sentence, f.examples[0].glueWords)}</div>`;
    }

    if (pillsWrap) {
      pillsWrap.innerHTML = DATA.formulas
        .map(
          (f, i) =>
            `<button class="tab-btn btn-sm ${i === 0 ? "active" : ""}" data-hero-f="${i}">${
              f.name.split(" (")[0]
            }</button>`
        )
        .join("");
      pillsWrap.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-hero-f]");
        if (!btn) return;
        selectedFormulaIdx = Number(btn.dataset.heroF);
        pillsWrap.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        updatePreview();
      });
    }

    document.getElementById("hero-toggle-pos")?.addEventListener("click", () => {
      useEndPos = !useEndPos;
      updatePreview();
    });

    document.getElementById("hero-speak-btn")?.addEventListener("click", () => {
      const f = DATA.formulas[selectedFormulaIdx];
      AudioEngine.speak(useEndPos ? f.transformer.endPlease : f.transformer.startPlease);
    });

    updatePreview();
  }

  // ------------------------------------------------------------------------
  // 5. Theory Section (Formulas, Blue Rules, 16 Sample Sentences, Q&A)
  // ------------------------------------------------------------------------
  let activeTheoryTab = "formulas";

  function renderTheoryTab() {
    const container = document.getElementById("theory-content");
    if (!container) return;

    if (activeTheoryTab === "formulas") {
      container.innerHTML = `
        <div class="formula-grid">
          ${DATA.formulas
            .map(
              (f) => `
            <article class="formula-card">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                <h3 style="font-size:1.08rem; font-weight:800;">${escapeHTML(f.name)}</h3>
                <span class="badge badge-b1">${escapeHTML(f.level)}</span>
              </div>
              <div class="formula-syntax">${escapeHTML(f.formula)}</div>
              <ul class="formula-please-list">
                ${f.pleaseRule.map((r) => `<li>• ${escapeHTML(r)}</li>`).join("")}
              </ul>
              ${f.examples
                .map(
                  (ex) => `
                <div class="example-pill">
                  <div>
                    <div style="font-weight:700; font-size:0.95rem;">
                      ${highlightBlueGlue(ex.sentence, ex.glueWords)}
                    </div>
                    <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">
                      ${escapeHTML(ex.vi)}
                    </div>
                  </div>
                  <button class="icon-btn speak-btn" data-speak="${escapeHTML(ex.sentence)}" title="Nghe phát âm Oxford UK">🔊</button>
                </div>`
                )
                .join("")}
            </article>`
            )
            .join("")}
        </div>
        <div class="alert-tip">
          <div style="font-size:1.5rem;">💡</div>
          <div>
            <strong>${escapeHTML(DATA.examTip.title)}</strong>
            <p style="font-size:0.92rem; color:var(--text-main);">${escapeHTML(DATA.examTip.content)}</p>
          </div>
        </div>
      `;
    } else if (activeTheoryTab === "blue-rules") {
      container.innerHTML = `
        <h3 style="margin-bottom:14px; font-size:1.15rem;">2.1. Phân nhóm 4 mảnh ghép tô màu xanh dương</h3>
        <div class="grid-2" style="margin-bottom:28px;">
          ${DATA.blueGlueRules
            .map(
              (g) => `
            <div class="card">
              <h4 style="color:var(--accent-cyan); margin-bottom:10px;">${escapeHTML(g.title)}</h4>
              <div class="chip-list">
                ${g.examples.map((ex) => `<span class="glue-word">${escapeHTML(ex)}</span>`).join("")}
              </div>
              <p style="font-size:0.86rem; color:var(--text-secondary); margin-top:8px;">${escapeHTML(g.note)}</p>
            </div>`
            )
            .join("")}
        </div>
        <h3 style="margin-bottom:14px; font-size:1.15rem;">2.2. Quy tắc thêm Mạo từ (a / an / the) và Tính từ sở hữu (your)</h3>
        <div class="grid-3">
          ${DATA.determinerRules
            .map(
              (d) => `
            <div class="card">
              <span class="badge badge-b2" style="font-size:0.9rem; margin-bottom:10px;">${escapeHTML(d.token)}</span>
              <p style="font-size:0.88rem; color:var(--text-secondary); margin-bottom:12px;">${escapeHTML(d.rule)}</p>
              <div class="chip-list">
                ${d.examples.map((ex) => `<span class="glue-word">${escapeHTML(ex)}</span>`).join("")}
              </div>
            </div>`
            )
            .join("")}
        </div>
      `;
    } else if (activeTheoryTab === "samples16") {
      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px;">
          <p style="color:var(--text-secondary); font-size:0.9rem;">
            Toàn bộ <strong>16 ví dụ lớp học</strong> đã tích hợp đầy đủ các mảnh ghép tô xanh dương &amp; sửa 3 lỗi trong bản mẫu.
          </p>
          <button class="btn btn-sm btn-primary" id="play-all-16-btn">🔊 Đọc mẫu Câu 1 → 5</button>
        </div>
        <div class="sample16-grid">
          ${DATA.sample16Sentences
            .map(
              (s) => `
            <div class="sample16-card">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                <div>
                  <div class="sample16-prompt">Câu ${s.num}: ${escapeHTML(s.prompt)}</div>
                  <div style="font-weight:700; font-size:0.98rem; margin-bottom:4px;">
                    ${highlightBlueGlue(s.sentence, s.blueParts)}
                  </div>
                </div>
                <button class="icon-btn speak-btn" data-speak="${escapeHTML(s.sentence)}" title="Nghe">🔊</button>
              </div>
              <div style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:4px;">${escapeHTML(s.vi)}</div>
              <div style="font-size:0.78rem; color:var(--accent-cyan);">💡 ${escapeHTML(s.note)}</div>
            </div>`
            )
            .join("")}
        </div>
      `;
    } else if (activeTheoryTab === "qa-fixes") {
      container.innerHTML = `
        <h3 style="margin-bottom:14px;">Giải đáp 2 câu hỏi chuyên sâu</h3>
        <div class="grid-2" style="margin-bottom:26px;">
          ${DATA.qaAndCorrections.questions
            .map(
              (q) => `
            <div class="card">
              <span class="badge badge-b1" style="margin-bottom:8px;">${escapeHTML(q.tag)}</span>
              <h4 style="margin-bottom:10px; font-size:1rem;">${escapeHTML(q.question)}</h4>
              <p style="font-size:0.88rem; color:var(--text-secondary);">${escapeHTML(q.answer)}</p>
            </div>`
            )
            .join("")}
        </div>
        <h3 style="margin-bottom:14px;">Chỉnh sửa 3 lỗi nhỏ trong 16 câu mẫu</h3>
        <div class="grid-3">
          ${DATA.qaAndCorrections.corrections
            .map(
              (c) => `
            <div class="card">
              <span class="badge badge-b2" style="margin-bottom:8px;">${escapeHTML(c.sentenceNum)}</span>
              <div style="margin-bottom:8px;">
                <span style="text-decoration:line-through; color:var(--accent-rose); font-weight:700;">${escapeHTML(c.wrong)}</span>
                <span style="margin:0 8px;">→</span>
                <span style="color:var(--accent-emerald); font-weight:800;">${escapeHTML(c.right)}</span>
              </div>
              <p style="font-size:0.84rem; color:var(--text-secondary);">${escapeHTML(c.reason)}</p>
            </div>`
            )
            .join("")}
        </div>
      `;
    }
  }

  // ------------------------------------------------------------------------
  // 6. Vocabulary Section (40 items + Search + Oxford UK Audio + Noji SRS)
  // ------------------------------------------------------------------------
  let activeVocabCat = "all";
  let vocabQuery = "";

  function getAllVocabItems() {
    return [
      ...DATA.vocabulary.coreWords.map((v) => ({ ...v, category: "coreWords" })),
      ...DATA.vocabulary.phrasalVerbs.map((v) => ({ ...v, category: "phrasalVerbs" })),
      ...DATA.vocabulary.prepositions.map((v) => ({ ...v, category: "prepositions" }))
    ];
  }

  function renderVocabulary() {
    const grid = document.getElementById("vocab-grid");
    if (!grid) return;

    let items = getAllVocabItems();
    if (activeVocabCat === "hardOnly") {
      items = items.filter((it) => state.srsRatings[it.id] === "hard");
    } else if (activeVocabCat !== "all") {
      items = items.filter((it) => it.category === activeVocabCat);
    }

    if (vocabQuery.trim()) {
      const q = vocabQuery.trim().toLowerCase();
      items = items.filter(
        (it) =>
          it.term.toLowerCase().includes(q) ||
          it.meaning.toLowerCase().includes(q) ||
          it.ipa.toLowerCase().includes(q) ||
          it.example.toLowerCase().includes(q)
      );
    }

    if (!items.length) {
      grid.innerHTML = `<div class="card" style="grid-column:1/-1; text-align:center;">
        Không có mục nào khớp với bộ lọc hiện tại. Hãy thử chọn mục "Tất cả (40)" hoặc xóa từ khóa tìm kiếm.
      </div>`;
      return;
    }

    grid.innerHTML = items
      .map((item) => {
        const rating = state.srsRatings[item.id] || "";
        return `
        <article class="vocab-card">
          <div>
            <div class="vocab-head">
              <div>
                <span class="vocab-term">${escapeHTML(item.term)}</span>
                <span class="vocab-pos">${escapeHTML(item.pos)}</span>
                <span class="vocab-ipa">${escapeHTML(item.ipa)}</span>
              </div>
              <button class="icon-btn speak-btn" data-speak="${escapeHTML(item.term.split("/")[0].trim())}" title="Nghe từ">🔊</button>
            </div>
            <div class="vocab-meaning" style="margin:10px 0 8px;">${escapeHTML(item.meaning)}</div>
            <div class="vocab-example">
              <div style="display:flex; justify-content:space-between; gap:8px; align-items:center;">
                <span>${escapeHTML(item.example)}</span>
                <button class="btn btn-sm btn-ghost speak-btn" data-speak="${escapeHTML(item.example)}" style="padding:3px 8px;">🔊</button>
              </div>
            </div>
          </div>
          <div class="srs-bar">
            <span style="font-size:0.72rem; color:var(--text-muted);">Noji SRS:</span>
            <button class="srs-btn easy ${rating === "easy" ? "active" : ""}" data-srs="${item.id}" data-val="easy">Dễ</button>
            <button class="srs-btn medium ${rating === "medium" ? "active" : ""}" data-srs="${item.id}" data-val="medium">TB</button>
            <button class="srs-btn hard ${rating === "hard" ? "active" : ""}" data-srs="${item.id}" data-val="hard">Khó</button>
          </div>
        </article>`;
      })
      .join("");
  }

  // ------------------------------------------------------------------------
  // 7. 6-Game Arena (Combining All 4 English Skills)
  // ------------------------------------------------------------------------
  let activeGame = "g1";
  let gameState = {
    g1Idx: 0,
    g1LevelFilter: "ALL",
    g2Idx: 0,
    g2Chosen: [],
    g2Pool: [],
    g3Idx: 0,
    g3Mode: "gap", // "gap" | "full"
    g4Idx: 0,
    g4Transcript: "",
    g4Listening: false,
    g5Idx: 0,
    g6Mode: "flashcard", // "flashcard" | "match"
    g6Idx: 0,
    g6Flipped: false,
    matchCards: [],
    matchSelected: null,
    matchMatchedCount: 0,
    matchStartTime: 0,
    matchTimerId: null
  };

  function getG1Items() {
    const combined = [
      ...DATA.exercises.type1,
      ...DATA.sample16Sentences.map((s) => ({
        id: `s16-${s.num}`,
        level: s.num <= 5 ? "A2" : s.num <= 12 ? "B1" : "B2",
        prompt: s.prompt,
        answer: s.sentence,
        acceptedAnswers: [s.sentence],
        blueTokens: s.blueParts,
        isQuestion: s.prompt.includes("?"),
        explanation: s.note
      }))
    ];
    if (gameState.g1LevelFilter === "ALL") return combined;
    return combined.filter((i) => i.level === gameState.g1LevelFilter);
  }

  function renderGameStage() {
    const stage = document.getElementById("game-stage");
    if (!stage) return;

    if (gameState.matchTimerId) {
      clearInterval(gameState.matchTimerId);
      gameState.matchTimerId = null;
    }

    if (activeGame === "g1") renderGame1(stage);
    else if (activeGame === "g2") renderGame2(stage);
    else if (activeGame === "g3") renderGame3(stage);
    else if (activeGame === "g4") renderGame4(stage);
    else if (activeGame === "g5") renderGame5(stage);
    else if (activeGame === "g6") renderGame6(stage);
  }

  // GAME 1: WRITING — Linguno Request Builder
  function renderGame1(stage) {
    const pool = getG1Items();
    const idx = gameState.g1Idx % pool.length;
    const item = pool[idx];

    stage.innerHTML = `
      <div class="game-hud">
        <div>
          <span class="badge ${levelBadgeClass(item.level)}">${escapeHTML(item.level)}</span>
          <strong style="margin-left:8px;">Câu ${idx + 1} / ${pool.length}</strong>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          ${["ALL", "A1", "A2", "B1", "B1+", "B2"]
            .map(
              (lv) =>
                `<button class="btn btn-sm ${
                  gameState.g1LevelFilter === lv ? "btn-primary" : "btn-secondary"
                }" data-g1-filter="${lv}">${lv === "ALL" ? "Tất cả (37)" : lv}</button>`
            )
            .join("")}
        </div>
      </div>

      <div class="prompt-display">
        <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:4px;">
          Từ gợi ý của đề thi (Chú ý dấu '?' ở cuối nếu có):
        </div>
        <div class="mono-prompt">${escapeHTML(item.prompt)}</div>
      </div>

      <input
        type="text"
        id="g1-input"
        class="answer-input"
        placeholder="Gõ câu yêu cầu hoàn chỉnh của giáo viên..."
        autocomplete="off"
      />

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:14px;">
        <button id="g1-check-btn" class="btn btn-primary">✅ Kiểm tra 3 tiêu chí</button>
        <button id="g1-hint-btn" class="btn btn-secondary">💡 Gợi ý mảnh ghép xanh</button>
        <button id="g1-speak-ans" class="btn btn-ghost">🔊 Nghe đáp án mẫu</button>
        <button id="g1-next-btn" class="btn btn-secondary" style="margin-left:auto;">Câu tiếp theo ➡️</button>
      </div>

      <div id="g1-feedback"></div>
    `;

    const inputEl = document.getElementById("g1-input");
    const fbEl = document.getElementById("g1-feedback");

    function runCheck() {
      const res = evaluateRequest(inputEl.value, item);
      if (res.isCorrect) {
        markExerciseSolved(item.id, 20);
        state.gamesWon += 1;
        saveState();
        AudioEngine.speak(item.answer);
      } else {
        addXP(0, false);
      }

      fbEl.innerHTML = `
        <div class="feedback-box ${res.isCorrect ? "success" : "warn"}">
          <div style="font-weight:800; margin-bottom:6px;">
            ${res.isCorrect ? "🎉 Xuất sắc! Đạt chuẩn giáo viên sư phạm!" : "🔎 Cần chỉnh sửa một chút (xem phần gạch chân xanh dương):"}
          </div>
          <div style="margin-bottom:8px;">So sánh từng từ: ${res.diffHtml}</div>
          <div style="font-size:0.86rem; color:var(--text-secondary); margin-bottom:8px;">
            Đáp án chuẩn: <strong>${highlightBlueGlue(item.answer, item.blueTokens)}</strong><br/>
            💡 ${escapeHTML(item.explanation)}
          </div>
          <div class="rubric-row">
            <div class="rubric-pill"><strong>Grammar:</strong> ${escapeHTML(res.grammar)}</div>
            <div class="rubric-pill"><strong>Clarity:</strong> ${escapeHTML(res.clarity)}</div>
            <div class="rubric-pill"><strong>Appropriateness:</strong> ${escapeHTML(res.appropriateness)}</div>
          </div>
        </div>
      `;
    }

    document.getElementById("g1-check-btn").onclick = runCheck;
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runCheck();
    });

    document.getElementById("g1-hint-btn").onclick = () => {
      const tokens = item.blueTokens || [];
      fbEl.innerHTML = `
        <div class="feedback-box warn">
          💙 <strong>Mảnh ghép xanh dương cần thêm:</strong>
          <div class="chip-list" style="margin-top:6px;">
            ${tokens.map((t) => `<span class="glue-word">${escapeHTML(t)}</span>`).join("")}
          </div>
          ${item.isQuestion ? "<div style='margin-top:6px;'>⚠️ Đề có dấu <strong>?</strong> → Nhớ dùng <em>Could you / Would you...</em></div>" : ""}
        </div>`;
    };

    document.getElementById("g1-speak-ans").onclick = () => AudioEngine.speak(item.answer);
    document.getElementById("g1-next-btn").onclick = () => {
      gameState.g1Idx = (idx + 1) % pool.length;
      renderGame1(stage);
    };

    stage.querySelectorAll("[data-g1-filter]").forEach((btn) => {
      btn.onclick = () => {
        gameState.g1LevelFilter = btn.dataset.g1Filter;
        gameState.g1Idx = 0;
        renderGame1(stage);
      };
    });
  }

  // GAME 2: READING & SYNTAX — Wordwall Blue-Tile Unjumble
  function setupG2Item() {
    const pool = [...DATA.sample16Sentences, ...DATA.exercises.type1.map((x, idx) => ({
      num: idx + 17,
      prompt: x.prompt,
      sentence: x.answer,
      blueParts: x.blueTokens || [],
      note: x.explanation
    }))];
    const item = pool[gameState.g2Idx % pool.length];
    const words = item.sentence.split(/\s+/);
    const blueJoined = (item.blueParts || []).join(" ").toLowerCase();

    const tiles = words.map((w, i) => {
      const clean = stripPunctuation(w);
      const isGlue = blueJoined.split(/\s+/).includes(clean) || /^(please|a|an|the|your|to|in|on|at|for|with|before|and|if|could|would)$/i.test(clean);
      return { id: `tile-${i}`, word: w, isGlue };
    });

    // Fisher-Yates shuffle
    const shuffled = [...tiles];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    gameState.g2Chosen = [];
    gameState.g2Pool = shuffled;
    return { item, total: pool.length };
  }

  function renderGame2(stage, keepTiles = false) {
    const allPoolLength = DATA.sample16Sentences.length + DATA.exercises.type1.length;
    if (!keepTiles) {
      setupG2Item();
    }
    const combined = [...DATA.sample16Sentences, ...DATA.exercises.type1.map((x, idx) => ({
      num: idx + 17,
      prompt: x.prompt,
      sentence: x.answer,
      blueParts: x.blueTokens || [],
      note: x.explanation
    }))];
    const item = combined[gameState.g2Idx % combined.length];

    stage.innerHTML = `
      <div class="game-hud">
        <div>
          <span class="badge badge-a2">Wordwall Syntax</span>
          <strong style="margin-left:8px;">Câu ${(gameState.g2Idx % allPoolLength) + 1} / ${allPoolLength}</strong>
        </div>
        <div style="font-size:0.84rem; color:var(--text-secondary);">
          Từ màu xanh dương = Mảnh ghép ngữ pháp cần chèn đúng vị trí
        </div>
      </div>

      <div class="prompt-display">
        <div style="font-size:0.8rem; color:var(--text-secondary);">Nghĩa / Gợi ý:</div>
        <div class="mono-prompt">${escapeHTML(item.prompt)}</div>
      </div>

      <div style="font-size:0.82rem; font-weight:700; margin-bottom:6px;">Bấm các thẻ bên dưới để xếp thành câu (bấm thẻ đã chọn để trả lại):</div>
      <div class="tile-zone" id="g2-chosen-zone">
        ${
          gameState.g2Chosen.length
            ? gameState.g2Chosen
                .map(
                  (t, i) =>
                    `<button class="word-tile ${t.isGlue ? "is-glue" : ""}" data-g2-remove="${i}">${escapeHTML(t.word)}</button>`
                )
                .join("")
            : `<span style="color:var(--text-muted); font-size:0.86rem;">Chưa có từ nào được chọn...</span>`
        }
      </div>

      <div class="tile-bank" id="g2-bank-zone">
        ${gameState.g2Pool
          .map(
            (t, i) =>
              `<button class="word-tile ${t.isGlue ? "is-glue" : ""}" data-g2-pick="${i}">${escapeHTML(t.word)}</button>`
          )
          .join("")}
      </div>

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:16px;">
        <button id="g2-check" class="btn btn-primary">✅ Kiểm tra trật tự</button>
        <button id="g2-reset" class="btn btn-secondary">🔄 Xếp lại</button>
        <button id="g2-speak" class="btn btn-ghost">🔊 Nghe câu</button>
        <button id="g2-next" class="btn btn-secondary" style="margin-left:auto;">Câu tiếp ➡️</button>
      </div>
      <div id="g2-feedback"></div>
    `;

    stage.querySelectorAll("[data-g2-pick]").forEach((btn) => {
      btn.onclick = () => {
        const idx = Number(btn.dataset.g2Pick);
        const [picked] = gameState.g2Pool.splice(idx, 1);
        gameState.g2Chosen.push(picked);
        renderGame2(stage, true);
      };
    });

    stage.querySelectorAll("[data-g2-remove]").forEach((btn) => {
      btn.onclick = () => {
        const idx = Number(btn.dataset.g2Remove);
        const [removed] = gameState.g2Chosen.splice(idx, 1);
        gameState.g2Pool.push(removed);
        renderGame2(stage, true);
      };
    });

    document.getElementById("g2-check").onclick = () => {
      const built = gameState.g2Chosen.map((t) => t.word).join(" ");
      const ok = normalizeText(built) === normalizeText(item.sentence);
      const fb = document.getElementById("g2-feedback");
      if (ok) {
        state.gamesWon += 1;
        addXP(20, true);
        AudioEngine.speak(item.sentence);
        fb.innerHTML = `<div class="feedback-box success">🎉 <strong>Chính xác tuyệt đối!</strong> ${escapeHTML(built)}<br/><span style="font-size:0.84rem;">💡 ${escapeHTML(item.note)}</span></div>`;
      } else {
        addXP(0, false);
        fb.innerHTML = `<div class="feedback-box error">❌ Chưa đúng trật tự. Câu chuẩn: <strong>${escapeHTML(item.sentence)}</strong></div>`;
      }
    };

    document.getElementById("g2-reset").onclick = () => renderGame2(stage, false);
    document.getElementById("g2-speak").onclick = () => AudioEngine.speak(item.sentence);
    document.getElementById("g2-next").onclick = () => {
      gameState.g2Idx += 1;
      renderGame2(stage, false);
    };
  }

  // GAME 3: LISTENING — Busuu Classroom Audio Dictation & Catch
  function renderGame3(stage) {
    const allAudioPool = [
      ...DATA.vocabulary.phrasalVerbs.map((v) => ({
        term: v.term.split("/")[0].trim(),
        sentence: v.example,
        meaning: v.meaning,
        ipa: v.ipa
      })),
      ...DATA.sample16Sentences.map((s) => ({
        term: s.blueParts[1] || s.blueParts[0],
        sentence: s.sentence,
        meaning: s.vi,
        ipa: "Classroom Request"
      }))
    ];
    const item = allAudioPool[gameState.g3Idx % allAudioPool.length];
    const maskedSentence = item.sentence.replace(
      new RegExp(escapeRegex(item.term), "i"),
      "________"
    );

    stage.innerHTML = `
      <div class="game-hud">
        <div>
          <span class="badge badge-b1">Listening Skill • Oxford UK</span>
          <strong style="margin-left:8px;">Audio ${(gameState.g3Idx % allAudioPool.length) + 1} / ${allAudioPool.length}</strong>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-sm ${gameState.g3Mode === "gap" ? "btn-primary" : "btn-secondary"}" id="g3-mode-gap">Nghe điền cụm thiếu</button>
          <button class="btn btn-sm ${gameState.g3Mode === "full" ? "btn-primary" : "btn-secondary"}" id="g3-mode-full">Nghe chép cả câu</button>
        </div>
      </div>

      <div style="text-align:center; padding:18px; background:var(--bg-card); border-radius:var(--radius-md); border:1px solid var(--border-subtle); margin-bottom:16px;">
        <p style="font-size:0.86rem; color:var(--text-secondary); margin-bottom:12px;">
          Bấm nút nghe giọng giáo viên Anh-Anh (Oxford UK) và gõ lại phần còn thiếu:
        </p>
        <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
          <button id="g3-play-normal" class="btn btn-primary">🔊 Nghe tốc độ chuẩn (1.0x)</button>
          <button id="g3-play-slow" class="btn btn-secondary">🐢 Nghe chậm (0.75x)</button>
        </div>
        ${
          gameState.g3Mode === "gap"
            ? `<div style="margin-top:16px; font-size:1.1rem; font-weight:700;">${escapeHTML(maskedSentence)}</div>`
            : `<div style="margin-top:16px; font-size:0.9rem; color:var(--accent-cyan);">Chế độ Dictation: Nghe và gõ nguyên vẹn cả câu!</div>`
        }
      </div>

      <input
        type="text"
        id="g3-input"
        class="answer-input"
        placeholder="${gameState.g3Mode === "gap" ? "Nhập cụm từ nghe được vào chỗ trống..." : "Chép lại toàn bộ câu yêu cầu..."}"
      />

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:14px;">
        <button id="g3-check" class="btn btn-primary">✅ Kiểm tra đáp án</button>
        <button id="g3-reveal" class="btn btn-ghost">👁️ Hiện transcript &amp; nghĩa</button>
        <button id="g3-next" class="btn btn-secondary" style="margin-left:auto;">Audio tiếp ➡️</button>
      </div>
      <div id="g3-feedback"></div>
    `;

    document.getElementById("g3-mode-gap").onclick = () => {
      gameState.g3Mode = "gap";
      renderGame3(stage);
    };
    document.getElementById("g3-mode-full").onclick = () => {
      gameState.g3Mode = "full";
      renderGame3(stage);
    };
    document.getElementById("g3-play-normal").onclick = () => AudioEngine.speak(item.sentence, 1.0);
    document.getElementById("g3-play-slow").onclick = () => AudioEngine.speak(item.sentence, 0.75);

    const fb = document.getElementById("g3-feedback");
    const input = document.getElementById("g3-input");

    function checkG3() {
      const val = stripPunctuation(input.value);
      const target = gameState.g3Mode === "gap" ? stripPunctuation(item.term) : stripPunctuation(item.sentence);
      if (val === target) {
        state.gamesWon += 1;
        addXP(20, true);
        fb.innerHTML = `<div class="feedback-box success">🎧 <strong>Tai nghe cực chuẩn!</strong> Câu đầy đủ: <em>${escapeHTML(item.sentence)}</em> (${escapeHTML(item.meaning)})</div>`;
      } else {
        addXP(0, false);
        fb.innerHTML = `<div class="feedback-box warn">🔎 Gần đúng rồi! Đáp án: <strong>${escapeHTML(gameState.g3Mode === "gap" ? item.term : item.sentence)}</strong><br/>Nghĩa: ${escapeHTML(item.meaning)}</div>`;
      }
    }

    document.getElementById("g3-check").onclick = checkG3;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") checkG3();
    });
    document.getElementById("g3-reveal").onclick = () => {
      fb.innerHTML = `<div class="feedback-box warn">📝 <strong>Transcript:</strong> ${escapeHTML(item.sentence)}<br/>🇻🇳 <strong>Nghĩa:</strong> ${escapeHTML(item.meaning)}</div>`;
    };
    document.getElementById("g3-next").onclick = () => {
      gameState.g3Idx += 1;
      renderGame3(stage);
    };
  }

  // GAME 4: SPEAKING — AI Teacher Voice Roleplay Lab
  function renderGame4(stage) {
    const scenarios = DATA.speakingScenarios;
    const item = scenarios[gameState.g4Idx % scenarios.length];
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

    stage.innerHTML = `
      <div class="game-hud">
        <div>
          <span class="badge ${levelBadgeClass(item.level)}">${escapeHTML(item.level)}</span>
          <strong style="margin-left:8px;">Tình huống Sư phạm ${(gameState.g4Idx % scenarios.length) + 1} / ${scenarios.length}</strong>
        </div>
        <span style="font-size:0.82rem; color:var(--accent-cyan);">
          Vai trò: Giáo viên Tiếng Anh đứng lớp
        </span>
      </div>

      <div class="prompt-display">
        <div style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:6px;">Tình huống lớp học:</div>
        <div style="font-size:1.05rem; font-weight:700;">${escapeHTML(item.situation)}</div>
        <div style="margin-top:8px; font-size:0.82rem; color:var(--accent-amber);">
          Từ khóa gợi ý: ${item.keywords.map((k) => `<span class="glue-word">${escapeHTML(k)}</span>`).join(" ")}
        </div>
      </div>

      <div style="text-align:center; padding:16px 0;">
        <button id="g4-mic-btn" class="mic-btn ${gameState.g4Listening ? "listening" : ""}" title="Bấm để nói bằng tiếng Anh">
          🎙️
        </button>
        <div id="g4-status" style="font-size:0.88rem; color:var(--text-secondary);">
          ${
            SpeechRec
              ? "Bấm micro và nói câu yêu cầu bằng tiếng Anh thật rõ ràng!"
              : "Trình duyệt chưa hỗ trợ SpeechRecognition trực tiếp — hãy nghe mẫu và luyện đọc to cùng nút Tự chấm bên dưới!"
          }
        </div>
        ${
          gameState.g4Transcript
            ? `<div class="card" style="margin-top:14px; text-align:left;">
                 <div style="font-size:0.78rem; color:var(--text-muted);">Hệ thống nghe được:</div>
                 <div style="font-size:1.02rem; font-weight:700; margin-top:4px;">"${escapeHTML(gameState.g4Transcript)}"</div>
               </div>`
            : ""
        }
      </div>

      <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">
        <button id="g4-listen-model" class="btn btn-ghost">🔊 Nghe câu mẫu chuẩn Oxford UK</button>
        <button id="g4-self-pass" class="btn btn-primary">✅ Tôi đã nói chuẩn câu mẫu (+20 XP)</button>
        <button id="g4-next" class="btn btn-secondary">Tình huống tiếp ➡️</button>
      </div>
      <div id="g4-feedback"></div>
    `;

    const fb = document.getElementById("g4-feedback");
    const micBtn = document.getElementById("g4-mic-btn");

    document.getElementById("g4-listen-model").onclick = () => {
      AudioEngine.speak(item.target);
      fb.innerHTML = `<div class="feedback-box warn">👩‍🏫 <strong>Câu mẫu sư phạm:</strong> ${escapeHTML(item.target)}</div>`;
    };

    document.getElementById("g4-self-pass").onclick = () => {
      state.gamesWon += 1;
      addXP(20, true);
      fb.innerHTML = `<div class="feedback-box success">🎉 Tuyệt vời! Ghi nhận hoàn thành kỹ năng Nói: <strong>${escapeHTML(item.target)}</strong></div>`;
    };

    document.getElementById("g4-next").onclick = () => {
      gameState.g4Idx += 1;
      gameState.g4Transcript = "";
      gameState.g4Listening = false;
      renderGame4(stage);
    };

    micBtn.onclick = () => {
      if (!SpeechRec) {
        AudioEngine.speak(item.target);
        fb.innerHTML = `<div class="feedback-box warn">ℹ️ Thiết bị/trình duyệt này không bật SpeechRecognition API. Bạn hãy nghe phát âm mẫu ở trên, đọc to lại 2 lần và bấm <strong>"Tôi đã nói chuẩn câu mẫu"</strong>!</div>`;
        return;
      }
      const recognition = new SpeechRec();
      recognition.lang = "en-GB";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      gameState.g4Listening = true;
      renderGame4(stage);

      recognition.onresult = (event) => {
        const spoken = event.results[0][0].transcript;
        gameState.g4Transcript = spoken;
        gameState.g4Listening = false;
        const normSpoken = stripPunctuation(spoken);
        const matchedKeywords = item.keywords.filter((k) => normSpoken.includes(k.toLowerCase()));
        const ratio = Math.round((matchedKeywords.length / item.keywords.length) * 100);
        renderGame4(stage);
        const newFb = document.getElementById("g4-feedback");
        if (ratio >= 65) {
          state.gamesWon += 1;
          addXP(25, true);
          newFb.innerHTML = `<div class="feedback-box success">🎙️ <strong>Khớp ${ratio}% từ khóa mục tiêu!</strong> Phát âm rất tốt. Câu mẫu: <em>${escapeHTML(item.target)}</em></div>`;
        } else {
          newFb.innerHTML = `<div class="feedback-box warn">🎙️ Khớp ${ratio}% từ khóa. Hãy thử đọc chậm và rõ hơn theo câu mẫu: <strong>${escapeHTML(item.target)}</strong></div>`;
        }
      };

      recognition.onerror = () => {
        gameState.g4Listening = false;
        renderGame4(stage);
        document.getElementById("g4-feedback").innerHTML = `<div class="feedback-box error">⚠️ Không thể truy cập micro hoặc chưa cấp quyền. Hãy nghe câu mẫu và luyện đọc to nhé!</div>`;
      };

      recognition.start();
    };
  }

  // GAME 5: READING & GRAMMAR — Error Detective & Context Master
  function renderGame5(stage) {
    const detectivePool = [
      ...DATA.contextDilemmas.map((c) => ({ kind: "context", ...c })),
      ...DATA.exercises.type3.map((e) => ({ kind: "error", ...e }))
    ];
    const item = detectivePool[gameState.g5Idx % detectivePool.length];

    if (item.kind === "context") {
      stage.innerHTML = `
        <div class="game-hud">
          <div>
            <span class="badge badge-b2">Bẫy Ngữ Cảnh Sư Phạm</span>
            <strong style="margin-left:8px;">Hồ sơ ${(gameState.g5Idx % detectivePool.length) + 1} / ${detectivePool.length}</strong>
          </div>
          <span>Giải mã Phần 2.3 trong tài liệu</span>
        </div>

        <div class="prompt-display">
          <strong style="display:block; margin-bottom:6px; color:var(--accent-cyan);">${escapeHTML(item.title)}</strong>
          <div>${escapeHTML(item.prompt)}</div>
        </div>

        <div style="display:grid; gap:10px;">
          ${item.options
            .map(
              (opt, i) => `
            <button class="btn btn-secondary" style="justify-content:flex-start; text-align:left;" data-g5-opt="${i}">
              ${String.fromCharCode(65 + i)}. ${escapeHTML(opt)}
            </button>`
            )
            .join("")}
        </div>
        <div id="g5-feedback"></div>
        <div style="display:flex; justify-content:flex-end; margin-top:14px;">
          <button id="g5-next" class="btn btn-secondary">Hồ sơ tiếp theo ➡️</button>
        </div>
      `;

      stage.querySelectorAll("[data-g5-opt]").forEach((btn) => {
        btn.onclick = () => {
          const picked = Number(btn.dataset.g5Opt);
          const fb = document.getElementById("g5-feedback");
          if (picked === item.correctIndex) {
            state.gamesWon += 1;
            addXP(20, true);
            AudioEngine.speak(item.options[item.correctIndex]);
            fb.innerHTML = `<div class="feedback-box success">🕵️ <strong>Chính xác!</strong> ${escapeHTML(item.explanation)}</div>`;
          } else {
            addXP(0, false);
            fb.innerHTML = `<div class="feedback-box error">❌ Bị mắc bẫy rồi! Đáp án đúng là <strong>${escapeHTML(item.options[item.correctIndex])}</strong>.<br/>💡 ${escapeHTML(item.explanation)}</div>`;
          }
        };
      });
    } else {
      const tokens = item.sentence.split(/\s+/);
      stage.innerHTML = `
        <div class="game-hud">
          <div>
            <span class="badge ${levelBadgeClass(item.level)}">Săn 1 Lỗi Sai (${escapeHTML(item.level)})</span>
            <strong style="margin-left:8px;">Hồ sơ ${(gameState.g5Idx % detectivePool.length) + 1} / ${detectivePool.length}</strong>
          </div>
          <span>Dạng 3 • Sửa lỗi ngữ pháp</span>
        </div>

        <p style="margin-bottom:12px; color:var(--text-secondary);">Bấm vào từ chứa lỗi sai trong câu yêu cầu dưới đây:</p>
        <div class="card" style="margin-bottom:16px;">
          ${tokens
            .map((t, i) => `<span class="wb-error-word" data-g5-word="${escapeHTML(t)}" data-idx="${i}">${escapeHTML(t)}</span>`)
            .join(" ")}
        </div>
        <div id="g5-feedback"></div>
        <div style="display:flex; justify-content:flex-end; margin-top:14px;">
          <button id="g5-next" class="btn btn-secondary">Hồ sơ tiếp theo ➡️</button>
        </div>
      `;

      stage.querySelectorAll("[data-g5-word]").forEach((span) => {
        span.onclick = () => {
          const picked = stripPunctuation(span.dataset.g5Word);
          const errWords = item.errorWord.toLowerCase().split(/\s+/);
          const fb = document.getElementById("g5-feedback");
          if (errWords.includes(picked)) {
            markExerciseSolved(item.id, 20);
            state.gamesWon += 1;
            saveState();
            AudioEngine.speak(item.fixedSentence);
            fb.innerHTML = `<div class="feedback-box success">
              🕵️ <strong>Bắt đúng lỗi "${escapeHTML(item.errorWord)}" → sửa thành "${escapeHTML(item.correction)}"!</strong><br/>
              Câu chuẩn: <strong>${escapeHTML(item.fixedSentence)}</strong><br/>
              💡 ${escapeHTML(item.explanation)}
            </div>`;
          } else {
            addXP(0, false);
            fb.innerHTML = `<div class="feedback-box warn">🔍 Từ "${escapeHTML(span.dataset.g5Word)}" đúng rồi, hãy kiểm tra lại động từ hoặc giới từ!</div>`;
          }
        };
      });
    }

    document.getElementById("g5-next").onclick = () => {
      gameState.g5Idx += 1;
      renderGame5(stage);
    };
  }

  // GAME 6: VOCAB & REFLEX — Knowt 3D Flashcards + Speed Match Blitz
  function renderGame6(stage) {
    const allVocab = getAllVocabItems();
    const item = allVocab[gameState.g6Idx % allVocab.length];

    if (gameState.g6Mode === "flashcard") {
      const rating = state.srsRatings[item.id] || "";
      stage.innerHTML = `
        <div class="game-hud">
          <div>
            <span class="badge badge-a2">Knowt 3D Flashcards + Noji SRS</span>
            <strong style="margin-left:8px;">Thẻ ${(gameState.g6Idx % allVocab.length) + 1} / ${allVocab.length}</strong>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-sm btn-primary" id="g6-to-fc">🃏 Flashcards 3D</button>
            <button class="btn btn-sm btn-secondary" id="g6-to-match">⚡ Speed Match Blitz</button>
          </div>
        </div>

        <div class="flashcard-perspective">
          <div class="flashcard-3d ${gameState.g6Flipped ? "flipped" : ""}" id="g6-card-3d">
            <div class="flashcard-face">
              <span class="badge badge-b1" style="margin-bottom:10px;">${escapeHTML(item.pos)}</span>
              <div style="font-size:2rem; font-weight:800; margin-bottom:6px;">${escapeHTML(item.term)}</div>
              <div class="vocab-ipa" style="font-size:1.05rem;">${escapeHTML(item.ipa)}</div>
              <div style="margin-top:16px; font-size:0.82rem; color:var(--text-muted);">
                (Bấm vào thẻ để lật xem nghĩa &amp; câu ví dụ lớp học)
              </div>
            </div>
            <div class="flashcard-face flashcard-back">
              <div style="font-size:1.35rem; font-weight:800; color:var(--accent-cyan); margin-bottom:10px;">
                ${escapeHTML(item.meaning)}
              </div>
              <div style="font-size:0.98rem; font-weight:600; margin-bottom:12px;">
                "${escapeHTML(item.example)}"
              </div>
              <button class="btn btn-sm btn-ghost" id="g6-card-speak">🔊 Nghe câu ví dụ</button>
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-bottom:12px;">
          <button class="btn btn-sm btn-secondary" id="g6-prev">⬅️ Trước</button>
          <button class="btn btn-sm btn-ghost" id="g6-term-speak">🔊 Nghe từ</button>
          <button class="btn btn-sm btn-primary" id="g6-next">Tiếp theo ➡️</button>
        </div>

        <div style="max-width:440px; margin:0 auto;">
          <div class="srs-bar">
            <span style="font-size:0.78rem; color:var(--text-secondary);">Đánh giá nhớ (Noji):</span>
            <button class="srs-btn easy ${rating === "easy" ? "active" : ""}" data-g6-srs="easy">Dễ</button>
            <button class="srs-btn medium ${rating === "medium" ? "active" : ""}" data-g6-srs="medium">Trung bình</button>
            <button class="srs-btn hard ${rating === "hard" ? "active" : ""}" data-g6-srs="hard">Khó (Ôn lại)</button>
          </div>
        </div>
      `;

      document.getElementById("g6-card-3d").onclick = (e) => {
        if (e.target.closest("button")) return;
        gameState.g6Flipped = !gameState.g6Flipped;
        renderGame6(stage);
      };
      document.getElementById("g6-card-speak").onclick = (e) => {
        e.stopPropagation();
        AudioEngine.speak(item.example);
      };
      document.getElementById("g6-term-speak").onclick = () => AudioEngine.speak(item.term.split("/")[0].trim());
      document.getElementById("g6-prev").onclick = () => {
        gameState.g6Idx = (gameState.g6Idx - 1 + allVocab.length) % allVocab.length;
        gameState.g6Flipped = false;
        renderGame6(stage);
      };
      document.getElementById("g6-next").onclick = () => {
        gameState.g6Idx = (gameState.g6Idx + 1) % allVocab.length;
        gameState.g6Flipped = false;
        renderGame6(stage);
      };
      stage.querySelectorAll("[data-g6-srs]").forEach((b) => {
        b.onclick = () => {
          state.srsRatings[item.id] = b.dataset.g6Srs;
          saveState();
          renderVocabulary();
          gameState.g6Idx = (gameState.g6Idx + 1) % allVocab.length;
          gameState.g6Flipped = false;
          renderGame6(stage);
        };
      });
    } else {
      // Speed Match Blitz (6 pairs = 12 tiles)
      if (!gameState.matchCards.length) {
        initMatchRound();
      }
      stage.innerHTML = `
        <div class="game-hud">
          <div>
            <span class="badge badge-b2">Speed Match Blitz</span>
            <strong style="margin-left:8px;">Đã ghép: ${gameState.matchMatchedCount} / 6 cặp</strong>
            <span style="margin-left:12px; color:var(--accent-amber); font-weight:700;" id="g6-timer">⏱️ 0s</span>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-sm btn-secondary" id="g6-to-fc">🃏 Flashcards 3D</button>
            <button class="btn btn-sm btn-primary" id="g6-to-match">⚡ Speed Match Blitz</button>
          </div>
        </div>

        <p style="font-size:0.86rem; color:var(--text-secondary); margin-bottom:14px;">
          Chọn 1 cụm từ tiếng Anh (Phrasal Verb / Giới từ) và 1 nghĩa tiếng Việt tương ứng để ghép cặp thật nhanh!
        </p>

        <div class="match-grid" id="g6-match-grid">
          ${gameState.matchCards
            .map(
              (c, idx) => `
            <button class="match-tile ${c.matched ? "matched" : ""} ${
                gameState.matchSelected === idx ? "selected" : ""
              }" data-match-idx="${idx}" ${c.matched ? "disabled" : ""}>
              <span>${escapeHTML(c.text)}</span>
              ${c.sub ? `<small style="color:var(--accent-amber); font-weight:500; margin-top:3px;">${escapeHTML(c.sub)}</small>` : ""}
            </button>`
            )
            .join("")}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
          <div id="g6-match-msg"></div>
          <button id="g6-new-round" class="btn btn-sm btn-secondary">🔄 Ván mới (6 cặp khác)</button>
        </div>
      `;

      const timerEl = document.getElementById("g6-timer");
      gameState.matchTimerId = setInterval(() => {
        if (!timerEl) return;
        const secs = Math.floor((Date.now() - gameState.matchStartTime) / 1000);
        timerEl.textContent = `⏱️ ${secs}s`;
      }, 500);

      stage.querySelectorAll("[data-match-idx]").forEach((btn) => {
        btn.onclick = () => {
          const idx = Number(btn.dataset.matchIdx);
          if (gameState.matchSelected === null) {
            gameState.matchSelected = idx;
            renderGame6(stage);
            return;
          }
          if (gameState.matchSelected === idx) {
            gameState.matchSelected = null;
            renderGame6(stage);
            return;
          }
          const first = gameState.matchCards[gameState.matchSelected];
          const second = gameState.matchCards[idx];
          if (first.pairId === second.pairId && first.side !== second.side) {
            first.matched = true;
            second.matched = true;
            gameState.matchMatchedCount += 1;
            gameState.matchSelected = null;
            AudioEngine.speak(first.side === "en" ? first.text.split("/")[0] : second.text.split("/")[0]);
            if (gameState.matchMatchedCount === 6) {
              clearInterval(gameState.matchTimerId);
              state.gamesWon += 1;
              addXP(30, true);
              renderGame6(stage);
              document.getElementById("g6-match-msg").innerHTML = `<span style="color:var(--accent-emerald); font-weight:800;">🎉 Hoàn thành xuất sắc (+30 XP)!</span>`;
              return;
            }
            renderGame6(stage);
          } else {
            gameState.matchSelected = null;
            btn.classList.add("wrong");
            setTimeout(() => renderGame6(stage), 350);
          }
        };
      });

      document.getElementById("g6-new-round").onclick = () => {
        initMatchRound();
        renderGame6(stage);
      };
    }

    document.getElementById("g6-to-fc")?.addEventListener("click", () => {
      gameState.g6Mode = "flashcard";
      renderGame6(stage);
    });
    document.getElementById("g6-to-match")?.addEventListener("click", () => {
      gameState.g6Mode = "match";
      initMatchRound();
      renderGame6(stage);
    });
  }

  function initMatchRound() {
    const pool = [...DATA.vocabulary.phrasalVerbs, ...DATA.vocabulary.prepositions, ...DATA.vocabulary.coreWords];
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
    const cards = [];
    shuffled.forEach((item) => {
      cards.push({ pairId: item.id, side: "en", text: item.term, sub: item.ipa, matched: false });
      cards.push({ pairId: item.id, side: "vi", text: item.meaning, sub: "", matched: false });
    });
    gameState.matchCards = cards.sort(() => Math.random() - 0.5);
    gameState.matchSelected = null;
    gameState.matchMatchedCount = 0;
    gameState.matchStartTime = Date.now();
  }

  // ------------------------------------------------------------------------
  // 8. Section 3: Full 47-Question Workbook
  // ------------------------------------------------------------------------
  let activeWbTab = "cefr";
  let wbType1Cefr = "ALL";

  function renderWorkbook() {
    const container = document.getElementById("wb-content");
    if (!container) return;

    if (activeWbTab === "cefr") {
      container.innerHTML = `
        <div class="grid-2">
          ${DATA.cefrExamples
            .map(
              (tier) => `
            <div class="card">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span class="badge ${levelBadgeClass(tier.level)}">${escapeHTML(tier.label)}</span>
              </div>
              <p style="font-size:0.86rem; color:var(--text-secondary); margin-bottom:12px;">
                ${escapeHTML(tier.characteristic)}
              </p>
              ${tier.items
                .map(
                  (it) => `
                <div class="example-pill" style="flex-direction:column; align-items:flex-start; gap:4px;">
                  <div class="mono" style="font-size:0.78rem; color:var(--accent-amber);">${escapeHTML(it.prompt)}</div>
                  <div style="display:flex; width:100%; justify-content:space-between; align-items:center; gap:8px;">
                    <strong style="font-size:0.92rem;">${escapeHTML(it.sentence)}</strong>
                    <button class="icon-btn speak-btn" data-speak="${escapeHTML(it.sentence)}">🔊</button>
                  </div>
                </div>`
                )
                .join("")}
            </div>`
            )
            .join("")}
        </div>
      `;
    } else if (activeWbTab === "type1") {
      const filtered =
        wbType1Cefr === "ALL"
          ? DATA.exercises.type1
          : DATA.exercises.type1.filter((q) => q.level === wbType1Cefr);

      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px;">
          <div class="tabs-bar" style="margin-bottom:0;">
            ${["ALL", "A1", "A2", "B1", "B1+", "B2"]
              .map(
                (lv) =>
                  `<button class="btn btn-sm ${wbType1Cefr === lv ? "btn-primary" : "btn-secondary"}" data-wb-cefr="${lv}">${
                    lv === "ALL" ? "Tất cả (21 câu)" : lv
                  }</button>`
              )
              .join("")}
          </div>
          <button class="btn btn-sm btn-ghost" id="wb-t1-showall">👁️ Xem toàn bộ đáp án Dạng 1</button>
        </div>

        <div class="workbook-list">
          ${filtered
            .map(
              (q) => `
            <div class="wb-item ${state.solvedExercises[q.id] ? "solved" : ""}" id="wb-card-${q.id}">
              <div class="wb-top">
                <div>
                  <span class="badge ${levelBadgeClass(q.level)}">Dạng ${q.part} • Câu ${q.num} (${q.level})</span>
                  <span class="mono" style="margin-left:10px; color:var(--accent-amber); font-weight:700;">${escapeHTML(q.prompt)}</span>
                </div>
                <button class="icon-btn speak-btn" data-speak="${escapeHTML(q.answer)}" title="Nghe đáp án">🔊</button>
              </div>
              <div class="wb-input-row">
                <input type="text" class="answer-input" style="flex:1; padding:10px 14px;" id="in-${q.id}" placeholder="Viết câu yêu cầu hoàn chỉnh..." />
                <button class="btn btn-sm btn-primary" data-check-t1="${q.id}">Kiểm tra</button>
                <button class="btn btn-sm btn-secondary" data-ans-t1="${q.id}">Đáp án</button>
              </div>
              <div id="fb-${q.id}"></div>
            </div>`
            )
            .join("")}
        </div>
      `;

      container.querySelectorAll("[data-wb-cefr]").forEach((b) => {
        b.onclick = () => {
          wbType1Cefr = b.dataset.wbCefr;
          renderWorkbook();
        };
      });

      container.querySelectorAll("[data-check-t1]").forEach((b) => {
        b.onclick = () => {
          const id = b.dataset.checkT1;
          const q = DATA.exercises.type1.find((x) => x.id === id);
          const val = document.getElementById(`in-${id}`).value;
          const res = evaluateRequest(val, q);
          const fb = document.getElementById(`fb-${id}`);
          if (res.isCorrect) {
            markExerciseSolved(id, 15);
            document.getElementById(`wb-card-${id}`).classList.add("solved");
            AudioEngine.speak(q.answer);
            fb.innerHTML = `<div class="feedback-box success">✅ Chính xác! ${highlightBlueGlue(q.answer, q.blueTokens)} — <em>${escapeHTML(q.explanation)}</em></div>`;
          } else {
            addXP(0, false);
            fb.innerHTML = `<div class="feedback-box warn">🔎 Chưa khớp hoàn toàn: ${res.diffHtml}<br/><strong>Grammar:</strong> ${escapeHTML(res.grammar)} | <strong>Appropriateness:</strong> ${escapeHTML(res.appropriateness)}</div>`;
          }
        };
      });

      container.querySelectorAll("[data-ans-t1]").forEach((b) => {
        b.onclick = () => {
          const id = b.dataset.ansT1;
          const q = DATA.exercises.type1.find((x) => x.id === id);
          document.getElementById(`in-${id}`).value = q.answer;
          document.getElementById(`fb-${id}`).innerHTML = `<div class="feedback-box warn">
            💡 <strong>Đáp án chuẩn:</strong> ${highlightBlueGlue(q.answer, q.blueTokens)}<br/>${escapeHTML(q.explanation)}
          </div>`;
        };
      });

      document.getElementById("wb-t1-showall").onclick = () => {
        filtered.forEach((q) => {
          document.getElementById(`fb-${q.id}`).innerHTML = `<div class="feedback-box warn">
            <strong>Đáp án:</strong> ${highlightBlueGlue(q.answer, q.blueTokens)} — ${escapeHTML(q.explanation)}
          </div>`;
        });
      };
    } else if (activeWbTab === "type2") {
      container.innerHTML = `
        <div class="workbook-list">
          ${DATA.exercises.type2
            .map((q) => {
              let blankIdx = 0;
              const htmlTemplate = escapeHTML(q.template).replace(/____/g, () => {
                const b = q.blanks[blankIdx];
                const curIdx = blankIdx;
                blankIdx += 1;
                return `<select class="wb-inline-select" id="t2-${q.id}-${curIdx}">
                  <option value="">-- chọn --</option>
                  ${b.options.map((o) => `<option value="${escapeHTML(o)}">${escapeHTML(o)}</option>`).join("")}
                </select>`;
              });

              return `
              <div class="wb-item ${state.solvedExercises[q.id] ? "solved" : ""}" id="wb-card-${q.id}">
                <div class="wb-top">
                  <span class="badge ${levelBadgeClass(q.level)}">Dạng 2 • Câu ${q.num} (${q.level})</span>
                  <div style="display:flex; gap:8px;">
                    <button class="btn btn-sm btn-primary" data-check-t2="${q.id}">Kiểm tra</button>
                    <button class="btn btn-sm btn-secondary" data-ans-t2="${q.id}">Đáp án</button>
                  </div>
                </div>
                <div style="font-size:1.02rem; line-height:2;">${htmlTemplate}</div>
                <div id="fb-${q.id}"></div>
              </div>`;
            })
            .join("")}
        </div>
      `;

      container.querySelectorAll("[data-check-t2]").forEach((btn) => {
        btn.onclick = () => {
          const id = btn.dataset.checkT2;
          const q = DATA.exercises.type2.find((x) => x.id === id);
          let allOk = true;
          q.blanks.forEach((b, i) => {
            const val = document.getElementById(`t2-${id}-${i}`).value;
            const validList = b.accepted || [b.answer];
            if (!validList.includes(val)) allOk = false;
          });
          const fb = document.getElementById(`fb-${id}`);
          if (allOk) {
            markExerciseSolved(id, 15);
            document.getElementById(`wb-card-${id}`).classList.add("solved");
            fb.innerHTML = `<div class="feedback-box success">✅ Chính xác! ${escapeHTML(q.explanation)}</div>`;
          } else {
            addXP(0, false);
            fb.innerHTML = `<div class="feedback-box error">❌ Chưa đúng hết các chỗ trống. Đáp án chuẩn: <strong>${q.blanks.map((b) => b.answer).join(" / ")}</strong>. ${escapeHTML(q.explanation)}</div>`;
          }
        };
      });

      container.querySelectorAll("[data-ans-t2]").forEach((btn) => {
        btn.onclick = () => {
          const id = btn.dataset.ansT2;
          const q = DATA.exercises.type2.find((x) => x.id === id);
          q.blanks.forEach((b, i) => {
            document.getElementById(`t2-${id}-${i}`).value = b.answer;
          });
          document.getElementById(`fb-${id}`).innerHTML = `<div class="feedback-box warn">💡 Đáp án: <strong>${q.blanks.map((b) => b.answer).join(" / ")}</strong> — ${escapeHTML(q.explanation)}</div>`;
        };
      });
    } else if (activeWbTab === "type3") {
      container.innerHTML = `
        <div class="workbook-list">
          ${DATA.exercises.type3
            .map(
              (q) => `
            <div class="wb-item ${state.solvedExercises[q.id] ? "solved" : ""}" id="wb-card-${q.id}">
              <div class="wb-top">
                <span class="badge ${levelBadgeClass(q.level)}">Dạng 3 • Câu ${q.num} (${q.level})</span>
                <button class="icon-btn speak-btn" data-speak="${escapeHTML(q.fixedSentence)}" title="Nghe câu đúng">🔊</button>
              </div>
              <p style="font-size:1.02rem; margin-bottom:10px;">
                <strong>Câu có lỗi:</strong> ${escapeHTML(q.sentence)}
              </p>
              <div class="wb-input-row">
                <input type="text" class="answer-input" style="flex:1; padding:10px 14px;" id="in-${q.id}" placeholder="Viết lại câu đúng hoặc nhập phần sửa (VD: ${q.correction})..." />
                <button class="btn btn-sm btn-primary" data-check-t3="${q.id}">Kiểm tra</button>
                <button class="btn btn-sm btn-secondary" data-ans-t3="${q.id}">Đáp án</button>
              </div>
              <div id="fb-${q.id}"></div>
            </div>`
            )
            .join("")}
        </div>
      `;

      container.querySelectorAll("[data-check-t3]").forEach((b) => {
        b.onclick = () => {
          const id = b.dataset.checkT3;
          const q = DATA.exercises.type3.find((x) => x.id === id);
          const val = stripPunctuation(document.getElementById(`in-${id}`).value);
          const ok = val === stripPunctuation(q.fixedSentence) || val === stripPunctuation(q.correction);
          const fb = document.getElementById(`fb-${id}`);
          if (ok) {
            markExerciseSolved(id, 15);
            document.getElementById(`wb-card-${id}`).classList.add("solved");
            AudioEngine.speak(q.fixedSentence);
            fb.innerHTML = `<div class="feedback-box success">✅ Chuẩn xác! ${escapeHTML(q.fixedSentence)} — ${escapeHTML(q.explanation)}</div>`;
          } else {
            addXP(0, false);
            fb.innerHTML = `<div class="feedback-box error">❌ Chưa đúng. Sửa <strong>${escapeHTML(q.errorWord)}</strong> → <strong>${escapeHTML(q.correction)}</strong>. Câu đúng: ${escapeHTML(q.fixedSentence)}</div>`;
          }
        };
      });

      container.querySelectorAll("[data-ans-t3]").forEach((b) => {
        b.onclick = () => {
          const id = b.dataset.ansT3;
          const q = DATA.exercises.type3.find((x) => x.id === id);
          document.getElementById(`in-${id}`).value = q.fixedSentence;
          document.getElementById(`fb-${id}`).innerHTML = `<div class="feedback-box warn">💡 <strong>${escapeHTML(q.errorWord)} → ${escapeHTML(q.correction)}:</strong> ${escapeHTML(q.fixedSentence)} (${escapeHTML(q.explanation)})</div>`;
        };
      });
    } else if (activeWbTab === "type4") {
      container.innerHTML = `
        <div class="workbook-list">
          ${DATA.exercises.type4
            .map(
              (q) => `
            <div class="wb-item ${state.solvedExercises[q.id] ? "solved" : ""}" id="wb-card-${q.id}">
              <div class="wb-top">
                <span class="badge ${levelBadgeClass(q.level)}">Dạng 4 • Câu ${q.num} (${q.level})</span>
                <span style="font-size:0.84rem; color:var(--accent-amber); font-weight:700;">${escapeHTML(q.constraint)}</span>
              </div>
              <p style="font-size:1.02rem; margin-bottom:10px;">
                <strong>Câu gốc:</strong> ${escapeHTML(q.source)}
              </p>
              <div class="wb-input-row">
                <input type="text" class="answer-input" style="flex:1; padding:10px 14px;" id="in-${q.id}" placeholder="Viết lại câu lịch sự theo đúng yêu cầu..." />
                <button class="btn btn-sm btn-primary" data-check-t4="${q.id}">Kiểm tra</button>
                <button class="btn btn-sm btn-secondary" data-ans-t4="${q.id}">Đáp án</button>
                <button class="icon-btn speak-btn" data-speak="${escapeHTML(q.answer)}">🔊</button>
              </div>
              <div id="fb-${q.id}"></div>
            </div>`
            )
            .join("")}
        </div>
      `;

      container.querySelectorAll("[data-check-t4]").forEach((b) => {
        b.onclick = () => {
          const id = b.dataset.checkT4;
          const q = DATA.exercises.type4.find((x) => x.id === id);
          const val = stripPunctuation(document.getElementById(`in-${id}`).value);
          const ok = q.acceptedAnswers.some((ans) => stripPunctuation(ans) === val);
          const fb = document.getElementById(`fb-${id}`);
          if (ok) {
            markExerciseSolved(id, 20);
            document.getElementById(`wb-card-${id}`).classList.add("solved");
            AudioEngine.speak(q.answer);
            fb.innerHTML = `<div class="feedback-box success">✅ Tuyệt vời! <strong>${escapeHTML(q.answer)}</strong> — ${escapeHTML(q.explanation)}</div>`;
          } else {
            addXP(0, false);
            fb.innerHTML = `<div class="feedback-box error">❌ Chưa khớp cấu trúc yêu cầu. Đáp án chuẩn: <strong>${escapeHTML(q.answer)}</strong> (${escapeHTML(q.explanation)})</div>`;
          }
        };
      });

      container.querySelectorAll("[data-ans-t4]").forEach((b) => {
        b.onclick = () => {
          const id = b.dataset.ansT4;
          const q = DATA.exercises.type4.find((x) => x.id === id);
          document.getElementById(`in-${id}`).value = q.answer;
          document.getElementById(`fb-${id}`).innerHTML = `<div class="feedback-box warn">💡 <strong>Đáp án chuẩn:</strong> ${escapeHTML(q.answer)} — ${escapeHTML(q.explanation)}</div>`;
        };
      });
    }
  }

  // ------------------------------------------------------------------------
  // 9. Design References Grid (Section 5)
  // ------------------------------------------------------------------------
  function renderReferences() {
    const grid = document.getElementById("references-grid");
    if (!grid) return;
    grid.innerHTML = DATA.designReferences
      .map(
        (ref) => `
      <a href="${escapeHTML(ref.url)}" target="_blank" rel="noopener noreferrer" class="card" style="text-decoration:none; color:inherit; display:flex; flex-direction:column; justify-content:space-between; gap:10px; transition:var(--transition);">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <strong style="color:var(--accent-cyan); font-size:1rem;">${escapeHTML(ref.name)}</strong>
            <span>↗</span>
          </div>
          <p style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:8px;">${escapeHTML(ref.highlight)}</p>
        </div>
        <div style="font-size:0.78rem; padding-top:8px; border-top:1px solid var(--border-subtle); color:var(--text-main);">
          <strong>Áp dụng:</strong> ${escapeHTML(ref.applied)}
        </div>
      </a>`
      )
      .join("");
  }

  // ------------------------------------------------------------------------
  // 10. Global Event Delegation & Bootstrapping
  // ------------------------------------------------------------------------
  function bindEvents() {
    document.getElementById("theme-toggle")?.addEventListener("click", () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      applyTheme();
      saveState();
    });

    document.getElementById("xray-toggle-btn")?.addEventListener("click", () => {
      state.xrayBlue = !state.xrayBlue;
      applyXrayState();
      saveState();
    });

    // Theory Tabs
    document.getElementById("theory-tabs")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-theory-tab]");
      if (!btn) return;
      activeTheoryTab = btn.dataset.theoryTab;
      document.querySelectorAll("#theory-tabs .tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderTheoryTab();
    });

    // Vocab Tabs & Search
    document.getElementById("vocab-cat-tabs")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-vocab-cat]");
      if (!btn) return;
      activeVocabCat = btn.dataset.vocabCat;
      document.querySelectorAll("#vocab-cat-tabs .tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderVocabulary();
    });

    document.getElementById("vocab-search")?.addEventListener("input", (e) => {
      vocabQuery = e.target.value;
      renderVocabulary();
    });

    // Game Selector
    document.getElementById("game-selector")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-game]");
      if (!btn) return;
      activeGame = btn.dataset.game;
      document.querySelectorAll("#game-selector .game-card-tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderGameStage();
    });

    // Workbook Tabs & Reset
    document.getElementById("wb-tabs")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-wb-tab]");
      if (!btn) return;
      activeWbTab = btn.dataset.wbTab;
      document.querySelectorAll("#wb-tabs .tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderWorkbook();
    });

    document.getElementById("wb-reset-btn")?.addEventListener("click", () => {
      state.solvedExercises = {};
      saveState();
      renderWorkbook();
    });

    // Global delegated clicks for speak buttons, SRS ratings, and batch play
    document.body.addEventListener("click", (e) => {
      const speakBtn = e.target.closest(".speak-btn");
      if (speakBtn && speakBtn.dataset.speak) {
        AudioEngine.speak(speakBtn.dataset.speak);
        return;
      }

      const srsBtn = e.target.closest("[data-srs]");
      if (srsBtn) {
        const id = srsBtn.dataset.srs;
        const val = srsBtn.dataset.val;
        state.srsRatings[id] = val;
        if (val === "easy") addXP(5, true);
        else saveState();
        renderVocabulary();
        return;
      }

      if (e.target.id === "play-all-16-btn") {
        const text = DATA.sample16Sentences
          .slice(0, 5)
          .map((s) => `Sentence ${s.num}. ${s.sentence}`)
          .join(" ... ");
        AudioEngine.speak(text);
      }
    });
  }

  function init() {
    applyTheme();
    applyXrayState();
    renderHeroSection();
    renderTheoryTab();
    renderVocabulary();
    renderGameStage();
    renderWorkbook();
    renderReferences();
    updateGlobalStatsUI();
    bindEvents();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
