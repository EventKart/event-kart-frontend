import { gql } from 'graphql-request';

import { vendorGql } from './graphqlClient';
import type { Vendor, VendorInput, VendorState } from '@/types';

const VENDOR_FRAGMENT = gql`
  fragment VendorFields on Vendor {
    id
    type
    state
    name
    contactNumber
    email
    documents { aadhar }
    ... on Venue { address capacity hasParking }
    ... on Caterer { cuisines providesCutlery }
    ... on Decorator { themes providesLighting }
    ... on Priest { languages religion }
    ... on Photographer { providesDroneShoot providesVideography }
    ... on Band { instruments numberOfMembers }
  }
`;

export async function getAllVendors(states?: VendorState[]): Promise<Vendor[]> {
  const query = gql`
    ${VENDOR_FRAGMENT}
    query GetAllVendors($states: [VendorState!]) {
      getAllVendors(states: $states) { ...VendorFields }
    }
  `;
  const data = await vendorGql.request<{ getAllVendors: Vendor[] }>(query, { states });
  return data.getAllVendors;
}

export async function getVendor(id: string): Promise<Vendor | null> {
  const query = gql`
    ${VENDOR_FRAGMENT}
    query GetVendor($id: ID!) {
      getVendor(id: $id) { ...VendorFields }
    }
  `;
  const data = await vendorGql.request<{ getVendor: Vendor | null }>(query, { id });
  return data.getVendor;
}

export async function createVendor(input: VendorInput): Promise<Vendor> {
  const mutation = gql`
    ${VENDOR_FRAGMENT}
    mutation CreateVendor($input: VendorInput!) {
      createVendor(input: $input) { ...VendorFields }
    }
  `;
  const data = await vendorGql.request<{ createVendor: Vendor }>(mutation, { input });
  return data.createVendor;
}

export async function updateVendor(id: string, input: VendorInput): Promise<Vendor> {
  const mutation = gql`
    ${VENDOR_FRAGMENT}
    mutation UpdateVendor($id: ID!, $input: VendorInput!) {
      updateVendor(id: $id, input: $input) { ...VendorFields }
    }
  `;
  const data = await vendorGql.request<{ updateVendor: Vendor }>(mutation, { id, input });
  return data.updateVendor;
}
