# DLU RequestMaster v2 — 12 Chế Độ Luyện Câu Yêu Cầu & AI Tutor

Website học tập và luyện tập chuyên sâu phần ngữ pháp **Câu yêu cầu (Making Requests in the English Classroom)** dành cho sinh viên ngành **Sư phạm Tiếng Anh — Trường Đại học Đà Lạt (Dalat University)**.

## ✨ Điểm mới ở Phiên bản v2.1

- **Giao diện Obsidian Bento 12 Chế độ (`#07080c` & gradient cam-vàng)**: Bố cục tối giản, sắc nét, chia 4x3 thẻ chế độ kèm phím tắt toàn cục (`Space`, `1–4`, `Enter`).
- **Gõ từ trực tiếp trong Flashcard & Che từ luyện chính tả**: Có ô gõ từ ngay dưới thẻ lật 3D (`EN ⇄ VN`), chế độ che từ tiếng Anh giữ lại chữ đầu + IPA để luyện gõ nhớ sâu, chấm chính tả từng ký tự và phát âm Oxford UK.
- **Nút "🎲 Từ ngẫu nhiên" & Trộn thứ tự ngẫu nhiên (Fisher-Yates)**: Có mặt ở thanh điều khiển chung và trong từng chế độ luyện tập giúp đảo thứ tự ghi nhớ lâu hơn.
- **Tích hợp AI Tutor thông minh (Không lo lỗi Model & Chạy cả khi không có Key)**:
  - **AI Sư Phạm Nội Bộ (0đ, Không cần API Key)**: Chấm bài 3 tiêu chí, tạo mẹo nhớ, sinh câu hỏi từ Hộp Quên và đóng vai học sinh hoạt động ngay lập tức.
  - **Multi-Provider Free API Key**: Hỗ trợ **Google Gemini (`gemini-3.8-flash` + tự dò model từ Key)**, **Groq (`llama-3.3-70b-versatile`)**, **Mistral AI (`mistral-small-latest`)**, **DeepSeek (`deepseek-chat`)** và **OpenRouter (`:free`)**. Tự động nhận diện nhà cung cấp qua tiền tố Key (`AIza...`, `gsk_...`, `sk-or-...`) và tự động đổi sang model khả dụng mới nhất nếu model cũ ngừng hỗ trợ.

## 🎮 12 Chế độ luyện tập cùng một bộ từ & câu yêu cầu

1. **Flashcard (GHI NHỚ):** Lật thẻ 2 chiều `EN ⇄ VN`, Hộp Leitner (`Thuộc / Đang nhớ / Quên`), phát âm Anh-Anh.
2. **Trắc nghiệm (LUYỆN TẬP):** `Từ → Nghĩa`, `Nghĩa → Từ`, `Ngữ cảnh điền từ`, đồng hồ 30 giây/câu, phím tắt `1–4`.
3. **Listening (NGHE):** Nghe và gõ từ có gợi ý, nghe câu điền khuyết, chép chính tả & shadowing (`1.0x` / `0.78x`).
4. **Gõ nghĩa & Từ (VIẾT):** `Anh → Việt` (không cần gõ dấu) & `Việt → Anh` (chấp nhận từ đồng nghĩa như `hand in / turn in`).
5. **Viết câu yêu cầu (VIẾT CÂU):** 16 câu mẫu + 21 bài A1–B2, nút hiện dần từng từ gợi ý, chấm 3 tiêu chí + AI nhận xét.
6. **Nối từ (TRÒ CHƠI):** Speed Match 6 cặp mỗi vòng, 5 tim, 90 giây, phát âm chuẩn UK khi nối.
7. **Minigame (TRÒ CHƠI):** Đoán & xếp chữ cái (`Scramble`), xếp mảnh từ xanh dương thành câu (`Unjumble`), Đúng/Sai 60 giây.
8. **Ngữ pháp & Đề 47 câu (CẤU TRÚC):** Toàn bộ 4 công thức, mảnh ghép xanh dương, 16 câu mẫu, giải đáp Câu 11/14, sửa 3 lỗi và 47 câu bài tập Dạng 1–4.
9. **Trợ lý AI Free Key (AI TUTOR):** Mẹo nhớ, sinh đề từ Hộp Quên, hỏi đáp ngữ pháp 24/7.
10. **Speaking & Roleplay (ĐÓNG VAI):** Thu âm qua Micro (`SpeechRecognition`) và đối thoại đóng vai giáo viên – học sinh với AI.
11. **Bài kiểm tra (TỔNG HỢP):** Đề 10 câu kết hợp Reading, Writing, Grammar, Vocab chấm thang điểm 10, tự lưu câu sai vào Hộp Quên.
12. **Sổ từ vựng (TRA CỨU):** Tra cứu 40 mục có IPA Oxford UK, lọc theo nhóm hoặc Hộp Leitner, phân tích chi tiết bằng AI.

## 🚀 Triển khai

Dự án sử dụng thuần HTML5 / CSS3 / Vanilla ES6 JavaScript (không cần build step), chạy trực tiếp qua `index.html` hoặc GitHub Pages (`main` / `(root)`).
