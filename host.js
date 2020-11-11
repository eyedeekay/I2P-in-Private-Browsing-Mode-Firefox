function proxyHost(url) {
  let hostname = '';
  if (url.indexOf('://') > -1) {
    hostname = url.split('/')[2];
  } else {
    hostname = url.split('/')[0];
  }
  if (hostname == 'proxy.i2p') {
    return true;
  }
  if (
    hostname == 'c6lilt4cr5x7jifxridpkesf2zgfwqfchtp6laihr4pdqomq25iq.b32.i2p'
  ) {
    return true;
  }
  return false;
}

function localHost(url) {
  let hostname = '';
  if (url.indexOf('://') > -1) {
    hostname = url.split('/')[2];
  } else {
    hostname = url.split('/')[0];
  }
  hostname = hostname.split(':')[0];
  if (hostname === '127.0.0.1') {
    return true;
  } else if (hostname === 'localhost') {
    return true;
  }

  return false;
}

function extensionHost(url) {
  if (url.originUrl !== undefined) {
    var res = url.originUrl.startsWith(browser.runtime.getURL(''));
    if (res) return res;
  }
  if (url.url !== undefined) {
    var res = url.url.startsWith(browser.runtime.getURL(''));
    if (res) return res;
  }
}

function i2pHostName(url) {
  let hostname = '';
  if (url.indexOf('://') > -1) {
    hostname = url.split('/')[2];
  } else {
    hostname = url.split('/')[0];
  }
  return hostname;
}

function i2pHost(url) {
  let hostname = i2pHostName(url);
  return hostname.endsWith('.i2p');
}

function routerHost(url) {
  let hostname = '';
  let path = '';
  function pathcheck(str) {
    if (str != undefined) {
      let final = str.split('/')[0];
      if (final === 'i2ptunnelmgr' || final === 'i2ptunnel') {
        console.log('(urlcheck) Tunnel application path', final);
        return 'i2ptunnelmgr';
      } else if (
        final === 'i2psnark' ||
        final === 'torrents' ||
        final.startsWith('transmission') ||
        final.startsWith('tracker')
      ) {
        console.log('(urlcheck) Torrent application path', final);
        return 'i2psnark';
      } else if (final === 'webmail' || final === 'susimail') {
        console.log('(urlcheck) Mail application path', final);
        return 'webmail';
      } else if (final.startsWith('MuWire')) {
        if (!url.includes('.png')) {
          console.log('(urlcheck) MuWire application path', final);
          return 'muwire';
        }
      } else if (
        final === 'home' ||
        final === 'console' ||
        final === 'dns' ||
        final === 'sitemap' ||
        final.startsWith('config')
      ) {
        console.log('(urlcheck) Console application path', final);
        return 'routerconsole';
      }
    }
    return true;
  }
  if (url.indexOf('://') > -1) {
    hostname = url.split('/')[2];
    let prefix = url.substr(0, url.indexOf('://') + 3);
    path = url.replace(prefix + hostname + '/', '');
  } else if (identifyProtocolHandler(url)) {
    let newurl = identifyProtocolHandler(url);
    return routerHost(newurl);
  } else {
    hostname = url.split('/')[0];
    path = url.replace(hostname + '/', '');
  }
  if (hostname === control_host + ':' + control_port) {
    return pathcheck(path);
  }
  if (hostname === control_host + ':' + '7662') {
    return pathcheck(path);
  }
  if (hostname === 'localhost' + ':' + '7662') {
    return pathcheck(path);
  }
  if (hostname === '127.0.0.1' + ':' + '7662') {
    return pathcheck(path);
  }
  if (hostname === 'localhost' + ':' + control_port) {
    return pathcheck(path);
  }
  if (hostname === '127.0.0.1' + ':' + control_port) {
    return pathcheck(path);
  }
  if (hostname === 'localhost' + ':' + 7070) {
    return pathcheck(path);
  }
  if (hostname === '127.0.0.1' + ':' + 7070) {
    return pathcheck(path);
  }
  return false;
}
