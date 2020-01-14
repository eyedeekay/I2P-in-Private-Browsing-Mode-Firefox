document.addEventListener('click', clickEvent => {
  if (clickEvent.target.id === 'onboardingButtonZero') {
    flipVisibility('onboardingContentZero');
  } else if (clickEvent.target.id === 'onboardingButtonOne') {
    flipVisibility('onboardingContentOne');
  } else if (clickEvent.target.id === 'onboardingButtonTwo') {
    flipVisibility('onboardingContentTwo');
  } else if (clickEvent.target.id === 'onboardingButtonThree') {
    flipVisibility('onboardingContentThree');
  } else if (clickEvent.target.id === 'onboardingButtonFour') {
    flipVisibility('onboardingContentFour');
  } else if (clickEvent.target.id === 'fliplinks') {
    flipVisibility('info-content');
  }
});

function flipVisibility(div) {
  let flippable = document.getElementById(div);
  if (flippable.style.display === 'none') {
    flippable.style.display = 'block';
  } else {
    flippable.style.display = 'none';
  }
}
