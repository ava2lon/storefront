# Digital storefront

The customer storefront is a separate Vite entry point at `/shop.html`. The existing Point of Sale remains at `/` and retains its Puter-backed offline workflow.

## Architecture

- **Frontend:** vanilla JavaScript + Vite; no runtime framework dependency.
- **Catalog, cart and checkout:** WooCommerce Store API (`/wp-json/wc/store/v1`).
- **Payments:** payment methods installed and enabled in WooCommerce. No payment credentials are stored in this frontend.
- **Digital delivery:** WooCommerce downloadable-product permissions and download links; n8n receives order webhooks for downstream automation.
- **Automation:** n8n remains the orchestration layer for product generation/import, order events, customer messaging, reporting and exception handling.

The frontend deliberately filters the public catalog to products marked **Downloadable** or **Virtual** in WooCommerce. Do not expose physical-only listings in the digital collection.

## Local configuration

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local`.
3. Set `VITE_WC_STORE_URL` to the canonical WooCommerce site origin, e.g. `https://shop.example.com`. Leave it blank only when this app is served from the WooCommerce site origin.
4. Run `npm run dev` and open `/shop.html`.

The value is a public site URL, not a secret. Never put WooCommerce REST API consumer keys, gateway secrets, webhook secrets or n8n credentials in Vite variables.

## WooCommerce setup

1. Install and activate WooCommerce on the configured site.
2. Create products and enable **Downloadable** and/or **Virtual**. Add the downloadable files in WooCommerce; keep file access restricted to WooCommerce's protected download mechanism.
3. Configure download limits, expiry, and the order statuses that grant download permissions according to the business policy.
4. Enable at least one payment gateway in WooCommerce. Test its complete checkout flow in sandbox/test mode before production.
5. Configure store currency, tax, privacy, refund and digital-goods policies in WooCommerce.
6. Test guest checkout, a failed payment, a successful payment, a pending/offline payment, an expired download link and a refunded order.

The Store API is public and intended for customer-facing product, cart and checkout features. This frontend uses a per-browser WooCommerce Cart Token for cart and checkout requests. It does not use privileged WooCommerce REST API credentials.

## Gateway compatibility

The Store API checkout endpoint accepts gateway-specific `payment_data`. This initial storefront submits an empty array and follows the gateway's returned redirect URL when one is supplied. It is suitable for gateways that can process this flow without extra browser tokenization data (for example, configured offline methods). Card gateways that require client-side tokenization or gateway-specific fields need a dedicated payment adapter and must not be treated as production-ready until that adapter is implemented and tested with the actual gateway.

## Cross-origin deployment

Prefer serving the storefront from the WooCommerce site origin (same scheme, host and port). If hosted on a different origin, configure WordPress/WooCommerce CORS to allow that exact storefront origin and the required Store API request headers, including `Cart-Token` and `Content-Type`. Do not use wildcard origins with credentials. Test preflight requests and browser cookie/session behavior in the target deployment.

## n8n event contract

Configure WooCommerce webhooks to the n8n webhook URLs using a dedicated webhook secret stored in n8n credentials/configuration, never in frontend code. At minimum subscribe to:

- `product.created`, `product.updated`, `product.deleted`: synchronize approved catalog metadata and availability.
- `order.created`, `order.updated`: ingest order IDs and reconcile authoritative order/payment status through WooCommerce before any delivery action.
- `refund.created`: reconcile refunds and revoke or hold access only according to a documented policy.

Verify WooCommerce webhook signatures, deduplicate by webhook delivery ID (or a stable provider event key), persist the event before processing, and reconcile uncertain outcomes with the WooCommerce API. Never issue a download link or mark an order paid based solely on a browser success screen or unverified webhook payload.

## Validation

- `npm test`: unit tests.
- `npm run build`: production multi-page build (POS + digital storefront).
- Test `/shop.html` against a WooCommerce staging store with downloadable products and sandbox payment methods.
- Test CORS, Cart Token persistence, empty cart, quantity changes, out-of-stock items, coupons (when enabled), tax display, checkout validation, payment redirects and download permissions.

No live store URL, payment gateway, n8n webhook or production credential is configured in this repository.
