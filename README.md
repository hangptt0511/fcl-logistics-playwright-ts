# Logistics Management System – FCL | Test Automation

Dự án **automation test cá nhân** dùng **Playwright + TypeScript** cho module **FCL** của một Logistics Management System.

Mục tiêu: tự học kiểm thử tự động và xây dựng framework theo hướng **dễ mở rộng, dễ bảo trì**, kết hợp **API + UI + E2E** trong cùng một luồng nghiệp vụ.

---

## 📌 Điểm nổi bật

- **Kết hợp API + UI**: dùng API để chuẩn bị dữ liệu (nhanh, ổn định), UI để kiểm tra luồng người dùng.
- **E2E theo nghiệp vụ thật**: Giá mua (API) → Bảng phân tích → Bảng giá → Đơn đặt hàng.
- **Page Object Model (POM)** với `BasePage`, `BaseDialog` và các component dùng lại (table, combobox, input, dialog...).
- **Tách tầng Validator** cho cả API và UI: spec chỉ gọi validator, không viết assertion rải rác.
- **Custom Fixtures** (`base`, `api`, `combined`) để inject page/service vào test, tránh lặp code khởi tạo.
- **Auth setup** chạy một lần, tái sử dụng session cho toàn bộ test.
- **Test data tách riêng**, hỗ trợ sinh dữ liệu và chuẩn hoá payload / query params.
- **Cleanup** dữ liệu sau test để môi trường không bị rác.

---

## 🛠️ Công nghệ

| Hạng mục | Công nghệ |
|---|---|
| Test framework | Playwright Test |
| Ngôn ngữ | TypeScript |
| Mẫu thiết kế | Page Object Model, Fixture, Validator layer |
| Loại test | API, UI, E2E |

---

## 🧱 Kiến trúc

```
Spec (tests/)
   │  dùng fixtures
   ▼
Fixtures ──► UI Pages / Components ──► UI Validators
        └─► API Services ──► API Validators
                   │
                   ▼
        Core (api-client, session-manager, response-decoder)
```

- **Spec** chỉ mô tả kịch bản: gọi service/page → gọi validator.
- **Service** (API) bọc từng endpoint nghiệp vụ; **Model** định nghĩa kiểu dữ liệu request/response.
- **Page / Component** (UI) bọc thao tác trên giao diện.
- **Validator** gom toàn bộ assertion (API: kiểm tra response; UI: kiểm tra table, form, detail/edit dialog...).

---

## 📂 Cấu trúc thư mục

```
src/
├── api/
│   ├── core/            # api-client, api-error, endpoints, response-decoder, session-manager, types
│   ├── models/          # auth, common, fcl-booking, fcl-quotation, fcl-rate-card, price-fcl-buying, price-toll-buying
│   ├── services/
│   │   ├── pricing/     # fcl-rate-card, price-fcl-buying, price-toll-buying
│   │   ├── auth.service.ts
│   │   ├── fcl-booking.service.ts
│   │   └── fcl-quotation.service.ts
│   └── validators/      # base.validator + validator cho từng module
│
├── fixtures/            # base.fixture, api.fixture, combined.fixture
├── setup/               # auth.setup.ts (đăng nhập 1 lần, lưu session)
│
├── tests/
│   ├── api/pricing/     # price-fcl-buying.spec, price-toll-buying.spec
│   ├── auth/            # login.spec
│   ├── e2e/             # convert-booking-from-buying.spec
│   └── data/            # test data cho từng kịch bản
│
├── ui/
│   ├── components/      # base, base-dialog, combobox, confirm/detail/edit/request dialog, edit-page, input, table
│   ├── models/          # model cho UI (auth, fcl-booking, fcl-quotation, fcl-rate-card, table)
│   ├── pages/           # fcl-booking, pricing/fcl-rate-card, quotation, base.page
│   └── validators/      # base.validator, validator cho từng page
│
└── utils/
    ├── data/            # data.util, date.util, payload.util, query-params-normalizer, test-data.util
    ├── security/        # rsa-crypto.helper
    ├── verification/    # data-verification, field-verifier, form-verification, ui-error.util
    ├── cleanup.util.ts  # dọn dữ liệu sau test
    ├── component.helper.ts
    └── logger.ts
```

---

## ✅ Phạm vi kiểm thử

| Nhóm | Nội dung |
|---|---|
| **Auth** | Đăng nhập (API) và setup session dùng chung |
| **API** | Giá mua (`price-fcl-buying`), giá vé cầu đường (`price-toll-buying`) |
| **UI** | Tạo đơn đặt hàng |
| **E2E** | Tạo giá mua qua API → Bảng phân tích → Bảng giá → Chuyển đổi thành đơn đặt hàng và kiểm tra dữ liệu sau chuyển đổi |

## 🧠 Quyết định thiết kế

- **API để setup, UI để kiểm tra**: giảm thời gian chạy và giảm flaky so với tạo dữ liệu hoàn toàn qua UI.
- **BasePage / BaseDialog**: gom thao tác chung, các page/dialog cụ thể chỉ khai báo phần riêng.
- **Validator tách khỏi Page**: Page chỉ thao tác, Validator chỉ kiểm tra → dễ đọc, dễ tái sử dụng.
- **Verify dữ liệu linh hoạt**: formatter và column map dùng chung (`data-verification`) để so sánh dữ liệu hiển thị với dữ liệu gốc.
- **Cleanup có kiểm soát**: cleanup xử lý theo trạng thái của dữ liệu.

---

## 👤 Tác giả

**Phan Thị Thanh Hằng** – Backend Developer (C#/.NET) chuyển hướng sang QA/QC & Test Automation
📧 hangptt0511@gmail.com · 💼 <LinkedIn / GitHub>
