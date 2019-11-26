var gettingInfo = browser.runtime.getPlatformInfo();
gettingInfo.then(got => {
  if (got.os != "android") {
    function bookmarks(bookmarkToolbar) {
      console.log("Setting up bookmark toolbar", bookmarkToolbar);
      function bookHome(bookmarkItems) {
        if (!bookmarkItems.length) {
          function gotProxyInfo(info) {
            let host = info.value.http.split(":")[0];
            let port = info.value.http.split(":")[1];
            if (port == "7644") {
              var createBookmark = browser.bookmarks.create({
                url: "about:I2p",
                title: "I2P Home Page",
                parentId: bookmarkToolbar[0].id
              });
              createBookmark.then(onCreated);
            } else {
              var createBookmark = browser.bookmarks.create({
                url: browser.runtime.getURL("home.html"),
                title: "I2P Home Page",
                parentId: bookmarkToolbar[0].id
              });
              createBookmark.then(onCreated);
            }
            console.log("(bookmarks) adding home page bookmark");
          }
          console.log(
            "(bookmarks) checking if we're running in an I2P Browser"
          );
          var gettingInfo = browser.proxy.settings.get({});
          gettingInfo.then(gotProxyInfo);
        }
      }
      function bookTorrent(bookmarkItems) {
        if (!bookmarkItems.length) {
          function gotProxyInfo(info) {
            let host = info.value.http.split(":")[0];
            let port = info.value.http.split(":")[1];
            if (port == "7644") {
              var createBookmark = browser.bookmarks.create({
                url: "http://localhost:7647/i2psnark",
                title: "Bittorrent",
                parentId: bookmarkToolbar[0].id
              });
              createBookmark.then(onCreated);
            } else {
              var createBookmark = browser.bookmarks.create({
                url: "http://localhost:7657/i2psnark",
                title: "Bittorrent",
                parentId: bookmarkToolbar[0].id
              });
              createBookmark.then(onCreated);
            }
          }
          console.log(
            "(bookmarks) checking if we're running in an I2P Browser"
          );
          var gettingInfo = browser.proxy.settings.get({});
          gettingInfo.then(gotProxyInfo);
        }
      }
      function bookMail(bookmarkItems) {
        if (!bookmarkItems.length) {
          function gotProxyInfo(info) {
            let host = info.value.http.split(":")[0];
            let port = info.value.http.split(":")[1];
            if (port == "7644") {
              var createBookmark = browser.bookmarks.create({
                url: "http://localhost:7647/webmail",
                title: "Web Mail",
                parentId: bookmarkToolbar[0].id
              });
              createBookmark.then(onCreated);
            } else {
              var createBookmark = browser.bookmarks.create({
                url: "http://localhost:7657/webmail",
                title: "Web Mail",
                parentId: bookmarkToolbar[0].id
              });
              createBookmark.then(onCreated);
            }
            console.log("(bookmarks) adding webmail bookmark");
          }
          console.log(
            "(bookmarks) checking if we're running in an I2P Browser"
          );
          var gettingInfo = browser.proxy.settings.get({});
          gettingInfo.then(gotProxyInfo);
        }
      }
      function bookI2PTunnel(bookmarkItems) {
        if (!bookmarkItems.length) {
          function gotProxyInfo(info) {
            let host = info.value.http.split(":")[0];
            let port = info.value.http.split(":")[1];
            if (port == "7644") {
              var createBookmark = browser.bookmarks.create({
                url: "http://localhost:7647/i2ptunnelmgr",
                title: "Hidden Services Manager",
                parentId: bookmarkToolbar[0].id
              });
              createBookmark.then(onCreated);
            } else {
              var createBookmark = browser.bookmarks.create({
                url: "http://localhost:7657/i2ptunnelmgr",
                title: "Hidden Services Manager",
                parentId: bookmarkToolbar[0].id
              });
              createBookmark.then(onCreated);
            }
            console.log("(bookmarks) adding i2ptunnel bookmark");
          }
          console.log(
            "(bookmarks) checking if we're running in an I2P Browser"
          );
          var gettingInfo = browser.proxy.settings.get({});
          gettingInfo.then(gotProxyInfo);
        }
      }

      function onRejected(error) {
        console.log(`An error: ${error}`);
      }
      function onCreated(node) {
        console.log("Bookmarked", node);
      }

      var b0 = browser.bookmarks.search({
        title: "I2P Home Page"
      });
      b0.then(bookHome, onRejected);

      var b1 = browser.bookmarks.search({
        title: "Bittorrent"
      });
      b1.then(bookTorrent, onRejected);

      var b2 = browser.bookmarks.search({
        title: "Hidden Services Manager"
      });
      b2.then(bookI2PTunnel, onRejected);

      var b3 = browser.bookmarks.search({
        title: "Web Mail"
      });
      b3.then(bookMail, onRejected);
    }

    var bt = browser.bookmarks.search({
      query: "Toolbar"
    });

    bt.then(bookmarks);

    function handleCreated(id, bookmarkInfo) {
      var propValue;
      for (var propName in bookmarkInfo) {
        propValue = bookmarkInfo[propName];
        console.log(propName, propValue);
      }
    }

    browser.bookmarks.onCreated.addListener(handleCreated);
  }
});
