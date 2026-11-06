import {
  type AudioPlaylist,
  type AudioPlaylistStatus,
  type AudioSource,
  createAudioPlayer,
  createAudioPlaylist,
  setAudioModeAsync,
  setIsAudioActiveAsync,
} from "expo-audio";

import { type RecitationMode } from "~/constants/recitation";
import { type ReciterId } from "~/constants/reciters";
import { getArabicScript } from "~/constants/scripts";
import { usePreferences } from "~/store/preferences-store";
import {
  type RecitationTarget,
  isSameTarget,
  useRecitation,
} from "~/store/recitation-store";

import { getEditionChapter } from "./edition-data";
import { getRecitationUrl } from "./recitation";
import { getPreviewSourceUri } from "./reciter-preview";

const STATUS_UPDATE_INTERVAL = 500;
const LOAD_TIMEOUT_MS = 20_000;

const previewPlayer = createAudioPlayer(null, {
  updateInterval: STATUS_UPDATE_INTERVAL,
});

let recitationPlaylist: AudioPlaylist | null = null;
let recitationQueue: RecitationTarget[] = [];
let playbackRequest = 0;
let loadTimeout: ReturnType<typeof setTimeout> | null = null;
let hasConfiguredAudio = false;
let hasHandledFinish = false;

previewPlayer.addListener("playbackStatusUpdate", (status) => {
  const recitation = useRecitation.getState();
  const preview = recitation.preview;

  if (preview === null) {
    return;
  }

  if (status.error !== null) {
    stopRecitation();
    return;
  }

  if (status.didJustFinish) {
    previewPlayer.pause();
    recitation.setPreview(null);
    return;
  }

  if (!status.isLoaded) {
    if (preview.phase !== "loading") {
      recitation.setPreview({ ...preview, phase: "loading" });
    }

    return;
  }

  clearLoadTimeout();

  if (status.playing && preview.phase !== "playing") {
    recitation.setPreview({ ...preview, phase: "playing" });
  }
});

export function playVerse(target: RecitationTarget) {
  startRecitation(target);
}

export function playReciterPreview(reciterId: ReciterId) {
  const request = beginPlayback();
  const uri = getPreviewSourceUri(reciterId);

  useRecitation.getState().reset();
  useRecitation.getState().setPreview({ phase: "loading", reciterId });

  void startPreviewPlayback(request, uri);
}

export function stopRecitation() {
  beginPlayback();
  useRecitation.getState().reset();
}

export function toggleRecitation(target: RecitationTarget) {
  const { current } = useRecitation.getState();

  if (isSameTarget(current, target)) {
    stopRecitation();
    return;
  }

  playVerse(target);
}

function startRecitation(target: RecitationTarget) {
  const request = beginPlayback();
  const mode = usePreferences.getState().recitationMode;
  const queue = buildQueue(target, mode);
  const recitation = useRecitation.getState();

  recitation.setPreview(null);
  recitation.setCurrent(target);

  void startRecitationPlayback(request, queue);
}

function beginPlayback() {
  playbackRequest += 1;

  clearLoadTimeout();
  stopPlaylist();
  previewPlayer.pause();
  hasHandledFinish = false;

  return playbackRequest;
}

function buildQueue(
  target: RecitationTarget,
  mode: RecitationMode
): RecitationTarget[] {
  if (mode === "once") {
    return [target];
  }

  const verses = getEditionChapter(
    getArabicScript(usePreferences.getState().scriptId).editionId,
    target.chapterNumber
  );
  const lastVerse = verses.at(-1)?.verse ?? target.verseNumber;
  const queue: RecitationTarget[] = [];

  for (
    let verseNumber = target.verseNumber;
    verseNumber <= lastVerse;
    verseNumber++
  ) {
    queue.push({ chapterNumber: target.chapterNumber, verseNumber });
  }

  return queue.length > 0 ? queue : [target];
}

function toSources(
  queue: RecitationTarget[],
  reciterId: ReciterId
): AudioSource[] {
  return queue.map(({ chapterNumber, verseNumber }) => ({
    uri: getRecitationUrl(reciterId, chapterNumber, verseNumber),
  }));
}

async function startRecitationPlayback(
  request: number,
  targetQueue: RecitationTarget[]
) {
  const reciterId = usePreferences.getState().reciterId;
  const sources = toSources(targetQueue, reciterId);

  if (!(await prepareAudio(request))) {
    return;
  }

  try {
    const playlist = createAudioPlaylist({
      sources,
      updateInterval: STATUS_UPDATE_INTERVAL,
      loop: "none",
    });

    recitationPlaylist = playlist;
    recitationQueue = targetQueue;

    playlist.addListener("playlistStatusUpdate", (status) => {
      handlePlaylistStatus(request, status);
    });
    playlist.addListener("trackChanged", ({ currentIndex }) => {
      handleTrackChanged(request, currentIndex);
    });

    playlist.play();
    handlePlaylistStatus(request, playlist.currentStatus);
  } catch {
    if (request === playbackRequest) {
      stopRecitation();
    }
  }
}

async function startPreviewPlayback(request: number, uri: string) {
  if (!(await prepareAudio(request))) {
    return;
  }

  try {
    previewPlayer.replace({ uri });
    previewPlayer.play();
  } catch {
    if (request === playbackRequest) {
      stopRecitation();
    }
  }
}

function handlePlaylistStatus(request: number, status: AudioPlaylistStatus) {
  if (request !== playbackRequest) {
    return;
  }

  if ((status as { error?: unknown }).error != null) {
    stopRecitation();
    return;
  }

  syncCurrentTrack(request, status.currentIndex);

  const recitation = useRecitation.getState();

  if (recitation.current === null) {
    return;
  }

  if (status.didJustFinish && !hasHandledFinish) {
    hasHandledFinish = true;
    stopRecitation();
    return;
  }

  if (!status.isLoaded) {
    if (!recitation.isLoading) {
      recitation.setLoading(true);
    }

    return;
  }

  clearLoadTimeout();

  if (recitation.isLoading) {
    recitation.setLoading(false);
  }
}

function handleTrackChanged(request: number, index: number) {
  if (request !== playbackRequest) {
    return;
  }

  syncCurrentTrack(request, index);
}

function syncCurrentTrack(request: number, index: number) {
  const target = recitationQueue[index];

  if (
    target === undefined ||
    isSameTarget(useRecitation.getState().current, target)
  ) {
    return;
  }

  armLoadTimeout(request);
  useRecitation.getState().setCurrent(target);
  useRecitation.getState().follow(target);
}

function stopPlaylist() {
  const playlist = recitationPlaylist;

  recitationPlaylist = null;
  recitationQueue = [];

  if (playlist === null) {
    return;
  }

  playlist.pause();
  playlist.clear();
  playlist.destroy();
}

async function prepareAudio(request: number) {
  armLoadTimeout(request);

  await configureAudio();

  if (request !== playbackRequest) {
    return false;
  }

  try {
    await setIsAudioActiveAsync(true);
  } catch {
    if (request === playbackRequest) {
      stopRecitation();
    }

    return false;
  }

  return request === playbackRequest;
}

function clearLoadTimeout() {
  if (loadTimeout === null) {
    return;
  }

  clearTimeout(loadTimeout);
  loadTimeout = null;
}

function armLoadTimeout(request: number) {
  clearLoadTimeout();
  loadTimeout = setTimeout(() => {
    loadTimeout = null;

    if (request === playbackRequest) {
      stopRecitation();
    }
  }, LOAD_TIMEOUT_MS);
}

async function configureAudio() {
  if (hasConfiguredAudio) {
    return;
  }

  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "doNotMix",
    });
    hasConfiguredAudio = true;
  } catch {
    // Playback still works without the preferred audio mode; retry next time.
  }
}
