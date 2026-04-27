// Matheus Quirino - Maio de 2025
class TodoApp {
  constructor() {
    this.tasks = this.loadTasks()
    this.taskId = this.getNextId()
    this.currentFilter = "all"
    this.editingTaskId = null

    this.initElements()
    this.bindEvents()
    this.render()
  }

  initElements() {
    this.taskInput = document.getElementById("tarefaInput")
    this.btnAdicionar = document.getElementById("btnAdicionar")
    this.lista_tarefas = document.getElementById("lista_tarefas")
    this.totalCountElement = document.getElementById("totalCount")
    this.completedCountElement = document.getElementById("completedCount")
    this.pendingCountElement = document.getElementById("pendingCount")
    this.warningMessage = document.getElementById("warningMessage")
    this.taskCountElement = document.getElementById("taskCount")
    this.clearCompletedBtn = document.getElementById("clearCompleted")
    this.filterBtns = document.querySelectorAll(".filter-btn")
  }

  bindEvents() {
    this.btnAdicionar.addEventListener("click", () => this.addTask())
    this.taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addTask()
    })

    this.clearCompletedBtn.addEventListener("click", () => this.clearCompleted())

    this.filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => this.setFilter(e.target.dataset.filter))
    })
  }

  loadTasks() {
    try {
      const saved = localStorage.getItem("todoTasks")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }

  saveTasks() {
    localStorage.setItem("todoTasks", JSON.stringify(this.tasks))
  }

  getNextId() {
    return this.tasks.length > 0 ? Math.max(...this.tasks.map((t) => t.id)) + 1 : 1
  }

  addTask() {
    const taskText = this.taskInput.value.trim()

    if (taskText === "") {
      this.taskInput.focus()
      return
    }

    const task = {
      id: this.taskId++,
      text: taskText,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    this.tasks.unshift(task)
    this.saveTasks()
    this.render()

    this.taskInput.value = ""
    this.taskInput.focus()
  }

  editTask(id) {
    if (this.editingTaskId !== null) {
      this.cancelEdit()
    }
    this.editingTaskId = id
    this.render()
  }

  saveEdit(id, newText) {
    const task = this.tasks.find((t) => t.id === id)
    if (task && newText.trim()) {
      task.text = newText.trim()
      this.editingTaskId = null
      this.saveTasks()
      this.render()
    }
  }

  cancelEdit() {
    this.editingTaskId = null
    this.render()
  }

  toggleTaskCompletion(id) {
    const task = this.tasks.find((t) => t.id === id)
    if (task) {
      task.completed = !task.completed
      task.completedAt = task.completed ? new Date().toISOString() : null
      this.saveTasks()
      this.render()
    }
  }

  removeTask(id) {
    if (confirm("Tem certeza que deseja remover esta tarefa?")) {
      this.tasks = this.tasks.filter((t) => t.id !== id)
      this.editingTaskId = null
      this.saveTasks()
      this.render()
    }
  }

  setFilter(filter) {
    this.currentFilter = filter
    this.filterBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === filter)
    })
    this.render()
  }

  getFilteredTasks() {
    switch (this.currentFilter) {
      case "completed":
        return this.tasks.filter((task) => task.completed)
      case "pending":
        return this.tasks.filter((task) => !task.completed)
      default:
        return this.tasks
    }
  }

  clearCompleted() {
    const completedCount = this.tasks.filter((t) => t.completed).length
    if (completedCount === 0) return

    if (confirm(`Remover ${completedCount} tarefa(s) concluída(s)?`)) {
      this.tasks = this.tasks.filter((t) => !t.completed)
      this.saveTasks()
      this.render()
    }
  }

  render() {
    this.renderTasks()
    this.updateCounters()
  }

  renderTasks() {
    const filteredTasks = this.getFilteredTasks()
    this.lista_tarefas.innerHTML = ""

    if (filteredTasks.length === 0) {
      const emptyMessage = document.createElement("div")
      emptyMessage.className = "empty-message"
      emptyMessage.textContent =
        this.currentFilter === "all"
          ? "Nenhuma tarefa adicionada ainda"
          : `Nenhuma tarefa ${this.currentFilter === "completed" ? "concluída" : "pendente"}`
      this.lista_tarefas.appendChild(emptyMessage)
      return
    }

    filteredTasks.forEach((task) => {
      const li = document.createElement("li")
      li.className = task.completed ? "completed" : ""
      if (this.editingTaskId === task.id) {
        li.classList.add("editing")
      }

      if (this.editingTaskId === task.id) {
        li.innerHTML = this.createEditTaskHTML(task)
      } else {
        li.innerHTML = this.createTaskHTML(task)
      }

      this.lista_tarefas.appendChild(li)
    })
  }

  createTaskHTML(task) {
    return `
      <span class="task-text ${task.completed ? "completed" : ""}" 
            onclick="todoApp.editTask(${task.id})" 
            title="Clique para editar">
        ${this.escapeHtml(task.text)}
      </span>
      <div class="task-buttons">
        <button class="task-btn complete-btn ${task.completed ? "undo" : ""}" 
                onclick="todoApp.toggleTaskCompletion(${task.id})"
                title="${task.completed ? "Marcar como pendente" : "Marcar como concluída"}">
          ${task.completed ? "Desfazer" : "Concluir"}
        </button>
        <button class="task-btn edit-btn" 
                onclick="todoApp.editTask(${task.id})"
                title="Editar tarefa">
          Editar
        </button>
        <button class="task-btn remove-btn" 
                onclick="todoApp.removeTask(${task.id})"
                title="Remover tarefa">
          Remover
        </button>
      </div>
    `
  }

  createEditTaskHTML(task) {
    return `
      <input type="text" class="task-edit-input" 
             value="${this.escapeHtml(task.text)}" 
             maxlength="100"
             onkeypress="if(event.key==='Enter') todoApp.saveEdit(${task.id}, this.value); if(event.key==='Escape') todoApp.cancelEdit()"
             autofocus>
      <div class="task-buttons">
        <button class="task-btn save-btn" 
                onclick="todoApp.saveEdit(${task.id}, this.parentElement.previousElementSibling.value)">
          Salvar
        </button>
        <button class="task-btn cancel-btn" 
                onclick="todoApp.cancelEdit()">
          Cancelar
        </button>
      </div>
    `
  }

  updateCounters() {
    const totalTasks = this.tasks.length
    const completedTasks = this.tasks.filter((task) => task.completed).length
    const pendingTasks = totalTasks - completedTasks

    this.totalCountElement.textContent = totalTasks
    this.completedCountElement.textContent = completedTasks
    this.pendingCountElement.textContent = pendingTasks
    this.taskCountElement.textContent = totalTasks

    // Show/hide warning and clear button
    if (totalTasks > 8) {
      this.warningMessage.classList.remove("hidden")
    } else {
      this.warningMessage.classList.add("hidden")
    }

    this.clearCompletedBtn.style.display = completedTasks > 0 ? "block" : "none"
  }

  showNotification(message, type = "info") {
    console.log(`[${type.toUpperCase()}] ${message}`)
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.todoApp = new TodoApp()
})
