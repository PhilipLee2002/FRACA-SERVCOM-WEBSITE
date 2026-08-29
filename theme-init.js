(function () {
  var stored = localStorage.getItem("fraca-theme");
  if (stored === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else if (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
