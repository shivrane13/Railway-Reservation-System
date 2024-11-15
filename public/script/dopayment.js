const paybtn = document.getElementById("paybtn-btn");
const paymentQr = document.getElementById("payment-container1");
const paymentsucc = document.getElementById("payment-container2");
console.log(10);
function paymentSucc() {
  paymentQr.style.display = "none";
  paymentSucc.style.display = "block";
}

paybtn.addEventListener("click", paymentSucc);
