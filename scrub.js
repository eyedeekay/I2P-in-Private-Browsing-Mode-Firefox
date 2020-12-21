var titlepref = chrome.i18n.getMessage('titlePreface');
var webpref = chrome.i18n.getMessage('webPreface');
var routerpref = chrome.i18n.getMessage('routerPreface');
var mailpref = chrome.i18n.getMessage('mailPreface');
var torrentpref = chrome.i18n.getMessage('torrentPreface');
var tunnelpref = chrome.i18n.getMessage('i2ptunnelPreface');
var ircpref = chrome.i18n.getMessage('ircPreface');
var extensionpref = chrome.i18n.getMessage('extensionPreface');
var muwirepref = chrome.i18n.getMessage('muwirePreface');
var botepref = chrome.i18n.getMessage('botePreface');

var contextScrub = async function(requestDetails) {
  function onHeaderError() {
    console.log('Header scrub error');
  }
  try {
    var headerScrub = function(context) {
      var ua = 'MYOB/6.66 (AN/ON)';
      if (!context) {
      } else if (context.name == titlepref) {
        for (var header of requestDetails.requestHeaders) {
          if (header.name.toLowerCase() === 'user-agent') {
            header.value = ua;
          }
        }
        return {
          requestHeaders: requestDetails.requestHeaders,
        };
      }
    };
    var contextGet = async function(tabInfo) {
      try {
        //console.log("(scrub)Tab info from Function", tabInfo);
        let context = await browser.contextualIdentities.get(
          tabInfo.cookieStoreId
        );
        return context;
      } catch (error) {
        return undefined;
      }
    };
    var tabGet = async function(tabId) {
      try {
        //console.log("(scrub)Tab ID from Request", tabId);
        let tabInfo = await browser.tabs.get(tabId);
        return tabInfo;
      } catch (error) {
        return undefined;
      }
    };
    if (requestDetails.tabId > 0) {
      tab = tabGet(requestDetails.tabId);
      context = tab.then(contextGet, onHeaderError);
      req = context.then(headerScrub, onHeaderError);
      //console.log("(scrub)Scrubbing I2P Request", req);
      return req;
    }
  } catch (error) {
    console.log('(scrub)Not scrubbing non-I2P request.', error);
  }
}

var notMyContextNotMyProblem = async function() {
  var contexts = await browser.contextualIdentities.query({});
  var context1 = await browser.contextualIdentities.query({
    name: titlepref,
  });
  var context2 = await browser.contextualIdentities.query({
    name: routerpref,
  });
  var context3 = await browser.contextualIdentities.query({
    name: mailpref,
  });
  var context4 = await browser.contextualIdentities.query({
    name: torrentpref,
  });
  var context5 = await browser.contextualIdentities.query({
    name: tunnelpref,
  });
  var context6 = await browser.contextualIdentities.query({
    name: ircpref,
  });
  var context7 = await browser.contextualIdentities.query({
    name: muwirepref,
  });
  var context7 = await browser.contextualIdentities.query({
    name: botepref,
  });
  var othercontexts = [];
  console.log('Contexts:', contexts);
  for (context in contexts) {
    if (
      contexts[context].cookieStoreId == context1[0].cookieStoreId ||
      contexts[context].cookieStoreId == context2[0].cookieStoreId ||
      contexts[context].cookieStoreId == context3[0].cookieStoreId ||
      contexts[context].cookieStoreId == context4[0].cookieStoreId ||
      contexts[context].cookieStoreId == context5[0].cookieStoreId ||
      contexts[context].cookieStoreId == context6[0].cookieStoreId ||
      contexts[context].cookieStoreId == context7[0].cookieStoreId
    ) {
      console.log(
        'Context found',
        contexts[context].cookieStoreId,
        'is my responsibility'
      );
    } else {
      //console.log("Context found", contexts[context].cookieStoreId, "is not my responsibility")
      othercontexts.push(contexts[context]);
    }
  }
  return othercontexts;
}

var contextSetup = function(requestDetails) {
  function onContextError() {
    console.log('Context launcher error');
  }
  //console.log("(isolate)Forcing I2P requests into context");
  try {
    var i2pTabFind = async function(tabId) {
      try {
        var context = await browser.contextualIdentities.query({
          name: titlepref,
        });
        if (tabId.cookieStoreId != context[0].cookieStoreId) {
          function Create() {
            function onCreated(tab) {
              function closeOldTab() {
                if (tabId.id != tab.id) {
                  console.log('(isolate) Closing un-isolated tab', tabId.id);
                  console.log('in favor of', tab.id);
                  console.log('with context', tab.cookieStoreId);
                  browser.tabs.remove(tabId.id);
                }
                browser.pageAction.setPopup({
                  tabId: tabId.id,
                  popup: 'security.html',
                });
                browser.pageAction.show(tabId.id);
              }
              closeOldTab(tab);
            }
            var created = browser.tabs.create({
              active: true,
              cookieStoreId: context[0].cookieStoreId,
              url: requestDetails.url,
            });
            created.then(onCreated, onContextError);
          }
          var gettab = browser.tabs.get(tabId.id);
          gettab.then(Create, onContextError);
          return tabId;
        }
      } catch (error) {
        console.log('(isolate)Context Error', error);
      }
    };
    var routerTabFind = async function(tabId) {
      try {
        var context = await browser.contextualIdentities.query({
          name: routerpref,
        });
        if (tabId.cookieStoreId != context[0].cookieStoreId) {
          function Create() {
            function onCreated(tab) {
              function closeOldTab(tabs) {
                if (tabId.id != tab.id) {
                  console.log('(isolate) Closing un-isolated tab', tabId.id);
                  console.log('in favor of', tab.id);
                  console.log('with context', tab.cookieStoreId);
                  browser.tabs.remove(tabId.id);
                  browser.tabs.move(tab.id, { index: 0 });
                }
                for (index = 0; index < tabs.length; index++) {
                  if (index != tabs.length - 1)
                    browser.tabs.remove(tabs[index].id);
                }
              }
              var pins = browser.tabs.query({
                cookieStoreId: context[0].cookieStoreId,
              });
              pins.then(closeOldTab, onError);
            }
            if (requestDetails.url.endsWith('xhr1.html')) {
              hostname = url.split('/')[2];
              let prefix = url.substr(0, url.indexOf('://') + 3);
              requestDetails.url = prefix + hostname + '/home';
            }
            var created = browser.tabs.create({
              active: true,
              pinned: true,
              cookieStoreId: context[0].cookieStoreId,
              url: requestDetails.url,
            });
            created.then(onCreated, onContextError);
          }
          var gettab = browser.tabs.get(tabId.id);
          gettab.then(Create, onContextError);
          return tabId;
        }
      } catch (error) {
        console.log('(isolate)Context Error', error);
      }
    };
    var i2ptunnelTabFind = async function(tabId) {
      try {
        var context = await browser.contextualIdentities.query({
          name: tunnelpref,
        });
        if (tabId.cookieStoreId != context[0].cookieStoreId) {
          function Create() {
            function onCreated(tab) {
              function closeOldTab(tabs) {
                if (tabId.id != tab.id) {
                  console.log('(isolate) Closing un-isolated tab', tabId.id);
                  console.log('in favor of', tab.id);
                  console.log('with context', tab.cookieStoreId);
                  browser.tabs.remove(tabId.id);
                  browser.tabs.move(tab.id, { index: 0 });
                }
                for (index = 0; index < tabs.length; index++) {
                  if (index != tabs.length - 1)
                    browser.tabs.remove(tabs[index].id);
                }
              }
              var pins = browser.tabs.query({
                cookieStoreId: context[0].cookieStoreId,
              });
              pins.then(closeOldTab, onError);
            }
            if (requestDetails.url.endsWith('xhr1.html')) {
              hostname = url.split('/')[2];
              let prefix = url.substr(0, url.indexOf('://') + 3);
              requestDetails.url = prefix + hostname + '/i2ptunnelmgr/';
            }
            var created = browser.tabs.create({
              active: true,
              pinned: true,
              cookieStoreId: context[0].cookieStoreId,
              url: requestDetails.url,
            });
            created.then(onCreated, onContextError);
          }
          var gettab = browser.tabs.get(tabId.id);
          gettab.then(Create, onContextError);
          return tabId;
        }
      } catch (error) {
        console.log('(isolate)Context Error', error);
      }
    };
    var snarkTabFind = async function(tabId) {
      try {
        var context = await browser.contextualIdentities.query({
          name: torrentpref,
        });
        if (tabId.cookieStoreId != context[0].cookieStoreId) {
          var exemptContext = await browser.contextualIdentities.query({
            name: titlepref,
          });
          let tmp = new URL(tabId.url);
          console.log('(isolate)tabid host', tmp.host);
          if (!requestDetails.url.includes('snark/' + tmp.host)) {
            //          if (tabId.cookieStoreId != exemptContext[0].cookieStoreId){
            function Create() {
              function onCreated(tab) {
                function closeOldTab(tabs) {
                  if (tabId.id != tab.id) {
                    console.log('(isolate) Closing un-isolated tab', tabId.id);
                    console.log('in favor of', tab.id);
                    console.log('with context', tab.cookieStoreId);
                    browser.tabs.remove(tabId.id);
                    browser.tabs.move(tab.id, { index: 0 });
                  }
                  for (index = 0; index < tabs.length; index++) {
                    if (index != tabs.length - 1)
                      browser.tabs.remove(tabs[index].id);
                  }
                }
                var pins = browser.tabs.query({
                  cookieStoreId: context[0].cookieStoreId,
                });
                pins.then(closeOldTab, onError);
              }
              if (requestDetails.url.endsWith('xhr1.html')) {
                hostname = url.split('/')[2];
                let prefix = url.substr(0, url.indexOf('://') + 3);
                requestDetails.url = prefix + hostname + '/i2psnark/';
              }
              var created = browser.tabs.create({
                active: true,
                pinned: true,
                cookieStoreId: context[0].cookieStoreId,
                url: requestDetails.url,
              });
              created.then(onCreated, onContextError);
            }
            var gettab = browser.tabs.get(tabId.id);
            gettab.then(Create, onContextError);
            return tabId;
          }
        }
      } catch (error) {
        console.log('(isolate)Context Error', error);
      }
    };
    var muwireTabFind = async function(tabId) {
      try {
        var context = await browser.contextualIdentities.query({
          name: muwirepref,
        });
        if (tabId.cookieStoreId != context[0].cookieStoreId) {
          function Create() {
            function onCreated(tab) {
              function closeOldTab(tabs) {
                if (tabId.id != tab.id) {
                  console.log('(isolate) Closing un-isolated tab', tabId.id);
                  console.log('in favor of', tab.id);
                  console.log('with context', tab.cookieStoreId);
                  browser.tabs.remove(tabId.id);
                  browser.tabs.move(tab.id, { index: 0 });
                }
                for (index = 0; index < tabs.length; index++) {
                  if (index != tabs.length - 1)
                    browser.tabs.remove(tabs[index].id);
                }
              }
              var pins = browser.tabs.query({
                cookieStoreId: context[0].cookieStoreId,
              });
              pins.then(closeOldTab, onError);
            }
            if (requestDetails.url.endsWith('xhr1.html')) {
              hostname = url.split('/')[2];
              let prefix = url.substr(0, url.indexOf('://') + 3);
              requestDetails.url = prefix + hostname + '/muwire/';
            }
            var created = browser.tabs.create({
              active: true,
              pinned: true,
              cookieStoreId: context[0].cookieStoreId,
              url: requestDetails.url,
            });
            created.then(onCreated, onContextError);
          }
          var gettab = browser.tabs.get(tabId.id);
          gettab.then(Create, onContextError);
          return tabId;
        }
      } catch (error) {
        console.log('(isolate)Context Error', error);
      }
    };
    var i2pboteTabFind = async function(tabId) {
      try {
        var context = await browser.contextualIdentities.query({
          name: botepref,
        });
        if (tabId.cookieStoreId != context[0].cookieStoreId) {
          function Create() {
            function onCreated(tab) {
              function closeOldTab(tabs) {
                if (tabId.id != tab.id) {
                  console.log('(isolate) Closing un-isolated tab', tabId.id);
                  console.log('in favor of', tab.id);
                  console.log('with context', tab.cookieStoreId);
                  browser.tabs.remove(tabId.id);
                  browser.tabs.move(tab.id, { index: 0 });
                }
                for (index = 0; index < tabs.length; index++) {
                  if (index != tabs.length - 1)
                    browser.tabs.remove(tabs[index].id);
                }
              }
              var pins = browser.tabs.query({
                cookieStoreId: context[0].cookieStoreId,
              });
              pins.then(closeOldTab, onError);
            }
            if (requestDetails.url.endsWith('xhr1.html')) {
              hostname = url.split('/')[2];
              let prefix = url.substr(0, url.indexOf('://') + 3);
              requestDetails.url = prefix + hostname + '/i2pbote/';
            }
            var created = browser.tabs.create({
              active: true,
              pinned: true,
              cookieStoreId: context[0].cookieStoreId,
              url: requestDetails.url,
            });
            created.then(onCreated, onContextError);
          }
          var gettab = browser.tabs.get(tabId.id);
          gettab.then(Create, onContextError);
          return tabId;
        }
      } catch (error) {
        console.log('(isolate)Context Error', error);
      }
    };
    var mailTabFind = async function(tabId) {
      try {
        var context = await browser.contextualIdentities.query({
          name: mailpref,
        });
        if (tabId.cookieStoreId != context[0].cookieStoreId) {
          function Create() {
            function onCreated(tab) {
              function closeOldTab(tabs) {
                if (tabId.id != tab.id) {
                  console.log('(isolate) Closing un-isolated tab', tabId.id);
                  console.log('in favor of', tab.id);
                  console.log('with context', tab.cookieStoreId);
                  browser.tabs.remove(tabId.id);
                  browser.tabs.move(tab.id, { index: 0 });
                }
                for (index = 0; index < tabs.length; index++) {
                  if (index != tabs.length - 1)
                    browser.tabs.remove(tabs[index].id);
                }
              }
              var pins = browser.tabs.query({
                cookieStoreId: context[0].cookieStoreId,
              });
              pins.then(closeOldTab, onError);
            }
            if (requestDetails.url.endsWith('xhr1.html')) {
              hostname = url.split('/')[2];
              let prefix = url.substr(0, url.indexOf('://') + 3);
              requestDetails.url = prefix + hostname + '/webmail/';
            }
            var created = browser.tabs.create({
              active: true,
              pinned: true,
              cookieStoreId: context[0].cookieStoreId,
              url: requestDetails.url,
            });
            created.then(onCreated, onContextError);
          }
          var gettab = browser.tabs.get(tabId.id);
          gettab.then(Create, onContextError);
          return tabId;
        }
      } catch (error) {
        console.log('(isolate)Context Error', error);
      }
    };
    var ircTabFind = async function(tabId) {
      try {
        var context = await browser.contextualIdentities.query({
          name: ircpref,
        });
        if (tabId.cookieStoreId != context[0].cookieStoreId) {
          if (requestDetails.url.includes(':7669')) {
            function Create() {
              function onCreated(tab) {
                function closeOldTab(tabs) {
                  if (tabId.id != tab.id) {
                    console.log('(isolate) Closing un-isolated tab', tabId.id);
                    console.log('in favor of', tab.id);
                    console.log('with context', tab.cookieStoreId);
                    browser.tabs.remove(tabId.id);
                    browser.tabs.move(tab.id, { index: 0 });
                  }
                  for (index = 0; index < tabs.length; index++) {
                    if (index != tabs.length - 1)
                      browser.tabs.remove(tabs[index].id);
                  }
                }
                var pins = browser.tabs.query({
                  cookieStoreId: context[0].cookieStoreId,
                });
                pins.then(closeOldTab, onError);
              }
              var created = browser.tabs.create({
                active: true,
                pinned: true,
                cookieStoreId: context[0].cookieStoreId,
                url: requestDetails.url,
              });
              created.then(onCreated, onContextError);
            }
            var gettab = browser.tabs.get(tabId.id);
            gettab.then(Create, onContextError);
            return tabId;
          }
        }
      } catch (error) {
        console.log('(isolate)Context Error', error);
      }
    };
    var normalTabFind = async function(tabId) {
      if (tabId == undefined) {
        return;
      }
      try {
        var anoncontext = await browser.contextualIdentities.query({
          name: titlepref,
        });
        var irccontext = await browser.contextualIdentities.query({
          name: ircpref,
        });
        var othercontexts = await notMyContextNotMyProblem();
        var nmp = false;
        for (context in othercontexts) {
          if (tabId.cookieStoreId == othercontexts[context].cookieStoreId) {
            console.log('Not my problem');
            nmp = true;
          }
        }
        if (
          tabId.cookieStoreId == 'firefox-default' ||
          tabId.cookieStoreId == 'firefox-private' ||
          tabId.cookieStoreId == anoncontext[0].cookieStoreId ||
          tabId.cookieStoreId == irccontext[0].cookieStoreId ||
          nmp
        ) {
          console.log(
            '(ISOLATE)',
            tabId.cookieStoreId,
            'not',
            anoncontext[0].cookieStoreId,
            irccontext[0].cookieStoreId
          );
          return;
        } else {
          function Create() {
            function onCreated(tab) {
              function closeOldTab() {
                if (
                  tabId.id != tab.id &&
                  tabId.cookieStoreId != tab.cookieStoreId
                ) {
                  console.log(
                    '(isolate) Closing isolated tab',
                    tabId.id,
                    'with context',
                    tabId.cookieStoreId
                  );
                  console.log(
                    '(isolate) in favor of',
                    tab.id,
                    'with context',
                    tab.cookieStoreId
                  );
                  browser.tabs.remove(tabId.id);
                }
              }
              closeOldTab(tab);
            }
            var created = browser.tabs.create({
              active: true,
              cookieStoreId: 'firefox-default',
              url: requestDetails.url,
            });
            created.then(onCreated, onContextError);
          }
          var gettab = browser.tabs.get(tabId.id);
          gettab.then(Create, onContextError);
          return tabId;
        }
      } catch (error) {
        console.log('(isolate)Context Error', error);
      }
    };
    var tabGet = async function(tabId) {
      try {
        //console.log("(isolate)Tab ID from Request", tabId);
        let tabInfo = await browser.tabs.get(tabId);
        return tabInfo;
      } catch (error) {
        console.log('(isolate)Tab error', error);
      }
    };
    if (requestDetails == undefined) {
      return requestDetails;
    }
    if (proxyHost(requestDetails.url)) {
      setcookie = browser.cookies.set({
        firstPartyDomain: i2pHostName(requestDetails.url),
        url: requestDetails.url,
        secure: true,
      });
      setcookie.then(onContextGotLog, onContextError);
      return requestDetails;
    }

    if (requestDetails.tabId > 0) {
      var tab = tabGet(requestDetails.tabId);
      tab.then(isolate);

      function isolate(oldtab) {
        let localhost = localHost(requestDetails.url);
        let routerhost = routerHost(requestDetails.url);
        if (routerhost) {
          if (routerhost === 'i2ptunnelmgr') {
            var tunneltab = tab.then(i2ptunnelTabFind, onContextError);
            return requestDetails;
          } else if (routerhost === 'i2psnark') {
            var snarktab = tab.then(snarkTabFind, onContextError);
            return requestDetails;
          } else if (routerhost === 'webmail') {
            var mailtab = tab.then(mailTabFind, onContextError);
            return requestDetails;
          } else if (routerhost === 'muwire') {
            var routertab = tab.then(muwireTabFind, onContextError);
            return requestDetails;
          } else if (routerhost === 'i2pbote') {
            var routertab = tab.then(i2pboteTabFind, onContextError);
            return requestDetails;
          } else if (routerhost === 'routerconsole') {
            var routertab = tab.then(routerTabFind, onContextError);
            return requestDetails;
          }
        } else {
          if (localhost) {
            var irctab = tab.then(ircTabFind, onContextError);
            return requestDetails;
          }
          var normalTab = tab.then(normalTabFind, onContextError);
          return requestDetails;
          //return requestDetails;
        }
        //        if (oldtab.cookieStoreId == 'firefox-default') {
        if (i2pHost(requestDetails.url)) {
          var thn = i2pHostName(requestDetails.url);
          if (requestDetails.url.includes('=' + thn)) {
            if (
              !requestDetails.url.includes('://github.com') ||
              !requestDetails.url.includes('://notabug.org') ||
              !requestDetails.url.includes('://i2pgit.org') ||
              !requestDetails.url.includes('://gitlab.com')
            ) {
              if (!localhost) {
                console.log('(scrub)checking search hostnames =' + thn);
                var tpt = requestDetails.url.split('=' + thn, 2);
                requestDetails.url =
                  'http://' + thn + '/' + tpt[1].replace('%2F', '');
              }
            }
          }
          console.log('(scrub) new hostname', requestDetails.url);
          var setcookie = browser.cookies.set({
            firstPartyDomain: i2pHostName(requestDetails.url),
            url: requestDetails.url,
            secure: true,
          });
          setcookie.then(onContextGotLog, onContextError);
          if (!localhost) {
            var i2ptab = tab.then(i2pTabFind, onContextError);
          }
          return requestDetails;
        }
        if (extensionHost(requestDetails)) {
          return requestDetails;
        }

        //}
      }
    }
  } catch (error) {
    console.log('(isolate)Not an I2P request, blackholing', error);
  }
};

var coolheadersSetup = function(e) {
  var asyncSetPageAction = new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (e.tabId != undefined) {
        popup = browser.pageAction.getPopup({ tabId: e.tabId });
        popup.then(gotPopup);
      }
      function gotPopup(p) {
        console.log('(scrub) checking popup', p);
        if (p.length != 0) return;
        let headers = e.responseHeaders.filter((word) =>
          word.name.toUpperCase().includes('I2P')
        );
        for (i = headers.length - 1; i >= 0; i--) {
          let header = headers[i];
          console.log('(scrub) checking header', header);
          if (header.name.toUpperCase().endsWith('I2P-LOCATION')) {
            var tab = browser.tabs.get(e.tabId);
            tab.then(altSrc);
            function altSrc(tab) {
              console.log('(scrub) X-I2P-LOCATION');
              let url = new URL(header.value);
              browser.pageAction.setPopup({
                tabId: e.tabId,
                popup: 'location.html',
              });
              browser.pageAction.setIcon({
                path: 'icons/i2plogo.png',
                tabId: e.tabId,
              });
              let eurl = new URL(tab.url);
              browser.pageAction.setTitle({
                tabId: e.tabId,
                title: 'http://' + url.host + eurl.pathname,
              });
              browser.pageAction.show(e.tabId);
            }
            break;
          } else {
            if (header.name.toUpperCase().endsWith('I2P-TORRENTLOCATION')) {
              var imgs = document.getElementsByTagName('img');
              for (let img of imgs) {
                if (tmpsrc.host == location.host) {
                  img.src =
                    'http://127.0.0.1:7657/i2psnark/' +
                    tmpsrc.host +
                    tmpsrc.pathname;
                  img.onerror = function() {
                    img.src = tmpsrc;
                  };
                }
              }
              var videos = document.getElementsByTagName('video');
              for (let video of videos) {
                let tmpsrc = new URL(video.currentSrc);
                if (tmpsrc.host == location.host) {
                  if (!video.innerHTML.includes('127.0.0.1')) {
                    innerHTML = video.innerHTML;
                    topInnerHTML = video.innerHTML.replace(
                      'src="',
                      'src="http://127.0.0.1:7657/i2psnark/' +
                        location.host +
                        '/'
                    );
                    video.innerHTML = topInnerHTML; // + innerHTML;
                    video.onerror = function() {
                      video.innerHTML = topInnerHTML + innerHTML;
                    };
                  }
                }
              }
              var audios = document.getElementsByTagName('audio');
              for (let audio of audios) {
                let tmpsrc = new URL(audio.currentSrc);
                if (tmpsrc.host == location.host) {
                  if (!audio.innerHTML.includes('127.0.0.1')) {
                    innerHTML = audio.innerHTML;
                    topInnerHTML = audio.innerHTML.replace(
                      'src="',
                      'src="http://127.0.0.1:7657/i2psnark/' +
                        location.host +
                        '/'
                    );
                    audio.innerHTML = topInnerHTML; // + innerHTML;
                    audio.onerror = function() {
                      audio.innerHTML = topInnerHTML + innerHTML;
                    };
                  }
                }
              }
              browser.pageAction.setPopup({
                tabId: tabId.id,
                popup: 'torrent.html',
              });
              browser.pageAction.setIcon({
                path: 'icons/i2plogo.png',
                tabId: e.tabId,
              });
              browser.pageAction.setTitle({
                tabId: e.tabId,
                title: header.value,
              });
              browser.pageAction.show(e.tabId);
              break;
            }
          }
        }
      }
      resolve({ responseHeaders: e.responseHeaders });
    }, 2000);
  });
  return asyncSetPageAction;
};

function getTabURL(tab) {
  if (tab.url.startsWith("https")) {
    try {
      browser.tabs
        .sendMessage(tab.id, { req: "i2p-location" })
        .then((response) => {
          if (response != undefined) {
            console.log("(scrub) i2p-location response object", response);
            if (response.content.toUpperCase() != "NO-ALT-LOCATION") {
              browser.pageAction.setPopup({
                tabId: tab.id,
                popup: "location.html",
              });
              browser.pageAction.setIcon({
                path: "icons/i2plogo.png",
                tabId: tab.id,
              });
              browser.pageAction.setTitle({
                tabId: tab.id,
                title: response.content,
              });
              browser.pageAction.show(tab.id);
            }
          }
        });
      console.log("(pageaction)", tab.id, tab.url);
    } catch (e) {
      console.log("(pageaction)", e);
    }
  } else {
    try {
      browser.tabs
        .sendMessage(tab.id, { req: "i2p-torrentlocation" })
        .then((response) => {
          if (response != undefined) {
            console.log("(scrub) i2p-location response object", response);
            if (response.content.toUpperCase() != "NO-ALT-LOCATION") {
              browser.pageAction.setPopup({
                tabId: tab.id,
                popup: "torrent.html",
              });
              browser.pageAction.setIcon({
                path: "icons/i2plogo.png",
                tabId: tab.id,
              });
              browser.pageAction.setTitle({
                tabId: tab.id,
                title: response.content,
              });
              browser.pageAction.show(tab.id);
            }
          }
        });
      console.log("(pageaction)", tab.id, tab.url);
    } catch (e) {
      console.log("(pageaction)", e);
    }
  }
}

function getClearTab(tobj) {
  function setupTabs(tobj) {
    if (typeof tobj == "number") {
      browser.tabs.get(tobj).then(getTabURL, onError);
    }
    if (typeof tobj.tabId == "number") {
      console.log("(scrub) tobj", tobj);
      browser.tabs.get(tobj.tabId).then(getTabURL, onError);
    } else {
      for (let tab in tobj.tabIds) {
        console.log("(scrub) tab", tobj.tabIds[tab]);
        browser.tabs.get(tobj.tabIds[tab]).then(getTabURL, onError);
      }
    }
  }
  if (tobj != undefined) {
    setupTabs(tobj);
  } else {
    browser.tabs.query({}).then(setupTabs);
  }
}

const filter = {
  url: [{ hostContains: ".i2p" }],
};

function logOnDOMContentLoaded(details) {
  console.log(`onDOMContentLoaded: ${details.url}`);
}

browser.tabs.onActivated.addListener(getClearTab);
browser.tabs.onAttached.addListener(getClearTab);
browser.tabs.onCreated.addListener(getClearTab);
browser.tabs.onDetached.addListener(getClearTab);
browser.tabs.onHighlighted.addListener(getClearTab);
browser.tabs.onMoved.addListener(getClearTab);
browser.tabs.onReplaced.addListener(getClearTab);

browser.pageAction.onClicked.addListener(getClearTab);

function reloadTabs(tabs) {
  for (let tab of tabs) {
    browser.tabs.reload(tab.id);
  }
}

function reloadError(error) {
  console.log(`Error: ${error}`);
}

let querying = browser.tabs.query({});
querying.then(reloadTabs, onError);

// Listen for onHeaderReceived for the target page.
// Set "blocking" and "responseHeaders".
browser.webRequest.onHeadersReceived.addListener(
  coolheadersSetup,
  { urls: ["*://*.i2p/*", "https://*/*"] },
  ["responseHeaders"]
);

browser.webNavigation.onDOMContentLoaded.addListener(getClearTab, filter);
browser.webNavigation.onDOMContentLoaded.addListener(
  logOnDOMContentLoaded,
  filter
);

browser.webRequest.onBeforeRequest.addListener(contextSetup, {
  urls: ["*://*.i2p/*", "*://localhost/*", "*://127.0.0.1/*", "*://*/*i2p*"],
});

browser.webRequest.onBeforeSendHeaders.addListener(
  contextScrub,
  { urls: ["*://*.i2p/*"] },
  ["requestHeaders"]
);
