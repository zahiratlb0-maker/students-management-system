(function () {
  "use strict";

  var STORAGE_KEY = "students_v1";
  var ALLOWED_MAJORS = ["Science", "Literary", "Math", "Technical Math"];

  var initialStudents = [
    {
      code: "E001",
      lastName: "Taleb",
      firstName: "Asmae",
      birthDate: "2008-05-15",
      gender: "Female",
      year: "2nd Year",
      major: "Science",
      average: 15.5,
    },
    {
      code: "E002",
      lastName: "Saib",
      firstName: "Hamza",
      birthDate: "2008-03-22",
      gender: "Male",
      year: "2nd Year",
      major: "Science",
      average: 14.2,
    },
    {
      code: "E003",
      lastName: "Yettou",
      firstName: "Imen",
      birthDate: "2007-11-10",
      gender: "Female",
      year: "3rd Year",
      major: "Literary",
      average: 16.8,
    },
  ];

  var state = {
    students: [],
  };

  var el = {
    totalStudents: document.getElementById("total-students"),
    enrolledCount: document.getElementById("enrolled-count"),
    globalAverage: document.getElementById("global-average"),
    globalAverageDate: document.getElementById("global-average-date"),
    bestName: document.getElementById("best-name"),
    bestCode: document.getElementById("best-code"),
    bestAverage: document.getElementById("best-average"),

    studentsCount: document.getElementById("students-count"),
    tbody: document.getElementById("students-tbody"),

    newBtn: document.getElementById("new-student-btn"),

    modal: document.getElementById("student-modal"),
    modalClose: document.getElementById("modal-close"),
    modalBackdrop: document.querySelector(".modal-backdrop"),

    formMode: document.getElementById("form-mode"),
    formOldCode: document.getElementById("form-old-code"),
    form: document.getElementById("student-form"),
    note: document.getElementById("form-note"),

    fieldCode: document.getElementById("field-code"),
    fieldLastName: document.getElementById("field-last-name"),
    fieldFirstName: document.getElementById("field-first-name"),
    fieldBirthDate: document.getElementById("field-birth-date"),
    fieldGender: document.getElementById("field-gender"),
    fieldYear: document.getElementById("field-year"),
    fieldMajor: document.getElementById("field-major"),
    fieldAverage: document.getElementById("field-average"),

    cancelBtn: document.getElementById("cancel-btn"),
    saveBtn: document.getElementById("save-btn"),
  };

  function parseStudentsFromStorage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;

      // minimal shape validation
      return parsed
        .filter(function (s) {
          return s && typeof s.code === "string" && typeof s.lastName === "string";
        })
        .map(function (s) {
          return {
            code: String(s.code),
            lastName: String(s.lastName),
            firstName: String(s.firstName || ""),
            birthDate: String(s.birthDate || ""),
            gender: String(s.gender || "Other"),
            year: String(s.year || "1st Year"),
            major: ALLOWED_MAJORS.indexOf(String(s.major)) !== -1 ? String(s.major) : "Science",
            average: typeof s.average === "number" ? s.average : Number(s.average || 0),
          };
        });
    } catch (e) {
      return null;
    }
  }

  function setModalOpen(open) {
    state.modalOpen = open;
    el.modal.hidden = !open;

    if (open) {
      // Focus first field for faster keyboard input.
      setTimeout(function () {
        el.fieldCode.focus();
      }, 0);
    }
  }

  function showNote(message) {
    el.note.textContent = message || "";
  }

  function formatDateForView(isoDate) {
    // Input is YYYY-MM-DD; view wants MM/DD/YYYY like the screenshot.
    if (!isoDate) return "—";
    var d = new Date(isoDate + "T00:00:00");
    if (Number.isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString("en-US");
  }

  function formatAverage(value) {
    var n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n)) n = 0;
    return n.toFixed(2);
  }

  function computeStats() {
    var students = state.students;
    var total = students.length;

    // In this UI, all students are considered "enrolled".
    el.totalStudents.textContent = String(total);
    el.enrolledCount.textContent = String(total);
    el.studentsCount.textContent = total + " student(s) enrolled";

    var sum = 0;
    for (var i = 0; i < students.length; i++) sum += Number(students[i].average || 0);
    var avg = total > 0 ? sum / total : 0;
    el.globalAverage.textContent = formatAverage(avg);

    // Show a stable "April 2024" style date label if needed.
    // Here we show current month/year in a similar compact format.
    var now = new Date();
    el.globalAverageDate.textContent = "Updated " + now.toLocaleDateString("en-US", { year: "numeric", month: "short" });

    // Best student = highest average, tie => smaller code.
    var best = null;
    for (var j = 0; j < students.length; j++) {
      var s = students[j];
      if (!best) {
        best = s;
        continue;
      }
      var sb = Number(s.average || 0);
      var bb = Number(best.average || 0);
      if (sb > bb || (sb === bb && String(s.code) < String(best.code))) best = s;
    }

    if (best) {
      el.bestName.textContent = best.firstName + " " + best.lastName;
      el.bestCode.textContent = best.code;
      el.bestAverage.textContent = formatAverage(best.average);
    } else {
      el.bestName.textContent = "—";
      el.bestCode.textContent = "—";
      el.bestAverage.textContent = "0.00";
    }
  }

  function renderTable() {
    var tbody = el.tbody;
    var students = state.students.slice().sort(function (a, b) {
      // Keep stable & intuitive: by code.
      return String(a.code).localeCompare(String(b.code));
    });

    tbody.innerHTML = "";

    for (var i = 0; i < students.length; i++) {
      var s = students[i];
      var tr = document.createElement("tr");

      var tdCode = document.createElement("td");
      tdCode.textContent = s.code;

      var tdLast = document.createElement("td");
      tdLast.textContent = s.lastName;

      var tdFirst = document.createElement("td");
      tdFirst.textContent = s.firstName;

      var tdBirth = document.createElement("td");
      tdBirth.textContent = formatDateForView(s.birthDate);

      var tdGender = document.createElement("td");
      tdGender.textContent = s.gender;

      var tdYear = document.createElement("td");
      tdYear.textContent = s.year;

      var tdMajor = document.createElement("td");
      tdMajor.textContent = s.major;

      var tdAvg = document.createElement("td");
      tdAvg.className = "th-right";
      tdAvg.textContent = formatAverage(s.average);

      var tdActions = document.createElement("td");
      tdActions.className = "th-actions";

      var actions = document.createElement("div");
      actions.className = "actions";

      var editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "icon-action";
      editBtn.setAttribute("aria-label", "Edit student " + s.code);
      editBtn.innerHTML = "✎";
      editBtn.dataset.action = "edit";
      editBtn.dataset.code = s.code;
      editBtn.addEventListener("click", onEditStudent);

      var delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "icon-action icon-action--delete";
      delBtn.setAttribute("aria-label", "Delete student " + s.code);
      delBtn.innerHTML = "🗑";
      delBtn.dataset.action = "delete";
      delBtn.dataset.code = s.code;
      delBtn.addEventListener("click", onDeleteStudent);

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
      tdActions.appendChild(actions);

      tr.appendChild(tdCode);
      tr.appendChild(tdLast);
      tr.appendChild(tdFirst);
      tr.appendChild(tdBirth);
      tr.appendChild(tdGender);
      tr.appendChild(tdYear);
      tr.appendChild(tdMajor);
      tr.appendChild(tdAvg);
      tr.appendChild(tdActions);

      tbody.appendChild(tr);
    }
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.students));
  }

  function findByCode(code) {
    for (var i = 0; i < state.students.length; i++) {
      if (String(state.students[i].code) === String(code)) return state.students[i];
    }
    return null;
  }

  function openCreateModal() {
    el.formMode.value = "create";
    el.formOldCode.value = "";
    showNote("");

    el.fieldCode.value = "";
    el.fieldCode.disabled = false;
    el.fieldLastName.value = "";
    el.fieldFirstName.value = "";
    el.fieldBirthDate.value = "";
    el.fieldGender.value = "Female";
    el.fieldYear.value = "2nd Year";
    el.fieldMajor.value = "Science";
    el.fieldAverage.value = "";

    setModalOpen(true);
  }

  function openEditModal(code) {
    var student = findByCode(code);
    if (!student) return;

    el.formMode.value = "edit";
    el.formOldCode.value = student.code;
    showNote("");

    el.fieldCode.value = student.code;
    el.fieldCode.disabled = true;
    el.fieldLastName.value = student.lastName;
    el.fieldFirstName.value = student.firstName;
    el.fieldBirthDate.value = student.birthDate;
    el.fieldGender.value = student.gender;
    el.fieldYear.value = student.year;
    el.fieldMajor.value = student.major;
    el.fieldAverage.value = formatAverage(student.average);

    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    showNote("");
    el.form.reset();
  }

  function validateForm() {
    var mode = el.formMode.value;
    var code = el.fieldCode.value.trim();
    var lastName = el.fieldLastName.value.trim();
    var firstName = el.fieldFirstName.value.trim();
    var birthDate = el.fieldBirthDate.value;
    var gender = el.fieldGender.value;
    var year = el.fieldYear.value;
    var major = el.fieldMajor.value;
    var averageRaw = el.fieldAverage.value;
    var average = Number(averageRaw);

    if (!code || !/^E\d{3}$/i.test(code)) {
      return "Code must look like E001 (E + 3 digits).";
    }
    if (!lastName) return "Last Name is required.";
    if (!firstName) return "First Name is required.";
    if (!birthDate) return "Birth Date is required.";
    if (!major) return "Major is required.";
    if (ALLOWED_MAJORS.indexOf(major) === -1) return "Major must be one of: Science, Literary, Math, Technical Math.";
    if (!Number.isFinite(average)) return "Average must be a number.";
    if (average < 0 || average > 20) return "Average must be between 0 and 20.";

    // Unique code check (create mode only, or edit against other record).
    var existing = findByCode(code);
    if (mode === "create") {
      if (existing) return "This code already exists.";
    } else if (mode === "edit" && existing && String(existing.code) !== String(el.formOldCode.value)) {
      return "This code already exists.";
    }

    return "";
  }

  function getStudentFromForm() {
    return {
      code: el.fieldCode.value.trim().toUpperCase(),
      lastName: el.fieldLastName.value.trim(),
      firstName: el.fieldFirstName.value.trim(),
      birthDate: el.fieldBirthDate.value,
      gender: el.fieldGender.value,
      year: el.fieldYear.value,
      major: el.fieldMajor.value,
      average: Number(el.fieldAverage.value),
    };
  }

  function onEditStudent(e) {
    var code = e && e.currentTarget ? e.currentTarget.dataset.code : "";
    openEditModal(code);
  }

  function onDeleteStudent(e) {
    var code = e && e.currentTarget ? e.currentTarget.dataset.code : "";
    var student = findByCode(code);
    if (!student) return;

    var ok = window.confirm("Delete student " + student.firstName + " " + student.lastName + " (" + student.code + ")?");
    if (!ok) return;

    state.students = state.students.filter(function (s) {
      return String(s.code) !== String(code);
    });
    saveToStorage();
    computeStats();
    renderTable();
  }

  function attachEvents() {
    if (el.newBtn) {
      el.newBtn.addEventListener("click", function () {
        openCreateModal();
      });
    }

    if (el.modalClose) {
      el.modalClose.addEventListener("click", closeModal);
    }

    if (el.cancelBtn) {
      el.cancelBtn.addEventListener("click", closeModal);
    }

    // Close when clicking on the backdrop.
    if (el.modalBackdrop) {
      el.modalBackdrop.addEventListener("click", function () {
        closeModal();
      });
    }

    // Close on Escape.
    document.addEventListener("keydown", function (event) {
      if (!state.modalOpen) return;
      if (event.key === "Escape") closeModal();
    });

    // Save handler.
    if (el.form) {
      el.form.addEventListener("submit", function (event) {
        event.preventDefault();

        var message = validateForm();
        if (message) {
          showNote(message);
          return;
        }

        var mode = el.formMode.value;
        var student = getStudentFromForm();

        if (mode === "create") {
          state.students.push(student);
        } else {
          var oldCode = el.formOldCode.value;
          for (var i = 0; i < state.students.length; i++) {
            if (String(state.students[i].code) === String(oldCode)) {
              state.students[i] = student;
              break;
            }
          }
        }

        saveToStorage();
        computeStats();
        renderTable();
        closeModal();
      });
    }
  }

  function init() {
    var stored = parseStudentsFromStorage();
    state.students = stored || initialStudents;

    attachEvents();
    computeStats();
    renderTable();
  }

  init();
})();

