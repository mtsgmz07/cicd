document.addEventListener('DOMContentLoaded', () => {
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todosList = document.getElementById('todos-list');
  const itemsLeft = document.getElementById('items-left');
  const clearCompletedBtn = document.getElementById('clear-completed');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const todoTemplate = document.getElementById('todo-template');
  
  let todos = [];
  let currentFilter = 'all';
  
  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des todos');
      }
      todos = await response.json();
      renderTodos();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };
  
  const addTodo = async (title) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du todo');
      }
      
      const newTodo = await response.json();
      todos.push(newTodo);
      renderTodos();
      
    } catch (error) {
      console.error('Erreur:', error);
    }
  };
  
  const updateTodo = async (id, updates) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du todo');
      }
      
      const updatedTodo = await response.json();
      todos = todos.map(todo => todo.id === id ? updatedTodo : todo);
      renderTodos();
      
    } catch (error) {
      console.error('Erreur:', error);
    }
  };
  
  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du todo');
      }
      
      todos = todos.filter(todo => todo.id !== id);
      renderTodos();
      
    } catch (error) {
      console.error('Erreur:', error);
    }
  };
  
  const filterTodos = () => {
    switch (currentFilter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  };
  
  const updateItemsCount = () => {
    const count = todos.filter(todo => !todo.completed).length;
    itemsLeft.textContent = `${count} tâche${count !== 1 ? 's' : ''} à faire`;
  };
  
  const clearCompleted = async () => {
    const completedTodos = todos.filter(todo => todo.completed);
    
    try {
      for (const todo of completedTodos) {
        await deleteTodo(todo.id);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };
  
  const createTodoElement = (todo) => {
    const template = todoTemplate.content.cloneNode(true);
    const todoItem = template.querySelector('.todo-item');
    const todoText = template.querySelector('.todo-text');
    const todoCheckbox = template.querySelector('.todo-checkbox');
    const deleteBtn = template.querySelector('.delete-btn');
    
    todoItem.dataset.id = todo.id;
    todoText.textContent = todo.title;
    todoCheckbox.checked = todo.completed;
    
    if (todo.completed) {
      todoItem.classList.add('completed');
    }
    
    todoCheckbox.addEventListener('change', () => {
      updateTodo(todo.id, { completed: todoCheckbox.checked });
    });
    
    deleteBtn.addEventListener('click', () => {
      deleteTodo(todo.id);
    });
    
    return todoItem;
  };
  
  const renderTodos = () => {
    todosList.innerHTML = '';
    const filteredTodos = filterTodos();
    
    filteredTodos.forEach(todo => {
      const todoElement = createTodoElement(todo);
      todosList.appendChild(todoElement);
    });
    
    updateItemsCount();
  };
  
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = todoInput.value.trim();
    
    if (title) {
      addTodo(title);
      todoInput.value = '';
    }
  });
  
  clearCompletedBtn.addEventListener('click', clearCompleted);
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      currentFilter = button.dataset.filter;
      renderTodos();
    });
  });
  
  fetchTodos();
});