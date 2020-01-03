var android = false;

var gettingInfo = browser.runtime.getPlatformInfo();
gettingInfo.then(got => {
  if (got.os == "android") {
    console.log("Running in Android detected");
    android = true;
    return true;
  } else {
    console.log("Running in Desktop detected");
    android = false;
    return false;
  }
});

function isDroid() {
  console.log("android?", android);
  if (android == undefined) {
    return false;
  }
  return android;
}

function notClosable() {
  return false;
}
