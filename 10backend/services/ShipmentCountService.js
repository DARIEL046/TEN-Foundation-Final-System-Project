// The count goes back to 0 after every 1,000 bags
const RESET_AT = 1000;

// ADDED - 2.2.2: builds the count for the current batch
// batchTotal = bags shipped since the last manual reset
export function calculateCount(totalShipped, batchTotal, manualResets) {
  const currentCount = batchTotal % RESET_AT; // bags since the last reset
  const autoResets = Math.floor(batchTotal / RESET_AT); // 1,000s done in this batch

  return {
    resetAt: RESET_AT,
    totalShipped: totalShipped,
    currentCount: currentCount,
    autoResets: autoResets,
    manualResets: manualResets,
    remainingToReset: RESET_AT - currentCount,
  };
}
