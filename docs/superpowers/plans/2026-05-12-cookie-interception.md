# Mobile Cookie Interception Feature

## Goal
Implement a secure, end-to-end system for capturing auction house authentication cookies via a Flutter WebView and storing them securely in the FastAPI backend for authenticated scraping.

## Database Schema Changes (Backend)

We need a new table to store third-party credentials/cookies per user.

**Table:** `user_auction_credentials`
*   `id`: UUID / Integer (Primary Key)
*   `user_id`: Integer (Foreign Key to `users.id`)
*   `auction_house`: String (e.g., 'public_surplus', 'whitley')
*   `encrypted_cookies`: Text (Encrypted JSON string containing the session cookies)
*   `user_agent`: String (The exact User-Agent string of the mobile device used to capture the cookies)
*   `is_valid`: Boolean (Default: True. Set to False when the backend scraper encounters a 401/403)
*   `last_verified_at`: DateTime (When the backend last successfully used these cookies)
*   `created_at`: DateTime
*   `updated_at`: DateTime
*   *Unique Constraint:* `(user_id, auction_house)`

## Tasks

- [ ] Task 1: **Backend - Encryption Utility**
      Implement a symmetric encryption utility in FastAPI using `cryptography` (Fernet) to securely encrypt and decrypt cookie strings before database storage.
      → *Verify: A test script can encrypt a JSON string and decrypt it back to the original value.*

- [ ] Task 2: **Backend - Database Models & Migration**
      Create the `UserAuctionCredential` SQLAlchemy model and generate the Alembic migration script.
      → *Verify: `alembic upgrade head` runs successfully and creates the table.*

- [ ] Task 3: **Backend - API Endpoints**
      Create a new router (`routers/credentials.py`) with endpoints to `POST` new cookies (which encrypts them) and `GET` the status of existing connections (without returning the raw cookies).
      → *Verify: Can POST a mock cookie payload and retrieve a success response.*

- [ ] Task 4: **Frontend - Package & Permissions Setup**
      Add `flutter_inappwebview` to `pubspec.yaml` in the Flutter app. Configure iOS `Info.plist` and Android `AndroidManifest.xml` for network permissions if necessary.
      → *Verify: `flutter pub get` succeeds and the app builds without errors.*

- [ ] Task 5: **Frontend - WebView Authentication Portal**
      Create a new Flutter widget (`AuctionLoginWebView`) that launches the `InAppWebView`, points to a target URL (e.g., Public Surplus login), listens for navigation success, extracts the cookies via `CookieManager`, and securely POSTs them (along with the User-Agent) to the new FastAPI endpoint.
      → *Verify: The WebView opens, allows login, and successfully prints extracted cookies to the debug console.*

## Done When
- [ ] The backend can securely receive, encrypt, and store third-party cookies.
- [ ] The mobile app has a functional WebView portal that extracts session cookies upon successful login.
