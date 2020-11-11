browser.runtime.onMessage.addListener((request) => {
  var response = '';
  if (request.req === 'i2p-location') {
    response = 'no-alt-location';
    const metas = document.getElementsByTagName('meta');
    for (let i = 0; i < metas.length; i++) {
      try {
        tag = metas[i].getAttribute('http-equiv');
        if (tag.toUpperCase() === 'I2P-LOCATION') {
          response = metas[i].getAttribute('content');
        }
        if (tag.toUpperCase() === 'X-I2P-LOCATION') {
          response = metas[i].getAttribute('content');
        }
      } catch {};
    }
  }
  if (request.req === 'i2p-torrentlocation') {
    response = 'no-alt-location';
    const metas = document.getElementsByTagName('meta');
    for (let i = 0; i < metas.length; i++) {
      try {
        tag = metas[i].getAttribute('http-equiv');
        if (tag.toUpperCase() === 'I2P-TORRENTLOCATION') {
          response = metas[i].getAttribute('content');
          var imgs = document.getElementsByTagName('img');
          for (let img of imgs) {
            let tmpsrc = new URL(img.src);
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
          var links = document.getElementsByTagName('a');
          console.log('Listing link', links);
          for (let link of links) {
            console.log('(Changing Link)', link);
            let tmpsrc = new URL(link.href);
            //            console.log("link", tmpsrc.host, tmpsrc.pathname)
            if (tmpsrc.host == location.host) {
              if (
                !tmpsrc.pathname.endsWith('html') &&
                !tmpsrc.pathname.endsWith('htm') &&
                !tmpsrc.pathname.endsWith('php') &&
                !tmpsrc.pathname.endsWith('jsp') &&
                !tmpsrc.pathname.endsWith('asp') &&
                !tmpsrc.pathname.endsWith('aspx') &&
                !tmpsrc.pathname.endsWith('atom') &&
                !tmpsrc.pathname.endsWith('rss') &&
                !tmpsrc.pathname.endsWith('/') &&
                tmpsrc.pathname.includes('.')
              ) {
                console.log('link', tmpsrc.host, tmpsrc.pathname);
                link.href =
                  'http://127.0.0.1:7657/i2psnark/' +
                  tmpsrc.host +
                  tmpsrc.pathname;
                link.onerror = function() {
                  window.location.href = tmpsrc.href;
                };
              }
              //if (!tmpsrc.pathname.endsWith('html')) { // && !tmpsrc.pathname.endsWith('htm') &&
              //                !tmpsrc.pathname.endsWith('php') && !tmpsrc.pathname.endsWith('jsp') &&
              //                !tmpsrc.pathname.endsWith('asp') && !tmpsrc.pathname.endsWith('aspx') &&
              //                tmpsrc.pathname.includes('.') && !tmpsrc..pathname.endsWith('/')) {
              //console.log('http://127.0.0.1:7657/i2psnark/' + tmpsrc.host + tmpsrc.pathname;)
              //link.href = 'http://127.0.0.1:7657/i2psnark/' + tmpsrc.host + tmpsrc.pathname;
              //link.onerror = function() {
              //link.src = tmpsrc;
              //};
              //}
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
                  'src="http://127.0.0.1:7657/i2psnark/' + location.host + '/'
                );
                video.innerHTML = topInnerHTML + innerHTML;
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
                  'src="http://127.0.0.1:7657/i2psnark/' + location.host + '/'
                );
                audio.innerHTML = topInnerHTML + innerHTML;
              }
            }
          }
        }
        if (tag.toUpperCase() === 'X-I2P-TORRENTLOCATION') {
          response = metas[i].getAttribute('content');
          var imgs = document.getElementsByTagName('img');
          for (let img of imgs) {
            let tmpsrc = new URL(img.src);
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
          var links = document.getElementsByTagName('a');
          console.log('Listing link', links);
          for (let link of links) {
            console.log('(Changing Link)', link);
            let tmpsrc = new URL(link.href);
            //console.log("link", tmpsrc.host, tmpsrc.pathname)
            if (tmpsrc.host == location.host) {
              if (
                !tmpsrc.pathname.endsWith('html') &&
                !tmpsrc.pathname.endsWith('htm') &&
                !tmpsrc.pathname.endsWith('php') &&
                !tmpsrc.pathname.endsWith('jsp') &&
                !tmpsrc.pathname.endsWith('asp') &&
                !tmpsrc.pathname.endsWith('aspx') &&
                !tmpsrc.pathname.endsWith('atom') &&
                !tmpsrc.pathname.endsWith('rss') &&
                !tmpsrc.pathname.endsWith('/') &&
                tmpsrc.pathname.includes('.')
              ) {
                console.log('link', tmpsrc.host, tmpsrc.pathname);
                link.href =
                  'http://127.0.0.1:7657/i2psnark/' +
                  tmpsrc.host +
                  tmpsrc.pathname;
                link.onerror = function() {
                  window.location.href = tmpsrc.href;
                };
              }
              //if (!tmpsrc.pathname.endsWith('html')) { // && !tmpsrc.pathname.endsWith('htm') &&
              //                !tmpsrc.pathname.endsWith('php') && !tmpsrc.pathname.endsWith('jsp') &&
              //                !tmpsrc.pathname.endsWith('asp') && !tmpsrc.pathname.endsWith('aspx') &&
              //                tmpsrc.pathname.includes('.') && !tmpsrc..pathname.endsWith('/')) {
              //console.log('http://127.0.0.1:7657/i2psnark/' + tmpsrc.host + tmpsrc.pathname;)
              //link.href = 'http://127.0.0.1:7657/i2psnark/' + tmpsrc.host + tmpsrc.pathname;
              //link.onerror = function() {
              //link.src = tmpsrc;
              //};
              //}
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
                  'src="http://127.0.0.1:7657/i2psnark/' + location.host + '/'
                );
                video.innerHTML = topInnerHTML + innerHTML;
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
                  'src="http://127.0.0.1:7657/i2psnark/' + location.host + '/'
                );
                audio.innerHTML = topInnerHTML + innerHTML;
              }
            }
          }
        }
      } catch {};
    }
  }
  return Promise.resolve({ content: response });
});
