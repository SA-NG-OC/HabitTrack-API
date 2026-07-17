# Ôn Tập Lý Thuyết: Làm Việc Hiệu Quả Với AI Trong Lập Trình

## 1. Tổng Quan Các Công Cụ AI

| Công cụ | Dùng khi nào | Điểm mạnh |
|---|---|---|
| **ChatGPT** | Brainstorm ý tưởng, hỏi kiến thức tổng quát, giải thích khái niệm, viết nội dung không gắn với codebase cụ thể | Không cần cài đặt, tư duy rộng, tốt cho học lý thuyết |
| **Codex / GitHub Copilot (inline)** | Gợi ý code ngay khi gõ, autocomplete, sinh boilerplate nhanh | Tích hợp sâu vào IDE, phản hồi tức thời, tốt cho code lặp lại |
| **Claude Code / Antigravity (agentic CLI/IDE)** | Task lớn, đa bước: đọc hiểu codebase, sửa nhiều file, chạy test, tạo PR | Có thể tự đọc file, tự chạy lệnh, giữ ngữ cảnh xuyên suốt cả project |
| **IDE Extensions (Copilot Chat, Cursor, Continue...)** | Hỏi đáp trong lúc code, refactor nhanh 1 file, giải thích đoạn code đang xem | Có ngữ cảnh file đang mở, phản hồi nhanh trong luồng làm việc |
| **CLI Tools (claude, codex CLI...)** | Tự động hoá: sinh commit message, chạy pipeline, thao tác hàng loạt file | Có thể script hoá, tích hợp CI/CD, không cần rời terminal |

**Nguyên tắc chọn công cụ:** việc càng **nhỏ, cục bộ, cần tốc độ** → dùng inline/extension. Việc càng **lớn, đa file, cần lập kế hoạch** → dùng agent (Claude Code, Antigravity). Việc **không liên quan code** (học, viết tài liệu) → dùng chat thường (ChatGPT/Claude chat).

---

## 2. Prompt Engineering (Viết Prompt Hiệu Quả)

Một prompt tốt cần trả lời được 3 câu hỏi: **Bối cảnh (Context) – Ràng buộc (Constraints) – Kết quả mong muốn (Expected Output)**.

### Công thức chung
```
[Vai trò/Bối cảnh] + [Yêu cầu cụ thể] + [Ràng buộc kỹ thuật] + [Định dạng output mong muốn]
```

### Áp dụng theo mục đích

- **Học kiến thức:** "Giải thích [khái niệm] như thể tôi đã biết [X] nhưng chưa biết [Y]. Cho ví dụ thực tế trong NestJS."
- **Viết code mới:** Nêu rõ input/output, ràng buộc (thư viện được dùng, convention của project), yêu cầu kèm test.
- **Debug:** Đưa **nguyên văn lỗi**, đoạn code liên quan, những gì đã thử, môi trường chạy. Tránh mô tả mơ hồ như "nó không chạy".
- **Refactor:** Nêu rõ mục tiêu (dễ đọc hơn, tách logic, giảm coupling...), yêu cầu **giữ nguyên hành vi**, yêu cầu AI liệt kê thay đổi trước khi áp dụng.
- **Code review:** Cho AI đóng vai reviewer, yêu cầu chỉ ra: bug tiềm ẩn, vi phạm convention, vấn đề bảo mật, đề xuất cải thiện — không tự sửa code khi chưa được yêu cầu.

### Nguyên tắc vàng
- Cung cấp **ví dụ tốt/xấu (few-shot)** nếu có thể.
- Yêu cầu AI **suy nghĩ từng bước** (chain-of-thought) với task phức tạp.
- Chỉ định rõ **định dạng đầu ra** (diff, JSON, danh sách, bảng...).
- Giới hạn phạm vi: "chỉ sửa file X", "không đổi tên biến hiện có".

---

## 3. Quy Trình Phát Triển Với AI (AI Development Workflow)

Áp dụng AI xuyên suốt vòng đời phát triển thay vì chỉ dùng để "sinh code":

1. **Hiểu yêu cầu (Understand):** Nhờ AI diễn giải lại yêu cầu, đặt câu hỏi làm rõ, liệt kê edge case chưa được đề cập.
2. **Lập kế hoạch (Plan):** Yêu cầu AI đề xuất kiến trúc, chia nhỏ task, viết `plan.md` trước khi code.
3. **Triển khai (Implement):** Làm từng module nhỏ, review sau mỗi bước thay vì để AI viết toàn bộ project một lần.
4. **Kiểm thử (Test):** Nhờ AI viết unit test/e2e test, nhưng **tự kiểm tra test có thực sự kiểm chứng đúng logic** không phải chỉ để pass.
5. **Review:** Tự đọc lại code AI sinh ra như review code của đồng nghiệp — tìm bug, kiểm tra convention, bảo mật.
6. **Chuẩn bị PR:** Nhờ AI tóm tắt thay đổi, sinh mô tả PR, nhưng người dùng là người quyết định merge.

> Nguyên tắc: **AI hỗ trợ từng bước nhỏ có kiểm soát**, không phải "giao hết rồi review một lần ở cuối".

---

## 4. Quản Lý Ngữ Cảnh Cho AI (Context Management)

Vì AI không nhớ giữa các phiên làm việc, cần duy trì các file ngữ cảnh để AI (và người) có thể tiếp tục công việc bất kỳ lúc nào:

| File | Mục đích |
|---|---|
| `README.md` | Giới thiệu project, cách cài đặt, chạy, các lệnh chính |
| `architecture.md` | Kiến trúc hệ thống, cấu trúc thư mục, luồng dữ liệu, các quyết định thiết kế |
| `plan.md` | Kế hoạch tổng thể, các milestone, thứ tự triển khai |
| `task.md` | Danh sách task cụ thể, trạng thái (chưa làm / đang làm / xong) |
| `progress.md` | Nhật ký tiến độ theo từng phiên làm việc — AI đọc file này đầu tiên khi bắt đầu phiên mới |

**Cách duy trì:**
- Cập nhật `progress.md` và `task.md` **ngay sau mỗi phiên**, không để dồn.
- Khi bắt đầu phiên mới, yêu cầu AI **đọc các file context trước** rồi mới hỏi "tiếp theo làm gì".
- Giữ các file này **ngắn gọn, có cấu trúc** (checklist, bảng) thay vì văn xuôi dài — dễ cho AI parse và dễ cho người đọc lướt nhanh.

---

## 5. Tối Ưu Token (Token Optimization)

- **Chỉ đưa context liên quan:** không paste toàn bộ codebase, chỉ đưa file/hàm liên quan đến task.
- **Chia nhỏ task lớn:** thay vì "xây dựng toàn bộ backend", chia thành từng module/endpoint.
- **Yêu cầu diff thay vì full file:** khi sửa file lớn, xin AI trả về đoạn thay đổi (diff) thay vì in lại toàn bộ file.
- **Tóm tắt công việc đã xong:** thay vì giữ toàn bộ lịch sử hội thoại, tóm tắt lại trong `progress.md` rồi bắt đầu phiên mới gọn hơn.
- **Dùng file tham chiếu thay vì dán lại nhiều lần:** trỏ AI đến đường dẫn file thay vì copy nội dung vào mỗi lần hỏi.

---

## 6. AI Cho Git & Pull Request

AI có thể hỗ trợ:
- **Commit message:** sinh theo convention (ví dụ Conventional Commits: `feat:`, `fix:`, `refactor:`...) dựa trên diff thực tế.
- **PR title & description:** tóm tắt thay đổi, lý do thay đổi, cách test.
- **Release notes:** tổng hợp các commit/PR thành changelog dễ đọc.
- **Trả lời review comment:** soạn phản hồi lịch sự, giải thích rõ lý do thay đổi hoặc lý do giữ nguyên.

> **Luôn đọc lại** nội dung AI sinh ra trước khi submit — đặc biệt kiểm tra commit message có mô tả đúng thay đổi thực tế, PR description không "bịa" tính năng chưa làm.

---

## 7. Best Practices Khi Dùng AI

- **Bảo vệ secrets:** không bao giờ paste API key, mật khẩu, connection string thật vào prompt. Dùng biến môi trường (`.env`) và thêm vào `.gitignore`.
- **Luôn verify code sinh ra:** chạy thử, đọc logic, không copy-paste mù quáng — đặc biệt với security-sensitive code (auth, validation, xử lý tiền).
- **Tuân thủ convention của project:** style code, cấu trúc thư mục, cách đặt tên — nhắc AI theo convention có sẵn thay vì để AI tự chọn.
- **Hiểu giới hạn của AI:** AI có thể "ảo giác" (hallucinate) API không tồn tại, dùng thư viện đã lỗi thời, hoặc bỏ sót edge case — người dùng vẫn là người chịu trách nhiệm cuối cùng.
- **Không chấp nhận gợi ý một cách mù quáng:** luôn tự hỏi "code này có đúng logic nghiệp vụ không, có lỗ hổng bảo mật không, có test chưa".