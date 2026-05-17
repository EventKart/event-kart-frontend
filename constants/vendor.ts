import type { VendorType } from '@/types';

export interface VendorTypeMeta {
  label: string;
  plural: string;
  hero: string;
  thumb: string;
}

export const VENDOR_TYPE_META: Record<VendorType, VendorTypeMeta> = {
  VENUE: {
    label: 'Venue',
    plural: 'Venues',
    hero: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200',
    thumb: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600',
  },
  CATERER: {
    label: 'Caterer',
    plural: 'Caterers',
    hero: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=1200',
    thumb: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600',
  },
  DECORATOR: {
    label: 'Decorator',
    plural: 'Decorators',
    hero: 'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=1200',
    thumb: 'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=600',
  },
  PHOTOGRAPHER: {
    label: 'Photographer',
    plural: 'Photographers',
    hero: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
    thumb: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
  },
  PRIEST: {
    label: 'Priest',
    plural: 'Priests',
    hero: 'https://images.unsplash.com/photo-1604608672516-f1b9b1d1e8d4?w=1200',
    thumb: 'https://images.unsplash.com/photo-1604608672516-f1b9b1d1e8d4?w=600',
  },
  BAND: {
    label: 'Band',
    plural: 'Bands',
    hero: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200',
    thumb: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600',
  },
  MAKEUP_ARTIST: {
    label: 'Makeup Artist',
    plural: 'Makeup Artists',
    hero: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200',
    thumb: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600',
  },
  MEHENDI_ARTIST: {
    label: 'Mehendi Artist',
    plural: 'Mehendi Artists',
    hero: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200',
    thumb: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600',
  },
};

export const VENDOR_TYPES: VendorType[] = [
  'VENUE',
  'CATERER',
  'DECORATOR',
  'PHOTOGRAPHER',
  'PRIEST',
  'BAND',
  'MAKEUP_ARTIST',
  'MEHENDI_ARTIST',
];
