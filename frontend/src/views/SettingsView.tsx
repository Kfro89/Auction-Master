import React, { useState, useEffect } from 'react';
import './SettingsView.css';

const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({
    ebay_client_id: '',
    ebay_client_secret: '',
    whitley_bidder_id: '',
    roller_bidder_id: '',
    public_surplus_zip: '',
    public_surplus_radius: '',
    rmeb_username: '', rmeb_password: '', rmeb_cookie: '',
    rol_username: '', rol_password: '', rol_cookie: '',
    public_surplus_username: '', public_surplus_password: '', public_surplus_cookie: '',
    dickensheet_username: '', dickensheet_password: '', dickensheet_cookie: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

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

  if (loading) {
    return <div className="settings-view">Loading settings...</div>;
  }

  return (
    <div className="settings-view">
      <h1>Settings</h1>
      
      <div className="settings-section">
        <h2>eBay API Credentials</h2>
        <div className="form-group">
          <label htmlFor="ebay_client_id">Client ID</label>
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
          <label htmlFor="ebay_client_secret">Client Secret</label>
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
          className="save-btn" 
          onClick={() => saveSettings(['ebay_client_id', 'ebay_client_secret'], 'ebay')}
          disabled={saving === 'ebay'}
        >
          {saving === 'ebay' ? 'Saving...' : 'Save eBay Credentials'}
        </button>
      </div>

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
        <button 
          className="save-btn" 
          onClick={() => saveSettings(['whitley_bidder_id', 'roller_bidder_id'], 'bidders')}
          disabled={saving === 'bidders'}
        >
          {saving === 'bidders' ? 'Saving...' : 'Save Bidder IDs'}
        </button>
      </div>

      <div className="settings-section">
        <h2>Public Surplus Integration</h2>
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
        <button 
          className="save-btn" 
          onClick={() => saveSettings(['public_surplus_zip', 'public_surplus_radius'], 'public_surplus')}
          disabled={saving === 'public_surplus'}
        >
          {saving === 'public_surplus' ? 'Saving...' : 'Save Public Surplus Settings'}
        </button>
      </div>

      <div className="settings-section">
        <h2>Auction House Credentials</h2>
        <p className="text-sm text-gray-500 mb-4">Provide your login credentials or an active session cookie. Cookies bypass CAPTCHAs.</p>
        
        {/* Whitley / RMEB */}
        <h3 className="mt-4 font-semibold">Whitley Auction</h3>
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

        {/* Roller */}
        <h3 className="mt-6 font-semibold">Roller Auction</h3>
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

        {/* Public Surplus */}
        <h3 className="mt-6 font-semibold">Public Surplus</h3>
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

        {/* Dickensheet */}
        <h3 className="mt-6 font-semibold">Dickensheet</h3>
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
          onClick={() => saveSettings(['rmeb_username', 'rmeb_password', 'rmeb_cookie', 'rol_username', 'rol_password', 'rol_cookie', 'public_surplus_username', 'public_surplus_password', 'public_surplus_cookie', 'dickensheet_username', 'dickensheet_password', 'dickensheet_cookie'], 'credentials')}
          disabled={saving === 'credentials'}
        >
          {saving === 'credentials' ? 'Saving...' : 'Save All Credentials'}
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
