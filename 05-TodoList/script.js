let todos = JSON.parse(localStorage.getItem("todos")) || [];

const todoInput = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("todoList");
const clearBtn = document.getElementById("clearBtn");
const filters = document.querySelectorAll(".filters button");
const taskCounter = document.getElementById("taskCounter");

let editIndex = null; 
let currentFilter = "all"; 

function renderTodos() {
  todoList.innerHTML = ""; 

  let filteredTodos = todos.filter(todo => {
    if (currentFilter === "completed") return todo.completed;
    if (currentFilter === "pending") return !todo.completed;
    return true;
  });

  filteredTodos.forEach((todo, index) => {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = todo.text;
    if (todo.completed) span.classList.add("completed");

    span.onclick = () => {
      todos[index].completed = !todos[index].completed;
      saveTodos();
    };

    const editBtn = document.createElement("button");
    editBtn.classList.add("edit");
    editBtn.innerHTML = `<i class="fa-solid fa-pen"></i>`;
    editBtn.onclick = () => {
      todoInput.value = todo.text;
      editIndex = index;
      addBtn.innerHTML = `<i class="fa-solid fa-rotate"></i> Update`;
    };

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete");
    deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;
    deleteBtn.onclick = () => {
       li.classList.add("removing"); 
       setTimeout(() => {
        todos.splice(index, 1);
        saveTodos();
  }, 400); 
};

    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
  });

  const pendingCount = todos.filter(todo => !todo.completed).length;
  taskCounter.textContent = `${pendingCount} tasks left`;
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
  renderTodos();
}

addBtn.onclick = () => {
  const text = todoInput.value.trim();
  if (text !== "") {
    if (editIndex !== null) {
      todos[editIndex].text = text;
      editIndex = null;
      addBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Add`;
    } else {
      todos.push({ text, completed: false });
    }
    saveTodos();
    todoInput.value = "";
  }
};

clearBtn.onclick = () => {
  todos = [];
  saveTodos();
};

filters.forEach(btn => {
  btn.onclick = () => {
    filters.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.getAttribute("data-filter");
    renderTodos();
  };
});

renderTodos();
