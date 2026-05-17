import { useCallback, useEffect, useState } from 'react';

import { getAllVendors, getVendor, getVendorAttributeSchema, searchVendors } from '@/lib/api/vendors';
import { MOCK_VENDORS } from '@/lib/mockData';
import type { Vendor, VendorAttributeField, VendorState, VendorType } from '@/types';

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

export function useSearchVendors(query: string, type: VendorType | null) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const doFetch = useCallback(
    async (q: string, t: VendorType | null, pg: number, append: boolean) => {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      try {
        const result = await searchVendors(q || undefined, t ? [t] : undefined, pg);
        if (append) {
          setVendors((prev) => [...prev, ...result.vendors]);
        } else {
          setVendors(result.vendors.length ? result.vendors : MOCK_VENDORS);
        }
        setTotalPages(result.totalPages > 0 ? result.totalPages : 1);
      } catch {
        if (!append) {
          console.warn('[useSearchVendors] falling back to mock data');
          setVendors(MOCK_VENDORS);
        }
      } finally {
        if (!append) setLoading(false);
        else setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    setPage(1);
    void doFetch(query, type, 1, false);
  }, [query, type, doFetch]);

  const loadMore = useCallback(() => {
    if (page < totalPages && !loadingMore) {
      const next = page + 1;
      setPage(next);
      void doFetch(query, type, next, true);
    }
  }, [page, totalPages, loadingMore, query, type, doFetch]);

  return { vendors, loading, loadingMore, hasMore: page < totalPages, loadMore };
}

export function useVendorAttributeSchema(type: VendorType | null) {
  const [fields, setFields] = useState<VendorAttributeField[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!type) return;
    let cancelled = false;
    setLoading(true);
    getVendorAttributeSchema(type)
      .then((data) => {
        if (cancelled) return;
        setFields(data);
      })
      .catch((e) => {
        if (cancelled) return;
        console.warn('[useVendorAttributeSchema] failed', e?.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type]);

  return { fields, loading };
}
