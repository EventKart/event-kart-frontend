import { create } from 'zustand';

import type { VendorInput, VendorType } from '@/types';

interface OnboardingState {
  type: VendorType | null;
  name: string;
  email: string;
  contactNumber: string;
  aadhar: string;
  gst: string;
  attributes: Record<string, unknown>;
  set: <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => void;
  setAttribute: (key: string, value: unknown) => void;
  setType: (type: VendorType) => void;
  reset: () => void;
  toVendorInput: () => VendorInput | null;
}

const INITIAL: Omit<OnboardingState, 'set' | 'setAttribute' | 'setType' | 'reset' | 'toVendorInput'> = {
  type: null,
  name: '',
  email: '',
  contactNumber: '',
  aadhar: '',
  gst: '',
  attributes: {},
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...INITIAL,
  set: (key, value) => set({ [key]: value } as Partial<OnboardingState>),
  setAttribute: (key, value) =>
    set((s) => ({ attributes: { ...s.attributes, [key]: value } })),
  setType: (type) => set({ type, attributes: {} }),
  reset: () => set({ ...INITIAL }),
  toVendorInput: () => {
    const s = get();
    if (!s.type) return null;
    const additionalDocs: Record<string, string[]> = {};
    if (s.gst.trim()) additionalDocs.gst = [s.gst.trim()];

    return {
      type: s.type,
      name: s.name.trim(),
      email: s.email.trim(),
      contactNumber: s.contactNumber.trim(),
      documents: {
        aadhar: s.aadhar.trim(),
        ...(Object.keys(additionalDocs).length ? { additionalDocs } : {}),
      },
      attributes: s.attributes,
    };
  },
}));
