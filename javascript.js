const menuButton = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

// Mobile navbar
menuButton.addEventListener("click", function () {
  const isOpen = navMenu.classList.toggle("show");
  menuButton.setAttribute("aria-expanded", isOpen);
});

// Search fundraisers
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const photos = document.querySelectorAll(".photo-col");
const noResults = document.getElementById("noResults");

searchForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const keyword = searchInput.value.trim().toLowerCase();
  let matches = 0;

  photos.forEach(function (photo) {
    const title = photo.dataset.title;

    if (title.includes(keyword)) {
      photo.hidden = false;
      matches++;
    } else {
      photo.hidden = true;
    }
  });

  noResults.hidden = matches > 0;
});
