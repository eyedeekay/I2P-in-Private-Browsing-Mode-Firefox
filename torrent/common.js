"use strict";

////// RPC

function rpcCall(meth, args) {
  return browser.storage.local.get(function (server) {
    const myHeaders = {
      "Content-Type": "application/json",
      "x-transmission-session-id": server.session,
    };
    //console.log("(torrent)", server.session)
    if (server.username !== "" || server.btrpcpass !== "") {
      myHeaders["Authorization"] =
        "Basic " +
        btoa((server.username || "") + ":" + (server.btrpcpass || ""));
    }
    //console.log("(torrent) rpc", server.base_url);
    return fetch(server.base_url + "rpc", {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({ method: meth, arguments: args }),
      credentials: "include", // allows HTTPS client certs!
    })
      .then(function (response) {
        const session = response.headers.get("x-transmission-session-id");
        if (session) {
          browser.storage.local.get({}).then(function (storage) {
            storage.session = session;
            browser.storage.local.set(storage);
          });
        }
        if (response.status === 409) {
          return rpcCall(meth, args);
        }
        if (response.status >= 200 && response.status < 300) {
          return response;
        }
        const error = new Error(response.statusText);
        error.response = response;
        throw error;
      })
      .then(function (response) {
        return response.json();
      });
  });
}

////// Util

function formatSpeed(s) {
  // Firefox shows 4 characters max
  if (s < 1000 * 1000) {
    return (s / 1000).toFixed() + "K";
  }
  if (s < 1000 * 1000 * 1000) {
    return (s / 1000 / 1000).toFixed() + "M";
  }
  // You probably don't have that download speed…
  return (s / 1000 / 1000 / 1000).toFixed() + "T";
}
