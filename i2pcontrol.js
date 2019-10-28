function send(json) {
  const Http = new XMLHttpRequest();
  Http.withCredentials = false;
  const url = "http://" + "127.0.0.1" + ":" + "7650";
  Http.open("POST", url);
  Http.send(json);
  console.log(Http);
  return Http;
}

function authenticate(user, password) {
  var json = {
    jsonrpc: "2.0",
    id: user,
    method: "Authenticate",
    params: {
      API: 1,
      Password: password
    }
  };
  return send(json);
}

username = "";
password = "";

function echo(string, section) {
  var xhr = authenticate(username, password);
  xhr.onload = function() {
    resp = JSON.Parse(xhr.responseText);
    json = {
      jsonrpc: "2.0",
      id: username,
      method: "Echo",
      params: {
        Token: resp.Token,
        Echo: string
      }
    };
    var controlMessage = document.getElementById(section);
    infoMessage.textContent = xhr.responseText;
  };
}
