import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { GlassSurface } from '../components/ui';
import { useTheme } from '../contexts/ThemeContext';

const CATEGORIES = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'regional', label: 'Regional Settings' },
  { id: 'app_access', label: 'Application Access' },
  { id: 'ebay', label: 'eBay Credentials' },
  { id: 'external_apis', label: 'External APIs' },
  { id: 'bidders', label: 'Bidder IDs' },
  { id: 'ai_enrichment', label: 'AI & Enrichment' },
  { id: 'extension', label: 'Chrome Extension' },
  {
    id: 'auction_houses',
    label: 'Auction Houses',
    subCategories: [
      { id: 'ah_whitley', label: 'Whitley Auction' },
      { id: 'ah_roller', label: 'Roller Auction' },
      { id: 'ah_public_surplus', label: 'Public Surplus' },
      { id: 'ah_dickensheet', label: 'Dickensheet' },
      { id: 'ah_govdeals', label: 'GovDeals' },
    ]
  }
];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Phoenix', label: 'Mountain Standard (MST - No DST)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time' },
  { value: 'UTC', label: 'UTC' }
];

const InstructionBox: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6 mb-6">
    <h3 className="text-blue-800 text-base font-semibold mt-0 mb-3 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
      {title}
    </h3>
    {children}
  </div>
);

const SettingsView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [settings, setSettings] = useState<Record<string, string>>({
    ebay_client_id: '',
    ebay_client_secret: '',
    marketcheck_api_key: '',
    whitley_bidder_id: '',
    roller_bidder_id: '',
    dickensheet_bidder_id: '',
    govdeals_bidder_id: '',
    public_surplus_zip: '',
    public_surplus_radius: '',
    govdeals_zip: '',
    govdeals_radius: '',
    rmeb_username: '', rmeb_password: '', rmeb_cookie: '',
    rol_username: '', rol_password: '', rol_cookie: '',
    public_surplus_username: '', public_surplus_password: '', public_surplus_cookie: '',
    dickensheet_username: '', dickensheet_password: '', dickensheet_cookie: '',
    govdeals_username: '', govdeals_password: '', govdeals_cookie: '',
    app_admin_username: '', app_admin_password: '',
    user_timezone: 'America/Denver', // Default
    description_template: '',
    ai_provider: 'local',
    gemini_api_key: '',
    ai_concurrency_limit: '6'
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
        else if (hostname.includes('govdeals')) key = 'govdeals_cookie';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    return (
      <GlassSurface tier={2} padded="md" className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
        Loading settings…
      </GlassSurface>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* Sidebar */}
      <GlassSurface tier={2} padded="md" className="w-full lg:w-[260px] shrink-0 self-start">
        <h2 className="text-headline-sm mb-3" style={{ color: 'var(--color-fg)' }}>Settings</h2>
        <ul className="list-none p-0 m-0 flex flex-col gap-1">
          {CATEGORIES.map(category => {
            const active = activeCategory === category.id && !category.subCategories;
            return (
              <li key={category.id} className="flex flex-col">
                <button
                  type="button"
                  className="px-3 py-2 rounded-md text-left text-sm transition-colors flex justify-between items-center focus-ring"
                  style={{
                    background: active ? 'var(--color-accent-soft)' : 'transparent',
                    color: active ? 'var(--color-accent)' : 'var(--color-fg-muted)',
                    fontWeight: category.subCategories ? 600 : 500,
                  }}
                  onClick={() => handleCategoryClick(category)}
                >
                  <span>{category.label}</span>
                  {category.subCategories && (
                    <span
                      className="text-[0.65rem] transition-transform duration-200"
                      style={{
                        color: 'var(--color-fg-subtle)',
                        transform: expandedCategories[category.id] ? 'rotate(180deg)' : 'none',
                      }}
                    >
                      ▼
                    </span>
                  )}
                </button>

                {category.subCategories && expandedCategories[category.id] && (
                  <ul
                    className="list-none p-0 mt-1 ml-3 flex flex-col gap-0.5"
                    style={{ borderLeft: '1px solid var(--color-border-hairline)' }}
                  >
                    {category.subCategories.map(sub => {
                      const subActive = activeCategory === sub.id;
                      return (
                        <li key={sub.id}>
                          <button
                            type="button"
                            className="w-full px-3 py-1.5 text-left text-xs rounded-r-md transition-colors focus-ring"
                            style={{
                              background: subActive ? 'var(--color-accent-soft)' : 'transparent',
                              color: subActive ? 'var(--color-accent)' : 'var(--color-fg-muted)',
                              fontWeight: 500,
                            }}
                            onClick={() => setActiveCategory(sub.id)}
                          >
                            {sub.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </GlassSurface>

      {/* Panel */}
      <div className="flex-grow min-w-0">
        {activeCategory === 'appearance' && <AppearancePanel />}
        {activeCategory !== 'appearance' && (
        <GlassSurface tier={2} padded="md" className="settings-panel-surface">

        {activeCategory === 'regional' && (
          <div className="bg-transparent rounded-2xl p-0 border-none shadow-none grid grid-cols-1 gap-6 max-w-2xl opacity-100 animate-in fade-in duration-300">
            <h2 className="text-2xl font-semibold text-gray-700 mb-0 flex items-center gap-3">Regional Settings</h2>
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="user_timezone">Display Timezone</label>
              <p className="text-sm text-gray-500 mb-2">
                All auction end times and events will be displayed in this timezone.
              </p>
              <select
                id="user_timezone"
                name="user_timezone"
                value={settings.user_timezone || 'America/Denver'}
                onChange={handleChange}
                className="form-input w-full"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
            <button 
              className="self-start action-btn mt-4" 
              onClick={() => {
                saveSettings(['user_timezone'], 'regional');
                // Persist locally for immediate use without page refresh if needed
                localStorage.setItem('user_timezone', settings.user_timezone);
              }}
              disabled={saving === 'regional'}
            >
              {saving === 'regional' ? 'Saving...' : 'Save Regional Settings'}
            </button>
          </div>
        )}

        {activeCategory === 'app_access' && (
          <div className="bg-transparent rounded-2xl p-0 border-none shadow-none grid grid-cols-1 gap-6 max-w-2xl opacity-100 animate-in fade-in duration-300">
            <h2 className="text-2xl font-semibold text-gray-700 mb-0 flex items-center gap-3">Application Access</h2>
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="app_admin_username">Admin Username</label>
              <input
                className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10"
                id="app_admin_username"
                name="app_admin_username"
                type="text"
                value={settings.app_admin_username || ''}
                onChange={handleChange}
                placeholder="admin"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="app_admin_password">Admin Password</label>
              <input
                className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10"
                id="app_admin_password"
                name="app_admin_password"
                type="password"
                value={settings.app_admin_password || ''}
                onChange={handleChange}
                placeholder="New password (leave blank to keep current)"
              />
            </div>
            <button 
              className="self-start action-btn mt-4" 
              onClick={() => saveSettings(['app_admin_username', 'app_admin_password'], 'app_access')}
              disabled={saving === 'app_access'}
            >
              {saving === 'app_access' ? 'Saving...' : 'Save App Access'}
            </button>
          </div>
        )}

        {activeCategory === 'ebay' && (
          <div className="bg-transparent rounded-2xl p-0 border-none shadow-none grid grid-cols-1 gap-6 max-w-2xl opacity-100 animate-in fade-in duration-300">
            <h2 className="text-2xl font-semibold text-gray-700 mb-0 flex items-center gap-3">eBay API Credentials</h2>
            <p className="text-sm text-gray-500 mb-4">
              Required for market valuations and eBay store management. To get these, create a developer account at 
              <a href="https://developer.ebay.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-1">developer.ebay.com</a>, 
              create an Application, and generate <strong>App ID (Client ID)</strong> and <strong>Cert ID (Client Secret)</strong> for the Production environment.
            </p>
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="ebay_client_id">Client ID (App ID)</label>
              <input
                className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10"
                id="ebay_client_id"
                name="ebay_client_id"
                type="text"
                value={settings.ebay_client_id || ''}
                onChange={handleChange}
                placeholder="Enter eBay Client ID"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="ebay_client_secret">Client Secret (Cert ID)</label>
              <input
                className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10"
                id="ebay_client_secret"
                name="ebay_client_secret"
                type="password"
                value={settings.ebay_client_secret || ''}
                onChange={handleChange}
                placeholder="Enter eBay Client Secret"
              />
            </div>
            <div className="flex flex-col gap-2 mt-6">
              <label htmlFor="ebay_description_template" className="text-[0.85rem] text-gray-500 font-semibold uppercase font-semibold text-gray-800 border-b border-gray-100 pb-2 mb-3 block">eBay Listing HTML Template</label>
              <p className="text-sm text-gray-500 mb-3">
                Paste your custom HTML template here. The AI Drafting agent will use this structure and inject item-specific details. Use placeholders if necessary, or just let the LLM adapt it.
              </p>
              <textarea
                id="ebay_description_template"
                name="ebay_description_template"
                value={settings.ebay_description_template || ''}
                onChange={handleChange}
                rows={12}
                className="frosted-input w-full font-mono text-xs"
                placeholder="<html><body>...</body></html>"
              />
            </div>
            <button 
              className="self-start action-btn mt-4" 
              onClick={() => saveSettings(['ebay_client_id', 'ebay_client_secret', 'ebay_description_template'], 'ebay')}
              disabled={saving === 'ebay'}
            >
              {saving === 'ebay' ? 'Saving...' : 'Save eBay Credentials & Template'}
            </button>
          </div>
        )}

        {activeCategory === 'external_apis' && (
          <div className="bg-transparent rounded-2xl p-0 border-none shadow-none grid grid-cols-1 gap-6 max-w-2xl opacity-100 animate-in fade-in duration-300">
            <h2 className="text-2xl font-semibold text-gray-700 mb-0 flex items-center gap-3">External API Keys</h2>
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="marketcheck_api_key">MarketCheck API Key</label>
              <p className="text-sm text-gray-500 mb-2">
                Provides high-precision vehicle market data (median retail price) based on VIN lookups. 
                Register for a free developer account at 
                <a href="https://www.marketcheck.com/cars-api" target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-1">marketcheck.com</a> 
                to receive your API Key.
              </p>
              <input
                className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10"
                id="marketcheck_api_key"
                name="marketcheck_api_key"
                type="password"
                value={settings.marketcheck_api_key || ''}
                onChange={handleChange}
                placeholder="Enter MarketCheck API Key"
              />
            </div>
            <button 
              className="self-start action-btn mt-4" 
              onClick={() => saveSettings(['marketcheck_api_key'], 'external_apis')}
              disabled={saving === 'external_apis'}
            >
              {saving === 'external_apis' ? 'Saving...' : 'Save API Keys'}
            </button>
          </div>
        )}

        {activeCategory === 'bidders' && (
          <div className="bg-transparent rounded-2xl p-0 border-none shadow-none grid grid-cols-1 gap-6 max-w-2xl opacity-100 animate-in fade-in duration-300">
            <h2 className="text-2xl font-semibold text-gray-700 mb-0 flex items-center gap-3">Bidder IDs</h2>
            <InstructionBox title="Why are these needed?">
              <p>These IDs allow the system to identify <strong>your</strong> bids during ingestion. This protects your items from being auto-pruned and enables real-time tracking of your winning/outbid status.</p>
            </InstructionBox>
            
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="whitley_bidder_id">Whitley Bidder ID</label>
              <input
                className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10"
                id="whitley_bidder_id"
                name="whitley_bidder_id"
                type="text"
                value={settings.whitley_bidder_id || ''}
                onChange={handleChange}
                placeholder="Enter Whitley Bidder ID"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="roller_bidder_id">Roller Bidder ID</label>
              <input
                className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10"
                id="roller_bidder_id"
                name="roller_bidder_id"
                type="text"
                value={settings.roller_bidder_id || ''}
                onChange={handleChange}
                placeholder="Enter Roller Bidder ID"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="dickensheet_bidder_id">Dickensheet Bidder ID</label>
              <input
                className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10"
                id="dickensheet_bidder_id"
                name="dickensheet_bidder_id"
                type="text"
                value={settings.dickensheet_bidder_id || ''}
                onChange={handleChange}
                placeholder="Enter Dickensheet Bidder ID"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="govdeals_bidder_id">GovDeals Buyer ID</label>
              <input
                className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10"
                id="govdeals_bidder_id"
                name="govdeals_bidder_id"
                type="text"
                value={settings.govdeals_bidder_id || ''}
                onChange={handleChange}
                placeholder="Enter GovDeals Buyer ID"
              />
            </div>
            <button 
              className="self-start action-btn mt-4" 
              onClick={() => saveSettings(['whitley_bidder_id', 'roller_bidder_id', 'dickensheet_bidder_id', 'govdeals_bidder_id'], 'bidders')}
              disabled={saving === 'bidders'}
            >
              {saving === 'bidders' ? 'Saving...' : 'Save Bidder IDs'}
            </button>
          </div>
        )}

        {activeCategory === 'ai_enrichment' && (
          <div className="bg-transparent rounded-2xl p-0 border-none shadow-none grid grid-cols-1 gap-6 max-w-2xl opacity-100 animate-in fade-in duration-300">
            <h2 className="text-2xl font-semibold text-gray-700 mb-0 flex items-center gap-3">AI & Enrichment Configuration</h2>
            <InstructionBox title="AI Provider Selection">
              <p>Choose between <strong>Local LLM</strong> (privacy-focused, hardware-limited) or <strong>Gemini Cloud API</strong> (high-speed, high-concurrency). Gemini Flash enables processing hundreds of items per minute.</p>
            </InstructionBox>
            
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="ai_provider">Active AI Provider</label>
              <select
                id="ai_provider"
                name="ai_provider"
                value={settings.ai_provider || 'local'}
                onChange={handleChange}
                className="form-input"
              >
                <option value="local">Local LLM (Gemma/Llama via LM Studio)</option>
                <option value="gemini">Google Gemini API (Flash 1.5/2.0)</option>
              </select>
            </div>

            {settings.ai_provider === 'gemini' && (
              <div className="flex flex-col gap-2 fade-in">
                <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="gemini_api_key">Gemini API Key</label>
                <p className="text-sm text-gray-500 mb-2">
                  Get your key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600">Google AI Studio</a>.
                </p>
                <input
                className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10"
                  id="gemini_api_key"
                  name="gemini_api_key"
                  type="password"
                  value={settings.gemini_api_key || ''}
                  onChange={handleChange}
                  placeholder="Enter Gemini API Key"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="ai_concurrency_limit">
                AI Concurrency Limit: <span className="font-bold text-blue-600">{settings.ai_concurrency_limit || 6}</span>
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Number of parallel AI requests. Local LLM is usually capped at 6. Gemini Paid Tier can handle up to 100+.
              </p>
              <input
                id="ai_concurrency_limit"
                name="ai_concurrency_limit"
                type="range"
                min="1"
                max="100"
                step="1"
                value={settings.ai_concurrency_limit || 6}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            <button 
              className="self-start action-btn mt-4" 
              onClick={() => saveSettings(['ai_provider', 'gemini_api_key', 'ai_concurrency_limit'], 'ai_enrichment')}
              disabled={saving === 'ai_enrichment'}
            >
              {saving === 'ai_enrichment' ? 'Saving...' : 'Save AI Configuration'}
            </button>
          </div>
        )}

        {activeCategory === 'extension' && (
          <div className="bg-transparent rounded-2xl p-0 border-none shadow-none grid grid-cols-1 gap-6 max-w-2xl opacity-100 animate-in fade-in duration-300">
            <h2 className="text-2xl font-semibold text-gray-700 mb-0 flex items-center gap-3">Chrome Extension</h2>
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
                  className="inline-flex items-center py-2 px-4 bg-blue-600 text-white no-underline rounded-lg font-semibold text-[0.9rem] transition-colors duration-200 hover:bg-blue-700 hover:text-white"
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
          <div className="bg-transparent rounded-2xl p-0 border-none shadow-none grid grid-cols-1 gap-6 max-w-2xl opacity-100 animate-in fade-in duration-300">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="text-2xl font-semibold text-gray-700 mb-0 flex items-center gap-3">Whitley Auction Credentials</h2>
              <div>
                <button className="text-blue-700 border border-blue-500/30 rounded-md font-medium cursor-pointer transition-all duration-200 bg-transparent hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => openCaptureTab('https://www.whitleyauction.com/login')} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', marginRight: '0.5rem' }}>
                  Login & Capture
                </button>
                <button className="text-blue-700 border border-blue-500/30 rounded-md font-medium cursor-pointer transition-all duration-200 bg-transparent hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => verifyLogin('rmeb')} disabled={verifying === 'rmeb'} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  {verifying === 'rmeb' ? 'Testing...' : 'Test Login'}
                </button>
              </div>
            </div>
            
            <InstructionBox title="Authentication Guidance">
              <p>Whitley (rmeb) uses a modern GraphQL interface. Provide your login credentials below. If you encounter CAPTCHA issues, use the <strong>Auction Master Extension</strong> to capture a session cookie which bypasses these checks.</p>
            </InstructionBox>
            
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="rmeb_username">Username / Email</label>
              <input className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10" id="rmeb_username" name="rmeb_username" type="text" value={settings.rmeb_username || ''} onChange={handleChange} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="rmeb_password">Password</label>
              <input className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10" id="rmeb_password" name="rmeb_password" type="password" value={settings.rmeb_password || ''} onChange={handleChange} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="rmeb_cookie">Session Cookie (Optional Fallback)</label>
              <input className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10" id="rmeb_cookie" name="rmeb_cookie" type="text" value={settings.rmeb_cookie || ''} onChange={handleChange} placeholder="connect.sid=..." />
            </div>
            <button 
              className="self-start action-btn mt-4" 
              onClick={() => saveSettings(['rmeb_username', 'rmeb_password', 'rmeb_cookie'], 'ah_whitley')}
              disabled={saving === 'ah_whitley'}
            >
              {saving === 'ah_whitley' ? 'Saving...' : 'Save Whitley Credentials'}
            </button>
          </div>
        )}

        {activeCategory === 'ah_roller' && (
          <div className="bg-transparent rounded-2xl p-0 border-none shadow-none grid grid-cols-1 gap-6 max-w-2xl opacity-100 animate-in fade-in duration-300">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="text-2xl font-semibold text-gray-700 mb-0 flex items-center gap-3">Roller Auction Credentials</h2>
              <div>
                <button className="text-blue-700 border border-blue-500/30 rounded-md font-medium cursor-pointer transition-all duration-200 bg-transparent hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => openCaptureTab('https://bid.rollerauction.com/login')} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', marginRight: '0.5rem' }}>
                  Login & Capture
                </button>
                <button className="text-blue-700 border border-blue-500/30 rounded-md font-medium cursor-pointer transition-all duration-200 bg-transparent hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => verifyLogin('rol')} disabled={verifying === 'rol'} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  {verifying === 'rol' ? 'Testing...' : 'Test Login'}
                </button>
              </div>
            </div>

            <InstructionBox title="Authentication Guidance">
              <p>Roller (rol) requires active credentials to fetch your bids. If you use the <strong>Auction Master Extension</strong>, the captured cookie will take precedence and provide the most stable connection.</p>
            </InstructionBox>
            
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="rol_username">Username / Email</label>
              <input className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10" id="rol_username" name="rol_username" type="text" value={settings.rol_username || ''} onChange={handleChange} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="rol_password">Password</label>
              <input className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10" id="rol_password" name="rol_password" type="password" value={settings.rol_password || ''} onChange={handleChange} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="rol_cookie">Session Cookie (Optional Fallback)</label>
              <input className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10" id="rol_cookie" name="rol_cookie" type="text" value={settings.rol_cookie || ''} onChange={handleChange} placeholder="connect.sid=..." />
            </div>
            <button 
              className="self-start action-btn mt-4" 
              onClick={() => saveSettings(['rol_username', 'rol_password', 'rol_cookie'], 'ah_roller')}
              disabled={saving === 'ah_roller'}
            >
              {saving === 'ah_roller' ? 'Saving...' : 'Save Roller Credentials'}
            </button>
          </div>
        )}

        {activeCategory === 'ah_public_surplus' && (
          <div className="bg-transparent rounded-2xl p-0 border-none shadow-none grid grid-cols-1 gap-6 max-w-2xl opacity-100 animate-in fade-in duration-300">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="text-2xl font-semibold text-gray-700 mb-0 flex items-center gap-3">Public Surplus Integration</h2>
              <div>
                <button className="text-blue-700 border border-blue-500/30 rounded-md font-medium cursor-pointer transition-all duration-200 bg-transparent hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => openCaptureTab('https://www.publicsurplus.com/sms/login/login')} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', marginRight: '0.5rem' }}>
                  Login & Capture
                </button>
                <button className="text-blue-700 border border-blue-500/30 rounded-md font-medium cursor-pointer transition-all duration-200 bg-transparent hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => verifyLogin('public_surplus')} disabled={verifying === 'public_surplus'} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  {verifying === 'public_surplus' ? 'Testing...' : 'Test Login'}
                </button>
              </div>
            </div>
            
            <InstructionBox title="Target Area & Authentication">
              <ol>
                <li><strong>Target Area:</strong> Enter your Zip Code and Radius to filter results to your local region.</li>
                <li><strong>Session Cookie:</strong> Public Surplus uses strict CAPTCHAs. 
                  <ul style={{ marginTop: '0.25rem' }}>
                    <li>Log in to Public Surplus in your browser.</li>
                    <li>Use the <strong>Auction Master Extension</strong> to "Sync Cookies" OR manually copy the <code>Cookie</code> header from any <code>publicsurplus.com</code> request in DevTools.</li>
                  </ul>
                </li>
              </ol>
            </InstructionBox>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="flex flex-col gap-2">
                <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="public_surplus_zip">Target Area Code (Zip)</label>
                <input
                className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10"
                  id="public_surplus_zip"
                  name="public_surplus_zip"
                  type="text"
                  value={settings.public_surplus_zip || ''}
                  onChange={handleChange}
                  placeholder="e.g. 80543"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="public_surplus_radius">Search Radius (Miles)</label>
                <input
                className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10"
                  id="public_surplus_radius"
                  name="public_surplus_radius"
                  type="number"
                  value={settings.public_surplus_radius || ''}
                  onChange={handleChange}
                  placeholder="e.g. 200"
                />
              </div>
            </div>
            
            <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #E5E7EB' }} />
            
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="public_surplus_username">Username</label>
              <input className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10" id="public_surplus_username" name="public_surplus_username" type="text" value={settings.public_surplus_username || ''} onChange={handleChange} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="public_surplus_password">Password</label>
              <input className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10" id="public_surplus_password" name="public_surplus_password" type="password" value={settings.public_surplus_password || ''} onChange={handleChange} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="public_surplus_cookie">Session Cookie (Pseudo-Auth)</label>
              <input className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10" id="public_surplus_cookie" name="public_surplus_cookie" type="text" value={settings.public_surplus_cookie || ''} onChange={handleChange} placeholder="Session cookie string..." />
            </div>
            <button 
              className="self-start action-btn mt-4" 
              onClick={() => saveSettings(['public_surplus_zip', 'public_surplus_radius', 'public_surplus_username', 'public_surplus_password', 'public_surplus_cookie'], 'ah_public_surplus')}
              disabled={saving === 'ah_public_surplus'}
            >
              {saving === 'ah_public_surplus' ? 'Saving...' : 'Save Public Surplus Settings'}
            </button>
          </div>
        )}

        {activeCategory === 'ah_dickensheet' && (
          <div className="bg-transparent rounded-2xl p-0 border-none shadow-none grid grid-cols-1 gap-6 max-w-2xl opacity-100 animate-in fade-in duration-300">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="text-2xl font-semibold text-gray-700 mb-0 flex items-center gap-3">Dickensheet Credentials</h2>
              <div>
                <button className="text-blue-700 border border-blue-500/30 rounded-md font-medium cursor-pointer transition-all duration-200 bg-transparent hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => openCaptureTab('https://bid.dickensheet.com/login')} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', marginRight: '0.5rem' }}>
                  Login & Capture
                </button>
                <button className="text-blue-700 border border-blue-500/30 rounded-md font-medium cursor-pointer transition-all duration-200 bg-transparent hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => verifyLogin('dickensheet')} disabled={verifying === 'dickensheet'} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  {verifying === 'dickensheet' ? 'Testing...' : 'Test Login'}
                </button>
              </div>
            </div>

            <InstructionBox title="Authentication Guidance">
              <p>Dickensheet uses the BidWrangler platform. While you can provide credentials, using a <strong>Session Cookie</strong> captured via the extension is highly recommended for stability.</p>
            </InstructionBox>
            
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="dickensheet_username">Username</label>
              <input className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10" id="dickensheet_username" name="dickensheet_username" type="text" value={settings.dickensheet_username || ''} onChange={handleChange} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="dickensheet_password">Password</label>
              <input className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10" id="dickensheet_password" name="dickensheet_password" type="password" value={settings.dickensheet_password || ''} onChange={handleChange} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="dickensheet_cookie">Session Cookie (Pseudo-Auth)</label>
              <input className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10" id="dickensheet_cookie" name="dickensheet_cookie" type="text" value={settings.dickensheet_cookie || ''} onChange={handleChange} placeholder="_session_id=..." />
            </div>
            <button 
              className="self-start action-btn mt-4" 
              onClick={() => saveSettings(['dickensheet_username', 'dickensheet_password', 'dickensheet_cookie'], 'ah_dickensheet')}
              disabled={saving === 'ah_dickensheet'}
            >
              {saving === 'ah_dickensheet' ? 'Saving...' : 'Save Dickensheet Credentials'}
            </button>
          </div>
        )}

        {activeCategory === 'ah_govdeals' && (
          <div className="bg-transparent rounded-2xl p-0 border-none shadow-none grid grid-cols-1 gap-6 max-w-2xl opacity-100 animate-in fade-in duration-300">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="text-2xl font-semibold text-gray-700 mb-0 flex items-center gap-3">GovDeals Integration</h2>
              <div>
                <button className="text-blue-700 border border-blue-500/30 rounded-md font-medium cursor-pointer transition-all duration-200 bg-transparent hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => openCaptureTab('https://www.govdeals.com/en/login')} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', marginRight: '0.5rem' }}>
                  Login & Capture
                </button>
                <button className="text-blue-700 border border-blue-500/30 rounded-md font-medium cursor-pointer transition-all duration-200 bg-transparent hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => verifyLogin('govdeals')} disabled={verifying === 'govdeals'} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  {verifying === 'govdeals' ? 'Testing...' : 'Test Login'}
                </button>
              </div>
            </div>
            
            <InstructionBox title="How to capture required GovDeals data">
              <ol>
                <li><strong>Buyer ID:</strong> Log in to GovDeals and go to <strong>My Account</strong> or <strong>MyBids</strong>. Your Buyer ID is the 7-digit number (e.g. <code>3908433</code>) displayed in your profile or the page URL.</li>
                <li><strong>Session Cookie:</strong> 
                  <ul style={{ marginTop: '0.25rem' }}>
                    <li>Open <strong>Developer Tools</strong> (F12 or Right Click &gt; Inspect).</li>
                    <li>Go to the <strong>Network</strong> tab and refresh the page.</li>
                    <li>Search for a request named <code>list</code> or <code>open</code> (to <code>maestro.lqdt1.com</code>).</li>
                    <li>Click it, scroll to <strong>Request Headers</strong>, and copy the <strong>entire</strong> <code>Cookie</code> value.</li>
                  </ul>
                </li>
                <li><strong>Stability:</strong> Pasting the <em>full</em> cookie string allows the app to find your <code>ref_tkn</code>, which keeps you logged in for <strong>14 days</strong>.</li>
              </ol>
            </InstructionBox>

            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="govdeals_bidder_id">Buyer ID</label>
              <div className="text-[0.8rem] text-gray-500 -mt-1 mb-2">Your GovDeals account number (Required for Bid Tracking)</div>
              <input 
                id="govdeals_bidder_id" 
                name="govdeals_bidder_id" 
                type="text" 
                value={settings.govdeals_bidder_id || ''} 
                onChange={handleChange} 
                placeholder="e.g. 3908433" 
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="govdeals_cookie">Session Cookie (Pseudo-Auth)</label>
              <div className="text-[0.8rem] text-gray-500 -mt-1 mb-2">Paste the entire cookie string from the browser's Network tab</div>
              <input className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10" id="govdeals_cookie" name="govdeals_cookie" type="text" value={settings.govdeals_cookie || ''} onChange={handleChange} placeholder="sa-user-id=...; tkn_val=...; ref_tkn=..." />
            </div>

            <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #E5E7EB' }} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="flex flex-col gap-2">
                <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="govdeals_zip">Target Area Code (Zip)</label>
                <input
                className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10"
                  id="govdeals_zip"
                  name="govdeals_zip"
                  type="text"
                  value={settings.govdeals_zip || ''}
                  onChange={handleChange}
                  placeholder="e.g. 80543"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="govdeals_radius">Search Radius (Miles)</label>
                <input
                className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10"
                  id="govdeals_radius"
                  name="govdeals_radius"
                  type="number"
                  value={settings.govdeals_radius || ''}
                  onChange={handleChange}
                  placeholder="e.g. 100"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-4">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="govdeals_username">GovDeals Username (Optional)</label>
              <input className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10" id="govdeals_username" name="govdeals_username" type="text" value={settings.govdeals_username || ''} onChange={handleChange} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] text-gray-500 font-semibold uppercase" htmlFor="govdeals_password">GovDeals Password (Optional)</label>
              <input className="bg-transparent border border-outline-variant rounded-lg py-3 px-4 text-on-surface text-base transition-all duration-200 w-full focus:outline-none focus:border-secondary focus:bg-surface-container focus:ring-3 focus:ring-secondary/10" id="govdeals_password" name="govdeals_password" type="password" value={settings.govdeals_password || ''} onChange={handleChange} />
            </div>

            <button
              className="self-start bg-white text-gray-700 border border-gray-200 py-3 px-8 rounded-lg font-semibold cursor-pointer transition-all duration-200 uppercase tracking-wide text-[0.85rem] hover:bg-gray-50 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 mt-6"
              onClick={() => saveSettings(['govdeals_zip', 'govdeals_radius', 'govdeals_username', 'govdeals_password', 'govdeals_cookie', 'govdeals_bidder_id'], 'ah_govdeals')}
              disabled={saving === 'ah_govdeals'}
            >
              {saving === 'ah_govdeals' ? 'Saving...' : 'Save GovDeals Settings'}
            </button>
          </div>
        )}
        </GlassSurface>
        )}
      </div>
    </div>
  );
};

// ─── Appearance panel: theme picker ─────────────────────────────────────────
function AppearancePanel() {
  const { theme, setTheme } = useTheme();
  const options: { value: 'light' | 'dark' | 'system'; icon: React.ReactNode; label: string; hint: string }[] = [
    { value: 'light', icon: <Sun size={18} />, label: 'Light', hint: 'Bright surfaces for daylight use' },
    { value: 'dark', icon: <Moon size={18} />, label: 'Dark', hint: 'Reduced glare for low-light environments' },
    { value: 'system', icon: <Monitor size={18} />, label: 'System', hint: 'Match your OS preference' },
  ];
  return (
    <GlassSurface tier={2} padded="md" className="flex flex-col gap-5 max-w-2xl">
      <div>
        <h2 className="text-headline-md" style={{ color: 'var(--color-fg)' }}>Appearance</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-fg-muted)' }}>
          Choose how Auction Master looks. System will follow your operating system setting.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((o) => {
          const active = theme === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => setTheme(o.value)}
              className="flex flex-col items-start gap-2 p-4 rounded-md text-left transition-all focus-ring"
              style={{
                background: active ? 'var(--color-accent-soft)' : 'var(--color-surface-1)',
                border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border-hairline)'}`,
                color: 'var(--color-fg)',
              }}
            >
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center"
                style={{
                  background: active ? 'var(--color-accent)' : 'var(--color-surface-2)',
                  color: active ? 'white' : 'var(--color-fg-muted)',
                }}
              >
                {o.icon}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{o.label}</span>
                <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>{o.hint}</span>
              </div>
            </button>
          );
        })}
      </div>
    </GlassSurface>
  );
}

export default SettingsView;