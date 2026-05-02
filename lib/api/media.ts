import { mediaClient } from './axiosClient';
import type { Media } from '@/types';

export interface MediaListResponse {
  data: Media[];
  total: number;
}

export interface ListMediaParams {
  ownerId?: string;
  mediaType?: Media['mediaType'];
  tags?: string[];
  limit?: number;
  offset?: number;
}

export async function listMedia(params: ListMediaParams = {}): Promise<MediaListResponse> {
  const { data } = await mediaClient.get<MediaListResponse>('/api/media', { params });
  return data;
}

export async function getMedia(mediaId: string): Promise<Media> {
  const { data } = await mediaClient.get<Media>(`/api/media/${mediaId}`);
  return data;
}

export interface UploadMediaArgs {
  uri: string;
  name: string;
  mimeType: string;
  ownerId: string;
  mediaType?: Media['mediaType'];
  tags?: string[];
}

export async function uploadMedia(args: UploadMediaArgs): Promise<Media> {
  const form = new FormData();
  // React Native's FormData accepts the file-like object signature below.
  // The cast keeps TypeScript happy across web and native.
  form.append('file', {
    uri: args.uri,
    name: args.name,
    type: args.mimeType,
  } as unknown as Blob);
  form.append('ownerId', args.ownerId);
  if (args.mediaType) form.append('mediaType', args.mediaType);
  (args.tags ?? []).forEach((tag) => form.append('tags', tag));

  const { data } = await mediaClient.post<Media>('/api/media/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteMedia(mediaId: string): Promise<void> {
  await mediaClient.delete(`/api/media/${mediaId}`);
}
