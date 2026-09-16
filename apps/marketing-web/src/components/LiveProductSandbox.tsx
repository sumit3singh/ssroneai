import React, { useState } from 'react';
import { 
  Utensils, 
  Cpu, 
  Hotel, 
  ShoppingBag, 
  MessageSquare, 
  Check, 
  Sparkles, 
  Clock, 
  Barcode, 
  Plus, 
  Trash2,
  Send
} from 'lucide-react';
import { sound } from '../utils/soundEngine';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  category: string;
  qty: number;
}

export const LiveProductSandbox: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pos' | 'hotel' | 'pg' | 'retail'>('pos');

  // ── POS & KDS State ──
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([
    { id: '1', name: 'Special Tandoori Platter', price: 480, category: 'Main', qty: 1 },
    { id: '2', name: 'Cold Brew Artisanal Coffee', price: 160, category: 'Beverage', qty: 2 },
  ]);
  const [dispatchedKdsOrders, setDispatchedKdsOrders] = useState<any[]>([
    { id: 'KOT-101', table: 'Table 4', items: ['1x Tandoori Platter', '2x Cold Brew'], timeAgo: '01:14 min', status: 'Cooking' },
  ]);
  const [selectedTable, setSelectedTable] = useState<string>('Table 4');

  // ── Hotel Reservation State ──
  const [rooms, setRooms] = useState([
    { number: '101', type: 'Deluxe Queen', status: 'Booked', guest: 'Dr. Anita Roy', rate: '₹3,500' },
    { number: '102', type: 'Executive Suite', status: 'Available', guest: '—', rate: '₹5,200' },
    { number: '201', type: 'Presidential Penthouse', status: 'Cleaning', guest: 'Departed (Folio Settled)', rate: '₹12,000' },
  ]);

  // ── Retail Barcode State ──
  const [retailItems, setRetailItems] = useState([
    { barcode: '890103038472', name: 'Organic Basmati Rice 5kg', price: 540, stock: 48 },
    { barcode: '890124827104', name: 'Cold-Pressed Mustard Oil 1L', price: 210, stock: 32 },
    { barcode: '890400010928', name: 'Artisan Green Tea Blend', price: 350, stock: 19 },
  ]);

  // ── PG WhatsApp Rent State ──
  const [pgTenant, setPgTenant] = useState('Rahul Verma');
  const [pgRoom, setPgRoom] = useState('Room 204 (AC Single)');
  const [pgRent, setPgRent] = useState(8500);

  // POS Handlers
  const addDish = (name: string, price: number, category: string) => {
    sound.playClick();
    setCurrentOrder(prev => {
      const existing = prev.find(item => item.name === name);
      if (existing) {
        return prev.map(item => item.name === name ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id: Date.now().toString(), name, price, category, qty: 1 }];
    });
  };

  const removeDish = (name: string) => {
    sound.playClick();
    setCurrentOrder(prev => prev.filter(item => item.name !== name));
  };

  const dispatchToKds = () => {
    if (currentOrder.length === 0) return;
    sound.playClick();
    sound.playPaperTear();

    const newKot = {
      id: `KOT-${Math.floor(100 + Math.random() * 900)}`,
      table: selectedTable,
      items: currentOrder.map(i => `${i.qty}x ${i.name}`),
      timeAgo: '00:02 sec',
      status: 'Live Kitchen Station',
    };

    setDispatchedKdsOrders(prev => [newKot, ...prev.slice(0, 3)]);
    setCurrentOrder([]);
  };

  // Retail Barcode Handler
  const scanBarcode = (barcode: string) => {
    sound.playBarcodeBeep();
    setRetailItems(prev => prev.map(item => {
      if (item.barcode === barcode && item.stock > 0) {
        return { ...item, stock: item.stock - 1 };
      }
      return item;
    }));
  };

  // Compute POS total
  const subtotal = currentOrder.reduce((acc, curr) => acc + curr.price * curr.qty, 0);
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  return (
    <div className="live-product-sandbox-card">
      <div className="sandbox-top-header">
        <div className="sandbox-title-cluster">
          <span className="sandbox-live-pill">
            <span className="live-dot-pulse" />
            LIVE INTERACTIVE SANDBOX
          </span>
          <h3 className="sandbox-heading">Test Drive SSR One AI Right Here in Your Browser</h3>
          <p className="sandbox-subtext">Click dishes, scan barcodes, and inspect instant kitchen order dispatches in real-time.</p>
        </div>

        {/* Sandbox Tabs */}
        <div className="sandbox-tabs-nav">
          <button 
            className={`sandbox-nav-btn ${activeTab === 'pos' ? 'active' : ''}`}
            onClick={() => { sound.playClick(); setActiveTab('pos'); }}
          >
            <Utensils size={15} />
            <span>Touch POS & KDS</span>
          </button>
          <button 
            className={`sandbox-nav-btn ${activeTab === 'hotel' ? 'active' : ''}`}
            onClick={() => { sound.playClick(); setActiveTab('hotel'); }}
          >
            <Hotel size={15} />
            <span>Hotel Room Grid</span>
          </button>
          <button 
            className={`sandbox-nav-btn ${activeTab === 'pg' ? 'active' : ''}`}
            onClick={() => { sound.playClick(); setActiveTab('pg'); }}
          >
            <MessageSquare size={15} />
            <span>WhatsApp PG Rent</span>
          </button>
          <button 
            className={`sandbox-nav-btn ${activeTab === 'retail' ? 'active' : ''}`}
            onClick={() => { sound.playClick(); setActiveTab('retail'); }}
          >
            <ShoppingBag size={15} />
            <span>Barcode Scanner</span>
          </button>
        </div>
      </div>

      <div className="sandbox-body-viewport">
        {/* ── 1. TOUCH POS & KDS VIEW ── */}
        {activeTab === 'pos' && (
          <div className="pos-kds-split-grid">
            {/* Left: Interactive Touch POS Menu */}
            <div className="pos-menu-column">
              <div className="pos-column-header">
                <span className="column-title">1. Touch POS Floor Menu ({selectedTable})</span>
                <div className="table-selector-mini">
                  {['Table 1', 'Table 4', 'Table 7'].map(t => (
                    <button 
                      key={t}
                      className={`table-btn ${selectedTable === t ? 'active' : ''}`}
                      onClick={() => setSelectedTable(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clickable Quick Menu Items */}
              <div className="dishes-buttons-grid">
                {[
                  { name: 'Special Tandoori Platter', price: 480, cat: 'Chef Special' },
                  { name: 'Paneer Lababdar Tikka', price: 340, cat: 'Appetizer' },
                  { name: 'Cold Brew Artisanal Coffee', price: 160, cat: 'Beverage' },
                  { name: 'Butter Garlic Naan (2x)', price: 90, cat: 'Breads' },
                  { name: 'Dal Makhani Bukhara Style', price: 360, cat: 'Curries' },
                  { name: 'Mango Kulfi Falooda', price: 180, cat: 'Desserts' },
                ].map(dish => (
                  <button 
                    key={dish.name} 
                    className="dish-touch-card"
                    onClick={() => addDish(dish.name, dish.price, dish.cat)}
                  >
                    <div className="dish-touch-info">
                      <span className="dish-name">{dish.name}</span>
                      <span className="dish-cat">{dish.cat}</span>
                    </div>
                    <span className="dish-price">₹{dish.price}</span>
                  </button>
                ))}
              </div>

              {/* Current Bill Slip */}
              <div className="pos-bill-slip">
                <div className="bill-slip-header">
                  <strong>Current Order Ticket:</strong>
                  <span>{currentOrder.length} Items Selected</span>
                </div>

                <div className="bill-items-list">
                  {currentOrder.length === 0 ? (
                    <div className="empty-bill-hint">Click any dish above to add to bill</div>
                  ) : (
                    currentOrder.map(item => (
                      <div key={item.name} className="bill-line-item">
                        <span>{item.qty}x {item.name}</span>
                        <div className="bill-line-right">
                          <strong>₹{item.price * item.qty}</strong>
                          <button onClick={() => removeDish(item.name)} className="btn-del-item">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="bill-summary-footer">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="summary-row">
                    <span>GST (5%):</span>
                    <span>₹{gst}</span>
                  </div>
                  <div className="summary-row grand-total">
                    <span>Payable Total:</span>
                    <strong>₹{total}</strong>
                  </div>

                  <button 
                    className="btn-dispatch-kot"
                    disabled={currentOrder.length === 0}
                    onClick={dispatchToKds}
                  >
                    <Sparkles size={16} />
                    <span>Dispatch to Kitchen KDS (&lt; 0.2s)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Kitchen Display System (KDS) Screen */}
            <div className="kds-screen-column">
              <div className="kds-header-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={16} color="#10B981" />
                  <span style={{ fontWeight: 800 }}>LIVE CHEF DISPLAY (KDS)</span>
                </div>
                <span className="kds-status-tag">Connected &bull; 0ms Delay</span>
              </div>

              <div className="kds-tickets-stream">
                {dispatchedKdsOrders.map(kot => (
                  <div key={kot.id} className="kds-ticket-card">
                    <div className="ticket-top">
                      <span className="ticket-id">{kot.id}</span>
                      <span className="ticket-table">{kot.table}</span>
                      <span className="ticket-clock">
                        <Clock size={11} />
                        {kot.timeAgo}
                      </span>
                    </div>

                    <div className="ticket-items-list">
                      {kot.items.map((it: string, idx: number) => (
                        <div key={idx} className="ticket-item-row">
                          <Check size={13} color="#10B981" />
                          <span>{it}</span>
                        </div>
                      ))}
                    </div>

                    <div className="ticket-action-bar">
                      <span className="ticket-tag-station">Tandoor &amp; Beverage Stations</span>
                      <button className="btn-ticket-ready" onClick={() => sound.playChime()}>
                        Mark Ready
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 2. HOTEL ROOM RESERVATION GRID VIEW ── */}
        {activeTab === 'hotel' && (
          <div className="hotel-sandbox-view">
            <div className="hotel-matrix-header">
              <h4>Live Room Inventory &amp; Housekeeping Matrix</h4>
              <span>Syncing with Booking.com &bull; Agoda &bull; MakeMyTrip (2-Way Channel API)</span>
            </div>

            <div className="rooms-grid-display">
              {rooms.map((room, idx) => (
                <div key={room.number} className={`room-matrix-card ${room.status.toLowerCase()}`}>
                  <div className="room-card-head">
                    <span className="room-num">Room {room.number}</span>
                    <span className={`room-status-badge ${room.status.toLowerCase()}`}>{room.status}</span>
                  </div>
                  <strong className="room-type-name">{room.type}</strong>
                  <div className="room-occupant">
                    <span>Occupant:</span>
                    <strong>{room.guest}</strong>
                  </div>
                  <div className="room-rate-row">
                    <span>Rack Rate:</span>
                    <strong>{room.rate} / night</strong>
                  </div>

                  <button 
                    className="btn-room-action"
                    onClick={() => {
                      sound.playClick();
                      setRooms(prev => prev.map((r, i) => i === idx ? {
                        ...r, 
                        status: r.status === 'Available' ? 'Booked' : 'Available',
                        guest: r.status === 'Available' ? 'Guest Confirmed' : '—'
                      } : r));
                    }}
                  >
                    {room.status === 'Available' ? 'Click to Quick Check-In' : 'Release Room'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 3. WHATSAPP PG RENT INVOICE VIEW ── */}
        {activeTab === 'pg' && (
          <div className="pg-sandbox-view">
            <div className="pg-controls-box">
              <h4>Automated Monthly Rent Generation</h4>
              <p>Configure tenant stay terms to see the exact WhatsApp reconciliation notification generated.</p>

              <div className="pg-input-group">
                <label>TENANT NAME</label>
                <input 
                  type="text" 
                  value={pgTenant} 
                  onChange={(e) => setPgTenant(e.target.value)} 
                  className="form-input"
                />
              </div>

              <div className="pg-input-group">
                <label>ROOM NUMBER</label>
                <input 
                  type="text" 
                  value={pgRoom} 
                  onChange={(e) => setPgRoom(e.target.value)} 
                  className="form-input"
                />
              </div>

              <div className="pg-input-group">
                <label>MONTHLY RENT (INR): ₹{pgRent}</label>
                <input 
                  type="range" 
                  min={4000} 
                  max={20000} 
                  step={500}
                  value={pgRent} 
                  onChange={(e) => setPgRent(Number(e.target.value))} 
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* WhatsApp Phone Mockup */}
            <div className="whatsapp-phone-mockup">
              <div className="whatsapp-chat-header">
                <div className="wa-avatar">SSR</div>
                <div>
                  <strong>SSR Student Hostel Living</strong>
                  <span>Automated WhatsApp Bot &bull; Official</span>
                </div>
              </div>

              <div className="whatsapp-bubble">
                <p>Hello <strong>{pgTenant}</strong>,</p>
                <p>Your rent invoice for <strong>{pgRoom}</strong> for <strong>September 2026</strong> has been generated.</p>
                <div className="wa-invoice-box">
                  <div>Rent Amount: <strong>₹{pgRent}.00</strong></div>
                  <div>Utility Water &amp; Electricity: <strong>₹0 (Included)</strong></div>
                  <div>Due Date: <strong>15-Sep-2026</strong></div>
                </div>
                <div className="wa-pay-btn">
                  <span>Pay Now via UPI (GooglePay / PhonePe)</span>
                </div>
                <span className="wa-timestamp">15:45 &bull; Sent via PostgreSQL Auto-Cron</span>
              </div>
            </div>
          </div>
        )}

        {/* ── 4. RETAIL BARCODE SCANNER VIEW ── */}
        {activeTab === 'retail' && (
          <div className="retail-sandbox-view">
            <div className="retail-scan-instruction">
              <Barcode size={22} color="var(--accent-emerald)" />
              <div>
                <h4>Click any product below to simulate a laser barcode scan</h4>
                <p>Listen for the supermarket checkout beep and observe instant inventory stock deduction.</p>
              </div>
            </div>

            <div className="retail-products-grid">
              {retailItems.map(item => (
                <div 
                  key={item.barcode} 
                  className="retail-sku-card"
                  onClick={() => scanBarcode(item.barcode)}
                >
                  <div className="sku-barcode-art">
                    <Barcode size={38} color="#1E293B" />
                    <span className="barcode-num">{item.barcode}</span>
                  </div>

                  <strong className="sku-name">{item.name}</strong>
                  
                  <div className="sku-details-row">
                    <span>Retail MRP: <strong>₹{item.price}</strong></span>
                    <span className={`sku-stock ${item.stock < 25 ? 'low' : ''}`}>
                      Live Stock: <strong>{item.stock} Units</strong>
                    </span>
                  </div>

                  <button className="btn-tap-scan">
                    <span>Click to Scan Barcode</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveProductSandbox;
