(function () {
  "use strict";

  var STORAGE_KEY = "subjects_v1";
  var ALLOWED_MAJORS = ["Science", "Literary", "Math", "Technical Math"];

  var initialSubjects = [
    {
      code: "M001",
      name: "Mathematics",
      coefficient: 4,
      year: "2nd Year",
      major: "Science",
    },
    {
      code: "M002",
      name: "Physics",
      coefficient: 3,
      year: "2nd Year",
      major: "Science",
    },
    {
      code: "M003",
      name: "English",
      coefficient: 3,
      year: "2nd Year",
      major: "Science",
    },
    {
      code: "M004",
      name: "Philosophy",
      coefficient: 4,
      year: "3rd Year",
      major: "Literary",
    },
  ];

  var state = {
    subjects: [],
    modalOpen: false,
  };

  var el = {
    subjectsCount: document.getElementById("subjects-count"),
    tbody: document.getElementById("subjects-tbody"),
    newBtn: document.getElementById("new-subject-btn"),

    modal: document.getElementById("subject-modal"),
    modalClose: document.getElementById("modal-close"),
    modalBackdrop: document.querySelector(".modal-backdrop"),

    formMode: document.getElementById("form-mode"),
    formOldCode: document.getElementById("form-old-code"),
    form: document.getElementById("subject-form"),
    note: document.getElementById("form-note"),

    fieldCode: document.getElementById("field-code"),
    fieldName: document.getElementById("field-name"),
    fieldCoefficient: document.getElementById("field-coefficient"),
    fieldYear: document.getElementById("field-year"),
    fieldMajor: document.getElementById("field-major"),

    cancelBtn: document.getElementById("cancel-btn"),
    saveBtn: document.getElementById("save-btn"),
  };

  function parseSubjectsFromStorage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;

      return parsed
        .filter(function (s) {
          return s && typeof s.code === "string" && typeof s.name === "string";
        })
        .map(function (s) {
          return {
            code: String(s.code),
            name: String(s.name),
            coefficient:
              typeof s.coefficient === "number" ? s.coefficient : Number(s.coefficient || 0),
            year: String(s.year || "2nd Year"),
            major: ALLOWED_MAJORS.indexOf(String(s.major)) !== -1 ? String(s.major) : "Science",
          };
        });
    } catch (e) {
      return null;
    }
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.subjects));
  }

  function setModalOpen(open) {
    state.modalOpen = open;
    el.modal.hidden = !open;

    if (open) {
      setTimeout(function () {
        el.fieldCode.focus();
      }, 0);
    }
  }

  function showNote(message) {
    el.note.textContent = message || "";
  }

  function formatCoefficient(value) {
    var n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n)) n = 0;
    return n.toString();
  }

  function findByCode(code) {
    for (var i = 0; i < state.subjects.length; i++) {
      if (String(state.subjects[i].code) === String(code)) return state.subjects[i];
    }
    return null;
  }

  function computeCount() {
    var total = state.subjects.length;
    if (el.subjectsCount) el.subjectsCount.textContent = total + " subject(s) available";
  }

  function renderTable() {
    var tbody = el.tbody;
    if (!tbody) return;

    var subjects = state.subjects.slice().sort(function (a, b) {
      return String(a.code).localeCompare(String(b.code));
    });

    tbody.innerHTML = "";

    for (var i = 0; i < subjects.length; i++) {
      var s = subjects[i];
      var tr = document.createElement("tr");

      var tdCode = document.createElement("td");
      tdCode.textContent = s.code;

      var tdName = document.createElement("td");
      tdName.textContent = s.name;

      var tdCoeff = document.createElement("td");
      tdCoeff.className = "coef-cell";
      tdCoeff.textContent = formatCoefficient(s.coefficient);

      var tdYear = document.createElement("td");
      tdYear.textContent = s.year;

      var tdMajor = document.createElement("td");
      tdMajor.textContent = s.major;

      var tdActions = document.createElement("td");
      tdActions.className = "th-actions";

      var actions = document.createElement("div");
      actions.className = "actions";

      var editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "icon-action";
      editBtn.innerHTML = "✎";
      editBtn.setAttribute("aria-label", "Edit subject " + s.code);
      editBtn.dataset.action = "edit";
      editBtn.dataset.code = s.code;
      editBtn.addEventListener("click", onEditSubject);

      var delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "icon-action icon-action--delete";
      delBtn.innerHTML = "🗑";
      delBtn.setAttribute("aria-label", "Delete subject " + s.code);
      delBtn.dataset.action = "delete";
      delBtn.dataset.code = s.code;
      delBtn.addEventListener("click", onDeleteSubject);

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
      tdActions.appendChild(actions);

      tr.appendChild(tdCode);
      tr.appendChild(tdName);
      tr.appendChild(tdCoeff);
      tr.appendChild(tdYear);
      tr.appendChild(tdMajor);
      tr.appendChild(tdActions);

      tbody.appendChild(tr);
    }
  }

  function openCreateModal() {
    el.formMode.value = "create";
    el.formOldCode.value = "";
    showNote("");

    el.fieldCode.value = "";
    el.fieldCode.disabled = false;
    el.fieldName.value = "";
    el.fieldCoefficient.value = "";
    el.fieldYear.value = "2nd Year";
    el.fieldMajor.value = "Science";

    setModalOpen(true);
  }

  function openEditModal(code) {
    var subject = findByCode(code);
    if (!subject) return;

    el.formMode.value = "edit";
    el.formOldCode.value = subject.code;
    showNote("");

    el.fieldCode.value = subject.code;
    el.fieldCode.disabled = true;
    el.fieldName.value = subject.name;
    el.fieldCoefficient.value = String(subject.coefficient);
    el.fieldYear.value = subject.year;
    el.fieldMajor.value = subject.major;

    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    showNote("");
    if (el.form) el.form.reset();
  }

  function validateForm() {
    var mode = el.formMode.value;
    var code = el.fieldCode.value.trim();
    var name = el.fieldName.value.trim();
    var coefficient = Number(el.fieldCoefficient.value);
    var year = el.fieldYear.value;
    var major = el.fieldMajor.value;

    if (!code || !/^M\d{3}$/i.test(code)) return "Code must look like M001 (M + 3 digits).";
    if (!name) return "Subject Name is required.";
    if (!Number.isFinite(coefficient)) return "Coefficient must be a number.";
    if (coefficient < 0 || coefficient > 10) return "Coefficient must be between 0 and 10.";
    if (!year) return "Year is required.";
    if (!major) return "Major is required.";
    if (ALLOWED_MAJORS.indexOf(major) === -1) return "Major must be one of: Science, Literary, Math, Technical Math.";

    var existing = findByCode(code);
    if (mode === "create") {
      if (existing) return "This code already exists.";
    } else if (mode === "edit") {
      if (existing && String(existing.code) !== String(el.formOldCode.value)) return "This code already exists.";
    }

    return "";
  }

  function getSubjectFromForm() {
    return {
      code: el.fieldCode.value.trim().toUpperCase(),
      name: el.fieldName.value.trim(),
      coefficient: Number(el.fieldCoefficient.value),
      year: el.fieldYear.value,
      major: el.fieldMajor.value,
    };
  }

  function onEditSubject(e) {
    var code = e && e.currentTarget ? e.currentTarget.dataset.code : "";
    openEditModal(code);
  }

  function onDeleteSubject(e) {
    var code = e && e.currentTarget ? e.currentTarget.dataset.code : "";
    var subject = findByCode(code);
    if (!subject) return;

    var ok = window.confirm(
      "Delete subject " + subject.name + " (" + subject.code + ")?"
    );
    if (!ok) return;

    state.subjects = state.subjects.filter(function (s) {
      return String(s.code) !== String(code);
    });

    saveToStorage();
    computeCount();
    renderTable();
  }

  function attachEvents() {
    if (el.newBtn) {
      el.newBtn.addEventListener("click", function () {
        openCreateModal();
      });
    }

    if (el.modalClose) el.modalClose.addEventListener("click", closeModal);
    if (el.cancelBtn) el.cancelBtn.addEventListener("click", closeModal);

    if (el.modalBackdrop) {
      el.modalBackdrop.addEventListener("click", function () {
        closeModal();
      });
    }

    document.addEventListener("keydown", function (event) {
      if (!state.modalOpen) return;
      if (event.key === "Escape") closeModal();
    });

    if (el.form) {
      el.form.addEventListener("submit", function (event) {
        event.preventDefault();

        var message = validateForm();
        if (message) {
          showNote(message);
          return;
        }

        var mode = el.formMode.value;
        var subject = getSubjectFromForm();

        if (mode === "create") {
          state.subjects.push(subject);
        } else {
          var oldCode = el.formOldCode.value;
          for (var i = 0; i < state.subjects.length; i++) {
            if (String(state.subjects[i].code) === String(oldCode)) {
              state.subjects[i] = subject;
              break;
            }
          }
        }

        saveToStorage();
        computeCount();
        renderTable();
        closeModal();
      });
    }
  }

  function init() {
    var stored = parseSubjectsFromStorage();
    state.subjects = stored || initialSubjects;
    attachEvents();
    computeCount();
    renderTable();
  }

  init();
})();

