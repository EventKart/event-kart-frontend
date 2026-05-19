import { gql } from 'graphql-request';

import { vendorGql } from './graphqlClient';
import type { Vendor, VendorAttributeField, VendorInput, VendorState, VendorType } from '@/types';

export interface SearchVendorsResult {
  vendors: Vendor[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

const VENDOR_FRAGMENT = gql`
  fragment VendorFields on Vendor {
    id
    type
    state
    name
    contactNumber
    email
    documents { aadhar }
    attributes
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

export async function searchVendors(
  query?: string,
  types?: VendorType[],
  page = 1,
  pageSize = 30
): Promise<SearchVendorsResult> {
  const q = gql`
    ${VENDOR_FRAGMENT}
    query SearchVendors($query: String, $types: [VendorType!], $page: Int, $pageSize: Int) {
      searchVendors(query: $query, types: $types, page: $page, pageSize: $pageSize) {
        vendors { ...VendorFields }
        page
        pageSize
        totalItems
        totalPages
      }
    }
  `;
  const data = await vendorGql.request<{ searchVendors: SearchVendorsResult }>(q, {
    query,
    types,
    page,
    pageSize,
  });
  return data.searchVendors;
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

export async function getVendorAttributeSchema(type: VendorType): Promise<VendorAttributeField[]> {
  const query = gql`
    query VendorAttributeSchema($type: VendorType!) {
      vendorAttributeSchema(type: $type) {
        key
        type
        required
        label
      }
    }
  `;
  const data = await vendorGql.request<{ vendorAttributeSchema: VendorAttributeField[] }>(query, { type });
  return data.vendorAttributeSchema;
}

export async function getVendorTypes(): Promise<VendorType[]> {
  const query = gql`
    query VendorTypes {
      vendorTypes
    }
  `;
  const data = await vendorGql.request<{ vendorTypes: VendorType[] }>(query);
  return data.vendorTypes;
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
