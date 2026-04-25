(function () {
  "use strict";

  var STUDENTS_KEY = "students_v1";

  var fallbackStudents = [
    { code: "E001", lastName: "Taleb", firstName: "Asmae", year: "2nd Year", major: "Science", average: 15.5 },
    { code: "E002", lastName: "Saib", firstName: "Hamza", year: "2nd Year", major: "Science", average: 14.2 },
    { code: "E003", lastName: "Yettou", firstName: "Imen", year: "3rd Year", major: "Literary", average: 16.8 },
  ];

  var state = {
    students: [],
    major: "All",
    year: "All",
  };

  var el = {
    total: document.getElementById("stat-total"),
    avg: document.getElementById("stat-average"),
    passed: document.getElementById("stat-passed"),
    failed: document.getElementById("stat-failed"),
    filterMajor: document.getElementById("filter-major"),
    filterYear: document.getElementById("filter-year"),
    tbody: document.getElementById("ranking-tbody"),
    podium: document.getElementById("podium"),
  };

  function parseStudents() {
    try {
      var raw = localStorage.getItem(STUDENTS_KEY);
      if (!raw) return fallbackStudents.slice();
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) return fallbackStudents.slice();
      return parsed.map(function (s) {
        return {
          code: String(s.code || ""),
          lastName: String(s.lastName || ""),
          firstName: String(s.firstName || ""),
          year: String(s.year || ""),
          major: String(s.major || ""),
          average: Number(s.average || 0),
        };
      });
    } catch (e) {
      return fallbackStudents.slice();
    }
  }

  function uniqueValues(key) {
    var out = [];
    for (var i = 0; i < state.students.length; i++) {
      var v = state.students[i][key];
      if (v && out.indexOf(v) === -1) out.push(v);
    }
    out.sort();
    return out;
  }

  function fillSelect(select, values) {
    select.innerHTML = "";
    var all = document.createElement("option");
    all.value = "All";
    all.textContent = "All";
    select.appendChild(all);

    for (var i = 0; i < values.length; i++) {
      var op = document.createElement("option");
      op.value = values[i];
      op.textContent = values[i];
      select.appendChild(op);
    }
  }

  function getFiltered() {
    var list = state.students.slice();
    if (state.major !== "All") {
      list = list.filter(function (s) {
        return s.major === state.major;
      });
    }
    if (state.year !== "All") {
      list = list.filter(function (s) {
        return s.year === state.year;
      });
    }
    list.sort(function (a, b) {
      if (b.average !== a.average) return b.average - a.average;
      return a.code.localeCompare(b.code);
    });
    return list;
  }

  function honorLabel(avg) {
    if (avg >= 16) return "Summa Cum Laude";
    if (avg >= 14) return "Magna Cum Laude";
    if (avg >= 12) return "Cum Laude";
    if (avg >= 10) return "Pass";
    return "At Risk";
  }

  function renderStats(list) {
    var total = list.length;
    var sum = 0;
    var passed = 0;
    for (var i = 0; i < list.length; i++) {
      var a = Number(list[i].average || 0);
      sum += a;
      if (a >= 10) passed += 1;
    }
    var failed = total - passed;
    var avg = total ? sum / total : 0;

    el.total.textContent = String(total);
    el.avg.textContent = avg.toFixed(2);
    el.passed.textContent = String(passed);
    el.failed.textContent = String(failed);
  }

  function renderTable(list) {
    el.tbody.innerHTML = "";
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      var tr = document.createElement("tr");

      var rankCell = document.createElement("td");
      rankCell.textContent = (i + 1 <= 3 ? ["🥇", "🥈", "🥉"][i] + " " : "") + String(i + 1);

      var code = document.createElement("td");
      code.textContent = s.code;
      var ln = document.createElement("td");
      ln.textContent = s.lastName;
      var fn = document.createElement("td");
      fn.textContent = s.firstName;
      var year = document.createElement("td");
      year.textContent = s.year;
      var major = document.createElement("td");
      major.textContent = s.major;

      var avg = document.createElement("td");
      avg.className = "avg";
      avg.textContent = Number(s.average || 0).toFixed(2);

      var honors = document.createElement("td");
      var badge = document.createElement("span");
      badge.className = "badge" + (s.average >= 14 ? " badge--high" : "");
      badge.textContent = honorLabel(Number(s.average || 0));
      honors.appendChild(badge);

      tr.appendChild(rankCell);
      tr.appendChild(code);
      tr.appendChild(ln);
      tr.appendChild(fn);
      tr.appendChild(year);
      tr.appendChild(major);
      tr.appendChild(avg);
      tr.appendChild(honors);
      el.tbody.appendChild(tr);
    }
  }

  function renderPodium(list) {
    el.podium.innerHTML = "";
    var medals = ["🥇", "🥈", "🥉"];
    for (var i = 0; i < 3; i++) {
      var card = document.createElement("article");
      card.className = "podium-card";

      if (!list[i]) {
        card.innerHTML = '<div class="podium-place">—</div><div class="podium-rank">' + (i + 1) + " Place</div>";
        el.podium.appendChild(card);
        continue;
      }

      var s = list[i];
      card.innerHTML =
        '<div class="podium-place">' +
        medals[i] +
        '</div><div class="podium-rank">' +
        (i + 1) +
        ' Place</div><div class="podium-name">' +
        s.firstName +
        " " +
        s.lastName +
        '</div><div class="podium-avg">' +
        Number(s.average || 0).toFixed(2) +
        '</div><div class="podium-sub">' +
        s.year +
        " - " +
        s.major +
        "</div>";
      el.podium.appendChild(card);
    }
  }

  function update() {
    var filtered = getFiltered();
    renderStats(filtered);
    renderTable(filtered);
    renderPodium(filtered);
  }

  function bindEvents() {
    el.filterMajor.addEventListener("change", function () {
      state.major = el.filterMajor.value;
      update();
    });
    el.filterYear.addEventListener("change", function () {
      state.year = el.filterYear.value;
      update();
    });
  }

  function init() {
    state.students = parseStudents();
    fillSelect(el.filterMajor, uniqueValues("major"));
    fillSelect(el.filterYear, uniqueValues("year"));
    bindEvents();
    update();
  }

  init();
})();

