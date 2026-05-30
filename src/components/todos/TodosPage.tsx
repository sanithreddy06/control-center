"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, CheckSquare } from "lucide-react";
import { Todo, TodoPriority } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner, EmptyState } from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const priorityColors: Record<TodoPriority, "default" | "warning" | "danger"> = {
  low: "default",
  medium: "warning",
  high: "danger",
};

export function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("active");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTodo, setEditTodo] = useState<Todo | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("medium");

  const fetchTodos = useCallback(async () => {
    const params = new URLSearchParams({ filter });
    if (search) params.set("search", search);
    const res = await fetch(`/api/todos?${params}`);
    if (res.ok) setTodos(await res.json());
    setLoading(false);
  }, [search, filter]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const openCreate = () => {
    setEditTodo(null);
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");
    setModalOpen(true);
  };

  const openEdit = (todo: Todo) => {
    setEditTodo(todo);
    setTitle(todo.title);
    setDescription(todo.description);
    setDueDate(todo.due_date || "");
    setPriority(todo.priority);
    setModalOpen(true);
  };

  const saveTodo = async () => {
    const body = { title, description, due_date: dueDate || null, priority };
    if (editTodo) {
      await fetch(`/api/todos/${editTodo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    setModalOpen(false);
    fetchTodos();
  };

  const toggleComplete = async (todo: Todo) => {
    await fetch(`/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_completed: !todo.is_completed }),
    });
    fetchTodos();
  };

  const deleteTodo = async (id: string) => {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    setModalOpen(false);
    fetchTodos();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Todos</h1>
          <p className="text-sm text-neutral-500">Manage your tasks</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Task</Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={setSearch} placeholder="Search tasks..." className="flex-1" />
        <div className="flex rounded-xl border border-neutral-200 p-1 dark:border-neutral-700">
          {["active", "completed", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm capitalize transition-colors",
                filter === f ? "bg-neutral-100 dark:bg-neutral-800" : "text-neutral-500"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {todos.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No tasks" description="Add a task to get started" action={<Button onClick={openCreate}>Add Task</Button>} />
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => (
            <Card key={todo.id} className="flex items-start gap-3 py-3">
              <button
                onClick={() => toggleComplete(todo)}
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                  todo.is_completed
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-neutral-300 dark:border-neutral-600"
                )}
              >
                {todo.is_completed && <CheckSquare className="h-3 w-3" />}
              </button>
              <div className="flex-1 cursor-pointer" onClick={() => openEdit(todo)}>
                <div className="flex items-center gap-2">
                  <span className={cn("font-medium", todo.is_completed && "line-through text-neutral-400")}>
                    {todo.title}
                  </span>
                  <Badge variant={priorityColors[todo.priority]}>{todo.priority}</Badge>
                </div>
                {todo.description && (
                  <p className="mt-0.5 text-sm text-neutral-500">{todo.description}</p>
                )}
                {todo.due_date && (
                  <p className="mt-1 text-xs text-neutral-400">
                    Due {format(new Date(todo.due_date), "MMM d, yyyy")}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTodo ? "Edit Task" : "New Task"}>
        <div className="space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TodoPriority)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex gap-2">
            {editTodo && (
              <Button variant="danger" onClick={() => deleteTodo(editTodo.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={saveTodo} disabled={!title.trim()} className="flex-1">Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
