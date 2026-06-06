/**
 * Todo primitives. `TodoList` renders clickable status rows; `TodoListCard`
 * wraps them in a bordered, collapsible surface with an "N of M Done" summary.
 */
import { type CSSProperties, useState } from 'react';
import { useHostTheme } from './use-tokens';
import { toneHex } from './theme';

export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface TodoItem {
  readonly id: string;
  readonly content: string;
  readonly status: TodoStatus;
}

function StatusIcon({ status }: { status: TodoStatus }) {
  const theme = useHostTheme();
  const stroke =
    status === 'completed'
      ? toneHex.success
      : status === 'in_progress'
        ? theme.accent.primary
        : status === 'cancelled'
          ? toneHex.danger
          : theme.text.tertiary;
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      style={{ flex: '0 0 auto', marginTop: 3 }}
      aria-hidden
    >
      <circle cx={7} cy={7} r={6} stroke={stroke} strokeWidth={1.4} />
      {status === 'completed' && (
        <path
          d="M4 7.2l2 2 4-4.4"
          stroke={stroke}
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {status === 'in_progress' && <circle cx={7} cy={7} r={3} fill={stroke} />}
      {status === 'cancelled' && (
        <path
          d="M4.8 4.8l4.4 4.4M9.2 4.8l-4.4 4.4"
          stroke={stroke}
          strokeWidth={1.4}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export type TodoListProps = {
  todos: readonly TodoItem[];
  dimmedTodoIds?: ReadonlySet<string>;
  onTodoClick?: (todo: TodoItem) => void;
  style?: CSSProperties;
};

export function TodoList({
  todos,
  dimmedTodoIds,
  onTodoClick,
  style,
}: TodoListProps) {
  const theme = useHostTheme();
  if (todos.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', ...style }}>
      {todos.map((todo) => {
        const dimmed = dimmedTodoIds?.has(todo.id);
        return (
          <button
            key={todo.id}
            type="button"
            onClick={() => onTodoClick?.(todo)}
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
              width: '100%',
              textAlign: 'left',
              padding: '4px 6px',
              background: 'transparent',
              border: 'none',
              cursor: onTodoClick ? 'pointer' : 'default',
              color: theme.text.primary,
              fontSize: 14,
              lineHeight: '20px',
              opacity: dimmed ? 0.45 : 1,
            }}
          >
            <StatusIcon status={todo.status} />
            <span
              style={{
                textDecoration:
                  todo.status === 'cancelled' ? 'line-through' : undefined,
                color:
                  todo.status === 'cancelled' ? theme.text.tertiary : undefined,
              }}
            >
              {todo.content}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export type TodoListCardProps = {
  todos: readonly TodoItem[];
  dimmedTodoIds?: ReadonlySet<string>;
  defaultExpanded?: boolean;
  onTodoClick?: (todo: TodoItem) => void;
  style?: CSSProperties;
};

export function TodoListCard({
  todos,
  dimmedTodoIds,
  defaultExpanded = false,
  onTodoClick,
  style,
}: TodoListCardProps) {
  const theme = useHostTheme();
  const [open, setOpen] = useState(defaultExpanded);
  if (todos.length === 0) return null;
  const done = todos.filter((t) => t.status === 'completed').length;
  return (
    <div
      style={{
        border: `1px solid ${theme.stroke.primary}`,
        borderRadius: 6,
        overflow: 'hidden',
        ...style,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '6px 10px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: theme.text.secondary,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        <svg
          width={12}
          height={12}
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform 120ms',
          }}
          aria-hidden
        >
          <path
            d="M4 2.5L8 6l-4 3.5"
            stroke="currentColor"
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Todos</span>
        <span style={{ flex: 1 }} />
        <span>
          {done} of {todos.length} Done
        </span>
      </button>
      {open && (
        <div style={{ padding: 6 }}>
          <TodoList
            todos={todos}
            dimmedTodoIds={dimmedTodoIds}
            onTodoClick={onTodoClick}
          />
        </div>
      )}
    </div>
  );
}
