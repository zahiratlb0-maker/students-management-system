(function () {
  "use strict";

  var SOURCES = {
    students: "students_v1",
    subjects: "subjects_v1",
    results: "results_v1",
  };

  var state = {
    type: "students",
    students: [],
    subjects: [],
    results: [],
  };

  var el = {
    tabs: Array.prototype.slice.call(document.querySelectorAll(".tab")),
    title: document.getElementById("search-title"),
    help: document.getElementById("search-help"),
    form: document.getElementById("search-form"),
    input: document.getElementById("search-input"),
    count: document.getElementById("results-count"),
    wrap: document.getElementById("results-wrap"),
  };

  function parseArray(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function loadData() {
    state.students = parseArray(SOURCES.students);
    state.subjects = parseArray(SOURCES.subjects);
    state.results = parseArray(SOURCES.results);
  }

  function normalize(s) {
    return String(s || "").toLowerCase().trim();
  }

  function match(text, q) {
    return normalize(text).indexOf(q) !== -1;
  }

  function formatGrade(n) {
    var v = Number(n);
    if (!Number.isFinite(v)) v = 0;
    return v.toFixed(2) + " / 20";
  }

  function getDataset() {
    if (state.type === "students") return state.students;
    if (state.type === "subjects") return state.subjects;
    return state.results;
  }

  function getFiltered(query) {
    var q = normalize(query);
    var list = getDataset();

    if (!q) return list.slice();

    if (state.type === "students") {
      return list.filter(function (s) {
        return (
          match(s.code, q) ||
          match(s.lastName, q) ||
          match(s.firstName, q) ||
          match(s.major, q) ||
          match((s.firstName || "") + " " + (s.lastName || ""), q)
        );
      });
    }

    if (state.type === "subjects") {
      return list.filter(function (s) {
        return (
          match(s.code, q) ||
          match(s.name, q) ||
          match(s.year, q) ||
          match(s.major, q) ||
          match(s.coefficient, q)
        );
      });
    }

    return list.filter(function (r) {
      return (
        match(r.studentCode, q) ||
        match(r.studentName, q) ||
        match(r.subjectCode, q) ||
        match(r.subjectName, q) ||
        match(r.grade, q)
      );
    });
  }

  function tabMeta(type) {
    if (type === "students") {
      return {
        title: "Search for a Student",
        help: "Search by code, last name, first name or major...",
        placeholder: "Enter code, last name, first name or major...",
      };
    }
    if (type === "subjects") {
      return {
        title: "Search for a Subject",
        help: "Search by code, subject name, year, major or coefficient...",
        placeholder: "Enter code, subject name, year, major or coefficient...",
      };
    }
    return {
      title: "Search for a Result",
      help: "Search by student, subject, code or grade...",
      placeholder: "Enter student name, subject name, code or grade...",
    };
  }

  function drawItem(item) {
    var card = document.createElement("article");
    card.className = "result-item";

    var main = document.createElement("p");
    main.className = "result-main";

    var sub = document.createElement("p");
    sub.className = "result-sub";

    if (state.type === "students") {
      main.textContent = item.code + " - " + item.firstName + " " + item.lastName;
      sub.textContent = item.year + " | " + item.major + " | Avg: " + Number(item.average || 0).toFixed(2);
    } else if (state.type === "subjects") {
      main.textContent = item.code + " - " + item.name;
      sub.textContent = item.year + " | " + item.major + " | Coef: " + item.coefficient;
    } else {
      main.textContent = item.studentCode + " - " + item.studentName;
      sub.textContent = item.subjectCode + " - " + item.subjectName + " | Grade: " + formatGrade(item.grade);
    }

    card.appendChild(main);
    card.appendChild(sub);
    return card;
  }

  function render(list) {
    el.wrap.innerHTML = "";
    el.count.textContent = "";
    if (list.length === 0) return;

    for (var i = 0; i < list.length; i++) {
      el.wrap.appendChild(drawItem(list[i]));
    }
  }

  function switchTab(type) {
    state.type = type;
    for (var i = 0; i < el.tabs.length; i++) {
      var active = el.tabs[i].dataset.type === type;
      el.tabs[i].classList.toggle("is-active", active);
      el.tabs[i].setAttribute("aria-selected", active ? "true" : "false");
    }

    var meta = tabMeta(type);
    el.title.textContent = meta.title;
    el.help.textContent = meta.help;
    el.input.placeholder = meta.placeholder;

    render(getFiltered(el.input.value));
  }

  function bindEvents() {
    for (var i = 0; i < el.tabs.length; i++) {
      el.tabs[i].addEventListener("click", function (event) {
        switchTab(event.currentTarget.dataset.type);
      });
    }

    el.form.addEventListener("submit", function (event) {
      event.preventDefault();
      render(getFiltered(el.input.value));
    });

    el.input.addEventListener("input", function () {
      render(getFiltered(el.input.value));
    });
  }

  function init() {
    loadData();
    bindEvents();
    switchTab("students");
  }

  init();
})();

