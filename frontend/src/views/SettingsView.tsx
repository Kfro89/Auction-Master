import React, { useState, useEffect } from 'react';
import './SettingsView.css';

const CATEGORIES = [
  { id: 'app_access', label: 'Application Access' },
  { id: 'ebay', label: 'eBay Credentials' },
  { id: 'external_apis', label: 'External APIs' },
  { id: 'bidders', label: 'Bidder IDs' },
  { id: 'extension', label: 'Chrome Extension' },
  { 
    id: 'auction_houses', 
    label: 'Auction Houses',
    subCategories: [
      { id: 'ah_whitley', label: 'Whitley Auction' },
      { id: 'ah_roller', label: 'Roller Auction' },
      { id: 'ah_public_surplus', label: 'Public Surplus' },
      { id: 'ah_dickensheet', label: 'Dickensheet' },
    ]
  }
];

const SettingsView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [settings, setSettings] = useState<Record<string, string>>({
    ebay_client_id: '',
    ebay_client_secret: '',
    marketcheck_api_key: '',
    whitley_bidder_id: '',
    roller_bidder_id: '',
    dickensheet_bidder_id: '',
    public_surplus_zip: '',
    public_surplus_radius: '',
    rmeb_username: '', rmeb_password: '', rmeb_cookie: '',
    rol_username: '', rol_password: '', rol_cookie: '',
    public_surplus_username: '', public_surplus_password: '', public_surplus_cookie: '',
    dickensheet_username: '', dickensheet_password: '', dickensheet_cookie: '',
    app_admin_username: '', app_admin_password: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'auction_houses': true // Expanded by default
  });

  useEffect(() => {
    fetchSettings();

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'AUCTION_COOKIE') {
        const { cookie, hostname } = event.data;
        let key = '';
        if (hostname.includes('publicsurplus')) key = 'public_surplus_cookie';
        else if (hostname.includes('dickensheet')) key = 'dickensheet_cookie';
        else if (hostname.includes('whitley')) key = 'rmeb_cookie';
        else if (hostname.includes('roller')) key = 'rol_cookie';

        if (key) {
          setSettings(prev => ({ ...prev, [key]: cookie }));
          alert(`✅ Successfully captured cookie for ${hostname}! Remember to click "Save Credentials".`);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const openCaptureTab = (url: string) => {
    window.open(url, '_blank');
  };

  const verifyLogin = async (websiteKey: string) => {
    setVerifying(websiteKey);
    try {
      const response = await fetch(`/api/admin/settings/verify-login/${websiteKey}`, { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        alert(data.message || 'Login successful!');
      } else {
        if (response.status === 403 && data.detail?.error === 'captcha_or_2fa_required') {
          alert(`Authentication requires manual login or CAPTCHA. Please provide a session cookie.\n\nDetails: ${data.detail.message}`);
        } else {
          alert(`Login failed: ${data.detail?.message || data.detail || 'Unknown error'}`);
        }
      }
    } catch (error) {
      alert('Network error during verification.');
    } finally {
      setVerifying(null);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (keys: string[], sectionId: string) => {
    setSaving(sectionId);
    try {
      const payload = keys.reduce((acc, key) => {
        acc[key] = settings[key];
        return acc;
      }, {} as Record<string, string>);

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save settings');
      
      // Optional: Show success toast/indicator
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleCategoryClick = (category: any) => {
    if (category.subCategories) {
      toggleCategory(category.id);
      // Select the first subcategory if expanding and none is selected
      if (!expandedCategories[category.id] && !category.subCategories.find((s: any) => s.id === activeCategory)) {
        setActiveCategory(category.subCategories[0].id);
      }
    } else {
      setActiveCategory(category.id);
    }
  };

  if (loading) {
    return <div className="settings-layout">Loading settings...</div>;
  }

  return (
    <div className="settings-layout">
      <div className="settings-sidebar">
        <h1>Settings</h1>
        <ul className="settings-nav">
          {CATEGORIES.map(category => (
            <li key={category.id} className="settings-nav-group">
              <div 
                className={`settings-nav-item ${activeCategory === category.id && !category.subCategories ? 'active' : ''} ${category.subCategories ? 'has-children' : ''}`}
                onClick={() => handleCategoryClick(category)}
              >
                {category.label}
                {category.subCategories && (
                  <span className={`nav-chevron ${expandedCategories[category.id] ? 'expanded' : ''}`}>▼</span>
                )}
              </div>
              
              {category.subCategories && expandedCategories[category.id] && (
                <ul className="settings-subnav">
                  {category.subCategories.map(sub => (
                    <li
                      key={sub.id}
                      className={`settings-subnav-item ${activeCategory === sub.id ? 'active' : ''}`}
                      onClick={() => setActiveCategory(sub.id)}
                    >
                      {sub.label}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="settings-content">
        {activeCategory === 'app_access' && (
          <div className="settings-section">
            <h2>Application Access</h2>
            <div className="form-group">
              <label htmlFor="app_admin_username">Admin Username</label>
              <input
                id="app_admin_username"
                name="app_admin_username"
                type="text"
                value={settings.app_admin_username || ''}
                onChange={handleChange}
                placeholder="admin"
              />
            </div>
            <div className="form-group">
              <label htmlFor="app_admin_password">Admin Password</label>
              <input
                id="app_admin_password"
                name="app_admin_password"
                type="password"
                value={settings.app_admin_password || ''}
                onChange={handleChange}
                placeholder="New password (leave blank to keep current)"
              />
            </div>
            <button 
              className="save-btn mt-4" 
              onClick={() => saveSettings(['app_admin_username', 'app_admin_password'], 'app_access')}
              disabled={saving === 'app_access'}
            >
              {saving === 'app_access' ? 'Saving...' : 'Save App Access'}
            </button>
          </div>
        )}

        {activeCategory === 'ebay' && (
          <div className="settings-section">
            <h2>eBay API Credentials</h2>
            <p className="text-sm text-gray-500 mb-4">
              Required for market valuations and eBay store management. To get these, create a developer account at 
              <a href="https://developer.ebay.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-1">developer.ebay.com</a>, 
              create an Application, and generate <strong>App ID (Client ID)</strong> and <strong>Cert ID (Client Secret)</strong> for the Production environment.
            </p>
            <div className="form-group">
              <label htmlFor="ebay_client_id">Client ID (App ID)</label>
              <input
                id="ebay_client_id"
                name="ebay_client_id"
                type="text"
                value={settings.ebay_client_id || ''}
                onChange={handleChange}
                placeholder="Enter eBay Client ID"
              />
            </div>
            <div className="form-group">
              <label htmlFor="ebay_client_secret">Client Secret (Cert ID)</label>
              <input
                id="ebay_client_secret"
                name="ebay_client_secret"
                type="password"
                value={settings.ebay_client_secret || ''}
                onChange={handleChange}
                placeholder="Enter eBay Client Secret"
              />
            </div>
            <button 
              className="save-btn mt-4" 
              onClick={() => saveSettings(['ebay_client_id', 'ebay_client_secret'], 'ebay')}
              disabled={saving === 'ebay'}
            >
              {saving === 'ebay' ? 'Saving...' : 'Save eBay Credentials'}
            </button>
          </div>
        )}

        {activeCategory === 'external_apis' && (
          <div className="settings-section">
            <h2>External API Keys</h2>
            <div className="form-group">
              <label htmlFor="marketcheck_api_key">MarketCheck API Key</label>
              <p className="text-sm text-gray-500 mb-2">
                Provides high-precision vehicle market data (median retail price) based on VIN lookups. 
                Register for a free developer account at 
                <a href="https://www.marketcheck.com/cars-api" target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-1">marketcheck.com</a> 
                to receive your API Key.
              </p>
              <input
                id="marketcheck_api_key"
                name="marketcheck_api_key"
                type="password"
                value={settings.marketcheck_api_key || ''}
                onChange={handleChange}
                placeholder="Enter MarketCheck API Key"
              />
            </div>
            <button 
              className="save-btn mt-4" 
              onClick={() => saveSettings(['marketcheck_api_key'], 'external_apis')}
              disabled={saving === 'external_apis'}
            >
              {saving === 'external_apis' ? 'Saving...' : 'Save API Keys'}
            </button>
          </div>
        )}

        {activeCategory === 'bidders' && (
          <div className="settings-section">
            <h2>Bidder IDs</h2>
            <div className="form-group">
              <label htmlFor="whitley_bidder_id">Whitley Bidder ID</label>
              <input
                id="whitley_bidder_id"
                name="whitley_bidder_id"
                type="text"
                value={settings.whitley_bidder_id || ''}
                onChange={handleChange}
                placeholder="Enter Whitley Bidder ID"
              />
            </div>
            <div className="form-group">
              <label htmlFor="roller_bidder_id">Roller Bidder ID</label>
              <input
                id="roller_bidder_id"
                name="roller_bidder_id"
                type="text"
                value={settings.roller_bidder_id || ''}
                onChange={handleChange}
                placeholder="Enter Roller Bidder ID"
              />
            </div>
            <div className="form-group">
              <label htmlFor="dickensheet_bidder_id">Dickensheet Bidder ID</label>
              <input
                id="dickensheet_bidder_id"
                name="dickensheet_bidder_id"
                type="text"
                value={settings.dickensheet_bidder_id || ''}
                onChange={handleChange}
                placeholder="Enter Dickensheet Bidder ID"
              />
            </div>
            <button 
              className="save-btn mt-4" 
              onClick={() => saveSettings(['whitley_bidder_id', 'roller_bidder_id', 'dickensheet_bidder_id'], 'bidders')}
              disabled={saving === 'bidders'}
            >
              {saving === 'bidders' ? 'Saving...' : 'Save Bidder IDs'}
            </button>
          </div>
        )}

        {activeCategory === 'extension' && (
          <div className="settings-section">
            <h2>Chrome Extension</h2>
            <p className="text-gray-500 mb-4">
              The Auction Master Chrome Extension helps you securely capture and sync authentication cookies 
              for auction houses directly into the app, bypassing strict CAPTCHAs and session policies.
            </p>
            
            <div className="extension-container" style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 className="font-semibold text-blue-600" style={{ margin: 0, fontSize: '1.1rem' }}>Get the Extension</h3>
                <a 
                  href="/extension-v1.0.0.zip" 
                  download="extension-v1.0.0.zip"
                  className="download-btn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Download ZIP
                </a>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2" style={{ fontSize: '0.95rem' }}>Installation Instructions</h4>
                  <ol className="text-sm text-gray-600" style={{ paddingLeft: '1.5rem', listStyleType: 'decimal', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li><strong>Download</strong> and extract the ZIP file to a folder on your computer.</li>
                    <li>Open Chrome and navigate to <code>chrome://extensions/</code></li>
                    <li>Toggle <strong>Developer mode</strong> in the top right corner.</li>
                    <li>Click <strong>Load unpacked</strong> and select your extracted folder.</li>
                    <li>Pin the new extension icon to your toolbar for easy access.</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2" style={{ fontSize: '0.95rem' }}>How to Use</h4>
                  <ol className="text-sm text-gray-600" style={{ paddingLeft: '1.5rem', listStyleType: 'decimal', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>Click the extension icon. Ensure the <strong>API URL</strong> matches this application (e.g. <code>http://localhost:8000</code>).</li>
                    <li>Enter your App Admin username and password.</li>
                    <li>Open a new tab, navigate to the target auction house, and log in.</li>
                    <li>Click the extension icon again and press <strong>Sync Cookies to App</strong>.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Auction House Subcategories */}
        {activeCategory === 'ah_whitley' && (
          <div className="settings-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Whitley Auction Credentials</h2>
              <div>
                <button className="action-btn" onClick={() => openCaptureTab('https://www.whitleyauction.com/login')} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', marginRight: '0.5rem' }}>
                  Login & Capture
                </button>
                <button className="action-btn" onClick={() => verifyLogin('rmeb')} disabled={verifying === 'rmeb'} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  {verifying === 'rmeb' ? 'Testing...' : 'Test Login'}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">Provide your login credentials or an active session cookie. Cookies bypass CAPTCHAs.</p>
            
            <div className="form-group">
              <label htmlFor="rmeb_username">Username / Email</label>
              <input id="rmeb_username" name="rmeb_username" type="text" value={settings.rmeb_username || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="rmeb_password">Password</label>
              <input id="rmeb_password" name="rmeb_password" type="password" value={settings.rmeb_password || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="rmeb_cookie">Session Cookie (Pseudo-Auth)</label>
              <input id="rmeb_cookie" name="rmeb_cookie" type="text" value={settings.rmeb_cookie || ''} onChange={handleChange} placeholder="connect.sid=..." />
            </div>
            <button 
              className="save-btn mt-4" 
              onClick={() => saveSettings(['rmeb_username', 'rmeb_password', 'rmeb_cookie'], 'ah_whitley')}
              disabled={saving === 'ah_whitley'}
            >
              {saving === 'ah_whitley' ? 'Saving...' : 'Save Whitley Credentials'}
            </button>
          </div>
        )}

        {activeCategory === 'ah_roller' && (
          <div className="settings-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Roller Auction Credentials</h2>
              <div>
                <button className="action-btn" onClick={() => openCaptureTab('https://bid.rollerauction.com/login')} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', marginRight: '0.5rem' }}>
                  Login & Capture
                </button>
                <button className="action-btn" onClick={() => verifyLogin('rol')} disabled={verifying === 'rol'} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  {verifying === 'rol' ? 'Testing...' : 'Test Login'}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">Provide your login credentials or an active session cookie. Cookies bypass CAPTCHAs.</p>
            
            <div className="form-group">
              <label htmlFor="rol_username">Username / Email</label>
              <input id="rol_username" name="rol_username" type="text" value={settings.rol_username || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="rol_password">Password</label>
              <input id="rol_password" name="rol_password" type="password" value={settings.rol_password || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="rol_cookie">Session Cookie (Pseudo-Auth)</label>
              <input id="rol_cookie" name="rol_cookie" type="text" value={settings.rol_cookie || ''} onChange={handleChange} placeholder="connect.sid=..." />
            </div>
            <button 
              className="save-btn mt-4" 
              onClick={() => saveSettings(['rol_username', 'rol_password', 'rol_cookie'], 'ah_roller')}
              disabled={saving === 'ah_roller'}
            >
              {saving === 'ah_roller' ? 'Saving...' : 'Save Roller Credentials'}
            </button>
          </div>
        )}

        {activeCategory === 'ah_public_surplus' && (
          <div className="settings-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Public Surplus Integration</h2>
              <div>
                <button className="action-btn" onClick={() => openCaptureTab('https://www.publicsurplus.com/sms/login/login')} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', marginRight: '0.5rem' }}>
                  Login & Capture
                </button>
                <button className="action-btn" onClick={() => verifyLogin('public_surplus')} disabled={verifying === 'public_surplus'} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  {verifying === 'public_surplus' ? 'Testing...' : 'Test Login'}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">Provide your target area and login credentials or an active session cookie.</p>
            
            <div className="form-group">
              <label htmlFor="public_surplus_zip">Target Area Code (Zip)</label>
              <input
                id="public_surplus_zip"
                name="public_surplus_zip"
                type="text"
                value={settings.public_surplus_zip || ''}
                onChange={handleChange}
                placeholder="e.g. 80543"
              />
            </div>
            <div className="form-group">
              <label htmlFor="public_surplus_radius">Search Radius (Miles)</label>
              <input
                id="public_surplus_radius"
                name="public_surplus_radius"
                type="number"
                value={settings.public_surplus_radius || ''}
                onChange={handleChange}
                placeholder="e.g. 200"
              />
            </div>
            
            <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #E5E7EB' }} />
            
            <div className="form-group">
              <label htmlFor="public_surplus_username">Username</label>
              <input id="public_surplus_username" name="public_surplus_username" type="text" value={settings.public_surplus_username || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="public_surplus_password">Password</label>
              <input id="public_surplus_password" name="public_surplus_password" type="password" value={settings.public_surplus_password || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="public_surplus_cookie">Session Cookie (Pseudo-Auth)</label>
              <input id="public_surplus_cookie" name="public_surplus_cookie" type="text" value={settings.public_surplus_cookie || ''} onChange={handleChange} placeholder="Session cookie string..." />
            </div>
            <button 
              className="save-btn mt-4" 
              onClick={() => saveSettings(['public_surplus_zip', 'public_surplus_radius', 'public_surplus_username', 'public_surplus_password', 'public_surplus_cookie'], 'ah_public_surplus')}
              disabled={saving === 'ah_public_surplus'}
            >
              {saving === 'ah_public_surplus' ? 'Saving...' : 'Save Public Surplus Settings'}
            </button>
          </div>
        )}

        {activeCategory === 'ah_dickensheet' && (
          <div className="settings-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Dickensheet Credentials</h2>
              <div>
                <button className="action-btn" onClick={() => openCaptureTab('https://bid.dickensheet.com/login')} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', marginRight: '0.5rem' }}>
                  Login & Capture
                </button>
                <button className="action-btn" onClick={() => verifyLogin('dickensheet')} disabled={verifying === 'dickensheet'} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  {verifying === 'dickensheet' ? 'Testing...' : 'Test Login'}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">Provide your login credentials or an active session cookie. Cookies bypass CAPTCHAs.</p>
            
            <div className="form-group">
              <label htmlFor="dickensheet_username">Username</label>
              <input id="dickensheet_username" name="dickensheet_username" type="text" value={settings.dickensheet_username || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="dickensheet_password">Password</label>
              <input id="dickensheet_password" name="dickensheet_password" type="password" value={settings.dickensheet_password || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="dickensheet_cookie">Session Cookie (Pseudo-Auth)</label>
              <input id="dickensheet_cookie" name="dickensheet_cookie" type="text" value={settings.dickensheet_cookie || ''} onChange={handleChange} placeholder="_session_id=..." />
            </div>
            <button 
              className="save-btn mt-4" 
              onClick={() => saveSettings(['dickensheet_username', 'dickensheet_password', 'dickensheet_cookie'], 'ah_dickensheet')}
              disabled={saving === 'ah_dickensheet'}
            >
              {saving === 'ah_dickensheet' ? 'Saving...' : 'Save Dickensheet Credentials'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsView;