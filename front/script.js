let todoInput = document.getElementById('todo-input');
let todoForm = document.getElementById('todo-form');
let todoList = document.getElementById('todo-list');

let todos = [];

async function fetchTodos() {
    try {
        const response = await fetch('http://localhost:3000/api/task/');
        todos = await response.json();
        displayTodos();
    } catch (error) {
        console.error('Ошибка получения задач:', error);
    }
}

function displayTodos() {
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
        const li = document.createElement('li');

        const completeButton = document.createElement('button');
        completeButton.classList.add('complete-button');
        completeButton.textContent = todo.completed ? 'Невиконано' : 'Виконано';
        if (todo.completed) {
            completeButton.classList.add('completed');
        }

        completeButton.addEventListener('click', () => toggleComplete(todo.id));

        const taskText = document.createElement('span');
        taskText.textContent = todo.task;

        if (todo.completed) {
            taskText.classList.add('completed');
        }

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete');
        deleteButton.textContent = 'Видалити';
        deleteButton.addEventListener('click', () => deleteTodo(todo.id));
        
        li.appendChild(taskText);
        li.appendChild(completeButton);
        li.appendChild(deleteButton);

        todoList.appendChild(li);
    });
}

todoForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const newTodoText = todoInput.value.trim();
    if (newTodoText !== '') {
        const newTodo = { task: newTodoText, completed: false };
        try {
            const response = await fetch('http://localhost:3000/api/task/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTodo)
            });
            if (response.ok) {
                const addedTodo = await response.json();
                todos.push(addedTodo);
                todoInput.value = '';
                displayTodos();
            }
        } catch (error) {
            console.error('Ошибка добавления задачи:', error);
        }
    }
});

async function toggleComplete(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        try {
            const response = await fetch(`http://localhost:3000/api/task/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(todo)
            });
            if (response.ok) {
                displayTodos();
            }
        } catch (error) {
            console.error('Ошибка обновления задачи:', error);
        }
    }
}

async function deleteTodo(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/task/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            todos = todos.filter(t => t.id !== id);
            displayTodos();
        }
    } catch (error) {
        console.error('Ошибка удаления задачи:', error);
    }
}

fetchTodos();
