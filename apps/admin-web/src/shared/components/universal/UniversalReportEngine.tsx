import React, { useState } from 'react';
import { api } from '@ssrone/api-client';

export const UniversalReportEngine: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState('pos-orders');
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await api.get<any[]>(`/business/${selectedModule}`);
      setReportData(data || []);
    } catch {
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', background: '#0f172a', color: '#f8fafc', borderRadius: '12px', border: '1px solid #334155' }}>
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '16px' }}>
        📊 Universal Dynamic Report & BI Analytics Engine
      </h3>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', background: '#1e293b', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
        <div>
          <label style={{ fontSize: '12px', color: '#94a3b8' }}>Select Module Source</label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
          >
            <option value="pos-orders">Restaurant POS Sales Orders</option>
            <option value="hotel-reservations">Hotel PMS Bookings & Folios</option>
            <option value="sweet-items">Sweet Shop Sales & Stock</option>
            <option value="bakery-products">Bakery Production & Freshness</option>
            <option value="inventory-items">Central Warehouse Stock Ledger</option>
            <option value="employees">HRMS Attendance & Payroll</option>
            <option value="chart-of-accounts">Finance General Ledger</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={fetchReport} style={{ width: '100%', padding: '10px', background: '#0284c7', color: '#fff', fontWeight: 'bold', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
            ⚡ Generate Dynamic Report
          </button>
        </div>
      </div>

      {/* Results View */}
      <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px' }}>
        <h4 style={{ fontSize: '16px', color: '#e2e8f0', marginBottom: '12px' }}>
          Report Payload Result ({reportData.length} records)
        </h4>
        {loading ? (
          <p style={{ color: '#94a3b8' }}>Querying PostgreSQL database...</p>
        ) : reportData.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Click "Generate Dynamic Report" above to query records.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                  {Object.keys(reportData[0] || {}).map((col) => (
                    <th key={col} style={{ padding: '8px' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                    {Object.values(row).map((val: any, vIdx) => (
                      <td key={vIdx} style={{ padding: '8px' }}>{typeof val === 'object' ? JSON.stringify(val) : String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
