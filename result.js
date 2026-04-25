(function () {
  "use strict";

  var STORAGE_KEY = "results_v1";

  var initialResults = [
    { id: "R001", studentCode: "E001", studentName: "Asmae Taleb", subjectCode: "M001", subjectName: "Mathematics", grade: 16.0 },
    { id: "R002", studentCode: "E001", studentName: "Asmae Taleb", subjectCode: "M002", subjectName: "Physics", grade: 15.0 },
    { id: "R003", studentCode: "E001", studentName: "Asmae Taleb", subjectCode: "M003", subjectName: "English", grade: 15.5 },
    { id: "R004", studentCode: "E002", studentName: "Hamza Saib", subjectCode: "M001", subjectName: "Mathematics", grade: 14.0 },
    { id: "R005", studentCode: "E002", studentName: "Hamza Saib", subjectCode: "M002", subjectName: "Physics", grade: 14.5 },
    { id: "R006", studentCode: "E002", studentName: "Hamza Saib", subjectCode: "M003", subjectName: "English", grade: 14.5 },
    { id: "R007", studentCode: "E003", studentName: "Imen Yettou", subjectCode: "M004", subjectName: "Philosophy", grade: 14.0 },
  ];

  var state = {
    results: [],
    modalOpen: false,
  };

  var el = {
    count: document.getElementById("results-count"),
    tbody: document.getElementById("results-tbody"),
    newBtn: document.getElementById("new-result-btn"),

    modal: document.getElementById("result-modal"),
    closeBtn: document.getElementById("modal-close"),
    backdrop: document.querySelector(".modal-backdrop"),
    form: document.getElementById("result-form"),
    note: document.getElementById("form-note"),
    mode: document.getElementById("form-mode"),
    formId: document.getElementById("form-id"),

    studentCode: document.getElementById("field-student-code"),
    studentName: document.getElementById("field-student-name"),
    subjectCode: document.getElementById("field-subject-code"),
    subjectName: document.getElementById("field-subject-name"),
    grade: document.getElementById("field-grade"),

    cancelBtn: document.getElementById("cancel-btn"),
  };

  function parseStorage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      return parsed
        .filter(function (r) {
          return r && r.id && r.studentCode && r.subjectCode;
        })
        .map(function (r) {
          return {
            id: String(r.id),
            studentCode: String(r.studentCode),
            studentName: String(r.studentName || ""),
            subjectCode: String(r.subjectCode),
            subjectName: String(r.subjectName || ""),
            grade: Number(r.grade || 0),
          };
        });
    } catch (e) {
      return null;
    }
  }

  function saveStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.results));
  }

  function uid() {
    return "R" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  }

  function setModalOpen(open) {
    state.modalOpen = open;
    el.modal.hidden = !open;
    if (open) {
      setTimeout(function () {
        el.studentCode.focus();
      }, 0);
    }
  }

  function showNote(msg) {
    el.note.textContent = msg || "";
  }

  function formatGrade(value) {
    var n = Number(value);
    if (!Number.isFinite(n)) n = 0;
    return n.toFixed(2) + " / 20";
  }

  function updateCount() {
    el.count.textContent = state.results.length + " result(s) recorded";
  }

  function findById(id) {
    for (var i = 0; i < state.results.length; i++) {
      if (String(state.results[i].id) === String(id)) return state.results[i];
    }
    return null;
  }

  function renderTable() {
    el.tbody.innerHTML = "";

    for (var i = 0; i < state.results.length; i++) {
      var r = state.results[i];
      var tr = document.createElement("tr");

      function td(text) {
        var cell = document.createElement("td");
        cell.textContent = text;
        return cell;
      }

      tr.appendChild(td(r.studentCode));
      tr.appendChild(td(r.studentName));
      tr.appendChild(td(r.subjectCode));
      tr.appendChild(td(r.subjectName));

      var gradeTd = document.createElement("td");
      var gradeSpan = document.createElement("span");
      gradeSpan.className = "grade-value";
      gradeSpan.textContent = formatGrade(r.grade);
      gradeTd.appendChild(gradeSpan);
      tr.appendChild(gradeTd);

      var actionsTd = document.createElement("td");
      actionsTd.className = "th-actions";
      var actions = document.createElement("div");
      actions.className = "actions";

      var modifyBtn = document.createElement("button");
      modifyBtn.type = "button";
      modifyBtn.className = "icon-action";
      modifyBtn.innerHTML = "✎";
      modifyBtn.setAttribute("aria-label", "Modify result");
      modifyBtn.dataset.id = r.id;
      modifyBtn.addEventListener("click", onModify);

      var deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "icon-action icon-action--delete";
      deleteBtn.innerHTML = "🗑";
      deleteBtn.setAttribute("aria-label", "Delete result");
      deleteBtn.dataset.id = r.id;
      deleteBtn.addEventListener("click", onDelete);

      actions.appendChild(modifyBtn);
      actions.appendChild(deleteBtn);
      actionsTd.appendChild(actions);
      tr.appendChild(actionsTd);

      el.tbody.appendChild(tr);
    }
  }

  function openCreate() {
    el.mode.value = "create";
    el.formId.value = "";
    showNote("");
    el.form.reset();
    setModalOpen(true);
  }

  function openModify(id) {
    var r = findById(id);
    if (!r) return;

    el.mode.value = "edit";
    el.formId.value = r.id;
    showNote("");

    el.studentCode.value = r.studentCode;
    el.studentName.value = r.studentName;
    el.subjectCode.value = r.subjectCode;
    el.subjectName.value = r.subjectName;
    el.grade.value = String(r.grade);

    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    showNote("");
  }

  function validate() {
    var studentCode = el.studentCode.value.trim();
    var studentName = el.studentName.value.trim();
    var subjectCode = el.subjectCode.value.trim();
    var subjectName = el.subjectName.value.trim();
    var grade = Number(el.grade.value);

    if (!/^E\d{3}$/i.test(studentCode)) return "Student Code must look like E001.";
    if (!studentName) return "Student Name is required.";
    if (!/^M\d{3}$/i.test(subjectCode)) return "Subject Code must look like M001.";
    if (!subjectName) return "Subject Name is required.";
    if (!Number.isFinite(grade)) return "Grade must be a number.";
    if (grade < 0 || grade > 20) return "Grade must be between 0 and 20.";

    return "";
  }

  function getFormData() {
    return {
      id: el.formId.value || uid(),
      studentCode: el.studentCode.value.trim().toUpperCase(),
      studentName: el.studentName.value.trim(),
      subjectCode: el.subjectCode.value.trim().toUpperCase(),
      subjectName: el.subjectName.value.trim(),
      grade: Number(el.grade.value),
    };
  }

  function onModify(e) {
    openModify(e.currentTarget.dataset.id);
  }

  function onDelete(e) {
    var id = e.currentTarget.dataset.id;
    var r = findById(id);
    if (!r) return;

    var ok = window.confirm("Delete result for " + r.studentName + " - " + r.subjectName + "?");
    if (!ok) return;

    state.results = state.results.filter(function (x) {
      return String(x.id) !== String(id);
    });
    saveStorage();
    updateCount();
    renderTable();
  }

  function bindEvents() {
    el.newBtn.addEventListener("click", openCreate);
    el.closeBtn.addEventListener("click", closeModal);
    el.cancelBtn.addEventListener("click", closeModal);
    el.backdrop.addEventListener("click", closeModal);

    document.addEventListener("keydown", function (event) {
      if (state.modalOpen && event.key === "Escape") closeModal();
    });

    el.form.addEventListener("submit", function (event) {
      event.preventDefault();

      var msg = validate();
      if (msg) {
        showNote(msg);
        return;
      }

      var data = getFormData();
      if (el.mode.value === "create") {
        state.results.push(data);
      } else {
        for (var i = 0; i < state.results.length; i++) {
          if (String(state.results[i].id) === String(data.id)) {
            state.results[i] = data;
            break;
          }
        }
      }

      saveStorage();
      updateCount();
      renderTable();
      closeModal();
    });
  }

  function init() {
    var stored = parseStorage();
    state.results = stored || initialResults;
    bindEvents();
    updateCount();
    renderTable();
  }

  init();
})();

