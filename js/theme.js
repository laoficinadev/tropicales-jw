(function() {
  function applyTheme() {
    var saved = localStorage.getItem('theme');
    if (saved === 'light') { document.documentElement.classList.remove('dark'); }
    else { document.documentElement.classList.add('dark'); }
    updateIcon();
  }
  function updateIcon() {
    var btn = document.getElementById('darkToggle');
    if (!btn) return;
    var isDark = document.documentElement.classList.contains('dark');
    btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }
  applyTheme();
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('#darkToggle');
    if (btn) {
      var isDark = document.documentElement.classList.contains('dark');
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'light' : 'dark');
      updateIcon();
    }
  });
})();
