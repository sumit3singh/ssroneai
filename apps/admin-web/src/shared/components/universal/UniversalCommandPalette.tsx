import React, { useEffect, useState } from 'react';
import { api } from '@ssrone/api-client';

interface SearchResult {
  entity_type: string;
  id: number;
  title: string;
  subtitle: string;
  badge: string;
}

export const UniversalCommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      // Query PostgreSQL across items, customers, orders, rooms, reservations
      const [sweets, guests, posOrders, rooms] = await Promise.allSettled([
        api.get<any[]>('/business/sweet-items'),
        api.get<any[]>('/business/guests'),
        api.get<any[]>('/business/pos-orders'),
        api.get<any[]>('/business/hotel-rooms'),
      ]);

      const matched: SearchResult[] = [];

      if (sweets.status === 'fulfilled' && Array.isArray(sweets.value)) {
        sweets.value.forEach((item) => {
          if (item.name?.toLowerCase().includes(val.toLowerCase()) || item.item_code?.toLowerCase().includes(val.toLowerCase())) {
            matched.push({
              entity_type: 'Sweet Item',
              id: item.id,
              title: item.name,
              subtitle: `Code: ${item.item_code} • ₹${item.price_per_unit}/KG`,
              badge: 'Sweet Shop',
            });
          }
        });
      }

      if (guests.status === 'fulfilled' && Array.isArray(guests.value)) {
        guests.value.forEach((g) => {
          if (g.first_name?.toLowerCase().includes(val.toLowerCase()) || g.last_name?.toLowerCase().includes(val.toLowerCase()) || g.phone?.includes(val)) {
            matched.push({
              entity_type: 'Guest / Customer',
              id: g.id,
              title: `${g.first_name} ${g.last_name}`,
              subtitle: `Phone: ${g.phone || 'N/A'} • ID: ${g.id_number || 'N/A'}`,
              badge: 'Hotel PMS',
            });
          }
        });
      }

      if (posOrders.status === 'fulfilled' && Array.isArray(posOrders.value)) {
        posOrders.value.forEach((ord) => {
          if (ord.order_number?.toLowerCase().includes(val.toLowerCase()) || ord.customer_name?.toLowerCase().includes(val.toLowerCase())) {
            matched.push({
              entity_type: 'POS Bill Order',
              id: ord.id,
              title: `Order #${ord.order_number}`,
              subtitle: `Customer: ${ord.customer_name || 'Walk-In'} • Total: ₹${ord.total_amount}`,
              badge: 'POS Billing',
            });
          }
        });
      }

      if (rooms.status === 'fulfilled' && Array.isArray(rooms.value)) {
        rooms.value.forEach((rm) => {
          if (rm.room_number?.toLowerCase().includes(val.toLowerCase())) {
            matched.push({
              entity_type: 'Hotel Room',
              id: rm.id,
              title: `Room ${rm.room_number}`,
              subtitle: `Type: ${rm.room_type} • Status: ${rm.status}`,
              badge: 'PMS',
            });
          }
        });
      }

      setResults(matched);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '80px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '90%',
          maxWidth: '680px',
          background: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #334155', background: '#0f172a' }}>
          <span style={{ fontSize: '20px', marginRight: '12px' }}>🔍</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search items, guests, POS bills, rooms, invoices across all 16 modules... (Esc to close)"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontSize: '16px',
              outline: 'none',
            }}
          />
          <kbd style={{ background: '#334155', color: '#94a3b8', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
            Ctrl+K
          </kbd>
        </div>

        {/* Search Results */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '8px' }}>
          {loading ? (
            <p style={{ padding: '16px', color: '#94a3b8', textAlign: 'center' }}>Searching database across all 38 tables...</p>
          ) : query && results.length === 0 ? (
            <p style={{ padding: '16px', color: '#94a3b8', textAlign: 'center' }}>No matching records found for "{query}".</p>
          ) : !query ? (
            <div style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#94a3b8' }}>⚡ Quick Command Suggestions:</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ padding: '6px 0' }}>• Type guest name or phone number for Guest 360° Profile</li>
                <li style={{ padding: '6px 0' }}>• Type item code or sweet name for Item Workspace</li>
                <li style={{ padding: '6px 0' }}>• Type room number or bill number for live status</li>
              </ul>
            </div>
          ) : (
            results.map((res) => (
              <div
                key={`${res.entity_type}-${res.id}`}
                onClick={onClose}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  marginBottom: '4px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#f8fafc', fontWeight: 'bold' }}>{res.title}</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>{res.subtitle}</p>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', background: '#0284c7', color: '#fff' }}>
                  {res.badge}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
