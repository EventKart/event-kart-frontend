import { create } from 'zustand';

import type { VendorInput, VendorType } from '@/types';

interface OnboardingState {
  type: VendorType | null;
  name: string;
  email: string;
  contactNumber: string;
  address: string;
  capacity: string;
  hasParking: boolean;
  cuisines: string;
  providesCutlery: boolean;
  themes: string;
  providesLighting: boolean;
  languages: string;
  religion: string;
  providesDroneShoot: boolean;
  providesVideography: boolean;
  instruments: string;
  numberOfMembers: string;
  aadhar: string;
  gst: string;
  set: <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => void;
  reset: () => void;
  toVendorInput: () => VendorInput | null;
}

const INITIAL: Omit<OnboardingState, 'set' | 'reset' | 'toVendorInput'> = {
  type: null,
  name: '',
  email: '',
  contactNumber: '',
  address: '',
  capacity: '',
  hasParking: false,
  cuisines: '',
  providesCutlery: false,
  themes: '',
  providesLighting: false,
  languages: '',
  religion: '',
  providesDroneShoot: false,
  providesVideography: false,
  instruments: '',
  numberOfMembers: '',
  aadhar: '',
  gst: '',
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...INITIAL,
  set: (key, value) => set({ [key]: value } as Partial<OnboardingState>),
  reset: () => set({ ...INITIAL }),
  toVendorInput: () => {
    const s = get();
    if (!s.type) return null;
    const additionalDocs: Record<string, string[]> = {};
    if (s.gst.trim()) additionalDocs.gst = [s.gst.trim()];

    const base: VendorInput = {
      type: s.type,
      name: s.name.trim(),
      email: s.email.trim(),
      contactNumber: s.contactNumber.trim(),
      documents: {
        aadhar: s.aadhar.trim(),
        ...(Object.keys(additionalDocs).length ? { additionalDocs } : {}),
      },
    };

    switch (s.type) {
      case 'VENUE':
        return {
          ...base,
          address: s.address.trim(),
          capacity: Number(s.capacity) || 0,
          hasParking: s.hasParking,
        };
      case 'CATERER':
        return {
          ...base,
          cuisines: s.cuisines.split(',').map((x) => x.trim()).filter(Boolean),
          providesCutlery: s.providesCutlery,
        };
      case 'DECORATOR':
        return {
          ...base,
          themes: s.themes.split(',').map((x) => x.trim()).filter(Boolean),
          providesLighting: s.providesLighting,
        };
      case 'PRIEST':
        return {
          ...base,
          languages: s.languages.split(',').map((x) => x.trim()).filter(Boolean),
          religion: s.religion.trim(),
        };
      case 'PHOTOGRAPHER':
        return {
          ...base,
          providesDroneShoot: s.providesDroneShoot,
          providesVideography: s.providesVideography,
        };
      case 'BAND':
        return {
          ...base,
          instruments: s.instruments.split(',').map((x) => x.trim()).filter(Boolean),
          numberOfMembers: Number(s.numberOfMembers) || 0,
        };
    }
  },
}));
