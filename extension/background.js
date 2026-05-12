// Listen for when a tab finishes loading
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    checkAndCaptureCookie(tab.url);
  }
});

const AUCTION_SITES = [
  { domain: 'publicsurplus.com', key: 'public_surplus_cookie' },
  { domain: 'dickensheet.com', key: 'dickensheet_cookie' },
  { domain: 'whitleyauction.com', key: 'rmeb_cookie' },
  { domain: 'rollerauction.com', key: 'rol_cookie' }
];

async function checkAndCaptureCookie(url) {
  try {
    const parsedUrl = new URL(url);
    const site = AUCTION_SITES.find(s => parsedUrl.hostname.includes(s.domain));
    
    if (site) {
      // Get all cookies for this domain
      const cookies = await chrome.cookies.getAll({ domain: site.domain });
      if (cookies.length > 0) {
        // Format cookies into a string like "name1=value1; name2=value2"
        const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
        
        // Save to local extension storage for the popup to read
        await chrome.storage.local.set({ [site.key]: cookieString });
        console.log(`Captured cookie for ${site.domain}`);
      }
    }
  } catch (error) {
    console.error("Error capturing cookie:", error);
  }
}
