// 첫 화면의 카테고리 필터
(function () {
  var filters = document.getElementById('filters');
  var list = document.getElementById('post-list');
  if (!filters || !list) return;
  filters.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    var cat = btn.dataset.cat;
    filters.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b === btn));
    });
    list.querySelectorAll('.post-row').forEach(function (row) {
      var cats = row.dataset.cats ? row.dataset.cats.split('|') : [];
      row.hidden = !!cat && cats.indexOf(cat) === -1;
    });
  });
})();
