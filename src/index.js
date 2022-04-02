const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.find((user) => user.username === username);

  if(!userExists)
    return response.status(404).json({ error: "User don't exists!" });
  
  request.user = userExists;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  const userAlreadyExists = users.find((user) => user.username === username);
  if(userAlreadyExists)
    return response.status(400).json({error: "User already exists"});

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo)
    return response.status(404).json({error: "This todo doesn't exist to this user!"})

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo)
    return response.status(404).json({error: "This todo doesn't exist to this user!"})

  todo.done = true

  return response.status(201).json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  
  const todoToDelete = user.todos.find((todo) => todo.id === id);

  if(!todoToDelete)
    return response.status(404).json({error: "This todo doesn't exists!"})

  const todoToDeleteIndex = user.todos.indexOf(todoToDelete[0]);
  user.todos.splice(todoToDeleteIndex, 1);

  return response.status(204).send();
});

module.exports = app;