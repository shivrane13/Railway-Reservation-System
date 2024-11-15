const longtexts = document.getElementsByClassName("long-text");
const showmoreBtns = document.getElementsByClassName("Show");
const hideBtns = document.getElementsByClassName("hide");

function ShowLongText(i) {
  longtexts[i].style.display = "block";
  showmoreBtns[i].style.display = "none";
}

function hideLongText(i) {
  longtexts[i].style.display = "none";
  showmoreBtns[i].style.display = "block";
}

for (let i = 0; i < longtexts.length; i++) {
  showmoreBtns[i].addEventListener("click", () => ShowLongText(i));
}

for (let j = 0; j < longtexts.length; j++) {
  hideBtns[j].addEventListener("click", () => hideLongText(j));
}
