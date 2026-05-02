import { gql } from 'graphql-request';

import { invitationGql } from './graphqlClient';
import type { Invitation, InvitationInput, InvitationStats, RSVPStatus } from '@/types';

const INVITATION_FRAGMENT = gql`
  fragment InvitationFields on Invitation {
    id
    userId
    title
    description
    date
    location
  }
`;

export async function getInvitationsByUser(): Promise<Invitation[]> {
  const query = gql`
    ${INVITATION_FRAGMENT}
    query GetInvitationsByUser { getInvitationsByUser { ...InvitationFields } }
  `;
  const data = await invitationGql.request<{ getInvitationsByUser: Invitation[] }>(query);
  return data.getInvitationsByUser;
}

export async function getInvitationStats(invitationId: string): Promise<InvitationStats> {
  const query = gql`
    query GetInvitationStats($invitationId: ID!) {
      getInvitationStats(invitationId: $invitationId) {
        invitationId totalSent totalYes totalNo totalMaybe totalNotRsvped
      }
    }
  `;
  const data = await invitationGql.request<{ getInvitationStats: InvitationStats }>(query, { invitationId });
  return data.getInvitationStats;
}

export async function createInvitation(input: InvitationInput): Promise<Invitation> {
  const mutation = gql`
    ${INVITATION_FRAGMENT}
    mutation CreateInvitation($input: InvitationInput!) {
      createInvitation(input: $input) { ...InvitationFields }
    }
  `;
  const data = await invitationGql.request<{ createInvitation: Invitation }>(mutation, { input });
  return data.createInvitation;
}

export async function sendBulkInvites(invitationId: string, emails: string[]): Promise<boolean> {
  const mutation = gql`
    mutation SendBulkInvites($invitationId: ID!, $emails: [String!]!) {
      sendBulkInvites(invitationId: $invitationId, emails: $emails)
    }
  `;
  const data = await invitationGql.request<{ sendBulkInvites: boolean }>(mutation, { invitationId, emails });
  return data.sendBulkInvites;
}

export async function updateRsvp(
  invitationId: string,
  email: string,
  status: RSVPStatus,
): Promise<boolean> {
  const mutation = gql`
    mutation UpdateRsvp($invitationId: ID!, $email: String!, $status: RSVPStatus!) {
      updateRsvp(invitationId: $invitationId, email: $email, status: $status)
    }
  `;
  const data = await invitationGql.request<{ updateRsvp: boolean }>(mutation, { invitationId, email, status });
  return data.updateRsvp;
}
