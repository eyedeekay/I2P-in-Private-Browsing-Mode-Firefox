function send(json) {
  async function postData(url = "", data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json"
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *client
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return await response.json(); // parses JSON response into native JavaScript objects
  }

  postData("http://127.0.0.1:7657/jsonrpc/", { answer: 42 }).then(data => {
    console.log(data); // JSON data parsed by `response.json()` call
  });
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

var username = "";
var password = "";

function echo(string, section) {
  var xhr = authenticate(username, password);
  console.log("(i2pcontrol) echo", xhr);
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
    console.log("(i2pcontrol) reply", xhr.responseText);
    infoMessage.textContent = xhr.responseText;
  };
}

echo("test", "test");
