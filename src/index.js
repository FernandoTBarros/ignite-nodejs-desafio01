const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find(user => username == user.username);
  if(user) {
	request.user = user;
	next();
  }
  else {
	response.status(404).send({error:'Username does not exists'})
  }
}

app.post('/users', (request, response) => {
	const { name, username } = request.body;
	const usernameAlreadyExists = users.some(user => user.username === username);
	if(usernameAlreadyExists) {
		response.status(400).send({error:'Username already exists'})
	}
	const newUser = { 
		id:uuidv4(), 
		name, 
		username, 
		todos:[] 
	}
	users.push(newUser);
	response.status(201).send(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  response.status(200).send(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const todo = {
	  id:uuidv4(), 
	  title,
	  done: false,
	  deadline: new Date(deadline),
	  created_at: new Date()
  }
  user.todos.push(todo);
  response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
	const { user } = request;
	const { title:newTitle, deadline:newDeadline } = request.body;
	const { id } = request.params;
	const todo = user.todos.find(todo => todo.id == id);
	if(!todo) {
		return response.status(404).send({error: `TODO not found with id: ${id}`})	
	}
	todo.title = (newTitle ? newTitle : todo.title);
	todo.deadline = (newDeadline ? new Date(newDeadline) : todo.deadline);
	response.status(200).send(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
	const { user } = request;
	const { id } = request.params;
	const todo = user.todos.find(todo => todo.id == id);
	if(!todo) {
		return response.status(404).send({error: `TODO not found with id: ${id}`})	
	}
	todo.done = true;
	response.status(200).send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
	const { user } = request;
	const { id } = request.params;
	const todo = user.todos.find(todo => todo.id == id);
	if(!todo) {
		return response.status(404).send({error: `TODO not found with id: ${id}`})	
	}
	user.todos.splice(todo, 1);
	response.status(204).send();
});

module.exports = app;