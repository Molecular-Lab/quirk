# API Key Management

## Overview
The API Testing Dashboard now includes automatic API key management to streamline the testing workflow.

## Features

### 1. **Auto-Save API Key**
When you register a new client using the "1. Register Client" endpoint:
- The API response includes an `api_key` field
- This key is automatically saved to `localStorage` with key `"b2b:api_key"`
- A console log confirms: `"[API Test] API Key saved to localStorage"`

### 2. **Auto-Load API Key**
When the page loads:
- Checks `localStorage` for a previously saved API key
- If found, loads it into component state
- Console log confirms: `"[API Test] Loaded API key from localStorage"`

### 3. **Auto-Populate API Key**
For all subsequent API calls that require authentication:
- The saved API key is automatically populated in the `api_key` input field
- You don't need to manually copy/paste the key between requests
- The key persists across page refreshes

## Workflow

### First Time Setup
1. **Register a Client**
   ```json
   POST /client/register
   {
     "name": "My Test Client",
     "email": "test@example.com"
   }
   ```
   
2. **Response Received**
   ```json
   {
     "client_id": "cl_abc123",
     "api_key": "sk_test_xyz789",
     "name": "My Test Client"
   }
   ```

3. **API Key Auto-Saved**
   - `api_key` is automatically saved to localStorage
   - All subsequent requests will have this key pre-filled

### Subsequent Requests
1. **Open Dashboard**
   - Previously saved API key loads automatically

2. **Make Authenticated Requests**
   - `api_key` field is pre-populated
   - Just fill in other parameters and execute

3. **Register New Client** (Optional)
   - New `api_key` will replace the old one
   - All future requests use the new key

## Technical Details

### LocalStorage Key
```typescript
const STORAGE_KEY = "b2b:api_key"
```

### Helper Functions
```typescript
// Save API key to localStorage
const saveApiKey = (apiKey: string) => {
  localStorage.setItem("b2b:api_key", apiKey)
}

// Load API key from localStorage
const loadApiKey = (): string | null => {
  return localStorage.getItem("b2b:api_key")
}
```

### Auto-Population Logic
```typescript
const getInitialFormData = (endpoint: APIEndpoint) => {
  // ...
  if (param.name === "api_key" && !existingValue && savedApiKey) {
    data[param.name] = savedApiKey
  }
  // ...
}
```

### Auto-Save Trigger
```typescript
// After successful client registration
if (endpoint.id === "client-register" && response.ok && "api_key" in data) {
  const apiKey = data.api_key as string
  saveApiKey(apiKey)
  setSavedApiKey(apiKey)
}
```

## Security Considerations

### ⚠️ Development Only
This feature stores API keys in **localStorage**, which is:
- ✅ Convenient for local development and testing
- ❌ **NOT secure** for production use
- ❌ Vulnerable to XSS attacks
- ❌ Persists across browser sessions

### Production Recommendations
For production applications:
1. **Never store API keys in localStorage**
2. Use secure, httpOnly cookies
3. Implement proper session management
4. Use short-lived access tokens
5. Rotate keys regularly
6. Use environment variables for server-side keys

### Test Environment Safety
This implementation is safe for the test dashboard because:
- Running on localhost
- Test API keys only
- No production data
- Easy to clear (localStorage.clear())

## Troubleshooting

### API Key Not Auto-Populating
1. Check browser console for load message
2. Verify localStorage: `localStorage.getItem("b2b:api_key")`
3. Ensure client registration was successful
4. Check response includes `api_key` field

### Clear Saved API Key
```typescript
// In browser console
localStorage.removeItem("b2b:api_key")
```

### Multiple API Keys
- Only the most recent API key is stored
- Registering a new client overwrites the old key
- To use multiple keys, manually copy/paste or disable auto-population

## Future Enhancements

### Potential Improvements
1. **Multiple Key Management**
   - Store multiple client keys
   - Switch between clients in UI
   - Associate keys with client names

2. **Key Validation**
   - Validate key format before saving
   - Check key expiration
   - Auto-refresh expired keys

3. **Security Enhancements**
   - Encrypt keys in localStorage
   - Add key expiration timestamps
   - Implement key rotation reminders

4. **UI Indicators**
   - Show active API key in header
   - Display key age/expiration
   - Visual feedback for key operations
