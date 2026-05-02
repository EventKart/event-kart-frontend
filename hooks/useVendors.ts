import { useEffect, useState } from 'react';

import { getAllVendors, getVendor } from '@/lib/api/vendors';
import { MOCK_VENDORS } from '@/lib/mockData';
import type { Vendor, VendorState } from '@/types';

export function useVendors(states: VendorState[] = ['ACTIVE']) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAllVendors(states)
      .then((data) => {
        if (cancelled) return;
        setVendors(data?.length ? data : MOCK_VENDORS);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        console.warn('[useVendors] falling back to mock data', e?.message);
        setVendors(MOCK_VENDORS);
        setError(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [states.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  return { vendors, loading, error };
}

export function useVendor(id: string | undefined) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getVendor(id)
      .then((v) => {
        if (cancelled) return;
        setVendor(v ?? MOCK_VENDORS.find((x) => x.id === id) ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setVendor(MOCK_VENDORS.find((x) => x.id === id) ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { vendor, loading };
}
