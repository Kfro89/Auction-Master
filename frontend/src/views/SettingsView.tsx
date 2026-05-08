import React, { useState, useEffect } from 'react';
import './SettingsView.css';

const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({
    ebay_client_id: '',
    ebay_client_secret: '',
    whitley_bidder_id: '',
    roller_bidder_id: '',
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
    </div>
  );
};

export default SettingsView;
