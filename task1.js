// На странице находится инпут и кнопка.

// Пользователь может ввести что-то в инпут и нажать на кнопку, после этого в
// списке ниже должна отобразится строка с тем что было введено в инпуте.
// Инпут очищается

// Каждое дела в списке может быть в двух состояниях (нужно сделать - желтый
// фон и сделано - зеленый фон).
// По умолчанию, дело в список добавляется в статусе нужно сделать.
// При клике на него, состояние меняется на противоположное.

// Пользователь может удалять любые дела.

// Все данные берем с сервера, и управление тоже через сервер

// https://jsonplaceholder.typicode.com/todos

class TodoListRequests {
    static sendGetTodosRequest() {
        return fetch('https://jsonplaceholder.typicode.com/todos').then((response) => response.json());
    }

    static sendPostTodosRequest(currentInputValue, listId) {
        return fetch('https://jsonplaceholder.typicode.com/todos', {
            method: 'POST',
            body: JSON.stringify({ title: currentInputValue, id: listId }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
            .then((response) => response.json());
    }

    static sendPutTodosRequest(changedListState, listId) {
        return fetch(`https://jsonplaceholder.typicode.com/todos/${listId}`, {
            method: 'PUT',
            body: JSON.stringify({ completed: changedListState, id: listId }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
            .then((response) => response.json());
    }

    static sendDeleteTodosRequest(listId) {
        return fetch(`https://jsonplaceholder.typicode.com/todos/${listId}`, {
            method: 'DELETE',
        });
    }
}
class TodoListLogic {
    static getTodosList() {
        const promiseTodoList = TodoListRequests.sendGetTodosRequest();
        promiseTodoList
            .then((todos) => renderTodoslist(todos));
    }

    static createTodolist() {
        const currentInputValue = inputForAddList.value;
        const initialInputValue = (inputForAddList.value = '');

        if (currentInputValue && currentInputValue.trim().length) {
            changeVisibilityEmptyListMessage();
            const promisePostTodoList = TodoListRequests.sendPostTodosRequest(currentInputValue);
            promisePostTodoList.then((todo) => renderTodolist(todo));
            return initialInputValue;
        }

        alert('Your input is empty');
        return initialInputValue;
    }

    static changeColorTodolist(event) {
        const todoListElementTarget = event.target.classList.contains('list-group-item');
        const todoListElement = event.target.closest('li');
        const listId = todoListElement.id;
        let changedListState = '';

        if (todoListElement.classList.contains('list-group-item-warning')) {
            changedListState = 'true';
        } else {
            changedListState = 'false';
        }

        if (todoListElementTarget) {
            const promisePutTodoList = TodoListRequests.sendPutTodosRequest(changedListState, listId);
            promisePutTodoList.then(() => {
                todoListElement.classList.toggle('list-group-item-warning');
                todoListElement.classList.toggle('list-group-item-success');
            });
        }
    }

    static removeTodolist(event) {
        const todoCloseButton = event.target.classList.contains('bi-x-square');
        const todoListElement = event.target.closest('li');
        const listId = todoListElement.id;

        if (todoCloseButton) {
            const promiseDeleteTodoList = TodoListRequests.sendDeleteTodosRequest(listId);
            promiseDeleteTodoList.then(() => todoListElement.remove());
            changeVisibilityEmptyListMessage();
        }
    }
}

const todoList = document.querySelector('.js-todo-list');
const addListButton = document.querySelector('.js-add-todo');
const inputForAddList = document.querySelector('.js-todo-name');
const emptyListMessage = document.querySelector('.js-hidden-text');
const formWithTodoElements = document.querySelector('.js-todo-form');

init();

function init() {
    TodoListLogic.getTodosList();
    disableEnterKeyEventListener();
    createAddTodolistEventListener();
    createRemoveTodoListEventListener();
    createChangeColorTodoListEventListener();
}

function createAddTodolistEventListener() {
    addListButton.addEventListener('click', () => {
        TodoListLogic.createTodolist();
    });
}

function createRemoveTodoListEventListener() {
    todoList.addEventListener('click', (event) => {
        TodoListLogic.removeTodolist(event);
    });
}

function createChangeColorTodoListEventListener() {
    todoList.addEventListener('click', (event) => {
        TodoListLogic.changeColorTodolist(event);
    });
}

function disableEnterKeyEventListener() {
    formWithTodoElements.addEventListener('keypress', (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
        }
    });
}

function renderTodoslist(todos) {
    const todoListItem = todos.map((list) => getListItem(list));
    todoList.innerHTML = todoListItem.join('');
    changeVisibilityEmptyListMessage();
}

function renderTodolist(list) {
    const todoListItem = getListItem(list);
    todoList.insertAdjacentHTML('afterbegin', todoListItem);
    changeVisibilityEmptyListMessage();
}

function getListItem(item) {
    let todoListElementState = item.completed;
    if (item.completed === false || item.completed === undefined) {
        todoListElementState = 'list-group-item-warning';
    } else if (item.completed === true) {
        todoListElementState = 'list-group-item-success';
    }
    return `
    <li class="list-group-item ${todoListElementState} my-1" id=${item.id}>${item.title}
        <i class="bi bi-x-square mx-3"></i>
    </li>
    `;
}

function changeVisibilityEmptyListMessage() {
    if (todoList.children.length >= 1) {
        emptyListMessage.hidden = true;
    } else {
        emptyListMessage.hidden = false;
    }
}
