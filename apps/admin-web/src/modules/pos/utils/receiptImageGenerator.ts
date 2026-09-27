import { CustomerReceiptSlipData } from "./printUtils";
import { cleanTableName, formatItemWithVariantAndAddons } from "./posPrintFormatters";
import { getDisplayOrderNumber } from "./order-sequence";
import { renderSafeString } from "./renderSafeString";

/**
 * High-resolution canvas-based restaurant receipt image generator.
 * Produces crisp, professional, camera-photo-style receipts for WhatsApp and digital sharing.
 */
export async function generateReceiptImageBlob(data: CustomerReceiptSlipData): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not initialize 2D canvas context");

  const width = 640;
  const padding = 36;
  const contentWidth = width - padding * 2;

  // Pre-calculate height dynamically
  const venueName = (data.venueName || "BAITHAK CAFE CUH").toUpperCase();
  const venueAddress = data.venueAddress || "";
  const venueGstin = data.venueGstin || "";
  const venuePhone = data.venuePhone || "";
  const venueFssai = data.venueFssai || "";

  const displayOrderNum = getDisplayOrderNumber({ order_number: data.orderNumber }) || data.orderNumber || "";
  const orderType = (data.orderType || "DINE_IN").toUpperCase();
  const cleanTable = data.tableName ? cleanTableName(data.tableName) : "";
  const custName = data.customerName || "Walk-in Guest";
  const custPhone = data.customerPhone || "";
  const paymentMethod = (data.paymentMethod || "CASH").toUpperCase();

  const items = data.items || [];
  // Estimate height: header (~180) + meta (~120) + table header (~40) + items (~45 per item) + totals (~160) + footer (~80)
  const estimatedHeight = 580 + items.length * 48;
  canvas.width = width;
  canvas.height = estimatedHeight;

  // Render background (Crisp thermal receipt styling with soft shadow)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, estimatedHeight);

  // Outer subtle border
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, estimatedHeight - 2);

  // Header top accent line
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, width, 8);

  let y = 38;

  // 1. Venue Brand Header
  ctx.fillStyle = "#000000";
  ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(venueName, width / 2, y);
  y += 24;

  ctx.fillStyle = "#374151";
  ctx.font = "13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  if (venueAddress) {
    ctx.fillText(venueAddress, width / 2, y);
    y += 18;
  }
  if (venueGstin) {
    ctx.fillText(`GSTIN: ${venueGstin}`, width / 2, y);
    y += 18;
  }
  if (venuePhone) {
    ctx.fillText(`Phone: ${venuePhone}`, width / 2, y);
    y += 18;
  }
  if (venueFssai) {
    ctx.fillText(`FSSAI: ${venueFssai}`, width / 2, y);
    y += 18;
  }

  y += 10;
  // Divider line
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.setLineDash([5, 5]);
  ctx.moveTo(padding, y);
  ctx.lineTo(width - padding, y);
  ctx.stroke();
  ctx.setLineDash([]);
  y += 22;

  // 2. Order Metadata Box
  ctx.textAlign = "left";
  ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#000000";
  ctx.fillText(`ORDER NO: #${displayOrderNum}`, padding, y);

  ctx.textAlign = "right";
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(`MODE: ${orderType}`, width - padding, y);
  y += 20;

  ctx.textAlign = "left";
  ctx.font = "13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#4b5563";
  ctx.fillText(`Date: ${data.timestamp}`, padding, y);

  if (cleanTable) {
    ctx.textAlign = "right";
    ctx.fillStyle = "#111827";
    ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(`Table: ${cleanTable}`, width - padding, y);
  }
  y += 20;

  if (custName && custName !== "Walk-in Guest") {
    ctx.textAlign = "left";
    ctx.fillStyle = "#111827";
    ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(`Customer: ${custName}${custPhone ? ` (${custPhone})` : ""}`, padding, y);
    y += 20;
  }

  y += 6;
  // Solid Divider line
  ctx.beginPath();
  ctx.moveTo(padding, y);
  ctx.lineTo(width - padding, y);
  ctx.stroke();
  y += 20;

  // 3. Items Table Header
  ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#111827";
  ctx.textAlign = "left";
  ctx.fillText("ITEM & SIZE", padding, y);
  ctx.textAlign = "center";
  ctx.fillText("QTY", width - padding - 160, y);
  ctx.textAlign = "right";
  ctx.fillText("RATE", width - padding - 85, y);
  ctx.fillText("AMOUNT", width - padding, y);
  y += 8;

  ctx.strokeStyle = "#9ca3af";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, y);
  ctx.lineTo(width - padding, y);
  ctx.stroke();
  y += 18;

  // 4. Line Items
  items.forEach((it) => {
    const rawName = it.name || it.product_name || it.item_name || "Item";
    const variantName = it.variant_name || "";
    const addonsList = it.addons || it.selected_addons || it.addon_options || [];
    const itemTitle = formatItemWithVariantAndAddons(rawName, variantName, addonsList, "compact");

    ctx.textAlign = "left";
    ctx.fillStyle = "#000000";
    ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    
    // Truncate item title if too long to prevent overlapping
    const maxTitleWidth = contentWidth - 230;
    let displayTitle = itemTitle;
    if (ctx.measureText(displayTitle).width > maxTitleWidth) {
      while (displayTitle.length > 5 && ctx.measureText(`${displayTitle}...`).width > maxTitleWidth) {
        displayTitle = displayTitle.slice(0, -1);
      }
      displayTitle = `${displayTitle}...`;
    }
    ctx.fillText(displayTitle, padding, y);

    ctx.textAlign = "center";
    ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(String(it.quantity), width - padding - 160, y);

    ctx.textAlign = "right";
    ctx.font = "13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(Number(it.unit_price).toFixed(2), width - padding - 85, y);

    ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText((it.quantity * it.unit_price).toFixed(2), width - padding, y);
    y += 24;
  });

  y += 4;
  // Dashed Divider before totals
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.setLineDash([5, 5]);
  ctx.moveTo(padding, y);
  ctx.lineTo(width - padding, y);
  ctx.stroke();
  ctx.setLineDash([]);
  y += 22;

  // 5. Totals
  ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#374151";

  // Subtotal
  ctx.textAlign = "left";
  ctx.fillText("Subtotal:", width - padding - 220, y);
  ctx.textAlign = "right";
  ctx.fillText(Number(data.subtotal).toFixed(2), width - padding, y);
  y += 20;

  // Packaging Charge (if applicable)
  if (data.packagingChargeTotal && data.packagingChargeTotal > 0) {
    ctx.textAlign = "left";
    ctx.fillText("Packaging Charge:", width - padding - 220, y);
    ctx.textAlign = "right";
    ctx.fillText(`+${Number(data.packagingChargeTotal).toFixed(2)}`, width - padding, y);
    y += 20;
  }

  // Discount (if applicable)
  if (data.discountAmount && data.discountAmount > 0) {
    ctx.textAlign = "left";
    ctx.fillStyle = "#16a34a";
    ctx.fillText("Discount:", width - padding - 220, y);
    ctx.textAlign = "right";
    ctx.fillText(`-${Number(data.discountAmount).toFixed(2)}`, width - padding, y);
    ctx.fillStyle = "#374151";
    y += 20;
  }

  // GST / Tax
  ctx.textAlign = "left";
  ctx.fillText("GST (Taxes):", width - padding - 220, y);
  ctx.textAlign = "right";
  ctx.fillText(Number(data.taxAmount).toFixed(2), width - padding, y);
  y += 24;

  // Double Line before Grand Total
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width - padding - 230, y);
  ctx.lineTo(width - padding, y);
  ctx.stroke();
  y += 24;

  // Grand Total
  ctx.textAlign = "left";
  ctx.fillStyle = "#000000";
  ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("Grand Total:", width - padding - 220, y);

  ctx.textAlign = "right";
  ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(Number(data.netAmount).toFixed(2), width - padding, y);
  y += 22;

  // Paid via
  ctx.textAlign = "left";
  ctx.fillStyle = "#16a34a";
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(`STATUS: PAID VIA ${paymentMethod}`, width - padding - 220, y);
  y += 32;

  // Footer Note
  ctx.textAlign = "center";
  ctx.fillStyle = "#4b5563";
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("Thank You For Dining With Us! Visit Again", width / 2, y);

  // Return canvas as Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas blob generation failed"));
    }, "image/png");
  });
}

/**
 * Copies the receipt image directly to clipboard and opens WhatsApp chat.
 * Cashier simply presses Ctrl+V inside WhatsApp to send the receipt photo!
 */
export async function shareReceiptPhotoToWhatsApp(
  data: CustomerReceiptSlipData,
  rawPhone?: string
): Promise<{ success: boolean; copiedToClipboard: boolean }> {
  try {
    const cleanPhone = (rawPhone || data.customerPhone || "").replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    // 1. Generate PNG Blob
    const blob = await generateReceiptImageBlob(data);

    // 2. Try copying directly to system clipboard
    let copiedToClipboard = false;
    if (typeof navigator !== "undefined" && navigator.clipboard && typeof ClipboardItem !== "undefined") {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
        copiedToClipboard = true;
      } catch (clipErr) {
        console.warn("Could not write image to clipboard directly", clipErr);
      }
    }

    // 3. Trigger download for immediate drag & drop or sharing
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const displayNum = getDisplayOrderNumber({ order_number: data.orderNumber }) || data.orderNumber;
    link.href = downloadUrl;
    link.download = `Receipt_Order_${displayNum}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);

    // 4. Build crisp bill summary (No currency signs, clean numbers) & open WhatsApp
    const itemLines = (data.items || []).map((it: any) => {
      const rawName = renderSafeString(it.name || it.product_name || it.item_name || "Item");
      const variantName = renderSafeString(it.variant_name);
      const addonsList = it.addons || it.selected_addons || it.addon_options || [];
      const itemTitle = formatItemWithVariantAndAddons(rawName, variantName, addonsList, "compact");
      const qtyPriceStr = `${it.quantity} x ${Number(it.unit_price).toFixed(2)}`;
      const amtStr = `${(it.quantity * it.unit_price).toFixed(2)}`;
      return `• ${itemTitle} (${qtyPriceStr} = ${amtStr})`;
    }).join("\n");

    const textParts = [
      `🍽️ *${(data.venueName || "BAITHAK CAFE CUH").toUpperCase()}*`,
      data.venueAddress ? `📍 ${data.venueAddress}` : null,
      data.venuePhone ? `📞 Mobile: ${data.venuePhone}` : null,
      `🧾 *Order No:* #${displayNum} | *Mode:* ${data.orderType || "DINE_IN"}`,
      data.tableName ? `🪑 *Table:* ${cleanTableName(data.tableName)}` : null,
      data.customerName && data.customerName !== "Walk-in Guest" ? `👤 *Customer:* ${data.customerName}` : null,
      `📅 *Date:* ${data.timestamp}`,
      `------------------------------------`,
      itemLines || null,
      `------------------------------------`,
      `*Grand Total: ${Number(data.netAmount).toFixed(2)}*`,
      data.paymentMethod ? `*Payment Mode:* ${data.paymentMethod}` : null,
      `\n✨ *Receipt photo copied to clipboard! (Press Ctrl+V in WhatsApp to send image)* ✨`
    ].filter(Boolean).join("\n");

    const encoded = encodeURIComponent(textParts);
    if (formattedPhone && formattedPhone.length >= 10) {
      window.open(`https://wa.me/${formattedPhone}?text=${encoded}`, "_blank");
    } else {
      window.open(`https://wa.me/?text=${encoded}`, "_blank");
    }

    return { success: true, copiedToClipboard };
  } catch (err) {
    console.error("Failed to share receipt photo", err);
    return { success: false, copiedToClipboard: false };
  }
}
