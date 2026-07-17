# Quy Trình Làm Dự Án Với AI — Step By Step

Tài liệu này mô tả quy trình chuẩn khi làm một dự án với AI coding agent (Antigravity, Claude Code...), áp dụng cho cả lúc mọi thứ suôn sẻ lẫn khi có tình huống bất ngờ.

---

## PHẦN 1 — Quy Trình Chuẩn (Happy Path)

### Bước 0 — Chuẩn bị trước khi mở AI
- [ ] Đọc/viết `project-overview.md` — xác nhận scope, out-of-scope rõ ràng.
- [ ] Đọc/viết `architecture.md` — quyết định kiến trúc, data model ở mức khung.
- [ ] Chia nhỏ công việc thành `plan.md` (theo phase) và `task.md` (theo task cụ thể, checkbox).
- [ ] Khởi tạo `progress.md` trống, chuẩn bị ghi log session đầu tiên.

> Nguyên tắc: **AI không tự vẽ scope hộ bạn** ở bước này — bạn là người quyết định phạm vi, AI chỉ hỗ trợ diễn đạt/rà soát.

### Bước 1 — Kick-off mỗi session
- [ ] Yêu cầu AI đọc `progress.md` → `task.md` → `plan.md` trước tiên.
- [ ] Xác nhận với AI: "session này làm phase/task nào".
- [ ] Nếu có gì mơ hồ trong task, làm rõ **trước** khi AI viết code (hỏi lại, không đoán).

### Bước 2 — Lập kế hoạch nhỏ cho task hiện tại
- [ ] Yêu cầu AI liệt kê file sẽ tạo/sửa, **không code ngay**.
- [ ] Review danh sách này — cắt bớt nếu AI đề xuất vượt phạm vi task.
- [ ] Xác nhận rồi mới cho AI thực thi.

### Bước 3 — Thực thi từng phần nhỏ
- [ ] 1 task nhỏ = 1 prompt, không gộp nhiều task vào 1 lần.
- [ ] Với file đã tồn tại: luôn yêu cầu "show diff, không in lại toàn bộ file".
- [ ] Chạy thử ngay sau mỗi bước (build, run, test) — không đợi dồn đến cuối.

### Bước 4 — Review
- [ ] Đọc lại code như review code đồng nghiệp: logic đúng chưa, có lỗ hổng bảo mật không, có đúng convention không.
- [ ] Yêu cầu AI đóng vai reviewer để tự rà soát trước (list vấn đề, chưa sửa).
- [ ] Tự quyết định chấp nhận/từ chối từng đề xuất — không chấp nhận toàn bộ một cách mù quáng.

### Bước 5 — Test
- [ ] Yêu cầu AI viết test cho logic vừa làm.
- [ ] Tự kiểm tra test có thực sự kiểm chứng đúng hành vi, không phải test "cho có" để pass.
- [ ] Chạy full test suite trước khi coi task là xong.

### Bước 6 — Cập nhật context
- [ ] Check off task đã xong trong `task.md`.
- [ ] Ghi log vào `progress.md`: đã làm gì, quyết định gì, việc gì để lại cho session sau.
- [ ] Commit với message rõ ràng (theo Conventional Commits), AI có thể generate nhưng bạn review trước khi commit.

### Bước 7 — Kết thúc dự án / chuẩn bị PR
- [ ] Review toàn bộ diff một lượt cuối.
- [ ] AI draft PR description — bạn kiểm tra tính chính xác so với diff thật.
- [ ] Đảm bảo README/architecture phản ánh đúng trạng thái cuối cùng, không còn lệch so với lúc lên kế hoạch ban đầu.

---

## PHẦN 2 — Xử Lý Tình Huống Bất Ngờ

### 🔴 1. AI "ảo giác" (hallucination) — bịa API/thư viện không tồn tại
**Dấu hiệu:** code gọi hàm/package không có thật, hoặc dùng version API đã lỗi thời.

**Xử lý:**
- Không chạy thử ngay — hỏi lại AI: "package/method này có thật không, dẫn nguồn/docs".
- Nếu AI không đưa ra được nguồn xác thực → tự tra docs chính thức trước khi chấp nhận.
- Thêm vào `progress.md`: ghi chú lại lỗi này để lần sau cảnh giác với loại request tương tự.

### 🔴 2. Yêu cầu thay đổi (CR) làm vỡ kiến trúc đã có
**Dấu hiệu:** khách hàng yêu cầu tính năng mâu thuẫn với quyết định trong `architecture.md` (vd: đổi từ single-tenant sang multi-tenant giữa chừng).

**Xử lý:**
- Dừng lại, không để AI "chữa cháy" tại chỗ.
- Yêu cầu AI liệt kê rõ mâu thuẫn với thiết kế cũ, ước lượng mức độ refactor cần thiết.
- Quyết định: refactor toàn bộ hay tìm giải pháp tạm (workaround) — ghi rõ lý do vào `progress.md` để tránh lặp lại tranh luận sau này.

### 🔴 3. AI tự động mở rộng scope ngoài task đang giao
**Dấu hiệu:** yêu cầu sửa 1 hàm nhưng AI refactor luôn cả file, đổi cả cấu trúc thư mục.

**Xử lý:**
- Từ chối merge phần ngoài phạm vi, yêu cầu tách riêng.
- Prompt phòng ngừa: luôn thêm "chỉ sửa đúng phạm vi X, không đổi các phần khác".
- Nếu đề xuất mở rộng thực sự có giá trị → ghi vào `task.md` mục "Ideas / Later", không làm ngay.

### 🔴 4. Test luôn pass nhưng bug vẫn còn (test giả)
**Dấu hiệu:** AI viết test match với chính implementation sai, thay vì match với behavior mong muốn.

**Xử lý:**
- Tự viết ít nhất 1-2 test case "bằng tay" cho logic quan trọng (không để AI viết 100%).
- Yêu cầu AI giải thích **vì sao** test này chứng minh đúng hành vi, không chỉ "test này pass".
- Với logic nghiệp vụ quan trọng (tính tiền, tính streak, auth...) — luôn tự tay verify bằng ví dụ cụ thể.

### 🔴 5. Rò rỉ secret / thông tin nhạy cảm vào prompt hoặc code
**Dấu hiệu:** vô tình paste `.env` thật, API key, connection string vào chat với AI.

**Xử lý ngay lập tức:**
- Revoke/đổi lại key đã lộ (không chỉ xoá khỏi chat — coi như đã bị lộ vĩnh viễn).
- Kiểm tra `.gitignore` đã chặn `.env` chưa.
- Nếu đã lỡ commit — dùng `git filter-repo` hoặc BFG để xoá khỏi lịch sử, không chỉ xoá ở commit mới nhất.

### 🔴 6. Mất ngữ cảnh giữa các session (AI "quên" quyết định cũ)
**Dấu hiệu:** AI đề xuất lại giải pháp đã bị từ chối trước đó, hoặc đi ngược lại quyết định đã ghi trong `architecture.md`.

**Xử lý:**
- Kiểm tra lại: `progress.md` có được cập nhật đầy đủ ở session trước không — đây thường là nguyên nhân gốc.
- Bắt đầu lại bằng cách yêu cầu AI đọc đúng file trước khi làm bất cứ điều gì.
- Nếu quyết định quan trọng chưa được ghi ở đâu cả → dừng lại, bổ sung vào `architecture.md` §Key Design Decisions ngay, đừng để lặp lại.

### 🔴 7. Conflict khi nhiều task chạm cùng 1 file
**Dấu hiệu:** hai task song song (vd: Habits module và CheckIns module) cùng sửa `app.module.ts`.

**Xử lý:**
- Làm tuần tự thay vì song song nếu file overlap nhiều — tránh chia task quá nhỏ mà không tính đến phụ thuộc.
- Commit thường xuyên theo từng task nhỏ để dễ resolve conflict (diff nhỏ, dễ đọc).

### 🔴 8. Yêu cầu từ khách hàng mơ hồ, AI tự suy diễn theo hướng sai
**Dấu hiệu:** task.md ghi task chung chung ("cải thiện UX form"), AI code theo hướng khác ý khách hàng.

**Xử lý:**
- Không giao task mơ hồ thẳng cho AI code — luôn cụ thể hoá trước (input/output rõ ràng, ví dụ cụ thể).
- Nếu không chắc, prompt AI liệt kê 2-3 cách hiểu khác nhau trước khi chọn hướng làm.

### 🔴 9. AI sửa xong nhưng phá vỡ tính năng cũ (regression)
**Dấu hiệu:** feature A chạy tốt trước đó, sau khi AI sửa feature B thì A lỗi.

**Xử lý:**
- Luôn chạy **toàn bộ** test suite (không chỉ test của feature vừa sửa) trước khi coi là xong.
- Nếu chưa có test cho feature cũ → đây là dấu hiệu cần bổ sung test trước khi tiếp tục refactor các phần liên quan.

### 🔴 10. Hết thời gian giữa chừng (task chưa xong, phải dừng)
**Xử lý:**
- Không để code ở trạng thái nửa vời không chạy được — nếu chưa xong, commit vào branch riêng hoặc ghi rõ trong `progress.md` trạng thái dở dang (file nào, còn thiếu gì, lỗi gì đang gặp).
- Ghi rõ **bước tiếp theo cụ thể** để session sau (dù là bạn hay AI) không mất thời gian đọc lại toàn bộ để đoán lại.

---

## PHẦN 3 — Checklist Nhanh Khi Có Điều Bất Thường

Khi thấy điều gì đó "lạ" trong lúc làm với AI, tự hỏi theo thứ tự:

1. **Có đúng file context AI đang đọc không?** (context cũ/sai → mọi thứ sau đó đều sai)
2. **AI có đang tự suy diễn ngoài phạm vi task không?** (task rõ ràng nhưng output lệch hướng)
3. **Có phải AI đang "bịa" (hallucinate) không?** (API, package, con số không xác thực được)
4. **Việc này có ảnh hưởng đến phần code/feature khác không?** (regression risk)
5. **Đã ghi lại quyết định/lý do vào `progress.md` chưa?** (tránh lặp lại vấn đề)

> Nguyên tắc cốt lõi xuyên suốt: **AI là người đề xuất, bạn luôn là người quyết định cuối cùng** — đặc biệt với các quyết định kiến trúc, bảo mật, và bất cứ chỗ nào ảnh hưởng đến logic nghiệp vụ quan trọng.