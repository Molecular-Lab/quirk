# Floating Concierge Integration

**Date**: December 5, 2024  
**Feature**: Connect ContextualAIPanel with FloatingConcierge

---

## 🎯 Overview

This integration allows users to seamlessly transition from the ContextualAIPanel (sidebar strategy advisor) to the
FloatingConcierge (global chat) with their current strategy context automatically injected into the conversation.

---

## 🏗️ Architecture

### Context Provider Pattern

We use React Context API to enable communication between components:

```typescript
FloatingConciergeContext
├── isOpen: boolean
├── setIsOpen: (open: boolean) => void
├── openWithContext: (contextMessage: string) => void
├── contextMessage: string | null
└── clearContext: () => void
```

### Component Hierarchy

```
DashboardLayout (FloatingConciergeProvider)
├── YieldDashboard
│   └── ContextualAIPanel (consumer)
│       └── "💬 Ask AI About This Strategy" button
└── FloatingConcierge (consumer)
    └── Auto-sends contextMessage when opened
```

---

## 🔄 User Flow

### Step 1: User Configures Strategy

In `YieldDashboard.tsx`, user creates or selects a strategy:

- Allocates percentages across protocols (Aave, Compound, Morpho)
- Sees expected APY for each protocol
- Views blended APY calculation

### Step 2: User Clicks "💬 Ask AI About This Strategy"

In `ContextualAIPanel.tsx`, the button triggers:

```typescript
onClick={() => {
  const contextMessage = `I'd like to discuss my yield strategy:

**${strategyName}** (${mode})

**Allocations:**
• Aave V3: 35% (Expected APY: 3.37%)
• Compound V3: 45% (Expected APY: 3.17%)
• Morpho: 20% (Expected APY: 3.80%)

**Expected Blended APY:** 3.45%

Can you help me understand this strategy better and suggest any improvements?`

  openWithContext(contextMessage)
}
```

### Step 3: FloatingConcierge Opens with Context

The `FloatingConcierge` component:

1. Receives `contextMessage` from context provider
2. Opens automatically (`isOpen` = true)
3. Pre-fills the input with the strategy details
4. Auto-sends the message after 500ms delay
5. Clears the context message after sending

```typescript
useEffect(() => {
	if (isOpen && contextMessage && !hasProcessedContext.current) {
		hasProcessedContext.current = true
		setChatInput(contextMessage)
		setTimeout(() => {
			sendMessageWithText(contextMessage)
			clearContext()
		}, 500)
	}
}, [isOpen, contextMessage])
```

### Step 4: AI Responds with Analysis

The FloatingConcierge sends the message to the AI agent:

- Endpoint: `POST /agent`
- Payload: `{ message: contextMessage, session_id: sessionId }`
- Response: AI's analysis of the strategy

User can then continue the conversation naturally in the chat window.

---

## 📁 Files Created/Modified

### Created Files

**`/apps/whitelabel-web/src/contexts/FloatingConciergeContext.tsx`**

- React Context provider for shared state
- Manages `isOpen`, `contextMessage`, and control functions
- 43 lines

### Modified Files

**`/apps/whitelabel-web/src/components/chat/FloatingConcierge.tsx`**

- Added `useFloatingConcierge()` hook
- Added `sendMessageWithText()` helper function
- Added `useEffect` to auto-send context messages
- Changed `isOpen` to use context state
- Total changes: ~50 lines

**`/apps/whitelabel-web/src/components/chat/ContextualAIPanel.tsx`**

- Added `useFloatingConcierge()` hook
- Updated "💬 Ask AI About This Strategy" button
- Generates comprehensive strategy context message
- Validates allocation before opening chat
- Total changes: ~40 lines

**`/apps/whitelabel-web/src/layouts/DashboardLayout.tsx`**

- Wrapped layout with `<FloatingConciergeProvider>`
- Imported context provider
- Total changes: 3 lines

---

## 🎨 UI/UX Features

### Button States

**Enabled** (allocation = 100%):

```tsx
<button className="bg-gray-100 text-gray-700 hover:bg-gray-200">💬 Ask AI About This Strategy</button>
```

**Disabled** (allocation ≠ 100%):

```tsx
<button className="bg-gray-50 text-gray-400 cursor-not-allowed" disabled>
  💬 Ask AI About This Strategy
</button>
<p className="text-xs text-amber-600 mt-2">
  ⚠ Complete your 100% allocation to ask AI
</p>
```

### FloatingConcierge Behavior

1. **Opens automatically** when context is provided
2. **Shows context message** in input field (500ms)
3. **Auto-sends message** to AI agent
4. **Displays typing indicator** while waiting
5. **Shows AI response** in chat history
6. **User can continue conversation** naturally

---

## 🧪 Testing Scenarios

### Scenario 1: Valid Strategy

```
✅ User allocates: Aave 50%, Compound 30%, Morpho 20%
✅ User clicks "💬 Ask AI About This Strategy"
✅ FloatingConcierge opens immediately
✅ Strategy context appears in chat
✅ Message auto-sends to AI
✅ AI responds with analysis
```

### Scenario 2: Invalid Allocation

```
❌ User allocates: Aave 40%, Compound 30% (Total: 70%)
❌ Button is disabled with warning message
❌ Clicking has no effect
✅ User adjusts to 100% total
✅ Button becomes enabled
✅ User can now open chat with context
```

### Scenario 3: Multiple Strategies

```
✅ User creates Strategy A, asks AI (Session 1)
✅ User creates Strategy B, asks AI (Session 1 continues)
✅ AI can reference both strategies in same conversation
✅ Context is maintained throughout session
```

---

## 🔧 Technical Details

### Context Message Format

The context message is a structured markdown string:

```markdown
I'd like to discuss my yield strategy:

**[Strategy Name]** ([Preset Strategy | Custom Strategy])

**Allocations:** • [Protocol 1]: [X]% (Expected APY: [Y]%) • [Protocol 2]: [X]% (Expected APY: [Y]%) • [Protocol 3]:
[X]% (Expected APY: [Y]%)

**Expected Blended APY:** [Z]%

Can you help me understand this strategy better and suggest any improvements?
```

### AI Agent Integration

**Endpoint**: `POST http://localhost:8000/agent`

**Request**:

```json
{
	"message": "[Context message from above]",
	"session_id": "session-1733443200000"
}
```

**Response**:

```json
{
	"response": "Based on your strategy allocation...[AI analysis]"
}
```

### State Management

```typescript
// Provider State
{
  isOpen: true,
  contextMessage: "I'd like to discuss...",
  // Functions
  openWithContext: (msg) => { ... },
  setIsOpen: (open) => { ... },
  clearContext: () => { ... }
}
```

---

## 🚀 Benefits

### For Users

1. **Seamless Experience** - No need to retype strategy details
2. **Context Preservation** - AI receives full strategy context
3. **Natural Conversation** - Can continue discussing in chat
4. **Smart Validation** - Can't ask AI until strategy is complete

### For Developers

1. **Clean Separation** - Context provider isolates state
2. **Reusable Pattern** - Can be used for other features
3. **Type Safety** - Full TypeScript support
4. **Easy Testing** - Components remain independent

---

## 🐛 Known Issues / Future Improvements

### Current Limitations

1. **No Multi-Strategy Comparison** - Only sends current strategy
2. **No Strategy History** - Previous strategies not included
3. **Fixed Template** - Context message format is hardcoded

### Future Enhancements

1. **Add "Compare Strategies" Mode**
   - Pass multiple strategies to FloatingConcierge
   - AI can analyze differences and recommend best option

2. **Strategy History Tracking**
   - Store all created strategies in context
   - Allow AI to reference past conversations

3. **Customizable Templates**
   - User can choose what info to share with AI
   - Add/remove fields from context message

4. **Rich Context Objects**
   - Instead of markdown string, pass structured data
   - AI can parse and display data more intelligently

---

## 📊 Analytics Potential

### Trackable Events

```typescript
// User clicks "Ask AI About This Strategy"
analytics.track("contextual_ai_opened", {
	strategy_mode: "custom",
	strategy_name: "My Balanced Portfolio",
	num_protocols: 3,
	blended_apy: 3.45,
	total_allocation: 100,
})

// FloatingConcierge receives context
analytics.track("floating_concierge_context_sent", {
	context_length: 245, // characters
	auto_sent: true,
	time_to_send: 500, // ms
})

// AI responds
analytics.track("ai_response_received", {
	response_length: 1024,
	response_time: 2500, // ms
	session_id: "session-1733443200000",
})
```

---

## ✅ Completion Checklist

- [x] Create `FloatingConciergeContext` provider
- [x] Update `FloatingConcierge` to use context
- [x] Add auto-send logic for context messages
- [x] Update `ContextualAIPanel` button handler
- [x] Generate structured context message
- [x] Wrap `DashboardLayout` with provider
- [x] Add validation for 100% allocation
- [x] Add disabled state and warning message
- [x] Test context message format
- [x] Verify auto-send timing (500ms delay)
- [x] Check linter errors
- [x] Document feature in markdown

---

## 🎉 Summary

The FloatingConcierge integration enables a smooth handoff from the ContextualAIPanel to the global chat, preserving
user context and eliminating the need to manually re-enter strategy details. This creates a more cohesive AI-assisted
yield management experience.

**Key Achievement**: Users can now explore strategies with inline AI advice (ContextualAIPanel) and seamlessly
transition to deep conversational AI (FloatingConcierge) without losing context.

---

**Next Steps**: Consider implementing Phase 4 features (strategy comparison, risk score visualization) or gather user
feedback on the current integration.
