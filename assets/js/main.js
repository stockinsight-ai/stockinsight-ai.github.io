/* StockInsight AI — メインJS */

// ===== 指標ツールチップ =====
(function () {
  var tips = {
    "win_rate":      { title: "勝率（12週後 +10%達成）とは", body: "推奨した銘柄のうち、選定から約3ヶ月後（12週後）に株価が+10%以上になっていた割合です。\n\n例：10銘柄中7銘柄が+10%以上 → 勝率70%\n\nバックテスト期間（2023〜2025年）の集計結果です。" },
    "avg_return":    { title: "平均騰落率とは", body: "推奨した全銘柄の、12週後の株価変化率の平均値です。\n\n+4.99%であれば、平均的に約5%値上がりしていたことを意味します。マイナス銘柄も含めた平均です。" },
    "sharpe":        { title: "シャープレシオとは", body: "リスク（値動きの激しさ）に対して、どれだけ効率よくリターンを得られたかを示す指標です。\n\n■ 目安\n1.0以上：良好\n2.0以上：優秀\n\n数値が大きいほど、安定して利益を上げていることを意味します。" },
    "drawdown":      { title: "最大ドローダウンとは", body: "ポートフォリオの価値が、最高値からどこまで下落したかの最大値です。\n\n例：-12.17%であれば、最も悪い時期に最高値から約12%下げた、という意味です。\n\n小さいほどリスクが低いことを示します。" },
    "total_return":  { title: "累計リターンとは", body: "バックテスト期間（2023〜2025年）全体を通じた、ストラテジーの合計騰落率です。\n\n毎月の月次リターンを複利で積み上げた結果です。" },
    "benchmark":     { title: "TOPIX累計（同期間）とは", body: "同じ期間に日本全体の株価指数「TOPIX」が何%上昇したかを示します。\n\nStockInsight AIの成績との比較に使います。上回れば「市場平均に勝った」ことを意味します。" },
  };

  function showTip(key) {
    var t = tips[key];
    if (!t) return;
    var overlay = document.getElementById("tip-overlay");
    if (!overlay) return;
    overlay.querySelector(".tip-modal-title").textContent = t.title;
    overlay.querySelector(".tip-modal-body").innerHTML = t.body.replace(/\n/g, "<br>");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function hideTip() {
    var overlay = document.getElementById("tip-overlay");
    if (!overlay) return;
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  document.addEventListener("DOMContentLoaded", function () {
    // ボタンクリック
    document.querySelectorAll(".tip-icon[data-tip]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        showTip(btn.getAttribute("data-tip"));
      });
    });
    // 閉じるボタン
    var closeBtn = document.getElementById("tip-close");
    if (closeBtn) closeBtn.addEventListener("click", hideTip);
    // オーバーレイクリックで閉じる
    var overlay = document.getElementById("tip-overlay");
    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) hideTip();
      });
    }
    // ESCキー
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") hideTip();
    });
  });
})();

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
    var cumAI   = cumulativeData.map(function (d) { return d.strategy != null ? d.strategy : (d.cumulative_return_pct || 0); });
    var cumBench = cumulativeData.map(function (d) { return d.benchmark != null ? d.benchmark : (d.benchmark_cumulative_pct || 0); });
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
