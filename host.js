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
    console.log('(urlcheck) hostname localhost', hostname);
    console.log('(urlcheck) url localhost', url);
    if (hostname === '127.0.0.1') {
        if (url.indexOf(':8084') != -1) return 'blog';
        if (url.indexOf(':7669') != -1) return 'irc';
        if (url.indexOf(':7695') != -1) return 'tor';
    } else if (hostname === 'localhost') {
        if (url.indexOf(':8084') != -1) return 'blog';
        if (url.indexOf(':7669') != -1) return 'irc';
        if (url.indexOf(':7695') != -1) return 'tor';
    }

    return false;
}

function extensionHost(url) {
    var prefix = browser.runtime
        .getURL('')
        .replace('moz-extension://', '')
        .replace('/', '');
    if (url.originUrl !== undefined) {
        var originUrl = url.originUrl
            .replace('moz-extension://', '')
            .replace('/', '');
        //    console.log("(urlcheck) Extension application path", originUrl);
        //    console.log("(urlcheck) Extension application path", prefix);
        var res = originUrl.startsWith(prefix);
        //    console.log("(urlcheck) Extension application path", res);
        if (res) return res;
    }
    if (url.documentUrl !== undefined) {
        //    console.log("(urlcheck) Extension application path", originUrl);
        //    console.log("(urlcheck) Extension application path", prefix);
        var res = originUrl.startsWith(prefix);
        //    console.log("(urlcheck) Extension application path", res);
        if (res) return res;
    }
    console.log('(urlcheck) Extension application path', url);
}

function i2pHostName(url) {
    let hostname = '';
    console.log('(hosts)', url);
    let u = new URL(url);
    if (u.host.endsWith('.i2p')) {
        hostname = u.host;
    } else if (url.includes('=')) {
        if (url.includes('.i2p')) {
            lsit = url.split('=');
            for (let item in lsit) {
                var items = lsit[item].split(`\ % `); //"\%")
                for (let p in items) {
                    if (items[p].includes('.i2p')) {
                        hostname = items[p].replace('3D', 1);
                    }
                    break;
                }
                if (hostname != '') {
                    break;
                }
            }
        }
    } else if (url.indexOf('://') > -1) {
        hostname = url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }
    console.log('(hosts) scrub', hostname);
    return hostname;
}

function i2pHost(url) {
    let hostname = i2pHostName(url);
    let postname = hostname.split(':')[0];
    return postname.endsWith('.i2p');
}

function routerHost(url) {
    //  console.log("(urlcheck) HOST URL CHECK");
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
                final.startsWith('tracker') ||
                url.includes(':7662')
            ) {
                console.log('(urlcheck) Torrent application path', final);
                return 'i2psnark';
            } else if (final === 'webmail' || final === 'susimail') {
                if (!url.includes('.css')) {
                    console.log('(urlcheck) Mail application path', final);
                    return 'webmail';
                }
            } else if (final.startsWith('MuWire')) {
                if (!url.includes('.png')) {
                    console.log('(urlcheck) MuWire application path', final);
                    return 'muwire';
                }
            } else if (final.startsWith('i2pbote')) {
                if (!url.includes('.png')) {
                    console.log('(urlcheck) I2PBote application path', final);
                    return 'i2pbote';
                }
            } else if (
                final === 'home' ||
                final === 'console' ||
                final === 'dns' ||
                final === 'susidns' ||
                final.startsWith('susidns') ||
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
    if (hostname === 'localhost' + ':' + 7667) {
        return pathcheck(path);
    }
    if (hostname === '127.0.0.1' + ':' + 7667) {
        return pathcheck(path);
    }
    return false;
}