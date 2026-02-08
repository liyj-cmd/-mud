export function createSceneAssetLoader({ onAssetReady } = {}) {
  const cache = new Map();

  function hasImageSupport() {
    return typeof Image === "function";
  }

  function ensureEntry(url) {
    if (!isNonEmptyString(url)) {
      return null;
    }

    let entry = cache.get(url);
    if (entry) {
      return entry;
    }

    entry = {
      status: "idle",
      image: null
    };
    cache.set(url, entry);

    if (!hasImageSupport()) {
      entry.status = "unsupported";
      return entry;
    }

    const image = new Image();
    image.decoding = "async";
    entry.status = "loading";
    entry.image = image;

    image.onload = () => {
      entry.status = "ready";
      if (typeof onAssetReady === "function") {
        onAssetReady(url);
      }
    };

    image.onerror = () => {
      entry.status = "error";
      entry.image = null;
    };

    image.src = url;
    return entry;
  }

  function getImage(url) {
    const entry = ensureEntry(url);
    if (!entry || entry.status !== "ready") {
      return null;
    }
    return entry.image;
  }

  function getStatus(url) {
    const entry = ensureEntry(url);
    return entry ? entry.status : "missing";
  }

  function prime(urls = []) {
    for (const url of urls) {
      ensureEntry(url);
    }
  }

  function clear() {
    cache.clear();
  }

  return {
    getImage,
    getStatus,
    prime,
    clear
  };
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
