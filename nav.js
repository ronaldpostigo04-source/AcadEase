function toggleMenu() {
  document.getElementById("sideNav").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
}

// Load navigation.html into each page
fetch("navigation.html")
  .then(res => res.text())
  .then(data => {
    document.body.insertAdjacentHTML("afterbegin", data);
  });
