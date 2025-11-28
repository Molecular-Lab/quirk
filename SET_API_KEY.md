# Set API Key in Browser

Open browser console (F12) and paste this:

```javascript
// Your generated API key
const apiKey = 'test_pk_2a2463f87bfd6756822f48698fedd4ef'

// Get current userStore state
const userStoreKey = 'proxify-user-credentials'
let store = JSON.parse(localStorage.getItem(userStoreKey) || '{"state":{}}')

// Update state with API key
if (!store.state) {
  store.state = {}
}
store.state.apiKey = apiKey

// Save back to localStorage
localStorage.setItem(userStoreKey, JSON.stringify(store))

// Also set in b2b:api_key for b2bApiClient
localStorage.setItem('b2b:api_key', apiKey)

// Also set in demoStore
const demoStoreKey = 'proxify-demo-state'
let demoStore = JSON.parse(localStorage.getItem(demoStoreKey) || '{"state":{}}')
if (!demoStore.state) {
  demoStore.state = {}
}
demoStore.state.activeApiKey = apiKey
localStorage.setItem(demoStoreKey, JSON.stringify(demoStore))

console.log('✅ API key set in all stores!')
console.log('Now reload the page')

// Reload
setTimeout(() => location.reload(), 1000)
```

After running this, the demo page should work!
