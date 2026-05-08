import { useMemo, useState } from 'react'
import heroAsset from './assets/hero.png'
import './App.css'

const API_URL = 'https://sudhansh26-rag-project.hf.space/ask'

const ROLES = [
  {
    value: 'finance',
    label: 'Finance',
    tone: 'Policy, invoices, budgets',
    accent: 'emerald'
  },
  {
    value: 'stock_market',
    label: 'Market Insights',
    tone: 'Stocks, trends, equity research',
    accent: 'violet'
  },
  {
    value: 'hr',
    label: 'HR',
    tone: 'Benefits, people ops, hiring',
    accent: 'rose'
  },
  {
    value: 'engineering',
    label: 'Engineering',
    tone: 'Architecture, incidents, docs',
    accent: 'blue'
  }
]

const EXAMPLES = [
  'What market insights are available in my documents?',
  'Summarize the latest policy changes for my team.',
  'Which documents mention deployment requirements?'
]

function App() {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('engineering')
  const [answer, setAnswer] = useState('')
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const activeRole = useMemo(() => ROLES.find((item) => item.value === role), [role])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!query.trim()) {
      setError('Please type a question first.')
      return
    }

    setLoading(true)
    setError('')
    setAnswer('')
    setDocs([])

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, role })
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setAnswer(data.answer || 'No answer returned from the backend.')
        setDocs(Array.isArray(data.retrieved_docs) ? data.retrieved_docs : [])
      }
    } catch (err) {
      setError(err.message || 'Unable to reach backend.')
    } finally {
      setLoading(false)
    }
  }

  const handleExample = (example) => {
    if (!loading) {
      setQuery(example)
      setError('')
    }
  }

  return (
    <div className={`app-shell theme-${activeRole.accent}`}>
      <header className="hero">
        <nav className="nav">
          <div className="brand">
            <span className="brand-mark">R</span>
            <span>RAG Command</span>
          </div>
          <div className="status-pill">
            <span className="status-dot" />
            Backend online
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Enterprise RAG Assistant</p>
            <h1>Ask your deployed knowledge base with role-aware precision.</h1>
            <p className="subtitle">
              Query your Hugging Face RAG backend, inspect retrieved sources, and switch business
              context without leaving a focused workspace.
            </p>
            <div className="hero-actions" aria-label="App highlights">
              <span>Secure role context</span>
              <span>Source visibility</span>
              <span>Live retrieval</span>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <img src={heroAsset} alt="" />
            <div className="metric-strip">
              <div>
                <strong>{ROLES.length}</strong>
                <span>roles</span>
              </div>
              <div>
                <strong>{docs.length}</strong>
                <span>sources</span>
              </div>
              <div>
                <strong>{loading ? '...' : answer ? '1' : '0'}</strong>
                <span>answers</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="workspace">
        <section className="query-panel" aria-labelledby="question-title">
          <div className="section-heading">
            <div>
              <p className="kicker">Prompt console</p>
              <h2 id="question-title">Compose your question</h2>
            </div>
            <span className="live-badge">{activeRole.label}</span>
          </div>

          <form onSubmit={handleSubmit} className="query-form">
            <label className="field-label" htmlFor="query">
              Question
            </label>
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about market research notes, internal policies, engineering docs, or financial plans..."
              rows={7}
              disabled={loading}
            />

            <div className="role-block">
              <div className="field-label">Role context</div>
              <div className="role-grid" role="radiogroup" aria-label="Role context">
                {ROLES.map((option) => (
                  <button
                    className={`role-option ${role === option.value ? 'active' : ''}`}
                    type="button"
                    key={option.value}
                    onClick={() => setRole(option.value)}
                    disabled={loading}
                    role="radio"
                    aria-checked={role === option.value}
                  >
                    <span>{option.label}</span>
                    <small>{option.tone}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="example-row" aria-label="Example questions">
              {EXAMPLES.map((example) => (
                <button key={example} type="button" onClick={() => handleExample(example)}>
                  {example}
                </button>
              ))}
            </div>

            {error && <div className="alert">{error}</div>}

            <button type="submit" className="submit-button" disabled={loading}>
              <span>{loading ? 'Searching knowledge base' : 'Send question'}</span>
              <span className="button-icon" aria-hidden="true">
                {loading ? '...' : '->'}
              </span>
            </button>
          </form>
        </section>

        <section className="answer-panel" aria-labelledby="answer-title">
          <div className="section-heading">
            <div>
              <p className="kicker">Generated response</p>
              <h2 id="answer-title">Answer preview</h2>
            </div>
            <span className="live-badge">HF Space</span>
          </div>

          <div className="answer-box">
            {loading ? (
              <div className="loading-state">
                <span />
                <p>Retrieving the most relevant passages...</p>
              </div>
            ) : answer ? (
              <p>{answer}</p>
            ) : (
              <div className="empty-state">
                <strong>Ready when you are.</strong>
                <span>Submit a question and your answer will appear here with sources below.</span>
              </div>
            )}
          </div>

          <div className="sources-header">
            <h3>Retrieved documents</h3>
            <span>{docs.length} found</span>
          </div>

          {docs.length > 0 ? (
            <ul className="source-list">
              {docs.map((doc, index) => (
                <li key={`${doc}-${index}`}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <p>{doc}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="source-empty">Sources will populate after a successful retrieval.</div>
          )}
        </section>
      </main>

      <footer className="footer">
        <span>Deployed backend</span>
        <a href="https://sudhansh26-rag-project.hf.space" target="_blank" rel="noreferrer">
          sudhansh26-rag-project.hf.space
        </a>
      </footer>
    </div>
  )
}

export default App
