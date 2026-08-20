import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

const extensionName = "vibe-dating-simulator";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const widgetIconPath = `${extensionFolderPath}/assets/vibe-widget-icon.png`;

const DEFAULT_SETTINGS = {
  widgetEnabled: true,
  widgetSize: 46,
  widgetX: null,
  widgetY: null,
};

const DRAG_HOLD_MS = 340;
const DRAG_THRESHOLD = 8;

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

function ensureSettings() {
  extension_settings[extensionName] = {
    ...DEFAULT_SETTINGS,
    ...(extension_settings[extensionName] || {}),
  };

  const settings = extension_settings[extensionName];
  settings.widgetSize = clamp(Number(settings.widgetSize) || DEFAULT_SETTINGS.widgetSize, 24, 160);

  if (settings.widgetX !== null && !Number.isFinite(Number(settings.widgetX))) {
    settings.widgetX = null;
  }
  if (settings.widgetY !== null && !Number.isFinite(Number(settings.widgetY))) {
    settings.widgetY = null;
  }

  updateSettingsUI();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function updateSettingsUI() {
  const settings = extension_settings[extensionName];

  $("#vibe_widget_enabled").prop("checked", !!settings.widgetEnabled);

  const size = clamp(Number(settings.widgetSize) || DEFAULT_SETTINGS.widgetSize, 24, 160);
  $("#vibe_widget_size").val(size);
  $("#vibe_widget_size_value").text(`${size}px`);

  updateWidget();
}

function getWidgetBounds(size) {
  const margin = 8;
  const maxX = Math.max(margin, window.innerWidth - size - margin);
  const maxY = Math.max(margin, window.innerHeight - size - margin);
  return { minX: margin, minY: margin, maxX, maxY };
}

function applyWidgetPosition() {
  const settings = extension_settings[extensionName];
  const widget = $("#vibe-floating-widget");
  if (!widget.length) return;

  const size = clamp(Number(settings.widgetSize) || DEFAULT_SETTINGS.widgetSize, 24, 160);
  const bounds = getWidgetBounds(size);

  let x = Number(settings.widgetX);
  let y = Number(settings.widgetY);

  if (!Number.isFinite(x)) {
    x = window.innerWidth - size - 14;
  }
  if (!Number.isFinite(y)) {
    y = window.innerHeight - size - 18;
  }

  x = clamp(x, bounds.minX, bounds.maxX);
  y = clamp(y, bounds.minY, bounds.maxY);

  widget.css({
    left: `${x}px`,
    top: `${y}px`,
    right: "auto",
    bottom: "auto",
  });

  settings.widgetX = x;
  settings.widgetY = y;
}

function getDefaultWidgetPosition() {
  const settings = extension_settings[extensionName];
  const size = clamp(Number(settings.widgetSize) || DEFAULT_SETTINGS.widgetSize, 24, 160);

  return {
    x: Math.max(8, window.innerWidth - size - 14),
    y: Math.max(8, window.innerHeight - size - 18),
  };
}

function resetWidgetPosition(showFeedback = false) {
  const settings = extension_settings[extensionName];
  const { x, y } = getDefaultWidgetPosition();

  settings.widgetX = x;
  settings.widgetY = y;

  updateWidget();
  saveSettingsDebounced();

  if (showFeedback && typeof toastr !== "undefined") {
    toastr.success("Виджет возвращён в угол", "Vibe");
  }
}

function findWidget(showFeedback = true) {
  const settings = extension_settings[extensionName];

  if (!settings.widgetEnabled) {
    settings.widgetEnabled = true;
    updateSettingsUI();
  }

  if (!$("#vibe-floating-widget").length) {
    createWidget();
  }

  const widget = $("#vibe-floating-widget");

  // Bring it to the front and place it in a predictable visible location.
  widget.css("z-index", "999998");

  const size = clamp(Number(settings.widgetSize) || DEFAULT_SETTINGS.widgetSize, 24, 160);
  const bounds = getWidgetBounds(size);

  let x = Number(settings.widgetX);
  let y = Number(settings.widgetY);

  const completelyOffScreen =
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    x < -size + 4 ||
    y < -size + 4 ||
    x > window.innerWidth - 4 ||
    y > window.innerHeight - 4;

  if (completelyOffScreen) {
    const def = getDefaultWidgetPosition();
    x = def.x;
    y = def.y;
    settings.widgetX = x;
    settings.widgetY = y;
    updateWidget();
  } else {
    x = clamp(x, bounds.minX, bounds.maxX);
    y = clamp(y, bounds.minY, bounds.maxY);

    widget.css({
      left: `${x}px`,
      top: `${y}px`,
      right: "auto",
      bottom: "auto",
    });

    settings.widgetX = x;
    settings.widgetY = y;
  }

  saveSettingsDebounced();

  if (showFeedback && typeof toastr !== "undefined") {
    toastr.success("Виджет найден", "Vibe");
  }

  // Brief highlight so the user can spot it.
  widget.addClass("vibe-widget-found");
  setTimeout(() => widget.removeClass("vibe-widget-found"), 1200);
}

function createWidget() {
  if ($("#vibe-floating-widget").length) return;

  $("body").append(`
    <button id="vibe-floating-widget"
            class="vibe-floating-widget"
            aria-label="Открыть Vibe"
            title="Открыть Vibe">
      <img class="vibe-floating-widget-image"
           src="${widgetIconPath}"
           alt="">
    </button>
  `);

  bindWidgetPointerEvents();
}

function updateWidget() {
  const settings = extension_settings[extensionName];

  if (!settings.widgetEnabled) {
    $("#vibe-floating-widget").remove();
    return;
  }

  createWidget();

  const widget = $("#vibe-floating-widget");
  const size = clamp(Number(settings.widgetSize) || DEFAULT_SETTINGS.widgetSize, 24, 160);

  widget.css({
    width: `${size}px`,
    height: `${size}px`,
  });

  applyWidgetPosition();
}

function bindWidgetPointerEvents() {
  const widget = document.getElementById("vibe-floating-widget");
  if (!widget) return;

  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let offsetX = 0;
  let offsetY = 0;
  let downAt = 0;
  let holdTimer = null;
  let dragging = false;
  let moved = false;

  const clearHoldTimer = () => {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
  };

  const beginDrag = () => {
    if (pointerId === null) return;
    dragging = true;
    widget.classList.add("vibe-widget-dragging");
  };

  widget.addEventListener("pointerdown", (event) => {
    if (!["touch", "mouse", "pen"].includes(event.pointerType)) return;

    pointerId = event.pointerId;
    widget.setPointerCapture?.(pointerId);

    const rect = widget.getBoundingClientRect();
    startX = event.clientX;
    startY = event.clientY;
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    downAt = performance.now();
    moved = false;
    dragging = false;

    clearHoldTimer();
    holdTimer = setTimeout(beginDrag, DRAG_HOLD_MS);
  });

  widget.addEventListener("pointermove", (event) => {
    if (pointerId !== event.pointerId) return;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    if (Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      moved = true;
    }

    if (!dragging) return;

    const size = widget.getBoundingClientRect().width;
    const bounds = getWidgetBounds(size);

    const x = clamp(event.clientX - offsetX, bounds.minX, bounds.maxX);
    const y = clamp(event.clientY - offsetY, bounds.minY, bounds.maxY);

    widget.style.left = `${x}px`;
    widget.style.top = `${y}px`;
    widget.style.right = "auto";
    widget.style.bottom = "auto";

    extension_settings[extensionName].widgetX = x;
    extension_settings[extensionName].widgetY = y;
  });

  const finishPointer = (event) => {
    if (pointerId !== event.pointerId) return;

    clearHoldTimer();

    const duration = performance.now() - downAt;
    const wasDragging = dragging;

    if (wasDragging) {
      saveSettingsDebounced();
    } else if (!moved && duration < DRAG_HOLD_MS + 180) {
      renderApp();
    }

    widget.classList.remove("vibe-widget-dragging");
    dragging = false;
    pointerId = null;

    try {
      widget.releasePointerCapture?.(event.pointerId);
    } catch (_) {
      // ignored
    }
  };

  widget.addEventListener("pointerup", finishPointer);
  widget.addEventListener("pointercancel", finishPointer);
}

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
  $("#vibe-overlay").remove();

  $("body").append(`
    <div id="vibe-overlay" class="vibe-overlay" role="dialog" aria-modal="true">
      <div class="vibe-app">
        <div class="vibe-topbar">
          <div class="vibe-logo">Vibe</div>
          <button id="vibe_close" class="vibe-icon-button" aria-label="Закрыть">×</button>
        </div>

        <div id="vibe_content" class="vibe-content"></div>

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

function closeApp() {
  $("#vibe-overlay").remove();
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
    state.chats[profile.id] = [{ from: "them", text: profile.firstMessage }];

    showToast("💕 Match", `У вас совпадение с ${profile.name}!`);

    state.currentIndex++;
    showChat(profile);
  });
}

function showChat(profile) {
  const messages = state.chats[profile.id] || [];

  $("#vibe_content").html(`
    <div class="vibe-chat-header">
      <button id="vibe_back" class="vibe-back" aria-label="Назад">←</button>
      <div>
        <div class="vibe-chat-name">${escapeHtml(profile.name)}, ${profile.age}</div>
        <div class="vibe-status">${escapeHtml(profile.status)}</div>
      </div>
    </div>

    <div class="vibe-messages">
      ${messages.map(m => `
        <div class="vibe-message ${m.from === "me" ? "vibe-message-me" : "vibe-message-them"}">
          ${escapeHtml(m.text)}
        </div>
      `).join("")}
    </div>

    <div class="vibe-compose">
      <input id="vibe_message_input" type="text" placeholder="Написать сообщение..." />
      <button id="vibe_send" class="vibe-send" aria-label="Отправить">➤</button>
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
    if (e.key === "Enter") {
      $("#vibe_send").trigger("click");
    }
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
                  <div>
                    <strong>${escapeHtml(p.name)}</strong>
                    <span>${escapeHtml(p.status)}</span>
                  </div>
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
        <div>
          ${
            count
              ? "Откройте раздел «Чаты», чтобы продолжить знакомство."
              : "Когда кто-нибудь проявит интерес, он появится здесь."
          }
        </div>
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
      <p>
        На следующем этапе добавим редактирование имени, возраста,
        города, интересов и описания.
      </p>
    </div>
  `);
}

function bindAppEvents() {
  $("#vibe_close").on("click", closeApp);

  $("#vibe-overlay").on("click", function (e) {
    if (e.target === this) {
      closeApp();
    }
  });

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
  ensureSettings();

  const settingsHtml = await $.get(`${extensionFolderPath}/example.html`);
  $("#extensions_settings").append(settingsHtml);

  $("#vibe_widget_enabled").on("change", function () {
    extension_settings[extensionName].widgetEnabled = $(this).prop("checked");
    saveSettingsDebounced();
    updateWidget();
  });

  $("#vibe_widget_size").on("input change", function () {
    const size = clamp(Number($(this).val()), 24, 160);

    extension_settings[extensionName].widgetSize = size;
    $("#vibe_widget_size_value").text(`${size}px`);

    saveSettingsDebounced();
    updateWidget();
  });

  $("#vibe_open_button").on("click", renderApp);

  $("#vibe_find_widget_button").on("click", () => {
    findWidget(true);
  });

  $("#vibe_reset_widget_button").on("click", () => {
    resetWidgetPosition(true);
  });

  $(window).on("resize", () => {
    if ($("#vibe-floating-widget").length) {
      applyWidgetPosition();
      saveSettingsDebounced();
    }
  });

  updateWidget();
});
