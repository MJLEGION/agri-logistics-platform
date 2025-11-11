# Token Refresh Debug Instructions

## Issue
Cargo deletion failing with "Access token expired" error despite token refresh mechanism being implemented.

## Changes Made
1. **Fixed Badge component** - Changed `label` prop to `text` prop to prevent React Native Web text node errors
2. **Enhanced logging** - Added comprehensive console logs to track token refresh flow:
   - Login response structure verification
   - Refresh token storage confirmation
   - Token refresh attempt tracking
   - New token storage after refresh

## Testing Steps

### 1. Fresh Login Required
The refresh token is only stored on **new login**. Old sessions won't have it:

```
1. Tap Menu → Logout (if currently logged in)
2. Clear app data (optional but recommended)
3. Log in with fresh credentials
4. Watch console for: "💾 Storing refresh token in AsyncStorage"
```

### 2. Monitor Console During Deletion
Try to delete a cargo item and watch for these logs:

**Expected flow:**
```
✅ Initial DELETE request sent
❌ 401 Unauthorized received (token expired)
🔍 Attempting token refresh - refreshToken exists: true
🔄 Calling /auth/refresh with stored refresh token...
✅ Token refresh response: { token: "...", refreshToken: "..." }
💾 Storing new access token
💾 Storing new refresh token
✅ Token refreshed successfully, retrying original request
✅ DELETE retry successful - cargo deleted
```

**If tokens missing:**
```
❌ NO REFRESH TOKEN STORED! Token refresh impossible. User must log in again.
```

### 3. Verify Token Storage
Open browser DevTools → Application → Local Storage (or use React Native Debugger):
- Look for keys: `token` and `refreshToken`
- Both should be present after login

## Key Debug Points

1. **Check if refreshToken is in login response:**
   - Look for: `🔍 Login response structure` log
   - Should show: `hasRefreshToken: true`

2. **Check if it's stored:**
   - Look for: `💾 Storing refresh token in AsyncStorage` log
   - Should show token length

3. **Check if refresh endpoint works:**
   - After token expires, deletion should trigger:
   - Look for: `🔄 Calling /auth/refresh`
   - Should get: `✅ Token refresh response`

## If Still Failing

**Problem: refreshToken not in login response**
- Backend `/auth/login` needs to return `refreshToken` field
- Backend might need update to include refresh token in response

**Problem: Token refresh endpoint returns 401**
- Backend `/auth/refresh` might require adjustment
- Verify backend is accepting the refresh token

**Problem: Still seeing "Access token expired"**
- Might need to wait for token to actually expire (1 hour)
- Or manually set expired token for testing
