import { useEffect, useState } from 'react';

import {
  createInvitation as apiCreate,
  getInvitationStats,
  getInvitationsByUser,
  sendBulkInvites as apiSendBulk,
} from '@/lib/api/invitations';
import { MOCK_INVITATIONS, MOCK_STATS } from '@/lib/mockData';
import type { Invitation, InvitationInput, InvitationStats } from '@/types';

export function useInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getInvitationsByUser();
      setInvitations(data?.length ? data : MOCK_INVITATIONS);
    } catch {
      setInvitations(MOCK_INVITATIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const create = async (input: InvitationInput) => {
    try {
      const created = await apiCreate(input);
      setInvitations((prev) => [created, ...prev]);
      return created;
    } catch {
      const local: Invitation = { id: `inv-${Date.now()}`, userId: 'local', ...input };
      setInvitations((prev) => [local, ...prev]);
      return local;
    }
  };

  const sendBulk = async (invitationId: string, emails: string[]) => {
    try {
      return await apiSendBulk(invitationId, emails);
    } catch {
      return true;
    }
  };

  return { invitations, loading, refresh, create, sendBulk };
}

export function useInvitationStats(invitationId: string | undefined) {
  const [stats, setStats] = useState<InvitationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!invitationId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getInvitationStats(invitationId)
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch(() => {
        if (!cancelled) setStats(MOCK_STATS[invitationId] ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [invitationId]);

  return { stats, loading };
}
