const section1 = document.getElementById("section1");
const section2 = document.getElementById("section2");
const nextbtn = document.getElementById("nextbtn");
const previuseBtn = document.getElementById("previuseBtn");
const alert = document.getElementById("passnotmatch");

function displayForm() {
  const pass = document.getElementById("pass").value;
  const cpass = document.getElementById("cpass").value;
  if (pass == cpass) {
    section1.style.display = "none";
    section2.style.display = "block";
  } else {
    alert.innerHTML = "Password and Conform Password Must be Same";
    alert.classList.add("alert");
    alert.classList.add("alert-danger");
  }
}

function hideForm() {
  section1.style.display = "block";
  section2.style.display = "none";
}

nextbtn.addEventListener("click", displayForm);

previuseBtn.addEventListener("click", hideForm);
