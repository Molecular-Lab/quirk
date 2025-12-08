# Complete Shadcn/UI Migration Plan

> **Status:** 🚧 Ready to Execute
> **Created:** 2025-12-07
> **Total Files:** 11 files requiring migration
> **Estimated Time:** 30-45 hours

---

## Overview

Migrate all UI components to shadcn/ui for long-term maintainability and consistency.

**Current Status:**
- ✅ TailwindCSS v4 migration completed
- ✅ All shadcn components installed
- ✅ 1/4 tabs migrated (RampOperationsPage)

**Components Available:**
- accordion, alert, avatar, badge, button, card, checkbox, dialog
- dropdown-menu, form, input, label, popover, progress, radio-group
- select, separator, sheet, skeleton, sonner, switch, table, tabs, textarea, tooltip

---

## Phase 1: Tables (Priority: HIGH)

**Goal:** Migrate all HTML tables to shadcn Table component
**Files:** 3 files, 4 table instances
**Estimated:** 6-8 hours

### 1.1 PortfolioDetailPage.tsx (Simple - 1 table)
- **File:** `src/feature/dashboard/PortfolioDetailPage.tsx`
- **Lines:** 124-174
- **Current:** Native HTML `<table>` for end-users list
- **Complexity:** Simple (1-2h)
- **Special Considerations:** Read-only display, right-aligned numbers

### 1.2 PortfoliosListPage.tsx (Simple - 1 table)
- **File:** `src/feature/dashboard/PortfoliosListPage.tsx`
- **Lines:** 23-89
- **Current:** Native HTML `<table>` with hover actions
- **Complexity:** Simple (1-2h)
- **Special Considerations:** Hover effect reveals action button

### 1.3 OverviewPage.tsx (Medium - 2 tables)
- **File:** `src/feature/dashboard/OverviewPage.tsx`
- **Lines:** 402-470 (End-Users table), 501-545 (Portfolios table)
- **Current:** Native HTML `<table>` with avatars + badges
- **Complexity:** Medium (3-4h)
- **Special Considerations:**
  - End-Users table: avatar column with gradient circles
  - Badge components for status
  - Action buttons in rows
  - Hover states

**Migration Pattern:**
```tsx
// Before
<table>
  <thead><tr><th>Column</th></tr></thead>
  <tbody><tr><td>Data</td></tr></tbody>
</table>

// After
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## Phase 2: Tabs (Priority: HIGH)

**Goal:** Complete tabs migration to shadcn Tabs
**Files:** 2 files (1 already done)
**Estimated:** 2-3 hours

### 2.1 RampOperationsPage.tsx ✅ DONE
- **Status:** Complete - use as reference implementation
- **File:** `src/feature/dashboard/RampOperationsPage.tsx`
- **Lines:** 155-160

### 2.2 OverviewPage.tsx (Simple)
- **File:** `src/feature/dashboard/OverviewPage.tsx`
- **Lines:** 492-498
- **Current:** Custom button tabs with border-bottom active state
- **Complexity:** Simple (1-1.5h)
- **Special Considerations:** Shows count in tab label "(1)"

### 2.3 PortfoliosListPage.tsx (Simple)
- **File:** `src/feature/dashboard/PortfoliosListPage.tsx`
- **Lines:** 14-20
- **Current:** Custom button tabs
- **Complexity:** Simple (1-1.5h)

**Migration Pattern:**
```tsx
// Before
const [activeTab, setActiveTab] = useState("tab1")
<button onClick={() => setActiveTab("tab1")}>Tab 1</button>
{activeTab === "tab1" && <div>Content</div>}

// After
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

---

## Phase 3: Selects & Dropdowns (Priority: HIGH)

**Goal:** Replace native selects and custom dropdowns
**Files:** 4 files, 6 select instances
**Estimated:** 5-7 hours

### 3A. Native Selects → shadcn Select

#### 3A.1 OnRampModal.tsx (2 selects)
- **File:** `src/feature/dashboard/OnRampModal.tsx`
- **Lines:** 146-160 (Fiat currency), 182-207 (Crypto token)
- **Complexity:** Simple (1h each = 2h total)
- **Special Considerations:** Crypto selector has disabled options

#### 3A.2 BankAccountForm.tsx (1 select)
- **File:** `src/feature/onboarding/components/BankAccountForm.tsx`
- **Lines:** 220-232
- **Current:** Native `<select>` for currency
- **Complexity:** Simple (30min)

#### 3A.3 CompanyInfoForm.tsx (2 selects)
- **File:** `src/feature/onboarding/components/CompanyInfoForm.tsx`
- **Lines:** 135-155 (Business Type), 162-181 (Industry)
- **Complexity:** Simple (1h total)
- **Special Considerations:** Error state styling

### 3B. Custom Dropdown → shadcn DropdownMenu

#### 3B.1 ProductSwitcher.tsx (Custom dropdown)
- **File:** `src/components/ProductSwitcher.tsx`
- **Lines:** 30-96
- **Current:** Custom dropdown with backdrop + absolute positioning
- **Complexity:** Medium (2-3h)
- **Special Considerations:**
  - Product list with active indicator (Check icon)
  - "Create New Product" action at bottom
  - ChevronDown rotation animation

**Migration Pattern (Select):**
```tsx
// Before
<select onChange={(e) => setValue(e.target.value)}>
  <option value="1">Option 1</option>
</select>

// After
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

<Select onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

**Migration Pattern (DropdownMenu):**
```tsx
// Before
<button onClick={toggleDropdown}>Menu</button>
{isOpen && (
  <div className="absolute">
    <button onClick={action}>Item</button>
  </div>
)}

// After
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={action}>Item</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## Phase 4: Modals & Sheets (Priority: MEDIUM)

**Goal:** Convert custom modals to Dialog/Sheet
**Files:** 2 files (2 already using Dialog)
**Estimated:** 4-6 hours

### 4.1 OnRampModal.tsx ✅ DONE
- **Status:** Already using shadcn Dialog
- **File:** `src/feature/dashboard/OnRampModal.tsx`

### 4.2 DepositModal.tsx ✅ DONE
- **Status:** Already using shadcn Dialog
- **File:** `src/feature/demo/shared/DepositModal.tsx`

### 4.3 APIKeysPage.tsx (Custom modal → Dialog)
- **File:** `src/feature/dashboard/APIKeysPage.tsx`
- **Lines:** 183-218
- **Current:** Custom modal with fixed positioning + backdrop
- **Complexity:** Medium (2-3h)
- **Special Considerations:**
  - Create API key form
  - Input validation
  - Success state handling

### 4.4 DemoSettings.tsx (Panel → Sheet)
- **File:** `src/feature/demo/shared/DemoSettings.tsx`
- **Lines:** 57-144
- **Current:** Fixed position panel (`fixed bottom-24 right-6`)
- **Complexity:** Medium (2-3h)
- **Special Considerations:**
  - NOT a modal - it's a settings panel
  - Should use Sheet component
  - Slide from right/bottom
  - Multiple form inputs

**Migration Pattern (Dialog):**
```tsx
// Before
{isOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50">
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6">Content</div>
    </div>
  </div>
)}

// After
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    Content
  </DialogContent>
</Dialog>
```

**Migration Pattern (Sheet):**
```tsx
// Before
{isOpen && (
  <div className="fixed bottom-24 right-6 bg-white p-4">
    Settings panel
  </div>
)}

// After
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetTrigger asChild>
    <button>Settings</button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Settings</SheetTitle>
    </SheetHeader>
    Settings panel
  </SheetContent>
</Sheet>
```

---

## Phase 5: Small Components (Priority: MEDIUM)

**Goal:** Migrate checkboxes and tooltips
**Files:** 2 files
**Estimated:** 2-3 hours

### 5.1 RampOperationsPage.tsx (Checkboxes)
- **File:** `src/feature/dashboard/RampOperationsPage.tsx`
- **Lines:** 306-313
- **Current:** Native `<input type="checkbox">`
- **Complexity:** Simple (1h)
- **Special Considerations:**
  - Bulk selection for orders
  - Connected to `Set<string>` state
  - Row highlighting on selection

### 5.2 DashboardLayout.tsx (Tooltips)
- **File:** `src/layouts/DashboardLayout.tsx`
- **Lines:** 55-61
- **Current:** Custom CSS tooltip with `group-hover:opacity-100`
- **Complexity:** Simple (1-2h)
- **Special Considerations:**
  - Navigation icon tooltips
  - Positioned to right of icon

**Migration Pattern (Checkbox):**
```tsx
// Before
<input
  type="checkbox"
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
/>

// After
import { Checkbox } from "@/components/ui/checkbox"

<Checkbox
  checked={checked}
  onCheckedChange={setChecked}
/>
```

**Migration Pattern (Tooltip):**
```tsx
// Before
<div className="group relative">
  <button>Icon</button>
  <span className="absolute opacity-0 group-hover:opacity-100">
    Tooltip text
  </span>
</div>

// After
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <button>Icon</button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Tooltip text</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## Phase 6: Forms (Priority: LOW - Complex)

**Goal:** Migrate to react-hook-form + shadcn Form
**Files:** 2 files
**Estimated:** 10-14 hours

### 6.1 BankAccountForm.tsx
- **File:** `src/feature/onboarding/components/BankAccountForm.tsx`
- **Complexity:** Complex (5-7h)
- **Special Considerations:**
  - Dynamic form fields (add/remove bank accounts)
  - Input validation
  - Icon inputs (Building2, Plus, Trash2)
  - Select dropdown (will be done in Phase 3A)

### 6.2 CompanyInfoForm.tsx
- **File:** `src/feature/onboarding/components/CompanyInfoForm.tsx`
- **Lines:** 97-303
- **Complexity:** Complex (5-7h)
- **Special Considerations:**
  - Multi-step form validation
  - Radio group for customer tier (custom styled)
  - Textarea for description
  - Currency input with $ prefix
  - Select dropdowns (will be done in Phase 3A)
  - Error state handling

**Migration Pattern:**
```tsx
// Before
<form onSubmit={handleSubmit}>
  <input
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
  {error && <span>{error}</span>}
</form>

// After
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  field: z.string().min(1, "Required"),
})

const form = useForm({
  resolver: zodResolver(formSchema),
})

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="field"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Label</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

**Additional Dependencies:**
```bash
pnpm add react-hook-form @hookform/resolvers zod
```

---

## Phase 7: Customize Components + Restore Colors

**Goal:** Add custom variants and restore Luma design
**Estimated:** 4-6 hours

### 7.1 Customize Button Component
- **File:** `src/components/ui/button.tsx`
- **Tasks:**
  - Add `gradient` variant (Luma gradient)
  - Verify `secondary` and `ghost` variants
  - Update existing buttons to use variants

**Button Variants to Add:**
```tsx
gradient: "bg-gradient-luma text-white hover:saturate-150 shadow-md hover:shadow-lg"
```

### 7.2 Customize Card Component
- **File:** `src/components/ui/card.tsx`
- **Tasks:**
  - Add `backdrop-blur-md` variant
  - Update cards across app

**Card Variants to Add:**
```tsx
blurred: "bg-white/90 backdrop-blur-md"
```

### 7.3 Update tailwind.config.js
- **File:** `apps/whitelabel-web/tailwind.config.js`
- **Tasks:**
  - Add Luma gradient to `backgroundImage`
  - Add accent colors to `colors`
  - Verify custom gray scale compatibility with TailwindCSS v4

**Colors to Add:**
```js
// theme.extend.backgroundImage
'gradient-luma': 'linear-gradient(135deg, #6366F1 0%, #3B82F6 50%, #06B6D4 100%)',

// theme.extend.colors
accent: {
  DEFAULT: '#3B82F6',
  hover: '#2563EB',
  light: '#DBEAFE',
}
```

---

## Migration Strategy

### Order of Execution

1. **Phase 1:** Tables (high impact, clear pattern)
2. **Phase 2:** Tabs (finish what we started)
3. **Phase 3:** Selects (straightforward replacements)
4. **Phase 4:** Modals & Sheets (medium complexity)
5. **Phase 5:** Checkboxes & Tooltips (quick wins)
6. **Phase 7:** Customize + Colors (before complex forms)
7. **Phase 6:** Forms (most complex, saved for last)

### Testing After Each Phase

After completing each phase, verify:
- ✅ Dev server runs without errors
- ✅ Visual regression check (compare before/after screenshots)
- ✅ Component functionality preserved
- ✅ Mobile responsiveness maintained
- ✅ No console errors
- ✅ TypeScript type errors resolved

### Git Strategy

```bash
# Create feature branch
git checkout -b feat/shadcn-migration-complete

# Commit after each phase
git add .
git commit -m "feat: migrate tables to shadcn Table component (Phase 1)"

# Tag completed phases
git tag phase-1-tables
git tag phase-2-tabs
# ... etc

# Final merge when all phases complete
git checkout main
git merge feat/shadcn-migration-complete
```

### Rollback Strategy

If a phase introduces issues:
```bash
# Revert to previous phase tag
git reset --hard phase-N-name

# Or revert specific commit
git revert <commit-hash>
```

---

## Success Criteria

### Technical Requirements
- ✅ All 11 files migrated to shadcn components
- ✅ Zero native HTML `<table>`, `<select>`, or custom modals remaining
- ✅ All components use consistent shadcn patterns
- ✅ Type-safe component props (TypeScript errors resolved)
- ✅ No console warnings or errors

### UX Requirements
- ✅ Better accessibility (ARIA attributes from shadcn)
- ✅ Keyboard navigation works for all interactive elements
- ✅ Focus states visible and consistent
- ✅ Screen reader compatibility improved

### Design Requirements
- ✅ Luma gradient + custom colors restored
- ✅ Consistent UI patterns across entire app
- ✅ Visual parity with current design (no regressions)
- ✅ Mobile responsive on all screen sizes

### Maintainability Requirements
- ✅ Easier to maintain and extend
- ✅ Consistent component API across app
- ✅ Better developer experience (autocomplete, types)
- ✅ Documented migration patterns for future reference

---

## Files Summary

### Files Requiring Migration (11 total)

**Phase 1 - Tables:**
1. `src/feature/dashboard/PortfolioDetailPage.tsx`
2. `src/feature/dashboard/PortfoliosListPage.tsx`
3. `src/feature/dashboard/OverviewPage.tsx`

**Phase 2 - Tabs:**
4. `src/feature/dashboard/OverviewPage.tsx` (also has tables)
5. `src/feature/dashboard/PortfoliosListPage.tsx` (also has table)

**Phase 3 - Selects/Dropdowns:**
6. `src/feature/dashboard/OnRampModal.tsx`
7. `src/feature/onboarding/components/BankAccountForm.tsx`
8. `src/feature/onboarding/components/CompanyInfoForm.tsx`
9. `src/components/ProductSwitcher.tsx`

**Phase 4 - Modals/Sheets:**
10. `src/feature/dashboard/APIKeysPage.tsx`
11. `src/feature/demo/shared/DemoSettings.tsx`

**Phase 5 - Small Components:**
- `src/feature/dashboard/RampOperationsPage.tsx` (checkboxes)
- `src/layouts/DashboardLayout.tsx` (tooltips)

**Phase 6 - Forms:**
- `src/feature/onboarding/components/BankAccountForm.tsx` (already in Phase 3)
- `src/feature/onboarding/components/CompanyInfoForm.tsx` (already in Phase 3)

### Files Already Using Shadcn (No Migration)

✅ `src/feature/dashboard/OnRampModal.tsx` - Dialog
✅ `src/feature/demo/shared/DepositModal.tsx` - Dialog
✅ `src/feature/dashboard/RampOperationsPage.tsx` - Tabs

---

## Progress Tracking

### Overall Progress: 0/7 Phases Complete

- [ ] **Phase 1:** Tables (0/3 files)
- [ ] **Phase 2:** Tabs (1/3 files - RampOperationsPage done)
- [ ] **Phase 3:** Selects & Dropdowns (0/4 files)
- [ ] **Phase 4:** Modals & Sheets (2/4 files - OnRampModal, DepositModal done)
- [ ] **Phase 5:** Small Components (0/2 files)
- [ ] **Phase 6:** Forms (0/2 files)
- [ ] **Phase 7:** Customize + Colors (0/3 tasks)

---

## References

- **shadcn/ui Docs:** https://ui.shadcn.com
- **TailwindCSS v4 Docs:** https://tailwindcss.com/docs/v4-beta
- **Radix UI:** https://www.radix-ui.com (shadcn is built on Radix)
- **React Hook Form:** https://react-hook-form.com
- **Luma Design Reference:** https://lu.ma/home

---

**Last Updated:** 2025-12-07
**Status:** 🚧 Ready to Execute
**Next Step:** Begin Phase 1 - Tables Migration
