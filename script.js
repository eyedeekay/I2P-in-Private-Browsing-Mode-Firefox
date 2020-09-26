
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
        }
        if (tag.toUpperCase() === 'X-I2P-TORRENTLOCATION') {
          response = metas[i].getAttribute('content');
        }
      }catch{
      };
    }
  }
  return Promise.resolve({content: response});
});
