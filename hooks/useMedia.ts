import { useCallback, useEffect, useState } from 'react';

import {
  deleteMedia as apiDelete,
  listMedia,
  uploadMedia,
  type UploadMediaArgs,
} from '@/lib/api/media';
import { MOCK_MEDIA } from '@/lib/mockData';
import type { Media } from '@/types';

interface UseMediaArgs {
  ownerId: string | undefined;
  mediaType?: Media['mediaType'];
}

export function useMedia({ ownerId, mediaType = 'PORTFOLIO' }: UseMediaArgs) {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!ownerId) {
      setItems(MOCK_MEDIA);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await listMedia({ ownerId, mediaType });
      setItems(res.data?.length ? res.data : MOCK_MEDIA);
    } catch {
      setItems(MOCK_MEDIA);
    } finally {
      setLoading(false);
    }
  }, [ownerId, mediaType]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upload = async (args: Omit<UploadMediaArgs, 'ownerId'>) => {
    if (!ownerId) return null;
    try {
      const created = await uploadMedia({ ...args, ownerId, mediaType });
      setItems((prev) => [created, ...prev]);
      return created;
    } catch {
      const local: Media = {
        id: `local-${Date.now()}`,
        name: args.name,
        size: 0,
        mimeType: args.mimeType,
        ownerId,
        mediaType: mediaType as Media['mediaType'],
        tags: args.tags ?? [],
        fileUrl: args.uri,
        thumbnailUrl: args.uri,
        uploadedAt: new Date().toISOString(),
      };
      setItems((prev) => [local, ...prev]);
      return local;
    }
  };

  const remove = async (id: string) => {
    try {
      await apiDelete(id);
    } catch {
      // optimistic remove regardless
    }
    setItems((prev) => prev.filter((m) => m.id !== id));
  };

  return { items, loading, refresh, upload, remove };
}
