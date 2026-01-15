# 🔍 Auto-Search Debug Guide

## ✅ Changes Made

The voice search now has **debug logging** enabled to see what's happening.

## 🧪 How to Test

### Step 1: Open Browser Console
1. Go to http://localhost:3000/explore
2. Press **F12** to open Developer Tools
3. Click on **Console** tab

### Step 2: Start Voice Search
1. Click "Voice Search" button
2. Click the microphone 🎤
3. You should see: `🎤 Listening... Speak now` toast

### Step 3: Speak Your Query
Say something like:
- "I want a room nearby my location"
- "Find rooms in Kathmandu"
- "Show me properties near me"

### Step 4: Check Console Logs

You should see in the console:

```
✅ Final transcript received: I want a room nearby my location
🔴 Speech recognition ended
🔍 Auto-search attempting with query: I want a room nearby my location
✅ Executing search for: I want a room nearby my location
```

### Step 5: Expected Behavior

After you stop speaking (1-2 seconds of silence):
1. ✅ Console shows "Speech recognition ended"
2. ✅ Console shows "Executing search for: [your query]"
3. ✅ Dialog closes automatically
4. ✅ Toast shows: "🎤 Voice search: [your query]"
5. ✅ Search results appear

## ❌ If It's NOT Working

### Check Console for These Messages:

#### Problem 1: No "Final transcript received"
```
❌ No query found, search not executed
```
**Solution**: 
- Speak louder or more clearly
- Check if microphone is working
- Try shorter phrases

#### Problem 2: "Speech recognition ended" not appearing
**Possible causes**:
- Speech recognition is still active
- Browser is waiting for more input
- Network issue with speech API

**Solution**:
- Wait 2-3 seconds after speaking
- Click the mic button again to stop manually
- Try refreshing the page

#### Problem 3: Query captured but search not executing
```
✅ Final transcript received: [your query]
🔴 Speech recognition ended
🔍 Auto-search attempting with query: [your query]
❌ [No "Executing search" message]
```
**This means the onSearch callback isn't firing**

## 🔧 Technical Details

### Recognition Settings
```javascript
recognition.continuous = false  // Stops after silence
recognition.interimResults = true  // Shows interim results
recognition.lang = 'en-US'  // English language
```

### Auto-Search Trigger
```javascript
recognition.onend = () => {
  // Waits 500ms after speech ends
  setTimeout(() => {
    // Gets the query from ref
    const currentQuery = latestQueryRef.current
    
    // Executes search if query exists
    if (currentQuery && currentQuery.trim()) {
      onSearch(currentQuery.trim())
      setIsOpen(false)
    }
  }, 500)
}
```

### Query Storage
Uses `useRef` to store the latest voice input:
```javascript
latestQueryRef.current = finalQuery
```

This ensures the query is available when `onend` fires.

## 🎯 What to Report

If it's still not working, please check the console and report:

1. **What logs appear?** (copy from console)
2. **What query did you say?**
3. **Does the "YOUR SEARCH" box show your query?**
4. **Does the dialog stay open or close?**
5. **Do you see any red errors in console?**

## 💡 Manual Workaround

If auto-search doesn't work, you can still:
1. Speak your query
2. Wait for transcription to appear
3. Look at the console to see the captured query
4. Report what you see

The debug logs will help us identify the exact issue!

## 🔍 Console Screenshot Example

Expected console output:
```
🎤 Listening... Speak now
✅ Final transcript received: I want a room nearby my location
🔴 Speech recognition ended
🔍 Auto-search attempting with query: I want a room nearby my location
✅ Executing search for: I want a room nearby my location
```

If you see something different, that's the clue to fix it!

