/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import { useEffect, useState } from 'react';
import { Todo } from './types/Todo';
import { getTodos } from './api/todos';
import { UserWarning } from './UserWarning';
import { USER_ID } from './api/todos';

type StatusFilter = 'all' | 'active' | 'completed';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [visibleTodos, setVisibleTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    if (!USER_ID) {
      return;
    }

    const loadTodos = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const todosFromServer = await getTodos();

        setTodos(todosFromServer);
      } catch {
        setErrorMessage('Unable to load todos');
      } finally {
        setIsLoading(false);

        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      }
    };

    loadTodos();
  }, []);

  useEffect(() => {
    let filtered = [...todos];

    if (statusFilter === 'active') {
      filtered = filtered.filter(todo => !todo.completed);
    } else if (statusFilter === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    }

    setVisibleTodos(filtered);
  }, [todos, statusFilter]);

  const handleFilterChange = (filter: 'all' | 'active' | 'completed') => {
    setStatusFilter(filter);
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  const completedCount = todos.filter(todo => todo.completed).length;

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          <button
            type="button"
            className={`todoapp__toggle-all ${todos.length > 0 && todos.every(todo => todo.completed) ? 'active' : ''}`}
            data-cy="ToggleAllButton"
            disabled
          />

          <form>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              disabled
            />
          </form>
        </header>

        {isLoading ? (
          <div className="loader" data-cy="Loader" />
        ) : visibleTodos.length > 0 ? (
          <section className="todoapp__main" data-cy="TodoList">
            {visibleTodos.map(todo => (
              <div
                key={todo.id}
                data-cy="Todo"
                className={`todo${todo.completed === true ? ' completed' : ''}`}
              >
                <label className="todo__status-label">
                  <input
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                    checked={todo.completed}
                    disabled
                  />
                </label>

                <span data-cy="TodoTitle" className="todo__title">
                  {todo.title}
                </span>
                <button
                  type="button"
                  className="todo__remove"
                  data-cy="TodoDelete"
                >
                  ×
                </button>

                <div data-cy="TodoLoader" className="modal overlay">
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {todos.filter(todo => !todo.completed).length} items left
            </span>

            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={`filter__link ${statusFilter === 'all' ? 'selected' : ''}`}
                data-cy="FilterLinkAll"
                onClick={() => handleFilterChange('all')}
              >
                All
              </a>

              <a
                href="#/active"
                className={`filter__link ${statusFilter === 'active' ? 'selected' : ''}`}
                data-cy="FilterLinkActive"
                onClick={() => handleFilterChange('active')}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={`filter__link ${statusFilter === 'completed' ? 'selected' : ''}`}
                data-cy="FilterLinkCompleted"
                onClick={() => handleFilterChange('completed')}
              >
                Completed
              </a>
            </nav>

            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              disabled={completedCount === 0}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={`notification is-danger is-light has-text-weight-normal ${errorMessage ? '' : 'hidden'}`}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage('')}
        />
        {errorMessage}
      </div>
    </div>
  );
};
