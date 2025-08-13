let tasks = [];
let taskIdCounter = 0;
let currentFilter = "all";
let currentSort = "newest";

document.addEventListener("DOMContentLoaded", () => {
  initApp();
  console.log("Organizador de Tarefas OptiPlus carregado com sucesso!");
});

function initApp() {
  bindEvents();
  updateDisplay();
  addToastStyles();
  setMinDate();
}

function bindEvents() {
  const form = document.getElementById("form-tarefa");
  form.addEventListener("submit", addTask);
  document.getElementById("filter-status").addEventListener("change", (e) => {
    currentFilter = e.target.value;
    updateDisplay();
  });
  document.getElementById("sort-by").addEventListener("change", (e) => {
    currentSort = e.target.value;
    updateDisplay();
  });
}

function setMinDate() {
  document.getElementById("data-limite").min = new Date()
    .toISOString()
    .split("T")[0];
}

function addTask(event) {
  event.preventDefault();
  const input = document.getElementById("tarefa-input");
  const dateInput = document.getElementById("data-limite");
  const taskText = input.value.trim();

  if (taskText) {
    tasks.push({
      id: ++taskIdCounter,
      text: taskText,
      completed: false,
      createdAt: new Date(),
      dueDate: dateInput.value ? new Date(dateInput.value + "T23:59:59") : null,
    });
    input.value = "";
    dateInput.value = "";
    updateDisplay();
    showFeedback("Tarefa adicionada com sucesso!", "success");
  }
}

function toggleTask(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    updateDisplay();
    showFeedback(
      task.completed ? "Tarefa concluída!" : "Tarefa reaberta!",
      task.completed ? "success" : "info"
    );
  }
}

function deleteTask(taskId) {
  tasks = tasks.filter((t) => t.id !== taskId);
  updateDisplay();
  showFeedback("Tarefa removida!", "danger");
}

function updateDisplay() {
  renderTasks();
  updateStats();
}

function getFilteredAndSortedTasks() {
  const now = new Date();
  let filteredTasks = tasks.filter((t) => {
    if (currentFilter === "pending") return !t.completed;
    if (currentFilter === "completed") return t.completed;
    if (currentFilter === "overdue")
      return !t.completed && t.dueDate && t.dueDate < now;
    return true;
  });

  filteredTasks.sort((a, b) => {
    if (currentSort === "newest") return b.createdAt - a.createdAt;
    if (currentSort === "oldest") return a.createdAt - b.createdAt;
    if (currentSort === "due-asc")
      return (a.dueDate || b.createdAt) - (b.dueDate || a.createdAt);
    if (currentSort === "due-desc")
      return (b.dueDate || a.createdAt) - (a.dueDate || b.createdAt);
    if (currentSort === "alphabetical") return a.text.localeCompare(b.text);
    return a.completed - b.completed;
  });

  return filteredTasks;
}

function renderTasks() {
  const container = document.getElementById("lista-tarefas");
  const emptyState = document.getElementById("empty-state");
  const filteredTasks = getFilteredAndSortedTasks();

  if (filteredTasks.length === 0) {
    container.innerHTML = "";
    emptyState.style.display = "block";
    const emptyIcon = emptyState.querySelector("i");
    const emptyTitle = emptyState.querySelector("h4");
    const emptyText = emptyState.querySelector("p");

    if (tasks.length === 0) {
      emptyIcon.className = "bi bi-clipboard-check";
      emptyTitle.textContent = "Nenhuma tarefa ainda";
      emptyText.textContent = "Comece adicionando sua primeira tarefa acima";
    } else {
      emptyIcon.className = "bi bi-funnel";
      emptyTitle.textContent = "Nenhuma tarefa encontrada";
      emptyText.textContent = "Tente alterar os filtros para ver suas tarefas";
    }
    return;
  }

  emptyState.style.display = "none";
  container.innerHTML = filteredTasks.map(createTaskHTML).join("");
}

function createTaskHTML(task) {
  const now = new Date();
  const isOverdue = task.dueDate && !task.completed && task.dueDate < now;
  const isToday = task.dueDate && isSameDay(task.dueDate, now);
  const dueDateInfo = task.dueDate
    ? `<span class="due-date ${
        isOverdue ? "overdue" : isToday ? "today" : "upcoming"
      }">${
        isOverdue
          ? `Atrasada: ${formatDate(task.dueDate)}`
          : isToday
          ? "Hoje"
          : `Prazo: ${formatDate(task.dueDate)}`
      }</span>`
    : "";

  return `
    <div class="task-item ${task.completed ? "completed" : ""} ${
    isOverdue ? "overdue" : ""
  } fade-in">
      <div class="task-content">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" ${
            task.completed ? "checked" : ""
          } onchange="toggleTask(${task.id})">
        </div>
        <div class="task-main">
          <div class="task-text ${
            task.completed ? "completed" : ""
          }">${escapeHtml(task.text)}</div>
          <div class="task-meta">
            <small>Criada: ${formatDateTime(task.createdAt)}</small>
            ${dueDateInfo ? `<br>${dueDateInfo}` : ""}
          </div>
        </div>
        <div class="task-actions">
          <button class="btn btn-success btn-sm" onclick="toggleTask(${
            task.id
          })" title="${task.completed ? "Reabrir tarefa" : "Concluir tarefa"}">
            <i class="bi bi-${
              task.completed ? "arrow-clockwise" : "check"
            }"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteTask(${
            task.id
          })" title="Remover tarefa">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

function updateStats() {
  const now = new Date();
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const overdue = tasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < now
  ).length;

  document.getElementById("total-tasks").textContent = total;
  document.getElementById("completed-tasks").textContent = completed;
  document.getElementById("pending-tasks").textContent = pending;
  document.getElementById("overdue-tasks").textContent = overdue;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function isSameDay(date1, date2) {
  return date1.toDateString() === date2.toDateString();
}

function showFeedback(message, type) {
  const toast = document.createElement("div");
  toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  toast.style.cssText = `top: 20px; right: 20px; z-index: 1050; min-width: 300px; animation: slideIn 0.3s ease-out;`;
  toast.innerHTML = `${escapeHtml(
    message
  )}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function escapeHtml(text) {
  return text.replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[
        m
      ])
  );
}

function addToastStyles() {
  if (!document.getElementById("toast-styles")) {
    const style = document.createElement("style");
    style.id = "toast-styles";
    style.textContent = `@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
    document.head.appendChild(style);
  }
}

function clearAllTasks() {
  if (
    tasks.length > 0 &&
    confirm("Tem certeza que deseja remover todas as tarefas?")
  ) {
    tasks = [];
    updateDisplay();
    showFeedback("Todas as tarefas foram removidas!", "warning");
  }
}

function getStats() {
  const now = new Date();
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const overdue = tasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < now
  ).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, pending, overdue, completionRate };
}


const chk = document.getElementById('chk');


window.addEventListener('DOMContentLoaded', () => {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.body.classList.add('dark');
    const form = document.querySelector('form');
    if (form) {
      form.classList.add('dark');
    }
    chk.checked = true;
  }
});

chk.addEventListener('change', () => {
  const isDark = chk.checked;
  document.body.classList.toggle('dark', isDark);
  const form = document.querySelector('form');
  if (form) {
    form.classList.toggle('dark', isDark);
  }

  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});