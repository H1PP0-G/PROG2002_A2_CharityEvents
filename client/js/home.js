document.addEventListener("DOMContentLoaded", async () => {
  const status = document.querySelector("#home-status");
  const events = document.querySelector("#home-events");
  try {
    const [orgs, data] = await Promise.all([
      apiRequest("/organisations"),
      apiRequest("/events"),
    ]);
    if (orgs[0]) {
      document.querySelector("#mission").textContent = orgs[0].mission;
      document.querySelector("#footer-contact").innerHTML =
        `${escapeHtml(orgs[0].email)}<br>${escapeHtml(orgs[0].phone)}`;
    }
    status.textContent = `${data.count} opportunities to make an impact`;
    events.innerHTML = data.events.slice(0, 4).map(eventCard).join("");
  } catch (error) {
    status.textContent = error.message;
    status.classList.add("status-error");
  }
});
