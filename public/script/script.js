const sidebarBtn = document.getElementById("sidebar-btn");
const sideBar = document.getElementById("sidebar");
const blackdrop = document.getElementById("blackdrop");

const sidebarSearchBtn = document.getElementById("search-btn-sidebar");
const searchForm = document.getElementById("search");

const booktikitSearchForm = document.getElementById("booktikitsearchsection");
const sidebarBooktikitBtn = document.getElementById("sidebar-booktikit-btn");

function displaySidebar() {
  blackdrop.style.display = "block";
  sideBar.style.display = "block";
}

function hideSidebar() {
  blackdrop.style.display = "none";
  sideBar.style.display = "none";
  searchForm.style.display = "none";
  booktikitSearchForm.style.display = "none";
}

function displaySearchForm() {
  blackdrop.style.display = "block";
  searchForm.style.display = "block";
  sideBar.style.display = "none";
}

function displayBookTikitFormSidebar() {
  blackdrop.style.display = "block";
  booktikitSearchForm.style.display = "block";
  sideBar.style.display = "none";
}

sidebarBtn.addEventListener("click", displaySidebar);
blackdrop.addEventListener("click", hideSidebar);

sidebarSearchBtn.addEventListener("click", displaySearchForm);
sidebarBooktikitBtn.addEventListener("click", displayBookTikitFormSidebar);
