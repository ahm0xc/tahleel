import { File, Paths } from "expo-file-system";

import { type ReciterId } from "~/constants/reciters";

import { getRecitationUrl } from "./recitation";

const PREVIEW_CHAPTER = 1;
const PREVIEW_VERSE = 1;

const cachedFiles = new Map<ReciterId, File>();
const pendingDownloads = new Map<ReciterId, Promise<File | null>>();

function previewFile(reciterId: ReciterId) {
  return new File(Paths.cache, `reciter-preview-${reciterId}.mp3`);
}

function stagingFile(reciterId: ReciterId) {
  return new File(Paths.cache, `reciter-preview-${reciterId}.mp3.part`);
}

export function getPreviewSourceUri(reciterId: ReciterId): string {
  const file = cachedFiles.get(reciterId) ?? previewFile(reciterId);

  if (file.exists) {
    cachedFiles.set(reciterId, file);
    return file.uri;
  }

  void cachePreview(reciterId);

  return getRecitationUrl(reciterId, PREVIEW_CHAPTER, PREVIEW_VERSE);
}

export function preloadReciterPreviews(reciterIds: readonly ReciterId[]) {
  for (const reciterId of reciterIds) {
    void cachePreview(reciterId);
  }
}

function cachePreview(reciterId: ReciterId): Promise<File | null> {
  const cached = cachedFiles.get(reciterId);

  if (cached?.exists) {
    return Promise.resolve(cached);
  }

  const pending = pendingDownloads.get(reciterId);

  if (pending) {
    return pending;
  }

  const file = previewFile(reciterId);

  if (file.exists) {
    cachedFiles.set(reciterId, file);
    return Promise.resolve(file);
  }

  const staging = stagingFile(reciterId);

  if (staging.exists) {
    staging.delete();
  }

  const download = File.downloadFileAsync(
    getRecitationUrl(reciterId, PREVIEW_CHAPTER, PREVIEW_VERSE),
    staging,
    { idempotent: true }
  )
    .then(async (downloaded) => {
      await downloaded.move(file, { overwrite: true });
      cachedFiles.set(reciterId, file);
      return file;
    })
    .catch(() => {
      if (file.exists) {
        file.delete();
      }

      if (staging.exists) {
        staging.delete();
      }

      return null;
    })
    .finally(() => {
      pendingDownloads.delete(reciterId);
    });

  pendingDownloads.set(reciterId, download);

  return download;
}
