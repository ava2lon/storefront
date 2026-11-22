import { describe, expect, it } from 'vitest';
import { cartCount, cartTotal, formatMoney, isDigitalProduct, plainText, productPrice } from '../src/shop/catalog.js';

describe('digital storefront helpers', () => {
  it('only includes downloadable or virtual products', () => {
    expect(isDigitalProduct({ is_downloadable: true })).toBe(true);
    expect(isDigitalProduct({ is_virtual: true })).toBe(true);
    expect(isDigitalProduct({ is_downloadable: false, is_virtual: false })).toBe(false);
    expect(isDigitalProduct(null)).toBe(false);
  });

  it('formats WooCommerce minor-unit prices', () => {
    expect(formatMoney('1299', 'USD', 2)).toContain('12.99');
    expect(productPrice({ prices: { price: '500', currency_code: 'USD', currency_minor_unit: 2 } })).toContain('5.00');
  });

  it('formats cart totals and item counts', () => {
    expect(cartTotal({ totals: { total_price: '2599', currency_code: 'USD', currency_minor_unit: 2 } })).toContain('25.99');
    expect(cartCount({ items: [{ quantity: 2 }, { quantity: 1 }] })).toBe(3);
    expect(cartCount({ items: [] })).toBe(0);
  });

  it('strips markup before displaying product copy as text', () => {
    expect(plainText('<p>Build <strong>better</strong> systems&nbsp;today.</p>')).toBe('Build better systems today.');
  });
});
