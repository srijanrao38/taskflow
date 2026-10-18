
import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = '/api/tasks/'

function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function fetchTasks() {
    try {
      const response = await axios.get(API_URL)
      setTasks(response.data)
      setError('')
    } catch (err) {
      console.error(err)
      setError('Unable to load tasks. Make sure Django is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    const data = {
      title: title.trim(),
      description: description.trim(),
      priority,
      status: 'pending',
    }

    if (dueDate) {
      data.due_date = dueDate
    }

    try {
      const response = await axios.post(API_URL, data)
      setTasks((previous) => [...previous, response.data])
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDueDate('')
      setFilter('all')
      setSearch('')
      setMessage('Task created successfully!')
    } catch (err) {
      console.error(err.response?.data ?? err.message)
      setMessage('Could not create task. Please check your inputs.')
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(task) {
    const nextStatus =
      task.status === 'completed' ? 'pending' : 'completed'

    try {
      const response = await axios.patch(
        `${API_URL}${task.id}/`,
        { status: nextStatus }
      )

      setTasks((previous) =>
        previous.map((item) =>
          item.id === task.id ? response.data : item
        )
      )
    } catch (err) {
      console.error(err.response?.data ?? err.message)
      setMessage('Could not update task status.')
    }
  }

  async function handleDelete(taskId) {
    if (!window.confirm('Delete this task permanently?')) return

    try {
      await axios.delete(`${API_URL}${taskId}/`)
      setTasks((previous) =>
        previous.filter((task) => task.id !== taskId)
      )
    } catch (err) {
      console.error(err.response?.data ?? err.message)
      setMessage('Could not delete task.')
    }
  }

  const completed = tasks.filter(
    (task) => task.status === 'completed'
  ).length

  const pending = tasks.filter(
    (task) => task.status !== 'completed'
  ).length

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        `${task.title} ${task.description ?? ''}`
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesFilter =
        filter === 'all' ||
        (filter === 'pending' && task.status !== 'completed') ||
        (filter === 'completed' && task.status === 'completed')

      return matchesSearch && matchesFilter
    })
  }, [tasks, filter, search])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#">
          <span className="brand-mark">T</span>
          <span>TaskFlow<span className="brand-dot">.</span></span>
        </a>

        <p className="nav-label">WORKSPACE</p>

        <button
          className={`nav-item ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <span>▦</span> Overview
        </button>

        <button
          className={`nav-item ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          <span>◷</span> My tasks
          <span className="nav-count">{pending}</span>
        </button>

        <button
          className={`nav-item ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          <span>✓</span> Completed
        </button>

        <div className="sidebar-bottom">
          <div className="tip-card">
            <span className="tip-icon">✦</span>
            <strong>Stay focused</strong>
            <p>Small steps every day lead to big results.</p>
          </div>
          <div className="profile">
            <div className="avatar">U</div>
            <div>
              <strong>My Workspace</strong>
              <p>Personal account</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span className="breadcrumb">Workspace / <strong>Overview</strong></span>
          <span className="today-label">
            <span className="online-dot" /> Your productivity space
          </span>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
            <h1>Make today count<span>.</span></h1>
            <p className="welcome-subtitle">
              Organize your work, stay focused, and get things done.
            </p>
          </div>
          <div className="date-card">
            <span className="date-icon">▦</span>
            <div>
              <strong>{new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}</strong>
              <p>One task at a time.</p>
            </div>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span>Total tasks</span>
              <span className="stat-icon purple">▤</span>
            </div>
            <strong className="stat-number">{tasks.length}</strong>
            <p>Across your workspace</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>To do</span>
              <span className="stat-icon orange">◷</span>
            </div>
            <strong className="stat-number">{pending}</strong>
            <p>Ready for your attention</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Completed</span>
              <span className="stat-icon green">✓</span>
            </div>
            <strong className="stat-number">{completed}</strong>
            <p>Tasks finished so far</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Progress</span>
              <span className="stat-icon blue">↗</span>
            </div>
            <strong className="stat-number">
              {tasks.length
                ? Math.round((completed / tasks.length) * 100)
                : 0}%
            </strong>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${tasks.length
                    ? (completed / tasks.length) * 100
                    : 0}%`,
                }}
              />
            </div>
          </div>
        </section>

        <div className="workspace-grid">
          <section className="panel task-panel">
            <div className="panel-heading">
              <div>
                <h2>Your tasks</h2>
                <p>Everything you need to get done.</p>
              </div>
              <span className="task-total">{visibleTasks.length} tasks</span>
            </div>

            <div className="task-toolbar">
              <div className="search-box">
                <span>⌕</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tasks..."
                  aria-label="Search tasks"
                />
              </div>
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                aria-label="Filter tasks"
              >
                <option value="all">All tasks</option>
                <option value="pending">To do</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="empty-icon">◌</div>
                <h3>Loading your tasks...</h3>
              </div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : visibleTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✓</div>
                <h3>{search ? 'No matching tasks' : 'All clear!'}</h3>
                <p>
                  {search
                    ? 'Try a different search term.'
                    : 'Create a task to get your workspace started.'}
                </p>
              </div>
            ) : (
              <div className="task-list">
                {visibleTasks.map((task) => (
                  <article
                    className={`task-card ${
                      task.status === 'completed' ? 'is-completed' : ''
                    }`}
                    key={task.id}
                  >
                    <button
                      className={`complete-check ${
                        task.status === 'completed' ? 'checked' : ''
                      }`}
                      onClick={() => handleStatusChange(task)}
                      aria-label={
                        task.status === 'completed'
                          ? 'Mark task pending'
                          : 'Mark task completed'
                      }
                      title="Toggle completion"
                    >
                      {task.status === 'completed' ? '✓' : ''}
                    </button>

                    <div className="task-info">
                      <h3>{task.title}</h3>
                      {task.description && <p>{task.description}</p>}
                      <div className="task-meta">
                        <span className={`priority-badge ${task.priority}`}>
                          <span className="priority-dot" />
                          {task.priority}
                        </span>
                        {task.due_date && (
                          <span className="due-date">
                            ▦ {task.due_date}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="task-actions">
                      <span
                        className={`status-badge ${
                          task.status === 'completed' ? 'done' : 'todo'
                        }`}
                      >
                        {task.status === 'completed'
                          ? 'Completed'
                          : task.status === 'in_progress'
                            ? 'In progress'
                            : 'To do'}
                      </span>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(task.id)}
                        aria-label={`Delete ${task.title}`}
                        title="Delete task"
                      >
                        ×
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="panel create-panel">
            <div className="create-heading">
              <span className="create-icon">＋</span>
              <div>
                <h2>Create a task</h2>
                <p>Make a plan and make it happen.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="task-form">
              <label htmlFor="title">Task title <span>*</span></label>
              <input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Complete assignment"
                maxLength={200}
                required
              />

              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add some details..."
                rows={4}
              />

              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>

              <label htmlFor="dueDate">Due date <span className="optional">(optional)</span></label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />

              {message && (
                <p className="form-message" role="status">{message}</p>
              )}

              <button className="submit-button" type="submit" disabled={saving}>
                {saving ? 'Creating...' : '＋  Create task'}
              </button>
              <p className="form-footnote">✦ &nbsp; One step closer to your goals.</p>
            </form>
          </aside>
        </div>

        <footer className="footer">
          <span>TaskFlow <span className="brand-dot">.</span></span>
          <span>Built for better focus.</span>
        </footer>
      </main>
    </div>
  )
}

export default App
