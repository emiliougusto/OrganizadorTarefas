const chk = document.getElementById("chk");

window.addEventListener("DOMContentLoaded", () => {
  const theme = localStorage.getItem("optiplus_theme");
  if (theme === "dark") {
    document.body.classList.add("dark");
    if (chk) chk.checked = true;
  }
});

if (chk) {
  chk.addEventListener("change", () => {
    const isDark = chk.checked;
    document.body.classList.toggle("dark", isDark);
    localStorage.setItem("optiplus_theme", isDark ? "dark" : "light");

    // Efeito visual suave
    document.body.style.transition = "all 0.3s ease";
    setTimeout(() => {
      document.body.style.transition = "";
    }, 300);
  });
}
