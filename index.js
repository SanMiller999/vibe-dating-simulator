import { extension_settings } from "../../../extensions.js";

const extensionName = "vibe-dating-simulator";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;

const profiles = [
  {
    id: "anna",
    name: "Анна",
    age: 27,
    city: "Санкт-Петербург",
    status: "Была недавно",
    about: "Люблю путешествия, кофе и спонтанные поездки. Иногда могу исчезнуть на выходные и уехать в новое место.",
    interests: ["☕ Кофе", "🎵 Музыка", "✈️ Путешествия"],
    color: "#e9b3b3",
    firstMessage: "Привет :) Ты показался мне интересным. Как у тебя день?"
  },
  {
    id: "katya",
    name: "Катя",
    age: 25,
    city: "Москва",
    status: "В сети",
    about: "Работаю, много гуляю по городу и собираю смешные истории о людях.",
    interests: ["🎬 Кино", "🐶 Собаки", "🍜 Еда"],
    color: "#b8cce8",
    firstMessage: "Привет! Ну что, начнём знакомство? :)"
  },
  {
    id: "maxim",
    name: "Максим",
    age: 31,
    city: "Москва",
    status: "Был 1 час назад",
    about: "Музыка, спорт и длинные разговоры ночью. Ищу человека, с которым не скучно.",
    interests: ["🎸 Музыка", "🏃 Спорт", "🌃 Прогулки"],
    color: "#cbb8e8",
    firstMessage: "Привет. Как настроение сегодня?"
  }
];

const state = {
  currentIndex: 0,
  liked: [],
  chats: {},
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function profileCard(profile) {
  const initials = profile.name.slice(0, 1);
  return `
    <div class="vibe-profile-card">
      <div class="vibe-photo" style="background: linear-gradient(135deg, ${profile.color}, #ffffff);">
        <div class="vibe-avatar">${escapeHtml(initials)}</div>
      </div>
      <div class="vibe-profile-body">
        <div class="vibe-name">${escapeHtml(profile.name)}, ${profile.age}</div>
        <div class="vibe-status">● ${escapeHtml(profile.status)}</div>
        <div class="vibe-city">${escapeHtml(profile.city)}</div>
        <div class="vibe-about">${escapeHtml(profile.about)}</div>
        <div class="vibe-tags">
          ${profile.interests.map(x => `<span>${escapeHtml(x)}</span>`).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderApp() {
  const profile = profiles[state.currentIndex % profiles.length];

  document.body.insertAdjacentHTML("beforeend", `
    <div id="vibe-overlay" class="vibe-overlay">
      <div class="vibe-app">
        <div class="vibe-topbar">
          <div class="vibe-logo">Vibe</div>
          <button id="vibe_close" class="vibe-icon-button">×</button>
        </div>

        <div id="vibe_content" class="vibe-content">
          <div class="vibe-section-title">Знакомства</div>
          ${profileCard(profile)}
          <div class="vibe-actions">
            <button id="vibe_skip" class="vibe-round-button vibe-skip">×</button>
            <button id="vibe_like" class="vibe-round-button vibe-like">♡</button>
          </div>
        </div>

        <div class="vibe-nav">
          <button class="vibe-nav-button vibe-nav-active" data-tab="feed">♡<span>Знакомства</span></button>
          <button class="vibe-nav-button" data-tab="chats">💬<span>Чаты</span></button>
          <button class="vibe-nav-button" data-tab="notifications">🔔<span>Уведомления</span></button>
          <button class="vibe-nav-button" data-tab="profile">👤<span>Профиль</span></button>
        </div>
      </div>
    </div>
  `);

  bindAppEvents();
}

function showToast(title, text) {
  if (typeof toastr !== "undefined") {
    toastr.info(text, title);
  }
}

function showFeed() {
  const profile = profiles[state.currentIndex % profiles.length];
  $("#vibe_content").html(`
    <div class="vibe-section-title">Знакомства</div>
    ${profileCard(profile)}
    <div class="vibe-actions">
      <button id="vibe_skip" class="vibe-round-button vibe-skip">×</button>
      <button id="vibe_like" class="vibe-round-button vibe-like">♡</button>
    </div>
  `);

  $("#vibe_skip").on("click", () => {
    state.currentIndex++;
    showFeed();
  });

  $("#vibe_like").on("click", () => {
    state.liked.push(profile.id);
    state.chats[profile.id] = [
      { from: "them", text: profile.firstMessage }
    ];
    showToast("💕 Match", `У вас совпадение с ${profile.name}!`);
    state.currentIndex++;
    showChat(profile);
  });
}

function showChat(profile) {
  const messages = state.chats[profile.id] || [];
  $("#vibe_content").html(`
    <div class="vibe-chat-header">
      <button id="vibe_back" class="vibe-back">←</button>
      <div>
        <div class="vibe-chat-name">${escapeHtml(profile.name)}, ${profile.age}</div>
        <div class="vibe-status">${escapeHtml(profile.status)}</div>
      </div>
    </div>
    <div class="vibe-messages">
      ${messages.map(m => `<div class="vibe-message ${m.from === "me" ? "vibe-message-me" : "vibe-message-them"}">${escapeHtml(m.text)}</div>`).join("")}
    </div>
    <div class="vibe-compose">
      <input id="vibe_message_input" type="text" placeholder="Написать сообщение..." />
      <button id="vibe_send" class="vibe-send">➤</button>
    </div>
  `);

  $("#vibe_back").on("click", showChats);

  $("#vibe_send").on("click", () => {
    const input = $("#vibe_message_input");
    const text = input.val().trim();
    if (!text) return;
    state.chats[profile.id].push({ from: "me", text });
    state.chats[profile.id].push({
      from: "them",
      text: "Хаха :) Расскажи немного о себе?"
    });
    showChat(profile);
  });

  $("#vibe_message_input").on("keypress", (e) => {
    if (e.key === "Enter") $("#vibe_send").trigger("click");
  });
}

function showChats() {
  const entries = Object.keys(state.chats);
  $("#vibe_content").html(`
    <div class="vibe-section-title">Чаты</div>
    ${
      entries.length
        ? entries.map(id => {
            const p = profiles.find(x => x.id === id);
            const last = state.chats[id][state.chats[id].length - 1];
            return `
              <button class="vibe-chat-row" data-profile="${escapeHtml(id)}">
                <div class="vibe-chat-avatar">${escapeHtml(p.name[0])}</div>
                <div class="vibe-chat-row-body">
                  <div><strong>${escapeHtml(p.name)}</strong><span>${escapeHtml(p.status)}</span></div>
                  <div>${escapeHtml(last?.text || "")}</div>
                </div>
              </button>
            `;
          }).join("")
        : `<div class="vibe-empty">Пока нет совпадений.<br>Поставьте кому-нибудь лайк.</div>`
    }
  `);

  $(".vibe-chat-row").on("click", function () {
    const id = $(this).data("profile");
    const p = profiles.find(x => x.id === id);
    showChat(p);
  });
}

function showNotifications() {
  const count = state.liked.length;
  $("#vibe_content").html(`
    <div class="vibe-section-title">Уведомления</div>
    <div class="vibe-notification">
      <div class="vibe-notification-icon">💕</div>
      <div>
        <strong>${count ? count + " новое совпадение" : "Пока тихо"}</strong>
        <div>${count ? "Откройте раздел «Чаты», чтобы продолжить знакомство." : "Когда кто-нибудь проявит интерес, он появится здесь."}</div>
      </div>
    </div>
  `);
}

function showPlayerProfile() {
  $("#vibe_content").html(`
    <div class="vibe-section-title">Ваш профиль</div>
    <div class="vibe-my-profile">
      <div class="vibe-my-avatar">В</div>
      <h2>Ваш профиль</h2>
      <div class="vibe-city">Новая анкета</div>
      <p>На следующем этапе добавим редактирование имени, возраста, города, интересов и описания.</p>
    </div>
  `);
}

function bindAppEvents() {
  $("#vibe_close").on("click", () => $("#vibe-overlay").remove());
  $(".vibe-nav-button").on("click", function () {
    $(".vibe-nav-button").removeClass("vibe-nav-active");
    $(this).addClass("vibe-nav-active");
    const tab = $(this).data("tab");
    if (tab === "feed") showFeed();
    if (tab === "chats") showChats();
    if (tab === "notifications") showNotifications();
    if (tab === "profile") showPlayerProfile();
  });
  showFeed();
}

jQuery(async () => {
  extension_settings[extensionName] = extension_settings[extensionName] || {};

  const settingsHtml = await $.get(`${extensionFolderPath}/example.html`);
  $("#extensions_settings").append(settingsHtml);

  $("#vibe_open_button").on("click", renderApp);
});
