# TODO: UX/UI shadcn/ui Refactor - Luma-Inspired Design

> **Status**: 🚧 In Progress
> **Last Updated**: 2025-12-06
> **Design Philosophy**: Delightful accents on custom gray foundation (Luma-inspired)

---

## 🎯 Goals

✅ Remove "coded vibe" (colorful icon backgrounds)
✅ Implement Luma-style design (gray foundation + strategic color accents)
✅ Migrate to shadcn/ui for accessibility and consistency
✅ Use existing custom gray scale (gray-950 to gray-25)
✅ Apply to both dashboard AND landing page

---

## 📊 Color System

### Our Custom Gray Scale (EXISTING - DO NOT CHANGE)

```js
// apps/whitelabel-web/tailwind.config.js
gray: {
  950: '#262626',  // ← Primary text (darkest)
  925: '#313131',  // ← Headers
  900: '#3A3A3A',  // ← Subheaders
  800: '#555555',  // ← Body text
  700: '#7C7C7C',  // ← Secondary text
  600: '#858585',  // ← Tertiary text
  500: '#949494',  // ← Muted text
  400: '#B2B2B2',  // ← Placeholder
  300: '#BDBDBD',  // ← Disabled
  200: '#C8C8C8',  // ← Borders
  150: '#D9D9D9',  // ← Light borders
  100: '#E3E3E3',  // ← Dividers
  50: '#F7F7F7',   // ← Light backgrounds
  25: '#F2F2F2',   // ← Subtle backgrounds
}
```

### NEW: Accent Colors to Add

```js
// Add to tailwind.config.js theme.extend.colors
accent: {
  DEFAULT: '#3B82F6',
  hover: '#2563EB',
  light: '#DBEAFE',
}
```

### NEW: Luma-Style Gradient

```js
// Add to tailwind.config.js theme.extend.backgroundImage
backgroundImage: {
  'gradient-luma': 'linear-gradient(135deg, #6366F1 0%, #3B82F6 50%, #06B6D4 100%)',
}
```

### Semantic Colors (EXISTING - KEEP)

```js
success: {
  DEFAULT: '#10B981',
  light: '#D1FAE5',
},
warning: {
  DEFAULT: '#F59E0B',
  light: '#FEF3C7',
},
error: {
  DEFAULT: '#EF4444',
  light: '#FEE2E2',
},
```

---

## 🎨 Typography Hierarchy

```jsx
// Page Title
<h1 className="text-4xl lg:text-5xl font-bold text-gray-950">
  Main Title
</h1>

// Section Heading
<h2 className="text-2xl font-semibold text-gray-950">
  Section Title
</h2>

// Subsection
<h3 className="text-lg font-semibold text-gray-900">
  Subsection Title
</h3>

// Body Text
<p className="text-base text-gray-700 leading-relaxed">
  Body content goes here.
</p>

// Helper/Muted Text
<p className="text-sm text-gray-500">
  Helper text or description
</p>

// Placeholder Text
<input placeholder="..." className="placeholder:text-gray-400" />

// Accent Text (Gradient)
<span className="bg-gradient-luma bg-clip-text text-transparent">
  Highlighted word
</span>

// Accent Text (Solid)
<span className="text-accent font-medium">
  Important word
</span>
```

---

## 🧱 Component Patterns

### 1. Buttons

#### Primary CTA (Luma Gradient)
```jsx
<button className="bg-gradient-luma text-white px-6 py-2.5 rounded-lg
  hover:saturate-150 shadow-md hover:shadow-lg transition-all font-medium">
  Get Started
</button>
```

#### Secondary
```jsx
<button className="bg-white border border-gray-200 text-gray-950
  hover:bg-gray-25 hover:border-gray-300 px-6 py-2.5 rounded-lg
  transition-all font-medium">
  View Demo
</button>
```

#### Ghost
```jsx
<button className="text-gray-700 hover:bg-gray-50 hover:text-gray-950
  px-4 py-2 rounded-lg transition-colors">
  Cancel
</button>
```

#### Destructive
```jsx
<button className="bg-error text-white px-6 py-2.5 rounded-lg
  hover:bg-error/90 transition-all">
  Delete
</button>
```

---

### 2. Cards

#### Standard Card (Luma-style Backdrop Blur)
```jsx
<div className="bg-white/90 backdrop-blur-md border border-gray-150
  rounded-xl p-6 shadow-sm hover:shadow-md hover:border-gray-200
  transition-all">
  {/* Content */}
</div>
```

#### Interactive Card (Selected State)
```jsx
<div className="bg-white/90 backdrop-blur-md border-2 border-accent
  bg-accent/5 rounded-xl p-6 shadow-md">
  {/* Selected content */}
  <Check className="absolute top-4 right-4 w-5 h-5 text-accent" />
</div>
```

#### Subtle Background Card
```jsx
<div className="bg-gray-25 border border-gray-150 rounded-xl p-6">
  {/* Content */}
</div>
```

---

### 3. Inputs

#### Text Input
```jsx
<input
  type="text"
  placeholder="Enter value"
  className="w-full px-4 py-2.5 bg-white border border-gray-200
    rounded-lg text-gray-950 placeholder:text-gray-400
    focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20
    hover:border-gray-300 transition-all"
/>
```

#### Select Dropdown
```jsx
<select className="w-full px-4 py-2.5 bg-white border border-gray-200
  rounded-lg text-gray-950
  focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20
  hover:border-gray-300 transition-all">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

#### Textarea
```jsx
<textarea
  placeholder="Describe your product..."
  rows={4}
  className="w-full px-4 py-2.5 bg-white border border-gray-200
    rounded-lg text-gray-950 placeholder:text-gray-400
    focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20
    hover:border-gray-300 transition-all resize-none"
/>
```

---

### 4. Section Headers (Remove Icon Backgrounds!)

#### BEFORE (Coded Vibe - DON'T USE)
```jsx
❌ DON'T USE THIS:
<div className="flex items-center gap-4 mb-6">
  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
    <Building2 className="w-7 h-7 text-blue-600" />
  </div>
  <div>
    <h2 className="text-xl font-bold text-gray-900">Product Information</h2>
    <p className="text-sm text-gray-500">Basic details about your product</p>
  </div>
</div>
```

#### AFTER (Minimal - USE THIS)
```jsx
✅ USE THIS:
<div className="border-b border-gray-150 pb-4 mb-6">
  <h2 className="text-xl font-semibold text-gray-950 mb-1">
    Product Information
  </h2>
  <p className="text-sm text-gray-500">
    Basic details about your product
  </p>
</div>
```

#### Alternative (With Minimal Icon)
```jsx
<div className="border-b border-gray-150 pb-4 mb-6">
  <div className="flex items-center gap-2 mb-1">
    <Building2 className="w-5 h-5 text-gray-400" />
    <h2 className="text-xl font-semibold text-gray-950">
      Product Information
    </h2>
  </div>
  <p className="text-sm text-gray-500">
    Basic details about your product
  </p>
</div>
```

---

### 5. Alerts

#### Warning Alert
```jsx
<div className="bg-warning-light border border-warning/20 rounded-lg p-4">
  <div className="flex items-start gap-3">
    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-sm font-medium text-gray-950">Warning</p>
      <p className="text-sm text-gray-700 mt-1">
        Regenerating will invalidate the current key. Update all integrations immediately.
      </p>
    </div>
  </div>
</div>
```

#### Success Alert
```jsx
<div className="bg-success-light border border-success/20 rounded-lg p-4">
  <div className="flex items-start gap-3">
    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-sm font-medium text-gray-950">Success</p>
      <p className="text-sm text-gray-700 mt-1">
        Your configuration has been saved successfully.
      </p>
    </div>
  </div>
</div>
```

#### Error Alert
```jsx
<div className="bg-error-light border border-error/20 rounded-lg p-4">
  <div className="flex items-start gap-3">
    <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-sm font-medium text-gray-950">Error</p>
      <p className="text-sm text-gray-700 mt-1">
        Failed to save configuration. Please try again.
      </p>
    </div>
  </div>
</div>
```

---

### 6. Badges

#### Status Badge (Active)
```jsx
<span className="inline-flex items-center gap-1 px-2.5 py-1
  bg-success-light text-success text-xs font-medium rounded-md">
  <div className="w-1.5 h-1.5 rounded-full bg-success" />
  Active
</span>
```

#### Status Badge (Inactive)
```jsx
<span className="inline-flex items-center gap-1 px-2.5 py-1
  bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
  Inactive
</span>
```

#### Count Badge
```jsx
<span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
  12
</span>
```

---

### 7. Tables

```jsx
<div className="bg-white border border-gray-150 rounded-xl overflow-hidden">
  <table className="w-full">
    <thead>
      <tr className="border-b border-gray-100 bg-gray-25">
        <th className="text-left py-3.5 px-5 text-xs font-semibold
          text-gray-600 uppercase tracking-wide">
          Column 1
        </th>
        <th className="text-left py-3.5 px-5 text-xs font-semibold
          text-gray-600 uppercase tracking-wide">
          Column 2
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-gray-100 hover:bg-gray-25 transition-colors">
        <td className="py-3.5 px-5 text-sm text-gray-700">Value 1</td>
        <td className="py-3.5 px-5 text-sm text-gray-700">Value 2</td>
      </tr>
      <tr className="hover:bg-gray-25 transition-colors">
        <td className="py-3.5 px-5 text-sm text-gray-700">Value 3</td>
        <td className="py-3.5 px-5 text-sm text-gray-700">Value 4</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

### 8. Selection UI (Currency, Tiers, Strategies)

#### Unselected Item
```jsx
<button className="border border-gray-200 rounded-lg px-4 py-3
  hover:border-gray-300 hover:bg-gray-25 transition-all cursor-pointer
  text-left w-full">
  <div className="flex items-center gap-3">
    <span className="text-gray-700">USD</span>
  </div>
</button>
```

#### Selected Item
```jsx
<button className="border-2 border-accent bg-accent/5 rounded-lg px-4 py-3
  relative w-full text-left">
  <div className="flex items-center gap-3">
    <span className="text-gray-950 font-medium">THB</span>
  </div>
  <Check className="w-4 h-4 text-accent absolute top-3 right-3" />
</button>
```

#### Grid Layout (Currency Selector)
```jsx
<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
  {currencies.map(currency => (
    <button
      key={currency.code}
      className={cn(
        "border rounded-lg px-4 py-3 transition-all",
        selected === currency.code
          ? "border-2 border-accent bg-accent/5"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-25"
      )}
    >
      <div className="flex items-center gap-2">
        <span>{currency.flag}</span>
        <span className={cn(
          "text-sm",
          selected === currency.code ? "text-gray-950 font-medium" : "text-gray-700"
        )}>
          {currency.code}
        </span>
      </div>
      {selected === currency.code && (
        <Check className="w-4 h-4 text-accent absolute top-2 right-2" />
      )}
    </button>
  ))}
</div>
```

---

### 9. Strategy Cards (List Selection)

```jsx
<div className="space-y-3">
  {strategies.map(strategy => (
    <button
      key={strategy.id}
      className={cn(
        "w-full text-left border rounded-lg p-4 transition-all",
        selected.includes(strategy.id)
          ? "border-2 border-accent bg-accent/5"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-25"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-950 mb-1">
            {strategy.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {strategy.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>APY: {strategy.apy}%</span>
            <span>TVL: ${strategy.tvl}</span>
          </div>
        </div>
        {selected.includes(strategy.id) && (
          <Check className="w-5 h-5 text-accent flex-shrink-0" />
        )}
      </div>
    </button>
  ))}
</div>
```

---

### 10. Step Indicators (Onboarding)

```jsx
<div className="flex items-center gap-2">
  {/* Active step */}
  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-luma rounded-full">
    <span className="text-sm font-medium text-white">1. Company Info</span>
  </div>

  {/* Arrow */}
  <ChevronRight className="w-4 h-4 text-gray-300" />

  {/* Current/In Progress step */}
  <div className="flex items-center gap-2 px-4 py-2 border-2 border-accent
    bg-accent/5 rounded-full">
    <span className="text-sm font-medium text-gray-950">2. Strategy Selection</span>
  </div>

  {/* Arrow */}
  <ChevronRight className="w-4 h-4 text-gray-300" />

  {/* Upcoming step */}
  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border
    border-gray-200 rounded-full">
    <span className="text-sm text-gray-400">3. Banking Integration</span>
  </div>
</div>
```

---

## 🎨 Chart Colors (Gray-scale + Accent)

### Portfolio Distribution Donut Chart

```jsx
// BEFORE (Colorful)
backgroundColor: ['#3B82F6', '#8B5CF6', '#EC4899', '#6B7280']

// AFTER (Gray-scale with accent)
backgroundColor: [
  '#3B82F6',    // Accent blue for primary segment (DeFi)
  '#7C7C7C',    // gray-700 for secondary (Liquidity Provider)
  '#C8C8C8',    // gray-200 for tertiary (CeFi)
  '#E3E3E3',    // gray-100 for quaternary
]
```

### Line Charts (Analytics)

```jsx
// Dataset 1 (Primary metric)
borderColor: '#3B82F6',
backgroundColor: 'rgba(59, 130, 246, 0.1)',

// Dataset 2 (Comparison)
borderColor: '#7C7C7C',
backgroundColor: 'rgba(124, 124, 124, 0.05)',
```

### Bar Charts

```jsx
backgroundColor: [
  '#3B82F6',    // Accent
  '#858585',    // gray-600
  '#B2B2B2',    // gray-400
  '#D9D9D9',    // gray-150
]
```

---

## 📁 Files to Refactor

### ✅ Configuration Files

- [ ] `apps/whitelabel-web/tailwind.config.js` - Add accent colors & gradient
- [ ] `apps/whitelabel-web/src/index.css` - Update CSS variables (if needed)

### 🎨 Component Library

- [ ] `apps/whitelabel-web/src/components/ui/button.tsx` - Create shadcn button
- [ ] `apps/whitelabel-web/src/components/ui/card.tsx` - Create shadcn card
- [ ] `apps/whitelabel-web/src/components/ui/input.tsx` - Create shadcn input
- [ ] `apps/whitelabel-web/src/components/ui/select.tsx` - Create shadcn select
- [ ] `apps/whitelabel-web/src/components/ui/dialog.tsx` - Create shadcn dialog
- [ ] `apps/whitelabel-web/src/components/ui/alert.tsx` - Create shadcn alert
- [ ] `apps/whitelabel-web/src/components/ui/badge.tsx` - Create shadcn badge
- [ ] `apps/whitelabel-web/src/components/ui/table.tsx` - Create shadcn table
- [ ] `apps/whitelabel-web/src/components/ui/tabs.tsx` - Create shadcn tabs
- [ ] `apps/whitelabel-web/src/components/ui/accordion.tsx` - Create shadcn accordion

### 🧩 Custom Components

- [ ] `src/components/ui/FeatureCard.tsx` - Migrate to shadcn Card
- [ ] `src/components/ui/StrategyCard.tsx` - Migrate to shadcn Card + Accordion
- [ ] `src/components/cards/StatCard.tsx` - Remove colors, use grays
- [ ] `src/components/cards/ProtocolCard.tsx` - Remove colors, use grays
- [ ] `src/components/ProductSwitcher.tsx` - Accent on active product

### 📊 Dashboard Pages

- [ ] `src/feature/dashboard/ProductConfigPage.tsx` - **PRIORITY 1** (Remove icon backgrounds)
- [ ] `src/feature/dashboard/OverviewPage.tsx` - Update StatCards
- [ ] `src/feature/dashboard/APIKeysPage.tsx` - Clean table
- [ ] `src/feature/dashboard/AnalyticsPage.tsx` - Gray charts
- [ ] `src/feature/dashboard/ExplorePage.tsx` - Remove colorful protocol cards
- [ ] `src/feature/dashboard/IntegrationPage.tsx` - Clean code blocks
- [ ] `src/feature/dashboard/PortfoliosListPage.tsx` - Gray table
- [ ] `src/feature/dashboard/RampOperationsPage.tsx` - Clean transactions

### 🎯 Landing Page Sections

- [ ] `src/feature/landing/LandingPage.tsx` - Overall layout update
- [ ] `src/feature/landing/NewHeroSection.tsx` - **PRIORITY 2** (Gradient text accent)
- [ ] `src/feature/landing/TradingStrategiesSection.tsx` - Gray chart
- [ ] `src/feature/landing/SupportedAssetsSection.tsx` - Clean grid
- [ ] `src/feature/landing/CustomizeEarnSection.tsx` - Remove colorful cards
- [ ] `src/feature/landing/IntegrationSection.tsx` - Clean code examples
- [ ] `src/feature/landing/EndUserEarningSection.tsx` - Gray hierarchy
- [ ] `src/feature/landing/PortfoliosSection.tsx` - Clean layout

### 🚀 Onboarding Flow

- [ ] `src/feature/onboarding/CreateProduct.tsx` - **PRIORITY 3** (Step indicators)
- [ ] `src/feature/onboarding/components/CompanyInfoForm.tsx` - shadcn forms
- [ ] `src/feature/onboarding/components/StrategySelector.tsx` - Accent borders
- [ ] `src/feature/onboarding/components/BankAccountForm.tsx` - Clean inputs
- [ ] `src/feature/onboarding/components/StepIndicator.tsx` - Gradient active state

### 🔐 Auth Pages

- [ ] `src/feature/auth/LoginPage.tsx` - Clean form
- [ ] `src/feature/auth/RegisterPage.tsx` - Clean form

### 📱 Demo App

- [ ] `src/feature/demo/DemoClientApp.tsx` - Minimal cards
- [ ] `src/feature/demo/DepositModal.tsx` - shadcn Dialog
- [ ] `src/feature/demo/BalanceCard.tsx` - Gray-based

---

## 🎯 Color Usage Rules

### ✅ YES - Use Gradient/Accent

- Primary CTA buttons (Get Started, Save, Submit, Next)
- Selected/active states (currencies, strategies, tabs, products)
- Accent words in headlines ("Strategies", "digital assets")
- Progress indicators and loading states
- Link hover states
- Primary chart segment
- Active step in wizard
- Active navigation item

### ❌ NO - Don't Use Color

- Icon backgrounds (NO colored boxes around icons)
- Section header backgrounds
- Card backgrounds (white or gray-25 only)
- Non-active borders (use gray-150, gray-200, gray-300)
- Body text (use gray-700, gray-600, gray-500)
- Table backgrounds (white/gray-25 alternating)
- Disabled states (use grays)

### 🟢 Semantic Only

- Success states: `text-success` or `bg-success-light`
- Error states: `text-error` or `bg-error-light`
- Warning alerts: `bg-warning-light border-warning/20`
- Status indicators (Active/Inactive/Pending)

---

## 📋 Implementation Checklist

### Phase 1: Foundation ⏳

- [ ] Update `tailwind.config.js` with accent colors
- [ ] Add `bg-gradient-luma` to backgroundImage
- [ ] Add backdrop-blur utilities
- [ ] Install shadcn/ui CLI: `npx shadcn@latest init`
- [ ] Configure shadcn to use existing Tailwind config

### Phase 2: shadcn Components 📦

- [ ] Install: `npx shadcn@latest add button`
- [ ] Install: `npx shadcn@latest add card`
- [ ] Install: `npx shadcn@latest add input`
- [ ] Install: `npx shadcn@latest add select`
- [ ] Install: `npx shadcn@latest add dialog`
- [ ] Install: `npx shadcn@latest add dropdown-menu`
- [ ] Install: `npx shadcn@latest add alert`
- [ ] Install: `npx shadcn@latest add badge`
- [ ] Install: `npx shadcn@latest add table`
- [ ] Install: `npx shadcn@latest add tabs`
- [ ] Install: `npx shadcn@latest add accordion`
- [ ] Install: `npx shadcn@latest add separator`
- [ ] Customize Button variants (gradient, secondary, ghost)
- [ ] Customize Card with backdrop-blur

### Phase 3: ProductConfigPage 🎨

- [ ] Remove blue icon background from "Product Information"
- [ ] Remove green icon background from "API Credentials"
- [ ] Remove purple icon background from "Yield Strategies"
- [ ] Update section headers to border-bottom style
- [ ] Replace inputs with shadcn Input
- [ ] Update currency selector (blue border on selected)
- [ ] Update warning alert to shadcn Alert
- [ ] Update "Save Configuration" button to gradient
- [ ] Replace "Regenerate Key" button styling

### Phase 4: Landing Page Hero 🚀

- [ ] Remove colorful gradient orb backgrounds
- [ ] Update background to `bg-gradient-to-b from-gray-25 to-white`
- [ ] Apply gradient to accent word ("Strategies")
- [ ] Update "Get Started" button to `bg-gradient-luma`
- [ ] Update "View Demo" button to secondary style
- [ ] Update body text to `text-gray-700`
- [ ] Update headlines to `text-gray-950`

### Phase 5: Onboarding Wizard 🔮

- [ ] Update step indicators (gradient for active)
- [ ] Remove colorful step backgrounds
- [ ] Update customer tier cards (border-only, blue when selected)
- [ ] Update strategy selection checkmarks (blue)
- [ ] Keep currency flags but minimal borders
- [ ] Update "Next" button to gradient
- [ ] Update chart colors to gray-scale + accent
- [ ] Replace all forms with shadcn Form components

### Phase 6: Dashboard Pages 📊

- [ ] OverviewPage: Update StatCards to gray-based
- [ ] APIKeysPage: Clean table with gray borders
- [ ] AnalyticsPage: Update charts to gray-scale
- [ ] ExplorePage: Remove colorful protocol cards
- [ ] IntegrationPage: Clean code blocks
- [ ] PortfoliosListPage: Gray table with accent badges
- [ ] RampOperationsPage: Clean transaction list

### Phase 7: Other Landing Sections 🎯

- [ ] TradingStrategiesSection: Gray chart + accent
- [ ] SupportedAssetsSection: Minimal asset grid
- [ ] CustomizeEarnSection: Remove colorful feature cards
- [ ] IntegrationSection: Clean code examples
- [ ] EndUserEarningSection: Gray text hierarchy

### Phase 8: Polish & Testing ✨

- [ ] Remove `react-hot-toast`, use shadcn Sonner
- [ ] Accessibility audit (WCAG contrast with custom grays)
- [ ] Responsive testing (mobile, tablet, desktop)
- [ ] Test all interactive states (hover, focus, active)
- [ ] Animation review (keep only essential)
- [ ] Performance check (remove unused CSS/JS)
- [ ] Documentation update

---

## 🔧 shadcn/ui Installation Commands

```bash
# Navigate to whitelabel-web
cd apps/whitelabel-web

# Initialize shadcn (manual mode to keep our config)
npx shadcn@latest init

# Install components one by one
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add alert
npx shadcn@latest add badge
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add accordion
npx shadcn@latest add separator
npx shadcn@latest add form
npx shadcn@latest add label
npx shadcn@latest add textarea
```

---

## 🎨 Example Refactors

### ProductConfigPage Section Header

**BEFORE:**
```jsx
<div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
  <div className="flex items-center gap-4 mb-6">
    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
      <Building2 className="w-7 h-7 text-blue-600" />
    </div>
    <div>
      <h2 className="text-xl font-bold text-gray-900">Product Information</h2>
      <p className="text-sm text-gray-500">Basic details about your product</p>
    </div>
  </div>

  {/* Form fields */}
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Company Name
      </label>
      <input
        type="text"
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl..."
      />
    </div>
  </div>
</div>
```

**AFTER:**
```jsx
<div className="bg-white/90 backdrop-blur-md border border-gray-150 rounded-xl p-8">
  <div className="border-b border-gray-150 pb-4 mb-6">
    <h2 className="text-xl font-semibold text-gray-950 mb-1">
      Product Information
    </h2>
    <p className="text-sm text-gray-500">
      Basic details about your product
    </p>
  </div>

  {/* Form fields with shadcn */}
  <div className="space-y-4">
    <div>
      <Label htmlFor="company-name" className="text-sm font-medium text-gray-700">
        Company Name
      </Label>
      <Input
        id="company-name"
        type="text"
        placeholder="Enter company name"
        className="mt-2"
      />
    </div>
  </div>
</div>
```

---

### Landing Hero Section

**BEFORE:**
```jsx
<div className="relative bg-gradient-to-br from-blue-50/80 via-white to-pink-50/80 overflow-hidden">
  {/* Animated gradient orbs */}
  <div className="absolute -top-40 -right-40 w-96 h-96
    bg-gradient-to-br from-blue-300/20 via-purple-300/15 to-pink-300/20
    rounded-full blur-3xl animate-pulse" />
  <div className="absolute -bottom-40 -left-40 w-96 h-96
    bg-gradient-to-br from-purple-300/20 via-pink-300/15 to-blue-300/20
    rounded-full blur-3xl animate-pulse" />

  <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
    <h1 className="text-5xl lg:text-6xl font-bold mb-6">
      <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
        Earn on anywhere,
      </span>
      <br />
      <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
        onboard users to digital assets
      </span>
    </h1>

    <p className="text-xl text-gray-600 mb-8">
      White-label DeFi yield infrastructure...
    </p>

    <div className="flex gap-4 justify-center">
      <button className="bg-gradient-to-r from-blue-500 to-indigo-500
        text-white px-8 py-4 rounded-full...">
        Get Started
      </button>
      <button className="bg-white text-gray-700 px-8 py-4 rounded-full...">
        View Demo
      </button>
    </div>
  </div>
</div>
```

**AFTER:**
```jsx
<div className="relative bg-gradient-to-b from-gray-25 via-white to-white overflow-hidden">
  {/* Remove animated orbs */}

  <div className="max-w-6xl mx-auto px-6 py-24 text-center">
    <h1 className="text-5xl lg:text-6xl font-bold text-gray-950 mb-6">
      Earn on anywhere, <br/>
      onboard users to
      <span className="bg-gradient-luma bg-clip-text text-transparent">
        {" "}digital assets
      </span>
    </h1>

    <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
      White-label DeFi yield infrastructure for apps. Turn idle balances
      into yield-generating assets with institutional-grade custody and compliance.
    </p>

    <div className="flex gap-4 justify-center">
      <button className="bg-gradient-luma text-white px-8 py-4 rounded-lg
        hover:saturate-150 shadow-md hover:shadow-lg transition-all font-medium">
        Get Started
      </button>
      <button className="bg-white border border-gray-200 text-gray-950 px-8 py-4
        rounded-lg hover:bg-gray-25 hover:border-gray-300 transition-all font-medium">
        View Demo
      </button>
    </div>
  </div>
</div>
```

---

### Onboarding Step Indicator

**BEFORE:**
```jsx
<div className="flex items-center justify-center gap-3 mb-8">
  <div className="flex items-center gap-2 px-6 py-3 bg-blue-100 rounded-full">
    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
      <span className="text-white font-semibold">1</span>
    </div>
    <span className="font-medium text-blue-900">Company Info</span>
  </div>

  <ChevronRight className="w-5 h-5 text-gray-400" />

  <div className="flex items-center gap-2 px-6 py-3 bg-purple-100 rounded-full">
    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
      <span className="text-white font-semibold">2</span>
    </div>
    <span className="font-medium text-purple-900">Strategy Selection</span>
  </div>

  <ChevronRight className="w-5 h-5 text-gray-400" />

  <div className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-full">
    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
      <span className="text-white font-semibold">3</span>
    </div>
    <span className="font-medium text-gray-500">Banking Integration</span>
  </div>
</div>
```

**AFTER:**
```jsx
<div className="flex items-center justify-center gap-2 mb-8">
  {/* Completed step */}
  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
    <Check className="w-4 h-4 text-gray-600" />
    <span className="text-sm font-medium text-gray-600">Company Info</span>
  </div>

  <ChevronRight className="w-4 h-4 text-gray-300" />

  {/* Active step */}
  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-luma rounded-full">
    <span className="text-sm font-medium text-white">Strategy Selection</span>
  </div>

  <ChevronRight className="w-4 h-4 text-gray-300" />

  {/* Upcoming step */}
  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border
    border-gray-200 rounded-full">
    <span className="text-sm text-gray-400">Banking Integration</span>
  </div>
</div>
```

---

## 🚨 Common Mistakes to Avoid

### ❌ Don't Do This

1. **Using colorful icon backgrounds**
   ```jsx
   ❌ <div className="w-14 h-14 bg-blue-100 rounded-2xl">
        <Icon className="text-blue-600" />
      </div>
   ```

2. **Multiple gradient backgrounds everywhere**
   ```jsx
   ❌ <div className="bg-gradient-to-r from-blue-500 to-purple-500">
   ❌ <div className="bg-gradient-to-br from-pink-300 to-blue-300">
   ```

3. **Colorful text for non-accent content**
   ```jsx
   ❌ <p className="text-blue-600">Regular body text</p>
   ❌ <h2 className="text-purple-500">Section header</h2>
   ```

4. **Colored borders on non-active states**
   ```jsx
   ❌ <div className="border-blue-500">Inactive card</div>
   ```

5. **Overusing the gradient accent**
   ```jsx
   ❌ Every button is gradient
   ❌ Every heading has gradient text
   ```

### ✅ Do This Instead

1. **Minimal icons or text-only headers**
   ```jsx
   ✅ <div className="border-b border-gray-150 pb-4">
        <h2 className="text-gray-950 font-semibold">Section</h2>
      </div>
   ```

2. **Subtle gray gradients only**
   ```jsx
   ✅ <div className="bg-gradient-to-b from-gray-25 to-white">
   ```

3. **Gray text hierarchy**
   ```jsx
   ✅ <p className="text-gray-700">Body text</p>
   ✅ <h2 className="text-gray-950">Heading</h2>
   ```

4. **Gray borders, accent on active**
   ```jsx
   ✅ <div className="border-gray-200">Inactive</div>
   ✅ <div className="border-accent">Active</div>
   ```

5. **Strategic gradient usage**
   ```jsx
   ✅ Primary CTA only
   ✅ One or two accent words in hero
   ✅ Active/selected states
   ```

---

## 📊 Progress Tracking

### Week 1: Foundation (Dec 6-13)
- [ ] Update tailwind.config.js
- [ ] Install shadcn/ui
- [ ] Create base component variants
- [ ] Document patterns (this file)

### Week 2: Dashboard (Dec 13-20)
- [ ] ProductConfigPage refactor
- [ ] OverviewPage refactor
- [ ] APIKeysPage refactor
- [ ] Other dashboard pages

### Week 3: Landing + Onboarding (Dec 20-27)
- [ ] Hero section refactor
- [ ] All landing sections
- [ ] Onboarding wizard
- [ ] Forms migration

### Week 4: Polish (Dec 27-Jan 3)
- [ ] Accessibility audit
- [ ] Responsive testing
- [ ] Performance optimization
- [ ] Documentation

---

## 🎯 Success Criteria

- ✅ Zero colorful icon backgrounds
- ✅ Gradient used only on primary CTAs and accents
- ✅ All text uses gray hierarchy (gray-950 to gray-400)
- ✅ All interactive states have hover/focus/active variants
- ✅ WCAG AA contrast ratios met
- ✅ shadcn/ui components implemented consistently
- ✅ Responsive on mobile, tablet, desktop
- ✅ Performance maintained (no regression)

---

## 📚 References

- **Luma Design**: https://lu.ma/home
- **Luma Colors**: https://mobbin.com/colors/brand/luma
- **shadcn/ui**: https://ui.shadcn.com
- **Our Tailwind Config**: `apps/whitelabel-web/tailwind.config.js`

---

**Last Updated**: 2025-12-06
**Maintained By**: Claude + @wtshai
**Status**: 🚧 Ready to implement
