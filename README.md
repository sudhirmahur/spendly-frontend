# 💳 Spendly v3 — Workspace Finance Tracker

Premium React + Vite + Tailwind CSS frontend for workspace-based expense tracking.

---

## 🚀 Quick Start

```bash
npm install
npm run dev          # Opens http://localhost:3000
```

---

## ⚙️ Environment

Edit `.env`:
```env
VITE_BACKEND_URL=http://localhost:5000/api   # your backend base URL
VITE_DEBUG=false                              # set true for API console logs
```

---

## 📡 API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register user (with optional referralCode) |
| POST | `/login` | Login |
| GET | `/me` | Get current user |
| GET | `/transactions/list` | List transactions (with filters) |
| POST | `/transactions/create` | Create transaction |
| GET | `/transactions/summary` | Transaction summary |
| PUT | `/transactions/update/:id` | Update transaction |
| DELETE | `/transactions/delete/:id` | Delete transaction |
| GET | `/categories/list` | List categories |
| POST | `/categories/create` | Create category |
| PUT | `/categories/update/:id` | Update category |
| DELETE | `/categories/delete/:id` | Delete category |
| GET | `/stats/summary` | Dashboard summary |
| GET | `/stats/category` | Category breakdown |
| GET | `/stats/monthly` | Monthly chart data |
| GET | `/referral/code` | Get referral code + link |
| GET | `/referral/users` | Get referred users list |
| GET | `/referral/stats` | Referral stats |
| GET | `/workspace/` | List user's workspaces |
| GET | `/workspace/members` | Get workspace members |
| DELETE | `/workspace/remove/:userId` | Remove member (owner only) |
| POST | `/workspace/switch` | Switch workspace `{ workspaceId }` |

---

## 🗂️ Folder Structure

```
src/
├── App.jsx
├── main.jsx
├── index.css
├── components/
│   ├── ui/index.jsx          # Button, Input, Select, Card, Modal, Badge,
│   │                         # Spinner, StatCard, Toggle, Avatar, Pagination,
│   │                         # Tabs, ConfirmDialog, DropdownMenu, Skeleton…
│   ├── charts/index.jsx      # Area, Bar, Composed, Donut, MiniLine charts
│   ├── layout/
│   │   └── TransactionRow.jsx
│   ├── workspace/
│   │   └── WorkspaceSwitcher.jsx
│   ├── TransactionForm.jsx
│   ├── ProtectedRoute.jsx
│   └── ErrorBoundary.jsx
├── pages/
│   ├── Login.jsx             # Split-panel, JWT auth
│   ├── Register.jsx          # With referral code + URL param support
│   ├── Dashboard.jsx         # Balance hero, 4 stat cards, 3 chart types, category donut
│   ├── Transactions.jsx      # List/grouped views, bulk delete, CSV export, all filters, pagination
│   ├── Categories.jsx        # Full CRUD, icon+color picker, donut chart, search
│   ├── Members.jsx           # Member list, search, remove (owner only)
│   ├── Referral.jsx          # Code copy, invite link, share buttons, referred users
│   └── Profile.jsx           # 3-tab: profile / security / account + workspaces
├── layouts/
│   └── AppLayout.jsx         # Responsive sidebar with workspace switcher
├── services/
│   ├── api.js                # All API endpoint functions
│   └── axiosInstance.js      # JWT + workspace-id interceptors
├── store/
│   └── index.js              # Zustand: auth, workspace, theme, app
├── hooks/
│   └── index.js              # useTransactions, useCategories, useWorkspace,
│                             # useReferral, useAuth
└── utils/
    └── helpers.js            # formatCurrency, extractAuth, extractList, STATIC_CATEGORIES…
```
