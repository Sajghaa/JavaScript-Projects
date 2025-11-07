//  Online drum sounds (Google Sound Library & Mixkit)
const sounds = {
  a: "https://actions.google.com/sounds/v1/ambiences/drum_boing.ogg",
  s: "https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg",
  d: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
  f: "https://actions.google.com/sounds/v1/foley/cloth_swipe.ogg",
  g: "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg",
  h: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
  j: "https://actions.google.com/sounds/v1/cartoon/concussive_hit_guitar_boing.ogg"
};

document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  const soundUrl = sounds[key];
  if (soundUrl) {
    const audio = new Audio(soundUrl);
    audio.play();
    flashKey(key);
  }
});

function flashKey(key) {
  const keyElement = document.querySelector(`.key[data-key="${key}"]`);
  if (keyElement) {
    keyElement.classList.add("active");
    setTimeout(() => keyElement.classList.remove("active"), 200);
  }
}
