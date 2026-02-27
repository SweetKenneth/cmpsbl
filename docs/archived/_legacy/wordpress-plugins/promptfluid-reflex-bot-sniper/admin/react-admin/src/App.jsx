import React, { useState, useEffect } from 'react'
import { Shield, Play, RefreshCw, Settings, Download } from 'lucide-react'
import { ScanCard } from './components/ScanCard'
import { StatsGrid } from './components/StatsGrid'

function App() {
  const [scanning, setScanning] = useState(false)
  const [scanResults, setScanResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [settings, setSettings] = useState({
    notification_email: '',
    scan_frequency: 'weekly',
    auto_scan_enabled: false
  })

  const data = window.pfclarityData || {}

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const formData = new FormData()
      formData.append('action', 'pfclarity_get_results')
      formData.append('nonce', data.nonce)

      const response = await fetch(data.ajaxUrl, {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      if (result.success && result.data) {
        setScanResults(result.data)
      }
    } catch (error) {
      console.error('Failed to load initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startScan = async () => {
    setScanning(true)
    try {
      const formData = new FormData()
      formData.append('action', 'pfclarity_scan_site')
      formData.append('nonce', data.nonce)

      const response = await fetch(data.ajaxUrl, {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      if (result.success) {
        pollForResults(result.data.scan_id)
      } else {
        alert('Scan failed: ' + result.data)
        setScanning(false)
      }
    } catch (error) {
      alert('Scan error: ' + error.message)
      setScanning(false)
    }
  }

  const pollForResults = async (scanId) => {
    const maxAttempts = 30
    let attempts = 0

    const poll = setInterval(async () => {
      attempts++
      if (attempts > maxAttempts) {
        clearInterval(poll)
        setScanning(false)
        alert('Scan timeout. Please check results later.')
        return
      }

      try {
        const formData = new FormData()
        formData.append('action', 'pfclarity_get_results')
        formData.append('nonce', data.nonce)

        const response = await fetch(data.ajaxUrl, {
          method: 'POST',
          body: formData
        })
        
        const result = await response.json()
        if (result.success && result.data && result.data.status === 'completed') {
          setScanResults(result.data)
          setScanning(false)
          clearInterval(poll)
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 3000)
  }

  const saveSettings = async () => {
    try {
      const formData = new FormData()
      formData.append('action', 'pfclarity_save_settings')
      formData.append('nonce', data.nonce)
      formData.append('settings', JSON.stringify(settings))

      const response = await fetch(data.ajaxUrl, {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      if (result.success) {
        alert('Settings saved successfully!')
      }
    } catch (error) {
      alert('Failed to save settings')
    }
  }

  const startTrial = async () => {
    try {
      const formData = new FormData()
      formData.append('action', 'pfclarity_start_trial')
      formData.append('nonce', data.nonce)

      const response = await fetch(data.ajaxUrl, {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      if (result.success) {
        alert('Trial started! You now have 7 days of Pro access.')
        window.location.reload()
      } else {
        alert('Failed to start trial: ' + result.data)
      }
    } catch (error) {
      alert('Error starting trial')
    }
  }

  if (loading) {
    return (
      <div className="clarity-loading">
        <div className="clarity-spinner"></div>
      </div>
    )
  }

  return (
    <div className="clarity-dashboard">
      <div className="clarity-header">
        <div className="clarity-logo">
          <Shield size={32} />
          <div>
            <h1>PromptFluid Clarity</h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>AI-Powered Accessibility Scanner</p>
          </div>
        </div>
        <button 
          className="clarity-button clarity-button-primary"
          onClick={startScan}
          disabled={scanning || (!data.hasSubscription && !data.trialActive)}
        >
          {scanning ? (
            <>
              <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Scanning...
            </>
          ) : (
            <>
              <Play size={18} />
              Run Scan
            </>
          )}
        </button>
      </div>

      {!data.hasSubscription && !data.trialActive && (
        <div className="clarity-trial-banner">
          <div>
            <strong>🎉 Start Your Free 7-Day Trial</strong>
            <p style={{ opacity: 0.9, marginTop: '4px' }}>Full Pro features, no credit card required</p>
          </div>
          <button className="clarity-button" onClick={startTrial}>Start Trial</button>
        </div>
      )}

      {data.trialActive && (
        <div className="clarity-trial-banner">
          <span>✨ Free trial active · {data.trialDaysRemaining} days remaining</span>
          <button className="clarity-button">Upgrade to Pro</button>
        </div>
      )}

      <div className="clarity-tabs">
        <button 
          className={`clarity-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`clarity-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={16} /> Settings
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {scanResults && (
            <>
              <StatsGrid scanData={scanResults} />

              <div className="clarity-card">
                <h2>Accessibility Issues</h2>
                <div className="clarity-issues-list">
                  {scanResults.scan_data && scanResults.scan_data.issues && scanResults.scan_data.issues.length > 0 ? (
                    scanResults.scan_data.issues.map((issue, index) => (
                      <ScanCard key={index} issue={issue} />
                    ))
                  ) : (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>
                      No issues found. Your site looks accessible! 🎉
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {!scanResults && !scanning && (
            <div className="clarity-card" style={{ textAlign: 'center', padding: '48px' }}>
              <Shield size={48} style={{ color: '#7A5FFF', margin: '0 auto 16px' }} />
              <h2>Ready to Scan</h2>
              <p style={{ color: '#64748b', marginBottom: '24px' }}>
                Click "Run Scan" to check your site for WCAG 2.2 accessibility issues
              </p>
            </div>
          )}
        </>
      )}

      {activeTab === 'settings' && (
        <div className="clarity-card">
          <h2>Settings</h2>
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Notification Email
              </label>
              <input 
                type="email" 
                placeholder="admin@example.com"
                value={settings.notification_email}
                onChange={(e) => setSettings({...settings, notification_email: e.target.value})}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '6px',
                  fontSize: '14px'
                }} 
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Scan Frequency
              </label>
              <select 
                value={settings.scan_frequency}
                onChange={(e) => setSettings({...settings, scan_frequency: e.target.value})}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox"
                  checked={settings.auto_scan_enabled}
                  onChange={(e) => setSettings({...settings, auto_scan_enabled: e.target.checked})}
                />
                <span style={{ fontWeight: '600' }}>Enable Scheduled Scans (Pro)</span>
              </label>
            </div>
            <button className="clarity-button clarity-button-primary" onClick={saveSettings}>
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
