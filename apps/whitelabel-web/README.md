# Whitelabel Dashboard - Privy Integration

A clean, modern B2B dashboard with embedded wallet functionality powered by Privy authentication.

## 🚀 Features

### ✨ Privy Authentication
- Email login
- Google OAuth  
- Web3 wallet connection (MetaMask, WalletConnect)
- Embedded wallet auto-creation

### 🎨 Glider.fi-Inspired Design
- Clean white backgrounds
- Mint green (#00D9A3) accent color
- Minimalist sidebar
- Subtle borders and shadows
- Dark mode support

### 📊 Dashboard Pages
- **Overview**: Wallet metrics, growth charts, activity feed
- **API Keys**: Generate, manage, and secure API keys
- **Analytics**: Usage trends, endpoint metrics, geographic data
- **Billing**: Pricing tiers, usage tracking, payment history
- **Documentation**: API reference, quick start guides
- **Settings**: Company info, notifications, security, branding

---

## 📦 Setup Instructions

### 1. Get Privy App ID

1. Go to [https://dashboard.privy.io/](https://dashboard.privy.io/)
2. Sign up or log in
3. Create a new app or select existing one
4. Copy your **App ID** from the dashboard (looks like `clz8s4e6b0d7vjzzp73mvp0e4`)

### 2. Configure Environment Variables

Create a `.env` file in `apps/whitelabel-web/`:

```bash
VITE_PRIVY_APP_ID=your_privy_app_id_here
```

### 3. Install Dependencies

```bash
# From root of monorepo
pnpm install
```

### 4. Run Development Server

```bash
cd apps/whitelabel-web
pnpm dev
```

The app will be available at **http://localhost:5173/**

---

## 📂 Project Structure

```
apps/whitelabel-web/
├── src/
│   ├── layouts/
│   │   └── DashboardLayout.tsx      # Main dashboard layout with sidebar
│   ├── pages/
│   │   ├── LandingPage.tsx          # Public landing page
│   │   ├── auth/
│   │   │   └── LoginPage.tsx        # Privy authentication page
│   │   └── dashboard/
│   │       ├── OverviewPage.tsx     # Dashboard home
│   │       ├── APIKeysPage.tsx      # API key management
│   │       ├── AnalyticsPage.tsx    # Charts and analytics
│   │       ├── BillingPage.tsx      # Pricing and usage
│   │       ├── DocumentationPage.tsx
│   │       └── SettingsPage.tsx
│   ├── providers/
│   │   └── PrivyProvider.tsx        # Privy configuration wrapper
│   └── App.tsx                      # Main app with routing
├── package.json
├── tailwind.config.js               # Glider.fi color scheme
└── vite.config.ts
```

---

## 🔐 Authentication Flow

1. **Landing Page** (`/`) - Public marketing page with "Get Started" CTA
2. **Login** (`/login`) - Privy modal with multiple auth methods
3. **Dashboard** (`/dashboard/*`) - Protected routes (auto-redirects if not authenticated)

### How It Works

- `PrivyProvider` wraps the entire app
- Protected routes use `ProtectedRoute` component
- Checks `authenticated` state from `usePrivy()` hook
- User info available via `user` object from Privy
- Logout clears session and redirects to landing page

---

## ⚙️ Privy Configuration

Located in `src/providers/PrivyProvider.tsx`:

```typescript
{
  loginMethods: ['email', 'wallet', 'google'],
  appearance: {
    theme: 'light',
    accentColor: '#00D9A3',  // Glider.fi green
  },
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
  },
}
```

---

## 🎨 Color Scheme (Glider.fi)

```js
primary: {
  50: '#E6FFF9',
  100: '#B3FFE6',
  200: '#80FFD4',
  300: '#4DFFC1',
  400: '#1AFFAE',
  500: '#00D9A3',  // Main brand color
  600: '#00AD82',
  700: '#008262',
  800: '#005641',
  900: '#002B21',
}
```

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | Vite + React 19 |
| Styling | Tailwind CSS 3.4 |
| Authentication | Privy (@privy-io/react-auth) |
| Routing | React Router v7 |
| Icons | Lucide React |
| Charts | Recharts |
| Type Safety | TypeScript 5.7 |

---

## 📋 Next Steps

- [ ] Configure Privy webhooks for user events
- [ ] Connect backend API for data persistence
- [ ] Implement actual wallet functionality
- [ ] Add demo apps (ecommerce, streaming, gaming, freelancer)
- [ ] Setup deployment pipeline
- [ ] Add unit tests
- [ ] Implement dark mode toggle

---

## 🔧 Development Notes

- Uses **pnpm workspace** with catalog references
- All dashboard routes protected by Privy authentication
- User info extracted from Privy's `user.email.address` or `user.wallet.address`
- Logout clears Privy session and redirects to landing page
- Tailwind configured with Glider.fi color scheme
- Mobile-responsive design with hamburger menu

---

## 📸 Screenshots

### Landing Page
Clean marketing page with hero section, features, and CTA buttons

### Login Page
Privy authentication with email, Google, and wallet options

### Dashboard Overview
Metrics cards, charts, and recent activity feed

### API Keys
Secure key management with show/hide and copy functionality

---

## 🚨 Troubleshooting

**Issue**: Privy not loading
- Check `.env` file has correct `VITE_PRIVY_APP_ID`
- Verify App ID from Privy dashboard
- Restart dev server after adding env vars

**Issue**: Routes not working
- Ensure React Router configured correctly
- Check `ProtectedRoute` component wraps dashboard routes
- Verify `BrowserRouter` wraps entire app

**Issue**: Tailwind classes not applying
- Check `tailwind.config.js` content paths
- Verify `@tailwind` directives in `index.css`
- Run `pnpm install` to ensure dependencies installed
