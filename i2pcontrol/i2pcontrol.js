var password = "itoopie";
var hello = "hello i2pcontrol";

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function send(message) {
  async function postData(url = "", data = {}) {
    // Default options are marked with *
    let requestBody = JSON.stringify(data);
    let opts = {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json"
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *client
      body: requestBody // body data type must match "Content-Type" header
    };
    const response = await fetch(url, opts);
    return await response.json(); // parses JSON response into native JavaScript objects
  }

  return postData("http://127.0.0.1:7657/jsonrpc/", message);
}

function authenticate(password) {
  var json = {
    id: makeid(6),
    jsonrpc: "2.0",
    method: "Authenticate",
    params: {
      API: 1,
      Password: password
    }
  };
  return send(json);
}

async function GetToken(password) {
  let me = authenticate(password);
  return await me.then(gettoken);
}

function gettoken(authtoken) {
  return authtoken.result.Token;
}

function Done(output) {
  console.log("(i2pcontrol) I2PControl connection tested,", output);
  return output;
}

function Echo(message) {
  function echo(token) {
    let json = {
      id: makeid(6),
      jsonrpc: "2.0",
      method: "Echo",
      params: {
        Token: token,
        Echo: message
      }
    };
    return send(json);
  }
  let token = GetToken(password);
  let done = token.then(echo);
  return done;
}

function UpdateEchoElementByID(Query, ID) {
  function updateelement(update) {
    document.getElementById(ID).value = update;
  }
  let net = Echo(Query);
  net.then(updatelement);
}

function GetRate(Query) {
  function getrate(token) {
    var json = new Object();
    json["id"] = makeid(6);
    json["jsonrpc"] = "2.0";
    json["method"] = "I2PControl";
    json["params"] = new Object();
    json["params"]["Token"] = token;
    json["params"]["Stat"] = Query;
    json["params"]["Period"] = 2000;
    return send(json);
  }
  let token = GetToken(password);
  let done = token.then(getrate);
  return done;
}

function UpdateGetRateElementByID(Query, ID) {
  function updateelement(update) {
    document.getElementById(ID).value = update;
  }
  let net = GetRate(Query);
  net.then(updatelement);
}

function I2PControl(Query) {
  function i2pcontrol(token) {
    var json = new Object();
    json["id"] = makeid(6);
    json["jsonrpc"] = "2.0";
    json["method"] = "I2PControl";
    json["params"] = new Object();
    json["params"]["Token"] = token;
    json["params"][Query] = null;
    return send(json);
  }
  let token = GetToken(password);
  let done = token.then(i2pcontrol);
  return done;
}

function UpdateI2PControlElementByID(Query, ID) {
  function updateelement(update) {
    document.getElementById(ID).value = update;
  }
  let net = I2PControl(Query);
  net.then(updatelement);
}

function RouterInfo(Query) {
  function routerinfo(token) {
    var json = new Object();
    json["id"] = makeid(6);
    json["jsonrpc"] = "2.0";
    json["method"] = "RouterInfo";
    json["params"] = new Object();
    json["params"]["Token"] = token;
    json["params"][Query] = null;
    return send(json);
  }
  let token = GetToken(password);
  let done = token.then(routerinfo);
  return done;
}

function UpdateRouterInfoElementByID(Query, ID) {
  function updateelement(update) {
    document.getElementById(ID).value = update;
  }
  let net = RouterInfo(Query);
  net.then(updatelement);
}

function RouterManager(Query) {
  function routermanager(token) {
    var json = new Object();
    json["id"] = makeid(6);
    json["jsonrpc"] = "2.0";
    json["method"] = "RouterManager";
    json["params"] = new Object();
    json["params"]["Token"] = token;
    json["params"][Query] = null;
    return send(json);
  }
  let token = GetToken(password);
  let done = token.then(routermanager);
  return done;
}

function UpdateRouterManagerElementByID(Query, ID) {
  function updateelement(update) {
    document.getElementById(ID).value = update;
  }
  let net = RouterManage(Query);
  net.then(updatelement);
}

function NetworkSetting(Query) {
  function networksetting(token) {
    var json = new Object();
    json["id"] = makeid(6);
    json["jsonrpc"] = "2.0";
    json["method"] = "NetworkSetting";
    json["params"] = new Object();
    json["params"]["Token"] = token;
    json["params"][Query] = null;
    return send(json);
  }
  let token = GetToken(password);
  let done = token.then(networksetting);
  return done;
}

function UpdateNetworkSettingElementByID(Query, ID) {
  function updateelement(update) {
    document.getElementById(ID).value = update;
  }
  let net = NetworkSetting(Query);
  net.then(updatelement);
}

//var done = Echo(hello);
//done.then(Done);
