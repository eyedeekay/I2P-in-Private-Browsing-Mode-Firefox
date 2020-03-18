var gettingInfo = browser.runtime.getPlatformInfo();
gettingInfo.then(got => {
  if (got.os != "android") {
    function bookmarks(bookmarkToolbar) {
      console.log("Setting up bookmark toolbar", bookmarkToolbar);
      function bookHome(bookmarkItems) {
        if (!bookmarkItems.length) {
          function gotProxyInfo(info) {
            let port = info.value.http.split(":")[1];
            if (port == "7644") {
              let createRhizomeBookmark = browser.bookmarks.create({
                url: "about:I2p",
                title: "Home Page",
                parentId: bookmarkToolbar[0].id
              });
              createRhizomeBookmark.then(onCreated);
            } else {
              let createBookmark = browser.bookmarks.create({
                url: browser.runtime.getURL("home.html"),
                title: "Home Page",
                parentId: bookmarkToolbar[0].id
              });
              createBookmark.then(onCreated);
            }
            console.log("(bookmarks) adding home page bookmark");
          }
          console.log(
            "(bookmarks) checking if we're running in an I2P Browser"
          );
          let gettingProxyInfo = browser.proxy.settings.get({});
          gettingProxyInfo.then(gotProxyInfo);
        }
      }
      function bookTorrent(bookmarkItems) {
        if (!bookmarkItems.length) {
          function gotProxyInfo(info) {
            let port = info.value.http.split(":")[1];
            if (port == "7644") {
              let createBookmark = browser.bookmarks.create({
                url: "http://localhost:7657/i2psnark",
                title: "Bittorrent",
                parentId: bookmarkToolbar[0].id
              });
              createBookmark.then(onCreated);
            } else {
              let createRhizomeBookmark = browser.bookmarks.create({
                url:
                  "http://" + control_host + ":" + control_port + "/i2psnark",
                title: "Bittorrent",
                parentId: bookmarkToolbar[0].id
              });
              createRhizomeBookmark.then(onCreated);
            }
          }
          console.log(
            "(bookmarks) checking if we're running in an I2P Browser"
          );
          let gettingProxyInfo = browser.proxy.settings.get({});
          gettingProxyInfo.then(gotProxyInfo);
        }
      }
      function bookConsole(bookmarkItems) {
        if (!bookmarkItems.length) {
          function gotProxyInfo(info) {
            let port = info.value.http.split(":")[1];
            if (port == "7644") {
              let createBookmark = browser.bookmarks.create({
                url: "http://localhost:7657/home",
                title: "I2P Console",
                parentId: bookmarkToolbar[0].id
              });
              createBookmark.then(onCreated);
            } else {
              let createRhizomeBookmark = browser.bookmarks.create({
                url:
                  "http://" + control_host + ":" + control_port + "/home",
                title: "I2P Console",
                parentId: bookmarkToolbar[0].id
              });
              createRhizomeBookmark.then(onCreated);
            }
          }
          console.log(
            "(bookmarks) checking if we're running in an I2P Browser"
          );
          let gettingProxyInfo = browser.proxy.settings.get({});
          gettingProxyInfo.then(gotProxyInfo);
        }
      }
      function bookMail(bookmarkItems) {
        if (!bookmarkItems.length) {
          function gotProxyInfo(info) {
            let port = info.value.http.split(":")[1];
            if (port == "7644") {
              let createBookmark = browser.bookmarks.create({
                url: "http://localhost:7657/webmail",
                title: "Web Mail",
                parentId: bookmarkToolbar[0].id
              });
              createBookmark.then(onCreated);
            } else {
              let createRhizomeBookmark = browser.bookmarks.create({
                url: "http://" + control_host + ":" + control_port + "/webmail",
                title: "Web Mail",
                parentId: bookmarkToolbar[0].id
              });
              createRhizomeBookmark.then(onCreated);
            }
            console.log("(bookmarks) adding webmail bookmark");
          }
          console.log(
            "(bookmarks) checking if we're running in an I2P Browser"
          );
          let gettingProxyInfo = browser.proxy.settings.get({});
          gettingProxyInfo.then(gotProxyInfo);
        }
      }
      function bookI2PTunnel(bookmarkItems) {
        if (!bookmarkItems.length) {
          function gotProxyInfo(info) {
            let port = info.value.http.split(":")[1];
            if (port == "7644") {
              var createBookmark = browser.bookmarks.create({
                url: "http://localhost:7657/i2ptunnel",
                title: "Hidden Services Manager",
                parentId: bookmarkToolbar[0].id
              });
              createBookmark.then(onCreated);
            } else {
              var createRhizomeBookmark = browser.bookmarks.create({
                url:
                  "http://" + control_host + ":" + control_port + "/i2ptunnel",
                title: "Hidden Services Manager",
                parentId: bookmarkToolbar[0].id
              });
              createRhizomeBookmark.then(onCreated);
            }
            console.log("(bookmarks) adding i2ptunnel bookmark");
          }
          console.log(
            "(bookmarks) checking if we're running in an I2P Browser"
          );
          var gettingProxyInfo = browser.proxy.settings.get({});
          gettingProxyInfo.then(gotProxyInfo);
        }
      }

      function onRejected(error) {
        console.log(`An error : ${error}`);
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

      var b4 = browser.bookmarks.search({
        title: "I2P Console"
      });
      b4.then(bookConsole, onRejected);

    }

    var bt = browser.bookmarks.search({
      query: "Toolbar"
    });

    bt.then(bookmarks);

    function handleCreated(id, bookmarkInfo) {
      //var propValue;
      for (var propName in bookmarkInfo) {
        let propValue = bookmarkInfo[propName];
        console.log(propName, propValue);
      }
    }

    browser.bookmarks.onCreated.addListener(handleCreated);
  }
});
