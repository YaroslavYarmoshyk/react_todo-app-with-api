import { Todo } from '../../types/Todo';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

type Props = {
  todo: Todo;
  isSubmitting?: boolean;
  onUpdate: (todo: Todo) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export const TodoItem: React.FC<Props> = ({
  todo,
  isSubmitting = false,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const cancelEditing = () => {
    setIsEditing(false);
    setTempTitle(todo.title);
  };

  const handleSubmit = () => {
    const trimmed = tempTitle.trim();

    if (!trimmed) {
      onDelete(todo.id).then(() => cancelEditing());

      return;
    }

    if (trimmed === todo.title) {
      cancelEditing();

      return;
    }

    onUpdate({ ...todo, title: trimmed })
      .then(() => setIsEditing(false))
      .catch(() => setIsEditing(true));
  };

  const handleBlur = () => {
    if (isEditing) {
      handleSubmit();
    }
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      cancelEditing();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempTitle(event.target.value);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSubmit();
  };

  return (
    <section key={todo.id} className="todoapp__main" data-cy="TodoList">
      <div
        data-cy="Todo"
        className={classNames('todo', { completed: todo.completed })}
      >
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label
          className="todo__status-label"
          htmlFor={`todo-status-${todo.id}`}
        >
          <input
            id={`todo-status-${todo.id}`}
            data-cy="TodoStatus"
            type="checkbox"
            className="todo__status"
            checked={todo.completed}
            onChange={e => onUpdate({ ...todo, completed: e.target.checked })}
          />
        </label>

        {isEditing ? (
          <form onSubmit={handleFormSubmit} className="todo__title-form">
            <input
              data-cy="TodoTitleField"
              type="text"
              className="todo__title-field"
              ref={inputRef}
              value={tempTitle}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyUp={handleKeyUp}
            />
          </form>
        ) : (
          <>
            <span
              data-cy="TodoTitle"
              className="todo__title"
              onDoubleClick={() => setIsEditing(true)}
            >
              {todo.title}
            </span>

            <button
              type="button"
              className="todo__remove"
              data-cy="TodoDelete"
              onClick={() => onDelete(todo.id)}
            >
              ×
            </button>
          </>
        )}

        <div
          data-cy="TodoLoader"
          className={classNames('modal overlay', {
            'is-active': isSubmitting,
          })}
        >
          <div className="modal-background has-background-white-ter" />
          <div className="loader" />
        </div>
      </div>
    </section>
  );
};
