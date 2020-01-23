var hellot = "hello bittorrent";
var xTransmissionSessionId = "";

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

function torrentsend(
  message,
  control_host = "127.0.0.1",
  control_port = "7657",
  control_path = "transmission/rpc"
) {
  async function postData(url = "", data = {}) {
    // Default options are marked with *
    let requestBody = JSON.stringify(data);
    console.log("(torrent-rpc) send", requestBody, data);
    let opts = {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        "X-Transmission-Session-Id": xTransmissionSessionId
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *client
      body: requestBody // body data type must match "Content-Type" header
    };
    const response = await fetch(url, opts);
    console.log("(torrent-rpc) response", response);
    return await response.json(); // parses JSON response into native JavaScript objects
  }

  return postData(
    "http://" + control_host + ":" + control_port + "/" + control_path + "/",
    message
  );
  /*  return postData(
    "http://" + control_host + ":" + control_port + "/" + control_path,
    message
  );*/
}

function sessionStats(
  password = "transmission",
  control_host = "127.0.0.1",
  control_port = "7657",
  control_path = "transmission/rpc"
) {
  var json = new Object();
  json["id"] = makeid(6);
  json["jsonrpc"] = "2.0";
  json["method"] = "session-stats";
  //json["params"] = new Object();
  return torrentsend(json, control_host, control_port, control_path);
}

async function GetTorrentToken(
  password,
  control_host = "127.0.0.1",
  control_port = "7657",
  control_path = "transmission/rpc"
) {
  let me = sessionStats(password);
  return await me.then(gettorrenttoken);
}

function gettorrenttoken(authtoken) {
  console.log(authtoken);
  return authtoken.result.Token;
}

function TorrentDone(result) {
  console.log("(torrent-rpc) recv", result);
}

function TorrentError(result) {
  console.log("(torrent-rpc) recv err", result);
}

var result = GetTorrentToken();
result.then(TorrentDone, TorrentError);
