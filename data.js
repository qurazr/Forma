(function () {
  const STORAGE_KEY = "forma-language-platform-v1";

  const initialData = {
    languages: [
      {
        id: "english",
        name: "Английский",
        levels: [
          {
            id: "a1",
            name: "A1 · Начальный",
            modules: [
              {
                id: "introductions",
                name: "Знакомство",
                lessons: [
                  {
                    id: "greetings",
                    name: "Приветствия и знакомство",
                    theory:
                      "Hello! — Привет!\n" +
                      "Good morning! — Доброе утро!\n\n" +
                      "Чтобы представиться, скажите:\n" +
                      "My name is Anna. — Меня зовут Анна.\n\n" +
                      "При знакомстве можно добавить:\n" +
                      "Nice to meet you. — Рад(а) познакомиться.",
                    exercises: [
                      {
                        type: "choice",
                        question: "Как переводится “Hello”?",
                        options: ["До свидания", "Привет", "Спасибо"],
                        answer: "Привет"
                      },
                      {
                        type: "text",
                        question: "Напишите по-английски: «Меня зовут Анна»",
                        options: [],
                        answer: "My name is Anna"
                      },
                      {
                        type: "choice",
                        question: "Что означает “Good morning”?",
                        options: ["Доброе утро", "Добрый вечер", "Спокойной ночи"],
                        answer: "Доброе утро"
                      }
                    ]
                  },
                  {
                    id: "polite-phrases",
                    name: "Вежливые фразы",
                    theory:
                      "Please — пожалуйста.\n" +
                      "Thank you — спасибо.\n" +
                      "You’re welcome — пожалуйста / не за что.\n" +
                      "Excuse me — извините, разрешите.",
                    exercises: [
                      {
                        type: "choice",
                        question: "Как сказать «Спасибо»?",
                        options: ["Please", "Thank you", "Excuse me"],
                        answer: "Thank you"
                      }
                    ]
                  }
                ]
              },
              {
                id: "everyday",
                name: "Повседневная жизнь",
                lessons: [
                  {
                    id: "at-cafe",
                    name: "В кафе",
                    theory:
                      "I would like… — Я бы хотел(а)…\n" +
                      "A coffee, please. — Кофе, пожалуйста.\n" +
                      "Can I have the menu? — Можно меню?",
                    exercises: [
                      {
                        type: "choice",
                        question: "Как вежливо попросить кофе?",
                        options: [
                          "Give me coffee.",
                          "A coffee, please.",
                          "Coffee is there."
                        ],
                        answer: "A coffee, please."
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: "a2",
            name: "A2 · Ниже среднего",
            modules: []
          }
        ]
      }
    ]
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : clone(initialData);
    } catch {
      return clone(initialData);
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  window.FormaData = { load, save, initialData: clone(initialData) };
})();

