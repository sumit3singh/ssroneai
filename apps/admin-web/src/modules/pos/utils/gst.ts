export const calculateGSTAmount = (subtotal: number, gstPercent: number = 5): number => {
  return Math.round((subtotal * gstPercent) / 100);
};

export const splitGSTComponent = (totalGst: number) => {
  const half = Math.round(totalGst / 2);
  return { cgst: half, sgst: half };
};
