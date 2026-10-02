const API_BASE = "/api";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
    ...options,
  });
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) {
    throw new Error(payload?.error || `Request failed (${response.status})`);
  }
  return payload;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatTime(value) {
  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(`1970-01-01T${value}`));
}

function formatMoney(value) {
  return value === 0 ? "Free" : `$${value.toFixed(0)}`;
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

const eventImages = {
  1: "sunrise run_cleanup.jpg",
  2: "women and children.jpg",
  3: "protect see.jpg",
  4: "provide laptop for yang people.jpg",
  5: "fix tools.jpg",
  6: "Twilight Steps Challenge.jpg",
  7: "Table of Thanks.jpg",
  8: "Open Mic for Mental Health.jpg",
};

function getEventImage(event) {
  const filename = eventImages[event.id];
  return filename ? `assets/${encodeURI(filename)}` : "";
}

function removeBrokenImages(container) {
  container
    .querySelectorAll(".event-image img, .detail-image img")
    .forEach((image) => {
      image.addEventListener("error", () => image.remove(), { once: true });
    });
}

function eventCard(event) {
  const image = getEventImage(event);
  return `
    <article class="event-card">
      <div class="event-image image-${escapeHtml(event.imageKey)}">
        ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(event.name)}">` : ""}
        <span class="event-tag">${escapeHtml(event.category.name)}</span>
        <span class="event-status">Upcoming</span>
        <div class="image-symbol" aria-hidden="true">✦</div>
      </div>
      <div class="event-card-body">
        <p class="event-date">${formatDate(event.date)}</p>
        <h3>${escapeHtml(event.name)}</h3>
        <p class="event-location">${escapeHtml(event.venue)} · ${escapeHtml(event.city)}</p>
        <div class="card-foot">
          <span>${formatMoney(event.ticketPrice)}</span>
          <a class="text-link" href="event.html?id=${event.id}">View event <span>↗</span></a>
        </div>
      </div>
    </article>`;
}
