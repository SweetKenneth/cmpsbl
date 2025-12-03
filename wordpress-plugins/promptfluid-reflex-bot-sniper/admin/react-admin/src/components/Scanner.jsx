import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Scan } from 'lucide-react';

function Scanner({ scanResults, isScanning, onScan, canScan }) {
  return (
    <div className="pfclarity-scanner">
      <div className="scan-controls">
        <button
          onClick={onScan}
          disabled={isScanning || !canScan}
          className="scan-button"
        >
          <Scan size={20} />
          {isScanning ? 'Scanning...' : 'Scan Site'}
        </button>
        
        {!canScan && (
          <p className="scan-disabled-message">
            Active subscription or trial required to scan
          </p>
        )}
      </div>

      {scanResults && (
        <div className="scan-results">
          <div className="results-summary">
            <div className="summary-card">
              <h3>Compliance Score</h3>
              <div className="score">
                {Math.round(scanResults.compliance_score)}%
              </div>
            </div>
            
            <div className="summary-card">
              <h3>Total Issues</h3>
              <div className="count">{scanResults.total_issues}</div>
            </div>
            
            <div className="summary-card critical">
              <h3>Critical Issues</h3>
              <div className="count">{scanResults.critical_issues}</div>
            </div>
            
            <div className="summary-card warning">
              <h3>Warnings</h3>
              <div className="count">{scanResults.warnings}</div>
            </div>
          </div>

          <div className="pages-list">
            <h3>Scanned Pages ({scanResults.total_pages})</h3>
            {scanResults.pages?.map((page, idx) => (
              <div key={idx} className="page-result">
                <div className="page-url">{page.url}</div>
                <div className="page-issues">
                  {page.result?.issues?.length || 0} issues found
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Scanner;
