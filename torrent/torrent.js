var hello = "hello bittorrent";

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

function send(
  message,
  control_host = "127.0.0.1",
  control_port = "7657",
  control_path = "transmission/rpc"
) {
  async function postData(url = "", data = {}) {
    // Default options are marked with *
    let requestBody = JSON.stringify(data);
    //console.log("(i2pcontrol)", requestBody, data);
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

  return postData(
    "http://" + control_host + ":" + control_port + "/" + control_path + "/",
    message
  );
}

function authenticate(
  password = "transmission",
  control_host = "127.0.0.1",
  control_port = "7657",
  control_path = "transmission/rpc"
) {
  let store = browser.storage.local.get("rpc_pass");
  if (store != undefined) {
    console.log("Stored password found");
    password = store;
  }
  function auth(got) {
    var json = new Object();
    json["id"] = makeid(6);
    json["jsonrpc"] = "2.0";
    json["method"] = "Authenticate";
    json["params"] = new Object();
    json["params"]["API"] = 1;
    json["params"]["Password"] = password;
    return send(json);
  }
  store.then(auth);
}

async function GetToken(
  password,
  control_host = "127.0.0.1",
  control_port = "7657",
  control_path = "transmission/rpc"
) {
  let me = authenticate(password);
  return await me.then(gettoken);
}

function gettoken(authtoken) {
  return authtoken.result.Token;
}
