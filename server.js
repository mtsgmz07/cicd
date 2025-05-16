const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const todosPath = path.join(dataDir, 'todos.json');

if (!fs.existsSync(todosPath)) {
  fs.writeFileSync(todosPath, JSON.stringify({ todos: [] }, null, 2));
}

const readTodos = () => {
  const data = fs.readFileSync(todosPath, 'utf8');
  return JSON.parse(data);
};

const writeTodos = (data) => {
  fs.writeFileSync(todosPath, JSON.stringify(data, null, 2));
};

app.get('/api/todos', (req, res) => {
  try {
    const data = readTodos();
    res.json(data.todos);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des todos' });
  }
});

app.post('/api/todos', (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Le titre est obligatoire' });
    }

    const data = readTodos();
    const newTodo = {
      id: Date.now(),
      title,
      completed: false,
      createdAt: new Date().toISOString()
    };

    data.todos.push(newTodo);
    writeTodos(data);

    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du todo' });
  }
});

app.put('/api/todos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, completed } = req.body;

    const data = readTodos();
    const todoIndex = data.todos.findIndex(todo => todo.id === id);

    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo non trouvé' });
    }

    if (title !== undefined) {
      data.todos[todoIndex].title = title;
    }

    if (completed !== undefined) {
      data.todos[todoIndex].completed = completed;
    }

    writeTodos(data);
    res.json(data.todos[todoIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du todo' });
  }
});

app.delete('/api/todos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = readTodos();
    
    const todoIndex = data.todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo non trouvé' });
    }

    data.todos.splice(todoIndex, 1);
    writeTodos(data);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du todo' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});