/* ==========================================================================
   DLU RequestMaster v2.1 — 12-Mode Study Engine + Resilient AI + Flashcard Typing
   ========================================================================== */

(function () {
  "use strict";

  const DATA = window.DLU_DATA;
  const STORAGE_KEY = "dlu_request_master_v2";
  const AI_STORAGE_KEY = "dlu_ai_config_v2";

  // ------------------------------------------------------------------------
  // 1. Multi-Provider AI Configuration, Auto-Discovery & Built-in Zero-Key AI
  // ------------------------------------------------------------------------
  const AI_PROVIDERS = {
    builtin: {
      name: "AI Nội Bộ (0đ)",
      defaultModel: "dlu-pedagogy-local-v2",
      hint: "Hoạt động tức thì 100% không cần API Key, phân tích ngữ pháp sư phạm và tạo đề trực tiếp từ Cẩm nang Đại học Đà Lạt.",
      type: "builtin"
    },
    gemini: {
      name: "Google Gemini",
      defaultModel: "gemini-3.8-flash",
      hint: "Khuyên dùng: gemini-3.8-flash (hoặc bấm '🔍 Dò Model từ Key' để tự chọn model mới nhất mà Key của bạn hỗ trợ). Lấy key tại aistudio.google.com.",
      type: "gemini"
    },
    groq: {
      name: "Groq Cloud",
      defaultModel: "llama-3.3-70b-versatile",
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      modelsEndpoint: "https://api.groq.com/openai/v1/models",
      hint: "Key bắt đầu bằng gsk_... Lấy miễn phí tại console.groq.com (llama-3.3-70b-versatile, llama-3.1-8b-instant).",
      type: "openai"
    },
    mistral: {
      name: "Mistral AI",
      defaultModel: "mistral-small-latest",
      endpoint: "https://api.mistral.ai/v1/chat/completions",
      modelsEndpoint: "https://api.mistral.ai/v1/models",
      hint: "Free tier tại console.mistral.ai (mistral-small-latest hoặc open-mistral-nemo).",
      type: "openai"
    },
    deepseek: {
      name: "DeepSeek",
      defaultModel: "deepseek-chat",
      endpoint: "https://api.deepseek.com/chat/completions",
      modelsEndpoint: "https://api.deepseek.com/models",
      hint: "Key bắt đầu bằng sk-... tại platform.deepseek.com (deepseek-chat).",
      type: "openai"
    },
    openrouter: {
      name: "OpenRouter Free",
      defaultModel: "deepseek/deepseek-chat-v3-0324:free",
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      modelsEndpoint: "https://openrouter.ai/api/v1/models",
      hint: "Key bắt đầu bằng sk-or-... tại openrouter.ai. Hệ thống sẽ tự tìm các model miễn phí (:free).",
      type: "openai"
    }
  };

  let aiConfig = loadAIConfig();

  function loadAIConfig() {
    try {
      const raw = localStorage.getItem(AI_STORAGE_KEY) || localStorage.getItem("dlu_ai_config_v1");
      if (!raw) return { provider: "builtin", model: AI_PROVIDERS.builtin.defaultModel, apiKey: "" };
      const parsed = JSON.parse(raw);
      const prov = AI_PROVIDERS[parsed.provider] ? parsed.provider : "builtin";
      let model = parsed.model || AI_PROVIDERS[prov].defaultModel;
      // Upgrade retired gemini-2.5-flash default transparently
      if (prov === "gemini" && model === "gemini-2.5-flash") {
        model = AI_PROVIDERS.gemini.defaultModel;
      }
      return {
        provider: prov,
        model,
        apiKey: parsed.apiKey || ""
      };
    } catch {
      return { provider: "builtin", model: AI_PROVIDERS.builtin.defaultModel, apiKey: "" };
    }
  }

  function saveAIConfig(cfg) {
    aiConfig = { ...cfg };
    try {
      localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(aiConfig));
    } catch {
      // Ignore quota errors
    }
    updateAIStatusUI();
  }

  function detectProviderFromKey(key) {
    const k = (key || "").trim();
    if (!k) return null;
    if (k.startsWith("AIza")) return "gemini";
    if (k.startsWith("gsk_")) return "groq";
    if (k.startsWith("sk-or-")) return "openrouter";
    return null;
  }

  function updateAIStatusUI() {
    const btn = document.getElementById("open-ai-modal-btn");
    const lbl = document.getElementById("ai-status-label");
    if (!btn || !lbl) return;
    if (aiConfig.provider === "builtin") {
      btn.classList.add("connected");
      lbl.textContent = "AI Nội Bộ (0đ • Sẵn sàng)";
    } else if (aiConfig.apiKey && aiConfig.apiKey.trim()) {
      btn.classList.add("connected");
      lbl.textContent = `AI: ${AI_PROVIDERS[aiConfig.provider].name}`;
    } else {
      btn.classList.remove("connected");
      lbl.textContent = "Cài AI Free Key";
    }
  }

  // Built-in Zero-Key Pedagogical AI Engine (100% Local & Instant)
  const LocalPedagogicalAI = {
    answer(prompt) {
      const p = prompt.toLowerCase();

      // 1. Mode 5: Sentence Grading
      if (prompt.includes("Đề gợi ý:") && prompt.includes("Câu sinh viên viết:")) {
        const promptMatch = prompt.match(/Đề gợi ý:\s*"([^"]+)"/);
        const ansMatch = prompt.match(/Đáp án chuẩn tham khảo:\s*"([^"]+)"/);
        const userMatch = prompt.match(/Câu sinh viên viết:\s*"([^"]*)"/);
        const qPrompt = promptMatch ? promptMatch[1] : "";
        const refAns = ansMatch ? ansMatch[1] : "";
        const userAns = userMatch ? userMatch[1] : "";

        const item =
          DATA.exercises.type1.find((x) => x.prompt === qPrompt) || {
            prompt: qPrompt,
            answer: refAns,
            acceptedAnswers: [refAns],
            isQuestion: qPrompt.includes("?")
          };

        if (!userAns || userAns.startsWith("(Học viên chưa")) {
          return [
            `📘 HƯỚNG DẪN TỪNG BƯỚC CHO ĐỀ: "${qPrompt}"`,
            `1. Xác định dạng câu: ${qPrompt.includes("?") ? "Có dấu '?' → BẮT BUỘC dùng Nghi vấn lịch sự (Could you please... / Would you mind...)." : "Không có dấu '?' → Dùng câu mệnh lệnh lịch sự (Please + V nguyên mẫu...)."}`,
            `2. Bổ sung mảnh ghép xanh dương: kiểm tra mạo từ (a/an/the), tính từ sở hữu (your) và giới từ cố định.`,
            `3. Câu mẫu chuẩn sư phạm: "${refAns}"`,
            item.explanation ? `💡 Ghi chú: ${item.explanation}` : ""
          ]
            .filter(Boolean)
            .join("\n");
        }

        const evalRes = evaluateRequest(userAns, item);
        const score = evalRes.isCorrect ? "10/10" : userAns.split(/\s+/).length >= 3 ? "7.5/10" : "5/10";
        return [
          `📊 CHẤM ĐIỂM 3 TIÊU CHÍ (${score}):`,
          `• Grammar (Ngữ pháp): ${evalRes.grammar}`,
          `• Clarity (Rõ ràng, đủ mảnh ghép): ${evalRes.clarity}`,
          `• Appropriateness (Ngữ cảnh giáo viên): ${evalRes.appropriateness}`,
          `\n✅ Đáp án chuẩn gợi ý: "${refAns}"`,
          item.explanation ? `💡 Giải thích chi tiết: ${item.explanation}` : ""
        ]
          .filter(Boolean)
          .join("\n");
      }

      // 2. Mode 10: Student Roleplay
      if (prompt.includes("đóng vai một học sinh")) {
        const lineMatch = prompt.match(/Giáo viên vừa nói trong lớp học:\s*"([^"]+)"/);
        const line = lineMatch ? lineMatch[1] : "";
        const isPolite = /^(could|would|please|i'd|i would)/i.test(line.trim());
        const studentReply = line.includes("?")
          ? "Yes, teacher! I'd be happy to do that right away."
          : "Yes, miss/sir! We're doing it now.";
        return [
          `🧑‍🎓 Học sinh trả lời: "${studentReply}"`,
          `\n👩‍🏫 Cố vấn Sư phạm nhận xét: ${
            isPolite
              ? "Câu yêu cầu của bạn rất lịch sự, rõ ràng và đúng ngữ cảnh giáo viên đứng lớp!"
              : "Mẹo nhỏ: Hãy thêm 'Please' ở đầu/cuối câu hoặc dùng 'Could you please...' để giọng điệu giáo viên mềm mại hơn."
          }`
        ].join("\n");
      }

      // 3. Mode 12: Individual Term Analysis
      if (prompt.includes('Phân tích nhanh cụm từ "')) {
        const termMatch = prompt.match(/Phân tích nhanh cụm từ "([^"]+)"/);
        const term = termMatch ? termMatch[1] : "";
        const found = getAllVocabItems().find((v) => v.term.toLowerCase() === term.toLowerCase());
        if (found) {
          return [
            `📘 PHÂN TÍCH CỤM TỪ: ${found.term} (${found.pos}) — ${found.ipa}`,
            `• Nghĩa chuẩn lớp học: ${found.meaning}`,
            `• Cấu trúc dùng với câu yêu cầu:\n  - Mệnh lệnh: Please ${found.term.split("/")[0].trim()} ... / ${found.example}\n  - Lịch sự (?): Could you please ${found.term.split("/")[0].trim()} ...?`,
            `• Lỗi hay mắc: Quên mạo từ (a/an/the/your) hoặc nhầm giới từ đi kèm phía sau động từ.`
          ].join("\n");
        }
      }

      // 4. Mode 9: Generate 5 quiz questions from Hard Box
      if (p.includes("5 câu trắc nghiệm") || p.includes("sinh 5 câu")) {
        const hard = getAllVocabItems().filter((v) => state.srsRatings[v.id] === "hard");
        const pool = (hard.length >= 3 ? hard : getAllVocabItems()).slice(0, 5);
        const lines = [`📝 5 CÂU ÔN TẬP TỪ HỘP CẦN NHỚ (${hard.length ? "Hộp Quên" : "Bộ từ cốt lõi"}):\n`];
        pool.forEach((v, idx) => {
          const clean = v.term.split("/")[0].trim();
          const blankEx = v.example.replace(new RegExp(escapeRegex(clean), "i"), "______");
          lines.push(`Câu ${idx + 1}: "${blankEx}" (Nghĩa: ${v.meaning})\n→ Đáp án: ${v.term} (${v.ipa})\n`);
        });
        return lines.join("\n");
      }

      // 5. Mode 9: Mnemonics or Preposition Traps or General Grammar Q&A
      if (p.includes("mẹo nhớ") || p.includes("cụm động từ")) {
        return [
          "🧠 MẸO NHỚ NHANH CÁC PHRASAL VERBS LỚP HỌC:",
          "• Cặp đối lập: take out (lấy ra) ↔ put away (cất đi)",
          "• Cặp phát & nộp: hand out / pass out (phát bài ra) ↔ hand in / turn in (nộp bài vào)",
          "• Ghi & sửa bài: jot down (ghi nhanh) • fill in (điền chỗ trống) • cross out (gạch bỏ)",
          "• Ôn & tìm hiểu: go over (xem lại) • look up (tra từ điển) • figure out (tìm ra) • run through (điểm qua nhanh)",
          "• Sáng tạo & theo kịp: come up with (nghĩ ra ý tưởng) • carry out (tiến hành) • catch up on (học bù)."
        ].join("\n");
      }

      if (p.includes("bẫy") || p.includes("at the top") || p.includes("giới từ") || p.includes("mạo từ")) {
        return [
          "📍 TỔNG HỢP BẪY GIỚI TỪ & MẠO TỪ HAY THI:",
          "1. open ... TO page 79 (mở tới trang) ≠ exercise ON page 20 (bài tập nằm ở trang).",
          "2. AT the top/bottom of the paper (đầu/cuối trang giấy) ≠ ON top of the desk (chồng lên mặt bàn).",
          "3. the answer TO the question (không dùng 'of').",
          "4. IN pencil / IN ink (viết bằng bút chì/mực) • ON time (đúng giờ) • BY Friday (chậm nhất thứ Sáu).",
          "5. Quy tắc dấu '?': Đề kết thúc bằng '?' → bắt buộc dùng Could you / Would you...!"
        ].join("\n");
      }

      return [
        "👩‍🏫 CỐ VẤN SƯ PHẠM DLU GIẢI ĐÁP:",
        "• Khẳng định: Please + V(nguyên mẫu) + O  (hoặc V..., please).",
        "• Phủ định: Please don't + V(nguyên mẫu) + O.",
        "• Nghi vấn lịch sự (khi đề có dấu '?'): Could / Would you please + V(nguyên mẫu) + O?",
        "• Trang trọng B1–B2: Would you mind + V-ing + O? / I'd appreciate it if you could + V...",
        "💡 Mẹo: Bạn có thể dán API Key miễn phí từ Groq (gsk_...) hoặc Google AI Studio (AIza...) để mở khóa trả lời AI tự do nâng cao!"
      ].join("\n");
    }
  };

  const AIEngine = {
    isConfigured() {
      return aiConfig.provider === "builtin" || Boolean(aiConfig.apiKey && aiConfig.apiKey.trim().length > 6);
    },

    async discoverModels(provider, apiKey) {
      const key = (apiKey || "").trim();
      const prov = AI_PROVIDERS[provider];
      if (!prov || provider === "builtin") return [AI_PROVIDERS.builtin.defaultModel];
      if (!key) throw new Error("Vui lòng nhập API Key trước khi dò model.");

      if (prov.type === "gemini") {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
        const valid = (data.models || [])
          .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
          .map((m) => m.name.replace(/^models\//, ""))
          .filter((n) => /gemini/i.test(n) && !/embedding|aqa|imagen|veo/i.test(n));
        // Prioritize newest flash models
        valid.sort((a, b) => {
          const score = (s) => (/flash/i.test(s) ? 10 : 0) + (/3\./.test(s) ? 5 : /2\.5/.test(s) ? 3 : 0);
          return score(b) - score(a);
        });
        if (!valid.length) throw new Error("Không tìm thấy model generateContent nào trên Key này.");
        return valid;
      }

      if (prov.modelsEndpoint) {
        const res = await fetch(prov.modelsEndpoint, {
          headers: { Authorization: `Bearer ${key}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
        let ids = (data.data || []).map((m) => m.id).filter(Boolean);
        if (provider === "openrouter") {
          const freeIds = ids.filter((id) => id.includes(":free"));
          if (freeIds.length) ids = freeIds;
        } else if (provider === "groq") {
          ids = ids.filter((id) => !/whisper|tts|guard/i.test(id));
        }
        return ids.slice(0, 25);
      }
      return [prov.defaultModel];
    },

    async callGeminiRaw(model, key, prompt, systemInstruction) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.55 }
        })
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error?.message || `Gemini HTTP ${res.status}`;
        const err = new Error(msg);
        err.status = res.status;
        throw err;
      }
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    },

    async callOpenAIRaw(provider, model, key, prompt, systemInstruction) {
      const prov = AI_PROVIDERS[provider];
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`
      };
      if (provider === "openrouter") {
        headers["HTTP-Referer"] = window.location.origin;
        headers["X-Title"] = "DLU RequestMaster";
      }
      const res = await fetch(prov.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
          ],
          temperature: 0.55
        })
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error?.message || `${prov.name} HTTP ${res.status}`;
        throw new Error(msg);
      }
      return data?.choices?.[0]?.message?.content || "";
    },

    async askStrictExternal(prompt, systemInstruction) {
      let provider = aiConfig.provider;
      const key = (aiConfig.apiKey || "").trim();
      const detected = detectProviderFromKey(key);
      if (detected && detected !== provider) {
        provider = detected;
        aiConfig.provider = detected;
        aiConfig.model = AI_PROVIDERS[detected].defaultModel;
        saveAIConfig(aiConfig);
      }

      const prov = AI_PROVIDERS[provider];
      let model = (aiConfig.model || prov.defaultModel).trim();

      if (prov.type === "gemini") {
        try {
          return await this.callGeminiRaw(model, key, prompt, systemInstruction);
        } catch (firstErr) {
          // 1) Check if Google explicitly recommended a newer model in the error message (e.g. models/gemini-3.8-flash)
          const suggested = firstErr.message.match(/models\/([a-zA-Z0-9._-]+)/);
          if (suggested && suggested[1] && suggested[1] !== model) {
            try {
              const txt = await this.callGeminiRaw(suggested[1], key, prompt, systemInstruction);
              saveAIConfig({ provider, model: suggested[1], apiKey: key });
              return txt;
            } catch {
              // continue to listModels
            }
          }
          // 2) Dynamically discover available generateContent models for this API key
          try {
            const avail = await this.discoverModels("gemini", key);
            for (const cand of avail.slice(0, 3)) {
              if (cand === model) continue;
              try {
                const txt = await this.callGeminiRaw(cand, key, prompt, systemInstruction);
                saveAIConfig({ provider, model: cand, apiKey: key });
                return txt;
              } catch {
                // try next
              }
            }
          } catch {
            // ignore discovery error and throw original
          }
          throw firstErr;
        }
      }

      try {
        return await this.callOpenAIRaw(provider, model, key, prompt, systemInstruction);
      } catch (firstErr) {
        // Attempt OpenAI-compatible model discovery fallback on 404/model errors
        if (/model|not found|does not exist|decommissioned/i.test(firstErr.message)) {
          try {
            const avail = await this.discoverModels(provider, key);
            for (const cand of avail.slice(0, 2)) {
              if (cand === model) continue;
              try {
                const txt = await this.callOpenAIRaw(provider, cand, key, prompt, systemInstruction);
                saveAIConfig({ provider, model: cand, apiKey: key });
                return txt;
              } catch {
                // try next
              }
            }
          } catch {
            // ignore
          }
        }
        throw firstErr;
      }
    },

    async ask(prompt, systemInstruction = "Bạn là giảng viên Sư phạm Tiếng Anh tại Đại học Đà Lạt. Hãy giải thích ngắn gọn, dễ hiểu bằng tiếng Việt kèm ví dụ tiếng Anh chuẩn lớp học.") {
      if (aiConfig.provider === "builtin" || !aiConfig.apiKey.trim()) {
        return LocalPedagogicalAI.answer(prompt);
      }
      try {
        return await this.askStrictExternal(prompt, systemInstruction);
      } catch (err) {
        const local = LocalPedagogicalAI.answer(prompt);
        return `⚠️ Không gọi được ${AI_PROVIDERS[aiConfig.provider].name} (${err.message}).\n\n⚡ Đã tự động chuyển sang AI Sư Phạm Nội Bộ trả lời thay:\n\n${local}`;
      }
    }
  };

  // ------------------------------------------------------------------------
  // 2. App State Manager & Shuffled Deck Engine
  // ------------------------------------------------------------------------
  const defaultState = {
    theme: "dark",
    xrayBlue: true,
    gridCollapsed: false,
    deckFilter: "all",
    shuffleOrder: true,
    xp: 0,
    streak: 0,
    solvedExercises: {},
    srsRatings: {}
  };

  let state = loadState();
  let shuffledDeckIds = [];

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("dlu_request_master_v1");
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
      // Ignore storage quota
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

  function markExerciseSolved(id, xp = 15) {
    if (!state.solvedExercises[id]) {
      state.solvedExercises[id] = true;
      addXP(xp, true);
    } else {
      addXP(5, true);
    }
  }

  function getAllVocabItems() {
    return [
      ...DATA.vocabulary.coreWords.map((v) => ({ ...v, category: "coreWords", catLabel: "Từ cốt lõi" })),
      ...DATA.vocabulary.phrasalVerbs.map((v) => ({ ...v, category: "phrasalVerbs", catLabel: "Phrasal Verb" })),
      ...DATA.vocabulary.prepositions.map((v) => ({ ...v, category: "prepositions", catLabel: "Cụm giới từ" }))
    ];
  }

  function getRawFilteredDeck() {
    const all = getAllVocabItems();
    if (state.deckFilter === "hardOnly") {
      const hard = all.filter((i) => state.srsRatings[i.id] === "hard");
      return hard.length ? hard : all;
    }
    if (state.deckFilter !== "all") {
      return all.filter((i) => i.category === state.deckFilter);
    }
    return all;
  }

  function rebuildShuffledOrder() {
    const raw = getRawFilteredDeck();
    const ids = raw.map((x) => x.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    shuffledDeckIds = ids;
  }

  function getActiveDeckItems() {
    const raw = getRawFilteredDeck();
    if (!state.shuffleOrder) return raw;
    if (!shuffledDeckIds.length || shuffledDeckIds.length !== raw.length) {
      rebuildShuffledOrder();
    }
    const map = new Map(raw.map((item) => [item.id, item]));
    const ordered = shuffledDeckIds.map((id) => map.get(id)).filter(Boolean);
    return ordered.length === raw.length ? ordered : raw;
  }

  function pickDifferentRandomIndex(currentIdx, len) {
    if (len <= 1) return 0;
    let next = currentIdx;
    while (next === currentIdx) {
      next = Math.floor(Math.random() * len);
    }
    return next;
  }

  // ------------------------------------------------------------------------
  // 3. Audio Engine (Web Speech API - Oxford UK Preferred)
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
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      const voice = this.getVoice();
      if (voice) utter.voice = voice;
      utter.lang = "en-GB";
      const speedEl = document.getElementById("voice-speed");
      utter.rate = rateOverride || (speedEl ? parseFloat(speedEl.value) : 1);
      window.speechSynthesis.speak(utter);
    }
  };

  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => AudioEngine.getVoice();
  }

  // ------------------------------------------------------------------------
  // 4. Text Utilities & Evaluators
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

  function removeVietnameseDiacritics(str) {
    return String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .trim();
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

  function maskEnglishPhrase(term) {
    return term
      .split("/")
      .map((part) =>
        part
          .trim()
          .split(/\s+/)
          .map((w) => (w.length <= 1 ? w : w[0] + " " + "_ ".repeat(w.length - 1).trim()))
          .join("   ")
      )
      .join(" / ");
  }

  function buildCharDiffHTML(userStr, targetStr) {
    const maxLen = Math.max(userStr.length, targetStr.length);
    let html = "";
    for (let i = 0; i < maxLen; i++) {
      const chT = targetStr[i] || "";
      const chU = userStr[i] || "";
      if (chT.toLowerCase() === chU.toLowerCase() && chT !== "") {
        html += `<span class="char-diff-ok">${escapeHTML(chT)}</span>`;
      } else if (chT !== "") {
        html += `<span class="char-diff-miss">${escapeHTML(chT)}</span>`;
      }
    }
    return html;
  }

  function highlightBlueGlue(sentence, blueParts = []) {
    if (!blueParts || !blueParts.length) return escapeHTML(sentence);
    let safe = escapeHTML(sentence);
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

  function levelBadgeClass(level) {
    if (level === "A1") return "badge-a1";
    if (level === "A2") return "badge-a2";
    if (level === "B1") return "badge-b1";
    if (level === "B1+") return "badge-b1plus";
    return "badge-b2";
  }

  function evaluateRequest(userInput, item) {
    const raw = (userInput || "").trim();
    if (!raw) {
      return { isCorrect: false, grammar: "Chưa nhập câu.", clarity: "Thiếu nội dung.", appropriateness: "Chưa xác định.", diffHtml: "" };
    }
    const acceptedList = item.acceptedAnswers && item.acceptedAnswers.length ? item.acceptedAnswers : [item.answer];
    const normUser = normalizeText(raw);
    const strippedUser = stripPunctuation(raw);

    let exactMatch = acceptedList.some((ans) => normalizeText(ans) === normUser || stripPunctuation(ans) === strippedUser);
    const requiresQuestion = Boolean(item.isQuestion || (item.prompt && item.prompt.includes("?")));
    const startsPoliteQ = /^(could|would|can|will|do)\s+you/i.test(raw);

    let grammarOk = true;
    let grammarNote = "Đúng cấu trúc động từ & từ hạn định.";
    if (/\bplease\s+to\b/i.test(raw)) {
      grammarOk = false;
      grammarNote = "Lỗi: Sau 'Please' dùng V(nguyên mẫu), không dùng 'to V'.";
    } else if (/\bwould\s+you\s+mind\s+to\b/i.test(raw)) {
      grammarOk = false;
      grammarNote = "Lỗi: Sau 'Would you mind' phải dùng V-ing.";
    }

    let appOk = true;
    let appNote = "Phù hợp giọng điệu giáo viên tiếng Anh tại trường học.";
    if (requiresQuestion && !startsPoliteQ) {
      appOk = false;
      appNote = "Đề có dấu '?' → bắt buộc dùng câu nghi vấn lịch sự (Could you / Would you...).";
    }

    const targetWords = item.answer.split(/\s+/);
    const userWordsSet = new Set(strippedUser.split(/\s+/));
    const diffHtml = targetWords
      .map((w) =>
        userWordsSet.has(stripPunctuation(w))
          ? `<span style="color:var(--accent-emerald); font-weight:700;">${escapeHTML(w)}</span>`
          : `<span class="glue-word">${escapeHTML(w)}</span>`
      )
      .join(" ");

    return {
      isCorrect: exactMatch && grammarOk && appOk,
      grammar: grammarNote,
      clarity: exactMatch ? "Đầy đủ ý nghĩa & các mảnh ghép xanh dương." : "Còn thiếu/khác một số từ nối/mạo từ/giới từ (xem chữ xanh).",
      appropriateness: appNote,
      diffHtml
    };
  }

  // ------------------------------------------------------------------------
  // 5. Global Stats & UI Chrome
  // ------------------------------------------------------------------------
  function updateGlobalStatsUI() {
    const allVocab = getAllVocabItems();
    const knownCount = allVocab.filter((v) => state.srsRatings[v.id] === "easy").length;
    const hardCount = allVocab.filter((v) => state.srsRatings[v.id] === "hard").length;
    const totalExercises =
      DATA.exercises.type1.length + DATA.exercises.type2.length + DATA.exercises.type3.length + DATA.exercises.type4.length;
    const solvedCount = Object.keys(state.solvedExercises).length;

    const pct = Math.min(100, Math.round(((knownCount + solvedCount) / (allVocab.length + totalExercises)) * 100));

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set("nav-xp", state.xp);
    set("nav-streak", state.streak);
    set("nav-known", knownCount);
    set("nav-hard", hardCount);
    set("opt-hard-count", hardCount);
    set("mastery-percent", `${pct}%`);
    const fill = document.getElementById("mastery-fill");
    if (fill) fill.style.width = `${pct}%`;

    const shBtn = document.getElementById("global-shuffle-toggle");
    if (shBtn) {
      shBtn.textContent = state.shuffleOrder ? "🔀 Thứ tự ngẫu nhiên: BẬT" : "🔀 Thứ tự ngẫu nhiên: TẮT";
      shBtn.classList.toggle("shuffle-active", state.shuffleOrder);
    }
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.textContent = state.theme === "dark" ? "🌙" : "☀️";
  }

  function applyXray() {
    document.body.classList.toggle("xray-off", !state.xrayBlue);
    const btn = document.getElementById("xray-toggle-btn");
    if (btn) btn.textContent = state.xrayBlue ? "💙 Tô xanh mảnh ghép: BẬT" : "🤍 Tô xanh mảnh ghép: TẮT";
  }

  // ------------------------------------------------------------------------
  // 6. Mode Router & Random Word Dispatcher
  // ------------------------------------------------------------------------
  const MODE_META = {
    m1: { cat: "GHI NHỚ", title: "Flashcard 2 chiều & Gõ từ kiểm tra chính tả", shortcut: "Space: Lật thẻ • Enter: Kiểm tra từ gõ / Thẻ tiếp" },
    m2: { cat: "LUYỆN TẬP", title: "Trắc nghiệm (30s mỗi câu)", shortcut: "Phím 1–4: Chọn đáp án • Enter: Câu tiếp" },
    m3: { cat: "NGHE", title: "Listening & Shadowing (Oxford UK)", shortcut: "Space: Nghe lại • Enter: Kiểm tra" },
    m4: { cat: "VIẾT", title: "Gõ nghĩa & Gõ từ Active Recall", shortcut: "Không cần gõ dấu • Enter: Kiểm tra / Câu tiếp" },
    m5: { cat: "VIẾT CÂU", title: "Viết câu yêu cầu theo gợi ý + AI Chấm", shortcut: "Enter: Kiểm tra 3 tiêu chí sư phạm" },
    m6: { cat: "TRÒ CHƠI", title: "Nối từ Speed Match (5 Tim • 90s)", shortcut: "Chọn cặp Anh (IPA) ↔ Việt" },
    m7: { cat: "TRÒ CHƠI", title: "Minigame Đa Dạng (Đoán chữ • Xếp câu • 60s Đúng/Sai)", shortcut: "Chơi nhanh để ghi nhớ cụm từ & ngữ pháp" },
    m8: { cat: "CẤU TRÚC", title: "Ngữ pháp, 16 Câu mẫu & Trọn bộ Đề 47 câu A1–B2", shortcut: "Toàn bộ lý thuyết, giải đáp & 4 dạng bài tập" },
    m9: { cat: "AI TUTOR", title: "Trợ lý AI (Nội bộ 0đ + Gemini / Groq / Mistral / DeepSeek)", shortcut: "Sinh đề từ hộp Quên & giải thích ngữ pháp tức thì" },
    m10: { cat: "ĐÓNG VAI", title: "Speaking & AI Classroom Roleplay", shortcut: "Thu âm Micro hoặc đối thoại đóng vai giáo viên" },
    m11: { cat: "TỔNG HỢP", title: "Bài kiểm tra Tổng hợp (Thang điểm 10)", shortcut: "Reading • Writing • Listening • Error Fix" },
    m12: { cat: "TRA CỨU", title: "Sổ từ vựng & Cụm từ IPA Oxford UK (40 mục)", shortcut: "Tìm kiếm, lọc Leitner & phân tích AI" }
  };

  let activeMode = "m1";
  let activeIntervals = [];

  function clearAllTimers() {
    activeIntervals.forEach((id) => clearInterval(id));
    activeIntervals = [];
  }

  function switchMode(modeId) {
    clearAllTimers();
    activeMode = modeId;
    document.querySelectorAll("#modes-grid .mode-card").forEach((c) => {
      c.classList.toggle("active", c.dataset.mode === modeId);
    });
    const meta = MODE_META[modeId];
    document.getElementById("ws-cat-badge").textContent = meta.cat;
    document.getElementById("ws-title").textContent = meta.title;
    document.getElementById("ws-shortcut-note").textContent = meta.shortcut;
    renderActiveMode();
  }

  const mState = {
    m1Idx: 0,
    m1Flipped: false,
    m1Dir: "en2vn",
    m1MaskWord: true,
    m1TypedVal: "",
    m1TypeChecked: false,
    m1TypeResult: null,
    m2Mode: "en2vn",
    m2Idx: 0,
    m2Answered: false,
    m2Timer: 30,
    m2Options: [],
    m2CorrectIdx: 0,
    m2CurrentQ: null,
    m3Mode: "word",
    m3Idx: 0,
    m4Dir: "en2vn",
    m4Idx: 0,
    m5Idx: 0,
    m5HintLevel: 0,
    m6Cards: [],
    m6Selected: null,
    m6Hearts: 5,
    m6Time: 90,
    m6Matched: 0,
    m6Finished: false,
    m7Tab: "scramble",
    m7Idx: 0,
    m7Chosen: [],
    m7Pool: [],
    m7TfScore: 0,
    m7TfTime: 60,
    m7TfActive: false,
    m7TfCurrent: null,
    m8Tab: "formulas",
    m8WbType: "type1",
    m9History: [],
    m10Idx: 0,
    m10Listening: false,
    m10Transcript: "",
    m11Questions: [],
    m11Answers: {},
    m11Submitted: false,
    m12Search: "",
    m12Cat: "all"
  };

  function jumpToRandomInCurrentMode() {
    const deckLen = getActiveDeckItems().length;
    if (activeMode === "m1") {
      mState.m1Idx = pickDifferentRandomIndex(mState.m1Idx % deckLen, deckLen);
      mState.m1Flipped = false;
      mState.m1TypedVal = "";
      mState.m1TypeChecked = false;
      mState.m1TypeResult = null;
    } else if (activeMode === "m2") {
      const len = mState.m2Mode === "context" ? DATA.exercises.type2.length : deckLen;
      mState.m2Idx = pickDifferentRandomIndex(mState.m2Idx % len, len);
      renderMode2Quiz(document.getElementById("workspace-stage"), true);
      return;
    } else if (activeMode === "m3") {
      mState.m3Idx = pickDifferentRandomIndex(mState.m3Idx % deckLen, deckLen);
    } else if (activeMode === "m4") {
      mState.m4Idx = pickDifferentRandomIndex(mState.m4Idx % deckLen, deckLen);
    } else if (activeMode === "m5") {
      const poolLen = DATA.sample16Sentences.length + DATA.exercises.type1.length;
      mState.m5Idx = pickDifferentRandomIndex(mState.m5Idx % poolLen, poolLen);
      mState.m5HintLevel = 0;
    } else if (activeMode === "m6") {
      renderMode6SpeedMatch(document.getElementById("workspace-stage"), true);
      return;
    } else if (activeMode === "m7") {
      const len = mState.m7Tab === "unjumble" ? DATA.sample16Sentences.length : deckLen;
      mState.m7Idx = pickDifferentRandomIndex(mState.m7Idx % len, len);
      mState.m7Chosen = [];
      mState.m7Pool = [];
    } else if (activeMode === "m10") {
      mState.m10Idx = pickDifferentRandomIndex(mState.m10Idx % DATA.speakingScenarios.length, DATA.speakingScenarios.length);
      mState.m10Transcript = "";
    } else {
      rebuildShuffledOrder();
      switchMode("m1");
      return;
    }
    renderActiveMode();
  }

  function renderActiveMode() {
    const stage = document.getElementById("workspace-stage");
    if (!stage) return;
    clearAllTimers();

    const handlers = {
      m1: renderMode1Flashcard,
      m2: renderMode2Quiz,
      m3: renderMode3Listening,
      m4: renderMode4ActiveRecall,
      m5: renderMode5SentenceWrite,
      m6: renderMode6SpeedMatch,
      m7: renderMode7Minigames,
      m8: renderMode8GrammarAndWorkbook,
      m9: renderMode9AITutor,
      m10: renderMode10SpeakingRoleplay,
      m11: renderMode11Exam,
      m12: renderMode12Dictionary
    };
    (handlers[activeMode] || renderMode1Flashcard)(stage);
  }

  // ========================================================================
  // MODE 1: Flashcard 2 chiều + Gõ từ kiểm tra chính tả + Che từ + Từ ngẫu nhiên
  // ========================================================================
  function renderMode1Flashcard(stage) {
    const deck = getActiveDeckItems();
    const idx = mState.m1Idx % deck.length;
    const item = deck[idx];
    const rating = state.srsRatings[item.id] || "";
    const isEnFirst = mState.m1Dir === "en2vn";
    const maskedHint = maskEnglishPhrase(item.term);

    stage.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px;">
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <span class="badge badge-b1">${escapeHTML(item.catLabel)}</span>
          <strong>Thẻ ${idx + 1} / ${deck.length}</strong>
          <button class="btn btn-sm btn-random" id="m1-random-btn">🎲 Từ ngẫu nhiên</button>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-sm ${mState.m1MaskWord ? "btn-primary" : "btn-secondary"}" id="m1-mask-toggle" title="Che từ tiếng Anh ở mặt trước để bạn nhớ và tự gõ lại">
            ${mState.m1MaskWord ? "🙈 Đang che từ để gõ" : "👁️ Đang hiện từ EN"}
          </button>
          <button class="btn btn-sm ${isEnFirst ? "btn-primary" : "btn-secondary"}" id="m1-dir-en">EN → VN</button>
          <button class="btn btn-sm ${!isEnFirst ? "btn-primary" : "btn-secondary"}" id="m1-dir-vn">VN → EN</button>
        </div>
      </div>

      <div class="flashcard-perspective">
        <div class="flashcard-3d ${mState.m1Flipped ? "flipped" : ""}" id="m1-card">
          <div class="flashcard-face">
            <span class="badge badge-a2" style="margin-bottom:10px;">${escapeHTML(item.pos)}</span>
            ${
              isEnFirst
                ? mState.m1MaskWord
                  ? `<div class="masked-term-pill">${escapeHTML(maskedHint)}</div>
                     <div class="mono" style="color:var(--accent-orange); font-size:0.95rem; margin-bottom:6px;">${escapeHTML(item.ipa)}</div>
                     <div style="font-size:1.12rem; font-weight:700; color:var(--text-main);">Nghĩa: ${escapeHTML(item.meaning)}</div>`
                  : `<div style="font-size:2rem; font-weight:800; margin-bottom:6px;">${escapeHTML(item.term)}</div>
                     <div class="mono" style="color:var(--accent-orange); font-size:1rem;">${escapeHTML(item.ipa)}</div>`
                : `<div style="font-size:1.45rem; font-weight:800; color:var(--accent-orange); margin-bottom:6px;">${escapeHTML(item.meaning)}</div>
                   <div class="mono" style="color:var(--accent-cyan); font-size:0.88rem;">${escapeHTML(item.ipa)}</div>`
            }
            <p style="font-size:0.78rem; color:var(--text-muted); margin-top:14px;">
              Gõ từ vào ô bên dưới để nhớ sâu • Hoặc bấm thẻ / Space để lật
            </p>
          </div>
          <div class="flashcard-face flashcard-back">
            <div style="font-size:1.55rem; font-weight:800; margin-bottom:4px;">${escapeHTML(item.term)}</div>
            <div class="mono" style="color:var(--accent-cyan); margin-bottom:6px;">${escapeHTML(item.ipa)}</div>
            <div style="font-size:1.15rem; font-weight:800; color:var(--accent-orange); margin-bottom:10px;">${escapeHTML(item.meaning)}</div>
            <div style="font-size:0.92rem; font-weight:600; margin-bottom:12px;">"${escapeHTML(item.example)}"</div>
            <button class="btn btn-sm btn-ghost" id="m1-speak-ex">🔊 Nghe câu ví dụ UK</button>
          </div>
        </div>
      </div>

      <!-- Flashcard Typing & Active Recall Box -->
      <div class="flashcard-typing-box">
        <div style="font-size:0.78rem; color:var(--text-secondary); margin-bottom:8px; font-weight:700;">
          ✍️ Luyện gõ từ ngay trên Flashcard (${isEnFirst || mState.m1MaskWord ? "Gõ từ / cụm từ tiếng Anh" : "Gõ nghĩa tiếng Việt hoặc từ tiếng Anh"}):
        </div>
        <div class="flashcard-typing-row">
          <input
            type="text"
            id="m1-type-input"
            class="answer-input"
            style="flex:1; padding:10px 14px;"
            value="${escapeHTML(mState.m1TypedVal)}"
            placeholder="${isEnFirst || mState.m1MaskWord ? "Gõ từ tiếng Anh (VD: take out, at the top of...)" : "Gõ từ tiếng Anh hoặc nghĩa tiếng Việt..."}"
            autocomplete="off"
          />
          <button class="btn btn-primary" id="m1-type-check">✅ Kiểm tra (Enter)</button>
        </div>
        <div id="m1-type-feedback">
          ${mState.m1TypeResult || ""}
        </div>
      </div>

      <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-bottom:14px;">
        <button class="btn btn-sm btn-secondary" id="m1-prev">⬅️ Thẻ trước</button>
        <button class="btn btn-sm btn-ghost" id="m1-speak-term">🔊 Nghe từ</button>
        <button class="btn btn-sm btn-primary" id="m1-next">Thẻ tiếp ➡️</button>
      </div>

      <div style="max-width:480px; margin:0 auto;">
        <div class="srs-bar">
          <span style="font-size:0.76rem; color:var(--text-secondary);">Hộp Leitner:</span>
          <button class="srs-btn easy ${rating === "easy" ? "active" : ""}" data-m1-srs="easy">✅ Thuộc</button>
          <button class="srs-btn medium ${rating === "medium" ? "active" : ""}" data-m1-srs="medium">⏳ Đang nhớ</button>
          <button class="srs-btn hard ${rating === "hard" ? "active" : ""}" data-m1-srs="hard">🔁 Quên</button>
        </div>
      </div>
    `;

    const typeInput = document.getElementById("m1-type-input");
    const resetCardInput = () => {
      mState.m1TypedVal = "";
      mState.m1TypeChecked = false;
      mState.m1TypeResult = null;
      mState.m1Flipped = false;
    };

    function checkTypedFlashcard() {
      const raw = typeInput.value.trim();
      if (!raw) return;
      if (mState.m1TypeChecked && mState.m1TypedVal === raw) {
        // Second Enter moves to next card!
        mState.m1Idx = (idx + 1) % deck.length;
        resetCardInput();
        renderMode1Flashcard(stage);
        document.getElementById("m1-type-input")?.focus();
        return;
      }

      mState.m1TypedVal = raw;
      mState.m1TypeChecked = true;
      const cleanUser = stripPunctuation(raw);
      const enVariants = item.term.split("/").map((t) => stripPunctuation(t));
      const matchedEn = enVariants.includes(cleanUser);

      const cleanVnUser = removeVietnameseDiacritics(raw);
      const vnVariants = removeVietnameseDiacritics(item.meaning)
        .replace(/\(.*?\)/g, "")
        .split(/[,;/•]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const matchedVn = !isEnFirst && vnVariants.some((v) => v === cleanVnUser || (cleanVnUser.length >= 4 && v.includes(cleanVnUser)));

      const primaryEn = item.term.split("/")[0].trim();
      const diffHtml = buildCharDiffHTML(raw, primaryEn);

      if (matchedEn || matchedVn) {
        addXP(10, true);
        AudioEngine.speak(primaryEn);
        mState.m1Flipped = true;
        mState.m1TypeResult = `<div class="feedback-box success">🎉 <strong>Gõ chính xác (+10 XP)!</strong> ${escapeHTML(item.term)} — <em>${escapeHTML(item.meaning)}</em><div style="font-size:0.78rem; margin-top:4px;">Nhấn Enter lần nữa để qua thẻ tiếp theo!</div></div>`;
      } else {
        addXP(0, false);
        mState.m1Flipped = true;
        mState.m1TypeResult = `<div class="feedback-box warn">🔎 So sánh chính tả từng chữ: <span class="mono">${diffHtml}</span><br/>Đáp án chuẩn: <strong>${escapeHTML(item.term)}</strong> (${escapeHTML(item.meaning)})</div>`;
      }
      renderMode1Flashcard(stage);
      document.getElementById("m1-type-input")?.focus();
    }

    document.getElementById("m1-type-check").onclick = checkTypedFlashcard;
    typeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        checkTypedFlashcard();
      }
    });

    document.getElementById("m1-mask-toggle").onclick = () => {
      mState.m1MaskWord = !mState.m1MaskWord;
      renderMode1Flashcard(stage);
    };
    document.getElementById("m1-random-btn").onclick = () => {
      mState.m1Idx = pickDifferentRandomIndex(idx, deck.length);
      resetCardInput();
      renderMode1Flashcard(stage);
    };
    document.getElementById("m1-dir-en").onclick = () => { mState.m1Dir = "en2vn"; resetCardInput(); renderMode1Flashcard(stage); };
    document.getElementById("m1-dir-vn").onclick = () => { mState.m1Dir = "vn2en"; resetCardInput(); renderMode1Flashcard(stage); };
    document.getElementById("m1-card").onclick = (e) => {
      if (e.target.closest("button")) return;
      mState.m1Flipped = !mState.m1Flipped;
      renderMode1Flashcard(stage);
    };
    document.getElementById("m1-speak-term").onclick = () => AudioEngine.speak(item.term.split("/")[0].trim());
    document.getElementById("m1-speak-ex").onclick = (e) => { e.stopPropagation(); AudioEngine.speak(item.example); };
    document.getElementById("m1-prev").onclick = () => { mState.m1Idx = (idx - 1 + deck.length) % deck.length; resetCardInput(); renderMode1Flashcard(stage); };
    document.getElementById("m1-next").onclick = () => { mState.m1Idx = (idx + 1) % deck.length; resetCardInput(); renderMode1Flashcard(stage); };
    stage.querySelectorAll("[data-m1-srs]").forEach((b) => {
      b.onclick = () => {
        state.srsRatings[item.id] = b.dataset.m1Srs;
        if (b.dataset.m1Srs === "easy") addXP(5, true);
        else saveState();
        mState.m1Idx = (idx + 1) % deck.length;
        resetCardInput();
        renderMode1Flashcard(stage);
      };
    });
  }

  // ========================================================================
  // MODE 2: Trắc nghiệm (30s mỗi câu, phím 1–4, Từ ngẫu nhiên)
  // ========================================================================
  function buildM2Question() {
    const deck = getActiveDeckItems();
    const all = getAllVocabItems();
    mState.m2Answered = false;
    mState.m2Timer = 30;

    if (mState.m2Mode === "context") {
      const q = DATA.exercises.type2[mState.m2Idx % DATA.exercises.type2.length];
      const blank = q.blanks[0];
      const opts = [...blank.options].sort(() => Math.random() - 0.5);
      mState.m2CurrentQ = {
        prompt: q.template,
        correctText: blank.answer,
        explanation: q.explanation,
        speakText: q.template.replace("____", blank.answer)
      };
      mState.m2Options = opts;
      mState.m2CorrectIdx = opts.indexOf(blank.answer);
      return;
    }

    const target = deck[mState.m2Idx % deck.length];
    const distractors = all.filter((x) => x.id !== target.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const pool = [target, ...distractors].sort(() => Math.random() - 0.5);

    if (mState.m2Mode === "en2vn") {
      mState.m2CurrentQ = {
        prompt: `${target.term}  (${target.ipa})`,
        sub: target.example,
        correctText: target.meaning,
        explanation: `Ví dụ: ${target.example}`,
        speakText: target.term.split("/")[0].trim(),
        vocabId: target.id
      };
      mState.m2Options = pool.map((p) => p.meaning);
    } else {
      mState.m2CurrentQ = {
        prompt: target.meaning,
        sub: "Chọn từ / cụm từ tiếng Anh tương ứng",
        correctText: target.term,
        explanation: `${target.ipa} — ${target.example}`,
        speakText: target.example,
        vocabId: target.id
      };
      mState.m2Options = pool.map((p) => p.term);
    }
    mState.m2CorrectIdx = pool.indexOf(target);
  }

  function renderMode2Quiz(stage, rebuild = true) {
    if (rebuild || !mState.m2CurrentQ) buildM2Question();
    const q = mState.m2CurrentQ;

    stage.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px;">
        <div class="tabs-bar" style="margin-bottom:0;">
          <button class="btn btn-sm ${mState.m2Mode === "en2vn" ? "btn-primary" : "btn-secondary"}" data-m2-mode="en2vn">Từ → Nghĩa</button>
          <button class="btn btn-sm ${mState.m2Mode === "vn2en" ? "btn-primary" : "btn-secondary"}" data-m2-mode="vn2en">Nghĩa → Từ</button>
          <button class="btn btn-sm ${mState.m2Mode === "context" ? "btn-primary" : "btn-secondary"}" data-m2-mode="context">Ngữ cảnh điền từ (Dạng 2)</button>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <button class="btn btn-sm btn-random" id="m2-random-btn">🎲 Từ ngẫu nhiên</button>
          <div class="pill-stat" id="m2-timer-pill">⏱️ <strong id="m2-sec">${mState.m2Timer}</strong>s</div>
        </div>
      </div>

      <div class="prompt-display">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
          <div>
            <div style="font-size:1.2rem; font-weight:800;">${escapeHTML(q.prompt)}</div>
            ${q.sub ? `<div style="font-size:0.84rem; color:var(--text-secondary); margin-top:4px;">${escapeHTML(q.sub)}</div>` : ""}
          </div>
          <button class="icon-btn" id="m2-speak-btn">🔊</button>
        </div>
      </div>

      <div class="quiz-options-grid" id="m2-options">
        ${mState.m2Options
          .map(
            (opt, i) => `
          <button class="quiz-opt-btn" data-m2-pick="${i}">
            <span class="key-num">${i + 1}</span>
            <span>${escapeHTML(opt)}</span>
          </button>`
          )
          .join("")}
      </div>

      <div id="m2-feedback"></div>
      <div style="display:flex; justify-content:flex-end; margin-top:14px;">
        <button class="btn btn-primary" id="m2-next-btn">Câu tiếp (Enter) ➡️</button>
      </div>
    `;

    const secEl = document.getElementById("m2-sec");
    const timerId = setInterval(() => {
      if (mState.m2Answered) return;
      mState.m2Timer -= 1;
      if (secEl) secEl.textContent = Math.max(0, mState.m2Timer);
      if (mState.m2Timer <= 0) {
        clearInterval(timerId);
        pickM2Option(-1);
      }
    }, 1000);
    activeIntervals.push(timerId);

    function pickM2Option(idx) {
      if (mState.m2Answered) return;
      mState.m2Answered = true;
      stage.querySelectorAll("[data-m2-pick]").forEach((b, i) => {
        b.disabled = true;
        if (i === mState.m2CorrectIdx) b.classList.add("correct");
        else if (i === idx) b.classList.add("wrong");
      });
      const fb = document.getElementById("m2-feedback");
      if (idx === mState.m2CorrectIdx) {
        addXP(15, true);
        AudioEngine.speak(q.speakText);
        fb.innerHTML = `<div class="feedback-box success">✅ <strong>Chính xác (+15 XP)!</strong> ${escapeHTML(q.explanation)}</div>`;
      } else {
        addXP(0, false);
        if (q.vocabId) state.srsRatings[q.vocabId] = "hard";
        saveState();
        fb.innerHTML = `<div class="feedback-box error">❌ ${idx === -1 ? "Hết 30 giây!" : "Chưa chính xác."} Đáp án đúng: <strong>${escapeHTML(q.correctText)}</strong> — ${escapeHTML(q.explanation)}</div>`;
      }
    }

    stage.querySelectorAll("[data-m2-pick]").forEach((b) => {
      b.onclick = () => pickM2Option(Number(b.dataset.m2Pick));
    });
    stage.querySelectorAll("[data-m2-mode]").forEach((b) => {
      b.onclick = () => { mState.m2Mode = b.dataset.m2Mode; mState.m2Idx = 0; renderMode2Quiz(stage, true); };
    });
    document.getElementById("m2-random-btn").onclick = jumpToRandomInCurrentMode;
    document.getElementById("m2-speak-btn").onclick = () => AudioEngine.speak(q.speakText);
    document.getElementById("m2-next-btn").onclick = () => {
      mState.m2Idx += 1;
      renderMode2Quiz(stage, true);
    };
  }

  // ========================================================================
  // MODE 3: Listening (Nghe gõ từ / Điền khuyết / Chép chính tả & Shadowing)
  // ========================================================================
  function renderMode3Listening(stage) {
    const deck = getActiveDeckItems();
    const idx = mState.m3Idx % deck.length;
    const item = deck[idx];
    const cleanTerm = item.term.split("/")[0].trim();
    const maskedSentence = item.example.replace(new RegExp(escapeRegex(cleanTerm), "i"), "________");

    stage.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px;">
        <div class="tabs-bar" style="margin-bottom:0;">
          <button class="btn btn-sm ${mState.m3Mode === "word" ? "btn-primary" : "btn-secondary"}" data-m3-m="word">Nghe &amp; gõ từ</button>
          <button class="btn btn-sm ${mState.m3Mode === "gap" ? "btn-primary" : "btn-secondary"}" data-m3-m="gap">Nghe câu điền khuyết</button>
          <button class="btn btn-sm ${mState.m3Mode === "dict" ? "btn-primary" : "btn-secondary"}" data-m3-m="dict">Chép chính tả &amp; Shadowing</button>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <button class="btn btn-sm btn-random" id="m3-random-btn">🎲 Từ ngẫu nhiên</button>
          <span>Mục ${idx + 1} / ${deck.length}</span>
        </div>
      </div>

      <div class="card" style="text-align:center; margin-bottom:16px;">
        <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-bottom:12px;">
          <button class="btn btn-primary" id="m3-play">🔊 Nghe giọng Anh-Anh (1.0x)</button>
          <button class="btn btn-secondary" id="m3-play-slow">🐢 Nghe chậm (0.75x)</button>
        </div>
        ${
          mState.m3Mode === "word"
            ? `<div>Gợi ý chữ cái đầu: <span class="mono" style="color:var(--accent-orange); font-weight:800;">${escapeHTML(cleanTerm[0])}___ (${cleanTerm.length} ký tự)</span> — Nghĩa: <em>${escapeHTML(item.meaning)}</em></div>`
            : mState.m3Mode === "gap"
            ? `<div style="font-size:1.08rem; font-weight:700;">${escapeHTML(maskedSentence)}</div>`
            : `<div style="color:var(--accent-cyan);">Chép chính tả nguyên văn câu ví dụ lớp học và đọc nhại theo (Shadowing)!</div>`
        }
      </div>

      <input type="text" id="m3-input" class="answer-input" placeholder="Gõ đáp án bạn nghe được..." autocomplete="off" />
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;">
        <button class="btn btn-primary" id="m3-check">✅ Kiểm tra</button>
        <button class="btn btn-secondary" id="m3-reveal">👁️ Hiện đáp án &amp; IPA</button>
        <button class="btn btn-secondary" id="m3-next" style="margin-left:auto;">Câu tiếp ➡️</button>
      </div>
      <div id="m3-feedback"></div>
    `;

    const speakTarget = mState.m3Mode === "word" ? cleanTerm : item.example;
    document.getElementById("m3-play").onclick = () => AudioEngine.speak(speakTarget, 1.0);
    document.getElementById("m3-play-slow").onclick = () => AudioEngine.speak(speakTarget, 0.75);
    document.getElementById("m3-random-btn").onclick = jumpToRandomInCurrentMode;

    stage.querySelectorAll("[data-m3-m]").forEach((b) => {
      b.onclick = () => { mState.m3Mode = b.dataset.m3M; renderMode3Listening(stage); };
    });

    const input = document.getElementById("m3-input");
    const fb = document.getElementById("m3-feedback");
    function checkM3() {
      const user = stripPunctuation(input.value);
      const validTargets =
        mState.m3Mode === "dict"
          ? [stripPunctuation(item.example)]
          : item.term.split("/").map((t) => stripPunctuation(t));
      if (validTargets.includes(user)) {
        addXP(15, true);
        fb.innerHTML = `<div class="feedback-box success">🎧 <strong>Chính xác (+15 XP)!</strong> ${escapeHTML(item.term)} (${escapeHTML(item.ipa)})<br/>Câu đầy đủ: <em>${escapeHTML(item.example)}</em></div>`;
      } else {
        addXP(0, false);
        fb.innerHTML = `<div class="feedback-box warn">🔎 Chưa khớp. Đáp án: <strong>${escapeHTML(mState.m3Mode === "dict" ? item.example : item.term)}</strong></div>`;
      }
    }
    document.getElementById("m3-check").onclick = checkM3;
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") checkM3(); });
    document.getElementById("m3-reveal").onclick = () => {
      fb.innerHTML = `<div class="feedback-box warn">📝 <strong>${escapeHTML(item.term)}</strong> (${escapeHTML(item.ipa)}) — ${escapeHTML(item.meaning)}<br/>"${escapeHTML(item.example)}"</div>`;
    };
    document.getElementById("m3-next").onclick = () => { mState.m3Idx += 1; renderMode3Listening(stage); };
  }

  // ========================================================================
  // MODE 4: Gõ nghĩa & Gõ từ Active Recall
  // ========================================================================
  function renderMode4ActiveRecall(stage) {
    const deck = getActiveDeckItems();
    const idx = mState.m4Idx % deck.length;
    const item = deck[idx];
    const isEn2Vn = mState.m4Dir === "en2vn";

    stage.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px;">
        <div class="tabs-bar" style="margin-bottom:0;">
          <button class="btn btn-sm ${isEn2Vn ? "btn-primary" : "btn-secondary"}" id="m4-en2vn">Anh → Việt (Không cần dấu)</button>
          <button class="btn btn-sm ${!isEn2Vn ? "btn-primary" : "btn-secondary"}" id="m4-vn2en">Việt → Anh (Gõ cụm từ)</button>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <button class="btn btn-sm btn-random" id="m4-random-btn">🎲 Từ ngẫu nhiên</button>
          <span>Thẻ ${idx + 1} / ${deck.length}</span>
        </div>
      </div>

      <div class="prompt-display">
        <span class="badge badge-a2" style="margin-bottom:8px;">${escapeHTML(item.pos)}</span>
        ${
          isEn2Vn
            ? `<div style="font-size:1.55rem; font-weight:800;">${escapeHTML(item.term)}</div>
               <div class="mono" style="color:var(--accent-cyan); font-size:0.9rem;">${escapeHTML(item.ipa)}</div>`
            : `<div style="font-size:1.35rem; font-weight:800;">${escapeHTML(item.meaning)}</div>
               <div class="mono" style="color:var(--accent-cyan); font-size:0.86rem; margin-top:4px;">Gợi ý phát âm: ${escapeHTML(item.ipa)}</div>`
        }
      </div>

      <input type="text" id="m4-input" class="answer-input" placeholder="${
        isEn2Vn ? "Gõ nghĩa tiếng Việt (VD: nop bai, lay ra... không cần dấu)..." : "Gõ từ hoặc cụm động từ tiếng Anh..."
      }" autocomplete="off" />

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;">
        <button class="btn btn-primary" id="m4-check">✅ Kiểm tra</button>
        <button class="btn btn-ghost" id="m4-speak">🔊 Nghe từ</button>
        <button class="btn btn-secondary" id="m4-next" style="margin-left:auto;">Câu tiếp ➡️</button>
      </div>
      <div id="m4-feedback"></div>
    `;

    document.getElementById("m4-random-btn").onclick = jumpToRandomInCurrentMode;
    document.getElementById("m4-en2vn").onclick = () => { mState.m4Dir = "en2vn"; renderMode4ActiveRecall(stage); };
    document.getElementById("m4-vn2en").onclick = () => { mState.m4Dir = "vn2en"; renderMode4ActiveRecall(stage); };
    document.getElementById("m4-speak").onclick = () => AudioEngine.speak(item.term.split("/")[0].trim());

    const input = document.getElementById("m4-input");
    const fb = document.getElementById("m4-feedback");
    function checkM4() {
      const raw = input.value.trim();
      if (!raw) return;
      let ok = false;
      if (isEn2Vn) {
        const cleanUser = removeVietnameseDiacritics(raw);
        const variants = removeVietnameseDiacritics(item.meaning)
          .replace(/\(.*?\)/g, "")
          .split(/[,;/•]/)
          .map((s) => s.trim())
          .filter(Boolean);
        ok = variants.some((v) => v === cleanUser || (cleanUser.length >= 4 && v.includes(cleanUser)));
      } else {
        const cleanUser = stripPunctuation(raw);
        const enVariants = item.term.split("/").map((s) => stripPunctuation(s));
        ok = enVariants.includes(cleanUser);
      }
      if (ok) {
        addXP(15, true);
        AudioEngine.speak(item.term.split("/")[0].trim());
        fb.innerHTML = `<div class="feedback-box success">🎉 <strong>Chính xác (+15 XP)!</strong> ${escapeHTML(item.term)} = ${escapeHTML(item.meaning)}<br/>Ví dụ: <em>${escapeHTML(item.example)}</em></div>`;
      } else {
        addXP(0, false);
        fb.innerHTML = `<div class="feedback-box warn">🔎 Chưa khớp. Đáp án chuẩn: <strong>${escapeHTML(isEn2Vn ? item.meaning : item.term)}</strong></div>`;
      }
    }
    document.getElementById("m4-check").onclick = checkM4;
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") checkM4(); });
    document.getElementById("m4-next").onclick = () => { mState.m4Idx += 1; renderMode4ActiveRecall(stage); };
  }

  // ========================================================================
  // MODE 5: Viết câu yêu cầu + Hiện dần từ gợi ý + AI Chấm 3 tiêu chí
  // ========================================================================
  function renderMode5SentenceWrite(stage) {
    const pool = [
      ...DATA.sample16Sentences.map((s) => ({
        id: `s16-${s.num}`,
        level: s.num <= 5 ? "A2" : s.num <= 12 ? "B1" : "B2",
        prompt: s.prompt,
        answer: s.sentence,
        acceptedAnswers: [s.sentence],
        blueTokens: s.blueParts,
        isQuestion: s.prompt.includes("?"),
        explanation: s.note,
        vi: s.vi
      })),
      ...DATA.exercises.type1
    ];
    const item = pool[mState.m5Idx % pool.length];
    const words = item.answer.split(/\s+/);
    const revealedHint = mState.m5HintLevel > 0 ? words.slice(0, mState.m5HintLevel).join(" ") + " ..." : "";

    stage.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px;">
        <div style="display:flex; gap:8px; align-items:center;">
          <span class="badge ${levelBadgeClass(item.level)}">${escapeHTML(item.level)}</span>
          <strong>Câu ${(mState.m5Idx % pool.length) + 1} / ${pool.length}</strong>
          <button class="btn btn-sm btn-random" id="m5-random-btn">🎲 Câu ngẫu nhiên</button>
        </div>
        <button class="btn btn-sm btn-ghost" id="m5-speak">🔊 Nghe câu mẫu</button>
      </div>

      <div class="prompt-display">
        <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:4px;">Từ gợi ý đề bài (Chú ý dấu '?' ở cuối nếu là câu hỏi lịch sự):</div>
        <div class="mono-prompt">${escapeHTML(item.prompt)}</div>
        ${item.vi ? `<div style="font-size:0.84rem; color:var(--text-secondary); margin-top:6px;">🇻🇳 Gợi ý nghĩa: ${escapeHTML(item.vi)}</div>` : ""}
        ${revealedHint ? `<div style="margin-top:8px; color:var(--accent-cyan); font-weight:700;">💡 Đã mở gợi ý: ${escapeHTML(revealedHint)}</div>` : ""}
      </div>

      <input type="text" id="m5-input" class="answer-input" placeholder="Viết câu yêu cầu hoàn chỉnh bằng tiếng Anh..." autocomplete="off" />

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;">
        <button class="btn btn-primary" id="m5-check">✅ Kiểm tra 3 tiêu chí</button>
        <button class="btn btn-secondary" id="m5-hint">💡 Hiện thêm 1 từ (${mState.m5HintLevel}/${words.length})</button>
        <button class="btn btn-ai" id="m5-ai-grade">🤖 Nhờ AI chấm &amp; nhận xét</button>
        <div style="display:flex; gap:8px; margin-left:auto;">
          <button class="btn btn-secondary" id="m5-prev">⬅️ Câu trước</button>
          <button class="btn btn-secondary" id="m5-next">Câu tiếp ➡️</button>
        </div>
      </div>
      <div id="m5-feedback"></div>
      <div id="m5-ai-box"></div>
    `;

    const input = document.getElementById("m5-input");
    const fb = document.getElementById("m5-feedback");
    function checkM5() {
      const res = evaluateRequest(input.value, item);
      if (res.isCorrect) {
        markExerciseSolved(item.id, 20);
        AudioEngine.speak(item.answer);
      } else {
        addXP(0, false);
      }
      fb.innerHTML = `
        <div class="feedback-box ${res.isCorrect ? "success" : "warn"}">
          <div style="font-weight:800; margin-bottom:6px;">${res.isCorrect ? "🎉 Tuyệt vời! Đạt chuẩn 3 tiêu chí sư phạm!" : "🔎 Đối chiếu từng từ:"}</div>
          <div style="margin-bottom:8px;">${res.diffHtml}</div>
          <div style="font-size:0.84rem; color:var(--text-secondary);">
            Đáp án chuẩn: <strong>${highlightBlueGlue(item.answer, item.blueTokens)}</strong><br/>
            • <strong>Grammar:</strong> ${escapeHTML(res.grammar)}<br/>
            • <strong>Clarity:</strong> ${escapeHTML(res.clarity)}<br/>
            • <strong>Appropriateness:</strong> ${escapeHTML(res.appropriateness)}
          </div>
        </div>`;
    }

    document.getElementById("m5-random-btn").onclick = jumpToRandomInCurrentMode;
    document.getElementById("m5-check").onclick = checkM5;
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") checkM5(); });
    document.getElementById("m5-speak").onclick = () => AudioEngine.speak(item.answer);
    document.getElementById("m5-hint").onclick = () => {
      if (mState.m5HintLevel < words.length) mState.m5HintLevel += 1;
      renderMode5SentenceWrite(stage);
    };
    document.getElementById("m5-prev").onclick = () => {
      mState.m5Idx = (mState.m5Idx - 1 + pool.length) % pool.length;
      mState.m5HintLevel = 0;
      renderMode5SentenceWrite(stage);
    };
    document.getElementById("m5-next").onclick = () => {
      mState.m5Idx = (mState.m5Idx + 1) % pool.length;
      mState.m5HintLevel = 0;
      renderMode5SentenceWrite(stage);
    };

    document.getElementById("m5-ai-grade").onclick = async () => {
      const box = document.getElementById("m5-ai-box");
      const userText = input.value.trim() || "(Học viên chưa nhập câu, hãy hướng dẫn cách ghép)";
      box.innerHTML = `<div class="ai-response-box">⏳ AI đang chấm bài theo 3 tiêu chí Grammar – Clarity – Appropriateness...</div>`;
      const reply = await AIEngine.ask(
        `Đề gợi ý: "${item.prompt}"\nĐáp án chuẩn tham khảo: "${item.answer}"\nCâu sinh viên viết: "${userText}"\nHãy chấm điểm trên thang 10 theo 3 tiêu chí: (1) Grammar, (2) Clarity, (3) Pedagogical Appropriateness (giáo viên dạy tiếng Anh tại trường).`
      );
      box.innerHTML = `<div class="ai-response-box"><strong>🤖 Nhận xét từ AI (${escapeHTML(AI_PROVIDERS[aiConfig.provider].name)}):</strong>\n\n${escapeHTML(reply)}</div>`;
    };
  }

  // ========================================================================
  // MODE 6: Nối từ Speed Match (6 cặp, 5 tim, 90 giây)
  // ========================================================================
  function initM6Round() {
    const deck = getActiveDeckItems();
    const chosen = [...deck].sort(() => Math.random() - 0.5).slice(0, 6);
    const cards = [];
    chosen.forEach((it) => {
      cards.push({ pairId: it.id, side: "en", text: it.term, sub: it.ipa, speak: it.term.split("/")[0].trim(), matched: false });
      cards.push({ pairId: it.id, side: "vn", text: it.meaning, sub: "", speak: it.term.split("/")[0].trim(), matched: false });
    });
    mState.m6Cards = cards.sort(() => Math.random() - 0.5);
    mState.m6Selected = null;
    mState.m6Hearts = 5;
    mState.m6Time = 90;
    mState.m6Matched = 0;
    mState.m6Finished = false;
  }

  function renderMode6SpeedMatch(stage, reset = true) {
    if (reset || !mState.m6Cards.length) initM6Round();

    function paint() {
      const heartsStr = "❤️".repeat(Math.max(0, mState.m6Hearts)) + "🖤".repeat(Math.max(0, 5 - mState.m6Hearts));
      stage.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px;">
          <div style="display:flex; gap:12px; align-items:center;">
            <span style="font-size:1rem;">${heartsStr}</span>
            <span class="pill-stat">⏱️ <strong id="m6-sec">${mState.m6Time}</strong>s</span>
            <strong>Đã nối: ${mState.m6Matched} / 6 cặp</strong>
          </div>
          <button class="btn btn-sm btn-random" id="m6-restart">🎲 Trộn 6 cặp ngẫu nhiên mới</button>
        </div>

        <div class="match-grid">
          ${mState.m6Cards
            .map(
              (c, i) => `
            <button class="match-tile ${c.matched ? "matched" : ""} ${mState.m6Selected === i ? "selected" : ""}" data-m6-i="${i}" ${
                c.matched || mState.m6Finished ? "disabled" : ""
              }>
              <span>${escapeHTML(c.text)}</span>
              ${c.sub ? `<small style="color:var(--accent-orange); margin-top:4px;">${escapeHTML(c.sub)}</small>` : ""}
            </button>`
            )
            .join("")}
        </div>
        <div id="m6-msg" style="margin-top:14px;"></div>
      `;

      document.getElementById("m6-restart").onclick = () => renderMode6SpeedMatch(stage, true);
      stage.querySelectorAll("[data-m6-i]").forEach((btn) => {
        btn.onclick = () => {
          const i = Number(btn.dataset.m6I);
          const card = mState.m6Cards[i];
          if (card.side === "en") AudioEngine.speak(card.speak);
          if (mState.m6Selected === null) {
            mState.m6Selected = i;
            paint();
            return;
          }
          if (mState.m6Selected === i) {
            mState.m6Selected = null;
            paint();
            return;
          }
          const first = mState.m6Cards[mState.m6Selected];
          if (first.pairId === card.pairId && first.side !== card.side) {
            first.matched = true;
            card.matched = true;
            mState.m6Matched += 1;
            mState.m6Selected = null;
            AudioEngine.speak(card.speak);
            if (mState.m6Matched === 6) {
              mState.m6Finished = true;
              addXP(30, true);
              paint();
              document.getElementById("m6-msg").innerHTML = `<div class="feedback-box success">🎉 <strong>Hoàn thành vòng đấu (+30 XP)!</strong> Còn lại ${mState.m6Time} giây.</div>`;
              return;
            }
            paint();
          } else {
            mState.m6Hearts -= 1;
            mState.m6Selected = null;
            if (mState.m6Hearts <= 0) {
              mState.m6Finished = true;
              addXP(0, false);
              paint();
              document.getElementById("m6-msg").innerHTML = `<div class="feedback-box error">💔 Hết 5 tim rồi! Hãy bấm "Trộn 6 cặp ngẫu nhiên mới" để thử lại.</div>`;
              return;
            }
            btn.classList.add("wrong");
            setTimeout(paint, 320);
          }
        };
      });
    }

    paint();
    const timerId = setInterval(() => {
      if (mState.m6Finished) return;
      mState.m6Time -= 1;
      const secEl = document.getElementById("m6-sec");
      if (secEl) secEl.textContent = Math.max(0, mState.m6Time);
      if (mState.m6Time <= 0) {
        mState.m6Finished = true;
        clearInterval(timerId);
        paint();
        const msg = document.getElementById("m6-msg");
        if (msg) msg.innerHTML = `<div class="feedback-box error">⏰ Hết 90 giây! Hãy bấm nút trộn cặp mới.</div>`;
      }
    }, 1000);
    activeIntervals.push(timerId);
  }

  // ========================================================================
  // MODE 7: Minigame Đa Dạng
  // ========================================================================
  function renderMode7Minigames(stage) {
    stage.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px;">
        <div class="tabs-bar" style="margin-bottom:0;">
          <button class="btn btn-sm ${mState.m7Tab === "scramble" ? "btn-primary" : "btn-secondary"}" data-m7-tab="scramble">🔤 Đoán &amp; Xếp chữ cái</button>
          <button class="btn btn-sm ${mState.m7Tab === "unjumble" ? "btn-primary" : "btn-secondary"}" data-m7-tab="unjumble">🧩 Xếp mảnh từ xanh dương</button>
          <button class="btn btn-sm ${mState.m7Tab === "tfblitz" ? "btn-primary" : "btn-secondary"}" data-m7-tab="tfblitz">⚡ Đúng hay Sai 60 giây</button>
        </div>
        <button class="btn btn-sm btn-random" id="m7-random-btn">🎲 Từ ngẫu nhiên</button>
      </div>
      <div id="m7-body"></div>
    `;

    document.getElementById("m7-random-btn").onclick = jumpToRandomInCurrentMode;
    stage.querySelectorAll("[data-m7-tab]").forEach((b) => {
      b.onclick = () => {
        clearAllTimers();
        mState.m7Tab = b.dataset.m7Tab;
        mState.m7Chosen = [];
        mState.m7Pool = [];
        mState.m7TfActive = false;
        renderMode7Minigames(stage);
      };
    });

    const body = document.getElementById("m7-body");
    if (mState.m7Tab === "scramble") {
      const deck = getActiveDeckItems();
      const item = deck[mState.m7Idx % deck.length];
      const cleanTerm = item.term.split("/")[0].trim();
      const scrambled = cleanTerm
        .split("")
        .sort(() => Math.random() - 0.5)
        .join(" ");

      body.innerHTML = `
        <div class="prompt-display">
          <div style="font-size:0.8rem; color:var(--text-secondary);">Nghĩa tiếng Việt &amp; IPA:</div>
          <div style="font-size:1.2rem; font-weight:800;">${escapeHTML(item.meaning)} <span class="mono" style="color:var(--accent-orange); font-size:0.92rem;">${escapeHTML(item.ipa)}</span></div>
          <div class="mono" style="margin-top:8px; color:var(--accent-cyan); letter-spacing:2px;">Ký tự xáo trộn: ${escapeHTML(scrambled)}</div>
        </div>
        <input type="text" id="m7-scr-in" class="answer-input" placeholder="Gõ lại từ/cụm từ đúng..." />
        <div style="display:flex; gap:10px; margin-top:12px;">
          <button class="btn btn-primary" id="m7-scr-check">✅ Kiểm tra</button>
          <button class="btn btn-ghost" id="m7-scr-speak">🔊 Nghe gợi ý</button>
          <button class="btn btn-secondary" id="m7-scr-next" style="margin-left:auto;">Từ tiếp ➡️</button>
        </div>
        <div id="m7-scr-fb"></div>
      `;
      document.getElementById("m7-scr-speak").onclick = () => AudioEngine.speak(cleanTerm);
      const checkScr = () => {
        const val = stripPunctuation(document.getElementById("m7-scr-in").value);
        const fb = document.getElementById("m7-scr-fb");
        if (val === stripPunctuation(cleanTerm)) {
          addXP(15, true);
          AudioEngine.speak(cleanTerm);
          fb.innerHTML = `<div class="feedback-box success">🎉 Chính xác (+15 XP)! <strong>${escapeHTML(cleanTerm)}</strong> — "${escapeHTML(item.example)}"</div>`;
        } else {
          addXP(0, false);
          fb.innerHTML = `<div class="feedback-box warn">🔎 Chưa đúng. Đáp án là: <strong>${escapeHTML(cleanTerm)}</strong></div>`;
        }
      };
      document.getElementById("m7-scr-check").onclick = checkScr;
      document.getElementById("m7-scr-in").addEventListener("keydown", (e) => { if (e.key === "Enter") checkScr(); });
      document.getElementById("m7-scr-next").onclick = () => { mState.m7Idx += 1; renderMode7Minigames(stage); };
    } else if (mState.m7Tab === "unjumble") {
      const s = DATA.sample16Sentences[mState.m7Idx % DATA.sample16Sentences.length];
      if (!mState.m7Pool.length && !mState.m7Chosen.length) {
        const blueJoined = s.blueParts.join(" ").toLowerCase();
        mState.m7Pool = s.sentence
          .split(/\s+/)
          .map((w, i) => ({ id: i, word: w, isGlue: blueJoined.split(/\s+/).includes(stripPunctuation(w)) }))
          .sort(() => Math.random() - 0.5);
      }
      body.innerHTML = `
        <div class="prompt-display">
          <div style="font-size:0.8rem; color:var(--text-secondary);">Ghép các thẻ từ (thẻ xanh dương = mảnh ghép cố định):</div>
          <div class="mono-prompt">${escapeHTML(s.prompt)}</div>
        </div>
        <div class="tile-zone">
          ${mState.m7Chosen.length ? mState.m7Chosen.map((t, i) => `<button class="word-tile ${t.isGlue ? "is-glue" : ""}" data-m7-rm="${i}">${escapeHTML(t.word)}</button>`).join("") : `<span style="color:var(--text-muted);">Bấm các từ bên dưới để ghép câu...</span>`}
        </div>
        <div class="tile-bank">
          ${mState.m7Pool.map((t, i) => `<button class="word-tile ${t.isGlue ? "is-glue" : ""}" data-m7-add="${i}">${escapeHTML(t.word)}</button>`).join("")}
        </div>
        <div style="display:flex; gap:10px; margin-top:14px;">
          <button class="btn btn-primary" id="m7-un-check">✅ Kiểm tra</button>
          <button class="btn btn-secondary" id="m7-un-reset">🔄 Xếp lại</button>
          <button class="btn btn-secondary" id="m7-un-next" style="margin-left:auto;">Câu tiếp ➡️</button>
        </div>
        <div id="m7-un-fb"></div>
      `;
      body.querySelectorAll("[data-m7-add]").forEach((b) => {
        b.onclick = () => {
          const [picked] = mState.m7Pool.splice(Number(b.dataset.m7Add), 1);
          mState.m7Chosen.push(picked);
          renderMode7Minigames(stage);
        };
      });
      body.querySelectorAll("[data-m7-rm]").forEach((b) => {
        b.onclick = () => {
          const [rem] = mState.m7Chosen.splice(Number(b.dataset.m7Rm), 1);
          mState.m7Pool.push(rem);
          renderMode7Minigames(stage);
        };
      });
      document.getElementById("m7-un-check").onclick = () => {
        const built = mState.m7Chosen.map((t) => t.word).join(" ");
        const fb = document.getElementById("m7-un-fb");
        if (normalizeText(built) === normalizeText(s.sentence)) {
          addXP(20, true);
          AudioEngine.speak(s.sentence);
          fb.innerHTML = `<div class="feedback-box success">🎉 Chuẩn xác (+20 XP)! ${escapeHTML(s.note)}</div>`;
        } else {
          addXP(0, false);
          fb.innerHTML = `<div class="feedback-box error">❌ Chưa đúng trật tự. Câu chuẩn: <strong>${escapeHTML(s.sentence)}</strong></div>`;
        }
      };
      document.getElementById("m7-un-reset").onclick = () => { mState.m7Chosen = []; mState.m7Pool = []; renderMode7Minigames(stage); };
      document.getElementById("m7-un-next").onclick = () => { mState.m7Idx += 1; mState.m7Chosen = []; mState.m7Pool = []; renderMode7Minigames(stage); };
    } else {
      const tfStatements = [
        { stmt: "Please write your name at the top of the paper.", isTrue: true, why: "Đúng chuẩn cụm cố định 'at the top of' (Phần 2.3)." },
        { stmt: "Please write your name on the top of the page.", isTrue: false, why: "Sai giới từ! Đầu trang giấy dùng 'at the top of', không dùng 'on the top of'." },
        { stmt: "Would you mind closing the window?", isTrue: true, why: "Đúng cấu trúc B1/B2: Would you mind + V-ing." },
        { stmt: "Would you mind to read the first paragraph aloud?", isTrue: false, why: "Sai! Sau 'Would you mind' phải dùng V-ing (reading)." },
        { stmt: "Please to open your textbooks to page 79.", isTrue: false, why: "Sai! Sau 'Please' dùng động từ nguyên mẫu không 'to'." },
        { stmt: "Could you please raise your hand if you have a question?", isTrue: true, why: "Đúng hoàn toàn cho tình huống học sinh giơ tay khi có thắc mắc." },
        { stmt: "Please write down the answer of question.", isTrue: false, why: "Sai! Danh từ 'answer' đi với giới từ 'to' (the answer to the question)." },
        { stmt: "Please turn off the lights before leaving the classroom.", isTrue: true, why: "Đúng! Sau giới từ 'before' dùng V-ing (leaving)." },
        { stmt: "Please make sure that everyone have a copy of the worksheet.", isTrue: false, why: "Sai! Đại từ 'everyone' chia động từ số ít → 'has'." },
        { stmt: "I'd appreciate it if you could turn in your final draft by Friday.", isTrue: true, why: "Đúng chuẩn B2: appreciate it if you could + V(nguyên mẫu)." }
      ];

      if (!mState.m7TfActive) {
        body.innerHTML = `
          <div class="card" style="text-align:center;">
            <h3 style="margin-bottom:8px;">⚡ Thử thách Đúng hay Sai trong 60 giây</h3>
            <p style="color:var(--text-secondary); margin-bottom:16px;">Phán đoán thật nhanh các câu yêu cầu lớp học đúng hay mắc bẫy ngữ pháp / giới từ!</p>
            <button class="btn btn-primary" id="m7-tf-start">🚀 Bắt đầu 60 giây ngay</button>
          </div>`;
        document.getElementById("m7-tf-start").onclick = () => {
          mState.m7TfActive = true;
          mState.m7TfTime = 60;
          mState.m7TfScore = 0;
          mState.m7TfCurrent = tfStatements[Math.floor(Math.random() * tfStatements.length)];
          renderMode7Minigames(stage);
        };
        return;
      }

      const cur = mState.m7TfCurrent || tfStatements[0];
      body.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <div class="pill-stat">⏱️ <strong id="m7-tf-sec">${mState.m7TfTime}</strong>s</div>
          <strong>Điểm chuỗi: <span style="color:var(--accent-emerald);">${mState.m7TfScore}</span></strong>
        </div>
        <div class="prompt-display" style="text-align:center;">
          <div style="font-size:1.18rem; font-weight:800;">"${escapeHTML(cur.stmt)}"</div>
        </div>
        <div class="grid-2">
          <button class="btn btn-primary" id="m7-tf-true" style="background:linear-gradient(135deg,#10b981,#059669);">✅ ĐÚNG NGỮ PHÁP</button>
          <button class="btn btn-primary" id="m7-tf-false" style="background:linear-gradient(135deg,#f43f5e,#e11d48);">❌ CÓ LỖI SAI</button>
        </div>
        <div id="m7-tf-fb"></div>
      `;

      const timerId = setInterval(() => {
        mState.m7TfTime -= 1;
        const el = document.getElementById("m7-tf-sec");
        if (el) el.textContent = Math.max(0, mState.m7TfTime);
        if (mState.m7TfTime <= 0) {
          clearInterval(timerId);
          mState.m7TfActive = false;
          body.innerHTML = `<div class="card" style="text-align:center;">
            <h3>🏁 Hết 60 giây!</h3>
            <p style="font-size:1.2rem; margin:10px 0;">Bạn trả lời đúng <strong style="color:var(--accent-orange);">${mState.m7TfScore}</strong> câu!</p>
            <button class="btn btn-primary" id="m7-tf-again">🔄 Chơi lại 60s</button>
          </div>`;
          document.getElementById("m7-tf-again").onclick = () => renderMode7Minigames(stage);
        }
      }, 1000);
      activeIntervals.push(timerId);

      function pickTF(ans) {
        const fb = document.getElementById("m7-tf-fb");
        if (ans === cur.isTrue) {
          mState.m7TfScore += 1;
          addXP(10, true);
          fb.innerHTML = `<div class="feedback-box success">✅ Chuẩn! ${escapeHTML(cur.why)}</div>`;
        } else {
          addXP(0, false);
          fb.innerHTML = `<div class="feedback-box error">❌ Sai rồi! ${escapeHTML(cur.why)}</div>`;
        }
        mState.m7TfCurrent = tfStatements[Math.floor(Math.random() * tfStatements.length)];
        setTimeout(() => { if (mState.m7TfActive) renderMode7Minigames(stage); }, 950);
      }
      document.getElementById("m7-tf-true").onclick = () => pickTF(true);
      document.getElementById("m7-tf-false").onclick = () => pickTF(false);
    }
  }

  // ========================================================================
  // MODE 8: Cấu trúc Ngữ pháp, 16 Câu mẫu & Trọn bộ Đề 47 câu A1–B2
  // ========================================================================
  function renderMode8GrammarAndWorkbook(stage) {
    stage.innerHTML = `
      <div class="tabs-bar">
        <button class="btn btn-sm ${mState.m8Tab === "formulas" ? "btn-primary" : "btn-secondary"}" data-m8-t="formulas">1. 4 Công thức &amp; Mảnh ghép xanh</button>
        <button class="btn btn-sm ${mState.m8Tab === "samples16" ? "btn-primary" : "btn-secondary"}" data-m8-t="samples16">2. 16 Câu mẫu &amp; Giải đáp Câu 11/14</button>
        <button class="btn btn-sm ${mState.m8Tab === "workbook" ? "btn-primary" : "btn-secondary"}" data-m8-t="workbook">3. Bộ đề 47 câu A1–B2 (Dạng 1–4)</button>
      </div>
      <div id="m8-body"></div>
    `;

    stage.querySelectorAll("[data-m8-t]").forEach((b) => {
      b.onclick = () => { mState.m8Tab = b.dataset.m8T; renderMode8GrammarAndWorkbook(stage); };
    });

    const body = document.getElementById("m8-body");
    if (mState.m8Tab === "formulas") {
      body.innerHTML = `
        <div class="grid-2" style="margin-bottom:18px;">
          ${DATA.formulas
            .map(
              (f) => `
            <div class="card">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <strong>${escapeHTML(f.name)}</strong>
                <span class="badge badge-b1">${escapeHTML(f.level)}</span>
              </div>
              <div class="mono" style="background:var(--bg-input); padding:8px 12px; border-radius:8px; color:var(--accent-cyan); font-size:0.84rem; margin-bottom:8px;">
                ${escapeHTML(f.formula)}
              </div>
              <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:8px;">
                ${f.pleaseRule.map((r) => `• ${escapeHTML(r)}`).join("<br/>")}
              </div>
              ${f.examples
                .map(
                  (ex) => `
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:6px 0; border-top:1px solid var(--border-subtle);">
                  <span style="font-size:0.86rem;">${highlightBlueGlue(ex.sentence, ex.glueWords)}</span>
                  <button class="icon-btn speak-btn" data-speak="${escapeHTML(ex.sentence)}">🔊</button>
                </div>`
                )
                .join("")}
            </div>`
            )
            .join("")}
        </div>
        <div class="feedback-box warn" style="margin-bottom:18px;">
          💡 <strong>${escapeHTML(DATA.examTip.title)}:</strong> ${escapeHTML(DATA.examTip.content)}
        </div>
        <div class="grid-2">
          ${DATA.blueGlueRules
            .map(
              (g) => `
            <div class="card">
              <strong style="color:var(--accent-orange); display:block; margin-bottom:8px;">${escapeHTML(g.title)}</strong>
              <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;">
                ${g.examples.map((ex) => `<span class="glue-word">${escapeHTML(ex)}</span>`).join("")}
              </div>
              <p style="font-size:0.82rem; color:var(--text-secondary);">${escapeHTML(g.note)}</p>
            </div>`
            )
            .join("")}
        </div>
      `;
    } else if (mState.m8Tab === "samples16") {
      body.innerHTML = `
        <div class="grid-2" style="margin-bottom:18px;">
          ${DATA.sample16Sentences
            .map(
              (s) => `
            <div class="card">
              <div style="display:flex; justify-content:space-between; gap:8px;">
                <div>
                  <div class="mono" style="font-size:0.76rem; color:var(--accent-orange);">Câu ${s.num}: ${escapeHTML(s.prompt)}</div>
                  <div style="font-weight:700; margin:4px 0;">${highlightBlueGlue(s.sentence, s.blueParts)}</div>
                  <div style="font-size:0.8rem; color:var(--text-secondary);">${escapeHTML(s.vi)}</div>
                  <div style="font-size:0.76rem; color:var(--accent-cyan); margin-top:4px;">💡 ${escapeHTML(s.note)}</div>
                </div>
                <button class="icon-btn speak-btn" data-speak="${escapeHTML(s.sentence)}">🔊</button>
              </div>
            </div>`
            )
            .join("")}
        </div>
        <div class="grid-2" style="margin-bottom:16px;">
          ${DATA.qaAndCorrections.questions
            .map(
              (q) => `
            <div class="card">
              <span class="badge badge-b2" style="margin-bottom:6px;">${escapeHTML(q.tag)}</span>
              <strong style="display:block; margin-bottom:6px;">${escapeHTML(q.question)}</strong>
              <p style="font-size:0.84rem; color:var(--text-secondary);">${escapeHTML(q.answer)}</p>
            </div>`
            )
            .join("")}
        </div>
        <div class="grid-3">
          ${DATA.qaAndCorrections.corrections
            .map(
              (c) => `
            <div class="card">
              <span class="badge badge-b1" style="margin-bottom:6px;">Sửa lỗi ${escapeHTML(c.sentenceNum)}</span>
              <div><s style="color:var(--accent-rose);">${escapeHTML(c.wrong)}</s> → <strong style="color:var(--accent-emerald);">${escapeHTML(c.right)}</strong></div>
              <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:4px;">${escapeHTML(c.reason)}</p>
            </div>`
            )
            .join("")}
        </div>
      `;
    } else {
      body.innerHTML = `
        <div class="tabs-bar">
          <button class="btn btn-sm ${mState.m8WbType === "type1" ? "btn-primary" : "btn-secondary"}" data-wb-t="type1">Dạng 1A &amp; 1B (21 câu)</button>
          <button class="btn btn-sm ${mState.m8WbType === "type2" ? "btn-primary" : "btn-secondary"}" data-wb-t="type2">Dạng 2: Điền từ (12 câu)</button>
          <button class="btn btn-sm ${mState.m8WbType === "type3" ? "btn-primary" : "btn-secondary"}" data-wb-t="type3">Dạng 3: Sửa lỗi (8 câu)</button>
          <button class="btn btn-sm ${mState.m8WbType === "type4" ? "btn-primary" : "btn-secondary"}" data-wb-t="type4">Dạng 4: Viết lại (6 câu)</button>
        </div>
        <div id="m8-wb-list"></div>
      `;
      body.querySelectorAll("[data-wb-t]").forEach((b) => {
        b.onclick = () => { mState.m8WbType = b.dataset.wbT; renderMode8GrammarAndWorkbook(stage); };
      });
      renderM8WorkbookList(document.getElementById("m8-wb-list"));
    }
  }

  function renderM8WorkbookList(container) {
    if (mState.m8WbType === "type1") {
      container.innerHTML = DATA.exercises.type1
        .map(
          (q) => `
        <div class="card" style="margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <div>
              <span class="badge ${levelBadgeClass(q.level)}">Dạng ${q.part} • Câu ${q.num} (${q.level})</span>
              <span class="mono" style="margin-left:8px; color:var(--accent-orange);">${escapeHTML(q.prompt)}</span>
            </div>
            <button class="icon-btn speak-btn" data-speak="${escapeHTML(q.answer)}">🔊</button>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <input type="text" class="answer-input" style="flex:1; padding:8px 12px;" id="wb-in-${q.id}" placeholder="Viết câu yêu cầu..." />
            <button class="btn btn-sm btn-primary" data-wb1-chk="${q.id}">Kiểm tra</button>
            <button class="btn btn-sm btn-secondary" data-wb1-ans="${q.id}">Đáp án</button>
          </div>
          <div id="wb-fb-${q.id}"></div>
        </div>`
        )
        .join("");

      container.querySelectorAll("[data-wb1-chk]").forEach((b) => {
        b.onclick = () => {
          const q = DATA.exercises.type1.find((x) => x.id === b.dataset.wb1Chk);
          const res = evaluateRequest(document.getElementById(`wb-in-${q.id}`).value, q);
          const fb = document.getElementById(`wb-fb-${q.id}`);
          if (res.isCorrect) { markExerciseSolved(q.id, 15); AudioEngine.speak(q.answer); }
          fb.innerHTML = `<div class="feedback-box ${res.isCorrect ? "success" : "warn"}">${res.isCorrect ? "✅ Chính xác!" : res.diffHtml} — ${escapeHTML(q.explanation)}</div>`;
        };
      });
      container.querySelectorAll("[data-wb1-ans]").forEach((b) => {
        b.onclick = () => {
          const q = DATA.exercises.type1.find((x) => x.id === b.dataset.wb1Ans);
          document.getElementById(`wb-in-${q.id}`).value = q.answer;
          document.getElementById(`wb-fb-${q.id}`).innerHTML = `<div class="feedback-box warn">💡 ${highlightBlueGlue(q.answer, q.blueTokens)} — ${escapeHTML(q.explanation)}</div>`;
        };
      });
    } else if (mState.m8WbType === "type2") {
      container.innerHTML = DATA.exercises.type2
        .map((q) => {
          let bi = 0;
          const html = escapeHTML(q.template).replace(/____/g, () => {
            const b = q.blanks[bi];
            const idx = bi++;
            return `<select class="wb-inline-select" id="wb2-${q.id}-${idx}"><option value="">--</option>${b.options.map((o) => `<option value="${escapeHTML(o)}">${escapeHTML(o)}</option>`).join("")}</select>`;
          });
          return `
          <div class="card" style="margin-bottom:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span class="badge ${levelBadgeClass(q.level)}">Dạng 2 • Câu ${q.num}</span>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-sm btn-primary" data-wb2-chk="${q.id}">Kiểm tra</button>
                <button class="btn btn-sm btn-secondary" data-wb2-ans="${q.id}">Đáp án</button>
              </div>
            </div>
            <div style="line-height:2;">${html}</div>
            <div id="wb-fb-${q.id}"></div>
          </div>`;
        })
        .join("");

      container.querySelectorAll("[data-wb2-chk]").forEach((btn) => {
        btn.onclick = () => {
          const q = DATA.exercises.type2.find((x) => x.id === btn.dataset.wb2Chk);
          const ok = q.blanks.every((b, i) => (b.accepted || [b.answer]).includes(document.getElementById(`wb2-${q.id}-${i}`).value));
          if (ok) markExerciseSolved(q.id, 15);
          document.getElementById(`wb-fb-${q.id}`).innerHTML = `<div class="feedback-box ${ok ? "success" : "error"}">${ok ? "✅ Chính xác!" : `❌ Đáp án: ${q.blanks.map((b) => b.answer).join(" / ")}`} — ${escapeHTML(q.explanation)}</div>`;
        };
      });
      container.querySelectorAll("[data-wb2-ans]").forEach((btn) => {
        btn.onclick = () => {
          const q = DATA.exercises.type2.find((x) => x.id === btn.dataset.wb2Ans);
          q.blanks.forEach((b, i) => { document.getElementById(`wb2-${q.id}-${i}`).value = b.answer; });
          document.getElementById(`wb-fb-${q.id}`).innerHTML = `<div class="feedback-box warn">💡 ${q.blanks.map((b) => b.answer).join(" / ")} — ${escapeHTML(q.explanation)}</div>`;
        };
      });
    } else if (mState.m8WbType === "type3") {
      container.innerHTML = DATA.exercises.type3
        .map(
          (q) => `
        <div class="card" style="margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span class="badge ${levelBadgeClass(q.level)}">Dạng 3 • Câu ${q.num}</span>
            <button class="icon-btn speak-btn" data-speak="${escapeHTML(q.fixedSentence)}">🔊</button>
          </div>
          <p style="margin-bottom:8px;"><strong>Câu sai:</strong> ${escapeHTML(q.sentence)}</p>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <input type="text" class="answer-input" style="flex:1; padding:8px 12px;" id="wb-in-${q.id}" placeholder="Nhập câu đã sửa hoặc từ sửa..." />
            <button class="btn btn-sm btn-primary" data-wb3-chk="${q.id}">Kiểm tra</button>
            <button class="btn btn-sm btn-secondary" data-wb3-ans="${q.id}">Đáp án</button>
          </div>
          <div id="wb-fb-${q.id}"></div>
        </div>`
        )
        .join("");

      container.querySelectorAll("[data-wb3-chk]").forEach((b) => {
        b.onclick = () => {
          const q = DATA.exercises.type3.find((x) => x.id === b.dataset.wb3Chk);
          const val = stripPunctuation(document.getElementById(`wb-in-${q.id}`).value);
          const ok = val === stripPunctuation(q.fixedSentence) || val === stripPunctuation(q.correction);
          if (ok) markExerciseSolved(q.id, 15);
          document.getElementById(`wb-fb-${q.id}`).innerHTML = `<div class="feedback-box ${ok ? "success" : "error"}">${ok ? "✅ Đúng!" : `❌ Sửa ${q.errorWord} → ${q.correction}.`} ${escapeHTML(q.fixedSentence)} (${escapeHTML(q.explanation)})</div>`;
        };
      });
      container.querySelectorAll("[data-wb3-ans]").forEach((b) => {
        b.onclick = () => {
          const q = DATA.exercises.type3.find((x) => x.id === b.dataset.wb3Ans);
          document.getElementById(`wb-in-${q.id}`).value = q.fixedSentence;
          document.getElementById(`wb-fb-${q.id}`).innerHTML = `<div class="feedback-box warn">💡 ${escapeHTML(q.errorWord)} → ${escapeHTML(q.correction)}: ${escapeHTML(q.fixedSentence)}</div>`;
        };
      });
    } else {
      container.innerHTML = DATA.exercises.type4
        .map(
          (q) => `
        <div class="card" style="margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span class="badge ${levelBadgeClass(q.level)}">Dạng 4 • Câu ${q.num}</span>
            <span style="color:var(--accent-orange); font-size:0.82rem; font-weight:700;">${escapeHTML(q.constraint)}</span>
          </div>
          <p style="margin-bottom:8px;"><strong>Câu gốc:</strong> ${escapeHTML(q.source)}</p>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <input type="text" class="answer-input" style="flex:1; padding:8px 12px;" id="wb-in-${q.id}" placeholder="Viết lại câu lịch sự..." />
            <button class="btn btn-sm btn-primary" data-wb4-chk="${q.id}">Kiểm tra</button>
            <button class="btn btn-sm btn-secondary" data-wb4-ans="${q.id}">Đáp án</button>
          </div>
          <div id="wb-fb-${q.id}"></div>
        </div>`
        )
        .join("");

      container.querySelectorAll("[data-wb4-chk]").forEach((b) => {
        b.onclick = () => {
          const q = DATA.exercises.type4.find((x) => x.id === b.dataset.wb4Chk);
          const val = stripPunctuation(document.getElementById(`wb-in-${q.id}`).value);
          const ok = q.acceptedAnswers.some((a) => stripPunctuation(a) === val);
          if (ok) markExerciseSolved(q.id, 20);
          document.getElementById(`wb-fb-${q.id}`).innerHTML = `<div class="feedback-box ${ok ? "success" : "error"}">${ok ? "✅ Tuyệt vời!" : "❌ Chưa khớp."} Đáp án: <strong>${escapeHTML(q.answer)}</strong> (${escapeHTML(q.explanation)})</div>`;
        };
      });
      container.querySelectorAll("[data-wb4-ans]").forEach((b) => {
        b.onclick = () => {
          const q = DATA.exercises.type4.find((x) => x.id === b.dataset.wb4Ans);
          document.getElementById(`wb-in-${q.id}`).value = q.answer;
          document.getElementById(`wb-fb-${q.id}`).innerHTML = `<div class="feedback-box warn">💡 ${escapeHTML(q.answer)} — ${escapeHTML(q.explanation)}</div>`;
        };
      });
    }
  }

  // ========================================================================
  // MODE 9: AI Tutor
  // ========================================================================
  function renderMode9AITutor(stage) {
    const hardWords = getAllVocabItems().filter((v) => state.srsRatings[v.id] === "hard");
    const sampleFocus = (hardWords.length ? hardWords : getAllVocabItems().slice(0, 6))
      .map((w) => `${w.term} (${w.meaning})`)
      .join(", ");

    stage.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px;">
        <div>
          <strong>Chế độ AI hiện tại:</strong>
          <span style="color:var(--accent-emerald); font-weight:800;">
            ● ${escapeHTML(AI_PROVIDERS[aiConfig.provider].name)} (${escapeHTML(aiConfig.model)})
          </span>
        </div>
        <button class="btn btn-sm btn-ai" id="m9-open-cfg">⚙️ Đổi Provider / API Key</button>
      </div>

      <div class="grid-3" style="margin-bottom:16px;">
        <button class="btn btn-secondary" id="m9-btn-mnemonic" style="flex-direction:column; align-items:flex-start; text-align:left; padding:14px;">
          <strong>🧠 Tạo mẹo nhớ cụm từ</strong>
          <span style="font-size:0.76rem; color:var(--text-secondary);">Phân biệt nhanh hand in / hand out / put away / take out...</span>
        </button>
        <button class="btn btn-secondary" id="m9-btn-quiz" style="flex-direction:column; align-items:flex-start; text-align:left; padding:14px;">
          <strong>📝 Sinh 5 câu luyện từ Hộp Quên</strong>
          <span style="font-size:0.76rem; color:var(--text-secondary);">Tự động tạo bài tập mới từ các từ bạn hay sai</span>
        </button>
        <button class="btn btn-secondary" id="m9-btn-prep" style="flex-direction:column; align-items:flex-start; text-align:left; padding:14px;">
          <strong>📍 So sánh bẫy Giới từ &amp; Mạo từ</strong>
          <span style="font-size:0.76rem; color:var(--text-secondary);">at the top vs on top, to page vs on page, a/an/the/your</span>
        </button>
      </div>

      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <input type="text" id="m9-custom-q" class="answer-input" style="flex:1;" placeholder="Hỏi giảng viên AI bất kỳ câu hỏi nào (VD: Khi nào dùng Would you mind vs Could you please?)" />
        <button class="btn btn-ai" id="m9-send">🚀 Hỏi AI Tutor</button>
      </div>

      <div id="m9-output">
        ${
          mState.m9History.length
            ? mState.m9History.map((h) => `<div class="ai-response-box"><strong>Bạn hỏi:</strong> ${escapeHTML(h.q)}\n\n<strong>🤖 AI trả lời:</strong>\n${escapeHTML(h.a)}</div>`).join("")
            : `<div class="feedback-box warn">💡 Bấm bất kỳ nút nào ở trên hoặc đặt câu hỏi — hoạt động ngay cả khi chưa nhập API Key!</div>`
        }
      </div>
    `;

    document.getElementById("m9-open-cfg").onclick = openAIModal;

    async function runM9Prompt(userPrompt) {
      const out = document.getElementById("m9-output");
      out.innerHTML = `<div class="ai-response-box">⏳ Đang xử lý cùng ${escapeHTML(AI_PROVIDERS[aiConfig.provider].name)} (${escapeHTML(aiConfig.model)})...</div>`;
      const reply = await AIEngine.ask(userPrompt);
      mState.m9History.unshift({ q: userPrompt, a: reply });
      if (mState.m9History.length > 5) mState.m9History.pop();
      renderMode9AITutor(stage);
    }

    document.getElementById("m9-btn-mnemonic").onclick = () =>
      runM9Prompt("Hãy tạo bảng mẹo nhớ nhanh và câu ví dụ giáo viên tiếng Anh dùng trong lớp học cho các cụm động từ dễ nhầm lẫn: take out, put away, hand in / turn in, hand out / pass out, jot down, go over, cross out, figure out, come up with, carry out, catch up on, run through.");

    document.getElementById("m9-btn-quiz").onclick = () =>
      runM9Prompt(`Dựa vào các mục từ sinh viên cần ôn sau: ${sampleFocus}. Hãy tạo 5 câu trắc nghiệm tình huống lớp học (kèm đáp án và giải thích ngắn ở cuối) để kiểm tra khả năng dùng câu yêu cầu chuẩn B1–B2.`);

    document.getElementById("m9-btn-prep").onclick = () =>
      runM9Prompt("Hãy hệ thống hóa ngắn gọn các bẫy hay gặp khi viết câu yêu cầu trong lớp học: (1) open ... to page vs exercise on page, (2) at the top of vs on top of, (3) answer to the question, (4) in pencil/ink, (5) on time vs in time, (6) dấu ? bắt buộc dùng Could you / Would you.");

    document.getElementById("m9-send").onclick = () => {
      const q = document.getElementById("m9-custom-q").value.trim();
      if (q) runM9Prompt(q);
    };
    document.getElementById("m9-custom-q").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const q = e.target.value.trim();
        if (q) runM9Prompt(q);
      }
    });
  }

  // ========================================================================
  // MODE 10: Speaking & AI Classroom Roleplay
  // ========================================================================
  function renderMode10SpeakingRoleplay(stage) {
    const idx = mState.m10Idx % DATA.speakingScenarios.length;
    const item = DATA.speakingScenarios[idx];
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

    stage.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:14px;">
        <div style="display:flex; gap:8px; align-items:center;">
          <span class="badge ${levelBadgeClass(item.level)}">Speaking ${escapeHTML(item.level)} • Tình huống ${idx + 1} / ${DATA.speakingScenarios.length}</span>
          <button class="btn btn-sm btn-random" id="m10-random-btn">🎲 Tình huống ngẫu nhiên</button>
        </div>
        <button class="btn btn-sm btn-ghost" id="m10-listen">🔊 Nghe câu mẫu UK</button>
      </div>

      <div class="prompt-display">
        <div style="font-size:1.05rem; font-weight:700;">👩‍🏫 Tình huống: ${escapeHTML(item.situation)}</div>
        <div style="margin-top:8px;">Từ khóa cần nói: ${item.keywords.map((k) => `<span class="glue-word">${escapeHTML(k)}</span>`).join(" ")}</div>
      </div>

      <div style="text-align:center; padding:10px 0 16px;">
        <button class="mic-btn ${mState.m10Listening ? "listening" : ""}" id="m10-mic">🎙️</button>
        <div style="font-size:0.84rem; color:var(--text-secondary);">
          ${SpeechRec ? "Bấm Micro và nói câu yêu cầu bằng tiếng Anh" : "Trình duyệt chưa hỗ trợ thu âm trực tiếp — hãy nghe mẫu, đọc to và dùng nút Hoàn thành / AI Roleplay"}
        </div>
        ${
          mState.m10Transcript
            ? `<div class="card" style="margin-top:12px; text-align:left;"><strong>Bạn vừa nói:</strong> "${escapeHTML(mState.m10Transcript)}"</div>`
            : ""
        }
      </div>

      <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
        <button class="btn btn-primary" id="m10-pass">✅ Đã nói chuẩn (+20 XP)</button>
        <button class="btn btn-ai" id="m10-ai-role">🎭 AI đóng vai Học sinh phản hồi</button>
        <button class="btn btn-secondary" id="m10-next">Tình huống tiếp ➡️</button>
      </div>
      <div id="m10-fb"></div>
    `;

    document.getElementById("m10-random-btn").onclick = jumpToRandomInCurrentMode;
    document.getElementById("m10-listen").onclick = () => AudioEngine.speak(item.target);
    document.getElementById("m10-pass").onclick = () => {
      addXP(20, true);
      document.getElementById("m10-fb").innerHTML = `<div class="feedback-box success">🎙️ Tuyệt vời! Câu chuẩn sư phạm: <strong>${escapeHTML(item.target)}</strong></div>`;
    };
    document.getElementById("m10-next").onclick = () => {
      mState.m10Idx += 1;
      mState.m10Transcript = "";
      renderMode10SpeakingRoleplay(stage);
    };
    document.getElementById("m10-ai-role").onclick = async () => {
      const fb = document.getElementById("m10-fb");
      const teacherLine = mState.m10Transcript || item.target;
      fb.innerHTML = `<div class="ai-response-box">⏳ Học sinh AI đang phản hồi lại lời yêu cầu của giáo viên...</div>`;
      const reply = await AIEngine.ask(
        `Giáo viên vừa nói trong lớp học: "${teacherLine}" (Tình huống: ${item.situation}). Hãy đóng vai một học sinh ngoan phản hồi ngắn bằng tiếng Anh (1-2 câu), sau đó chuyển vai cố vấn sư phạm góp ý 1 câu ngắn bằng tiếng Việt xem lời yêu cầu của giáo viên đã đủ lịch sự và rõ ràng chưa.`
      );
      fb.innerHTML = `<div class="ai-response-box"><strong>🎭 Phản hồi từ Lớp học AI:</strong>\n\n${escapeHTML(reply)}</div>`;
    };

    document.getElementById("m10-mic").onclick = () => {
      if (!SpeechRec) { AudioEngine.speak(item.target); return; }
      const rec = new SpeechRec();
      rec.lang = "en-GB";
      mState.m10Listening = true;
      renderMode10SpeakingRoleplay(stage);
      rec.onresult = (ev) => {
        mState.m10Transcript = ev.results[0][0].transcript;
        mState.m10Listening = false;
        renderMode10SpeakingRoleplay(stage);
      };
      rec.onerror = () => {
        mState.m10Listening = false;
        renderMode10SpeakingRoleplay(stage);
      };
      rec.start();
    };
  }

  // ========================================================================
  // MODE 11: Bài kiểm tra Tổng hợp 10 câu (Thang điểm 10)
  // ========================================================================
  function generateM11Exam() {
    const allVocab = getAllVocabItems();
    const qs = [];
    [...allVocab].sort(() => Math.random() - 0.5).slice(0, 4).forEach((v, idx) => {
      const others = allVocab.filter((x) => x.id !== v.id).sort(() => Math.random() - 0.5).slice(0, 3);
      const opts = [v, ...others].sort(() => Math.random() - 0.5).map((o) => o.meaning);
      qs.push({ id: `ex-v-${idx}`, kind: "mcq", vocabId: v.id, title: `[Từ vựng ${idx + 1}] Nghĩa của "${v.term}" (${v.ipa}) là gì?`, options: opts, answer: v.meaning });
    });
    [...DATA.exercises.type2].sort(() => Math.random() - 0.5).slice(0, 3).forEach((t2, idx) => {
      const b = t2.blanks[0];
      qs.push({ id: `ex-g-${idx}`, kind: "mcq", title: `[Ngữ pháp ${idx + 5}] ${t2.template}`, options: b.options, answer: b.answer, explain: t2.explanation });
    });
    [...DATA.exercises.type1].sort(() => Math.random() - 0.5).slice(0, 3).forEach((t1, idx) => {
      qs.push({ id: `ex-w-${idx}`, kind: "write", title: `[Viết câu ${idx + 8}] Dựng câu (${t1.level}): ${t1.prompt}`, item: t1 });
    });
    mState.m11Questions = qs;
    mState.m11Answers = {};
    mState.m11Submitted = false;
  }

  function renderMode11Exam(stage, reset = false) {
    if (reset || !mState.m11Questions.length) generateM11Exam();

    let score = 0;
    if (mState.m11Submitted) {
      mState.m11Questions.forEach((q) => {
        const userAns = mState.m11Answers[q.id] || "";
        const ok = q.kind === "mcq" ? userAns === q.answer : evaluateRequest(userAns, q.item).isCorrect;
        if (ok) score += 1;
        else if (q.vocabId) state.srsRatings[q.vocabId] = "hard";
      });
      saveState();
    }

    stage.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px;">
        <strong>Đề kiểm tra tổng hợp 10 câu (Thang điểm 10)</strong>
        <button class="btn btn-sm btn-random" id="m11-new">🎲 Sinh đề ngẫu nhiên mới</button>
      </div>

      ${
        mState.m11Submitted
          ? `<div class="feedback-box ${score >= 8 ? "success" : "warn"}" style="margin-bottom:16px;">
               <h3>🏆 Kết quả: ${score} / 10 điểm</h3>
               <p style="font-size:0.86rem;">Các từ vựng làm sai đã được tự động chuyển vào <strong>Hộp Quên</strong> để bạn ôn lại!</p>
             </div>`
          : ""
      }

      <div style="display:grid; gap:12px;">
        ${mState.m11Questions
          .map((q) => {
            const userVal = mState.m11Answers[q.id] || "";
            const ok = mState.m11Submitted
              ? q.kind === "mcq"
                ? userVal === q.answer
                : evaluateRequest(userVal, q.item).isCorrect
              : false;
            return `
            <div class="card">
              <div style="font-weight:700; margin-bottom:10px;">${escapeHTML(q.title)}</div>
              ${
                q.kind === "mcq"
                  ? `<div class="quiz-options-grid">
                      ${q.options
                        .map(
                          (o) => `
                        <button class="quiz-opt-btn ${
                            mState.m11Submitted && o === q.answer ? "correct" : mState.m11Submitted && userVal === o && o !== q.answer ? "wrong" : ""
                          }" style="${userVal === o && !mState.m11Submitted ? "border-color:var(--accent-orange);" : ""}" data-m11-q="${q.id}" data-m11-opt="${escapeHTML(o)}" ${mState.m11Submitted ? "disabled" : ""}>
                          <span>${escapeHTML(o)}</span>
                        </button>`
                        )
                        .join("")}
                    </div>`
                  : `<input type="text" class="answer-input" data-m11-in="${q.id}" value="${escapeHTML(userVal)}" placeholder="Gõ câu yêu cầu hoàn chỉnh..." ${mState.m11Submitted ? "disabled" : ""} />`
              }
              ${
                mState.m11Submitted
                  ? `<div style="margin-top:8px; font-size:0.82rem; color:${ok ? "var(--accent-emerald)" : "var(--accent-coral)"};">
                      ${ok ? "✅ Đúng (+1 điểm)" : `❌ Đáp án chuẩn: ${escapeHTML(q.kind === "mcq" ? q.answer : q.item.answer)}`}
                    </div>`
                  : ""
              }
            </div>`;
          })
          .join("")}
      </div>

      ${
        !mState.m11Submitted
          ? `<div style="margin-top:16px; text-align:right;">
               <button class="btn btn-primary" id="m11-submit">📤 Nộp bài &amp; Chấm điểm</button>
             </div>`
          : ""
      }
    `;

    document.getElementById("m11-new").onclick = () => renderMode11Exam(stage, true);
    stage.querySelectorAll("[data-m11-q]").forEach((b) => {
      b.onclick = () => { mState.m11Answers[b.dataset.m11Q] = b.dataset.m11Opt; renderMode11Exam(stage, false); };
    });
    stage.querySelectorAll("[data-m11-in]").forEach((inp) => {
      inp.oninput = () => { mState.m11Answers[inp.dataset.m11In] = inp.value; };
    });
    document.getElementById("m11-submit")?.addEventListener("click", () => {
      mState.m11Submitted = true;
      addXP(25, true);
      renderMode11Exam(stage, false);
    });
  }

  // ========================================================================
  // MODE 12: Sổ Từ Vựng & Cụm Từ IPA Oxford UK
  // ========================================================================
  function renderMode12Dictionary(stage) {
    let items = getAllVocabItems();
    if (mState.m12Cat === "hard") items = items.filter((v) => state.srsRatings[v.id] === "hard");
    else if (mState.m12Cat === "easy") items = items.filter((v) => state.srsRatings[v.id] === "easy");
    else if (mState.m12Cat !== "all") items = items.filter((v) => v.category === mState.m12Cat);

    if (mState.m12Search.trim()) {
      const q = mState.m12Search.trim().toLowerCase();
      items = items.filter((v) => v.term.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q) || v.ipa.toLowerCase().includes(q));
    }

    stage.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px;">
        <div class="tabs-bar" style="margin-bottom:0;">
          <button class="btn btn-sm ${mState.m12Cat === "all" ? "btn-primary" : "btn-secondary"}" data-m12-c="all">Tất cả (40)</button>
          <button class="btn btn-sm ${mState.m12Cat === "coreWords" ? "btn-primary" : "btn-secondary"}" data-m12-c="coreWords">Cốt lõi (12)</button>
          <button class="btn btn-sm ${mState.m12Cat === "phrasalVerbs" ? "btn-primary" : "btn-secondary"}" data-m12-c="phrasalVerbs">Phrasal Verbs (16)</button>
          <button class="btn btn-sm ${mState.m12Cat === "prepositions" ? "btn-primary" : "btn-secondary"}" data-m12-c="prepositions">Giới từ (12)</button>
          <button class="btn btn-sm ${mState.m12Cat === "hard" ? "btn-primary" : "btn-secondary"}" data-m12-c="hard">🔁 Quên</button>
          <button class="btn btn-sm ${mState.m12Cat === "easy" ? "btn-primary" : "btn-secondary"}" data-m12-c="easy">✅ Thuộc</button>
        </div>
        <input type="search" id="m12-search" class="answer-input" style="max-width:260px; padding:8px 12px;" value="${escapeHTML(mState.m12Search)}" placeholder="Tìm từ, IPA, nghĩa..." />
      </div>

      <div id="m12-ai-result"></div>

      <div class="grid-3">
        ${items
          .map((v) => {
            const r = state.srsRatings[v.id] || "";
            return `
            <div class="vocab-card">
              <div>
                <div style="display:flex; justify-content:space-between; gap:8px;">
                  <div>
                    <strong style="font-size:1.06rem;">${escapeHTML(v.term)}</strong>
                    <span class="badge badge-a2" style="margin-left:4px;">${escapeHTML(v.pos)}</span>
                    <div class="mono" style="font-size:0.8rem; color:var(--accent-orange); margin-top:2px;">${escapeHTML(v.ipa)}</div>
                  </div>
                  <button class="icon-btn speak-btn" data-speak="${escapeHTML(v.term.split("/")[0].trim())}">🔊</button>
                </div>
                <div style="font-weight:600; font-size:0.9rem; margin:8px 0 6px;">${escapeHTML(v.meaning)}</div>
                <div style="font-size:0.8rem; color:var(--text-secondary); background:var(--bg-input); padding:8px 10px; border-radius:8px;">
                  "${escapeHTML(v.example)}"
                </div>
              </div>
              <div>
                <div class="srs-bar">
                  <button class="srs-btn easy ${r === "easy" ? "active" : ""}" data-m12-srs="${v.id}" data-val="easy">Thuộc</button>
                  <button class="srs-btn medium ${r === "medium" ? "active" : ""}" data-m12-srs="${v.id}" data-val="medium">Đang nhớ</button>
                  <button class="srs-btn hard ${r === "hard" ? "active" : ""}" data-m12-srs="${v.id}" data-val="hard">Quên</button>
                  <button class="btn btn-sm btn-ai" style="padding:5px 8px; font-size:0.72rem;" data-m12-ai="${escapeHTML(v.term)}">✨ AI</button>
                </div>
              </div>
            </div>`;
          })
          .join("")}
      </div>
    `;

    stage.querySelectorAll("[data-m12-c]").forEach((b) => {
      b.onclick = () => { mState.m12Cat = b.dataset.m12C; renderMode12Dictionary(stage); };
    });
    document.getElementById("m12-search").oninput = (e) => {
      mState.m12Search = e.target.value;
      renderMode12Dictionary(stage);
      const inp = document.getElementById("m12-search");
      inp.focus();
      inp.setSelectionRange(inp.value.length, inp.value.length);
    };
    stage.querySelectorAll("[data-m12-srs]").forEach((b) => {
      b.onclick = () => {
        state.srsRatings[b.dataset.m12Srs] = b.dataset.val;
        saveState();
        renderMode12Dictionary(stage);
      };
    });
    stage.querySelectorAll("[data-m12-ai]").forEach((b) => {
      b.onclick = async () => {
        const box = document.getElementById("m12-ai-result");
        box.innerHTML = `<div class="ai-response-box" style="margin-bottom:14px;">⏳ AI đang phân tích cụm từ "${escapeHTML(b.dataset.m12Ai)}"...</div>`;
        const reply = await AIEngine.ask(
          `Phân tích nhanh cụm từ "${b.dataset.m12Ai}" trong ngữ cảnh giáo viên tiếng Anh sử dụng câu yêu cầu trên lớp học: (1) Cấu trúc ngữ pháp đi kèm, (2) 2 ví dụ câu yêu cầu mức B1–B2, (3) 1 lỗi sai sinh viên hay mắc.`
        );
        box.innerHTML = `<div class="ai-response-box" style="margin-bottom:14px;"><strong>✨ Phân tích AI cho "${escapeHTML(b.dataset.m12Ai)}":</strong>\n\n${escapeHTML(reply)}</div>`;
      };
    });
  }

  // ========================================================================
  // 7. AI Modal Controls & Reference Grid
  // ========================================================================
  function syncAIModalFields(prov) {
    const group = document.getElementById("ai-apikey-group");
    if (group) group.style.display = prov === "builtin" ? "none" : "block";
    document.getElementById("ai-provider-hint").textContent = AI_PROVIDERS[prov].hint;
    document.getElementById("ai-discovered-wrap").style.display = "none";
  }

  function openAIModal() {
    const modal = document.getElementById("ai-modal");
    if (!modal) return;
    document.getElementById("ai-provider").value = aiConfig.provider;
    document.getElementById("ai-model").value = aiConfig.model;
    document.getElementById("ai-apikey").value = aiConfig.apiKey;
    syncAIModalFields(aiConfig.provider);
    document.getElementById("ai-modal-status").innerHTML = "";
    modal.classList.add("open");
  }

  function closeAIModal() {
    document.getElementById("ai-modal")?.classList.remove("open");
  }

  function renderReferences() {
    const grid = document.getElementById("references-grid");
    if (!grid) return;
    grid.innerHTML = DATA.designReferences
      .map(
        (r) => `
      <a href="${escapeHTML(r.url)}" target="_blank" rel="noopener noreferrer" class="card" style="text-decoration:none; color:inherit; display:flex; flex-direction:column; justify-content:space-between; gap:8px;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="color:var(--accent-orange); font-size:0.94rem;">${escapeHTML(r.name)}</strong>
            <span>↗</span>
          </div>
          <p style="font-size:0.78rem; color:var(--text-secondary);">${escapeHTML(r.highlight)}</p>
        </div>
        <div style="font-size:0.74rem; color:var(--text-muted); border-top:1px solid var(--border-subtle); padding-top:6px;">
          ${escapeHTML(r.applied)}
        </div>
      </a>`
      )
      .join("");
  }

  // ========================================================================
  // 8. Global Shortcuts & Event Bindings
  // ------------------------------------------------------------------------
  function bindEvents() {
    document.getElementById("theme-toggle")?.addEventListener("click", () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      applyTheme();
      saveState();
    });

    document.getElementById("xray-toggle-btn")?.addEventListener("click", () => {
      state.xrayBlue = !state.xrayBlue;
      applyXray();
      saveState();
    });

    document.getElementById("toggle-grid-btn")?.addEventListener("click", () => {
      state.gridCollapsed = !state.gridCollapsed;
      document.getElementById("modes-grid")?.classList.toggle("collapsed", state.gridCollapsed);
    });

    document.getElementById("global-deck-filter")?.addEventListener("change", (e) => {
      state.deckFilter = e.target.value;
      rebuildShuffledOrder();
      saveState();
      mState.m1Idx = 0;
      mState.m2Idx = 0;
      mState.m3Idx = 0;
      mState.m4Idx = 0;
      renderActiveMode();
    });

    document.getElementById("global-shuffle-toggle")?.addEventListener("click", () => {
      state.shuffleOrder = !state.shuffleOrder;
      if (state.shuffleOrder) rebuildShuffledOrder();
      saveState();
      mState.m1Idx = 0;
      mState.m2Idx = 0;
      mState.m3Idx = 0;
      mState.m4Idx = 0;
      renderActiveMode();
    });

    document.getElementById("global-reshuffle-btn")?.addEventListener("click", () => {
      state.shuffleOrder = true;
      rebuildShuffledOrder();
      saveState();
      mState.m1Idx = 0;
      mState.m2Idx = 0;
      mState.m3Idx = 0;
      mState.m4Idx = 0;
      renderActiveMode();
    });

    document.getElementById("global-random-btn")?.addEventListener("click", jumpToRandomInCurrentMode);

    document.getElementById("modes-grid")?.addEventListener("click", (e) => {
      const card = e.target.closest("[data-mode]");
      if (!card) return;
      switchMode(card.dataset.mode);
      document.getElementById("workspace-shell")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // AI Modal bindings with Key Prefix Auto-Detection + Live Model Discovery
    document.getElementById("open-ai-modal-btn")?.addEventListener("click", openAIModal);
    document.getElementById("close-ai-modal-btn")?.addEventListener("click", closeAIModal);
    document.getElementById("ai-modal")?.addEventListener("click", (e) => {
      if (e.target.id === "ai-modal") closeAIModal();
    });

    document.getElementById("ai-provider")?.addEventListener("change", (e) => {
      const prov = e.target.value;
      document.getElementById("ai-model").value = AI_PROVIDERS[prov].defaultModel;
      syncAIModalFields(prov);
    });

    document.getElementById("ai-apikey")?.addEventListener("input", (e) => {
      const detected = detectProviderFromKey(e.target.value);
      const st = document.getElementById("ai-modal-status");
      if (detected) {
        document.getElementById("ai-provider").value = detected;
        document.getElementById("ai-model").value = AI_PROVIDERS[detected].defaultModel;
        syncAIModalFields(detected);
        st.innerHTML = `<div class="feedback-box warn">🔍 Tự nhận diện đây là Key của <strong>${escapeHTML(AI_PROVIDERS[detected].name)}</strong>!</div>`;
      }
    });

    document.getElementById("ai-discover-btn")?.addEventListener("click", async () => {
      const prov = document.getElementById("ai-provider").value;
      const key = document.getElementById("ai-apikey").value.trim();
      const st = document.getElementById("ai-modal-status");
      const wrap = document.getElementById("ai-discovered-wrap");
      const sel = document.getElementById("ai-discovered-select");
      st.innerHTML = `<div class="feedback-box warn">⏳ Đang hỏi danh sách model khả dụng từ ${escapeHTML(AI_PROVIDERS[prov].name)}...</div>`;
      try {
        const models = await AIEngine.discoverModels(prov, key);
        sel.innerHTML = models.map((m) => `<option value="${escapeHTML(m)}">${escapeHTML(m)}</option>`).join("");
        wrap.style.display = "block";
        document.getElementById("ai-model").value = models[0];
        st.innerHTML = `<div class="feedback-box success">✅ Tìm thấy <strong>${models.length}</strong> model khả dụng! Đã tự chọn <strong>${escapeHTML(models[0])}</strong>.</div>`;
      } catch (err) {
        st.innerHTML = `<div class="feedback-box error">❌ Không dò được model: ${escapeHTML(err.message)}</div>`;
      }
    });

    document.getElementById("ai-discovered-select")?.addEventListener("change", (e) => {
      document.getElementById("ai-model").value = e.target.value;
    });

    document.getElementById("ai-save-btn")?.addEventListener("click", () => {
      saveAIConfig({
        provider: document.getElementById("ai-provider").value,
        model: document.getElementById("ai-model").value.trim(),
        apiKey: document.getElementById("ai-apikey").value.trim()
      });
      document.getElementById("ai-modal-status").innerHTML = `<div class="feedback-box success">✅ Đã lưu cấu hình AI!</div>`;
      if (activeMode === "m9") renderActiveMode();
    });

    document.getElementById("ai-clear-btn")?.addEventListener("click", () => {
      saveAIConfig({ provider: "builtin", model: AI_PROVIDERS.builtin.defaultModel, apiKey: "" });
      document.getElementById("ai-provider").value = "builtin";
      document.getElementById("ai-model").value = AI_PROVIDERS.builtin.defaultModel;
      document.getElementById("ai-apikey").value = "";
      syncAIModalFields("builtin");
      document.getElementById("ai-modal-status").innerHTML = `<div class="feedback-box success">⚡ Đã chuyển sang AI Sư Phạm Nội Bộ (Miễn phí 100%, Không cần Key)!</div>`;
      if (activeMode === "m9") renderActiveMode();
    });

    document.getElementById("ai-test-btn")?.addEventListener("click", async () => {
      const prov = document.getElementById("ai-provider").value;
      const model = document.getElementById("ai-model").value.trim();
      const key = document.getElementById("ai-apikey").value.trim();
      saveAIConfig({ provider: prov, model, apiKey: key });
      const st = document.getElementById("ai-modal-status");

      if (prov === "builtin") {
        st.innerHTML = `<div class="feedback-box success">⚡ <strong>AI Sư Phạm Nội Bộ đang hoạt động sẵn sàng!</strong> Không cần API Key hay mạng ngoài.</div>`;
        return;
      }

      st.innerHTML = `<div class="feedback-box warn">⏳ Đang thử kết nối tới ${escapeHTML(AI_PROVIDERS[prov].name)} (tự động đổi model nếu model cũ ngừng hỗ trợ)...</div>`;
      try {
        const res = await AIEngine.askStrictExternal(
          "Trả lời đúng 1 câu chào ngắn bằng tiếng Việt xác nhận kết nối thành công với DLU RequestMaster.",
          "Bạn là trợ lý tiếng Anh."
        );
        // Update visible fields in case auto-discovery upgraded the model or provider
        document.getElementById("ai-provider").value = aiConfig.provider;
        document.getElementById("ai-model").value = aiConfig.model;
        st.innerHTML = `<div class="feedback-box success">🎉 <strong>Kết nối thành công với model ${escapeHTML(aiConfig.model)}!</strong><br/>${escapeHTML(res)}</div>`;
      } catch (err) {
        st.innerHTML = `<div class="feedback-box error">❌ Kết nối thất bại: ${escapeHTML(err.message)}<br/><span style="font-size:0.8rem;">💡 Mẹo: Bạn vẫn có thể bấm nút <strong>"🗑️ Dùng AI Nội Bộ (0đ)"</strong> hoặc bấm <strong>"🔍 Dò Model từ Key"</strong> để chọn model khác!</span></div>`;
      }
    });

    // Global delegated speak button
    document.body.addEventListener("click", (e) => {
      const sp = e.target.closest(".speak-btn");
      if (sp && sp.dataset.speak) AudioEngine.speak(sp.dataset.speak);
    });

    // Global Keyboard Shortcuts (Space, 1-4, Enter)
    document.addEventListener("keydown", (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || tag === "select";
      if (isTyping) return;

      if (e.code === "Space") {
        if (activeMode === "m1") {
          e.preventDefault();
          document.getElementById("m1-card")?.click();
        } else if (activeMode === "m3") {
          e.preventDefault();
          document.getElementById("m3-play")?.click();
        }
      } else if (activeMode === "m2" && ["1", "2", "3", "4"].includes(e.key)) {
        const idx = Number(e.key) - 1;
        document.querySelector(`[data-m2-pick="${idx}"]`)?.click();
      } else if (e.key === "Enter" && activeMode === "m2" && mState.m2Answered) {
        document.getElementById("m2-next-btn")?.click();
      }
    });
  }

  function init() {
    applyTheme();
    applyXray();
    if (state.shuffleOrder) rebuildShuffledOrder();
    updateAIStatusUI();
    updateGlobalStatsUI();
    renderReferences();
    switchMode("m1");
    bindEvents();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
