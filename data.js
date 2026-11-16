// DLU Classroom Request Master - Complete Curriculum Data
// Extracted 100% from "CẨM NANG CÂU YÊU CẦU TRONG LỚP HỌC TIẾNG ANH"
// Designed for English Teacher Education Students - Dalat University (Đại học Đà Lạt)

window.DLU_DATA = {
  meta: {
    title: "CẨM NANG CÂU YÊU CẦU TRONG LỚP HỌC TIẾNG ANH",
    university: "Đại học Đà Lạt (Dalat University)",
    major: "Sư phạm Tiếng Anh • Tiếng Anh trong Khoa học Giáo dục",
    speakerRole: "Giáo viên dạy tiếng Anh tại trường học (a teacher teaching English at school)",
    testType: "Request Construction Test"
  },

  examCriteria: [
    {
      id: "grammar",
      badge: "01 • GRAMMAR",
      title: "Ngữ pháp chính xác",
      enTitle: "Grammar Accuracy",
      desc: "Dùng đúng dạng động từ nguyên mẫu (V-inf) sau Please / Could you, dùng V-ing sau Would you mind / before, chia đúng mạo từ (a/an/the), tính từ sở hữu (your) và giới từ cố định."
    },
    {
      id: "clarity",
      badge: "02 • CLARITY",
      title: "Rõ ràng, đủ nghĩa",
      enTitle: "Clarity & Completeness",
      desc: "Chuyển từ gợi ý rời rạc (ví dụ: open / textbooks) thành mệnh lệnh hoặc yêu cầu có đầy đủ tân ngữ, trạng từ cách thức (carefully), cụm chỉ nơi chốn & thời gian."
    },
    {
      id: "appropriateness",
      badge: "03 • APPROPRIATENESS",
      title: "Phù hợp ngữ cảnh sư phạm",
      enTitle: "Pedagogical Appropriateness",
      desc: "Đúng vai người nói là giáo viên tiếng Anh tại trường học: thân thiện, khích lệ, lịch sự (Could you / Would you mind) khi đề nghị, dứt khoát và rõ ràng khi điều phối lớp."
    }
  ],

  formulas: [
    {
      id: "affirmative",
      name: "Khẳng định (Affirmative)",
      level: "A1 – B1",
      formula: "V(nguyên mẫu) + O (+ bổ ngữ)",
      pleaseRule: [
        "Đầu câu: Please + V...",
        "Cuối câu: V..., please."
      ],
      examples: [
        {
          sentence: "Please open your textbooks to page 79.",
          vi: "Vui lòng mở sách giáo khoa của các em đến trang 79.",
          glueWords: ["Please", "your", "to page 79"],
          pleasePos: "start"
        },
        {
          sentence: "Wait for your turn, please.",
          vi: "Vui lòng chờ đến lượt của em nhé.",
          glueWords: ["for", "your", "please"],
          pleasePos: "end"
        }
      ],
      transformer: {
        prompt: "open / textbooks / page 79",
        startPlease: "Please open your textbooks to page 79.",
        endPlease: "Open your textbooks to page 79, please."
      }
    },
    {
      id: "negative",
      name: "Phủ định (Negative)",
      level: "A1 – B1",
      formula: "Don’t / Do not + V(nguyên mẫu) + O",
      pleaseRule: [
        "Đầu câu: Please don’t + V...",
        "Cuối câu: Don’t + V..., please."
      ],
      examples: [
        {
          sentence: "Please don’t use your phones in class.",
          vi: "Xin vui lòng không sử dụng điện thoại trong lớp học.",
          glueWords: ["Please", "don’t", "your", "in class"],
          pleasePos: "start"
        },
        {
          sentence: "Don’t talk during the test, please.",
          vi: "Xin đừng nói chuyện trong giờ kiểm tra.",
          glueWords: ["Don’t", "during the test", "please"],
          pleasePos: "end"
        }
      ],
      transformer: {
        prompt: "not / use / phones / class",
        startPlease: "Please don’t use your phones in class.",
        endPlease: "Don’t use your phones in class, please."
      }
    },
    {
      id: "polite-question",
      name: "Nghi vấn lịch sự (Polite Question)",
      level: "A2 – B2",
      formula: "Could / Would / Can / Will + you + V(nguyên mẫu) + O?",
      pleaseRule: [
        "Sau “you”: Could you please + V...?",
        "Cuối câu: Could you + V..., please?"
      ],
      examples: [
        {
          sentence: "Could you please look at the board?",
          vi: "Các em có thể nhìn lên bảng được không?",
          glueWords: ["Could you please", "at", "the"],
          pleasePos: "mid"
        },
        {
          sentence: "Could you work with a partner, please?",
          vi: "Các em có thể làm việc cùng một bạn được không?",
          glueWords: ["Could you", "with", "a", "please"],
          pleasePos: "end"
        }
      ],
      transformer: {
        prompt: "look / board?",
        startPlease: "Could you please look at the board?",
        endPlease: "Could you look at the board, please?"
      }
    },
    {
      id: "very-polite",
      name: "Nghi vấn trang trọng (Very Polite - B1/B2)",
      level: "B1 – B2",
      formula: "Would you mind + V-ing + O? / Do you mind + V-ing + O?",
      pleaseRule: [
        "Thường không cần “please” vì bản thân cấu trúc đã rất lịch sự (có thể thêm ở cuối nếu nhấn mạnh)."
      ],
      examples: [
        {
          sentence: "Would you mind closing the window?",
          vi: "Em có phiền đóng giúp cô/thầy cái cửa sổ không?",
          glueWords: ["Would you mind", "closing", "the"],
          pleasePos: "none"
        },
        {
          sentence: "Would you mind speaking a bit louder?",
          vi: "Em có phiền nói to hơn một chút được không?",
          glueWords: ["Would you mind", "speaking", "a bit"],
          pleasePos: "none"
        }
      ],
      transformer: {
        prompt: "mind / close / window?",
        startPlease: "Would you mind closing the window?",
        endPlease: "Would you mind closing the window, please?"
      }
    }
  ],

  examTip: {
    title: "Mẹo làm bài thi cực kỳ quan trọng",
    content: "Khi đề bài gợi ý kết thúc bằng dấu hỏi chấm (?) như câu 8, 11, 12, 13 trong file mẫu, bạn bắt buộc phải dùng dạng Nghi vấn (Could you... / Would you...). Khi không có dấu hỏi, dùng dạng Khẳng định (Please + V...) là tự nhiên và gọn gàng nhất."
  },

  blueGlueRules: [
    {
      id: "phrasal-verbs",
      title: "1. Cụm động từ (Phrasal Verbs)",
      examples: [
        "take out (lấy ra)",
        "look up (tra cứu)",
        "fill in (điền vào)",
        "make sure (đảm bảo)",
        "wait for (chờ đợi)",
        "keep ... away (cất đi)"
      ],
      note: "Động từ đi kèm giới từ cố định để tạo nghĩa mới. Phải học thuộc theo cụm (ví dụ: look up a word, fill in the blanks)."
    },
    {
      id: "prep-phrases",
      title: "2. Cụm giới từ chỉ vị trí & thời gian",
      examples: [
        "to page 79",
        "on page 20",
        "in the blanks",
        "at the top of the paper",
        "for a moment",
        "with a partner",
        "before the next lesson"
      ],
      note: "• Mở sách tới trang: open ... to page X • Bài tập nằm trên trang: on page X • Đầu trang/tờ giấy: at the top of..."
    },
    {
      id: "connectors-clauses",
      title: "3. Từ nối & Mệnh đề bổ sung ý",
      examples: [
        "to complete... / to look up... (mục đích)",
        "if you have... (điều kiện)",
        "what will happen next (mệnh đề danh ngữ)",
        "and (nối 2 hành động)"
      ],
      note: "Dùng “to + V” để giải thích làm gì; dùng “if” khi có điều kiện; dùng “what will...” làm tân ngữ cho động từ predict."
    },
    {
      id: "adverbs-manner",
      title: "4. Trạng từ chỉ cách thức",
      examples: [
        "carefully (một cách cẩn thận)"
      ],
      note: "Đứng sau động từ hoặc sau tân ngữ (read the instructions carefully / listen to the audio carefully) để tăng tính rõ ràng."
    }
  ],

  determinerRules: [
    {
      id: "a-an",
      token: "a / an",
      rule: "Danh từ đếm được số ít, nhắc lần đầu, mang nghĩa “một ... bất kỳ” (dùng “an” trước nguyên âm u, e, o, a, i).",
      examples: [
        "a sheet of paper",
        "a dictionary",
        "a partner",
        "a question",
        "an interesting fact"
      ]
    },
    {
      id: "the",
      token: "the",
      rule: "Cả giáo viên và học sinh đều biết rõ đang nói về vật/phần nào trong lớp (bài nghe, bảng, chỗ trống, nhiệm vụ tiếp theo).",
      examples: [
        "the audio",
        "the blanks",
        "the conversation",
        "the main idea",
        "the next lesson",
        "the board",
        "the next task",
        "the paper"
      ]
    },
    {
      id: "your",
      token: "your",
      rule: "Đồ dùng, bài làm hoặc bộ phận cơ thể thuộc về chính học sinh.",
      examples: [
        "your textbooks",
        "your homework",
        "your hand",
        "your name",
        "your turn",
        "your phones"
      ]
    }
  ],

  qaAndCorrections: {
    questions: [
      {
        id: "qa-11",
        tag: "Câu 11",
        question: "Tại sao dùng “if you have a question” thay vì “to answer a question”?",
        answer: "Cả hai đều đúng ngữ pháp nhưng khác tình huống giao tiếp. “Raise your hand if you have a question” là lời dặn học sinh giơ tay khi có thắc mắc muốn hỏi giáo viên. Còn nếu giáo viên vừa đặt câu hỏi và gọi học sinh phát biểu, nên viết là “Could you please raise your hand to answer the question?” (dùng mạo từ “the” vì câu hỏi đã xác định)."
      },
      {
        id: "qa-14",
        tag: "Câu 14",
        question: "Tại sao dùng “at the top of the paper” mà không dùng “on the top of the page”?",
        answer: "Để chỉ vị trí trên bề mặt trang giấy/bảng/danh sách, tiếng Anh dùng cụm giới từ cố định “at the top of” (ở phần đầu) và “at the bottom of” (ở phần cuối). Còn “on (the) top of” mang nghĩa vật lý là đặt chồng lên trên đỉnh một vật (ví dụ: on top of the desk). Bạn có thể dùng “at the top of the paper” (tờ giấy kiểm tra) hoặc “at the top of the page” (trang giấy) đều chuẩn."
      }
    ],
    corrections: [
      {
        id: "fix-2",
        sentenceNum: "Câu 2",
        wrong: "the answer of question",
        right: "the answer to the question",
        reason: "Danh từ “answer” đi với giới từ “to” (và dùng “the” cho question xác định)."
      },
      {
        id: "fix-8",
        sentenceNum: "Câu 8",
        wrong: "your self",
        right: "yourself",
        reason: "Đại từ phản thân viết liền thành một từ duy nhất: “yourself”."
      },
      {
        id: "fix-9",
        sentenceNum: "Câu 9",
        wrong: "comple",
        right: "complete",
        reason: "Sửa lỗi gõ từ nguyên mẫu “complete” (hoàn thành)."
      }
    ]
  },

  sample16Sentences: [
    {
      num: 1,
      prompt: "open / textbooks / page 79",
      sentence: "Please open your textbooks to page 79.",
      blueParts: ["Please", "your", "to page 79"],
      vi: "Vui lòng mở sách giáo khoa của các em đến trang 79.",
      note: "Cụm giới từ mở sách tới trang: open ... to page X."
    },
    {
      num: 2,
      prompt: "write / answer / question",
      sentence: "Please write down the answer to the question.",
      blueParts: ["Please", "down", "the", "to the"],
      vi: "Vui lòng viết câu trả lời cho câu hỏi.",
      note: "Lỗi mẫu đã sửa: 'the answer to the question' (không dùng 'of question')."
    },
    {
      num: 3,
      prompt: "take out / sheet of paper",
      sentence: "Please take out a sheet of paper.",
      blueParts: ["Please", "take out", "a"],
      vi: "Vui lòng lấy ra một tờ giấy.",
      note: "Phrasal verb 'take out' + mạo từ 'a' (nhắc lần đầu)."
    },
    {
      num: 4,
      prompt: "use / dictionary / look up / new words",
      sentence: "Please use a dictionary to look up the new words.",
      blueParts: ["Please", "a", "to look up", "the"],
      vi: "Vui lòng sử dụng từ điển để tra cứu các từ mới.",
      note: "Mục đích 'to + V' kết hợp phrasal verb 'look up'."
    },
    {
      num: 5,
      prompt: "fill in / blanks / page 20",
      sentence: "Please fill in the blanks on page 20.",
      blueParts: ["Please", "fill in", "the", "on page 20"],
      vi: "Vui lòng điền vào chỗ trống ở trang 20.",
      note: "Bài tập nằm trên trang dùng 'on page 20'; 'the blanks' đã xác định."
    },
    {
      num: 6,
      prompt: "listen / audio / carefully",
      sentence: "Please listen to the audio carefully.",
      blueParts: ["Please", "to", "the", "carefully"],
      vi: "Vui lòng lắng nghe đoạn băng một cách cẩn thận.",
      note: "Trạng từ cách thức 'carefully' đứng cuối câu để tăng tính rõ ràng."
    },
    {
      num: 7,
      prompt: "read / instructions / carefully / before / next task",
      sentence: "Please read the instructions carefully before starting the next task.",
      blueParts: ["Please", "the", "carefully", "before starting", "the"],
      vi: "Vui lòng đọc kỹ hướng dẫn trước khi bắt đầu nhiệm vụ tiếp theo.",
      note: "Trạng từ 'carefully' đứng sau tân ngữ; 'the next task' xác định."
    },
    {
      num: 8,
      prompt: "introduce / yourself / class?",
      sentence: "Could you please introduce yourself to the class?",
      blueParts: ["Could you please", "yourself", "to", "the"],
      vi: "Em có thể tự giới thiệu bản thân trước lớp được không?",
      note: "Có dấu '?' -> bắt buộc dùng nghi vấn; 'yourself' viết liền (đã sửa lỗi 'your self')."
    },
    {
      num: 9,
      prompt: "work / partner / complete / next task",
      sentence: "Please work with a partner to complete the next task.",
      blueParts: ["Please", "with a partner", "to complete", "the"],
      vi: "Vui lòng làm việc cùng một bạn để hoàn thành nhiệm vụ tiếp theo.",
      note: "Đã sửa lỗi 'comple' -> 'complete'; dùng 'to complete' chỉ mục đích."
    },
    {
      num: 10,
      prompt: "make sure / finish / homework / before / next lesson",
      sentence: "Please make sure you finish your homework before the next lesson.",
      blueParts: ["Please", "make sure", "your", "before the next lesson"],
      vi: "Hãy đảm bảo các em hoàn thành bài tập về nhà trước tiết học tiếp theo.",
      note: "Cụm động từ 'make sure' + cụm thời gian 'before the next lesson'."
    },
    {
      num: 11,
      prompt: "raise / hand / if / have / question?",
      sentence: "Could you please raise your hand if you have a question?",
      blueParts: ["Could you please", "your", "if you have", "a"],
      vi: "Các em vui lòng giơ tay nếu có câu hỏi được không?",
      note: "Có '?' -> Nghi vấn lịch sự; mệnh đề điều kiện 'if you have a question' (Giải đáp mục 2.3)."
    },
    {
      num: 12,
      prompt: "look / board / moment?",
      sentence: "Could you please look at the board for a moment?",
      blueParts: ["Could you please", "at", "the", "for a moment"],
      vi: "Các em có thể nhìn lên bảng một lát được không?",
      note: "Có '?' -> Nghi vấn lịch sự; cụm thời gian 'for a moment'."
    },
    {
      num: 13,
      prompt: "practice / conversation / partner?",
      sentence: "Could you practice the conversation with a partner, please?",
      blueParts: ["Could you", "the", "with a partner", "please"],
      vi: "Các em có thể thực hành đoạn hội thoại cùng bạn được không?",
      note: "Có '?' -> Nghi vấn lịch sự; 'the conversation' đã xác định, 'a partner' bất kỳ."
    },
    {
      num: 14,
      prompt: "write / name / top / paper",
      sentence: "Please write your name at the top of the paper.",
      blueParts: ["Please", "your", "at the top of", "the"],
      vi: "Vui lòng viết tên của em ở đầu tờ giấy.",
      note: "Cụm cố định 'at the top of the paper' (không dùng 'on top of')."
    },
    {
      num: 15,
      prompt: "share / interesting fact / main idea / predict / what / happen next",
      sentence: "Please share an interesting fact about the main idea and predict what will happen next.",
      blueParts: ["Please", "an", "the", "and", "what will happen next"],
      vi: "Vui lòng chia sẻ một thông tin thú vị về ý chính và dự đoán điều gì sẽ xảy ra tiếp theo.",
      note: "Dùng 'an' trước nguyên âm 'interesting'; mệnh đề danh ngữ 'what will happen next'."
    },
    {
      num: 16,
      prompt: "keep / phones / away / wait / turn",
      sentence: "Please keep your phones away and wait for your turn, please.",
      blueParts: ["Please", "your", "away", "and", "wait for", "your", "please"],
      vi: "Vui lòng cất điện thoại đi và chờ đến lượt của em nhé.",
      note: "Cụm động từ 'keep ... away', 'wait for', từ nối 'and' và tính từ sở hữu 'your'."
    }
  ],

  cefrExamples: [
    {
      level: "A1",
      label: "A1 (Cơ bản)",
      characteristic: "Mệnh lệnh đơn giản, 1 hành động quen thuộc.",
      items: [
        { prompt: "close / books", sentence: "Please close your books." },
        { prompt: "be quiet / please", sentence: "Please be quiet." }
      ]
    },
    {
      level: "A2",
      label: "A2 (Sơ trung cấp)",
      characteristic: "Kết hợp 2 hành động, thêm cụm giới từ & mạo từ.",
      items: [
        { prompt: "work / pairs / ask / answer", sentence: "Please work in pairs to ask and answer the questions." }
      ]
    },
    {
      level: "B1",
      label: "B1 (Trung cấp)",
      characteristic: "Dùng câu hỏi lịch sự, mệnh đề điều kiện (if / before), cụm động từ (hand in, jot down, go over).",
      items: [
        { prompt: "hand in / assignment / before / leave?", sentence: "Could you please hand in your assignment before you leave?" },
        { prompt: "jot down / main points / board", sentence: "Please jot down the main points from the board." }
      ]
    },
    {
      level: "B1+",
      label: "B1+ (Trung cấp cao)",
      characteristic: "Cấu trúc nhấn mạnh sự cẩn trọng (make sure, double-check, pay attention to), câu phủ định lịch sự.",
      items: [
        { prompt: "double-check / answers / before / turn in", sentence: "Please double-check your answers before turning in your paper." },
        { prompt: "refrain / speak / Vietnamese / activity", sentence: "Please refrain from speaking Vietnamese during this activity." }
      ]
    },
    {
      level: "B2",
      label: "B2 (Trung cao cấp)",
      characteristic: "Cấu trúc trang trọng (Would you mind + V-ing, I’d appreciate it if..., Make sure that...), từ vựng học thuật.",
      items: [
        { prompt: "mind / summarize / main points / passage?", sentence: "Would you mind summarizing the main points of the passage?" },
        { prompt: "appreciate / keep / noise / minimum", sentence: "I’d appreciate it if you could keep the noise to a minimum." },
        { prompt: "come up with / two reasons / support / view", sentence: "Please work in groups to come up with two reasons to support your view." }
      ]
    }
  ],

  exercises: {
    type1: [
      // Dạng 1A: 1–9
      {
        id: "t1-1",
        part: "1A",
        num: 1,
        level: "A1",
        prompt: "sit down / please",
        answer: "Please sit down.",
        acceptedAnswers: ["Please sit down.", "Sit down, please."],
        blueTokens: ["Please"],
        isQuestion: false,
        explanation: "Mệnh lệnh đơn giản mức A1 với 'Please' ở đầu câu (hoặc cuối câu)."
      },
      {
        id: "t1-2",
        part: "1A",
        num: 2,
        level: "A1",
        prompt: "not / talk / class",
        answer: "Please don’t talk in class.",
        acceptedAnswers: ["Please don't talk in class.", "Please do not talk in class.", "Don't talk in class, please."],
        blueTokens: ["Please", "don’t", "in"],
        isQuestion: false,
        explanation: "Câu phủ định dùng 'Please don't + V(nguyên mẫu)' và cụm giới từ 'in class'."
      },
      {
        id: "t1-3",
        part: "1A",
        num: 3,
        level: "A2",
        prompt: "underline / new words / text",
        answer: "Please underline the new words in the text.",
        acceptedAnswers: ["Please underline the new words in the text.", "Underline the new words in the text, please."],
        blueTokens: ["Please", "the", "in the"],
        isQuestion: false,
        explanation: "Thêm mạo từ 'the' trước 'new words' và 'text' vì cả lớp đều biết đoạn văn nào."
      },
      {
        id: "t1-4",
        part: "1A",
        num: 4,
        level: "A2",
        prompt: "check / answers / partner",
        answer: "Please check your answers with a partner.",
        acceptedAnswers: ["Please check your answers with a partner.", "Check your answers with a partner, please."],
        blueTokens: ["Please", "your", "with a"],
        isQuestion: false,
        explanation: "Dùng tính từ sở hữu 'your' (bài làm của học sinh) và cụm giới từ 'with a partner'."
      },
      {
        id: "t1-5",
        part: "1A",
        num: 5,
        level: "A2",
        prompt: "repeat / after me / louder?",
        answer: "Could you repeat after me a bit louder, please?",
        acceptedAnswers: ["Could you repeat after me a bit louder, please?", "Could you please repeat after me a bit louder?", "Would you please repeat after me a bit louder?"],
        blueTokens: ["Could you", "a bit", "please"],
        isQuestion: true,
        explanation: "Đề bài có dấu '?' nên bắt buộc dùng nghi vấn lịch sự (Could you...)."
      },
      {
        id: "t1-6",
        part: "1A",
        num: 6,
        level: "B1",
        prompt: "turn off / lights / before / leave?",
        answer: "Could you please turn off the lights before you leave?",
        acceptedAnswers: ["Could you please turn off the lights before you leave?", "Could you turn off the lights before you leave, please?", "Could you please turn off the lights before leaving?"],
        blueTokens: ["Could you please", "the", "you"],
        isQuestion: true,
        explanation: "Có '?' -> Nghi vấn lịch sự + 'the lights' + mệnh đề thời gian 'before you leave'."
      },
      {
        id: "t1-7",
        part: "1A",
        num: 7,
        level: "B1",
        prompt: "write / short paragraph / describe / hobby",
        answer: "Please write a short paragraph to describe your hobby.",
        acceptedAnswers: ["Please write a short paragraph to describe your hobby."],
        blueTokens: ["Please", "a", "to", "your"],
        isQuestion: false,
        explanation: "Dùng 'a' trước 'short paragraph' (một đoạn văn), 'to describe' chỉ mục đích và 'your hobby'."
      },
      {
        id: "t1-8",
        part: "1A",
        num: 8,
        level: "B1",
        prompt: "not / forget / put / name / top / worksheet",
        answer: "Please don’t forget to put your name at the top of the worksheet.",
        acceptedAnswers: ["Please don't forget to put your name at the top of the worksheet.", "Please do not forget to put your name at the top of the worksheet."],
        blueTokens: ["Please", "don’t", "to", "your", "at the", "of the"],
        isQuestion: false,
        explanation: "Phủ định 'Please don't forget to V' kết hợp cụm vị trí chuẩn 'at the top of the worksheet'."
      },
      {
        id: "t1-9",
        part: "1A",
        num: 9,
        level: "B1",
        prompt: "pay attention / pronunciation / word?",
        answer: "Could you please pay attention to the pronunciation of this word?",
        acceptedAnswers: ["Could you please pay attention to the pronunciation of this word?", "Could you pay attention to the pronunciation of this word, please?", "Could you please pay attention to the pronunciation of the word?"],
        blueTokens: ["Could you please", "to", "the", "of this"],
        isQuestion: true,
        explanation: "Có '?' -> Nghi vấn lịch sự; cụm cố định 'pay attention to' + 'the pronunciation of this word'."
      },

      // Dạng 1B: 10–21
      {
        id: "t1-10",
        part: "1B",
        num: 10,
        level: "B1",
        prompt: "go over / grammar notes / before / quiz",
        answer: "Please go over your grammar notes before the quiz.",
        acceptedAnswers: ["Please go over your grammar notes before the quiz."],
        blueTokens: ["Please", "your", "the"],
        isQuestion: false,
        explanation: "Phrasal verb 'go over' (ôn lại/xem lại) + 'your grammar notes' + 'before the quiz'."
      },
      {
        id: "t1-11",
        part: "1B",
        num: 11,
        level: "B1",
        prompt: "jot down / key ideas / while / listen / lecture",
        answer: "Please jot down the key ideas while you listen to the lecture.",
        acceptedAnswers: ["Please jot down the key ideas while you listen to the lecture.", "Please jot down the key ideas while listening to the lecture."],
        blueTokens: ["Please", "the", "you", "to the"],
        isQuestion: false,
        explanation: "Phrasal verb 'jot down' (ghi chú nhanh) + 'listen to the lecture'."
      },
      {
        id: "t1-12",
        part: "1B",
        num: 12,
        level: "B1",
        prompt: "pass out / handouts / classmates?",
        answer: "Could you please pass out these handouts to your classmates?",
        acceptedAnswers: ["Could you please pass out these handouts to your classmates?", "Could you please pass out the handouts to your classmates?", "Could you pass out these handouts to your classmates, please?"],
        blueTokens: ["Could you please", "these", "to your"],
        isQuestion: true,
        explanation: "Có '?' -> Nghi vấn lịch sự + phrasal verb 'pass out ... to your classmates'."
      },
      {
        id: "t1-13",
        part: "1B",
        num: 13,
        level: "B1",
        prompt: "cross out / wrong word / write / correct one / above",
        answer: "Please cross out the wrong word and write the correct one above it.",
        acceptedAnswers: ["Please cross out the wrong word and write the correct one above it."],
        blueTokens: ["Please", "the", "and", "the", "it"],
        isQuestion: false,
        explanation: "Nối hai mệnh lệnh bằng 'and', dùng 'cross out' (gạch bỏ) và đại từ thay thế 'above it'."
      },
      {
        id: "t1-14",
        part: "1B",
        num: 14,
        level: "B1+",
        prompt: "catch up / missed lessons / end / week",
        answer: "Please catch up on your missed lessons by the end of the week.",
        acceptedAnswers: ["Please catch up on your missed lessons by the end of the week.", "Please catch up on the missed lessons by the end of the week."],
        blueTokens: ["Please", "on", "your", "by the", "of the"],
        isQuestion: false,
        explanation: "Phrasal verb 3 từ 'catch up on' (học bù/theo kịp) + cụm hạn chót 'by the end of the week'."
      },
      {
        id: "t1-15",
        part: "1B",
        num: 15,
        level: "B1+",
        prompt: "figure out / meaning / idiom / context",
        answer: "Please try to figure out the meaning of the idiom from the context.",
        acceptedAnswers: ["Please try to figure out the meaning of the idiom from the context.", "Please figure out the meaning of the idiom from the context."],
        blueTokens: ["Please", "try to", "the", "of the", "from the"],
        isQuestion: false,
        explanation: "Cụm 'figure out the meaning of ... from the context' (đoán nghĩa từ ngữ cảnh)."
      },
      {
        id: "t1-16",
        part: "1B",
        num: 16,
        level: "B2",
        prompt: "mind / explain / reason / choice?",
        answer: "Would you mind explaining the reason for your choice?",
        acceptedAnswers: ["Would you mind explaining the reason for your choice?", "Do you mind explaining the reason for your choice?"],
        blueTokens: ["Would you", "explaining", "the", "for your"],
        isQuestion: true,
        explanation: "Cấu trúc trang trọng B2: Would you mind + V-ing + O? Và danh từ 'reason for'."
      },
      {
        id: "t1-17",
        part: "1B",
        num: 17,
        level: "B2",
        prompt: "compare / findings / group / present / class",
        answer: "Please compare your findings with your group and present them to the class.",
        acceptedAnswers: ["Please compare your findings with your group and present them to the class."],
        blueTokens: ["Please", "your", "with your", "and", "them to the"],
        isQuestion: false,
        explanation: "Cấu trúc song song: compare A with B and present them to the class."
      },
      {
        id: "t1-18",
        part: "1B",
        num: 18,
        level: "B2",
        prompt: "come up with / practical solution / problem / groups of four",
        answer: "Please come up with a practical solution to the problem in groups of four.",
        acceptedAnswers: ["Please come up with a practical solution to the problem in groups of four."],
        blueTokens: ["Please", "a", "to the", "in"],
        isQuestion: false,
        explanation: "Phrasal verb 'come up with' (nghĩ ra) + 'solution to the problem' + 'in groups of four'."
      },
      {
        id: "t1-19",
        part: "1B",
        num: 19,
        level: "B2",
        prompt: "mind / read out / second paragraph / whole class?",
        answer: "Would you mind reading out the second paragraph to the whole class?",
        acceptedAnswers: ["Would you mind reading out the second paragraph to the whole class?", "Do you mind reading out the second paragraph to the whole class?"],
        blueTokens: ["Would you", "reading", "the", "to the"],
        isQuestion: true,
        explanation: "Would you mind + V-ing (reading out) + 'to the whole class'."
      },
      {
        id: "t1-20",
        part: "1B",
        num: 20,
        level: "B2",
        prompt: "make sure / cite / sources / bottom / essay",
        answer: "Please make sure you cite your sources at the bottom of your essay.",
        acceptedAnswers: ["Please make sure you cite your sources at the bottom of your essay.", "Please make sure you cite your sources at the bottom of the essay.", "Make sure you cite your sources at the bottom of your essay."],
        blueTokens: ["Please", "you", "your", "at the", "of your"],
        isQuestion: false,
        explanation: "Cụm nhấn mạnh 'Please make sure you + V' và vị trí 'at the bottom of'."
      },
      {
        id: "t1-21",
        part: "1B",
        num: 21,
        level: "B2",
        prompt: "appreciate / turn in / final draft / Friday afternoon",
        answer: "I’d appreciate it if you could turn in your final draft by Friday afternoon.",
        acceptedAnswers: ["I'd appreciate it if you could turn in your final draft by Friday afternoon.", "I would appreciate it if you could turn in your final draft by Friday afternoon."],
        blueTokens: ["I’d", "it if you could", "your", "by"],
        isQuestion: false,
        explanation: "Cấu trúc trang trọng B2: 'I'd appreciate it if you could + V...' + 'by + mốc thời gian'."
      }
    ],

    type2: [
      {
        id: "t2-1",
        num: 1,
        level: "A2",
        template: "Please open your workbooks ____ page 45 and look ____ Exercise 2.",
        blanks: [
          { answer: "to", options: ["to", "on", "at", "in"] },
          { answer: "at", options: ["at", "to", "for", "on"] }
        ],
        explanation: "Mở sách tới trang dùng 'open ... to page 45'; nhìn vào bài tập dùng 'look at Exercise 2'."
      },
      {
        id: "t2-2",
        num: 2,
        level: "A2",
        template: "Could you write ____ example sentence on ____ board, please?",
        blanks: [
          { answer: "an", options: ["an", "a", "the", "your"] },
          { answer: "the", options: ["the", "a", "an", "on"] }
        ],
        explanation: "'example' bắt đầu bằng nguyên âm nên dùng 'an'; bảng lớp xác định dùng 'the board'."
      },
      {
        id: "t2-3",
        num: 3,
        level: "A2",
        template: "Please fill ____ the missing words while you listen to ____ recording.",
        blanks: [
          { answer: "in", options: ["in", "out", "up", "on"] },
          { answer: "the", options: ["the", "a", "an", "your"] }
        ],
        explanation: "Cụm động từ 'fill in' (điền vào) và bài nghe xác định 'the recording'."
      },
      {
        id: "t2-4",
        num: 4,
        level: "A2",
        template: "Make sure you hand ____ your essay before ____ end of the lesson.",
        blanks: [
          { answer: "in", options: ["in", "out", "up", "away"] },
          { answer: "the", options: ["the", "a", "an", "your"] }
        ],
        explanation: "'hand in' nghĩa là nộp bài; 'the end of the lesson' (cuối tiết học) luôn dùng 'the'."
      },
      {
        id: "t2-5",
        num: 5,
        level: "B1",
        template: "Could you share ____ interesting idea with ____ rest of the class?",
        blanks: [
          { answer: "an", options: ["an", "a", "the", "your"] },
          { answer: "the", options: ["the", "a", "an", "your"] }
        ],
        explanation: "'interesting' bắt đầu bằng nguyên âm -> 'an'; cụm cố định 'the rest of the class'."
      },
      {
        id: "t2-6",
        num: 6,
        level: "A2",
        template: "Please look ____ this phrasal verb in ____ dictionary.",
        blanks: [
          { answer: "up", options: ["up", "at", "for", "out"] },
          { answer: "a", accepted: ["a", "the"], options: ["a", "the", "an", "your"] }
        ],
        explanation: "'look up' (tra cứu từ điển) + 'in a dictionary' (hoặc 'the dictionary')."
      },
      {
        id: "t2-7",
        num: 7,
        level: "B1",
        template: "Please write your answers ____ pencil so you can erase mistakes easily.",
        blanks: [
          { answer: "in", options: ["in", "by", "with", "on"] }
        ],
        explanation: "Viết bằng bút chì/bút mực dùng giới từ 'in': in pencil / in ink / in pen."
      },
      {
        id: "t2-8",
        num: 8,
        level: "B1",
        template: "Could you work ____ groups of three to carry ____ this mini-survey?",
        blanks: [
          { answer: "in", options: ["in", "with", "on", "by"] },
          { answer: "out", options: ["out", "on", "up", "in"] }
        ],
        explanation: "Làm việc theo nhóm: 'work in groups of three'; thực hiện khảo sát: 'carry out'."
      },
      {
        id: "t2-9",
        num: 9,
        level: "B2",
        template: "Please point ____ any grammatical errors you notice ____ the first draft.",
        blanks: [
          { answer: "out", options: ["out", "up", "at", "in"] },
          { answer: "in", options: ["in", "on", "at", "to"] }
        ],
        explanation: "'point out' (chỉ ra) + 'in the first draft' (trong bản nháp đầu tiên)."
      },
      {
        id: "t2-10",
        num: 10,
        level: "B2",
        template: "Make sure you submit your assignment ____ time; late work won’t be accepted.",
        blanks: [
          { answer: "on", options: ["on", "in", "at", "by"] }
        ],
        explanation: "'on time' nghĩa là đúng giờ quy định (liên hệ vế sau: bài nộp trễ không được chấp nhận)."
      },
      {
        id: "t2-11",
        num: 11,
        level: "B2",
        template: "Please put ____ your phones and focus ____ the speaking task.",
        blanks: [
          { answer: "away", options: ["away", "out", "off", "down"] },
          { answer: "on", options: ["on", "at", "in", "to"] }
        ],
        explanation: "'put away' (cất đi) và 'focus on' (tập trung vào)."
      },
      {
        id: "t2-12",
        num: 12,
        level: "B2",
        template: "Could you run ____ the main instructions one more time ____ clarity?",
        blanks: [
          { answer: "through", options: ["through", "over", "out", "up"] },
          { answer: "for", options: ["for", "to", "with", "by"] }
        ],
        explanation: "'run through' (điểm qua nhanh) và 'for clarity' (để rõ ràng hơn)."
      }
    ],

    type3: [
      {
        id: "t3-1",
        num: 1,
        level: "A2",
        sentence: "Please to open your notebooks and copy the table.",
        errorWord: "to open",
        correction: "open",
        fixedSentence: "Please open your notebooks and copy the table.",
        explanation: "Bỏ “to” → Please open... (Sau Please dùng động từ nguyên mẫu không 'to')."
      },
      {
        id: "t3-2",
        num: 2,
        level: "A2",
        sentence: "Could you please raising your hand if you need help?",
        errorWord: "raising",
        correction: "raise",
        fixedSentence: "Could you please raise your hand if you need help?",
        explanation: "raising → raise (Sau động từ khuyết thiếu Could you please + V nguyên mẫu)."
      },
      {
        id: "t3-3",
        num: 3,
        level: "B1",
        sentence: "Please make sure your student ID is on the top of the page.",
        errorWord: "on the top",
        correction: "at the top",
        fixedSentence: "Please make sure your student ID is at the top of the page.",
        explanation: "on the top → at the top (Chỉ vị trí đầu trang giấy dùng cụm cố định 'at the top of')."
      },
      {
        id: "t3-4",
        num: 4,
        level: "A2",
        sentence: "Don’t forgot to bring a pen to the exam tomorrow.",
        errorWord: "forgot",
        correction: "forget",
        fixedSentence: "Don’t forget to bring a pen to the exam tomorrow.",
        explanation: "forgot → forget (Sau Don't phải dùng động từ nguyên mẫu)."
      },
      {
        id: "t3-5",
        num: 5,
        level: "B1",
        sentence: "Would you mind to read the first paragraph aloud?",
        errorWord: "to read",
        correction: "reading",
        fixedSentence: "Would you mind reading the first paragraph aloud?",
        explanation: "to read → reading (Cấu trúc chuẩn: Would you mind + V-ing)."
      },
      {
        id: "t3-6",
        num: 6,
        level: "B1",
        sentence: "Please turn off the lights before leave the classroom.",
        errorWord: "leave",
        correction: "leaving",
        fixedSentence: "Please turn off the lights before leaving the classroom.",
        explanation: "leave → leaving (before + V-ing khi không có chủ ngữ theo sau)."
      },
      {
        id: "t3-7",
        num: 7,
        level: "B2",
        sentence: "I’d appreciate it if you could handing in your report by 5 p.m.",
        errorWord: "handing",
        correction: "hand",
        fixedSentence: "I’d appreciate it if you could hand in your report by 5 p.m.",
        explanation: "handing → hand (Sau 'could' luôn dùng V nguyên mẫu)."
      },
      {
        id: "t3-8",
        num: 8,
        level: "B2",
        sentence: "Please make sure that everyone have a copy of the worksheet.",
        errorWord: "have",
        correction: "has",
        fixedSentence: "Please make sure that everyone has a copy of the worksheet.",
        explanation: "have → has (Đại từ bất định 'everyone' luôn đi với động từ chia số ít)."
      }
    ],

    type4: [
      {
        id: "t4-1",
        num: 1,
        level: "B1",
        source: "Read the dialogue with your partner.",
        constraint: "Dùng Could you..., please?",
        answer: "Could you read the dialogue with your partner, please?",
        acceptedAnswers: ["Could you read the dialogue with your partner, please?"],
        explanation: "Chuyển mệnh lệnh thành nghi vấn lịch sự với 'Could you + V..., please?'."
      },
      {
        id: "t4-2",
        num: 2,
        level: "B1",
        source: "Don’t make noise in the library.",
        constraint: "Dùng Could you please not...?",
        answer: "Could you please not make noise in the library?",
        acceptedAnswers: ["Could you please not make noise in the library?"],
        explanation: "Phủ định trong câu nghi vấn lịch sự: Could you please + not + V(nguyên mẫu)...?"
      },
      {
        id: "t4-3",
        num: 3,
        level: "B1",
        source: "Speak a little more slowly.",
        constraint: "Dùng Would you mind...?",
        answer: "Would you mind speaking a little more slowly?",
        acceptedAnswers: ["Would you mind speaking a little more slowly?"],
        explanation: "Chuyển động từ 'speak' thành V-ing 'speaking' sau 'Would you mind'."
      },
      {
        id: "t4-4",
        num: 4,
        level: "B1",
        source: "Check your spelling carefully.",
        constraint: "Dùng Please make sure...",
        answer: "Please make sure you check your spelling carefully.",
        acceptedAnswers: ["Please make sure you check your spelling carefully.", "Please make sure that you check your spelling carefully."],
        explanation: "Dùng 'Please make sure you + V...' để nhấn mạnh sự cẩn trọng."
      },
      {
        id: "t4-5",
        num: 5,
        level: "B2",
        source: "Keep your desk tidy before leaving.",
        constraint: "Dùng I’d appreciate it if you could...",
        answer: "I’d appreciate it if you could keep your desk tidy before leaving.",
        acceptedAnswers: ["I'd appreciate it if you could keep your desk tidy before leaving.", "I would appreciate it if you could keep your desk tidy before leaving."],
        explanation: "Cấu trúc B2 cực kỳ trang trọng: I’d appreciate it if you could + V(nguyên mẫu)."
      },
      {
        id: "t4-6",
        num: 6,
        level: "B2",
        source: "Don’t interrupt your classmates while they are presenting.",
        constraint: "Dùng Would you mind not...?",
        answer: "Would you mind not interrupting your classmates while they are presenting?",
        acceptedAnswers: ["Would you mind not interrupting your classmates while they are presenting?"],
        explanation: "Phủ định với Would you mind: Would you mind + not + V-ing?"
      }
    ]
  },

  vocabulary: {
    coreWords: [
      {
        id: "cw-1",
        term: "instruction",
        pos: "n",
        ipa: "/ɪnˈstrʌkʃn/",
        meaning: "lời chỉ dẫn, hướng dẫn",
        example: "Please read the instructions before starting the test."
      },
      {
        id: "cw-2",
        term: "textbook",
        pos: "n",
        ipa: "/ˈtekstbʊk/",
        meaning: "sách giáo khoa",
        example: "Please open your textbooks to unit 4."
      },
      {
        id: "cw-3",
        term: "worksheet",
        pos: "n",
        ipa: "/ˈwɜːkʃiːt/",
        meaning: "phiếu bài tập",
        example: "Could you pass out the worksheets to everyone?"
      },
      {
        id: "cw-4",
        term: "handout",
        pos: "n",
        ipa: "/ˈhændaʊt/",
        meaning: "tài liệu phát tay",
        example: "Please take a handout and pass the rest back."
      },
      {
        id: "cw-5",
        term: "assignment",
        pos: "n",
        ipa: "/əˈsaɪnmənt/",
        meaning: "bài tập được giao",
        example: "Please submit your assignment by Friday."
      },
      {
        id: "cw-6",
        term: "comprehension",
        pos: "n",
        ipa: "/ˌkɒmprɪˈhenʃn/",
        meaning: "sự đọc/nghe hiểu",
        example: "Please answer the reading comprehension questions."
      },
      {
        id: "cw-7",
        term: "pronounce",
        pos: "v",
        ipa: "/prəˈnaʊns/",
        meaning: "phát âm",
        example: "Could you pronounce this word again, please?"
      },
      {
        id: "cw-8",
        term: "underline",
        pos: "v",
        ipa: "/ˌʌndəˈlaɪn/",
        meaning: "gạch chân",
        example: "Please underline the key words in the passage."
      },
      {
        id: "cw-9",
        term: "summarize",
        pos: "v",
        ipa: "/ˈsʌməraɪz/",
        meaning: "tóm tắt",
        example: "Please summarize the main idea in two sentences."
      },
      {
        id: "cw-10",
        term: "clarify",
        pos: "v",
        ipa: "/ˈklærəfaɪ/",
        meaning: "làm rõ",
        example: "Could you clarify your answer with an example?"
      },
      {
        id: "cw-11",
        term: "predict",
        pos: "v",
        ipa: "/prɪˈdɪkt/",
        meaning: "dự đoán",
        example: "Please try to predict what the text is about."
      },
      {
        id: "cw-12",
        term: "participate",
        pos: "v",
        ipa: "/pɑːˈtɪsɪpeɪt/",
        meaning: "tham gia",
        example: "Please participate actively in the group discussion."
      }
    ],

    phrasalVerbs: [
      {
        id: "pv-1",
        term: "take out",
        pos: "phr. v",
        ipa: "/teɪk aʊt/",
        meaning: "lấy ra",
        example: "Please take out a pen and a sheet of paper."
      },
      {
        id: "pv-2",
        term: "put away",
        pos: "phr. v",
        ipa: "/pʊt əˈweɪ/",
        meaning: "cất đi",
        example: "Please put away your phones before the quiz starts."
      },
      {
        id: "pv-3",
        term: "look up",
        pos: "phr. v",
        ipa: "/lʊk ʌp/",
        meaning: "tra cứu (từ điển)",
        example: "Please use a dictionary to look up unfamiliar words."
      },
      {
        id: "pv-4",
        term: "fill in",
        pos: "phr. v",
        ipa: "/fɪl ɪn/",
        meaning: "điền vào (chỗ trống)",
        example: "Please fill in the blanks with the correct tense."
      },
      {
        id: "pv-5",
        term: "hand in / turn in",
        pos: "phr. v",
        ipa: "/hænd ɪn/",
        meaning: "nộp bài",
        example: "Please hand in your test papers when the bell rings."
      },
      {
        id: "pv-6",
        term: "hand out / pass out",
        pos: "phr. v",
        ipa: "/hænd aʊt/",
        meaning: "phát bài / tài liệu",
        example: "Could you help me pass out these worksheets?"
      },
      {
        id: "pv-7",
        term: "jot down",
        pos: "phr. v",
        ipa: "/dʒɒt daʊn/",
        meaning: "ghi chú nhanh",
        example: "Please jot down the key points while listening."
      },
      {
        id: "pv-8",
        term: "go over",
        pos: "phr. v",
        ipa: "/ɡəʊ ˈəʊvə(r)/",
        meaning: "xem lại, ôn lại",
        example: "Please go over your answers before submitting."
      },
      {
        id: "pv-9",
        term: "cross out",
        pos: "phr. v",
        ipa: "/krɒs aʊt/",
        meaning: "gạch bỏ",
        example: "Please cross out the wrong word neatly."
      },
      {
        id: "pv-10",
        term: "point out",
        pos: "phr. v",
        ipa: "/pɔɪnt aʊt/",
        meaning: "chỉ ra",
        example: "Could you point out the mistake in this sentence?"
      },
      {
        id: "pv-11",
        term: "figure out",
        pos: "phr. v",
        ipa: "/ˈfɪɡər aʊt/",
        meaning: "tìm ra, hiểu ra",
        example: "Please work together to figure out the answer."
      },
      {
        id: "pv-12",
        term: "come up with",
        pos: "phr. v",
        ipa: "/kʌm ʌp wɪð/",
        meaning: "nghĩ ra (ý tưởng)",
        example: "Please come up with two examples for this rule."
      },
      {
        id: "pv-13",
        term: "carry out",
        pos: "phr. v",
        ipa: "/ˈkæri aʊt/",
        meaning: "tiến hành, thực hiện",
        example: "Please carry out this short survey in pairs."
      },
      {
        id: "pv-14",
        term: "catch up on",
        pos: "phr. v",
        ipa: "/kætʃ ʌp ɒn/",
        meaning: "học bù, theo kịp",
        example: "Please catch up on any missed homework this weekend."
      },
      {
        id: "pv-15",
        term: "read out",
        pos: "phr. v",
        ipa: "/riːd aʊt/",
        meaning: "đọc to lên",
        example: "Could you read out your paragraph to the class?"
      },
      {
        id: "pv-16",
        term: "run through",
        pos: "phr. v",
        ipa: "/rʌn θruː/",
        meaning: "điểm qua nhanh",
        example: "Let’s run through the instructions one more time."
      }
    ],

    prepositions: [
      {
        id: "pr-1",
        term: "to page X / on page X",
        pos: "prep. phr",
        ipa: "/tuː peɪdʒ / ɒn peɪdʒ/",
        meaning: "• open ... to page X (mở tới trang) • exercise on page X (bài tập ở trang)",
        example: "Please open your books to page 32 and do Task 1 on page 33."
      },
      {
        id: "pr-2",
        term: "at the top / bottom of",
        pos: "prep. phr",
        ipa: "/æt ðə tɒp / ˈbɒtəm əv/",
        meaning: "ở phần đầu / phần cuối của trang giấy",
        example: "Please write your full name at the top of the worksheet."
      },
      {
        id: "pr-3",
        term: "in pairs / in groups of X",
        pos: "prep. phr",
        ipa: "/ɪn peəz / ɪn ɡruːps əv/",
        meaning: "theo cặp / theo nhóm X người",
        example: "Please discuss the question in groups of four."
      },
      {
        id: "pr-4",
        term: "with a partner",
        pos: "prep. phr",
        ipa: "/wɪð ə ˈpɑːtnə(r)/",
        meaning: "làm việc cùng một bạn",
        example: "Could you practice the dialogue with a partner, please?"
      },
      {
        id: "pr-5",
        term: "in pencil / in ink / in pen",
        pos: "prep. phr",
        ipa: "/ɪn ˈpensl / ɪn ɪŋk / ɪn pen/",
        meaning: "viết bằng bút chì / bút mực",
        example: "Please complete the draft in pencil so you can edit it."
      },
      {
        id: "pr-6",
        term: "on time / in time",
        pos: "prep. phr",
        ipa: "/ɒn taɪm / ɪn taɪm/",
        meaning: "• on time: đúng giờ quy định • in time: kịp lúc",
        example: "Please make sure you submit your essay on time."
      },
      {
        id: "pr-7",
        term: "by + mốc thời gian",
        pos: "prep. phr",
        ipa: "/baɪ/",
        meaning: "trước hoặc chậm nhất là vào lúc...",
        example: "Could you turn in your project by Friday afternoon?"
      },
      {
        id: "pr-8",
        term: "before + V-ing / N",
        pos: "prep. phr",
        ipa: "/bɪˈfɔː(r)/",
        meaning: "trước khi làm gì",
        example: "Please double-check your spelling before handing in your paper."
      },
      {
        id: "pr-9",
        term: "for a moment / in detail",
        pos: "prep. phr",
        ipa: "/fər ə ˈməʊmənt / ɪn ˈdiːteɪl/",
        meaning: "trong chốc lát / một cách chi tiết",
        example: "Could you look at the board for a moment, please?"
      },
      {
        id: "pr-10",
        term: "at the end of / in the middle of",
        pos: "prep. phr",
        ipa: "/æt ði end əv / ɪn ðə ˈmɪdl əv/",
        meaning: "vào cuối (tiết học) / ở giữa",
        example: "Please hand in your notebooks at the end of the lesson."
      },
      {
        id: "pr-11",
        term: "according to / based on",
        pos: "prep. phr",
        ipa: "/əˈkɔːdɪŋ tuː / beɪst ɒn/",
        meaning: "theo như / dựa trên",
        example: "Please answer the questions based on the text."
      },
      {
        id: "pr-12",
        term: "pay attention to / focus on",
        pos: "colloc.",
        ipa: "/peɪ əˈtenʃn tuː / ˈfəʊkəs ɒn/",
        meaning: "chú ý tới / tập trung vào",
        example: "Please pay attention to the ending sounds of past verbs."
      }
    ]
  },

  speakingScenarios: [
    {
      id: "sp-1",
      level: "A1–A2",
      situation: "Đầu tiết học, bạn muốn cả lớp mở sách giáo khoa tới trang 79.",
      target: "Please open your textbooks to page 79.",
      keywords: ["open", "textbooks", "page", "79"]
    },
    {
      id: "sp-2",
      level: "B1",
      situation: "Bạn muốn nhờ một học sinh phát tài liệu (handouts) cho các bạn cùng lớp một cách lịch sự (câu hỏi).",
      target: "Could you please pass out these handouts to your classmates?",
      keywords: ["could", "pass out", "handouts", "classmates"]
    },
    {
      id: "sp-3",
      level: "B1",
      situation: "Bạn dặn học sinh giơ tay nếu các em có thắc mắc muốn hỏi.",
      target: "Could you please raise your hand if you have a question?",
      keywords: ["raise", "hand", "if", "question"]
    },
    {
      id: "sp-4",
      level: "B2",
      situation: "Bạn muốn đề nghị học sinh đọc to đoạn văn thứ hai cho cả lớp cùng nghe (dùng cấu trúc Would you mind).",
      target: "Would you mind reading out the second paragraph to the whole class?",
      keywords: ["would you mind", "reading out", "second paragraph", "class"]
    },
    {
      id: "sp-5",
      level: "B2",
      situation: "Bạn muốn nhắc sinh viên nộp bản thảo cuối cùng muộn nhất là chiều thứ Sáu thật trang trọng.",
      target: "I’d appreciate it if you could turn in your final draft by Friday afternoon.",
      keywords: ["appreciate", "turn in", "final draft", "friday"]
    },
    {
      id: "sp-6",
      level: "B2",
      situation: "Bạn nhắc lịch sự để học sinh không ngắt lời bạn khi bạn đang thuyết trình.",
      target: "Would you mind not interrupting your classmates while they are presenting?",
      keywords: ["would you mind", "not interrupting", "classmates", "presenting"]
    }
  ],

  contextDilemmas: [
    {
      id: "ctx-1",
      title: "Tình huống Câu 11: Mục đích hay Điều kiện?",
      prompt: "Giáo viên muốn dặn học sinh: 'Các em hãy giơ tay nếu có thắc mắc cần hỏi cô nhé'. Bạn chọn câu nào?",
      options: [
        "Could you please raise your hand if you have a question?",
        "Could you please raise your hand to answer a question?"
      ],
      correctIndex: 0,
      explanation: "Dùng 'if you have a question' khi dặn học sinh giơ tay lúc có thắc mắc. Còn 'to answer the question' dùng khi giáo viên vừa đặt câu hỏi và gọi học sinh phát biểu."
    },
    {
      id: "ctx-2",
      title: "Tình huống Câu 14: Đầu trang giấy kiểm tra",
      prompt: "Giáo viên yêu cầu học sinh viết họ tên vào phần đầu tờ giấy làm bài. Cụm giới từ nào chuẩn xác?",
      options: [
        "Please write your name at the top of the paper.",
        "Please write your name on the top of the paper."
      ],
      correctIndex: 0,
      explanation: "'at the top of' chỉ vị trí trên bề mặt trang giấy/bảng/danh sách. 'on (the) top of' mang nghĩa đặt chồng lên đỉnh vật thể (ví dụ: on top of the desk)."
    },
    {
      id: "ctx-3",
      title: "Tình huống Câu 2: Giới từ đi với 'answer'",
      prompt: "Học sinh cần viết câu trả lời cho câu hỏi trên bảng. Cụm từ nào đúng ngữ pháp?",
      options: [
        "Please write down the answer to the question.",
        "Please write down the answer of question."
      ],
      correctIndex: 0,
      explanation: "Danh từ 'answer' luôn đi với giới từ 'to' (the answer to the question), không dùng 'of'."
    },
    {
      id: "ctx-4",
      title: "Tình huống Câu 8: Quy tắc dấu hỏi chấm (?)",
      prompt: "Đề bài gợi ý: 'introduce / yourself / class?'. Câu nào đáp ứng đúng tiêu chí Appropriateness?",
      options: [
        "Could you please introduce yourself to the class?",
        "Please introduce your self to the class."
      ],
      correctIndex: 0,
      explanation: "Đề có dấu '?' nên bắt buộc dùng Nghi vấn lịch sự (Could you...) và đại từ phản thân 'yourself' viết liền thành 1 từ."
    }
  ],

  designReferences: [
    {
      name: "Dũng Lại Lập Trình",
      url: "https://www.dunglailaptrinh.com/",
      highlight: "Giao diện EdTech hiện đại, hero conversion nổi bật, dark navy kết hợp gradient xanh dương-cyan sắc nét, bố cục chia khối rõ ràng & điều hướng trực quan.",
      applied: "Toàn bộ hệ thống giao diện chủ đạo, Hero Section, thẻ tiêu chí sư phạm & điều hướng đa module."
    },
    {
      name: "Test-English",
      url: "https://test-english.com/grammar-points/",
      highlight: "Phân cấp rõ theo trình độ A1–C1 bằng thẻ màu tối giản, font chữ dễ đọc, bài tập điền từ & chọn đáp án phản hồi tức thì.",
      applied: "Bộ đề dựng câu chia tab A1 / A2 / B1 / B1+ / B2 và hệ thống tô xanh dương các mảnh ghép ngữ pháp."
    },
    {
      name: "Knowt",
      url: "https://knowt.com/",
      highlight: "Giao diện flashcard & Learn Mode cực kỳ thoáng, bo góc mềm mại, chế độ luyện tập không gây rối mắt.",
      applied: "Game 6: Thẻ lật 3D mặt trước gợi ý / mặt sau câu chuẩn + IPA Oxford UK + giải thích."
    },
    {
      name: "Linguno",
      url: "https://www.linguno.com/",
      highlight: "Thiết kế tối giản tập trung hoàn toàn vào ô nhập câu trả lời, hiển thị tiến độ và sửa lỗi trực tiếp trên từng từ.",
      applied: "Game 1 (Request Builder): Người học gõ câu hoàn chỉnh từ prompt, hệ thống chấm 3 tiêu chí & highlight từng từ thiếu/sai."
    },
    {
      name: "British Council Teens",
      url: "https://learnenglishteens.britishcouncil.org/",
      highlight: "Bố cục sư phạm chuẩn mực, phân tách rõ Lý thuyết – Ví dụ – Bài tập tương tác.",
      applied: "Cấu trúc 3 bước chuẩn sư phạm: Công thức nhanh → 16 Câu mẫu lớp học → Phòng luyện đề 47 câu."
    },
    {
      name: "Wordwall",
      url: "https://wordwall.net/en-gb/community/grammar/practice",
      highlight: "Tương tác kéo-thả (drag & drop), sắp xếp từ thành câu (Unjumble) và điền khuyết sinh động.",
      applied: "Game 2 (Unjumble): Kéo / bấm các mảnh ghép (Please / take out / a / sheet of paper) tô màu xanh dương để ghép thành câu."
    },
    {
      name: "Busuu",
      url: "https://www.busuu.com/en",
      highlight: "Micro-learning hiện đại, thanh tiến độ mượt mà, thẻ giải thích ngữ pháp ngắn gọn kèm nút nghe phát âm.",
      applied: "Thanh tiến độ XP/Mastery theo thời gian thực + Game 3 Nghe chép chính tả giọng Anh-Anh (Web Speech API)."
    },
    {
      name: "Noji",
      url: "https://noji.io/",
      highlight: "Phong cách thẻ lặp lại ngắt quãng (Spaced Repetition) tinh tế, khoảng trắng hợp lý, tập trung tối đa vào nội dung.",
      applied: "Nút đánh giá độ khó (Dễ / Trung bình / Khó) cho từng từ vựng & câu mẫu để lọc ôn lại những câu hay sai giới từ/mạo từ."
    }
  ]
};
