/* StockInsight AI — メインJS */

// ===== ハンバーガーメニュー =====
(function () {
  const btn = document.getElementById("hamburger-btn");
  const nav = document.getElementById("mobile-nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
    // メニュー外クリックで閉じる
    document.addEventListener("click", function (e) {
      if (!btn.contains(e.target) && !nav.contains(e.target)) {
        nav.classList.remove("open");
      }
    });
  }
})();

// ===== アクティブナビ =====
(function () {
  const path = location.pathname;
  document.querySelectorAll("header nav a").forEach(function (a) {
    const href = a.getAttribute("href") || "";
    if (href !== "/" && path.includes(href.replace(/^\/[^/]+/, ""))) {
      a.classList.add("active");
    }
  });
})();

// ===== バックテストチャート =====
window.initBacktestCharts = function (monthlyData, cumulativeData) {
  if (!window.Chart) return;

  // 月次リターンチャート
  var monthlyEl = document.getElementById("monthly-chart");
  if (monthlyEl && monthlyData && monthlyData.length) {
    var labels = monthlyData.map(function (d) { return d.year_month; });
    var returns = monthlyData.map(function (d) { return d.return_pct || 0; });
    var benchmarks = monthlyData.map(function (d) { return d.benchmark_return_pct || 0; });
    new Chart(monthlyEl, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "StockInsight AI",
            data: returns,
            backgroundColor: returns.map(function (v) {
              return v >= 0 ? "rgba(39,174,96,.7)" : "rgba(231,76,60,.7)";
            }),
            borderRadius: 3,
          },
          {
            label: "TOPIX（ベンチマーク）",
            data: benchmarks,
            type: "line",
            borderColor: "#e8a020",
            backgroundColor: "transparent",
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 2,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
        scales: {
          y: {
            ticks: { callback: function (v) { return v + "%"; } },
            grid: { color: "rgba(0,0,0,.06)" },
          },
          x: {
            ticks: { font: { size: 10 }, maxRotation: 45 },
            grid: { display: false },
          },
        },
      },
    });
  }

  // 累積リターンチャート
  var cumEl = document.getElementById("cumulative-chart");
  if (cumEl && cumulativeData && cumulativeData.length) {
    var cumLabels = cumulativeData.map(function (d) { return d.year_month || d.date || ""; });
    var cumAI   = cumulativeData.map(function (d) { return d.cumulative_return_pct || 0; });
    var cumBench = cumulativeData.map(function (d) { return d.benchmark_cumulative_pct || 0; });
    new Chart(cumEl, {
      type: "line",
      data: {
        labels: cumLabels,
        datasets: [
          {
            label: "StockInsight AI",
            data: cumAI,
            borderColor: "#1a3a5c",
            backgroundColor: "rgba(26,58,92,.08)",
            fill: true, tension: 0.3, borderWidth: 2, pointRadius: 2,
          },
          {
            label: "TOPIX（ベンチマーク）",
            data: cumBench,
            borderColor: "#e8a020",
            backgroundColor: "transparent",
            tension: 0.3, borderWidth: 2, borderDash: [4, 4], pointRadius: 2,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
        scales: {
          y: {
            ticks: { callback: function (v) { return v + "%"; } },
            grid: { color: "rgba(0,0,0,.06)" },
          },
          x: {
            ticks: { font: { size: 10 }, maxRotation: 45 },
            grid: { display: false },
          },
        },
      },
    });
  }
};
