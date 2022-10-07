fetch('http://127.0.0.1:7669').then((myJson) => {
  if (myJson.status == 200) {
    let irc = document.getElementById('visit-irc');
    if (irc != null) {
      irc.classList.remove('hidden');
    }
  }
});
