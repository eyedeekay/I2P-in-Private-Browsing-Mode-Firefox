function flipVisibility(div) {
  var x = document.getElementById(div);
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}
