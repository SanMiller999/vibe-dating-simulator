import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

const extensionName = "vibe-dating-simulator";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const widgetIconPath = `${extensionFolderPath}/assets/vibe-widget-icon.png`;
const widgetActiveIconPath = `${extensionFolderPath}/assets/vibe-widget-active-1.png`;
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
  developerMode: false,
  playerProfile: {
    name: "",
    age: "",
    city: "",
    gender: "",
    lookingFor: [],
    datingGoals: [],
    interests: [],
    occupation: "",
    education: "",
    about: "",
    photos: [],
  },
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
  skipped: [],
  chats: {},
  unreadInteractions: {},
  activityNotifications: [],
};

function saveChatState() {
  extension_settings[extensionName].chatState = {
    chats: state.chats,
    liked: state.liked,
    skipped: state.skipped,
    unreadInteractions: state.unreadInteractions,
    activityNotifications: state.activityNotifications,
  };
  saveSettingsDebounced();
}

function loadChatState() {
  const saved = extension_settings[extensionName]?.chatState;
  if (!saved || typeof saved !== "object") return;

  state.chats = saved.chats && typeof saved.chats === "object" ? saved.chats : {};
  state.liked = Array.isArray(saved.liked) ? saved.liked : [];
  state.skipped = Array.isArray(saved.skipped) ? saved.skipped : [];
  state.unreadInteractions = saved.unreadInteractions && typeof saved.unreadInteractions === "object"
    ? saved.unreadInteractions
    : {};
  state.activityNotifications = Array.isArray(saved.activityNotifications)
    ? saved.activityNotifications
    : [];
}

function ensureSettings() {
  const existing = extension_settings[extensionName] || {};

  extension_settings[extensionName] = {
    ...DEFAULT_SETTINGS,
    ...existing,
    memory: {
      ...DEFAULT_MEMORY_SETTINGS,
      ...(existing.memory || {}),
    },
    playerProfile: {
      ...DEFAULT_SETTINGS.playerProfile,
      ...(existing.playerProfile || {}),
    },
  };

  const settings = extension_settings[extensionName];
  settings.widgetEnabled = typeof settings.widgetEnabled === "boolean"
    ? settings.widgetEnabled
    : true;

  settings.widgetSize = clamp(
    Number(settings.widgetSize) || DEFAULT_SETTINGS.widgetSize,
    24,
    160
  );

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
  $("#vibe_developer_mode").prop("checked", !!settings.developerMode);
  $("#vibe_developer_tools").prop("hidden", !settings.developerMode);

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
    </button>
  `);

  bindWidgetPointerEvents();
  updateUnreadUI();
}






function getWidgetIconPathForCount(count) {
  if (!count) return widgetIconPath;
  const safe = Math.max(1, Math.min(20, Number(count) || 1));
  return `${extensionFolderPath}/assets/vibe-widget-active-${safe}.png`;
}

function getUnreadInteractionCount(type = null) {
  return Object.values(state.unreadInteractions || {}).filter(item => {
    if (!item || item.read) return false;
    return !type || item.type === type;
  }).length;
}

function getUnreadChatsCount() {
  return getUnreadInteractionCount("chat_message");
}

function getUnreadActivityCount() {
  return (state.activityNotifications || []).filter(item => item && !item.read).length;
}

function createInteraction(type, sourceId, meta = {}) {
  const id = `interaction_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  state.unreadInteractions[id] = {
    id,
    type,
    sourceId,
    createdAt: Date.now(),
    read: false,
    ...meta,
  };
  updateUnreadUI();
  saveChatState();
  return id;
}

function createActivityNotification(type, sourceId, meta = {}) {
  const id = `activity_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  state.activityNotifications = state.activityNotifications || [];
  state.activityNotifications.unshift({
    id,
    type,
    sourceId,
    createdAt: Date.now(),
    read: false,
    ...meta,
  });
  updateUnreadUI();
  saveChatState();
  return id;
}

function markActivityRead(notificationId) {
  const item = (state.activityNotifications || []).find(x => x.id === notificationId);
  if (!item) return;
  item.read = true;
  updateUnreadUI();
  saveChatState();
}

function markChatInteractionsRead(chatId) {
  Object.values(state.unreadInteractions || {}).forEach(item => {
    if (!item.read && item.type === "chat_message" && item.sourceId === chatId) {
      item.read = true;
    }
  });
  updateUnreadUI();
  saveChatState();
}

function setNavBadge(button, count, label) {
  if (!button.length) return;

  let badge = button.find(".vibe-nav-badge");
  if (!badge.length) {
    button.append(`<span class="vibe-count-badge vibe-nav-badge" aria-label="${label}"></span>`);
    badge = button.find(".vibe-nav-badge");
  }

  if (!count) {
    badge.text("0").attr("aria-hidden", "true").hide();
  } else {
    badge.text(count > 99 ? "99+" : String(count))
      .attr("aria-hidden", "false")
      .show();
  }
}

function updateUnreadUI() {
  const unreadChats = getUnreadChatsCount();
  const unreadActivity = getUnreadActivityCount();
  const total = Math.min(20, unreadChats + unreadActivity);

  const widget = $("#vibe-floating-widget");
  if (widget.length) {
    const image = widget.find(".vibe-floating-widget-image");

    // The number is part of the widget image itself.
    image.attr("src", getWidgetIconPathForCount(total));
    widget.attr("aria-label", total ? `Новых взаимодействий: ${total}` : "Открыть Vibe");

    if (total) {
      widget.addClass("vibe-widget-notify");
    } else {
      widget.removeClass("vibe-widget-notify");
    }
  }

  setNavBadge(
    $('.vibe-nav-button[data-tab="chats"]'),
    unreadChats,
    "Непрочитанные чаты"
  );

  setNavBadge(
    $('.vibe-nav-button[data-tab="notifications"]'),
    unreadActivity,
    "Новые действия"
  );

  // No badge on «Знакомства»: it is only the swipe/like/dislike area.
  const feedButton = $('.vibe-nav-button[data-tab="feed"]');
  const feedBadge = feedButton.find(".vibe-nav-badge");
  if (feedBadge.length) {
    feedBadge.text("0").attr("aria-hidden", "true").hide();
  }

}

function ensureChat(id) {
  if (!state.chats[id]) {
    state.chats[id] = {
      conversationId: `conversation_${id}`,
      profileId: id,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  if (Array.isArray(state.chats[id])) {
    state.chats[id] = {
      conversationId: `conversation_${id}`,
      profileId: id,
      messages: state.chats[id],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  const chat = state.chats[id];
  chat.conversationId ||= `conversation_${id}`;
  chat.profileId ||= id;
  chat.messages ||= [];
  chat.createdAt ||= Date.now();
  chat.updatedAt ||= Date.now();

  return chat;
}

function addIncomingMessage(id, text) {
  const chat = ensureChat(id);

  chat.messages.push({
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    from: "them",
    text,
    timestamp: Date.now()
  });
  chat.updatedAt = Date.now();
  saveChatState();

  const hasUnreadForChat = Object.values(state.unreadInteractions || {}).some(
    item => !item.read && item.type === "chat_message" && item.sourceId === id
  );

  // Multiple messages in the same unread chat remain ONE interaction.
  if (!hasUnreadForChat) {
    createInteraction("chat_message", id, {
      title: "Новое сообщение",
      description: `Новое сообщение от ${profiles.find(p => p.id === id)?.name || "пользователя"}`
    });
  } else {
    updateUnreadUI();
  }
}

function createDemoMatch(profileId) {
  const profile = profiles.find(item => item.id === profileId);
  if (!profile) return;

  createActivityNotification("match", profileId, {
    title: "У вас совпадение",
    text: `Теперь вы можете начать чат с ${profile.name}.`,
  });
  showToast("Демо-событие", `Создано совпадение с ${profile.name}.`);
}

function createDemoPhotoLike(profileId) {
  const profile = profiles.find(item => item.id === profileId);
  if (!profile) return;

  createActivityNotification("photo_like", profileId, {
    title: "Лайк фото",
    text: `${profile.name} понравилась ваша фотография.`,
  });
  showToast("Демо-событие", `Создан лайк фото от ${profile.name}.`);
}

function resetDemoState() {
  state.currentIndex = 0;
  state.liked = [];
  state.skipped = [];
  state.chats = {};
  state.unreadInteractions = {};
  state.activityNotifications = [];
  saveChatState();
  updateUnreadUI();

  if ($("#vibe-overlay").length) {
    showFeed();
  }

  showToast("Vibe", "Демо-данные сброшены.");
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

function setWidgetVisible(visible) {
  const widget = $("#vibe-floating-widget");
  if (!widget.length) return;

  if (visible) {
    widget.show();
    updateUnreadUI();
  } else {
    widget.hide();
  }
}

function renderApp() {
  setWidgetVisible(false);
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
  saveChatState();
  $("#vibe-overlay").remove();
  setWidgetVisible(true);
}

function showToast(title, text) {
  if (typeof toastr !== "undefined") {
    toastr.info(text, title);
  }
}

function showFeed() {
  const unseenProfiles = profiles.filter(profile => {
    return !state.liked.includes(profile.id) && !state.skipped.includes(profile.id);
  });

  if (!unseenProfiles.length) {
    $("#vibe_content").html(`
      <div class="vibe-section-title">Знакомства</div>
      <div class="vibe-empty">
        <img class="vibe-empty-chat-icon" src="${vibeDatingIconPath}" alt="">
        <div>Новых анкет пока нет.</div>
      </div>
    `);
    return;
  }

  const profile = unseenProfiles[state.currentIndex % unseenProfiles.length];

  $("#vibe_content").html(`
    <div class="vibe-section-title">Знакомства</div>
    ${profileCard(profile)}

    <div class="vibe-actions">
      <button id="vibe_skip" class="vibe-round-button vibe-skip">×</button>
      <button id="vibe_like" class="vibe-round-button vibe-like">♡</button>
    </div>
  `);

  $("#vibe_skip").on("click", () => {
    if (!state.skipped.includes(profile.id)) state.skipped.push(profile.id);
    state.currentIndex = 0;
    saveChatState();
    showFeed();
  });

  $("#vibe_like").on("click", () => {
    if (!state.liked.includes(profile.id)) state.liked.push(profile.id);
    const chat = ensureChat(profile.id);

    // A local like is not yet a mutual match and never creates an unread notification.
    // It only unlocks/opens the conversation.
    if (!chat.messages.length) {
      chat.messages.push({
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        from: "them",
        text: profile.firstMessage,
        timestamp: Date.now()
      });
      chat.updatedAt = Date.now();
    }

    saveChatState();
    showToast("Лайк отправлен", `Вы можете начать чат с ${profile.name}.`);

    state.currentIndex = 0;
    showChat(profile);
  });
}

function showChat(profile) {
  const chat = ensureChat(profile.id);
  markChatInteractionsRead(profile.id);
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
    chat.messages.push({
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      from: "me",
      text,
      timestamp: Date.now()
    });
    chat.messages.push({
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      from: "them",
      text: "Хаха :) Расскажи немного о себе?",
      timestamp: Date.now()
    });
    chat.updatedAt = Date.now();
    saveChatState();

    showChat(profile);
  });

  $("#vibe_message_input").on("keypress", (e) => {
    if (e.key === "Enter") {
      $("#vibe_send").trigger("click");
    }
  });

  requestAnimationFrame(() => {
    const content = document.getElementById("vibe_content");
    if (content) content.scrollTop = content.scrollHeight;
  });
}

function showChats() {
  const entries = Object.keys(state.chats).sort((a, b) => {
    return (ensureChat(b).updatedAt || 0) - (ensureChat(a).updatedAt || 0);
  });

  $("#vibe_content").html(`
    <div class="vibe-section-title">Чаты</div>

    ${
      entries.length
        ? entries.map(id => {
            const p = profiles.find(x => x.id === id);
            if (!p) return "";
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


function showNotifications() {
  const items = state.activityNotifications || [];

  $("#vibe_content").html(`
    <div class="vibe-section-title">Уведомления</div>

    ${
      items.length
        ? items.map(item => {
            const p = profiles.find(x => x.id === item.sourceId);
            const name = p ? p.name : (item.actorName || "Пользователь");
            const title = item.title || "Новое действие";
            const text = item.text || "";
            const clickable = item.type === "match" && p;

            return `
              <button class="vibe-activity-row ${clickable ? "vibe-activity-clickable" : ""}"
                      data-notification-id="${escapeHtml(item.id)}"
                      data-profile="${clickable ? escapeHtml(p.id) : ""}">
                <div class="vibe-notification-icon">
                  <img src="${notificationsIconPath}" alt="">
                </div>
                <div class="vibe-activity-body">
                  <strong>${escapeHtml(name)} — ${escapeHtml(title)}</strong>
                  <div>${escapeHtml(text)}</div>
                  ${item.read ? "" : `<span class="vibe-activity-unread">Новое</span>`}
                </div>
              </button>
            `;
          }).join("")
        : `
          <div class="vibe-empty">
            <img class="vibe-empty-chat-icon" src="${notificationsIconPath}" alt="">
            <div>Пока нет новых действий.</div>
          </div>
        `
    }
  `);

  $(".vibe-activity-row").on("click", function () {
    const notificationId = $(this).data("notification-id");
    const profileId = $(this).data("profile");

    markActivityRead(notificationId);

    if (profileId) {
      const p = profiles.find(x => x.id === profileId);
      if (p) {
        $(".vibe-nav-button").removeClass("vibe-nav-active");
        $('.vibe-nav-button[data-tab="chats"]').addClass("vibe-nav-active");
        ensureChat(p.id);
        showChat(p);
      }
    } else {
      showNotifications();
    }
  });
}

function getPlayerProfile() {
  return extension_settings[extensionName].playerProfile;
}

function getPlayerProfile() {
  const profile = extension_settings[extensionName].playerProfile;
  profile.lookingFor = Array.isArray(profile.lookingFor) ? profile.lookingFor : [];
  profile.datingGoals = Array.isArray(profile.datingGoals) ? profile.datingGoals : [];
  profile.interests = Array.isArray(profile.interests) ? profile.interests : [];
  profile.photos = Array.isArray(profile.photos) ? profile.photos : [];
  return profile;
}

function renderPlayerProfilePage() {
  const profile = getPlayerProfile();
  const mainPhoto = profile.photos[0] || "";

  const goalsText = profile.datingGoals.join(" · ");
  const interests = profile.interests;

  $("#vibe_content").html(`
    <div class="vibe-profile-page">
      <div class="vibe-profile-cover"></div>

      <div class="vibe-profile-hero">
        <div class="vibe-profile-avatar-large">
          ${
            mainPhoto
              ? `<img src="${escapeHtml(mainPhoto)}" alt="Фото профиля">`
              : `<div class="vibe-profile-avatar-placeholder">+</div>`
          }
        </div>

        <div class="vibe-profile-hero-info">
          <div class="vibe-profile-name-row">
            <h1>${escapeHtml(profile.name || "Ваш профиль")}</h1>
            ${profile.age ? `<span class="vibe-profile-age">${escapeHtml(String(profile.age))}</span>` : ""}
          </div>
          ${
            profile.city
              ? `<div class="vibe-profile-meta">${escapeHtml(profile.city)}</div>`
              : `<div class="vibe-profile-meta">Добавьте город</div>`
          }
          ${
            profile.gender
              ? `<div class="vibe-profile-meta">${escapeHtml(profile.gender)}</div>`
              : ""
          }
        </div>
      </div>

      <div class="vibe-profile-actions">
        <button id="vibe_edit_profile" type="button" class="menu_button vibe-profile-edit-button">
          Редактировать
        </button>
      </div>

      <div class="vibe-profile-card">
        <div class="vibe-profile-card-title">О себе</div>
        <div class="vibe-profile-about">
          ${escapeHtml(profile.about || "Расскажите о себе, чтобы людям было проще с вами познакомиться.")}
        </div>
      </div>

      ${
        goalsText
          ? `<div class="vibe-profile-card">
               <div class="vibe-profile-card-title">Цели знакомств</div>
               <div class="vibe-profile-goals">${escapeHtml(goalsText)}</div>
             </div>`
          : ""
      }

      ${
        interests.length
          ? `<div class="vibe-profile-card">
               <div class="vibe-profile-card-title">Интересы</div>
               <div class="vibe-profile-tags">
                 ${interests.map(item => `<span class="vibe-profile-tag">${escapeHtml(item)}</span>`).join("")}
               </div>
             </div>`
          : ""
      }

      ${
        profile.lookingFor.length
          ? `<div class="vibe-profile-card">
               <div class="vibe-profile-card-title">Кого ищу</div>
               <div class="vibe-profile-about">${escapeHtml(profile.lookingFor.join(", "))}</div>
             </div>`
          : ""
      }

      ${
        profile.occupation || profile.education
          ? `<div class="vibe-profile-card">
               ${
                 profile.occupation
                   ? `<div class="vibe-profile-info-row"><span>Профессия</span><strong>${escapeHtml(profile.occupation)}</strong></div>`
                   : ""
               }
               ${
                 profile.education
                   ? `<div class="vibe-profile-info-row"><span>Образование</span><strong>${escapeHtml(profile.education)}</strong></div>`
                   : ""
               }
             </div>`
          : ""
      }

      <div class="vibe-profile-card vibe-profile-profile-state">
        <div class="vibe-profile-status-dot"></div>
        <div>
          <div class="vibe-profile-card-title">Профиль сохранён</div>
          <div class="vibe-profile-status-text">
            Анкета готова для использования в Vibe.
          </div>
        </div>
      </div>
    </div>
  `);

  $("#vibe_edit_profile").on("click", showPlayerProfileEditor);
}

function showPlayerProfileEditor() {
  const profile = getPlayerProfile();

  const goals = [
    "Общение",
    "Дружба",
    "Свидания",
    "Отношения",
    "Серьёзные отношения",
    "Интим без обязательств",
    "Пока не определился"
  ];

  const lookingForOptions = [
    "Мужчины",
    "Женщины",
    "Мужчины и женщины",
    "Не важно"
  ];

  const interestOptions = [
    "Музыка","Кино","Путешествия","Игры","Книги","Спорт",
    "Собаки","Кошки","Кофе","Искусство","Еда","Прогулки"
  ];

  $("#vibe_content").html(`
    <div class="vibe-profile-editor">
      <div class="vibe-profile-editor-head">
        <button id="vibe_profile_back" type="button" class="vibe-back" aria-label="Назад">←</button>
        <div class="vibe-section-title">Редактирование профиля</div>
      </div>

      <div class="vibe-profile-photo-block">
        <div id="vibe_profile_photo_preview" class="vibe-profile-main-photo">
          ${
            profile.photos[0]
              ? `<img src="${escapeHtml(profile.photos[0])}" alt="Фото профиля">`
              : `<div class="vibe-profile-photo-placeholder">＋</div>`
          }
        </div>

        <input id="vibe_profile_photo_input" type="file" accept="image/*" hidden>

        <button id="vibe_profile_photo_button" type="button" class="menu_button">
          ${profile.photos[0] ? "Заменить фото" : "Добавить фото"}
        </button>
      </div>

      <label class="vibe-form-field">
        <span>Имя</span>
        <input id="vibe_profile_name" type="text" value="${escapeHtml(profile.name || "")}" maxlength="60">
      </label>

      <div class="vibe-form-row">
        <label class="vibe-form-field">
          <span>Возраст</span>
          <input id="vibe_profile_age" class="vibe-profile-age-input" type="number" min="18" max="99" value="${escapeHtml(profile.age || "")}">
        </label>

        <label class="vibe-form-field">
          <span>Город</span>
          <input id="vibe_profile_city" type="text" value="${escapeHtml(profile.city || "")}" maxlength="80">
        </label>
      </div>

      <label class="vibe-form-field">
        <span>Пол</span>
        <select id="vibe_profile_gender">
          <option value="">Не указан</option>
          <option value="Мужчина" ${profile.gender === "Мужчина" ? "selected" : ""}>Мужчина</option>
          <option value="Женщина" ${profile.gender === "Женщина" ? "selected" : ""}>Женщина</option>
          <option value="Другое" ${profile.gender === "Другое" ? "selected" : ""}>Другое</option>
        </select>
      </label>

      <div class="vibe-form-section">
        <div class="vibe-form-section-title">Кого ищу</div>
        <div class="vibe-chip-group" id="vibe_profile_looking_for">
          ${lookingForOptions.map(o => `
            <button type="button"
                    class="vibe-chip ${profile.lookingFor.includes(o) ? "selected" : ""}"
                    data-value="${escapeHtml(o)}">${escapeHtml(o)}</button>
          `).join("")}
        </div>
      </div>

      <div class="vibe-form-section">
        <div class="vibe-form-section-title">Цели знакомств</div>
        <div class="vibe-chip-group" id="vibe_profile_goals">
          ${goals.map(o => `
            <button type="button"
                    class="vibe-chip ${profile.datingGoals.includes(o) ? "selected" : ""}"
                    data-value="${escapeHtml(o)}">${escapeHtml(o)}</button>
          `).join("")}
        </div>
      </div>

      <div class="vibe-form-section">
        <div class="vibe-form-section-title">Интересы</div>
        <div class="vibe-chip-group" id="vibe_profile_interests">
          ${interestOptions.map(o => `
            <button type="button"
                    class="vibe-chip ${profile.interests.includes(o) ? "selected" : ""}"
                    data-value="${escapeHtml(o)}">${escapeHtml(o)}</button>
          `).join("")}
        </div>
      </div>

      <label class="vibe-form-field">
        <span>Профессия</span>
        <input id="vibe_profile_occupation" type="text" value="${escapeHtml(profile.occupation || "")}" maxlength="100">
      </label>

      <label class="vibe-form-field">
        <span>Образование</span>
        <input id="vibe_profile_education" type="text" value="${escapeHtml(profile.education || "")}" maxlength="120">
      </label>

      <label class="vibe-form-field">
        <span>О себе</span>
        <textarea id="vibe_profile_about" rows="5" maxlength="1000">${escapeHtml(profile.about || "")}</textarea>
      </label>

      <button id="vibe_profile_save" type="button" class="menu_button vibe-profile-save">
        Сохранить профиль
      </button>
    </div>
  `);

  function toggleMulti(selector, key, value) {
    profile[key] = Array.isArray(profile[key]) ? profile[key] : [];
    const index = profile[key].indexOf(value);
    if (index >= 0) profile[key].splice(index, 1);
    else profile[key].push(value);
    $(selector).filter(`[data-value="${CSS.escape(value)}"]`).toggleClass("selected");
  }

  $("#vibe_profile_looking_for .vibe-chip").on("click", function () {
    const value = $(this).data("value");
    if (value === "Не важно") {
      profile.lookingFor = ["Не важно"];
      $("#vibe_profile_looking_for .vibe-chip").removeClass("selected");
      $(this).addClass("selected");
      return;
    }
    profile.lookingFor = (profile.lookingFor || []).filter(v => v !== "Не важно");
    toggleMulti("#vibe_profile_looking_for .vibe-chip", "lookingFor", value);
  });

  $("#vibe_profile_goals .vibe-chip").on("click", function () {
    toggleMulti("#vibe_profile_goals .vibe-chip", "datingGoals", $(this).data("value"));
  });

  $("#vibe_profile_interests .vibe-chip").on("click", function () {
    toggleMulti("#vibe_profile_interests .vibe-chip", "interests", $(this).data("value"));
  });

  $("#vibe_profile_photo_button").on("click", () => {
    $("#vibe_profile_photo_input").trigger("click");
  });

  $("#vibe_profile_photo_input").on("change", function () {
    const file = this.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      profile.photos = [reader.result];
      $("#vibe_profile_photo_preview").html(
        `<img src="${escapeHtml(reader.result)}" alt="Фото профиля">`
      );
      $("#vibe_profile_photo_button").text("Заменить фото");
    };
    reader.readAsDataURL(file);
  });

  $("#vibe_profile_back").on("click", renderPlayerProfilePage);

  $("#vibe_profile_save").on("click", function () {
    profile.name = $("#vibe_profile_name").val().trim();
    profile.age = $("#vibe_profile_age").val();
    profile.city = $("#vibe_profile_city").val().trim();
    profile.gender = $("#vibe_profile_gender").val();
    profile.occupation = $("#vibe_profile_occupation").val().trim();
    profile.education = $("#vibe_profile_education").val().trim();
    profile.about = $("#vibe_profile_about").val().trim();

    saveSettingsDebounced();
    showToast("Профиль", "Профиль сохранён");
    renderPlayerProfilePage();
  });
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
    if (tab === "profile") renderPlayerProfilePage();
  });

  showFeed();
  updateUnreadUI();
}

jQuery(async () => {
  ensureSettings();
  loadChatState();

  const settingsHtml = await $.get(`${extensionFolderPath}/example.html`);
  $("#extensions_settings").append(settingsHtml);
  updateSettingsUI();

  bindMemorySettings();

  $("#vibe_widget_enabled").on("change", function () {
    extension_settings[extensionName].widgetEnabled = $(this).prop("checked");
    saveSettingsDebounced();
    updateWidget();
  });

  $("#vibe_developer_mode").on("change", function () {
    extension_settings[extensionName].developerMode = $(this).prop("checked");
    saveSettingsDebounced();
    updateSettingsUI();
  });

  $("#vibe_dev_incoming_message").on("click", function (event) {
    event.preventDefault();
    addIncomingMessage("anna", "Демо-сообщение: привет! Как проходит твой день?");
    showToast("Демо-событие", "Создано входящее сообщение от Анны.");
  });

  $("#vibe_dev_match").on("click", function (event) {
    event.preventDefault();
    createDemoMatch("katya");
  });

  $("#vibe_dev_photo_like").on("click", function (event) {
    event.preventDefault();
    createDemoPhotoLike("maxim");
  });

  $("#vibe_dev_reset").on("click", function (event) {
    event.preventDefault();
    resetDemoState();
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


  $("#vibe_memory_settings_toggle").on("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    const body = $("#vibe_memory_settings_body");
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
});
