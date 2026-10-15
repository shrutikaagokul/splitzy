/**
 * Splitzy Currency & Paise Utilities
 * All financial amounts are stored as integer paise (1 Rupee = 100 paise)
 * to eliminate floating-point arithmetic errors.
 */

// Convert rupees (number or numeric string) to integer paise
export function rupeesToPaise(rupees) {
  if (rupees === null || rupees === undefined || isNaN(rupees)) return 0;
  return Math.round(parseFloat(rupees) * 100);
}

// Convert integer paise to decimal rupees
export function paiseToRupees(paise) {
  if (!paise || isNaN(paise)) return 0;
  return Number(paise) / 100;
}

// Format integer paise into Indian Rupee format (e.g. ₹1,200.00 or ₹1,200)
export function formatINR(paise, options = {}) {
  const {
    showSign = false,
    showPaiseIfZero = false,
    absolute = false,
  } = options;

  let valPaise = Number(paise) || 0;
  const isNegative = valPaise < 0;

  if (absolute) {
    valPaise = Math.abs(valPaise);
  }

  const rupees = valPaise / 100;
  const hasSubPaise = Math.abs(valPaise % 100) > 0;
  const fractionDigits = (hasSubPaise || showPaiseIfZero) ? 2 : 0;

  // Indian numbering formatter
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: 2,
  }).format(Math.abs(rupees));

  if (showSign) {
    if (isNegative) return `-${formatted}`;
    if (valPaise > 0) return `+${formatted}`;
    return formatted;
  }

  return isNegative ? `-${formatted}` : formatted;
}

// Format rupees directly
export function formatRupees(rupees, options = {}) {
  return formatINR(rupeesToPaise(rupees), options);
}
