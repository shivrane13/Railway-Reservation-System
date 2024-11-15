const giveReviewBtn = document.getElementById("reviewBtn");
const enteredReview = document.getElementById("enteredReview");
const loginUser = document.getElementById("loginUser");
const railwayNo = document.getElementById("trainId");
const reviewList = document.getElementById("newReviewList");
const alertRevi = document.getElementById("notReviewAlert");
const revLen = document.getElementById("revLen").value;
const username = document.getElementById("username").value;

async function saveReview(e) {
  e.preventDefault();
  const review = enteredReview.value;
  const userId = loginUser.value;
  const trainNo = railwayNo.value;
  if (review == "") {
    console.log("Not");
    return;
  }

  if (revLen == 0) {
    if (alertRevi !== undefined) {
      alertRevi.textContent = "";
    }
  }

  const newReview = document.createElement("li");
  newReview.innerHTML = `<div class="d-flex">
                            <div class="right">
                              <h4>${username}</h4>
                              <div style="display: flex; justify-content: space-between">
                                <div class="review-description">
                                  <p>${review}</p>
                                </div>
                              </div>
                              <span class="publish py-3 d-inline-block w-100">Published 1 sec ago</span>
                            </div>
                          </div>`;
  reviewList.prepend(newReview);

  const data = { review: review, userid: userId, trainNo: trainNo };

  try {
    const response = await fetch(`/review`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-type": "application/json",
      },
    });
  } catch (err) {
    console.log(err);
  }
}

function deleteReview() {
  window.history.go(-1);
}

giveReviewBtn.addEventListener("click", saveReview);
