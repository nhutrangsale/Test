# Vạn Cổ Luân Hồi — Kiến Trúc Hệ Thống & Kế Hoạch Triển Khai (Giai Đoạn 1)

Nền tảng nội dung triết lý nhân sinh, cổ phong, chiêm nghiệm và kiến trúc module mở rộng chuẩn bị cho hệ thống Giác Ngộ, Tu Tiên và Luân Hồi trong tương lai.

> [!IMPORTANT]
> **Tóm tắt các quyết định đã xác nhận với người dùng:**
> - **Ngôn ngữ thị giác & Thẩm mỹ**: *Hắc sắc u huyền phối ngọc bích thanh tao* (Nền đen huyền mặc `#0B0E14` / `#121820`, bề mặt đá phiến `#1A222C`, điểm nhấn thanh tao sắc ngọc bích `#10B981` / `#34D399` / `#059669`, chữ ngà trâm anh `#E2E8F0` / `#94A3B8`). Tối giản, thanh tịnh, không lạm dụng hiệu ứng game.
> - **Cơ chế xác thực & Phân quyền Đa Kênh**:
>   1. Tài khoản nội bộ (Email + bcrypt password hashing, session token).
>   2. Đăng nhập nhanh Google OAuth.
>   3. **Đăng nhập TikTok Login Kit v2** (Popup flow chuẩn popup-to-parent `postMessage`, bảo mật state CSRF, ánh xạ `open_id` thành viên).
> - **Cơ sở dữ liệu & Backend**: Full-stack kiến trúc chạy trên Node.js/Express tích hợp SQLite chuẩn hóa quan hệ (ACID, Foreign Keys, Indexing, Prepared Statements), sẵn sàng chuyển dịch sang PostgreSQL/Cloud SQL bất kỳ lúc nào mà không thay đổi tầng nghiệp vụ.

---

## 1. Đề Xuất Cấu Trúc Thư Mục (Folder Architecture)

Hệ thống tuân thủ nguyên tắc **Separation of Concerns** và **Loose Coupling**:
- **Core** là hạt nhân độc lập, không import bất kỳ module nghiệp vụ nào.
- **Modules** chỉ phụ thuộc vào Core thông qua các hợp đồng (Interfaces/Contracts/Events) do Core công bố.
- Các module nghiệp vụ (`philosophy`, `community`, `awakening`) không gọi trực tiếp mã nguồn của nhau mà giao tiếp qua **Event Bus**.

```
van-co-luan-hoi/
├── server.ts                    # Entry point Full-stack Express Backend & API Router
├── src/
│   ├── core/                   # HẠT NHÂN CHUNG (CORE SYSTEM)
│   │   ├── config/             # Cấu hình môi trường, bảo mật, feature flags
│   │   ├── database/           # SQLite driver, connection pool, schema, migrations, seed
│   │   ├── auth/               # Bcrypt hasher, JWT/session service
│   │   │   ├── providers/      # OAuth Handlers: Google Provider & TikTok Login Provider
│   │   │   └── session.ts      # Quản lý phiên an toàn (SameSite=none trong iframe)
│   │   ├── user/               # User repository, profile service, permission guard
│   │   ├── permissions/        # RBAC definitions (GUEST, USER, MODERATOR, ADMIN)
│   │   ├── events/             # Core Event Bus (Pub/Sub pattern, strongly-typed events)
│   │   ├── security/           # Rate limiter, XSS sanitizer, CSRF check, input validator
│   │   ├── logger/             # Structured logger (INFO, WARN, ERROR, AUDIT)
│   │   └── module-loader.ts    # Dynamic module registry & lifecycle manager
│   │
│   ├── modules/                # CÁC MODULE NGHIỆP VỤ ĐỘC LẬP
│   │   ├── philosophy/         # MODULE TRIẾT LÝ & NỘI DUNG (PHASE 1)
│   │   │   ├── api/            # Controller endpoints (/api/v1/posts, /categories, /slug)
│   │   │   ├── services/       # PostService, CategoryService, ReadingAnalytics
│   │   │   ├── models/         # Interfaces & types (Post, Category, PostFilter)
│   │   │   └── index.ts        # Module manifest & event subscribers
│   │   │
│   │   ├── community/          # MODULE CỘNG ĐỒNG (PHASE 1)
│   │   │   ├── api/            # Likes, Bookmarks, Comments, Reports, BlockUser
│   │   │   ├── services/       # CommentService, ModerationService, SpamGuard
│   │   │   ├── models/         # Comment, Bookmark, Report, Block models
│   │   │   └── index.ts        # Module manifest & event subscribers
│   │   │
│   │   ├── admin/              # MODULE QUẢN TRỊ (PHASE 1)
│   │   │   ├── api/            # Post CRUD, Category CRUD, User bans, Report resolution
│   │   │   ├── services/       # AdminAuditService, ModuleToggleService
│   │   │   └── index.ts        # Module manifest
│   │   │
│   │   ├── awakening/          # MODULE GIÁC NGỘ (STUB SHELL SẴN SÀNG CHO PHASE 2)
│   │   │   ├── index.ts        # Event listeners: philosophy.post_read, quote_reflected
│   │   │   └── manifest.json   # Trạng thái: Disabled (Kích hoạt tại Phase 2)
│   │   │
│   │   ├── cultivation/        # MODULE TU TIÊN (STUB SHELL DỰ PHÒNG)
│   │   │   └── manifest.json   # Trạng thái: Disabled
│   │   │
│   │   └── simulation/         # MODULE LUÂN HỒI SIMULATOR (STUB SHELL DỰ PHÒNG)
│   │       └── manifest.json   # Trạng thái: Disabled
│   │
│   ├── themes/                 # THIẾT KẾ & GIAO DIỆN CỔ PHONG NGỌC BÍCH
│   │   ├── tokens.ts           # Màu sắc: Hắc Sắc Obsidian, Ngọc Bích, Thư Mặc
│   │   └── typography.ts       # Quy chuẩn font chữ Cinzel/Merriweather + Sans
│   │
│   ├── ui/                     # GIAO DIỆN NGƯỜI DÙNG (REACT FRONTEND)
│   │   ├── components/         # Shell components: Header, MobileNavbar, AuthModal, Toasts
│   │   ├── layouts/            # MainLayout, ReadingLayout, AdminLayout
│   │   ├── views/              # Trang chủ, Khám phá, Chi tiết bài viết, Hồ sơ, Admin
│   │   └── hooks/              # useAuth, useModuleEvent, useBookmark, useLike
│   │
│   ├── App.tsx                 # Client Routing & Module Shell Providers
│   ├── main.tsx                # React Hydration Entry
│   └── index.css               # Tailwind v4 theme directives & ancient scrollbar styles
```

---

## 2. Đề Xuất Database Schema (Quan Hệ & Mở Rộng)

Bổ sung bảng `core_oauth_accounts` để hỗ trợ đa tài khoản liên kết (Google, TikTok) mà không làm biến dạng bảng `core_users`:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          DATABASE SCHEMA                                │
├──────────────────────────────┬─────────────────────────────────────────┤
│ core_users                   │ core_oauth_accounts                     │
│ - id (TEXT PK)               │ - id (TEXT PK)                          │
│ - email (TEXT UNIQUE NULL)   │ - user_id (TEXT FK -> core_users)       │
│ - password_hash (TEXT NULL)  │ - provider (TEXT: 'google' | 'tiktok')  │
│ - display_name (TEXT)        │ - provider_user_id (TEXT NOT NULL)      │
│ - avatar_url (TEXT)          │ - access_token (TEXT)                   │
│ - role (TEXT DEFAULT 'user') │ - refresh_token (TEXT)                  │
│ - status (TEXT)              │ - created_at (INTEGER)                  │
│ - created_at (INTEGER)       │ (UNIQUE: provider, provider_user_id)    │
├──────────────────────────────┼─────────────────────────────────────────┤
│ core_sessions                │ core_module_registry                    │
│ - id (TEXT PK)               │ - module_id (TEXT PK)                   │
│ - user_id (TEXT FK -> users) │ - version (TEXT)                        │
│ - token (TEXT UNIQUE)        │ - is_enabled (INTEGER)                  │
│ - expires_at (INTEGER)       │ - settings_json (TEXT)                  │
│ - user_agent (TEXT)          │                                         │
│ - ip_address (TEXT)          │                                         │
├──────────────────────────────┼─────────────────────────────────────────┤
│ philosophy_categories        │ philosophy_posts                        │
│ - id (TEXT PK)               │ - id (TEXT PK)                          │
│ - name (TEXT)                │ - title (TEXT NOT NULL)                 │
│ - slug (TEXT UNIQUE)         │ - slug (TEXT UNIQUE NOT NULL)           │
│ - description (TEXT)         │ - excerpt (TEXT)                        │
│ - sort_order (INTEGER)       │ - content (TEXT NOT NULL)               │
│ - icon (TEXT)                │ - category_id (TEXT FK -> categories)   │
│ - is_active (INTEGER)        │ - cover_image (TEXT)                    │
│                              │ - author_id (TEXT FK -> core_users)     │
│                              │ - published_at (INTEGER)                │
│                              │ - status (TEXT: draft|published|archived│
│                              │ - view_count (INTEGER DEFAULT 0)        │
│                              │ - like_count (INTEGER DEFAULT 0)        │
├──────────────────────────────┼─────────────────────────────────────────┤
│ community_comments           │ community_engagements                   │
│ - id (TEXT PK)               │ - id (TEXT PK)                          │
│ - post_id (TEXT FK -> posts) │ - user_id (TEXT FK -> core_users)       │
│ - user_id (TEXT FK -> users) │ - post_id (TEXT FK -> posts)           │
│ - parent_id (TEXT FK NULL)   │ - type (TEXT: 'like' | 'bookmark')      │
│ - content (TEXT NOT NULL)    │ - created_at (INTEGER)                  │
│ - status (TEXT: active|flag) │ (UNIQUE: user_id, post_id, type)        │
│ - created_at (INTEGER)       │                                         │
├──────────────────────────────┼─────────────────────────────────────────┤
│ community_reports            │ community_user_blocks                   │
│ - id (TEXT PK)               │ - id (TEXT PK)                          │
│ - reporter_id (TEXT FK)      │ - blocker_id (TEXT FK -> core_users)    │
│ - target_type (TEXT)         │ - blocked_id (TEXT FK -> core_users)    │
│ - target_id (TEXT)           │ - created_at (INTEGER)                  │
│ - reason (TEXT)              │                                         │
│ - status (TEXT: pending|res) │                                         │
└──────────────────────────────┴─────────────────────────────────────────┘
```

---

## 3. Đề Xuất Thiết Kế RESTful API (Kèm TikTok & Google OAuth)

### A. Authentication & OAuth Endpoints
- `POST /api/v1/auth/register` — Đăng ký tài khoản nội bộ.
- `POST /api/v1/auth/login` — Đăng nhập bằng email/mật khẩu.
- `POST /api/v1/auth/google` — Đăng nhập bằng Google ID token.
- `GET  /api/v1/auth/oauth/tiktok/url` — Sinh URL xác thực TikTok Login Kit v2 kèm state CSRF.
- `GET  /api/v1/auth/oauth/tiktok/callback` — Tiếp nhận Authorization Code từ TikTok, đổi Token, lấy Profile và phát tín hiệu `postMessage({ type: 'TIKTOK_AUTH_SUCCESS', token })` về cửa sổ cha.
- `POST /api/v1/auth/logout` — Đăng xuất và vô hiệu hóa session.
- `GET  /api/v1/auth/me` — Thông tin người dùng hiện tại, vai trò và các kênh đăng nhập đã liên kết.

### B. Philosophy Module Endpoints
- `GET  /api/v1/philosophy/categories` — Lấy 7 chuyên mục triết lý.
- `GET  /api/v1/philosophy/posts` — Danh sách bài viết phân trang, tìm kiếm, lọc.
- `GET  /api/v1/philosophy/posts/featured` — Bài viết tiêu biểu & châm ngôn ngày.
- `GET  /api/v1/philosophy/posts/by-slug/:slug` — Chi tiết bài viết (tự động phát sinh event `philosophy.post_viewed`).

### C. Community Module Endpoints
- `POST /api/v1/community/posts/:id/like` — Thích / bỏ thích bài viết.
- `POST /api/v1/community/posts/:id/bookmark` — Lưu trữ bài viết.
- `GET  /api/v1/community/posts/:id/comments` — Bình luận văn bản của bài viết.
- `POST /api/v1/community/posts/:id/comments` — Thêm bình luận (chống spam, lọc từ cấm).
- `DELETE /api/v1/community/comments/:id` — Xóa bình luận.
- `POST /api/v1/community/reports` — Tố cáo bình luận hoặc bài viết.
- `POST /api/v1/community/users/:id/block` — Chặn người dùng.

### D. Admin Module Endpoints
- `GET  /api/v1/admin/dashboard` — Báo cáo thống kê.
- `POST /api/v1/admin/posts` — Thêm bài viết mới.
- `PUT  /api/v1/admin/posts/:id` — Sửa bài viết.
- `DELETE /api/v1/admin/posts/:id` — Xóa bài viết.
- `GET  /api/v1/admin/reports` — Danh sách tố cáo.
- `POST /api/v1/admin/reports/:id/resolve` — Xử lý tố cáo.
- `PATCH /api/v1/admin/modules/:id/toggle` — Bật/tắt module động.

---

## 4. Cơ Chế TikTok Login trong Môi Trường Web & Iframe

Để đảm bảo tuân thủ nghiêm ngặt chuẩn bảo mật và hoạt động trơn tru trong môi trường web:
1. **Popup Provider Trực Tiếp**: Client gọi `/api/v1/auth/oauth/tiktok/url` để lấy đường dẫn chính thức `https://www.tiktok.com/v2/auth/authorize/` và mở cửa sổ popup trực tiếp tới TikTok (không mở route nội bộ trong iframe).
2. **Callback Nhỏ Gọn & Giao Tiếp Cross-Window**: Khi TikTok chuyển hướng về `/api/v1/auth/oauth/tiktok/callback`, server xử lý trao đổi token với TikTok API, lưu liên kết vào `core_oauth_accounts` và trả về trang HTML siêu nhẹ chứa script gửi `window.opener.postMessage({ type: 'TIKTOK_AUTH_SUCCESS', token }, '*')` rồi tự động đóng popup.
3. **Chế độ Giả Lập Phát Triển (Mock/Sandbox Fallback)**: Nếu hệ thống chưa cấu hình `TIKTOK_CLIENT_KEY` và `TIKTOK_CLIENT_SECRET`, giao diện sẽ thông báo rõ ràng kèm nút "Đăng nhập thử nghiệm TikTok (Developer Sandbox)" để kiểm thử toàn diện quy trình mà không bị gián đoạn.

---

## 5. Đề Xuất Cơ Chế Module & Event Bus

Core Event Bus phân tách độc lập các module:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CORE EVENT BUS PIPELINE                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   [ Philosophy Module ]                                                │
│         │                                                              │
│         │ emit('philosophy.post_read', { userId, postId, category })   │
│         ▼                                                              │
│  ┌───────────────┐                                                     │
│  │   CORE BUS    │ ───► Structured Logger (Ghi nhận nhật ký audit)      │
│  └──────┬────────┘                                                     │
│         │                                                              │
│         │ broadcast tới các module đang bật                            │
│         ├──────────────────────────────┬───────────────────────────────┤
│         ▼                              ▼                               ▼
│  [ Community Module ]          [ Awakening Module ]          [ Cultivation ]
│  (Cập nhật thống kê          (Phase 2: Cộng điểm Giác Ngộ   (Phase 2: Nhận  │
│   quan tâm cá nhân)           & sinh sự kiện 'awakening.     linh khí)      │
│                                level_up' nếu đủ duyên)                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Đề Xuất UI Sitemap & Shell Navigation

Phong cách **Hắc Sắc Ngọc Bích** thanh tao, chuẩn Mobile-First:
- **Top Bar**: Wordmark Vạn Cổ Luân Hồi · 7 chuyên mục triết lý · Nút Tìm kiếm / Đăng nhập (Google & TikTok) / Menu.
- **Trang chủ (`/`)**: Hero triết lý nổi bật đổi theo ngày · Danh mục 7 chuyên mục · Bài viết mới · Bài luận bàn tâm điểm · Vấn đáp nhân sinh suy ngẫm · Footer thanh tịnh.
- **Khám phá (`/kham-pha`)**: Bộ lọc chuyên mục, tìm kiếm bài viết, sắp xếp theo lượt đọc/lượt thích.
- **Đọc bài (`/bai-viet/:slug`)**: Trải nghiệm đọc thư viện cổ thư, cỡ chữ điều chỉnh được, Thích, Lưu bài, Bình luận văn bản.
- **Đã lưu (`/da-luu`)**: Danh sách bài viết tâm đắc của người dùng.
- **Cá nhân (`/ca-nhan`)**: Quản lý tài khoản, liên kết Google / TikTok, cài đặt hiển thị.
- **Quản trị (`/quan-tri`)**: Bảng quản lý nội dung, duyệt bình luận, tố cáo và bật/tắt module.
- **Mobile Bottom Bar**: `Trang chủ` | `Khám phá` | `Đã lưu` | `Cá nhân`.

---

## 7. Giải Thích Cách Phase 2 Thêm Hệ Thống Giác Ngộ Không Sửa Core

1. **Module Registry Tự Đăng Ký**: Thư mục `/src/modules/awakening` chứa `index.ts` cài đặt `ModuleInterface`. Core chỉ nạp module qua `moduleLoader.register(AwakeningModule)`.
2. **Subscribers Độc Lập**: Awakening Module lắng nghe sự kiện `philosophy.post_viewed` và `community.comment_added` để tính toán căn duyên và điểm Giác Ngộ.
3. **Database Tách Biệt**: Bảng `awakening_user_progress` lưu trữ dữ liệu tu tập và ngộ đạo, không chèn trường vào bảng `core_users`.
4. **Phát Sinh Chuỗi Sự Kiện Tiếp Nối**: Khi giác ngộ, module phát `awakening.enlightened`, sẵn sàng cho module Tu Tiên (Cultivation) nhận lệnh sau này.

---

## 8. Kế Hoạch Triển Khai Chi Tiết (Implementation Steps)

1. **Bước 1**: Cấu hình Backend Core, Express, SQLite database với migrations (hỗ trợ users, sessions, oauth_accounts, categories, posts, comments, reports, modules).
2. **Bước 2**: Tích hợp các bộ điều hợp xác thực Core: Bcrypt nội bộ, Google OAuth endpoint, TikTok Login Kit v2 endpoint với callback window.
3. **Bước 3**: Triển khai nghiệp vụ Module Philosophy (7 chuyên mục, bài viết, slug SEO, view/like counter) và Module Community (like, bookmark, comment văn bản, report, block, chống spam).
4. **Bước 4**: Xây dựng UI Shell phong cách Hắc Sắc Ngọc Bích, Mobile Navigation, Top Bar Contract, Modal Đăng nhập (Email, Google, TikTok), Giao diện đọc bài chuẩn typography cổ thư.
5. **Bước 5**: Xây dựng Giao diện Quản trị Admin (bài viết, kiểm duyệt, tố cáo, bật/tắt module) và xác thực phân quyền.
6. **Bước 6**: Kiểm thử toàn diện build (`compile_applet`), kiểm tra độ an toàn bảo mật, SEO meta tags và tối ưu hóa trải nghiệm người dùng.
