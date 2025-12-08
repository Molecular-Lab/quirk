# Shadcn/UI Migration Tracking

> **Status**: 🚧 In Progress
> **Started**: 2025-12-07
> **Design Guide**: `TODO_UXUI_SHADCN_REFACTOR.md`
> **Total Effort**: 51-84 hours (4-5 weeks)

---

## 📊 Progress Overview

- **Phase 1**: ⬜ Not Started (8-11h)
- **Phase 2**: ⬜ Not Started (11-16h)
- **Phase 3**: ⬜ Not Started (10-19h)
- **Phase 4**: ⬜ Not Started (12-24h)
- **Phase 5**: ⬜ Not Started (10-14h)

**Total Progress**: 0% (0/120+ components migrated)

---

## 🎯 Phase 1: Critical Foundation (Week 1)

**Priority**: CRITICAL
**Estimated**: 8-11 hours
**Status**: ⬜ Not Started

### Install Components

```bash
cd apps/whitelabel-web
npx shadcn@latest add dialog
npx shadcn@latest add sonner
```

- [ ] Install `dialog` component
- [ ] Install `sonner` component

### 1.1 Replace react-hot-toast with Sonner

**Reference**: [Sonner Docs](https://ui.shadcn.com/docs/components/sonner)
**Effort**: 2-3 hours
**Status**: ⬜ Not Started

- [ ] `src/feature/dashboard/ProductConfigPage.tsx` - Replace toast calls
- [ ] `src/feature/onboarding/CreateProduct.tsx` - Replace toast calls
- [ ] `src/feature/auth/LoginPage.tsx` - Replace toast calls
- [ ] `src/feature/dashboard/ProductStrategyConfig.tsx` - Replace toast calls
- [ ] Remove `react-hot-toast` dependency from `package.json`
- [ ] Add `<Toaster />` component to root layout
- [ ] Test all toast notifications

**Pattern:**
```tsx
// Before
import toast from 'react-hot-toast';
toast.success('Saved!');

// After
import { toast } from 'sonner';
toast.success('Saved!');
```

### 1.2 Migrate DepositModal to Dialog

**Reference**: [Dialog Docs](https://ui.shadcn.com/docs/components/dialog)
**File**: `src/feature/demo/shared/DepositModal.tsx:100-219`
**Effort**: 1-2 hours
**Status**: ⬜ Not Started

- [ ] Replace custom overlay with `Dialog` component
- [ ] Update props: `isOpen` → `open`, `onClose` → `onOpenChange`
- [ ] Preserve deposit flow logic
- [ ] Test on all 3 demo pages (E-commerce, Creators, Gig Workers)

**Pattern:**
```tsx
// Before
{isOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-3xl">
      {/* Content */}
    </div>
  </div>
)}

// After
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Deposit</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### 1.3 Migrate OnRampModal to Dialog

**Reference**: [Dialog Docs](https://ui.shadcn.com/docs/components/dialog)
**File**: `src/feature/dashboard/OnRampModal.tsx`
**Effort**: 2-3 hours
**Status**: ⬜ Not Started

- [ ] Replace custom modal with `Dialog` component
- [ ] Preserve multi-step flow (currency selection, amount, confirmation)
- [ ] Update state management if needed
- [ ] Test complete on-ramp flow

### 1.4 Remove Colorful Icon Backgrounds (DESIGN CRITICAL)

**Reference**: `TODO_UXUI_SHADCN_REFACTOR.md` Section 4
**Effort**: 2-3 hours
**Status**: ⬜ Not Started

#### Files to Update:

- [ ] `src/feature/dashboard/OperationsDashboard.tsx:148-150` - Remove `bg-blue-100 + text-blue-600`
- [ ] `src/feature/dashboard/OperationsDashboard.tsx:165-167` - Remove blue UserPlus background
- [ ] `src/feature/dashboard/OperationsDashboard.tsx:178-180` - Remove green DollarSign background
- [ ] `src/feature/dashboard/OperationsDashboard.tsx:191-193` - Remove purple Zap background
- [ ] `src/feature/dashboard/OperationsDashboard.tsx:203-205` - Remove purple Sparkles background
- [ ] `src/feature/dashboard/RampOperationsPage.tsx:146-148` - Remove colorful pattern
- [ ] `src/feature/onboarding/CreateProduct.tsx:196-197` - Review gradient orbs (OK for background)

**Pattern:**
```tsx
// Before ❌
<div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
  <Building2 className="w-7 h-7 text-blue-600" />
</div>

// After ✅
<div className="border-b border-gray-150 pb-4 mb-6">
  <div className="flex items-center gap-2 mb-1">
    <Building2 className="w-5 h-5 text-gray-400" />
    <h2 className="text-xl font-semibold text-gray-950">
      Product Information
    </h2>
  </div>
</div>
```

---

## 🎯 Phase 2: Forms & Inputs (Week 2)

**Priority**: HIGH
**Estimated**: 11-16 hours
**Status**: ⬜ Not Started

### Install Components

```bash
npx shadcn@latest add form
npx shadcn@latest add checkbox
npx shadcn@latest add textarea
npx shadcn@latest add radio-group
npx shadcn@latest add switch
npx shadcn@latest add field
npx shadcn@latest add input-group
```

- [ ] Install `form` component
- [ ] Install `checkbox` component
- [ ] Install `textarea` component
- [ ] Install `radio-group` component
- [ ] Install `switch` component
- [ ] Install `field` component
- [ ] Install `input-group` component

### 2.1 Migrate Forms to react-hook-form + shadcn Form

**References**:
- [Form Docs](https://ui.shadcn.com/docs/components/form)
- [Field Docs](https://ui.shadcn.com/docs/components/field)
- [Input Group Docs](https://ui.shadcn.com/docs/components/input-group)

**Effort**: 6-8 hours
**Status**: ⬜ Not Started

#### ProductConfigPage.tsx Forms

- [ ] `ProductConfigPage.tsx:312-363` - Product Information Form
  - [ ] Wrap in `<Form>` with react-hook-form
  - [ ] Add Zod schema for validation
  - [ ] Convert 5 inputs + 1 textarea
  - [ ] Add error states

- [ ] `ProductConfigPage.tsx:486-590` - Bank Account Forms
  - [ ] Wrap in `<Form>` with react-hook-form
  - [ ] Add Zod schema for bank validation
  - [ ] Convert all currency-specific fields
  - [ ] Add error states

#### Onboarding Forms

- [ ] `CreateProduct.tsx:50-66` - Multi-step Onboarding
  - [ ] Create Zod schemas for each step
  - [ ] Wrap forms in `<Form>` component
  - [ ] Preserve step navigation logic
  - [ ] Add validation error display

#### Auth Forms

- [ ] `LoginPage.tsx:22-25` - Email/Password Login
  - [ ] Add react-hook-form
  - [ ] Add Zod schema (email validation)
  - [ ] Convert inputs to shadcn Input
  - [ ] Add error messages

**Pattern:**
```tsx
// Before
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Company Name
  </label>
  <input
    type="text"
    value={formData.companyName}
    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg..."
  />
</div>

// After
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
});

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="companyName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Company Name</FormLabel>
          <FormControl>
            <Input placeholder="Enter company name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### 2.2 Replace Checkboxes

**Reference**: [Checkbox Docs](https://ui.shadcn.com/docs/components/checkbox)
**Effort**: 2-3 hours
**Status**: ⬜ Not Started

- [ ] `OperationsDashboard.tsx:312-319` - Order selection checkboxes
- [ ] `RampOperationsPage.tsx:93-103` - Order selection checkboxes
- [ ] `ProductStrategyConfig.tsx:68` - "Apply to all products" checkbox
- [ ] Test select-all functionality
- [ ] Verify checkbox states

**Pattern:**
```tsx
// Before
<input
  type="checkbox"
  checked={selectedOrderIds.has(order.orderId)}
  onChange={() => handleToggleSelect(order.orderId)}
  className="w-5 h-5 text-blue-600 border-gray-300 rounded"
/>

// After
<Checkbox
  checked={selectedOrderIds.has(order.orderId)}
  onCheckedChange={() => handleToggleSelect(order.orderId)}
/>
```

### 2.3 Replace Radio-like Selections

**Reference**: [Radio Group Docs](https://ui.shadcn.com/docs/components/radio-group)
**Effort**: 2-3 hours
**Status**: ⬜ Not Started

- [ ] `CreateProduct.tsx:19-25` - Customer tier selection (convert button grid to RadioGroup)
- [ ] `CreateProduct.tsx:35-42` - Currency selection (if single-select, use RadioGroup)
- [ ] Test selection states
- [ ] Verify styling matches Luma design

**Pattern:**
```tsx
// Before
{customerTiers.map((tier) => (
  <button
    onClick={() => setFormData({...formData, customerTier: tier.value})}
    className={formData.customerTier === tier.value ? "border-2 border-accent" : "border-gray-200"}
  >
    {tier.label}
  </button>
))}

// After
<RadioGroup value={formData.customerTier} onValueChange={(value) => setFormData({...formData, customerTier: value})}>
  {customerTiers.map((tier) => (
    <div className="flex items-center space-x-2">
      <RadioGroupItem value={tier.value} id={tier.value} />
      <Label htmlFor={tier.value}>{tier.label}</Label>
    </div>
  ))}
</RadioGroup>
```

### 2.4 Add Switch Components

**Reference**: [Switch Docs](https://ui.shadcn.com/docs/components/switch)
**Effort**: 1-2 hours
**Status**: ⬜ Not Started

- [ ] `LoginPage.tsx:22` - Show/hide password toggle (convert Eye icon to Switch)
- [ ] `ProductConfigPage.tsx:75-76` - Show/hide API key toggle
- [ ] `ProductStrategyConfig.tsx:68` - "Apply to all products" toggle (alternative to checkbox)
- [ ] Test toggle functionality

---

## 🎯 Phase 3: Navigation & Layout (Week 3)

**Priority**: HIGH
**Estimated**: 10-19 hours
**Status**: ⬜ Not Started

### Install Components

```bash
npx shadcn@latest add tabs
npx shadcn@latest add dropdown-menu
npx shadcn@latest add sheet
npx shadcn@latest add tooltip
npx shadcn@latest add popover
npx shadcn@latest add navigation-menu
npx shadcn@latest add sidebar
```

- [ ] Install `tabs` component
- [ ] Install `dropdown-menu` component
- [ ] Install `sheet` component
- [ ] Install `tooltip` component
- [ ] Install `popover` component
- [ ] Install `navigation-menu` component
- [ ] Install `sidebar` component

### 3.1 Replace Custom Tabs

**Reference**: [Tabs Docs](https://ui.shadcn.com/docs/components/tabs)
**Effort**: 2-3 hours
**Status**: ⬜ Not Started

- [ ] `RampOperationsPage.tsx:159-184` - On-Ramp/Off-Ramp tabs
- [ ] `ProductStrategyConfig.tsx:152-200` - Strategy template tabs
- [ ] Remove manual `activeTab` state management
- [ ] Test tab switching
- [ ] Verify styling matches design

**Pattern:**
```tsx
// Before
const [activeTab, setActiveTab] = useState('onramp');

<div className="flex gap-6 border-b border-gray-200">
  <button
    onClick={() => setActiveTab("onramp")}
    className={`pb-3 text-sm font-semibold ${
      activeTab === "onramp" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400"
    }`}
  >
    On-Ramp
  </button>
  <button onClick={() => setActiveTab("offramp")}>Off-Ramp</button>
</div>

{activeTab === 'onramp' && <OnRampContent />}
{activeTab === 'offramp' && <OffRampContent />}

// After
<Tabs defaultValue="onramp">
  <TabsList>
    <TabsTrigger value="onramp">On-Ramp</TabsTrigger>
    <TabsTrigger value="offramp">Off-Ramp</TabsTrigger>
  </TabsList>
  <TabsContent value="onramp">
    <OnRampContent />
  </TabsContent>
  <TabsContent value="offramp">
    <OffRampContent />
  </TabsContent>
</Tabs>
```

### 3.2 Migrate Dropdown Menus

**Reference**: [Dropdown Menu Docs](https://ui.shadcn.com/docs/components/dropdown-menu)
**Effort**: 3-4 hours
**Status**: ⬜ Not Started

- [ ] `ProductSwitcher.tsx:30-97` - Product switcher dropdown
- [ ] `DashboardLayout.tsx:161-206` - User profile dropdown menu
- [ ] `DashboardLayout.tsx:73-81` - User logout menu
- [ ] `DepositModal.tsx:144-148` - Currency selector dropdown
- [ ] Remove custom backdrop/overlay logic
- [ ] Test dropdown positioning
- [ ] Verify keyboard navigation

**Pattern:**
```tsx
// Before
const [isOpen, setIsOpen] = useState(false);

{isOpen && (
  <>
    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg">
      {/* Menu items */}
    </div>
  </>
)}

// After
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost">Open</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuItem>Item 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 3.3 Implement Sheet for Mobile Nav

**Reference**: [Sheet Docs](https://ui.shadcn.com/docs/components/sheet)
**Effort**: 2-3 hours
**Status**: ⬜ Not Started

- [ ] `DashboardLayout.tsx:32-85` - Convert mobile sidebar to Sheet
- [ ] Set `side="left"` for left slide-in
- [ ] Preserve navigation items
- [ ] Test on mobile viewport
- [ ] Verify close on navigation

### 3.4 Consider Sidebar Component (Optional)

**Reference**: [Sidebar Docs](https://ui.shadcn.com/docs/components/sidebar)
**Effort**: 3-4 hours
**Status**: ⬜ Optional

- [ ] `DashboardLayout.tsx` - Evaluate upgrading to shadcn Sidebar
- [ ] Compare with current custom implementation
- [ ] Decision: Keep custom or migrate

### 3.5 Add Tooltips

**Reference**: [Tooltip Docs](https://ui.shadcn.com/docs/components/tooltip)
**Effort**: 2-3 hours
**Status**: ⬜ Not Started

- [ ] `DashboardLayout.tsx:58-60` - Navigation icon tooltips (8+ instances)
- [ ] Replace CSS opacity spans
- [ ] Add `<TooltipProvider>` wrapper
- [ ] Test tooltip positioning
- [ ] Verify accessibility

**Pattern:**
```tsx
// Before
<div className="relative group">
  <Icon className="w-6 h-6" />
  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100">
    {item.name}
  </span>
</div>

// After
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon">
        <Icon className="w-6 h-6" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>{item.name}</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### 3.6 Add Popovers

**Reference**: [Popover Docs](https://ui.shadcn.com/docs/components/popover)
**Effort**: 1-2 hours
**Status**: ⬜ Not Started

- [ ] `ProductConfigPage.tsx:362` - Webhook URL helper text
- [ ] `ProductConfigPage.tsx:429-436` - Warning alerts (convert to Popover)
- [ ] Test popover positioning
- [ ] Verify click-outside behavior

---

## 🎯 Phase 4: Data Display (Week 4)

**Priority**: MEDIUM-HIGH
**Estimated**: 12-24 hours
**Status**: ⬜ Not Started

### Install Components

```bash
npx shadcn@latest add table
npx shadcn@latest add data-table
npx shadcn@latest add avatar
npx shadcn@latest add accordion
npx shadcn@latest add skeleton
npx shadcn@latest add spinner
npx shadcn@latest add progress
npx shadcn@latest add carousel
npx shadcn@latest add chart
npx shadcn@latest add slider
```

- [ ] Install `table` component
- [ ] Install `data-table` component (with TanStack Table)
- [ ] Install `avatar` component
- [ ] Install `accordion` component
- [ ] Install `skeleton` component
- [ ] Install `spinner` component
- [ ] Install `progress` component
- [ ] Install `carousel` component (optional)
- [ ] Install `chart` component (optional)
- [ ] Install `slider` component (optional)

### 4.1 Implement shadcn Tables

**References**:
- [Table Docs](https://ui.shadcn.com/docs/components/table)
- [Data Table Docs](https://ui.shadcn.com/docs/components/data-table)

**Effort**: 6-8 hours
**Status**: ⬜ Not Started

- [ ] `OperationsDashboard.tsx:302-354` - Order list table
  - [ ] Add row selection with checkboxes
  - [ ] Add sorting functionality
  - [ ] Add filtering if needed
  - [ ] Preserve hover states

- [ ] `RampOperationsPage.tsx:186-354` - On-ramp/Off-ramp order tables
  - [ ] Convert to DataTable
  - [ ] Add sorting
  - [ ] Preserve tab context

- [ ] `ProductConfigPage.tsx:486-590` - Bank account grid/table
  - [ ] Convert to Table component
  - [ ] Preserve per-currency layout

- [ ] `TransactionList.tsx:83-112` - Transaction history
  - [ ] Convert to Table
  - [ ] Add pagination if needed

**Pattern:**
```tsx
// Using shadcn DataTable with TanStack Table
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

const columns: ColumnDef<Order>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    accessorKey: "orderId",
    header: "Order ID",
  },
]

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
})

<Table>
  <TableHeader>
    {table.getHeaderGroups().map((headerGroup) => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <TableHead key={header.id}>
            {flexRender(header.column.columnDef.header, header.getContext())}
          </TableHead>
        ))}
      </TableRow>
    ))}
  </TableHeader>
  <TableBody>
    {/* Rows */}
  </TableBody>
</Table>
```

### 4.2 Add Avatars

**Reference**: [Avatar Docs](https://ui.shadcn.com/docs/components/avatar)
**Effort**: 1-2 hours
**Status**: ⬜ Not Started

- [ ] `DashboardLayout.tsx:69-71` - User avatar with initials
- [ ] `DashboardLayout.tsx:151-153` - Header avatar (duplicate)
- [ ] Replace custom gradient background divs
- [ ] Test fallback initials

**Pattern:**
```tsx
// Before
<div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
  <span className="text-white font-semibold text-sm">{userInitial}</span>
</div>

// After
<Avatar>
  <AvatarImage src={user.avatarUrl} alt={user.name} />
  <AvatarFallback>{userInitial}</AvatarFallback>
</Avatar>
```

### 4.3 Implement Accordions

**Reference**: [Accordion Docs](https://ui.shadcn.com/docs/components/accordion)
**Effort**: 2-3 hours
**Status**: ⬜ Not Started

- [ ] `ProductConfigPage.tsx:486-590` - Bank account sections (collapsible per currency)
- [ ] Landing page strategy details (if applicable)
- [ ] Integration code examples (if applicable)
- [ ] Test expand/collapse behavior

### 4.4 Add Skeleton Loading States

**References**:
- [Skeleton Docs](https://ui.shadcn.com/docs/components/skeleton)
- [Spinner Docs](https://ui.shadcn.com/docs/components/spinner)

**Effort**: 2-3 hours
**Status**: ⬜ Not Started

- [ ] `ProductConfigPage.tsx:278-286` - Form loading skeleton
- [ ] `OperationsDashboard.tsx:291-292` - Table loading skeleton
- [ ] `TransactionList.tsx` - Card loading skeleton
- [ ] Replace all `Loader2` spinner instances
- [ ] Create reusable skeleton components (TableSkeleton, CardSkeleton)

**Pattern:**
```tsx
// Before
{isLoading ? (
  <div className="flex justify-center py-8">
    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
  </div>
) : (
  <ProductForm />
)}

// After
{isLoading ? (
  <div className="space-y-4">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
) : (
  <ProductForm />
)}
```

### 4.5 Add Progress Indicators

**Reference**: [Progress Docs](https://ui.shadcn.com/docs/components/progress)
**Effort**: 1-2 hours
**Status**: ⬜ Not Started

- [ ] `CreateProduct.tsx` - Multi-step onboarding progress bar
- [ ] File upload progress (if applicable)
- [ ] Test progress updates

### 4.6 Consider Chart Components (Optional)

**Reference**: [Chart Docs](https://ui.shadcn.com/docs/components/chart)
**Effort**: 3-4 hours
**Status**: ⬜ Optional

- [ ] Evaluate existing chart implementations (recharts)
- [ ] Decision: Migrate to shadcn Chart or keep recharts

### 4.7 Consider Carousel (Optional)

**Reference**: [Carousel Docs](https://ui.shadcn.com/docs/components/carousel)
**Effort**: 2-3 hours
**Status**: ⬜ Optional

- [ ] Landing page features/testimonials carousel
- [ ] Decision: Add carousel if beneficial

### 4.8 Consider Slider (Optional)

**Reference**: [Slider Docs](https://ui.shadcn.com/docs/components/slider)
**Effort**: 1-2 hours
**Status**: ⬜ Optional

- [ ] APY selection slider
- [ ] Risk tolerance slider
- [ ] Decision: Add slider if beneficial

---

## 🎯 Phase 5: Enhancements & Polish (Week 5)

**Priority**: OPTIONAL
**Estimated**: 10-14 hours
**Status**: ⬜ Not Started

### Install Components

```bash
npx shadcn@latest add command
npx shadcn@latest add breadcrumb
npx shadcn@latest add scroll-area
```

- [ ] Install `command` component
- [ ] Install `breadcrumb` component
- [ ] Install `scroll-area` component

### 5.1 Upgrade Search to Command Palette

**Reference**: [Command Docs](https://ui.shadcn.com/docs/components/command)
**Effort**: 3-4 hours
**Status**: ⬜ Not Started

- [ ] `DashboardLayout.tsx:102-126` - Replace input with Command
- [ ] Add `Cmd+K` keyboard shortcut
- [ ] Add search categories (Portfolios, Strategies, Tokens)
- [ ] Test keyboard navigation
- [ ] Test search functionality

### 5.2 Add Breadcrumbs

**Reference**: [Breadcrumb Docs](https://ui.shadcn.com/docs/components/breadcrumb)
**Effort**: 2-3 hours
**Status**: ⬜ Not Started

- [ ] `ProductConfigPage` - Add: Dashboard > Products > [Product Name]
- [ ] `CreateProduct` - Add: Onboarding > Create Product > Step N
- [ ] Test navigation clicks

### 5.3 Polish & Testing

**Effort**: 5-7 hours
**Status**: ⬜ Not Started

#### Visual Regression Testing
- [ ] Test all pages in desktop view (1920x1080)
- [ ] Test all pages in tablet view (768px)
- [ ] Test all pages in mobile view (375px)
- [ ] Compare screenshots before/after migration

#### Interaction Testing
- [ ] Test all form submissions
- [ ] Test all modals/dialogs
- [ ] Test all dropdown menus
- [ ] Test all tabs
- [ ] Test all tooltips
- [ ] Test all checkboxes/radios/switches
- [ ] Test all tables (sorting, selection)

#### Accessibility Audit
- [ ] Run axe DevTools audit
- [ ] Check WCAG AA contrast ratios
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Test screen reader compatibility (VoiceOver/NVDA)
- [ ] Verify focus states on all interactive elements

#### Performance Check
- [ ] Run Lighthouse audit
- [ ] Check bundle size increase (should be < 100KB)
- [ ] Verify no console errors/warnings
- [ ] Test loading performance

#### Documentation
- [ ] Update `TODO_UXUI_SHADCN_REFACTOR.md` with completed items
- [ ] Create component usage guide
- [ ] Document custom variants (gradient button, etc.)
- [ ] Update README if needed

---

## 🎨 Design Compliance Checklist

**Reference**: `TODO_UXUI_SHADCN_REFACTOR.md`

### Color System

- [ ] All icon backgrounds removed (no `bg-blue-100`, `bg-green-100`, etc.)
- [ ] Gray hierarchy applied: `gray-950` (darkest) → `gray-400` (lightest)
- [ ] `bg-gradient-luma` used only on primary CTAs
- [ ] `border-accent` used for selected states
- [ ] `bg-white/90 backdrop-blur-md` used for cards

### Typography

- [ ] Page titles: `text-4xl lg:text-5xl font-bold text-gray-950`
- [ ] Section headings: `text-2xl font-semibold text-gray-950`
- [ ] Body text: `text-base text-gray-700`
- [ ] Helper text: `text-sm text-gray-500`

### Buttons

- [ ] Primary CTA: `bg-gradient-luma`
- [ ] Secondary: `bg-white border border-gray-200 hover:bg-gray-25`
- [ ] Ghost: `text-gray-700 hover:bg-gray-50`

### Cards

- [ ] Standard card: `bg-white/90 backdrop-blur-md border border-gray-150 rounded-xl`
- [ ] Selected card: `border-2 border-accent bg-accent/5`

---

## 📊 Component Installation Tracker

### Already Installed ✅
- [x] `alert`
- [x] `badge`
- [x] `button`
- [x] `card`
- [x] `input`
- [x] `label`
- [x] `select`
- [x] `separator`

### Phase 1 Components
- [ ] `dialog`
- [ ] `sonner`

### Phase 2 Components
- [ ] `form`
- [ ] `checkbox`
- [ ] `textarea`
- [ ] `radio-group`
- [ ] `switch`
- [ ] `field`
- [ ] `input-group`

### Phase 3 Components
- [ ] `tabs`
- [ ] `dropdown-menu`
- [ ] `sheet`
- [ ] `tooltip`
- [ ] `popover`
- [ ] `navigation-menu`
- [ ] `sidebar` (optional)

### Phase 4 Components
- [ ] `table`
- [ ] `data-table`
- [ ] `avatar`
- [ ] `accordion`
- [ ] `skeleton`
- [ ] `spinner`
- [ ] `progress`
- [ ] `carousel` (optional)
- [ ] `chart` (optional)
- [ ] `slider` (optional)

### Phase 5 Components
- [ ] `command`
- [ ] `breadcrumb`
- [ ] `scroll-area`

---

## 🚀 Git Workflow

### Branch Strategy
- [ ] Create branch: `git checkout -b feat/complete-shadcn-migration`

### Commit Strategy
- [ ] Phase 1 complete: `git commit -m "feat: phase 1 - modals, toasts, icon cleanup"`
- [ ] Phase 2 complete: `git commit -m "feat: phase 2 - forms, inputs, validation"`
- [ ] Phase 3 complete: `git commit -m "feat: phase 3 - navigation, menus, mobile"`
- [ ] Phase 4 complete: `git commit -m "feat: phase 4 - tables, skeletons, data display"`
- [ ] Phase 5 complete: `git commit -m "feat: phase 5 - command palette, polish, testing"`

### Tags
- [ ] `git tag phase-1-complete`
- [ ] `git tag phase-2-complete`
- [ ] `git tag phase-3-complete`
- [ ] `git tag phase-4-complete`
- [ ] `git tag phase-5-complete`

---

## 📝 Notes & Blockers

### Notes
- Preserve all existing functionality during migration
- Test each component after migration
- Maintain Luma design system (gray foundation + strategic accents)
- Keep bundle size increase under 100KB

### Blockers
- None currently

### Questions
- None currently

---

## 📚 Resources

### Official Documentation
- [Vite Installation](https://ui.shadcn.com/docs/installation/vite)
- [components.json Config](https://ui.shadcn.com/docs/components-json)

### Component Docs
- [Avatar](https://ui.shadcn.com/docs/components/avatar)
- [Badge](https://ui.shadcn.com/docs/components/badge)
- [Button](https://ui.shadcn.com/docs/components/button)
- [Card](https://ui.shadcn.com/docs/components/card)
- [Carousel](https://ui.shadcn.com/docs/components/carousel)
- [Chart](https://ui.shadcn.com/docs/components/chart)
- [Checkbox](https://ui.shadcn.com/docs/components/checkbox)
- [Command](https://ui.shadcn.com/docs/components/command)
- [Data Table](https://ui.shadcn.com/docs/components/data-table)
- [Dialog](https://ui.shadcn.com/docs/components/dialog)
- [Dropdown Menu](https://ui.shadcn.com/docs/components/dropdown-menu)
- [Field](https://ui.shadcn.com/docs/components/field)
- [Form](https://ui.shadcn.com/docs/components/form)
- [Input](https://ui.shadcn.com/docs/components/input)
- [Input Group](https://ui.shadcn.com/docs/components/input-group)
- [Navigation Menu](https://ui.shadcn.com/docs/components/navigation-menu)
- [Popover](https://ui.shadcn.com/docs/components/popover)
- [Progress](https://ui.shadcn.com/docs/components/progress)
- [Radio Group](https://ui.shadcn.com/docs/components/radio-group)
- [Select](https://ui.shadcn.com/docs/components/select)
- [Separator](https://ui.shadcn.com/docs/components/separator)
- [Sheet](https://ui.shadcn.com/docs/components/sheet)
- [Sidebar](https://ui.shadcn.com/docs/components/sidebar)
- [Skeleton](https://ui.shadcn.com/docs/components/skeleton)
- [Slider](https://ui.shadcn.com/docs/components/slider)
- [Sonner](https://ui.shadcn.com/docs/components/sonner)
- [Spinner](https://ui.shadcn.com/docs/components/spinner)
- [Switch](https://ui.shadcn.com/docs/components/switch)
- [Table](https://ui.shadcn.com/docs/components/table)
- [Tabs](https://ui.shadcn.com/docs/components/tabs)
- [Textarea](https://ui.shadcn.com/docs/components/textarea)
- [Tooltip](https://ui.shadcn.com/docs/components/tooltip)

### Project Resources
- Design Guide: `TODO_UXUI_SHADCN_REFACTOR.md`
- Codebase: `/apps/whitelabel-web`

---

**Last Updated**: 2025-12-07
**Status**: 🚧 In Progress (Phase 1)
**Next**: Install dialog and sonner components
