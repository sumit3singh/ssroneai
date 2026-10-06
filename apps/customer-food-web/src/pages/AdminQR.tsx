import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Plus, Trash2, QrCode, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTenantBranchContext } from "@/hooks/useTenantBranchContext";

export const AdminQR = () => {
  const navigate = useNavigate();
  const { tenantSlug, branchCode, branchName } = useTenantBranchContext();
  const [tables, setTables] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8]);
  const [newTable, setNewTable] = useState("");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const getTableUrl = (num: number) => {
    if (tenantSlug && branchCode) {
      return `${baseUrl}/t/${tenantSlug}/b/${branchCode}/table/${num}`;
    }
    return `${baseUrl}/order/table/${num}`;
  };

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
    const url = getTableUrl(tableNum);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `table-${tableNum}-qr.png`;
    a.target = "_blank";
    a.click();
  };

  const handlePrintSheet = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans print:bg-white print:p-0">
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3.5 print:hidden">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-8 h-8 rounded-full bg-muted hover:bg-border text-foreground flex items-center justify-center transition cursor-pointer active:scale-95"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-foreground font-serif tracking-tight">
                Table QR Codes
              </h1>
              <p className="text-xs text-muted-foreground">
                {branchName} ({tenantSlug || "default"})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrintSheet}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition cursor-pointer active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print All</span>
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Add table */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs print:hidden">
          <h2 className="font-bold text-sm sm:text-base text-foreground font-serif mb-3 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-primary" /> Add Dining Table
          </h2>
          <div className="flex gap-2.5">
            <input
              type="number"
              placeholder="Table number (e.g. 9)"
              value={newTable}
              onChange={(e) => setNewTable(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-muted/40 border border-border text-sm font-semibold text-foreground focus:outline-none focus:border-primary transition"
            />
            <button
              onClick={addTable}
              className="min-h-[44px] px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {/* Table grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-2 print:gap-6">
          {tables.map((num, idx) => {
            const url = getTableUrl(num);
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`;
            return (
              <motion.div
                key={num}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-card rounded-2xl border border-border p-4 text-center space-y-3 shadow-xs hover:shadow-md transition-shadow print:border-2 print:border-black print:shadow-none"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm sm:text-base text-foreground font-serif">Table {num}</span>
                  <button
                    onClick={() => removeTable(num)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition cursor-pointer print:hidden"
                    aria-label={`Remove table ${num}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-border p-3 flex items-center justify-center">
                  <img
                    src={qrUrl}
                    alt={`QR for Table ${num}`}
                    className="w-32 h-32 rounded-lg"
                    loading="lazy"
                  />
                </div>

                <p className="text-[10px] text-muted-foreground break-all leading-tight font-mono">{url}</p>

                <button
                  onClick={() => downloadQR(num)}
                  className="w-full min-h-[38px] py-2 px-3 rounded-full border border-border text-foreground hover:bg-muted text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 print:hidden"
                >
                  <Download className="w-3.5 h-3.5" /> Download QR
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminQR;
