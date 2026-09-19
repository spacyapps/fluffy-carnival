'use client';

import { useEffect } from 'react';
import { PolarEmbedCheckout } from '@polar-sh/checkout/embed';

/**
 * Wires every [data-polar-checkout] anchor on the page to Polar's embedded
 * overlay instead of a plain navigation. Mount this only when at least one
 * product actually has a checkout URL — a fully "Coming Soon" page never
 * imports Polar's script or touches a third party it isn't using.
 *
 * Runs .init() itself rather than relying on the CDN script's own
 * data-auto-init: this is a client-routed Next.js page, and the bare script
 * only auto-binds once, on its own load — it would miss anchors that exist
 * because of a client-side navigation into this page rather than a full
 * page load.
 *
 * init() only binds to [data-polar-checkout] anchors that exist at the
 * moment it's called — it does no watching of its own. PolarBuyButton adds
 * that attribute a render *after* its own mount (it waits on a
 * matchMedia(pointer:fine) check), so calling init() once here, on mount,
 * can run before any button has actually added the attribute and silently
 * bind to nothing — the anchor then falls back to being a plain link. The
 * observer re-runs init() whenever the DOM changes, which is cheap (init()
 * itself just clears and rebinds one click listener per matching anchor).
 */
export default function PolarInit() {
  useEffect(() => {
    PolarEmbedCheckout.init();
    const observer = new MutationObserver(() => PolarEmbedCheckout.init());
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-polar-checkout'] });
    return () => observer.disconnect();
  }, []);
  return null;
}
