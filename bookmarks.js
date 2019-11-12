function bookmarks(bookmarkToolbar) {
  console.log("Setting up bookmark toolbar", bookmarkToolbar);
  function bookHome(bookmarkItems) {
    if (!bookmarkItems.length) {
      function checkIBBookmarks(storedSettings) {
        function gotProxyInfo(info) {
          let host = info.value.http.split(":")[0];
          let port = info.value.http.split(":")[1];
          if (port == "7644") {
            var createBookmark = browser.bookmarks.create({
              url: "about:I2p",
              title: "Landing Page",
              parentId: bookmarkToolbar[0].id
            });
            createBookmark.then(onCreated);
          }
        }
        var gettingInfo = browser.proxy.settings.get({});
        gettingInfo.then(gotProxyInfo);
      }
    }
  }
  function bookTorrent(bookmarkItems) {
    if (!bookmarkItems.length) {
      var createBookmark = browser.bookmarks.create({
        url: "http://localhost:7657/torrents",
        title: "Torrents",
        parentId: bookmarkToolbar[0].id
      });
      createBookmark.then(onCreated);
    }
  }
  function bookMail(bookmarkItems) {
    if (!bookmarkItems.length) {
      var createBookmark = browser.bookmarks.create({
        url: "http://localhost:7657/webmail",
        title: "E-Mail",
        parentId: bookmarkToolbar[0].id
      });
      createBookmark.then(onCreated);
    }
  }

  function onRejected(error) {
    console.log(`An error: ${error}`);
  }
  function onCreated(node) {
    console.log("Bookmarked", node);
  }

  var b0 = browser.bookmarks.search({
    title: "Landing Page"
  });
  b0.then(bookHome, onRejected);

  var b1 = browser.bookmarks.search({
    url: "http://localhost:7657/torrents",
    title: "Torrents"
  });
  b1.then(bookTorrent, onRejected);

  var b2 = browser.bookmarks.search({
    url: "http://localhost:7657/webmail",
    title: "E-Mail"
  });
  b2.then(bookMail, onRejected);
}

var bt = browser.bookmarks.search({
  query: "Toolbar"
});

bt.then(bookmarks);

