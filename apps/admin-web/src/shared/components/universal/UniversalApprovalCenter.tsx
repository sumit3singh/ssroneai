import React from 'react';

export const UniversalApprovalCenter: React.FC = () => {
  return (
    <div style={{ padding: '24px', background: '#0f172a', color: '#f8fafc', borderRadius: '12px', border: '1px solid #334155' }}>
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '16px' }}>
        ⚡ Universal Enterprise Approval Center
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Pending Approvals</p>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>3 Pending</h3>
        </div>
        <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Approved Today</p>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>12 Items</h3>
        </div>
      </div>

      <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px' }}>
        <h4 style={{ fontSize: '16px', color: '#e2e8f0', marginBottom: '12px' }}>Unified Approval Queue</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
              <th style={{ padding: '8px' }}>Module Type</th>
              <th style={{ padding: '8px' }}>Request Title</th>
              <th style={{ padding: '8px' }}>Requested By</th>
              <th style={{ padding: '8px' }}>Amount / Scope</th>
              <th style={{ padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #334155' }}>
              <td style={{ padding: '8px', color: '#38bdf8' }}>POS Billing</td>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Manager Bill Discount Over 20%</td>
              <td style={{ padding: '8px' }}>Captain Sunil</td>
              <td style={{ padding: '8px', color: '#ef4444' }}>₹1,250 Discount</td>
              <td style={{ padding: '8px' }}>
                <button style={{ padding: '4px 8px', background: '#15803d', border: 'none', color: '#fff', borderRadius: '4px', marginRight: '6px', cursor: 'pointer' }}>Approve</button>
                <button style={{ padding: '4px 8px', background: '#991b1b', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #334155' }}>
              <td style={{ padding: '8px', color: '#ec4899' }}>Procurement</td>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>High-Value Dairy PO #PO-9912</td>
              <td style={{ padding: '8px' }}>Store Manager Vikram</td>
              <td style={{ padding: '8px', color: '#4ade80' }}>₹48,000 PO</td>
              <td style={{ padding: '8px' }}>
                <button style={{ padding: '4px 8px', background: '#15803d', border: 'none', color: '#fff', borderRadius: '4px', marginRight: '6px', cursor: 'pointer' }}>Approve</button>
                <button style={{ padding: '4px 8px', background: '#991b1b', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
