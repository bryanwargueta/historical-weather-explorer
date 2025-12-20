//Load navigation bar
fetch("components/nav-bar.html")
  .then((response) => response.text())
  .then((html) => {
    document.getElementById("nav-placeholder").innerHTML = html;
  })
  .catch((err) => console.error("Error loading nav:", err));

//Load footer
fetch("components/footer.html")
  .then((response) => response.text())
  .then((html) => {
    document.getElementById("footer-placeholder").innerHTML = html;
  })
  .catch((err) => console.error("Error loading footer:", err));
