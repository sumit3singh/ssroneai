import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, QrCode, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminQR = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8]);
  const [newTable, setNewTable] = useState("");

  const baseUrl = window.location.origin;

  const addTable = () => {
    const num = parseInt(newTable);
    if (num && !tables.includes(num)) {
      setTables([...tables, num].sort((a, b) => a - b));
      setNewTable("");
    }
  };

  const removeTable = (num: number) => {
    setTables(tables.filter((t) => t !== num));
  };

  const downloadQR = (tableNum: number) => {
    const url = `${baseUrl}/order/table/${tableNum}`;
    // Use a QR code API to generate image
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `table-${tableNum}-qr.png`;
    a.target = "_blank";
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-popover/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button onClick={() => navigate("/")} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-base sm:text-lg font-bold">SSR One AI Cafe – QR Codes</h1>
            <p className="text-xs text-muted-foreground">Generate QR for each table</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Add table */}
        <div className="bg-card rounded-2xl p-4">
          <h2 className="font-display font-semibold text-base mb-3">Add Table</h2>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Table number"
              value={newTable}
              onChange={(e) => setNewTable(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={addTable}
              className="btn-order px-4 py-2.5 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </motion.button>
          </div>
        </div>

        {/* Table grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {tables.map((num, idx) => {
            const url = `${baseUrl}/order/table/${num}`;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
            return (
              <motion.div
                key={num}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card rounded-2xl p-4 text-center space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm">Table {num}</span>
                  <button
                    onClick={() => removeTable(num)}
                    className="p-1 text-muted-foreground hover:text-destructive transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-popover rounded-xl p-3 flex items-center justify-center">
                  <img
                    src={qrUrl}
                    alt={`QR for Table ${num}`}
                    className="w-32 h-32"
                    loading="lazy"
                  />
                </div>

                <p className="text-xs text-muted-foreground break-all">{url}</p>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => downloadQR(num)}
                  className="w-full py-2 rounded-xl border border-primary text-primary text-xs font-semibold flex items-center justify-center gap-1 hover:bg-primary/5 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Download QR
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminQR;
