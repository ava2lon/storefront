const configuredUrl = (import.meta.env.VITE_WC_STORE_URL || '').trim();
const storeOrigin = (configuredUrl || window.location.origin).replace(/\/$/, '');
export const STORE_API = storeOrigin + '/wp-json/wc/store/v1';
const TOKEN_KEY = 'ava-digital:cart-token:' + storeOrigin;

let cartToken = safeReadToken();

function safeReadToken() {
  try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
}

function saveToken(value) {
  if (!value) return;
  cartToken = value;
  try { localStorage.setItem(TOKEN_KEY, value); } catch { /* storage may be blocked */ }
}

function headers(json) {
  const result = { Accept: 'application/json' };
  if (json) result['Content-Type'] = 'application/json';
  if (cartToken) result['Cart-Token'] = cartToken;
  return result;
}

async function request(path, options = {}) {
  const response = await fetch(STORE_API + path, {
    method: options.method || 'GET',
    headers: headers(Boolean(options.body)),
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: 'same-origin',
    cache: 'no-store',
  });
  saveToken(response.headers.get('Cart-Token'));
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.message || payload.data?.message || 'The store could not complete that request.';
    const error = new Error(message);
    error.status = response.status;
    error.code = payload.code || '';
    error.details = payload.data || null;
    throw error;
  }
  return payload;
}

export const api = {
  products(params = {}) {
    const query = new URLSearchParams({ per_page: '24', orderby: 'date', order: 'desc', ...params });
    return request('/products?' + query.toString());
  },
  product(id) {
    return request('/products/' + encodeURIComponent(id));
  },
  categories() {
    return request('/products/categories?per_page=100&hide_empty=true&orderby=name&order=asc');
  },
  async cart() {
    return request('/cart');
  },
  async addItem(id, quantity = 1) {
    if (!cartToken) await request('/cart');
    return request('/cart/add-item', { method: 'POST', body: { id: Number(id), quantity: Number(quantity) } });
  },
  updateItem(key, quantity) {
    return request('/cart/update-item', { method: 'POST', body: { key, quantity: Number(quantity) } });
  },
  removeItem(key) {
    return request('/cart/remove-item', { method: 'POST', body: { key } });
  },
  checkoutData() {
    return request('/checkout');
  },
  placeOrder(data) {
    return request('/checkout', { method: 'POST', body: data });
  },
};
