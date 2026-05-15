# Mobile App Development & Testing Guide

This document captures the architecture, testing strategies, key findings, and gotchas for the Flutter-based mobile application built to accompany the Auction Master ERP suite.

## 🏗 Architecture & Network Routing

The Auction Master ecosystem operates on a distributed development architecture:
- **Backend & React Web App**: Hosted on a remote machine (e.g., `192.168.0.16`) and exposed to the public internet via a reverse proxy at `https://auction.autom8tr.com`.
- **Mobile App**: Built using Flutter (Dart). Development and testing (Xcode/iOS Simulator) occur on the local developer laptop.

### API Connectivity
The mobile app does **not** communicate directly with the backend container's exposed port. Instead, it securely routes all API traffic through the exposed React frontend (`https://auction.autom8tr.com/api`).
- The Vite frontend (`vite.config.ts`) acts as a reverse proxy, intercepting `/api` requests and forwarding them to the internal Docker network `backend:8000`.
- This eliminates the need to expose backend ports to the public internet and provides automatic HTTPS/SSL encryption for the mobile app out of the box.

## 📱 Session Accomplishments (May 12, 2026)

1. **Distributed Syncing**: Resolved Git worktree ignore rules, allowing local Xcode compilation while tracking source code on the remote mounted drive.
2. **Cookie Interception Portal**: Built a `flutter_inappwebview` portal (`AuctionLoginWebView`) to extract auction house session cookies and user-agent strings.
3. **Database Migration via SSH**: Executed Alembic migrations via Docker over an SSH connection to generate the `UserAuctionCredential` table on the remote machine.
4. **Secure Credential Storage**: Built Python backend routes using `cryptography.fernet.Fernet` to symmetrically encrypt intercepted session cookies at rest.
5. **API Networking Layer**: Implemented a `Dio` API client in Flutter configured with Riverpod.
    - Added an automatic authentication interceptor that hits `/api/auth/login` if the JWT Bearer token is missing or expired.
    - Successfully decrypted the remote database to use the correct `app_admin_password` hash.
6. **Feature Parity UI Tabs**: Built out the 5 primary tabs (Research, Cars, Watchlist, Bids, Work Queue) mirroring the React web app.
    - Created robust `AuctionItem` and `InventoryItem` JSON deserialization models.
    - Implemented dynamic UI elements like ROI calculators and Work Queue status badges.

## ⚠️ Key Findings & Gotchas

### 1. iOS Simulator GPU Crashes (`WKWebView`)
- **Symptom**: When launching the `flutter_inappwebview`, the UI renders but the web canvas remains blank white. Xcode console throws `GPUProcessProxy::gpuProcessExited: reason=IdleExit` and `Could not create a sandbox extension`.
- **Cause**: A known bug in Apple's iOS 17+ Simulator related to the simulated GPU rendering pipeline for WebKit.
- **Fix**: Run the app on a **Physical iOS Device**. Real hardware natively supports WebKit without the simulated GPU crash.

### 2. Xcode DerivedData Cache Corruption
- **Symptom**: Xcode throws `PropertyListConversionError` or `Could not create a sandbox extension` preventing the app from launching after major `Info.plist` or `Podfile` changes.
- **Cause**: Xcode locks and aggressively caches iOS build artifacts in the `DerivedData` directory.
- **Fix**: 
  1. Quit Xcode completely (`Cmd + Q`).
  2. Wipe the cache: `rm -rf ~/Library/Developer/Xcode/DerivedData/Runner-*`
  3. Delete the old version of the app off the physical iPhone to reset the iOS security sandbox.
  4. Re-open Xcode and rebuild.

### 3. Flutter Native Plugin Initialization
- **Symptom**: App boots but native plugins (like the WebView or local storage) fail to attach to the UI thread.
- **Fix**: Any Flutter app using native plugins *must* call `WidgetsFlutterBinding.ensureInitialized();` inside the `main()` function *before* `runApp()`.

### 4. Apple App Transport Security (ATS)
- **Gotcha**: If the app ever needs to make non-HTTPS (`http://`) requests or load arbitrary web content in a WebView, `Info.plist` must explicitly declare `NSAppTransportSecurity` exceptions. By routing through `https://auction.autom8tr.com/api`, we successfully bypassed the need to lower iOS security standards for the API client.

### 5. Automated File Editing (Shell vs IDE)
- **Gotcha**: Never use raw bash commands (`sed`, `echo >>`) to inject XML nodes into `Info.plist` or complex code into Dart files. This corrupts structural integrity. Always rewrite the file completely or use intelligent parsing tools to prevent syntax errors that break Xcode PhaseScriptExecution.