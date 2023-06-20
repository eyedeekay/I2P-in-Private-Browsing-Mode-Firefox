async function createI2PToolbar(bookmarkToolbar) {
  const ibbt = await browser.bookmarks.search("I2P Toolbar");

  async function onToolbarCreated(node) {
    const ibt = await browser.bookmarks.search("I2P Toolbar");
    await bookmarks(ibt[0]);
  }

  async function setupDir(ibbt) {
    if (!ibbt.length) {
      const createBookmark = await browser.bookmarks.create({
        title: "I2P Toolbar",
        parentId: bookmarkToolbar.id,
      });
      await onToolbarCreated(createBookmark);
    }
  }

  await setupDir(ibbt);
}

async function bookmarks(bookmarkToolbar) {
  const controlHost = control_host();
  const controlPort = control_port();

  async function createBookmark({ url, title, parentId }) {
    const createRhizomeBookmark = await browser.bookmarks.create({
      url,
      title,
      parentId,
    });
    console.log("Bookmarked", createRhizomeBookmark);
  }

  async function createHomeBookmark() {
    const bookmarkItems = await browser.bookmarks.search({
      title: "I2P Extension Home Page",
    });
    if (!bookmarkItems.length) {
      await createBookmark({
        url: browser.runtime.getURL("home.html"),
        title: "I2P Extension Home Page",
        parentId: bookmarkToolbar.id,
      });
    }
  }

  async function createTorrentBookmark() {
    const bookmarkItems = await browser.bookmarks.search({
      title: "Bittorrent",
    });
    if (!bookmarkItems.length) {
      await createBookmark({
        url: `http://${controlHost}:${controlPort}/i2psnark`,
        title: "Bittorrent",
        parentId: bookmarkToolbar.id,
      });
    }
  }

  async function createConsoleBookmark() {
    const bookmarkItems = await browser.bookmarks.search({
      title: "I2P Console",
    });
    if (!bookmarkItems.length) {
      await createBookmark({
        url: `http://${controlHost}:${controlPort}/home`,
        title: "I2P Console",
        parentId: bookmarkToolbar.id,
      });
    }
  }

  async function createMailBookmark() {
    const bookmarkItems = await browser.bookmarks.search({
      title: "Web Mail",
    });
    if (!bookmarkItems.length) {
      await createBookmark({
        url: `http://${controlHost}:${controlPort}/webmail`,
        title: "Web Mail",
        parentId: bookmarkToolbar.id,
      });
    }
  }

  async function createI2PTunnelBookmark() {
    const bookmarkItems = await browser.bookmarks.search({
      title: "Hidden Services Manager",
    });
    if (!bookmarkItems.length) {
      await createBookmark({
        url: `http://${controlHost}:${controlPort}/i2ptunnel`,
        title: "Hidden Services Manager",
        parentId: bookmarkToolbar.id,
      });
    }
  }

  await createHomeBookmark();
  await createTorrentBookmark();
  await createI2PTunnelBookmark();
  await createMailBookmark();
  await createConsoleBookmark();

  defaultSettings.bookmarks_state = true;
}

async function bookmarksSetup() {
  const gettingInfo = await browser.runtime.getPlatformInfo();
  if (gettingInfo.os === "android") {
    return;
  }

  const bookmarkToolbar = await browser.bookmarks.search({
    query: "Toolbar",
  });

  await createI2PToolbar(bookmarkToolbar[0]);
}

function conditionalBookmarksSetup(obj) {
  console.log("(bookmarks) state", obj.bookmarks_state);
  if (obj.bookmarks_state == false) {
    bookmarksSetup();
  }
  if (obj.bookmarks_state == undefined) {
    bookmarksSetup();
  }
}

if (browser != null) {
  if (browser.windows != undefined) {
    let gettingStorage = browser.storage.local.get("bookmarks_state");
    gettingStorage.then(conditionalBookmarksSetup, bookmarksSetup);
  }
}

const bookmarksButton = document.getElementById("bookmarksButton");
if (bookmarksButton != null) {
  bookmarksButton.addEventListener("click", bookmarksSetup);
}
