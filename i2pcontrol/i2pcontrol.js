if (browser.windows != undefined) {
    var hello = 'hello i2pcontrol';

    function makeid(length) {
        var result = '';
        var characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    function send(
        message,
        control_host = "127.0.0.1",
        control_port = "7657",
        control_path = "jsonrpc"
    ) {
        async function postData(url = "", data = {}) {
            // Default options are marked with *
            let requestBody = JSON.stringify(data);
            //console.log("(i2pcontrol) sending request", requestBody);
            let opts = {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json'
                },
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *client
                body: requestBody // body data type must match "Content-Type" header
            };
            const response = await fetch(url, opts);
            return await response.json(); // parses JSON response into native JavaScript objects
        }

        //console.log("http://" + control_host + ":" + control_port + "/" + control_path)
        return postData(
            'http://' + control_host + ':' + control_port + '/' + control_path + '/',
            message
        );
    }

    async function authenticate(
        password = "itoopie",
        control_host = "127.0.0.1",
        control_port = "7657",
        control_path = "jsonrpc"
    ) {
        var json = new Object();
        json['id'] = makeid(6);
        json['jsonrpc'] = '2.0';
        json['method'] = 'Authenticate';
        json['params'] = new Object();
        json['params']['API'] = 1;
        json['params']['Password'] = password;
        return send(json, control_host, control_port, control_path);
    }

    async function GetToken(
        password = "itoopie",
        control_host = "127.0.0.1",
        control_port = "7657",
        control_path = "jsonrpc"
    ) {
        function gettoken(authtoken) {
            return authtoken.result.Token;
        }
        let me = authenticate(password, control_host, control_port, control_path);
        return await me.then(gettoken);
    }

    async function Echo(
        message,
        control_host = "127.0.0.1",
        control_port = "7657",
        control_path = "jsonrpc",
        password = "itoopie"
    ) {
        function echo(token) {
            console.log('(i2pcontrol) testing I2PControl connection');
            var json = new Object();
            json['id'] = makeid(6);
            json['jsonrpc'] = '2.0';
            json['method'] = 'Echo';
            json['params'] = new Object();
            json['params']['Token'] = token;
            json['params']['Echo'] = message;
            return send(json, control_host, control_port, control_path);
        }
        let token = GetToken(password, control_host, control_port, control_path);
        let done = await token.then(echo);
        return done;
    }

    function UpdateEchoElementByID(
        Query,
        ID,
        control_host = "127.0.0.1",
        control_port = "7657",
        control_path = "jsonrpc"
    ) {
        function updateelement(update) {
            //console.log("(i2pcontrol)", update);
            if (document.getElementById(ID) !== null)
                document.getElementById(ID).innerText = update;
        }
        let net = Echo(Query, control_host, control_port, control_path, password);
        net.then(updateleement);
    }

    async function GetRate(
        Query,
        control_host = "127.0.0.1",
        control_port = "7657",
        control_path = "jsonrpc",
        password = "itoopie"
    ) {
        function getrate(token) {
            var json = new Object();
            json['id'] = makeid(6);
            json['jsonrpc'] = '2.0';
            json['method'] = 'I2PControl';
            json['params'] = new Object();
            json['params']['Token'] = token;
            json['params']['Stat'] = Query;
            json['params']['Period'] = 2000;
            return send(json, control_host, control_port, control_path);
        }
        let token = GetToken(password, control_host, control_port, control_path);
        let done = await token.then(getrate);
        return done;
    }

    function UpdateGetRateElementByID(
        Query,
        ID,
        control_host = "127.0.0.1",
        control_port = "7657",
        control_path = "jsonrpc"
    ) {
        function updateelement(update) {
            //console.log("(i2pcontrol)", update);
            if (document.getElementById(ID) !== null)
                document.getElementById(ID).innerText = update;
        }
        let net = GetRate(
            Query,
            control_host,
            control_port,
            control_path,
            password
        );
        net.then(updateleement);
    }

    async function I2PControl(
        Query,
        control_host = "127.0.0.1",
        control_port = "7657",
        control_path = "jsonrpc",
        password = "itoopie"
    ) {
        function i2pcontrol(token) {
            var json = new Object();
            json['id'] = makeid(6);
            json['jsonrpc'] = '2.0';
            json['method'] = 'I2PControl';
            json['params'] = new Object();
            json['params']['Token'] = token;
            json['params'][Query] = null;
            return send(json, control_host, control_port, control_path);
        }
        let token = GetToken(password, control_host, control_port, control_path);
        let done = await token.then(i2pcontrol);
        return done;
    }

    function UpdateI2PControlElementByID(
        Query,
        ID,
        control_host = "127.0.0.1",
        control_port = "7657",
        control_path = "jsonrpc"
    ) {
        function updateelement(update) {
            //console.log("(i2pcontrol)", update);
            if (document.getElementById(ID) !== null)
                document.getElementById(ID).innerText = update;
        }
        let net = I2PControl(
            Query,
            control_host,
            control_port,
            control_path,
            password
        );
        net.then(updateleement);
    }

    async function RouterInfo(
        Query,
        control_host = "127.0.0.1",
        control_port = "7657",
        control_path = "jsonrpc",
        password = "itoopie"
    ) {
        function routerinfo(token) {
            var json = new Object();
            json['id'] = makeid(6);
            json['jsonrpc'] = '2.0';
            json['method'] = 'RouterInfo';
            json['params'] = new Object();
            json['params']['Token'] = token;
            json['params'][Query] = null;
            return send(json, control_host, control_port, control_path);
        }
        let token = GetToken(password, control_host, control_port, control_path);
        let done = await token.then(routerinfo);
        return done;
    }

    function UpdateRouterInfoElementByID(
        Query,
        ID,
        control_host = "127.0.0.1",
        control_port = "7657",
        control_path = "jsonrpc",
        password = "itoopie"
    ) {
        function updateelement(update) {
            /*console.log(
      "(i2pcontrol) element",
      update.result[Query],
      ID,
      document.getElementById(ID)
    );*/
            if (document.getElementById(ID) !== null)
                document.getElementById(ID).innerText = update.result[Query];
        }

        let net = RouterInfo(
            Query,
            control_host,
            control_port,
            control_path,
            password
        );
        net.then(updateelement);
    }

    async function RouterManager(
        Query,
        control_host = "127.0.0.1",
        control_port = "7657",
        control_path = "jsonrpc",
        password = "itoopie"
    ) {
        function routermanager(token) {
            var json = new Object();
            json['id'] = makeid(6);
            json['jsonrpc'] = '2.0';
            json['method'] = 'RouterManager';
            json['params'] = new Object();
            json['params']['Token'] = token;
            json['params'][Query] = null;
            return send(json, control_host, control_port, control_path);
        }
        let token = GetToken(password, control_host, control_port, control_path);
        let done = await token.then(routermanager);
        return done;
    }

    function UpdateRouterManagerElementByID(
        Query,
        ID,
        control_host = "127.0.0.1",
        control_port = "7657",
        control_path = "jsonrpc",
        password = "itoopie"
    ) {
        function updateelement(update) {
            //console.log("(i2pcontrol)", update);
            if (document.getElementById(ID) !== null)
                document.getElementById(ID).innerText = update;
        }
        let net = RouterManager(
            Query,
            control_host,
            control_port,
            control_path,
            password
        );
        net.then(updateleement);
    }

    async function NetworkSetting(
        Query,
        control_host = "127.0.0.1",
        control_port = "7657",
        control_path = "jsonrpc",
        password = "itoopie"
    ) {
        function networksetting(token) {
            var json = new Object();
            json['id'] = makeid(6);
            json['jsonrpc'] = '2.0';
            json['method'] = 'NetworkSetting';
            json['params'] = new Object();
            json['params']['Token'] = token;
            json['params'][Query] = null;
            return send(json, control_host, control_port, control_path);
        }
        let token = GetToken(password, control_host, control_port, control_path);
        let done = await token.then(networksetting);
        return done;
    }

    function UpdateNetworkSettingElementByID(
        Query,
        ID,
        control_host = "127.0.0.1",
        control_port = "7657",
        control_path = "jsonrpc",
        password = "itoopie"
    ) {
        function updateelement(update) {
            //console.log("(i2pcontrol)", update);
            document.getElementById(ID).innerText = update;
        }
        let net = NetworkSetting(
            Query,
            control_host,
            control_port,
            control_path,
            password
        );
        net.then(updateleement);
    }

    if (UpdateContents !== undefined) UpdateContents();

    const minutes = 0.2;
    const interval = minutes * 60 * 1000;

    setInterval(function() {
        if (UpdateContents !== undefined) UpdateContents();
    }, interval);

    function UpdateContents() {
        UpdateRouterInfoElementByID('i2p.router.status', 'router-status');
        UpdateRouterInfoElementByID('i2p.router.uptime', 'router-uptime');
        UpdateRouterInfoElementByID('i2p.router.version', 'router-version');
        UpdateRouterInfoElementByID(
            'i2p.router.net.bw.inbound.1s',
            'router-net-bw-inbound-1s'
        );
        UpdateRouterInfoElementByID(
            'i2p.router.net.bw.inbound.15s',
            'router-net-bw-inbound-15s'
        );
        UpdateRouterInfoElementByID(
            'i2p.router.net.bw.outbound.1s',
            'router-net-bw-outbound-1s'
        );
        UpdateRouterInfoElementByID(
            'i2p.router.net.bw.outbound.15s',
            'router-net-bw-outbound-15s'
        );
        UpdateRouterInfoElementByID('i2p.router.net.status', 'router-net-status');
        UpdateRouterInfoElementByID(
            'i2p.router.net.tunnels.participating',
            'router-net-tunnels-participating'
        );
        UpdateRouterInfoElementByID(
            'i2p.router.netdb.activepeers',
            'router-netdb-activepeers'
        );
        UpdateRouterInfoElementByID(
            'i2p.router.netdb.fastpeers',
            'router-netdb-fastpeers'
        );
        UpdateRouterInfoElementByID(
            'i2p.router.netdb.highcapacitypeers',
            'router-netdb-highcapacitypeers'
        );
        UpdateRouterInfoElementByID(
            'i2p.router.netdb.isreseeding',
            'router-netdb-isreseeding'
        );
        UpdateRouterInfoElementByID(
            'i2p.router.netdb.knownpeers',
            'router-netdb-knownpeers'
        );
    }

    var done = Echo(hello);
    done.then(Done).catch (Done);

    function Done(output) {
        function hide(elements) {
            elements = elements.length ? elements : [elements];
            for (var index = 0; index < elements.length; index++) {
                if (elements[index].style !== undefined) {
                    elements[index].style.display = 'none';
                }
            }
        }

        function unhide(elements) {
            elements = elements.length ? elements : [elements];
            for (var index = 0; index < elements.length; index++) {
                if (elements[index].style !== undefined) {
                    elements[index].style.display = 'inline-block';
                }
            }
        }

        console.log('(i2pcontrol) I2PControl connection tested,', output);
        if (output == hello) {
            var toopieLinks = document.querySelectorAll('.window-visit-toopie');
            unhide(toopieLinks);
        } else {
            var toopieLinks = document.querySelectorAll('.window-visit-toopie');
            hide(toopieLinks);
        }
        return output;
    }
}
