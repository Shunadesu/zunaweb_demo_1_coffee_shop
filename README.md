# ☕ Coffee Shop - Full-Stack Application

<div align="center">

![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248?style=for-the-badge&logo=mongodb)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite)
![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=for-the-badge&logo=socket.io)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Hệ thống quản lý quán cà phê hoàn chỉnh với đặt hàng, thành viên và thông báo thời gian thực**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Deploy](#-deploy)

</div>

---

## ✨ Features

### 🛒 Khách hàng
| Tính năng | Mô tả |
|-----------|-------|
| **Xem Menu** | Duyệt sản phẩm theo danh mục với hình ảnh và mô tả chi tiết |
| **Giỏ hàng** | Thêm sản phẩm với tùy chọn size, topping và số lượng |
| **Đặt hàng** | Đặt món với nhiều phương thức thanh toán |
| **Theo dõi đơn** | Cập nhật trạng thái đơn hàng **realtime** qua Socket.io |
| **Thành viên** | Hệ thống tích điểm, xếp hạng VIP và ưu đãi |
| **Mã giảm giá** | Sử dụng voucher và coupon cá nhân |

### 👨‍💼 Quản trị
| Tính năng | Mô tả |
|-----------|-------|
| **Dashboard** | Biểu đồ thống kê doanh thu, đơn hàng với Recharts |
| **Quản lý đơn** | Xử lý, cập nhật trạng thái và thông báo khách |
| **CRUD Sản phẩm** | Thêm, sửa, xóa sản phẩm và danh mục |
| **Quản lý User** | Xem và quản lý tài khoản khách hàng |
| **Blog** | Quản lý bài viết giới thiệu, khuyến mãi |
| **Coupon** | Tạo và quản lý mã giảm giá |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│  │   React 18  │  │    Zustand   │  │    Socket.io       │     │
│  │   + Vite    │  │    Stores    │  │    Client          │     │
│  └──────┬──────┘  └──────────────┘  └─────────┬──────────┘     │
│         │                                        │               │
│         └────────────────┬───────────────────────┘               │
│                          │                                       │
│                    ┌─────▼─────┐                                 │
│                    │  Axios    │                                 │
│                    │  Client   │                                 │
│                    └─────┬─────┘                                 │
└──────────────────────────┼──────────────────────────────────────┘
                           │ HTTP/WebSocket
┌──────────────────────────▼──────────────────────────────────────┐
│                         SERVER (Node.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│  │   Express   │  │   Socket.io  │  │     JWT Auth       │     │
│  │   Routes    │  │   Server     │  │     Middleware     │     │
│  └──────┬──────┘  └──────────────┘  └────────────────────┘     │
│         │                                                      │
│  ┌──────▼──────────────────────────────────────────────────┐   │
│  │                    Controllers                            │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────────┐   │   │
│  │  │  Auth  │ │  Admin │ │  User  │ │    Public      │   │   │
│  │  └────────┘ └────────┘ └────────┘ └────────────────┘   │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                            │                                     │
│  ┌─────────────────────────▼───────────────────────────────┐   │
│  │                    Services Layer                         │   │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────────┐   │   │
│  │  │  Order  │ │  Points  │ │ Coupon  │ │ Notification│   │   │
│  │  └─────────┘ └──────────┘ └─────────┘ └─────────────┘   │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                            │                                     │
│  ┌─────────────────────────▼───────────────────────────────┐   │
│  │                    MongoDB + Mongoose                     │   │
│  │  Users │ Products │ Orders │ Categories │ Coupons │ Blog │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Library | 18.2 |
| Vite | Build Tool | 5.0 |
| Tailwind CSS | Styling | 3.4 |
| Zustand | State Management | 4.4 |
| React Router | Routing | 6.21 |
| Framer Motion | Animations | 10.16 |
| Recharts | Charts | 2.10 |
| Socket.io Client | Real-time | 4.x |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime | 18+ |
| Express | Web Framework | 4.x |
| MongoDB | Database | 6+ |
| Mongoose | ODM | 8.x |
| JWT | Authentication | 9.x |
| Socket.io | WebSocket | 4.x |
| bcryptjs | Password Hashing | 2.4 |
| Zod | Validation | 3.22 |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+ (local hoặc MongoDB Atlas)
- npm hoặc yarn

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd zunaweb_demo_1

# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/coffee_shop
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Coffee Shop
VITE_APP_DESCRIPTION=Đặt hàng cà phê trực tuyến
```

### 3. Run Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

🌐 **Frontend**: http://localhost:5173
🔌 **API**: http://localhost:5000

---

## 📁 Project Structure

```
zunaweb_demo_1/
├── backend/
│   └── src/
│       ├── config/          # Database & env configuration
│       ├── controllers/     # Route controllers
│       │   ├── admin/       # Admin APIs (products, orders, users...)
│       │   ├── user/        # User APIs (profile, orders, membership...)
│       │   ├── authController.js
│       │   └── publicController.js
│       ├── middleware/      # Auth, admin check, error handler
│       ├── models/          # Mongoose schemas
│       │   ├── User.js, Product.js, Order.js
│       │   ├── Category.js, Coupon.js, Blog.js
│       │   └── Notification.js, Membership.js
│       ├── routes/          # API routes
│       │   ├── admin/, user/, auth.routes.js
│       │   └── public.routes.js
│       ├── services/        # Business logic
│       │   ├── orderService.js, pointsService.js
│       │   ├── couponService.js, notificationService.js
│       ├── socket/          # Socket.io setup
│       ├── utils/           # Helpers
│       └── index.js         # Entry point
│
├── frontend/
│   └── src/
│       ├── api/             # Axios clients & API services
│       ├── components/      # Reusable UI components
│       ├── layouts/        # Auth, Admin, Client layouts
│       ├── pages/
│       │   ├── admin/      # Dashboard, CRUD pages
│       │   └── client/     # Menu, Cart, Checkout, Profile...
│       ├── stores/         # Zustand stores
│       ├── App.jsx          # Main app with routes
│       └── main.jsx        # Entry point
│
├── frontend/.gitignore
├── frontend/vercel.json    # Vercel deployment config
└── README.md
```

---

## 📚 API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Đăng ký tài khoản mới |
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/auth/me` | Lấy thông tin profile |

### Public APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/products` | Danh sách sản phẩm |
| GET | `/api/public/categories` | Danh mục sản phẩm |
| GET | `/api/public/blogs` | Bài viết blog |

### User APIs (Auth required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Profile người dùng |
| PUT | `/api/user/profile` | Cập nhật profile |
| POST | `/api/user/orders` | Tạo đơn hàng |
| GET | `/api/user/orders` | Lịch sử đơn hàng |
| GET | `/api/user/membership` | Thông tin thành viên |
| GET | `/api/user/coupons` | Mã giảm giá của tôi |

### Admin APIs (Admin required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Thống kê dashboard |
| CRUD | `/api/admin/products` | Quản lý sản phẩm |
| CRUD | `/api/admin/categories` | Quản lý danh mục |
| CRUD | `/api/admin/orders` | Quản lý đơn hàng |
| CRUD | `/api/admin/users` | Quản lý người dùng |
| CRUD | `/api/admin/coupons` | Quản lý coupon |
| CRUD | `/api/admin/blog` | Quản lý blog |

---

## 🌐 Deploy

### Frontend - Vercel

```bash
cd frontend
vercel
```

Hoặc kết nối GitHub repo với [Vercel Dashboard](https://vercel.com/dashboard)

**Environment Variables trên Vercel:**
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | URL backend production |

### Backend - Render / Railway / Heroku

1. Push code lên GitHub
2. Kết nối với Render/Railway
3. Set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`

---

## 🔧 Scripts

### Backend
```bash
npm run dev      # Development (nodemon)
npm run start    # Production
npm run lint     # ESLint
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
```

---

## 📝 License

MIT License - Sử dụng tự do cho mục đích cá nhân và thương mại.

---

<div align="center">

**Made with ☕ and ❤️**

</div>
