browser.runtime.onMessage.addListener((request) => {
  var response = 'no-alt-location';
  console.log(request);
  if (request.req === 'i2p-location') {
    var tag = document.querySelector('meta[http-equiv="i2p-location"]');
    console.log(tag);
    if (tag) response = tag.content;
    return response;
  }

  if (request.req === 'i2p-torrentlocation') {
    const metas = document.getElementsByTagName('meta');
    var tag = document.querySelector('meta[http-equiv="i2p-torrentlocation"]');
    console.log(tag);
    response = i2pTorrent(tag);
    return response;
  }
  return Promise.resolve({ content: response });
});

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
          video.innerHTML = topInnerHTML; // + innerHTML;
          video.onerror = function () {
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
          audio.innerHTML = topInnerHTML; // + innerHTML;
          audio.onerror = function () {
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
