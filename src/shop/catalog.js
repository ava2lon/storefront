export function isDigitalProduct(product) {
  return Boolean(product && (product.is_downloadable || product.is_virtual));
}

export function plainText(value = '') {
  return String(value).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"').replace(/&#039;|&apos;/gi, "'").replace(/\s+/g, ' ').trim();
}

export function formatMoney(minor, currency = 'USD', decimals = 2) {
  const amount = Number(minor || 0) / (10 ** Number(decimals || 0));
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: Number(decimals) }).format(amount);
  } catch {
    return currency + ' ' + amount.toFixed(Number(decimals));
  }
}

export function productPrice(product) {
  const prices = product?.prices || {};
  return formatMoney(prices.price, prices.currency_code || 'USD', prices.currency_minor_unit ?? 2);
}

export function cartTotal(cart) {
  const totals = cart?.totals || {};
  return formatMoney(totals.total_price, totals.currency_code || 'USD', totals.currency_minor_unit ?? 2);
}

export function cartCount(cart) {
  return (cart?.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}
