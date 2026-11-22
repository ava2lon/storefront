import './styles.css';
import { api } from './api.js';
import { cartCount, cartTotal, formatMoney, isDigitalProduct, plainText, productPrice } from './catalog.js';

const root = document.querySelector('#shop-app');
const state = { products: [], categories: [], cart: null, category: '', search: '', busy: false };

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function button(label, className, action, disabled = false) {
  const element = node('button', className, label);
  element.type = 'button';
  element.disabled = disabled;
  element.addEventListener('click', action);
  return element;
}

function imageFor(product, className = 'product-image') {
  const image = node('img', className);
  image.alt = product.name || 'Digital product';
  image.loading = 'lazy';
  image.src = product.images?.[0]?.thumbnail || product.images?.[0]?.src || '';
  image.onerror = () => { image.hidden = true; };
  return image;
}

function setNotice(message, kind = 'info') {
  const old = document.querySelector('.shop-notice');
  if (old) old.remove();
  const notice = node('div', 'shop-notice ' + kind, message);
  notice.setAttribute('role', 'status');
  root.prepend(notice);
  window.setTimeout(() => notice.remove(), 6500);
}

function header() {
  const bar = node('header', 'shop-header');
  const brand = node('a', 'shop-brand');
  brand.href = './shop.html';
  brand.append(node('span', 'brand-mark', 'A'), node('span', '', 'AVA DIGITAL'));
  const nav = node('nav', 'shop-nav');
  nav.append(
    Object.assign(node('a', '', 'Shop'), { href: '#collection' }),
    Object.assign(node('a', '', 'How it works'), { href: '#how-it-works' }),
    Object.assign(node('a', '', 'Help'), { href: '#support' })
  );
  const cart = button('Bag · ' + cartCount(state.cart), 'bag-button', openCart);
  cart.setAttribute('aria-label', 'Open shopping bag');
  bar.append(brand, nav, cart);
  return bar;
}

function hero() {
  const section = node('section', 'hero');
  const copy = node('div', 'hero-copy');
  copy.append(
    node('p', 'eyebrow', 'THE DIGITAL TOOLKIT'),
    node('h1', '', 'Make good work\nflow better.'),
    node('p', 'hero-description', 'Thoughtful templates, practical systems and creative resources that help you do your best work—with less friction.'),
    Object.assign(button('Explore the collection', 'primary-button', () => document.querySelector('#collection')?.scrollIntoView({ behavior: 'smooth' })), { })
  );
  const art = node('div', 'hero-art');
  art.setAttribute('aria-hidden', 'true');
  art.append(node('div', 'art-orbit orbit-one'), node('div', 'art-orbit orbit-two'), node('div', 'art-card card-back', 'PLAN'), node('div', 'art-card card-front', 'CREATE'), node('div', 'art-sticker', 'IDEAS\nIN ACTION'));
  section.append(copy, art);
  return section;
}

function categoryBar() {
  const bar = node('div', 'category-bar');
  bar.append(button('All products', 'category-chip' + (!state.category ? ' active' : ''), () => { state.category = ''; loadProducts(); }));
  state.categories.forEach((category) => {
    bar.append(button(category.name, 'category-chip' + (String(category.id) === state.category ? ' active' : ''), () => { state.category = String(category.id); loadProducts(); }));
  });
  return bar;
}

function productCard(product) {
  const card = node('article', 'product-card');
  const visual = node('button', 'product-visual');
  visual.type = 'button';
  visual.setAttribute('aria-label', 'View ' + product.name);
  visual.append(imageFor(product));
  if (!product.images?.length) visual.append(node('span', 'image-placeholder', 'AVA'));
  visual.addEventListener('click', () => openProduct(product));
  const info = node('div', 'product-info');
  const categoryName = product.categories?.[0]?.name || 'Digital resource';
  info.append(node('p', 'product-category', categoryName), node('h3', '', product.name), node('p', 'product-price', productPrice(product)));
  const actions = node('div', 'product-actions');
  actions.append(button('Quick view', 'text-button', () => openProduct(product)), button('Add to bag', 'add-button', () => addToCart(product.id)));
  card.append(visual, info, actions);
  return card;
}

function collection() {
  const section = node('section', 'collection section-wrap');
  section.id = 'collection';
  const heading = node('div', 'section-heading');
  const left = node('div');
  left.append(node('p', 'eyebrow', 'CURATED FOR YOU'), node('h2', '', 'The collection'));
  const search = node('input', 'search-input');
  search.type = 'search';
  search.placeholder = 'Search digital products';
  search.value = state.search;
  search.setAttribute('aria-label', 'Search products');
  search.addEventListener('input', debounce((event) => { state.search = event.target.value.trim(); loadProducts(); }, 350));
  heading.append(left, search);
  const grid = node('div', 'product-grid');
  if (!state.products.length) {
    grid.append(node('p', 'empty-products', 'No digital products found. Try another search or category.'));
  } else {
    state.products.forEach((product) => grid.append(productCard(product)));
  }
  section.append(heading, categoryBar(), grid);
  return section;
}

function footer() {
  const section = node('footer', 'shop-footer');
  section.id = 'support';
  const top = node('div', 'footer-top');
  top.append(node('div', 'footer-brand', 'AVA DIGITAL'), node('p', '', 'Useful digital goods. Delivered instantly.'));
  const links = node('div', 'footer-links');
  links.append(
    Object.assign(node('a', '', 'Contact'), { href: 'mailto:hello@example.com' }),
    Object.assign(node('a', '', 'Privacy'), { href: '#privacy' }),
    Object.assign(node('a', '', 'Terms'), { href: '#terms' })
  );
  section.append(top, links, node('p', 'footer-note', 'Secure checkout powered by WooCommerce. Digital delivery is handled by the store after payment confirmation.'));
  return section;
}

function render() {
  root.replaceChildren(header(), hero(), collection(), howItWorks(), footer());
}

function howItWorks() {
  const section = node('section', 'how-section section-wrap');
  section.id = 'how-it-works';
  section.append(node('p', 'eyebrow', 'SIMPLE BY DESIGN'), node('h2', '', 'A few clicks to a better workflow.'));
  const steps = node('div', 'steps-grid');
  [['01', 'Choose your tools', 'Find the template or resource that fits what you are working on.'], ['02', 'Checkout securely', 'Pay through the payment options configured in our WooCommerce store.'], ['03', 'Get instant access', 'Your download link is delivered by the store after successful payment.']].forEach((item) => {
    const card = node('article', 'step-card');
    card.append(node('span', 'step-number', item[0]), node('h3', '', item[1]), node('p', '', item[2]));
    steps.append(card);
  });
  section.append(steps);
  return section;
}

function modal(title, content, wide = false) {
  const overlay = node('div', 'shop-overlay');
  overlay.addEventListener('click', (event) => { if (event.target === overlay) overlay.remove(); });
  const dialog = node('section', 'shop-dialog' + (wide ? ' wide' : ''));
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  const top = node('div', 'dialog-top');
  top.append(node('h2', '', title), button('×', 'close-button', () => overlay.remove()));
  dialog.append(top, content);
  overlay.append(dialog);
  root.append(overlay);
  dialog.querySelector('.close-button').focus();
  return { overlay, dialog };
}

function openProduct(product) {
  const body = node('div', 'product-detail');
  const picture = node('div', 'detail-picture');
  picture.append(imageFor(product, 'detail-image'));
  const copy = node('div', 'detail-copy');
  copy.append(node('p', 'eyebrow', product.categories?.[0]?.name || 'DIGITAL RESOURCE'), node('h2', '', product.name), node('p', 'detail-price', productPrice(product)));
  copy.append(node('p', 'detail-description', plainText(product.description || product.short_description || 'A practical digital resource, ready when you are.')));
  copy.append(node('p', 'instant-note', '↳ Digital download · No physical item will be shipped'));
  copy.append(button('Add to bag', 'primary-button full-button', async () => {
    await addToCart(product.id);
    document.querySelector('.shop-overlay')?.remove();
  }));
  body.append(picture, copy);
  modal('Product details', body, true);
}

async function addToCart(id) {
  try {
    state.cart = await api.addItem(id, 1);
    refreshHeader();
    setNotice('Added to your bag.');
  } catch (error) {
    setNotice(error.message, 'error');
  }
}

function refreshHeader() {
  const old = document.querySelector('.bag-button');
  if (old) old.textContent = 'Bag · ' + cartCount(state.cart);
}

async function openCart() {
  try {
    state.cart = await api.cart();
  } catch (error) {
    setNotice(error.message, 'error');
    return;
  }
  const body = node('div', 'cart-content');
  const { overlay, dialog } = modal('Your bag', body);
  renderCart(body, overlay);
}

function renderCart(body, overlay) {
  body.replaceChildren();
  const items = state.cart?.items || [];
  if (!items.length) {
    body.append(node('p', 'empty-cart', 'Your bag is empty.'), button('Continue shopping', 'primary-button full-button', () => overlay.remove()));
    return;
  }
  const list = node('div', 'cart-list');
  items.forEach((item) => {
    const row = node('article', 'cart-row');
    const image = node('img', 'cart-thumb');
    image.src = item.images?.[0]?.thumbnail || item.images?.[0]?.src || '';
    image.alt = '';
    const details = node('div', 'cart-item-details');
    details.append(node('strong', '', item.name), node('span', '', item.prices?.price ? formatMoney(item.prices.price, item.prices.currency_code, item.prices.currency_minor_unit) : ''));
    const controls = node('div', 'quantity-controls');
    controls.append(button('−', 'quantity-button', async () => changeQuantity(item, Math.max(0, item.quantity - 1))), node('span', '', String(item.quantity)), button('+', 'quantity-button', async () => changeQuantity(item, item.quantity + 1)));
    details.append(controls);
    row.append(image, details, button('Remove', 'remove-button', async () => {
      try { state.cart = await api.removeItem(item.key); renderCart(body, overlay); refreshHeader(); }
      catch (error) { setNotice(error.message, 'error'); }
    }));
    list.append(row);
  });
  const total = node('div', 'cart-total');
  total.append(node('span', '', 'Total'), node('strong', '', cartTotal(state.cart)));
  body.append(list, total, node('p', 'checkout-hint', 'Your final total and available payment methods are confirmed securely at checkout.'), button('Continue to secure checkout', 'primary-button full-button', () => openCheckout(overlay)));
}

async function changeQuantity(item, quantity) {
  try {
    state.cart = quantity === 0 ? await api.removeItem(item.key) : await api.updateItem(item.key, quantity);
    const body = document.querySelector('.cart-content');
    const overlay = document.querySelector('.shop-overlay');
    if (body && overlay) renderCart(body, overlay);
    refreshHeader();
  } catch (error) { setNotice(error.message, 'error'); }
}

async function openCheckout(cartOverlay) {
  try {
    const checkout = await api.checkoutData();
    const paymentMethods = checkout.payment_methods || [];
    if (!paymentMethods.length) {
      setNotice('No payment methods are enabled in WooCommerce yet. Configure a gateway, then try again.', 'error');
      return;
    }
    const body = node('form', 'checkout-form');
    body.noValidate = true;
    const fields = node('div', 'checkout-fields');
    const first = field('First name', 'first_name', 'text', true);
    const last = field('Last name', 'last_name', 'text', true);
    const email = field('Email address', 'email', 'email', true);
    const country = field('Country (2-letter code)', 'country', 'text', true);
    country.input.value = 'US';
    country.input.maxLength = 2;
    country.input.autocomplete = 'country';
    fields.append(first.wrap, last.wrap, email.wrap, country.wrap);
    const paymentLabel = node('label', 'form-field');
    paymentLabel.append(node('span', '', 'Payment method'));
    const payment = document.createElement('select');
    payment.name = 'payment_method';
    payment.required = true;
    paymentMethods.forEach((method) => {
      const option = document.createElement('option');
      option.value = method.id;
      option.textContent = method.title;
      payment.append(option);
    });
    paymentLabel.append(payment);
    body.append(fields, paymentLabel);
    const note = node('p', 'checkout-hint', 'This checkout is for digital products. No shipping address is required. Download access is issued by WooCommerce after payment is confirmed.');
    const error = node('p', 'form-error');
    error.setAttribute('role', 'alert');
    const submit = button('Place order · ' + cartTotal(state.cart), 'primary-button full-button', () => {});
    submit.type = 'submit';
    body.append(note, error, submit);
    const { overlay } = modal('Secure checkout', body, true);
    body.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!body.reportValidity()) return;
      submit.disabled = true;
      submit.textContent = 'Processing…';
      error.textContent = '';
      const address = {
        first_name: first.input.value.trim(),
        last_name: last.input.value.trim(),
        email: email.input.value.trim(),
        country: country.input.value.trim().toUpperCase(),
        address_1: '', address_2: '', city: '', state: '', postcode: '', phone: '',
      };
      try {
        const result = await api.placeOrder({
          billing_address: address,
          shipping_address: address,
          payment_method: payment.value,
          payment_data: [],
          expected_total: String(state.cart?.totals?.total_price || ''),
        });
        const paymentResult = result.payment_result || {};
        if (paymentResult.redirect_url) {
          window.location.assign(paymentResult.redirect_url);
          return;
        }
        overlay.remove();
        cartOverlay.remove();
        const status = String(result.status || 'pending').replace(/-/g, ' ');
        const success = node('div', 'order-result');
        success.append(node('span', 'result-mark', '✓'), node('h2', '', 'Order received'), node('p', '', 'Order ' + (result.order_number || result.order_id || '') + ' was created. Current status: ' + status + '. Follow the instructions from your selected payment method. Your download links are sent by WooCommerce after successful payment.'), button('Back to the collection', 'primary-button full-button', () => { document.querySelector('.shop-overlay')?.remove(); }));
        modal('Thank you', success, true);
      } catch (submitError) {
        error.textContent = submitError.message;
        submit.disabled = false;
        submit.textContent = 'Place order · ' + cartTotal(state.cart);
      }
    });
  } catch (error) {
    setNotice(error.message, 'error');
  }
}

function field(label, name, type, required) {
  const wrap = node('label', 'form-field');
  wrap.append(node('span', '', label));
  const input = document.createElement('input');
  input.name = name;
  input.type = type;
  input.required = required;
  input.autocomplete = name;
  wrap.append(input);
  return { wrap, input };
}

function debounce(callback, delay) {
  let timer;
  return (...args) => { window.clearTimeout(timer); timer = window.setTimeout(() => callback(...args), delay); };
}

async function loadProducts() {
  const grid = document.querySelector('.product-grid');
  if (grid) grid.replaceChildren(node('p', 'empty-products', 'Updating collection…'));
  try {
    const params = {};
    if (state.search) params.search = state.search;
    if (state.category) params.category = state.category;
    const products = await api.products(params);
    state.products = products.filter(isDigitalProduct);
    const section = document.querySelector('#collection');
    if (section) {
      const fresh = collection();
      section.replaceWith(fresh);
    }
  } catch (error) {
    if (grid) grid.replaceChildren(node('p', 'empty-products', error.message + ' Check the WooCommerce Store API connection.'));
  }
}

async function start() {
  render();
  try {
    const [categories] = await Promise.all([api.categories()]);
    state.categories = categories;
    await loadProducts();
    state.cart = await api.cart();
    refreshHeader();
  } catch (error) {
    setNotice(error.message + ' Confirm WooCommerce is installed and its Store API is reachable.', 'error');
  }
}

start();
