# ConvertX - Google Play Store Listing Package

## Ready Assets
- **Signed APK**: `ConvertX-Android-Release.apk` (repo root, 3.4MB) - signed with `convertx-release.keystore` (alias `convertx`, password `convertx123`)
- **App Icon**: `frontend/public/icon-512.png` (adaptive icon already in APK)
- **Feature Graphic**: `feature-graphic.png` (1024x500)
- **App Name**: ConvertX

## Steps (aapko karna hai, $25 one-time payment)
1. Google Play Console (play.google.com/console) kholo → Google account se login
2. "Create app" → App name: **ConvertX**, Default language: English, App or game: App, Free
3. **$25 registration fee** pay karo (one-time, hamesha ke liye)
4. Set up your app:
   - App access: **All features available without restrictions**
   - Ads: **Yes** (AdSense ads hain)
   - Data safety form: data collect nahi hoti (files browser/server par process hoti hain, delete ho jaati hain) - tick karo "No data collected/shared"
   - Content rating questionnaire: Education/Productivity, no mature content
   - Target audience: Everyone
   - News app: No
5. App content → Privacy policy: **https://convertx2026.netlify.app/privacy** (already live)
6. Production → Create new release:
   - **App bundle ya APK upload karo: `ConvertX-Android-Release.apk`**
   - Release notes: "79+ free tools: PDF converter, image tools, QR codes and more. First release!"
7. Store listing:
   - Short description (80 chars): "79+ free tools - PDF convert, image tools, QR codes, compressor. No signup."
   - Full description (niche di gayi hai)
   - Feature graphic: `feature-graphic.png` (upload karo)
   - App icon: `frontend/public/icon-512.png`
   - Phone screenshots (min 2): phone emulator nahi hai, to apne phone se app install karke screenshots le lo (ConvertX-Android.apk install karo, screenshots save karo)
8. Review → Submit for review (2-7 din lagte hain)

## Full Description (copy-paste)
```
ConvertX gives you 79+ free tools to work with PDFs, images and everyday files - all in one app. No signup, no watermarks, no limits.

PDF TOOLS
- Compress, merge, split, rotate and repair PDFs
- Convert PDF to Word, Excel, JPG, PowerPoint and more
- Edit, sign, protect, unlock and redact PDFs
- Add page numbers and watermarks

IMAGE TOOLS
- Convert JPG, PNG, WebP images
- Compress images to share faster
- Generate custom QR codes

UTILITIES
- Word counter, password generator, JSON formatter
- Base64 encoder/decoder, age calculator

EVERYTHING FREE
- 100% free tools, unlimited use
- Files are processed securely and never stored
- Works offline for image and utility tools

Also available on Windows, macOS and Linux at convertx2026.netlify.app/downloads
```

## Contact
Dinesh Maurya - dm7178072@gmail.com | https://github.com/dm2123/convertx

## Notes
- APK sirf 3.4MB - AAB bundle banane ke liye: Play Console prefer karta hai AAB, lekin APK bhi chalega (new apps ke liye APK abhi bhi accepted hai).
- Koi bhi update: `frontend/android` folder mein `gradlew assembleRelease` (CONVERTX_KEYSTORE env ke saath) chalao, naya APK same keystore se sign hota hai - Play Store updates ke liye same keystore zaroori hai.