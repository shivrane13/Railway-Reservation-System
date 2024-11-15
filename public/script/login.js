const alert = document.getElementById("alert");
const email = document.getElementById("email");
const password = document.getElementById("password");
function hideAlert() {
  alert.style.display = "none";
}
email.addEventListener("click", hideAlert);
password.addEventListener("click", hideAlert);
