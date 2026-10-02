document.addEventListener("DOMContentLoaded", async () => {
  const status = document.querySelector("#event-status");
  const content = document.querySelector("#event-content");
  const id = new URLSearchParams(location.search).get("id");
  if (!id || !/^\d+$/.test(id)) {
    status.textContent = "Choose an event from the home or search page.";
    return;
  }
  try {
    const event = await apiRequest(`/events/${id}`);
    content.innerHTML = `<div class="detail-top"><a class="text-link" href="search.html">← Back to events</a><span class="event-tag">${escapeHtml(event.category.name)}</span></div><div class="detail-grid"><div><div class="detail-image image-${escapeHtml(event.imageKey)}">${getEventImage(event) ? `<img src="${escapeHtml(getEventImage(event))}" alt="${escapeHtml(event.name)}">` : ""}<div class="image-symbol">✦</div></div><p class="eyebrow coral">The event</p><h1>${escapeHtml(event.name)}</h1><p class="detail-purpose">${escapeHtml(event.purpose)}</p><p class="detail-description">${escapeHtml(event.description)}</p></div><aside class="detail-aside"><div class="info-block"><span class="info-label">When</span><strong>${formatDate(event.date)}</strong><span>${formatTime(event.startTime)} – ${formatTime(event.endTime)}</span></div><div class="info-block"><span class="info-label">Where</span><strong>${escapeHtml(event.venue)}</strong><span>${escapeHtml(event.address)}, ${escapeHtml(event.city)}</span></div><div class="info-block"><span class="info-label">Entry</span><strong>${formatMoney(event.ticketPrice)}</strong><span>Every ticket is a donation</span></div><div class="progress-block"><div class="progress-heading"><span>Goal progress</span><strong>${Number(event.progressPercent || 0)}%</strong></div><div class="progress-track"><span style="width:${Number(event.progressPercent || 0)}%"></span></div><p>$${event.raisedAmount.toLocaleString("en-AU")} raised of $${event.goalAmount.toLocaleString("en-AU")}</p></div><button id="register-button" class="button" type="button">Register interest <span>→</span></button></aside></div>`;
    content.hidden = false;
    removeBrokenImages(content);
    status.hidden = true;
    document
      .querySelector("#register-button")
      .addEventListener("click", () =>
        alert("This feature is currently under construction."),
      );
  } catch (error) {
    status.textContent = error.message;
  }
});
