(() => {
  const root = document.getElementById("app");
  const data = FormaData.load();

  const state = {
    page: "home",
    path: { language: "", level: "", module: "", lesson: "" },
    editingExercise: -1,
    checked: JSON.parse(localStorage.getItem("forma-checked-v1") || "{}"),
    completedLessons: JSON.parse(localStorage.getItem("forma-completed-v1") || "[]")
  };

  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));

  const makeId = () => Math.random().toString(36).slice(2, 10);

  function findById(list, id) {
    return list?.find(item => item.id === id) || list?.[0] || null;
  }

  function getCourse() {
    const language = findById(data.languages, state.path.language);
    if (language) state.path.language = language.id;

    const level = findById(language?.levels, state.path.level);
    if (level) state.path.level = level.id;

    const module = findById(level?.modules, state.path.module);
    if (module) state.path.module = module.id;

    const lesson = findById(module?.lessons, state.path.lesson);
    if (lesson) state.path.lesson = lesson.id;

    return { language, level, module, lesson };
  }

  function optionList(items, selectedId, emptyText) {
    if (!items?.length) {
      return `<option value="">${escapeHTML(emptyText)}</option>`;
    }

    return items.map(item => `
      <option value="${escapeHTML(item.id)}"
        ${item.id === selectedId ? "selected" : ""}>
        ${escapeHTML(item.name)}
      </option>
    `).join("");
  }

  function selectField(label, id, items, selectedId, emptyText) {
    return `
      <div>
        <label for="${id}">${label}</label>
        <select id="${id}">
          ${optionList(items, selectedId, emptyText)}
        </select>
      </div>
    `;
  }

  function render() {
    const course = getCourse();

    root.innerHTML = `
      <div class="app-shell">
        <aside class="sidebar">
          <div class="brand"><div class="brand-mark">F</div>forma<span>.</span></div>
          <div class="nav-label">Рабочее пространство</div>
          <nav class="nav-list" aria-label="Главная навигация">
            ${navButton("home", "Обзор", "⌂")}
            ${navButton("learn", "Обучение", "▤")}
            ${navButton("admin", "Управление курсами", "◫")}
          </nav>
          <div class="sidebar-bottom">
            <strong>Личная языковая студия</strong>
            Курсы и учебные материалы в одном месте.
          </div>
        </aside>

        <div class="workspace">
          <header class="topbar">
            <div class="breadcrumb">Forma <span> / </span> ${pageLabel()}</div>
            <div class="topbar-right">
              <span class="status">Рабочее пространство</span>
              <div class="avatar">FL</div>
            </div>
          </header>
          <main>${pageContent(course)}</main>
        </div>
      </div>
      <div class="toast" id="toast"></div>
    `;
  }

  function navButton(page, label, glyph) {
    return `
      <button class="nav-item ${state.page === page ? "active" : ""}"
        data-action="navigate" data-page="${page}">
        <span class="nav-glyph" aria-hidden="true">${glyph}</span>
        ${label}
      </button>
    `;
  }

  function pageLabel() {
    return {
      home: "Обзор",
      learn: "Обучение",
      admin: "Управление курсами"
    }[state.page];
  }

  function pageContent(course) {
    if (!course.language) {
      return `
        <div class="empty">
          <strong>Пока нет курсов</strong>
          Добавьте язык и учебные материалы в разделе управления курсами.
        </div>
      `;
    }

    if (state.page === "admin") return renderAdmin(course);
    if (state.page === "learn") return renderLearning(course);
    return renderHome(course);
  }

  function renderHome(course) {
    const lessons = course.module?.lessons || [];
    const words = [
      ["hello", "привет"],
      ["please", "пожалуйста"],
      ["thank you", "спасибо"],
      ["friend", "друг"]
    ];

    return `
      <section class="hero">
        <div class="hero-content">
          <p class="kicker">Ваше пространство для обучения</p>
          <h1>Новый язык. Новый способ видеть мир.</h1>
          <p>Короткие занятия, ясная теория и практика с мгновенной проверкой ответов.</p>
          <button class="button primary" data-action="navigate" data-page="learn">
            Продолжить обучение <span aria-hidden="true">→</span>
          </button>
        </div>
        <div class="hero-side">
          <strong>${state.completedLessons.length}</strong>
          <span>завершённых занятий</span>
        </div>
      </section>

      <section class="stats">
        <div class="stat-card">
          <div class="stat-symbol">01</div>
          <div><strong>${data.languages.length}</strong><span>языков в программе</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-symbol">02</div>
          <div><strong>${countLessons()}</strong><span>доступных занятий</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-symbol">03</div>
          <div><strong>${state.completedLessons.length}</strong><span>завершено вами</span></div>
        </div>
      </section>

      <div class="section-heading">
        <h2>Продолжить курс</h2>
        <button class="button ghost" data-action="navigate" data-page="learn">Все занятия →</button>
      </div>

      <div class="course-grid">
        <section class="card">
          <p class="kicker">${escapeHTML(course.language.name)} · ${escapeHTML(course.level?.name || "")}</p>
          <h2>${escapeHTML(course.module?.name || "Модули курса")}</h2>
          ${lessons.length ? lessons.map((lesson, index) => `
            <div class="lesson-row">
              <div class="lesson-index">${String(index + 1).padStart(2, "0")}</div>
              <div class="lesson-row-info">
                <strong>${escapeHTML(lesson.name)}</strong>
                <span>${lesson.exercises.length} заданий · ${escapeHTML(course.level?.name || "")}</span>
              </div>
              <button class="button small" data-action="open-lesson"
                data-id="${escapeHTML(lesson.id)}">Открыть</button>
            </div>
          `).join("") : emptyState("В модуле пока нет занятий", "Добавьте занятия в панели управления.")}
        </section>

        <section class="card">
          <p class="kicker">Небольшая практика</p>
          <h2>Слова для повторения</h2>
          ${words.map(([word, translation]) => `
            <div class="word-row">
              <strong>${word}</strong><span>${translation}</span>
            </div>
          `).join("")}
          <button class="button ghost" style="margin-top:10px" data-action="navigate" data-page="learn">
            Перейти к практике →
          </button>
        </section>
      </div>
    `;
  }

  function renderLearning(course) {
    const language = course.language;
    const level = course.level;
    const module = course.module;
    const lesson = course.lesson;

    return `
      <div class="page-heading">
        <div>
          <p class="kicker">Учебная программа</p>
          <h1>Обучение</h1>
          <p class="subtitle">Выберите курс и занятие. Ответы проверяются автоматически.</p>
        </div>
      </div>

      <div class="select-grid">
        ${selectField("Язык", "learn-language", data.languages, language?.id, "Нет языков")}
        ${selectField("Уровень", "learn-level", language?.levels, level?.id, "Нет уровней")}
        ${selectField("Модуль", "learn-module", level?.modules, module?.id, "Нет модулей")}
        ${selectField("Занятие", "learn-lesson", module?.lessons, lesson?.id, "Нет занятий")}
      </div>

      ${lesson ? `
        <div class="learning-layout">
          <aside class="card lesson-meta">
            <span class="pill">${escapeHTML(language.name)} · ${escapeHTML(level?.name || "")}</span>
            <h2>${escapeHTML(lesson.name)}</h2>
            <p class="muted">${escapeHTML(module?.name || "")}</p>
            <div class="divider"></div>
            <p><strong>${lesson.exercises.length}</strong> заданий с автоматической проверкой</p>
            <p class="help">Прогресс занятий сохраняется в этом браузере.</p>
          </aside>

          <section class="card">
            <h2>Теория</h2>
            <div class="theory">${escapeHTML(lesson.theory || "Теория пока не добавлена.")}</div>
            <div class="section-heading"><h2>Практика</h2></div>
            ${renderExercises(lesson)}
          </section>
        </div>
      ` : emptyState("Здесь пока нет занятий", "Добавьте занятие через панель управления курсами.")}
    `;
  }

  function renderExercises(lesson) {
    if (!lesson.exercises.length) {
      return emptyState("Заданий пока нет", "Добавьте задания в редакторе курса.");
    }

    return lesson.exercises.map((exercise, index) => {
      const key = `${lesson.id}:${index}`;
      const checked = state.checked[key];
      const answer = checked?.answer;

      return `
        <div class="exercise">
          <p>${String(index + 1).padStart(2, "0")} &nbsp; ${escapeHTML(exercise.question)}</p>
          ${exercise.type === "choice"
            ? `<div class="answer-list">
                ${exercise.options.map(option => {
                  let className = "answer-option";
                  if (checked && option === exercise.answer) className += " correct";
                  if (checked && option === answer && !checked.correct) className += " incorrect";
                  return `
                    <button class="${className}" data-action="check-choice"
                      data-index="${index}" data-answer="${escapeHTML(option)}"
                      ${checked ? "disabled" : ""}>
                      ${escapeHTML(option)}
                    </button>
                  `;
                }).join("")}
              </div>`
            : `<form data-form="check-text" data-index="${index}" class="row">
                <input name="answer" aria-label="Ваш ответ"
                  placeholder="Введите ответ" ${checked ? "disabled" : ""}>
                <button class="button primary" ${checked ? "disabled" : ""}>Проверить</button>
              </form>`
          }
          ${checked ? `
            <div class="feedback ${checked.correct ? "success" : "error"}">
              ${checked.correct ? "Верно. Хорошая работа." : `Правильный ответ: ${escapeHTML(exercise.answer)}`}
            </div>
          ` : `<div class="feedback"></div>`}
        </div>
      `;
    }).join("");
  }

  function renderAdmin(course) {
    const { language, level, module, lesson } = course;
    const selectedExercise = lesson?.exercises[state.editingExercise];

    return `
      <div class="page-heading">
        <div>
          <p class="kicker">Редактор учебного контента</p>
          <h1>Управление курсами</h1>
          <p class="subtitle">Создавайте структуру курса, редактируйте теорию и добавляйте проверяемые задания.</p>
        </div>
      </div>

      <section class="admin-selectors">
        <div class="select-grid" style="margin:0">
          ${selectField("Язык", "admin-language", data.languages, language?.id, "Нет языков")}
          ${selectField("Уровень", "admin-level", language?.levels, level?.id, "Нет уровней")}
          ${selectField("Модуль", "admin-module", level?.modules, module?.id, "Нет модулей")}
          ${selectField("Занятие", "admin-lesson", module?.lessons, lesson?.id, "Нет занятий")}
        </div>
      </section>

      <div class="admin-layout">
        <section class="card">
          <p class="kicker">Структура курса</p>
          <h2>Языки и разделы</h2>

          ${entityEditor("Язык", "language", language)}
          ${entityEditor("Уровень", "level", level)}
          ${entityEditor("Модуль", "module", module)}
          ${entityEditor("Занятие", "lesson", lesson)}

          <div class="divider"></div>
          <h3>Добавить элемент</h3>
          <form data-form="add-entity">
            <div class="field">
              <label for="new-entity-type">Тип элемента</label>
              <select id="new-entity-type" name="type">
                <option value="language">Язык</option>
                ${language ? `<option value="level">Уровень в «${escapeHTML(language.name)}»</option>` : ""}
                ${level ? `<option value="module">Модуль в «${escapeHTML(level.name)}»</option>` : ""}
                ${module ? `<option value="lesson">Занятие в «${escapeHTML(module.name)}»</option>` : ""}
              </select>
            </div>
            <div class="field">
              <label for="new-entity-name">Название</label>
              <input id="new-entity-name" name="name" required placeholder="Например, Испанский или Путешествия">
            </div>
            <button class="button primary">Добавить</button>
          </form>
          <p class="help">Новый элемент добавляется внутрь выбранного родительского раздела.</p>
        </section>

        <section class="card">
          <p class="kicker">Содержание занятия</p>
          <h2>${lesson ? escapeHTML(lesson.name) : "Выберите занятие"}</h2>

          ${lesson ? `
            <form data-form="save-theory">
              <div class="field">
                <label for="lesson-theory">Теория</label>
                <textarea id="lesson-theory" name="theory" placeholder="Объяснение, правила и примеры...">${escapeHTML(lesson.theory || "")}</textarea>
              </div>
              <button class="button primary">Сохранить теорию</button>
            </form>

            <div class="divider"></div>

            <div class="section-heading" style="margin-top:0">
              <h2>Задания</h2>
              <button class="button small" data-action="new-exercise">Новое задание</button>
            </div>

            ${lesson.exercises.length
              ? `<div class="exercise-list">
                  ${lesson.exercises.map((item, index) => `
                    <div class="exercise-item ${index === state.editingExercise ? "active" : ""}">
                      <span>${String(index + 1).padStart(2, "0")} · ${escapeHTML(item.question)}</span>
                      <button class="button small" data-action="edit-exercise" data-index="${index}">Изменить</button>
                      <button class="button danger small" data-action="delete-exercise" data-index="${index}">Удалить</button>
                    </div>
                  `).join("")}
                </div>`
              : emptyState("Заданий пока нет", "Создайте первое задание ниже.")
            }

            ${renderExerciseForm(selectedExercise)}
          ` : emptyState("Занятие не выбрано", "Сначала выберите занятие или создайте новое в разделе структуры.")}
        </section>
      </div>
    `;
  }

  function entityEditor(label, kind, item) {
    if (!item) {
      return `<div class="field"><label>${label}</label><div class="help">Сначала выберите или создайте родительский элемент.</div></div>`;
    }

    return `
      <form data-form="rename-entity" data-kind="${kind}" class="field">
        <label for="rename-${kind}">${label}</label>
        <div class="row">
          <input id="rename-${kind}" name="name" value="${escapeHTML(item.name)}" required>
          <button class="button small">Сохранить</button>
          <button class="button danger small" type="button"
            data-action="delete-entity" data-kind="${kind}">Удалить</button>
        </div>
      </form>
    `;
  }

  function renderExerciseForm(exercise) {
    if (!getCourse().lesson) return "";

    return `
      <form data-form="save-exercise">
        <input type="hidden" name="index" value="${exercise ? state.editingExercise : -1}">
        <div class="inline-grid">
          <div class="field">
            <label for="exercise-type">Тип задания</label>
            <select id="exercise-type" name="type">
              <option value="choice" ${exercise?.type === "choice" ? "selected" : ""}>Выбор ответа</option>
              <option value="text" ${exercise?.type === "text" ? "selected" : ""}>Ввод текста</option>
            </select>
          </div>
          <div class="field">
            <label for="exercise-answer">Правильный ответ</label>
            <input id="exercise-answer" name="answer" required
              value="${escapeHTML(exercise?.answer || "")}" placeholder="Укажите точный ответ">
          </div>
        </div>

        <div class="field">
          <label for="exercise-question">Формулировка задания</label>
          <input id="exercise-question" name="question" required
            value="${escapeHTML(exercise?.question || "")}" placeholder="Напишите вопрос">
        </div>

        <div class="field" id="options-field">
          <label for="exercise-options">Варианты ответа — каждый с новой строки</label>
          <textarea id="exercise-options" name="options" placeholder="Вариант 1&#10;Вариант 2&#10;Вариант 3">${escapeHTML((exercise?.options || []).join("\n"))}</textarea>
        </div>

        <p class="help">В ответах на ввод текста регистр и лишние пробелы не учитываются.</p>
        <div class="form-actions">
          <button class="button primary">${exercise ? "Сохранить задание" : "Добавить задание"}</button>
          <button class="button" type="button" data-action="new-exercise">Очистить форму</button>
        </div>
      </form>
    `;
  }

  function emptyState(title, description) {
    return `
      <div class="empty">
        <strong>${escapeHTML(title)}</strong>
        ${escapeHTML(description)}
      </div>
    `;
  }

  function countLessons() {
    return data.languages.reduce((total, language) =>
      total + language.levels.reduce((levelTotal, level) =>
        levelTotal + level.modules.reduce((moduleTotal, module) =>
          moduleTotal + module.lessons.length, 0), 0), 0);
  }

  function notify(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    window.setTimeout(() => toast.classList.remove("visible"), 2200);
  }

  function persist() {
    FormaData.save(data);
    render();
  }

  function normalizeAnswer(value) {
    return String(value).trim().toLowerCase().replace(/\s+/g, " ").replace(/[.!?]+$/, "");
  }

  function currentEntity(kind) {
    const course = getCourse();
    return {
      language: { list: data.languages, item: course.language },
      level: { list: course.language?.levels, item: course.level },
      module: { list: course.level?.modules, item: course.module },
      lesson: { list: course.module?.lessons, item: course.lesson }
    }[kind];
  }

  function deleteEntity(kind) {
    const selected = currentEntity(kind);
    if (!selected?.list || !selected.item) return;
    if (!window.confirm(`Удалить «${selected.item.name}» и всё его содержимое?`)) return;

    const index = selected.list.findIndex(item => item.id === selected.item.id);
    if (index >= 0) selected.list.splice(index, 1);

    state.path = { language: "", level: "", module: "", lesson: "" };
    state.editingExercise = -1;
    persist();
    notify("Элемент удалён.");
  }

  function addEntity(type, name) {
    const course = getCourse();
    const item = { id: makeId(), name: name.trim() };

    if (type === "language") {
      item.levels = [];
      data.languages.push(item);
      state.path.language = item.id;
    } else if (type === "level" && course.language) {
      item.modules = [];
      course.language.levels.push(item);
      state.path.level = item.id;
    } else if (type === "module" && course.level) {
      item.lessons = [];
      course.level.modules.push(item);
      state.path.module = item.id;
    } else if (type === "lesson" && course.module) {
      item.theory = "";
      item.exercises = [];
      course.module.lessons.push(item);
      state.path.lesson = item.id;
    } else {
      notify("Сначала выберите родительский раздел.");
      return;
    }

    state.editingExercise = -1;
    persist();
    notify("Элемент добавлен.");
  }

  function saveExercise(form) {
    const lesson = getCourse().lesson;
    if (!lesson) return;

    const formData = new FormData(form);
    const index = Number(formData.get("index"));
    const type = formData.get("type");
    const question = String(formData.get("question") || "").trim();
    const answer = String(formData.get("answer") || "").trim();
    const options = type === "choice"
      ? String(formData.get("options") || "").split("\n").map(item => item.trim()).filter(Boolean)
      : [];

    if (!question || !answer) {
      notify("Заполните вопрос и правильный ответ.");
      return;
    }

    if (type === "choice" && (options.length < 2 || !options.some(option =>
      normalizeAnswer(option) === normalizeAnswer(answer)))) {
      notify("Добавьте минимум два варианта и включите правильный ответ в список.");
      return;
    }

    const item = { type, question, answer, options };

    if (index >= 0 && lesson.exercises[index]) {
      lesson.exercises[index] = item;
      state.editingExercise = index;
      notify("Задание обновлено.");
    } else {
      lesson.exercises.push(item);
      state.editingExercise = lesson.exercises.length - 1;
      notify("Задание добавлено.");
    }

    persist();
  }

  root.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const course = getCourse();

    if (action === "navigate") {
      state.page = button.dataset.page;
      render();
    }

    if (action === "open-lesson") {
      const lesson = course.module?.lessons.find(item => item.id === button.dataset.id);
      if (lesson) state.path.lesson = lesson.id;
      state.page = "learn";
      render();
    }

    if (action === "new-exercise") {
      state.editingExercise = -1;
      render();
    }

    if (action === "edit-exercise") {
      state.editingExercise = Number(button.dataset.index);
      render();
    }

    if (action === "delete-exercise") {
      const index = Number(button.dataset.index);
      if (course.lesson && window.confirm("Удалить это задание?")) {
        course.lesson.exercises.splice(index, 1);
        state.editingExercise = -1;
        persist();
        notify("Задание удалено.");
      }
    }

    if (action === "delete-entity") {
      deleteEntity(button.dataset.kind);
    }

    if (action === "check-choice") {
      const lesson = getCourse().lesson;
      const index = Number(button.dataset.index);
      const exercise = lesson?.exercises[index];
      if (!exercise) return;

      const chosen = button.dataset.answer;
      const correct = normalizeAnswer(chosen) === normalizeAnswer(exercise.answer);
      state.checked[`${lesson.id}:${index}`] = { answer: chosen, correct };
      localStorage.setItem("forma-checked-v1", JSON.stringify(state.checked));

      if (correct) markLessonComplete(lesson.id);
      render();
    }
  });

  root.addEventListener("change", event => {
    const target = event.target;
    const course = getCourse();

    if (target.id === "learn-language" || target.id === "admin-language") {
      state.path.language = target.value;
      state.path.level = "";
      state.path.module = "";
      state.path.lesson = "";
      state.editingExercise = -1;
      render();
    }

    if (target.id === "learn-level" || target.id === "admin-level") {
      state.path.level = target.value;
      state.path.module = "";
      state.path.lesson = "";
      state.editingExercise = -1;
      render();
    }

    if (target.id === "learn-module" || target.id === "admin-module") {
      state.path.module = target.value;
      state.path.lesson = "";
      state.editingExercise = -1;
      render();
    }

    if (target.id === "learn-lesson" || target.id === "admin-lesson") {
      state.path.lesson = target.value;
      state.editingExercise = -1;
      render();
    }

    if (target.id === "exercise-type") {
      const optionsField = document.getElementById("options-field");
      if (optionsField) optionsField.classList.toggle("hidden", target.value !== "choice");
    }
  });

  root.addEventListener("submit", event => {
    const form = event.target.closest("form[data-form]");
    if (!form) return;
    event.preventDefault();

    const formType = form.dataset.form;
    const formData = new FormData(form);

    if (formType === "add-entity") {
      addEntity(String(formData.get("type")), String(formData.get("name") || ""));
    }

    if (formType === "rename-entity") {
      const entity = currentEntity(form.dataset.kind);
      const name = String(formData.get("name") || "").trim();
      if (!entity?.item || !name) return;
      entity.item.name = name;
      persist();
      notify("Название сохранено.");
    }

    if (formType === "save-theory") {
      const lesson = getCourse().lesson;
      if (!lesson) return;
      lesson.theory = String(formData.get("theory") || "").trim();
      persist();
      notify("Теория сохранена.");
    }

    if (formType === "save-exercise") {
      saveExercise(form);
    }

    if (formType === "check-text") {
      const lesson = getCourse().lesson;
      const index = Number(form.dataset.index);
      const exercise = lesson?.exercises[index];
      if (!exercise) return;

      const input = form.elements.answer;
      const answer = input.value;
      const correct = normalizeAnswer(answer) === normalizeAnswer(exercise.answer);
      state.checked[`${lesson.id}:${index}`] = { answer, correct };
      localStorage.setItem("forma-checked-v1", JSON.stringify(state.checked));

      if (correct) markLessonComplete(lesson.id);
      render();
    }
  });

  function markLessonComplete(lessonId) {
    if (!state.completedLessons.includes(lessonId)) {
      state.completedLessons.push(lessonId);
      localStorage.setItem("forma-completed-v1", JSON.stringify(state.completedLessons));
    }
  }

  render();
})();

