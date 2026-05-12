document.addEventListener('DOMContentLoaded', async () => {
  const syncBtn = document.getElementById('sync-btn');
  const messageEl = document.getElementById('message');
  
  // Elements for config
  const apiUrlInput = document.getElementById('api-url');
  const adminUserInput = document.getElementById('admin-user');
  const adminPassInput = document.getElementById('admin-pass');

  // Load saved config
  const config = await chrome.storage.local.get(['apiUrl', 'adminUser', 'adminPass']);
  if (config.apiUrl) apiUrlInput.value = config.apiUrl;
  if (config.adminUser) adminUserInput.value = config.adminUser;
  if (config.adminPass) adminPassInput.value = config.adminPass;

  // Save config on change
  const saveConfig = () => {
    chrome.storage.local.set({
      apiUrl: apiUrlInput.value,
      adminUser: adminUserInput.value,
      adminPass: adminPassInput.value
    });
  };
  apiUrlInput.addEventListener('change', saveConfig);
  adminUserInput.addEventListener('change', saveConfig);
  adminPassInput.addEventListener('change', saveConfig);

  // Check stored cookies and update status dots
  const storedData = await chrome.storage.local.get([
    'dickensheet_cookie', 
    'public_surplus_cookie', 
    'rmeb_cookie', 
    'rol_cookie'
  ]);

  if (storedData.dickensheet_cookie) {
    document.querySelector('#status-dickensheet .dot').classList.replace('red', 'green');
  }
  if (storedData.public_surplus_cookie) {
    document.querySelector('#status-publicsurplus .dot').classList.replace('red', 'green');
  }
  if (storedData.rmeb_cookie) {
    document.querySelector('#status-whitley .dot').classList.replace('red', 'green');
  }
  if (storedData.rol_cookie) {
    document.querySelector('#status-roller .dot').classList.replace('red', 'green');
  }

  // Handle Sync Button
  syncBtn.addEventListener('click', async () => {
    syncBtn.disabled = true;
    syncBtn.textContent = 'Syncing...';
    messageEl.className = 'message hidden';

    const payload = {};
    if (storedData.dickensheet_cookie) payload.dickensheet_cookie = storedData.dickensheet_cookie;
    if (storedData.public_surplus_cookie) payload.public_surplus_cookie = storedData.public_surplus_cookie;
    if (storedData.rmeb_cookie) payload.rmeb_cookie = storedData.rmeb_cookie;
    if (storedData.rol_cookie) payload.rol_cookie = storedData.rol_cookie;

    if (Object.keys(payload).length === 0) {
      showMessage('error', 'No cookies captured yet. Please visit the auction sites first.');
      resetBtn();
      return;
    }

    try {
      // Basic Auth using username and password config
      const authHeader = 'Basic ' + btoa(`${adminUserInput.value}:${adminPassInput.value}`);
      const endpoint = `${apiUrlInput.value.replace(/\/$/, '')}/api/admin/settings`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status} ${response.statusText}`);
      }

      showMessage('success', 'Cookies synced successfully!');
    } catch (err) {
      console.error(err);
      showMessage('error', `Sync failed: ${err.message}`);
    } finally {
      resetBtn();
    }
  });

  function showMessage(type, text) {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
  }

  function resetBtn() {
    syncBtn.disabled = false;
    syncBtn.textContent = 'Sync Cookies to App';
  }
});