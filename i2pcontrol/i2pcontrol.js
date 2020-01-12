var password = "itoopie";

function send(message) {
  async function postData(url = "", data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json"
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *client
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return await response.json(); // parses JSON response into native JavaScript objects
  }

  return postData(
    "http://127.0.0.1:7657/jsonrpc/",
    message
  ); /*.then(data => {
    console.log(data); // JSON data parsed by `response.json()` call
  });*/
}

function authenticate(user, password) {
  console.log("Authenticating to i2pcontrol");
  var json = {
    id: "id",
    jsonrpc: "2.0",
    method: "Authenticate",
    params: {
      API: 1,
      Password: password
    }
  };
  return send(json);
}

var auth = authenticate("user", password);
var shake = auth.then(echo);
var done = shake.then(Done);

function Done(output) {
  console.log("I2PControl connection tested", output);
}

function echo(authtoken) {
  console.log("Saying hi to i2pcontrol");
  json = {
    id: "id",
    jsonrpc: "2.0",
    method: "Echo",
    params: {
      Token: authtoken.result.Token,
      Echo: "hello i2pcontrol"
    }
  };
  return send(json);
}
