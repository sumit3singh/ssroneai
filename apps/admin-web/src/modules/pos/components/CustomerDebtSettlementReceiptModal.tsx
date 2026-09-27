import React, { useState } from "react";
import { Printer, MessageSquare, CheckCircle2, X, Receipt, Download } from "lucide-react";
import { Button } from "@ssrone/ui";
import { toast } from "sonner";
import { useAuthStore } from "@ssrone/auth";
import {
  CustomerDebtSettlementReceiptData,
  printCustomerDebtSettlementReceiptDirectly,
} from "../utils/printUtils";
import { cleanString, formatBranchAddress } from "../utils/posPrintFormatters";

interface CustomerDebtSettlementReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CustomerDebtSettlementReceiptData | null;
}

export const CustomerDebtSettlementReceiptModal: React.FC<CustomerDebtSettlementReceiptModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const { selected_branch, selected_company } = useAuthStore();
  const [phoneInput, setPhoneInput] = useState<string>("");

  React.useEffect(() => {
    if (data?.customerPhone) {
      setPhoneInput(data.customerPhone);
    } else {
      setPhoneInput("");
    }
  }, [data]);

  if (!isOpen || !data) return null;

  const venueName = cleanString(selected_branch?.name || selected_company?.name || data.venueName || "BAITHAK CAFE CUH");
  const venueAddress = formatBranchAddress((selected_branch as any)?.address || (selected_company as any)?.address || data.venueAddress);
  const venueGstin = cleanString((selected_branch as any)?.gstin || (selected_company as any)?.gstin || data.venueGstin);
  const venuePhone = cleanString((selected_branch as any)?.phone || (selected_company as any)?.phone || data.venuePhone);

  const receiptNo = data.receiptNumber || `RCPT-${Date.now().toString().slice(-6)}`;
  const custName = data.customerName || "Customer";
  const custPhone = phoneInput || data.customerPhone || "";
  const paymentMethod = (data.paymentMethod || "CASH").toUpperCase();

  const handlePrint = () => {
    printCustomerDebtSettlementReceiptDirectly({
      ...data,
      receiptNumber: receiptNo,
      venueName,
      venueAddress,
      venueGstin,
      venuePhone,
    });
    toast.success("⚡ Debt settlement receipt printed directly!");
  };

  const handleSendWhatsApp = () => {
    const rawPhone = (phoneInput || custPhone).replace(/\D/g, "");
    if (!rawPhone || rawPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number for WhatsApp");
      return;
    }
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    const lines: string[] = [];
    lines.push("╔═══════════════════════════════════╗");
    lines.push(`   🍽️ *${venueName.toUpperCase()}*`);
    lines.push("╚═══════════════════════════════════╝");
    if (venueAddress) lines.push(`📍 *Address:* ${venueAddress}`);
    if (venuePhone) lines.push(`📞 *Phone:* ${venuePhone}`);
    lines.push("------------------------------------");
    lines.push("🧾 *CUSTOMER DEBT SETTLEMENT RECEIPT*");
    lines.push(`*Receipt No:* ${receiptNo}`);
    lines.push(`*Date/Time:* ${data.timestamp}`);
    lines.push(`👤 *Customer:* ${custName} (${custPhone})`);
    lines.push("------------------------------------");

    if (data.settledOrders && data.settledOrders.length > 0) {
      lines.push("*SETTLED BILLS:*");
      data.settledOrders.forEach((o) => {
        lines.push(`• Order #${o.orderNumber}: ${Number(o.totalAmount).toFixed(2)}`);
      });
      lines.push("------------------------------------");
    }

    lines.push(`Previous Debt: ${Number(data.totalDebtBefore).toFixed(2)}`);
    lines.push(`*Amount Received:* ${Number(data.amountReceived).toFixed(2)}`);
    lines.push(`Paid Via: ${paymentMethod}`);
    if (data.referenceNumber) lines.push(`Ref No: ${data.referenceNumber}`);
    lines.push("------------------------------------");
    lines.push(`*Remaining Balance:* ${Number(data.remainingDebt).toFixed(2)}`);
    if (data.remainingDebt <= 0) {
      lines.push("✨ *ALL OUTSTANDING DEBT CLEARED!* ✨");
    }
    lines.push("------------------------------------");
    lines.push("Thank you for your prompt payment! Visit Again 🙏");

    const message = lines.join("\n");
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
    toast.success(`WhatsApp receipt opened for +${cleanPhone}!`);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 select-none animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-4 space-y-3 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <Receipt size={16} />
            </div>
            <h3 className="font-extrabold text-sm text-foreground">
              Debt Settlement Receipt
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Printable Preview Slip */}
        <div className="bg-muted/30 border border-border rounded-xl p-3 font-mono text-2xs overflow-y-auto max-h-[380px] space-y-2.5">
          {/* Store Brand */}
          <div className="text-center space-y-0.5 border-b border-dashed border-border pb-2">
            <h4 className="font-black text-xs text-foreground tracking-wider uppercase">
              {venueName}
            </h4>
            {venueAddress && <p className="text-[10px] text-muted-foreground">{venueAddress}</p>}
            {venuePhone && <p className="text-[10px] text-muted-foreground">Mobile: {venuePhone}</p>}
            <div className="mt-1 px-2 py-0.5 rounded bg-muted text-[10px] font-bold text-foreground inline-block">
              KHATA CLEARANCE SLIP
            </div>
          </div>

          {/* Customer & Receipt Meta */}
          <div className="space-y-0.5 text-[11px] border-b border-dashed border-border pb-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Receipt No:</span>
              <span className="font-bold text-foreground">{receiptNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="text-foreground">{data.timestamp}</span>
            </div>
            <div className="flex justify-between font-bold pt-1">
              <span className="text-muted-foreground">Customer:</span>
              <span className="text-foreground">{custName}</span>
            </div>
            {custPhone && (
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Phone:</span>
                <span className="text-foreground">{custPhone}</span>
              </div>
            )}
          </div>

          {/* Settled Bills Breakdown */}
          {data.settledOrders && data.settledOrders.length > 0 && (
            <div className="border-b border-dashed border-border pb-2 space-y-1">
              <div className="flex justify-between text-[9.5px] font-bold text-muted-foreground border-b border-border/50 pb-0.5">
                <span>SETTLED BILL</span>
                <span>DATE</span>
                <span>BILL AMT</span>
              </div>
              {data.settledOrders.map((ord, idx) => (
                <div key={idx} className="flex justify-between text-[10.5px]">
                  <span className="font-bold text-foreground">{ord.orderNumber}</span>
                  <span className="text-muted-foreground text-[10px]">
                    {ord.date ? new Date(ord.date).toLocaleDateString() : "—"}
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {Number(ord.totalAmount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Financial Breakdown */}
          <div className="space-y-1 text-[11px] border-b border-dashed border-border pb-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Previous Debt:</span>
              <span className="font-mono font-bold text-foreground">
                {Number(data.totalDebtBefore).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 border-t border-border pt-1">
              <span>Amount Received:</span>
              <span className="font-mono text-sm">
                {Number(data.amountReceived).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Payment Mode:</span>
              <span className="font-bold uppercase text-foreground">{paymentMethod}</span>
            </div>
            {data.referenceNumber && (
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Ref No:</span>
                <span className="text-foreground font-mono">{data.referenceNumber}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t border-dashed border-border pt-1">
              <span className="text-muted-foreground">Remaining Debt:</span>
              <span className={`font-mono ${data.remainingDebt > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {Number(data.remainingDebt).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="text-center pt-1">
            {data.remainingDebt <= 0 ? (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ✨ ALL OUTSTANDING DEBTS CLEARED! ✨
              </span>
            ) : (
              <span className="text-[10px] font-medium text-muted-foreground italic">
                Payment Recorded in Customer Account
              </span>
            )}
          </div>
        </div>

        {/* WhatsApp Mobile Input */}
        <div className="flex items-center gap-1.5 bg-muted/40 p-1.5 rounded-lg border border-border">
          <MessageSquare size={13} className="text-green-600 shrink-0 ml-1" />
          <input
            type="tel"
            placeholder="Customer 10-digit WhatsApp number..."
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
            className="w-full bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-hidden"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={handleSendWhatsApp}
            className="h-9 text-xs font-bold text-green-700 dark:text-green-300 bg-green-500/10 hover:bg-green-500/20 border-green-500/30 gap-1.5 cursor-pointer"
          >
            <MessageSquare size={13} />
            <span>WhatsApp</span>
          </Button>

          <Button
            type="button"
            onClick={handlePrint}
            className="h-9 text-xs font-bold text-white bg-primary hover:bg-primary/90 gap-1.5 cursor-pointer shadow-sm"
          >
            <Printer size={13} />
            <span>Print Receipt</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
