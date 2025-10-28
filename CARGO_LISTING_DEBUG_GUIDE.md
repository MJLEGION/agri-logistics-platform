# Cargo Listing Debug Guide

## Step-by-Step Testing

### 1. **Open Browser Console** (Critical!)

- Press `F12` to open Developer Tools
- Go to the **Console** tab
- Keep this open while testing

### 2. **Navigate to List Cargo Screen**

- Log in as a Shipper
- Click on "List New Cargo" button
- You should see: `📦 ListCargoScreen: Submitting cargo:` in console

### 3. **Fill in the Form**

- Cargo Name: `Apples`
- Quantity: `100`
- Unit: `kg`
- Price per Unit: `800`
- Ready Date: (select any date)
- Click **"List Cargo"** button

### 4. **Watch Console Output**

You should see this sequence:

```
📦 ListCargoScreen: Submitting cargo: {name: "Apples", quantity: 100, ...}
🎯 cargoSlice: Creating cargo...
📦 Attempting to create cargo with real API...
📦 Cargo data: {name: "Apples", quantity: 100, ...}
⚠️ Real API failed, using mock cargo service...
📦 Calling mockCargoService.createCargo...
✅ Cargo created: Apples (ID: cargo_xxx)
📊 Total cargo now: 5
✅ Cargo persisted to AsyncStorage successfully
✅ cargoSlice: Cargo created successfully: {...}
✅ ListCargoScreen: Cargo created successfully: {...}
```

### 5. **If You See an Error Instead**

**Common Errors & Solutions:**

| Error                                              | Cause                     | Solution                                  |
| -------------------------------------------------- | ------------------------- | ----------------------------------------- |
| `TypeError: Cannot read property '_id'`            | User not logged in        | Log in as shipper first                   |
| `⚠️ Warning: Could not save cargo to AsyncStorage` | Storage permissions issue | Check browser storage settings            |
| `❌ Error: Failed to create cargo`                 | Service error             | Look for error details below this message |
| `TypeError: cargoName is not defined`              | Form state issue          | Refresh the page                          |

### 6. **Check If Cargo Was Created**

Switch to Transporter account and:

1. Go to "Available Loads"
2. Check console for: `📦 Cargo loaded from AsyncStorage: X items`
3. Your "Apples" should now appear in the list!

## Console Output Key Indicators

✅ **Success Indicators:**

- `✅ Cargo created: Apples`
- `✅ Cargo persisted to AsyncStorage successfully`
- `✅ cargoSlice: Cargo created successfully`
- `✅ ListCargoScreen: Cargo created successfully`

❌ **Error Indicators:**

- Any line starting with `❌` or `⚠️`
- Error: before any message
- Red text in console

## If Still Not Working

1. **Clear Cache & Refresh:**

   - Press `Ctrl+Shift+Delete` to open browser cache
   - Clear "All Time" data
   - Refresh the page (F5)

2. **Check Browser Console Errors:**

   - Share the exact error message from the console

3. **Verify User Login:**
   - Make sure you're logged in as a shipper
   - Check that `user._id` or `user.id` is visible in console

## Expected Success Flow

```
🚀 Fill Form → Click "List Cargo"
    ↓
📦 Form validation passes
    ↓
🎯 Redux action dispatches
    ↓
📦 Service tries real API (fails on purpose)
    ↓
📦 Service falls back to mock service
    ↓
✅ Cargo created with status='listed'
    ↓
✅ Saved to AsyncStorage
    ↓
✅ Success alert shown
    ↓
← Navigate back
    ↓
🎉 Cargo now visible to transporters!
```
