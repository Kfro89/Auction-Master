# Privacy Policy for Auction Master Capture

**Effective Date:** May 12, 2026

## 1. Information We Collect
The "Auction Master Capture" Chrome Extension (the "Extension") collects the following data:
- **Session Cookies:** The Extension reads session cookies exclusively from specific, pre-configured auction house websites (e.g., Public Surplus, Dickensheet, Whitley Auction, Roller Auction).

## 2. How We Use the Information
The sole purpose of collecting these cookies is to synchronize your active auction house sessions with your personal, self-hosted instance of the Auction Master application. The Extension allows your local software to authenticate on your behalf for the purpose of scraping inventory and placing bids as requested by you.

## 3. Data Storage and Transfer
- **Local Storage:** The Extension stores the captured cookies locally within your browser's extension storage.
- **Data Transfer:** When you click the "Sync" button, the cookies are transmitted securely directly to the Local API URL you configure in the extension popup (defaulting to `http://localhost:8000`). 
- **No Third-Party Sharing:** We do not sell, rent, trade, or otherwise transmit your cookie data to any third-party servers, analytics providers, or external databases. The data flows exclusively between your browser and your configured Auction Master instance.

## 4. Permissions Justification
The Extension requires the following permissions:
- **`cookies`:** Required to read the session authentication tokens after you log into an auction site.
- **`storage`:** Required to temporarily hold the cookies and your API configuration (URL, username, password) so you do not have to re-enter them.
- **`host_permissions`:** Restricted strictly to the targeted auction websites and your local backend to ensure the extension only activates when necessary and can transmit data to your app.

## 5. User Control
You maintain full control over your data. You can delete the extension at any time, which will wipe all locally stored data. You can also manually log out of the auction house websites to invalidate the cookies.

## 6. Contact Us
If you have any questions or concerns regarding this privacy policy, please contact the developer of your Auction Master instance.