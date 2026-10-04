function dateToIso(value) {
  // Convert the user-friendly DD/MM/YYYY input into the ISO format expected
  // by MySQL while rejecting impossible calendar dates.
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const candidate = new Date(`${year}-${month}-${day}T00:00:00`);
  const valid =
    candidate.getFullYear() === Number(year) &&
    candidate.getMonth() + 1 === Number(month) &&
    candidate.getDate() === Number(day);
  return valid ? `${year}-${month}-${day}` : null;
}

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.querySelector("#search-form");
  const select = document.querySelector("#category");
  const results = document.querySelector("#search-results");
  const status = document.querySelector("#search-status");
  const count = document.querySelector("#result-count");
  const error = document.querySelector("#form-error");
  form.date.addEventListener("input", () => {
    // Add separators only while typing digits. Backspace remains a normal
    // editing action because the value is rebuilt from the current input.
    const digits = form.date.value.replace(/\D/g, "").slice(0, 8);
    const parts = [
      digits.slice(0, 2),
      digits.slice(2, 4),
      digits.slice(4, 8),
    ].filter(Boolean);
    form.date.value = parts.join("/");
  });

  try {
    // Categories are loaded from the API so the filter stays consistent with
    // the database rather than duplicating category names in HTML.
    const cats = await apiRequest("/categories");
    cats.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.name;
      select.append(option);
    });
    await search();
  } catch (failure) {
    status.textContent = failure.message;
  }

  form.addEventListener("submit", (event) => {
    // Client-side validation gives immediate feedback before a request is sent.
    event.preventDefault();
    error.textContent = "";
    if (form.date.value && !dateToIso(form.date.value)) {
      error.textContent = "Enter a valid date in DD/MM/YYYY format.";
      return;
    }
    search();
  });

  document.querySelector("#clear-filters").addEventListener("click", () => {
    form.reset();
    error.textContent = "";
    search();
  });

  async function search() {
    // URLSearchParams safely encodes optional filters for the REST endpoint.
    status.textContent = "Finding events...";
    const params = new URLSearchParams();
    const isoDate = dateToIso(form.date.value);
    if (isoDate) params.set("date", isoDate);
    if (form.location.value.trim())
      params.set("location", form.location.value.trim());
    if (form.category.value) params.set("category", form.category.value);
    try {
      const data = await apiRequest(`/events?${params}`);
      count.textContent = `${data.count} result${data.count === 1 ? "" : "s"}`;
      status.textContent = data.count ? "" : "No events match those filters.";
      results.innerHTML = data.events.map(eventCard).join("");
      removeBrokenImages(results);
    } catch (failure) {
      status.textContent = failure.message;
    }
  }
});
