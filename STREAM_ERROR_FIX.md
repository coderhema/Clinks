# 🔧 Quick Fix for Stream Errors

## Error: `handleStreamResponse` at `advance-stream.mjs:48:27`

This error occurs when the Tambo SDK can't process the API response. Here's how to fix it:

---

## ✅ Quick Solution (Most Common)

### Your API key has special characters that need to be URL-encoded

Your current API key contains `/`, `+`, and `=` characters:
```
tambo_lneMFOWwF2ncSvLCibWfJM/LUDIX+BDbD3ImJ7LquZW9kmXjYT1pjwj5Y/bCaiJouW6+brvjBdMKFpEtZSKG4R2gCm0I7MWcBjxEnmNKby4=
```

### Two Options:

#### Option 1: Get a New API Key (RECOMMENDED)
1. Go to https://tambo.co/dashboard
2. Generate a new API key
3. Some API keys don't have special characters - try generating a few until you get one without `/`, `+`, or `=`
4. Update your `.env.local` file with the new key
5. Restart dev server: `Ctrl+C` then `npm run dev`

#### Option 2: URL Encode Your Current Key
If you must keep this key, URL encode it:
```bash
# The encoded version replaces:
# / with %2F
# + with %2B
# = with %3D
```

In your `.env.local`:
```env
NEXT_PUBLIC_TAMBO_TOKEN=tambo_lneMFOWwF2ncSvLCibWfJM%2FLUDIX%2BBDbD3ImJ7LquZW9kmXjYT1pjwj5Y%2FbCaiJouW6%2BbrvjBdMKFpEtZSKG4R2gCm0I7MWcBjxEnmNKby4%3D
```

---

## 🧪 Test Your Fix

After making changes:

1. **Restart your dev server** (REQUIRED!)
   ```bash
   # Stop with Ctrl+C, then:
   npm run dev
   ```

2. **Hard refresh your browser**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

3. **Open the AI Assistant** (button at bottom of page)

4. **Click "Test API Key"** to verify it works

5. **Or click "Run Stream Diagnostics"** to see detailed debug info in console

---

## 📋 Checklist

- [ ] API key is in `.env.local` file in project root
- [ ] No quotes around the API key
- [ ] Key is URL-encoded if it contains special characters
- [ ] Dev server was restarted after changes
- [ ] Browser was hard-refreshed
- [ ] Tested with "Test API Key" button

---

## 🔍 Still Not Working?

### Run Diagnostics:
1. Open your app in browser
2. Click the "AI Assistant" button (bottom center)
3. Click "Run Stream Diagnostics"
4. Press `F12` to open browser console
5. Review the diagnostic output

### Common Issues:

**"401 Unauthorized"**
- Your API key is wrong or expired
- Get a new key from tambo.co/dashboard

**"Network Error" / "Failed to fetch"**
- Check internet connection
- Disable VPN temporarily
- Check if tambo.co is accessible

**"CORS Error"**
- This is usually related to the API key issue
- Try getting a new API key

**"Still seeing stream error after all fixes"**
- Clear browser cache completely
- Delete `.next` folder: `rm -rf .next`
- Rebuild: `npm run build`
- Restart: `npm run dev`

---

## 💡 Why This Happens

The Tambo SDK's stream handler expects the API key to be clean in HTTP headers. Special characters like `/`, `+`, and `=` can cause issues when:
- The key is used in Authorization headers
- The stream parser tries to decode the response
- Base64-like strings aren't properly encoded

The best solution is to get a new API key without these characters.

---

## 📞 Need More Help?

- See `TAMBO_TROUBLESHOOTING.md` for detailed troubleshooting
- Check `TAMBO_INTEGRATION.md` for integration guide
- Visit: https://docs.tambo.co
- Dashboard: https://tambo.co/dashboard

---

**Last Updated:** 2024  
**For:** Clinks AI Workflow Builder