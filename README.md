# AVA Storefront + Point of Sale

This repository contains two deliberately separate experiences:

- **Customer storefront:** `/shop.html` — a WooCommerce-powered digital-products shop. See [Digital storefront setup](docs/digital-storefront.md).
- **Point of Sale:** `/` — the existing Puter-backed, offline-first register for in-person retail. Its catalog, checkout, receipts, inventory, refunds and reports remain intact.

The digital storefront reads products and categories from the public WooCommerce Store API, keeps cart state through WooCommerce Cart Tokens, and submits checkout through the Store API. WooCommerce remains authoritative for prices, tax, payment status and protected download delivery. n8n handles approved product automation and verified order events.

## Quick start

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:5174/shop.html` for the digital storefront or `http://localhost:5174/` for the POS.

Set `VITE_WC_STORE_URL` in `.env.local` to the WooCommerce site origin. Set `VITE_WC_PAYMENT_METHOD` to the payment gateway ID configured in WooCommerce. These are public configuration values, not secrets. The initial checkout supports gateways that do not require additional browser tokenization data; gateways such as card processors may require a dedicated adapter. See the setup guide before enabling production checkout.

```bash
npm test
npm run build
npm run preview
```

---

# Point of Sale

A fast, friendly register for small shops. Product catalog, checkout, receipts,
refunds, cash reconciliation, and sales reports, with all data stored in the
user's own [Puter](https://puter.com) cloud. No server of your own, no payment
processor required.

Built with vanilla JavaScript and Vite. No frameworks.

## Features

- **Register**: tap-first product grid with search and category filters, custom
  one-off items, quantity and per-line discounts, order-level discounts (with
  reusable presets), cash payments with change calculation and quick-tender
  buttons, card and other payments recorded manually.
- **Arrange the grid**: a Favorites chip for the tiles a shop pins, and an
  Arrange mode (behind the manager PIN) where tiles are dragged with a finger
  or moved with per-tile arrows for keyboard and screen-reader parity. The
  order is stored per product and applies inside "All" and inside each
  category; "Sort by best-selling" arranges it from the last 30 days of sales
  in one tap. New products land at the end, and the arrangement travels in the
  JSON backup.
- **Barcode scanning**: USB/Bluetooth keyboard-wedge scanners work with no
  setup (a scan is told from typing by its timing), and the camera where
  `BarcodeDetector` exists. An exact SKU rings up hands-free and repeat scans
  bump the quantity; an unknown code offers to create the product with the SKU
  filled in, or to ring it up as a one-off.
- **Product options**: sizes, milks, and extras as option groups with signed
  price deltas, required or optional, single or multi-select. Tapping a product
  with options opens a one-screen picker; identical combinations merge into one
  cart line, and reports still aggregate by base product.
- **Notes**: a note on an item ("no ice", "decaf") from the line editor, and
  a note on the sale ("for Sam", "gift wrap") from the payment sheet. Quick notes
  a shop types once in Settings become one-tap chips over either field. Notes
  are copied onto the receipt, print under their item, appear on the shared
  copy, and are searchable; a line with a note stays its own cart line.
- **Split payments**: settle one sale across several tenders with a live
  remaining balance and a one-tap "rest on card". Change is computed only on
  the cash tender that overshoots.
- **Hold and resume**: park a sale under a name or an automatic label, serve the
  next customer, and pick it back up later. The open cart autosaves too.
- **Offline**: sales complete into a local outbox during network failures and
  sync exactly once when connectivity returns. The register can reopen from a
  cached shell and last-known catalog after an initial online sign-in.
- **Refunds**: return a sale in full or line by line, with the customer owed
  what they paid. Refunds are separate numbered receipts and net out in reports.
- **Loyalty card and store credit**: customer rewards, ledger-backed credit,
  and refund-to-credit support.
- **Cash drawer and stocktake**: opening float, cash movements, closeout,
  counted inventory and movement history.
- **Catalog**: products with price, category, SKU, tax assignment, options and
  optional stock tracking.
- **Cost and profit**: margin calculation, profit reporting and cost snapshots.
- **Taxes and reports**: tax rates, tax-inclusive pricing, reconciliation,
  sales trends, top products and payment breakdowns.
- **Receipts and printing**: numbered receipts, PDF/browser printing, shareable
  receipt images and supported ESC/POS printers.
- **Your data**: JSON backup/restore, CSV imports/exports and automatic restore
  points.
- Light, dark, and system themes. Responsive, app-like layout for desktop,
  tablet, and phone. Keyboard- and screen-reader-friendly.

## Storage design

Everything lives in the signed-in user's Puter account. Small operational data
uses `puter.kv`; growing sales history and restore points use `puter.fs`;
offline outbox and device preferences use `localStorage`.

Receipts store snapshots of names, prices, costs, options, rates and computed
totals, so history survives catalog edits and rate changes.

## Development

```bash
npm run dev        # http://localhost:5174 (real Puter SDK, requires sign-in)
```

For UI work without a Puter account, open `/mock.html` on the dev server. It
installs an in-memory Puter mock persisted to localStorage.

```bash
npm test
npm run build
npm run preview
```

The POS is the root application; the customer storefront is served separately
at `/shop.html`.

## License

This repository, including all its contents, sub-projects, modules, and components, is licensed under [MIT](../../LICENSE) unless explicitly stated otherwise. Third-party libraries included in this repository may be subject to their own licenses.
