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
 */
export default function PolarInit() {
  useEffect(() => {
    PolarEmbedCheckout.init();
  }, []);
  return null;
}
