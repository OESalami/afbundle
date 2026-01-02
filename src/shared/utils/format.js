export const formatCurrency = (amount) => {
  try {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount).replace('GHS', '₵');
  } catch {
    return `₵${Number(amount).toFixed(2)}`;
  }
};

export const validatePhone = (value) => {
  const digits = String(value).replace(/\D/g, '');
  return digits.length === 10;
};