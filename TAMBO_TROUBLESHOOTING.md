# Tambo Stream Error Troubleshooting Guide

## 🔴 Error: `handleStreamResponse` at advance-stream.mjs

This is the most common error when integrating Tambo. Here's how to fix it:

---

## ✅ Quick Fix (Most Common Cause)

### The Issue
Your API key is either:
- Not configured
- Invalid or incorrect
- Not being loaded properly

### The Solution

1. **Check your `.env.local` file exists in project root:**
   \`\`\`bash
   ls -la .env.local
   \`\`\`

2. **Verify the content looks like this:**
   \`\`\`env
   NEXT_PUBLIC_TAMBO_API_KEY=tambo_xxxxxxxxxxxxxxxxxxxxxxxx
   \`\`\`

3. **Make sure:**
   - The key starts with `tambo_`
   - There are NO quotes around the value
   - There are NO spaces before or after the key
   - The file is named `.env.local` (not `.env` or `.env.local.txt`)

4. **Restart your dev server:**
   \`\`\`bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npx pnpm run dev
   \`\`\`

---

## 🔍 Detailed Troubleshooting

### Step 1: Verify API Key Format

Your API key should:
- Be 40+ characters long
- Start with `tambo_`
- Contain only alphanumeric characters and underscores

**Test in browser console:**
\`\`\`javascript
console.log(process.env.NEXT_PUBLIC_TAMBO_API_KEY);
// Should print: tambo_xxxxxxxxxxxx
// NOT: undefined or "your_api_key_here"
\`\`\`

### Step 2: Check File Location

The `.env.local` file MUST be in the **project root**, same level as:
- `package.json`
- `next.config.mjs`
- `app/` directory

**Correct structure:**
\`\`\`
Clinks/
├── .env.local          ← HERE!
├── package.json
├── next.config.mjs
├── app/
│   └── layout.tsx
└── components/
\`\`\`

### Step 3: Verify API Key is Valid

1. **Log in to [tambo.co](https://tambo.co/dashboard)**
2. **Navigate to your project settings**
3. **Copy your API key fresh** (it should start with `tambo_`)
4. **Replace the entire line in `.env.local`**

### Step 4: Check Network Connection

Open browser DevTools → Network tab, then try sending a message:
- Look for requests to `tambo.co` or Tambo API endpoints
- Check if requests are:
  - ❌ Blocked (CORS error)
  - ❌ 401 Unauthorized (invalid API key)
  - ❌ 429 Too Many Requests (rate limit)
  - ❌ Failed to fetch (network/firewall issue)

---

## 🚨 Common Mistakes

### ❌ Wrong: Using quotes
\`\`\`env
NEXT_PUBLIC_TAMBO_API_KEY="tambo_xxx"  # DON'T DO THIS
\`\`\`

### ✅ Correct: No quotes
\`\`\`env
NEXT_PUBLIC_TAMBO_API_KEY=tambo_xxx
\`\`\`

---

### ❌ Wrong: File in wrong location
\`\`\`
Clinks/
└── app/
    └── .env.local  ← WRONG!
\`\`\`

### ✅ Correct: File in root
\`\`\`
Clinks/
├── .env.local  ← CORRECT!
└── app/
\`\`\`

---

### ❌ Wrong: Not restarting server
- Changing `.env.local` while server is running
- Expecting changes to take effect immediately

### ✅ Correct: Always restart
\`\`\`bash
# After ANY change to .env.local:
Ctrl+C  # Stop server
npx pnpm run dev  # Restart
\`\`\`

---

## 🎯 Error Messages & Solutions

### "401 Unauthorized" or "Invalid API Key"
**Problem:** API key is wrong or expired
**Solution:** Get a new key from tambo.co and update `.env.local`

### "Network Error" or "Failed to fetch"
**Problem:** Cannot reach Tambo servers
**Solution:** 
- Check internet connection
- Disable VPN/proxy temporarily
- Check firewall settings

### "429 Rate Limit"
**Problem:** Too many requests
**Solution:** Wait 1-2 minutes and try again

### "Stream Response Error"
**Problem:** Usually invalid API key
**Solution:** Follow Step 1-4 above

---

## 🧪 Test Your Setup

### Option 1: Use the built-in tester
1. Open the AI Assistant chat (bottom-center button)
2. If you see setup help, click **"Test API Key"**
3. Follow the instructions shown

### Option 2: Manual browser test
Open browser console and run:
\`\`\`javascript
// Check if key is loaded
console.log('API Key:', process.env.NEXT_PUBLIC_TAMBO_API_KEY);

// Should output something like: tambo_abc123xyz...
// NOT: undefined or "your_api_key_here"
\`\`\`

---

## 📋 Complete Setup Checklist

- [ ] File `.env.local` exists in project root
- [ ] API key is on a line like: `NEXT_PUBLIC_TAMBO_API_KEY=tambo_xxx`
- [ ] No quotes around the API key value
- [ ] No extra spaces before/after the key
- [ ] Key is at least 40 characters long
- [ ] Key starts with `tambo_`
- [ ] Dev server was restarted after adding/changing the key
- [ ] Browser was refreshed (hard refresh: Ctrl+Shift+R)
- [ ] No console errors about API key
- [ ] Can see "✅ Tambo API key configured" in server logs

---

## 🆘 Still Not Working?

### Check server startup logs
Look for one of these when you run `npx pnpm run dev`:
- ✅ `Tambo API key configured` → Good!
- ⚠️ `Tambo API key not configured` → Check `.env.local`
- ❌ `Tambo API key appears invalid` → Key format is wrong

### Enable debug mode
Add to `.env.local`:
\`\`\`env
NEXT_PUBLIC_TAMBO_DEBUG=true
\`\`\`
This will show more detailed error messages in the console.

### Get a fresh start
\`\`\`bash
# Stop server
Ctrl+C

# Clear Next.js cache
rm -rf .next

# Restart
npx pnpm run dev
\`\`\`

---

## 📞 Additional Resources

- **Tambo Docs:** https://docs.tambo.co
- **Get API Key:** https://tambo.co/dashboard
- **Integration Guide:** See `TAMBO_INTEGRATION.md` in project root
- **Support:** Check Tambo documentation or community forums

---

## 💡 Pro Tips

1. **Keep your API key secret** - Never commit `.env.local` to git (it's in `.gitignore`)
2. **Use environment variables** - Don't hardcode API keys in your code
3. **Restart after changes** - Always restart dev server after modifying `.env.local`
4. **Check the chat UI** - The app now shows helpful error messages directly in the chat interface
5. **Browser cache** - Try a hard refresh (Ctrl+Shift+R) if issues persist

---

**Last Updated:** 2024
**For:** Clinks AI Workflow Builder with Tambo Integration
