import { gql } from 'graphql-request';

import { userGql } from './graphqlClient';
import type { UpdateUserInput, User } from '@/types';

const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    phoneNumber
    email
    firstName
    lastName
    address
    role
    authProvider
    isVerified
  }
`;

export async function updateUser(input: UpdateUserInput): Promise<User> {
  const mutation = gql`
    ${USER_FRAGMENT}
    mutation UpdateUser($input: UpdateUserInput!) {
      updateUser(input: $input) { ...UserFields }
    }
  `;
  const data = await userGql.request<{ updateUser: User }>(mutation, { input });
  return data.updateUser;
}

export async function getUserById(id: string): Promise<User | null> {
  const query = gql`
    ${USER_FRAGMENT}
    query GetUserById($id: ID!) {
      getUserById(id: $id) { ...UserFields }
    }
  `;
  const data = await userGql.request<{ getUserById: User | null }>(query, { id });
  return data.getUserById;
}
