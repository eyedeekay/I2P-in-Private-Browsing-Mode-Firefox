
browser.runtime.onMessage.addListener(request => {
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
      }catch{
      };
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
              img.src = 'http://127.0.0.1:7657/i2psnark/' + tmpsrc.host + tmpsrc.pathname;
              img.onerror = function() {
                img.src = tmpsrc;
              };
            }
          }
        }
        if (tag.toUpperCase() === 'X-I2P-TORRENTLOCATION') {
          response = metas[i].getAttribute('content');
          var imgs = document.getElementsByTagName('img');
          for (let img of imgs) {
            if (tmpsrc.host == location.host) {
              img.src = 'http://127.0.0.1:7657/i2psnark/' + tmpsrc.host + tmpsrc.pathname;
              img.onerror = function() {
                img.src = tmpsrc;
              };
            }
          }
        }
      }catch{
      };
    }
  }
  return Promise.resolve({content: response});
});
