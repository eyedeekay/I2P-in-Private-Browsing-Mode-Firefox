function hasI2PLocation(request) {
  let response = false;
  if (request.req === "i2p-location") {
    let tag = document.querySelector('meta[http-equiv="i2p-location"]');
    if (tag != undefined) {
      console.debug("(script) i2p site discovered", tag);
      if (tag) response = tag.content;
    }
    tag = document.querySelector('meta[http-equiv="x-i2p-location"]');
    if (tag != undefined) {
      console.debug("(script) i2p site discovered", tag);
      if (tag) response = tag.content;
    }
  }
  return response;
}

function hasTorrentResource(request) {
  let response = false;
  if (!i2pHost(request.URL)) return response;
  if (request.req === "i2p-torrentlocation") {
    let tag = document.querySelector('meta[http-equiv="i2p-torrentlocation"]');
    if (tag != undefined) {
      console.debug("(script) torrent resource", tag);
      response = i2pTorrent(tag);
    }
    tag = document.querySelector('meta[http-equiv="x-i2p-torrentlocation"]');
    if (tag != undefined) {
      console.debug("(script) torrent resource", tag);
      response = i2pTorrent(tag);
    }
  }
  return response;
}

function hasExtraLocation(request) {
  var response = false;
  console.info("(script) page" + request);
  torrentLocation = hasTorrentResource(request);
  if (torrentLocation) return torrentLocation;
  i2pLocation = hasI2PLocation(request);
  if (i2pLocation) return i2pLocation;
  return Promise.resolve({ content: response });
}

browser.runtime.onMessage.addListener(hasExtraLocation);

window.document.onload = function (e) {
  console.log("presetting x-i2p-torrentlocation");
  var tag = document.querySelector('meta[http-equiv="i2p-torrentlocation"]');
  if (tag != undefined) {
    console.log(tag);
    response = i2pTorrent(tag);
  }
  var tag = document.querySelector('meta[http-equiv="x-i2p-torrentlocation"]');
  if (tag != undefined) {
    console.log(tag);
    response = i2pTorrent(tag);
  }
};

console.log("presetting x-i2p-torrentlocation");
var tag = document.querySelector('meta[http-equiv="i2p-torrentlocation"]');
if (tag != undefined) {
  console.log(tag);
  response = i2pTorrent(tag);
}
var tag = document.querySelector('meta[http-equiv="x-i2p-torrentlocation"]');
if (tag != undefined) {
  console.log(tag);
  response = i2pTorrent(tag);
}

function i2pTorrent(tag) {
  let response = "no-alt-location";
  if (tag) {
    response = tag.content;
    var imgs = document.getElementsByTagName("img");
    console.log("rewriting torrent link");
    for (let img of imgs) {
      let tmpsrc = new URL(img.src);
      if (tmpsrc.host == location.host) {
        img.src =
          "http://127.0.0.1:7657/i2psnark/" + tmpsrc.host + tmpsrc.pathname;
        img.onerror = function () {
          img.src = tmpsrc;
        };
      }
    }
    var videos = document.getElementsByTagName("video");
    for (let video of videos) {
      video.setAttribute("preload", "none");
      let tmpsrc = new URL(video.currentSrc);
      if (tmpsrc.host == location.host) {
        if (!video.innerHTML.includes("127.0.0.1")) {
          innerHTML = video.innerHTML;
          topInnerHTML = video.innerHTML.replace(
            'src="',
            'src="http://127.0.0.1:7657/i2psnark/' + location.host + "/"
          );
          //          let url = new URL("http://127.0.0.1:7657/i2psnark/"+location.host+"/"location.path)
          console.log(
            "http://127.0.0.1:7657/i2psnark/" + tmpsrc.host + tmpsrc.pathname
          ); //+"/"location.path)
          video.src =
            "http://127.0.0.1:7657/i2psnark/" + tmpsrc.host + tmpsrc.pathname;
          video.innerHTML = topInnerHTML; // + innerHTML;
          video.onerror = function () {
            console.log("video error");
            video.innerHTML = topInnerHTML + innerHTML;
          };
        }
      }
    }
    var audios = document.getElementsByTagName("audio");
    for (let audio of audios) {
      audio.setAttribute("preload", "none");
      let tmpsrc = new URL(audio.currentSrc);
      if (tmpsrc.host == location.host) {
        if (!audio.innerHTML.includes("127.0.0.1")) {
          innerHTML = audio.innerHTML;
          topInnerHTML = audio.innerHTML.replace(
            'src="',
            'src="http://127.0.0.1:7657/i2psnark/' + location.host + "/"
          );
          //console.log("http://127.0.0.1:7657/i2psnark/" + location); //.host+"/"location.path)
          console.log(
            "http://127.0.0.1:7657/i2psnark/" + tmpsrc.host + tmpsrc.pathname
          ); //+"/"location.path)
          audio.src =
            "http://127.0.0.1:7657/i2psnark/" + tmpsrc.host + tmpsrc.pathname;
          audio.innerHTML = topInnerHTML; // + innerHTML;
          audio.onerror = function () {
            console.log("audio error");
            audio.innerHTML = topInnerHTML + innerHTML;
          };
        }
      }
    }
    var links = document.getElementsByTagName("a");
    for (let link of links) {
      let tmpsrc = new URL(link.href);
      if (tmpsrc.host == location.host) {
        if (
          !tmpsrc.pathname.endsWith("html") &&
          !tmpsrc.pathname.endsWith("htm") &&
          !tmpsrc.pathname.endsWith("php") &&
          !tmpsrc.pathname.endsWith("jsp") &&
          !tmpsrc.pathname.endsWith("asp") &&
          !tmpsrc.pathname.endsWith("aspx") &&
          !tmpsrc.pathname.endsWith("atom") &&
          !tmpsrc.pathname.endsWith("rss") &&
          !tmpsrc.pathname.endsWith("/") &&
          tmpsrc.pathname.includes(".")
        ) {
          link.href =
            "http://127.0.0.1:7657/i2psnark/" + tmpsrc.host + tmpsrc.pathname;
          link.onerror = function () {
            window.location.href = tmpsrc.href;
          };
        }
      }
    }
  }
  return response;
}
