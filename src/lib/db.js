import { derived, get, readonly, writable } from "svelte/store";

/**
 * @typedef {Object} AudioItem
 * @property {string} url
 * @property {string} kana
 * @property {number} voiceId
 * @property {string} voiceName
 */

/**
 * @typedef {Object} Subject
 * @property {string} url
 * @property {number} level
 * @property {string} characters
 * @property {AudioItem[]} audio
 * @property {string[]} readings
 * @property {string} meaning
 * @property {string[]} otherMeanings
 * @property {number | undefined} srsStage
 */

/**
 * @type Promise<IDBDatabase>
 */
const db = new Promise((resolve, reject) => {
  const idb = indexedDB.open("wk-audio");
  idb.onerror = (e) => {
    reject(e);
  };
  idb.onupgradeneeded = () => {
    const db = idb.result;
    db.createObjectStore("wk-audio");
  };
  idb.onsuccess = () => {
    resolve(idb.result);
  };
});

const getObject = async (key) => {
  const store = (await db).transaction("wk-audio").objectStore("wk-audio");
  return await new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const setObject = async (key, value) => {
  const store = (await db)
    .transaction("wk-audio", "readwrite")
    .objectStore("wk-audio");
  return await new Promise((resolve, reject) => {
    const updateRequest = store.put(value, key);
    updateRequest.onsuccess = () => resolve(value);
    updateRequest.onerror = reject;
  });
};

const apiKeyStore = writable(localStorage.getItem("wk-audio.apiKey"));
/**
 * @type import('svelte/store').Writable<{[id: number]: Subject}>
 */
const subjectsStore = writable({});

const fetchSubjects = async (signal, key, result, updatedAfter) => {
  const headers = new Headers({
    "Wanikani-Revision": "20170710",
    Authorization: `Bearer ${key}`,
  });
  let url =
    "https://api.wanikani.com/v2/subjects?types=vocabulary,kana_vocabulary";
  let newUpdated = updatedAfter;
  if (updatedAfter) {
    url += `&updated_after=${updatedAfter}`;
  }
  while (url) {
    const response = await fetch(url, {
      headers,
      signal,
    });
    const json = await response.json();
    url = json.pages.next_url;
    for (const subject of json.data) {
      result[subject.id] = {
        url: subject.data.document_url,
        characters: subject.data.characters,
        level: subject.data.level,
        audio: subject.data.pronunciation_audios.map((item) => ({
          url: item.url,
          kana: item.metadata.pronunciation,
          voiceId: item.metadata.voice_actor_id,
          voiceName: item.metadata.voice_actor_name,
        })),
        readings: subject.data.readings
          ? subject.data.readings.map((r) => r.reading)
          : [subject.data.characters],
        meaning: subject.data.meanings.find((m) => m.primary).meaning,
        otherMeanings: subject.data.meanings
          .filter((m) => !m.primary)
          .map((m) => m.meaning),
      };
    }
    if (json.data_updated_at) {
      newUpdated = json.data_updated_at;
    }
  }
  return newUpdated;
};

const fetchSrsStages = async (signal, key, subjects, updatedAfter) => {
  const headers = new Headers({
    "Wanikani-Revision": "20170710",
    Authorization: `Bearer ${key}`,
  });
  let url =
    "https://api.wanikani.com/v2/assignments?unlocked=true&subject_types=vocabulary,kana_vocabulary";
  let newUpdated = updatedAfter;
  if (updatedAfter) {
    url += `&updated_after=${updatedAfter}`;
  }
  while (url) {
    const response = await fetch(url, {
      headers,
      signal,
    });
    const json = await response.json();
    url = json.pages.next_url;
    for (const asg of json.data) {
      subjects[asg.data.subject_id].srsStage = asg.data.srs_stage;
    }
    if (json.data_updated_at) {
      newUpdated = json.data_updated_at;
    }
  }
  return newUpdated;
};

let abortController = new AbortController();
const getSubjects = async (reset) => {
  try {
    abortController.abort();
    abortController = new AbortController();
    const key = get(apiKeyStore);
    if (!key) {
      return;
    }
    const subjectsUpdated = localStorage.getItem("wk-audio.subjectsUpdated");
    const asgsUpdated = localStorage.getItem("wk-audio.asgsUpdated");
    let result = reset ? {} : (await getObject("subjects")) || {};
    const newSubjectsUpdated = await fetchSubjects(
      abortController.signal,
      key,
      result,
      subjectsUpdated
    );
    const newAsgsUpdated = await fetchSrsStages(
      abortController.signal,
      key,
      result,
      asgsUpdated
    );
    localStorage.setItem("wk-audio.subjectsUpdated", newSubjectsUpdated);
    localStorage.setItem("wk-audio.asgsUpdated", newAsgsUpdated);
    setObject("subjects", result);
    subjectsStore.set(result);
  } catch (e) {
    console.error(e);
  }
};

export const apiKey = {
  subscribe: apiKeyStore.subscribe,
  set: (newKey) => {
    localStorage.setItem("wk-audio.apiKey", newKey);
    apiKeyStore.set(newKey);
    getSubjects(true);
  },
};

getSubjects(false);

export const subjects = readonly(subjectsStore);

export const currentSubjectsByLevel = derived(subjects, ($subjects) => {
  /** @type {{[level: number]: Subject[]}} */
  const result = {};
  for (const s of Object.values($subjects)) {
    if (s.srsStage === undefined || s.srsStage < 1 || s.audio.length === 0) {
      continue;
    }
    if (!(s.level in result)) {
      result[s.level] = [];
    }
    result[s.level].push(s);
  }
  for (const subjects of Object.values(result)) {
    subjects.sort((a, b) => a.srsStage - b.srsStage);
  }
  return result;
});

export const voices = derived(subjects, ($subjects) => {
  /** @type {{[id: number]: string}} */
  const result = {};
  for (const s of Object.values($subjects)) {
    for (const a of s.audio) {
      result[a.voiceId] = a.voiceName;
    }
  }
  return Object.entries(result).map(([id, name]) => ({
    id: parseInt(id),
    name,
  }));
});

const sv = localStorage.getItem("wk-audio.selectedVoice");
export const selectedVoice = writable(sv ? parseInt(sv, 10) : 1);
selectedVoice.subscribe(($selectedVoice) => {
  localStorage.setItem("wk-audio.selectedVoice", $selectedVoice.toString());
});
