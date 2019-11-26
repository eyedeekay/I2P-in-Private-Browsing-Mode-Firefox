document.addEventListener("click", e => {
  if (e.target.id === "onboardingButtonZero") {
    flipVisibility("onboardingContentZero");
  } else if (e.target.id === "onboardingButtonOne") {
    flipVisibility("onboardingContentOne");
  } else if (e.target.id === "onboardingButtonTwo") {
    flipVisibility("onboardingContentTwo");
  } else if (e.target.id === "onboardingButtonThree") {
    flipVisibility("onboardingContentThree");
  } else if (e.target.id === "onboardingButtonFour") {
    flipVisibility("onboardingContentFour");
  } else if (e.target.id === "fliplinks") {
    flipVisibility("info-content");
  }
});

function flipVisibility(div) {
  var x = document.getElementById(div);
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}
