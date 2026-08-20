import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

const extensionName = "vibe-dating-simulator";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const widgetIconPath = `${extensionFolderPath}/assets/vibe-widget-icon.png`;
const vibeDatingIconPath = `${extensionFolderPath}/assets/vibe-dating-icon.png`;
const vibeChatsIconPath = `${extensionFolderPath}/assets/vibe-chats-icon.png`;
const notificationsIconPath = `${extensionFolderPath}/assets/vibe-notifications-icon.png`;
const vibeProfileIconPath = `${extensionFolderPath}/assets/vibe-profile-icon.png`;


const DEFAULT_MEMORY_SETTINGS = {
  autoMemory: true,
  contextMessages: 30,
  chatMemory: 30,
  responseTokens: 1024,
  sendPlayerProfile: true,
  sendVisualProfile: true,
  sendRelationshipMemory: true,
  sendWorldMemory: true,
};

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
    memory: {
      ...DEFAULT_MEMORY_SETTINGS,
      ...((extension_settings[extensionName] || {}).memory || {}),
    },
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


function updateMemorySettingsUI() {
  const memory = extension_settings[extensionName].memory || DEFAULT_MEMORY_SETTINGS;

  $("#vibe_memory_auto").prop("checked", !!memory.autoMemory);

  $("#vibe_context_messages").val(memory.contextMessages);
  $("#vibe_context_messages_value").text(memory.contextMessages);

  $("#vibe_chat_memory").val(memory.chatMemory);
  $("#vibe_chat_memory_value").text(memory.chatMemory);

  $("#vibe_response_tokens").val(memory.responseTokens);
  $("#vibe_response_tokens_value").text(memory.responseTokens);

  $("#vibe_send_player_profile").prop("checked", !!memory.sendPlayerProfile);
  $("#vibe_send_visual_profile").prop("checked", !!memory.sendVisualProfile);
  $("#vibe_send_relationship_memory").prop("checked", !!memory.sendRelationshipMemory);
  $("#vibe_send_world_memory").prop("checked", !!memory.sendWorldMemory);
}

function bindMemorySettings() {
  const memory = extension_settings[extensionName].memory;

  $("#vibe_memory_auto").on("change", function () {
    memory.autoMemory = $(this).prop("checked");
    saveSettingsDebounced();
  });

  $("#vibe_context_messages").on("input change", function () {
    memory.contextMessages = Number($(this).val());
    $("#vibe_context_messages_value").text(memory.contextMessages);
    saveSettingsDebounced();
  });

  $("#vibe_chat_memory").on("input change", function () {
    memory.chatMemory = Number($(this).val());
    $("#vibe_chat_memory_value").text(memory.chatMemory);
    saveSettingsDebounced();
  });

  $("#vibe_response_tokens").on("input change", function () {
    memory.responseTokens = Number($(this).val());
    $("#vibe_response_tokens_value").text(memory.responseTokens);
    saveSettingsDebounced();
  });

  $("#vibe_send_player_profile").on("change", function () {
    memory.sendPlayerProfile = $(this).prop("checked");
    saveSettingsDebounced();
  });

  $("#vibe_send_visual_profile").on("change", function () {
    memory.sendVisualProfile = $(this).prop("checked");
    saveSettingsDebounced();
  });

  $("#vibe_send_relationship_memory").on("change", function () {
    memory.sendRelationshipMemory = $(this).prop("checked");
    saveSettingsDebounced();
  });

  $("#vibe_send_world_memory").on("change", function () {
    memory.sendWorldMemory = $(this).prop("checked");
    saveSettingsDebounced();
  });
}

function updateSettingsUI() {
  const settings = extension_settings[extensionName];

  $("#vibe_widget_enabled").prop("checked", !!settings.widgetEnabled);

  const size = clamp(Number(settings.widgetSize) || DEFAULT_SETTINGS.widgetSize, 24, 160);
  $("#vibe_widget_size").val(size);
  $("#vibe_widget_size_value").text(`${size}px`);

  updateMemorySettingsUI();
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

function searchWidget() {
  const settings = extension_settings[extensionName];

  settings.widgetEnabled = true;

  const position = getDefaultWidgetPosition();
  settings.widgetX = position.x;
  settings.widgetY = position.y;

  updateSettingsUI();
  saveSettingsDebounced();

  const widget = $("#vibe-floating-widget");

  if (widget.length) {
    widget.css("z-index", "999998");
    widget.removeClass("vibe-widget-found");
    void widget[0].offsetWidth;
    widget.addClass("vibe-widget-found");

    setTimeout(() => {
      widget.removeClass("vibe-widget-found");
    }, 1200);
  }

  if (typeof toastr !== "undefined") {
    toastr.success("Виджет найден и возвращён в правый нижний угол", "Vibe");
  }
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
      <span class="vibe-widget-badge" aria-label="Новые чаты">0</span>
    </button>
  `);

  bindWidgetPointerEvents();
  updateUnreadUI();
}




function getTotalUnreadCount() {
  return Object.values(state.chats).reduce((total, chat) => {
    return total + Math.max(0, Number(chat.unread) || 0);
  }, 0);
}

function updateUnreadUI() {
  const count = getTotalUnreadCount();

  // Floating widget badge + persistent glow while unread messages exist.
  const widget = $("#vibe-floating-widget");
  if (widget.length) {
    const badge = widget.find(".vibe-widget-badge");

    if (!count) {
      badge.text("0").attr("aria-hidden", "true").hide();
      widget.removeClass("vibe-widget-notify");
    } else {
      badge.text(count > 99 ? "99+" : String(count))
        .attr("aria-hidden", "false")
        .show();

      // Keep the notification state active until the unread chat(s) are opened.
      widget.addClass("vibe-widget-notify");
    }
  }

  // Bottom navigation badge uses exactly the same total unread count.
  const notificationButton = $('.vibe-nav-button[data-tab="notifications"]');
  if (notificationButton.length) {
    let badge = notificationButton.find(".vibe-nav-badge");

    if (!badge.length) {
      notificationButton.append('<span class="vibe-nav-badge" aria-label="Непрочитанные сообщения"></span>');
      badge = notificationButton.find(".vibe-nav-badge");
    }

    if (!count) {
      badge.text("0").attr("aria-hidden", "true").hide();
    } else {
      badge.text(count > 99 ? "99+" : String(count))
        .attr("aria-hidden", "false")
        .show();
    }
  }
}

function ensureChat(id) {
  if (!state.chats[id]) {
    state.chats[id] = {
      messages: [],
      unread: 0,
    };
  }

  // Backward compatibility with any old in-memory shape.
  if (Array.isArray(state.chats[id])) {
    state.chats[id] = {
      messages: state.chats[id],
      unread: 0,
    };
  }

  return state.chats[id];
}

function markChatRead(id) {
  const chat = ensureChat(id);
  chat.unread = 0;
  updateUnreadUI();
}

function addIncomingMessage(id, text) {
  const chat = ensureChat(id);
  chat.messages.push({ from: "them", text, timestamp: Date.now() });
  chat.unread += 1;
  updateUnreadUI();

  const widget = $("#vibe-floating-widget");
  if (widget.length) {
    // A brief pulse on arrival, then the glow remains until the chat is read.
    widget.removeClass("vibe-widget-pulse");
    void widget[0].offsetWidth;
    widget.addClass("vibe-widget-pulse");
    setTimeout(() => widget.removeClass("vibe-widget-pulse"), 1100);
  }
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
  updateUnreadUI();
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
    event.preventDefault();

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
  widget.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });
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
          <button class="vibe-nav-button vibe-nav-active" data-tab="feed"><img class="vibe-nav-image-icon" src="${vibeDatingIconPath}" alt=""><span>Знакомства</span></button>
          <button class="vibe-nav-button" data-tab="chats"><img class="vibe-nav-image-icon" src="${vibeChatsIconPath}" alt=""><span>Чаты</span></button>
          <button class="vibe-nav-button" data-tab="notifications"><img class="vibe-nav-image-icon" src="${notificationsIconPath}" alt=""><span>Уведомления</span></button>
          <button class="vibe-nav-button" data-tab="profile"><img class="vibe-nav-image-icon" src="${vibeProfileIconPath}" alt=""><span>Профиль</span></button>
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
    const chat = ensureChat(profile.id);
    chat.messages.push({ from: "them", text: profile.firstMessage, timestamp: Date.now() });
    chat.unread += 1;

    updateUnreadUI();
    showToast("💕 Match", `У вас совпадение с ${profile.name}!`);

    state.currentIndex++;
    showChat(profile);
  });
}

function showChat(profile) {
  const chat = ensureChat(profile.id);
  markChatRead(profile.id);
  const messages = chat.messages;

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

    const chat = ensureChat(profile.id);
    chat.messages.push({ from: "me", text, timestamp: Date.now() });
    chat.messages.push({
      from: "them",
      text: "Хаха :) Расскажи немного о себе?",
      timestamp: Date.now()
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
            const chat = ensureChat(id);
            const last = chat.messages[chat.messages.length - 1];

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
        : `<div class="vibe-empty"><img class="vibe-empty-chat-icon" src="${vibeChatsIconPath}" alt=""><div>Пока нет совпадений.<br>Поставьте кому-нибудь лайк.</div></div>`
    }
  `);

  $(".vibe-chat-row").on("click", function () {
    const id = $(this).data("profile");
    const p = profiles.find(x => x.id === id);
    showChat(p);
  });
}


let simulatedIncomingTimer = null;

function startSimulatedIncomingMessages() {
  if (simulatedIncomingTimer) {
    clearInterval(simulatedIncomingTimer);
  }

  simulatedIncomingTimer = setInterval(() => {
    const chance = Math.random();
    if (chance >= 0.35) return;

    const existingIds = Object.keys(state.chats);
    const profile = profiles.find(p => existingIds.includes(p.id)) || profiles[0];

    ensureChat(profile.id);
    addIncomingMessage(profile.id, profile.firstMessage);
    showToast("Новое сообщение", `Новое сообщение от ${profile.name}`);
  }, 45000);
}

function showNotifications() {
  const count = state.liked.length;
  const unread = getTotalUnreadCount();

  $("#vibe_content").html(`
    <div class="vibe-section-title">Уведомления</div>

    <div class="vibe-notification">
      <div class="vibe-notification-icon"><img src="${notificationsIconPath}" alt=""></div>
      <div>
        <strong>${unread ? `${unread} непрочитанных сообщения` : (count ? count + " новое совпадение" : "Пока тихо")}</strong>
        <div>
          ${
            unread
              ? "Откройте нужный чат, чтобы прочитать сообщения."
              : (count
                  ? "Откройте раздел «Чаты», чтобы продолжить знакомство."
                  : "Когда кто-нибудь проявит интерес, он появится здесь.")
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
      <img class="vibe-my-profile-icon" src="${vibeProfileIconPath}" alt=""><div class="vibe-my-avatar">В</div>
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
  updateUnreadUI();
}

jQuery(async () => {
  ensureSettings();

  const settingsHtml = await $.get(`${extensionFolderPath}/example.html`);
  $("#extensions_settings").append(settingsHtml);

  bindMemorySettings();

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


  $("#vibe_widget_settings_toggle").on("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    const body = $("#vibe_widget_settings_body");
    const button = $(this);
    const expanded = button.attr("aria-expanded") === "true";

    button.attr("aria-expanded", String(!expanded));
    body.prop("hidden", expanded);
    button.find(".vibe-settings-collapsible-chevron").text(expanded ? "⌄" : "⌃");
  });

  $("#vibe_open_button").on("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    renderApp();
  });
  $("#vibe_find_widget_button").on("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    searchWidget();
  });

  $(window).on("resize", () => {
    if ($("#vibe-floating-widget").length) {
      applyWidgetPosition();
      saveSettingsDebounced();
    }
  });

  updateWidget();
  updateUnreadUI();
  startSimulatedIncomingMessages();
});
