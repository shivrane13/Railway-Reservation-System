const paymentContainer = document.getElementById("payment-container");
const payment = document.getElementById("payment");
const blackDrop = document.getElementById("blackdrop");

function displayQR() {
  paymentContainer.style.display = "block";
  blackDrop.style.display = "block";
}

function hideQR() {
  blackDrop.style.display = "none";
  paymentContainer.style.display = "none";
}

payment.addEventListener("click", displayQR);
blackDrop.addEventListener("click", hideQR);
