
"use strict";

const initialEvents = [
  {
    id: "EVT-101",
    title: "TechNova Hackathon",
    category: "Technology",
    date: "2026-11-05",
    time: "09:00",
    venue: "Innovation Lab",
    capacity: 120,
    description: "Build a useful prototype with a team and present your solution to the judging panel."
  },
  {
    id: "EVT-102",
    title: "AI & Robotics Workshop",
    category: "Workshop",
    date: "2026-11-12",
    time: "10:00",
    venue: "Computer Science Block",
    capacity: 60,
    description: "Explore practical AI concepts, robotics basics and hands-on demonstrations."
  },
  {
    id: "EVT-103",
    title: "Utsav Cultural Festival",
    category: "Cultural",
    date: "2026-11-20",
    time: "16:00",
    venue: "Open-Air Theatre",
    capacity: 300,
    description: "Celebrate music, dance, creativity and performances from across campus."
  },
  {
    id: "EVT-104",
    title: "Inter-College Debate",
    category: "Competition",
    date: "2026-12-03",
    time: "11:00",
    venue: "Main Auditorium",
    capacity: 80,
    description: "Present arguments, challenge perspectives and compete in a campus debate."
  },
  {
    id: "EVT-105",
    title: "Web Development Bootcamp",
    category: "Workshop",
    date: "2026-12-10",
    time: "09:30",
    venue: "Digital Learning Centre",
    capacity: 75,
    description: "Learn the foundations of accessible, responsive websites through guided activities."
  },
  {
    id: "EVT-106",
    title: "Student Research Symposium",
    category: "Research",
    date: "2026-12-18",
    time: "10:30",
    venue: "Seminar Hall B",
    capacity: 100,
    description: "Share student research, discuss new ideas and connect with faculty mentors."
  }
];

const STORAGE_EVENTS = "campusconnect.events.v1";
const STORAGE_REGISTRATIONS = "campusconnect.registrations.v1";

function loadList(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

let events = loadList(STORAGE_EVENTS, initialEvents);
let registrations = loadList(STORAGE_REGISTRATIONS, []);

function saveData() {
  try {
    localStorage.setItem(STORAGE_EVENTS, JSON.stringify(events));
    localStorage.setItem(STORAGE_REGISTRATIONS, JSON.stringify(registrations));
  } catch {
    showMessage("Browser storage is unavailable. Your changes may not persist.", "error", "create-result");
  }
}

function showMessage(message, type, targetId) {
  const target = document.getElementById(targetId);
  target.textContent = message;
  target.className = "status-result " + type;
}

function formatDate(dateValue) {
  const date = new Date(dateValue + "T12:00:00");
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function formatTime(timeValue) {
  const parts = timeValue.split(":");
  const date = new Date();
  date.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

function registrationsFor(eventId) {
  return registrations.filter(item => item.eventId === eventId);
}

function seatsLeft(event) {
  return Math.max(0, Number(event.capacity) - registrationsFor(event.id).length);
}

function categoryClass(category) {
  return String(category).toLowerCase().replace(/[^a-z]/g, "");
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderEvents() {
  const grid = document.getElementById("event-grid");
  const query = document.getElementById("search-input").value.trim().toLowerCase();
  const category = document.getElementById("category-filter").value;

  grid.replaceChildren();

  const filtered = events.filter(event => {
    const searchable = [event.title, event.venue, event.category, event.description]
      .join(" ").toLowerCase();
    return searchable.includes(query) && (category === "All" || event.category === category);
  });

  document.getElementById("empty-message").hidden = filtered.length > 0;
  document.getElementById("event-count").textContent = String(events.length);

  filtered.forEach(event => {
    const card = makeElement("article", "event-card");
    const banner = makeElement("div", "event-banner " + categoryClass(event.category));
    banner.append(makeElement("span", "category", event.category));
    banner.append(makeElement("h3", "", event.title));

    const body = makeElement("div", "event-body");
    body.append(makeElement("p", "description", event.description));

    const meta = makeElement("div", "event-meta");
    meta.append(makeElement("p", "", "📅 " + formatDate(event.date) + " · " + formatTime(event.time)));
    meta.append(makeElement("p", "", "📍 " + event.venue));
    const available = seatsLeft(event);
    const availability = makeElement(
      "p",
      "availability" + (available === 0 ? " full" : ""),
      available === 0 ? "Registration full" : available + " seats available"
    );
    meta.append(availability);
    body.append(meta);

    const button = makeElement("button", "primary-button",
      available === 0 ? "Fully booked" : "Register for event");
    button.type = "button";
    button.disabled = available === 0;
    button.addEventListener("click", () => registerForEvent(event));
    body.append(button);

    card.append(banner, body);
    grid.append(card);
  });
}

function renderSchedule() {
  const list = document.getElementById("schedule-list");
  list.replaceChildren();

  [...events]
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .forEach(event => {
      const row = makeElement("article", "schedule-item");
      row.append(makeElement("div", "schedule-date", formatDate(event.date)));
      const details = makeElement("div", "");
      details.append(makeElement("h3", "", event.title));
      details.append(makeElement("p", "", event.category + " · " + formatTime(event.time)));
      row.append(details);
      row.append(makeElement("p", "", "📍 " + event.venue));
      list.append(row);
    });
}

function registerForEvent(event) {
  const alreadyRegistered = registrations.some(item => item.eventId === event.id);
  if (alreadyRegistered) {
    showMessage("This browser already has a registration for this event.", "error", "status-result");
    document.getElementById("registration").scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (seatsLeft(event) < 1) {
    renderAll();
    return;
  }

  const registrationId = "CC-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const record = {
    id: registrationId,
    eventId: event.id,
    eventTitle: event.title,
    registeredAt: new Date().toISOString(),
    status: "Confirmed"
  };

  registrations.push(record);
  saveData();
  renderAll();
  document.getElementById("registration-id").value = registrationId;
  showMessage(
    "Registration confirmed for " + event.title + ". Your registration ID is " + registrationId + ". Save it to check your status.",
    "success",
    "status-result"
  );
  document.getElementById("registration").scrollIntoView({ behavior: "smooth" });
}

document.getElementById("search-input").addEventListener("input", renderEvents);
document.getElementById("category-filter").addEventListener("change", renderEvents);

document.getElementById("status-form").addEventListener("submit", event => {
  event.preventDefault();
  const id = document.getElementById("registration-id").value.trim().toUpperCase();
  const record = registrations.find(item => item.id === id);

  if (!record) {
    showMessage("No registration found. Check the ID or register for an event first.", "error", "status-result");
    return;
  }

  showMessage(
    "Status: " + record.status + " · Event: " + record.eventTitle + " · ID: " + record.id,
    "success",
    "status-result"
  );
});

document.getElementById("event-form").addEventListener("submit", event => {
  event.preventDefault();

  const title = document.getElementById("new-title").value.trim();
  const date = document.getElementById("new-date").value;
  const time = document.getElementById("new-time").value;
  const venue = document.getElementById("new-venue").value.trim();
  const capacity = Number(document.getElementById("new-capacity").value);

  if (!title || !date || !time || !venue || !Number.isInteger(capacity) || capacity < 1) {
    showMessage("Enter valid event details and a positive participant limit.", "error", "create-result");
    return;
  }

  const newEvent = {
    id: "EVT-" + Date.now().toString().slice(-8),
    title,
    category: document.getElementById("new-category").value,
    date,
    time,
    venue,
    capacity,
    description: document.getElementById("new-description").value.trim() || "New campus event. Check the schedule for details."
  };

  events.push(newEvent);
  saveData();
  renderAll();
  document.getElementById("event-form").reset();
  document.getElementById("new-time").value = "10:00";
  showMessage("Event created: " + title, "success", "create-result");

  const update = makeElement("div", "update-card");
  update.append(makeElement("strong", "", "New event: " + title));
  update.append(makeElement("p", "", formatDate(date) + " · " + venue + " · " + capacity + " seats"));
  document.getElementById("custom-updates").prepend(update);
});

function renderMonitor() {
  document.getElementById("total-registrations").textContent = String(registrations.length);
  document.getElementById("total-capacity").textContent =
    String(events.reduce((total, event) => total + Number(event.capacity), 0));

  const monitor = document.getElementById("registration-monitor");
  monitor.replaceChildren();

  events.forEach(event => {
    const row = makeElement("div", "monitor-row");
    row.append(makeElement("strong", "", event.title));
    row.append(makeElement("span", "", registrationsFor(event.id).length +
      " registered / " + event.capacity + " seats"));
    monitor.append(row);
  });

  if (events.length === 0) {
    monitor.append(makeElement("p", "", "No events created yet."));
  }
}

function renderAll() {
  renderEvents();
  renderSchedule();
  renderMonitor();
}

renderAll();
