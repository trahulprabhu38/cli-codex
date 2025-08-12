/*
CheatSheet Flashcards — Single-file runnable React prototype

This file is a self-contained React component you can copy into `src/App.jsx` in a Vite/CRA project.

Fix applied: removed duplicate default export that caused the "Multiple exports with the same name \"default\"" build error. The app now has exactly one `export default`.
*/

import React, { useEffect, useMemo, useRef, useState } from 'react'
import cheatsData from './data/cheats.json'

// Theme tokens (peacock / indigo rich dark palette)
const THEME = {
  bg: '#071226', // page bg
  card: '#0e1e30ff',
  terminal: '#041423',
  accent: '#00B9D1',
  muted: '#9FB3C8',
  text: '#E6F0FF',
  terminalText: '#B6F0C6'
}

// small utility: safe clipboard write
async function writeClipboard(text) {
  if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (e) {
      // fall through to fallback
    }
  }
  // fallback using execCommand (older browsers)
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.left = '-9999px'
  document.body.appendChild(ta)
  ta.select()
  try {
    document.execCommand('copy')
    document.body.removeChild(ta)
    return true
  } catch (e) {
    document.body.removeChild(ta)
    return false
  }
}

function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <circle cx="24" cy="24" r="22" fill={THEME.bg} />
      <path d="M24 12c6 6 6 12 0 18-6-6-6-12 0-18z" fill={THEME.accent} opacity="0.95" />
      <circle cx="24" cy="18" r="3" fill={THEME.bg} />
    </svg>
  )
}

function Header({ query, setQuery, inputRef }) {
  return (
    <header style={{ width: '100%', position: 'relative', background: 'linear-gradient(90deg, #0b1a2a 60%, #1a2e4a 100%)', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)', borderBottom: '2px solid #00B9D1', padding: 0, marginBottom: 18, zIndex: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, position: 'relative', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Logo size={38} />
          <span style={{ color: THEME.text, fontSize: 28, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1, fontFamily: 'Inter, system-ui, -apple-system, Roboto, Arial' }}>CLI Codex</span>
        </div>
        <a href="https://github.com/rahulprabhu38/cheatsheet-flashcards" target="_blank" rel="noopener noreferrer" style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
          <img src="/public/download.png" alt="GitHub" style={{ height: 38, width: 38, display: 'block', borderRadius: '50%' }} />
        </a>
      </div>
    </header>
  );
}

function TagBar({ tags, activeTags, toggleTag }) {
  return (
    <div style={{ padding: '10px 28px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {tags.map((t) => {
        const active = activeTags.has(t)
        return (
          <button
            key={t}
            onClick={() => toggleTag(t)}
            style={{
              padding: '6px 10px',
              borderRadius: 999,
              border: active ? 'none' : '1px solid rgba(255,255,255,0.04)',
              background: active ? THEME.accent : 'transparent',
              color: active ? '#04202a' : THEME.muted,
              cursor: 'pointer'
            }}
          >
            {t}
          </button>
        )
      })}
    </div>
  )
}

function Card({ card, onOpen }) {
  return (
    <div
      onClick={() => onOpen(card)}
      style={{
        background: THEME.card,
        borderRadius: 12,
        padding: 18,
        boxShadow: '0 1px 0 rgba(0,0,0,0.5)',
        cursor: 'pointer',
        transition: 'transform .12s ease, box-shadow .12s ease'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.6)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 0 rgba(0,0,0,0.5)' }}
    >
      <div style={{ fontSize: 16, fontWeight: 600, color: THEME.text }}>{card.title}</div>
      <div style={{ color: THEME.muted, fontSize: 13, marginTop: 6, minHeight: 36 }}>{card.description}</div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {card.tags.map((t) => (
          <span key={t} style={{ fontSize: 12, padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', color: THEME.muted }}>{t}</span>
        ))}
      </div>
    </div>
  )
}

function CardsGrid({ cards, onOpen }) {
  return (
    <div style={{ padding: '18px 28px 60px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {cards.map((c) => (
          <Card key={c.id} card={c} onOpen={onOpen} />
        ))}
      </div>
    </div>
  )
}

function TerminalView({ commands, onCopy }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {commands.map((cmd) => (
        <div key={cmd.id} style={{ padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.03)', background: 'transparent' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace', fontSize: 13, color: THEME.terminalText }}>{cmd.code}</pre>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <button
                onClick={async () => { const ok = await writeClipboard(cmd.code); onCopy && onCopy(ok ? 'Copied' : 'Copy failed') }}
                style={{ padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', color: THEME.text, border: 'none', cursor: 'pointer' }}
              >
                Copy
              </button>
            </div>
          </div>
          {cmd.notes && <div style={{ color: THEME.muted, marginTop: 8, fontSize: 12 }}>{cmd.notes}</div>}
        </div>
      ))}
    </div>
  )
}

function Modal({ card, onClose, onCopyAll, onCopySingle }) {
  if (!card) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', padding: 20, zIndex: 9999 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
  <div style={{ width: 'min(1000px,96%)', maxHeight: '80vh', overflowY: 'auto', background: THEME.card, borderRadius: 14, padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{card.title}</div>
            <div style={{ color: THEME.muted, marginTop: 6 }}>{card.description}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={async () => { const ok = await writeClipboard(card.commands.map((c) => c.code).join('\n\n')); onCopyAll && onCopyAll(ok ? 'Copied all commands' : 'Copy failed') }}
              style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', color: THEME.text, border: 'none', cursor: 'pointer' }}
            >
              Copy All
            </button>
            <button onClick={onClose} style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', color: THEME.muted, border: 'none', cursor: 'pointer' }}>Close</button>
          </div>
        </div>

        <div style={{ marginTop: 12, background: THEME.terminal, padding: 12, borderRadius: 10 }}>
          <TerminalView commands={card.commands} onCopy={onCopySingle} />
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {card.tags.map((t) => <div key={t} style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.03)', color: THEME.muted, fontSize: 12 }}>{t}</div>)}
        </div>
      </div>
    </div>
  )
}

function Toast({ message }) {
  if (!message) return null
  return (
    <div style={{ position: 'fixed', right: 20, bottom: 20, background: 'rgba(2,12,23,0.9)', color: THEME.text, padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>{message}</div>
  )
}

// Main App
export default function CheatsheetApp() {
  const [query, setQuery] = useState('')
  const [activeTags, setActiveTags] = useState(new Set())
  const [openCard, setOpenCard] = useState(null)
  const [toast, setToast] = useState(null)
  const searchRef = useRef(null)
  const CHEATS = cheatsData

  // focus search on Ctrl/Cmd+K
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current && searchRef.current.focus()
      }
      if (e.key === 'Escape' && openCard) {
        setOpenCard(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openCard])

  // toast helper
  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 1600)
  }

  // tags list
  const allTags = useMemo(() => {
    const s = new Set()
    CHEATS.forEach((c) => c.tags.forEach((t) => s.add(t)))
    return Array.from(s)
  }, [])

  function toggleTag(t) {
    const s = new Set(activeTags)
    if (s.has(t)) s.delete(t)
    else s.add(t)
    setActiveTags(s)
  }

  function matches(card) {
    const q = query.trim().toLowerCase()
    if (q) {
      if (card.title.toLowerCase().includes(q)) return true
      if (card.description && card.description.toLowerCase().includes(q)) return true
      if (card.tags.join(' ').toLowerCase().includes(q)) return true
      for (const cmd of card.commands) {
        if (cmd.code.toLowerCase().includes(q)) return true
        if (cmd.notes && cmd.notes.toLowerCase().includes(q)) return true
      }
      return false
    }
    return true
  }

  const visible = useMemo(() => CHEATS.filter((c) => matches(c) && (activeTags.size === 0 || c.tags.some((t) => activeTags.has(t)))), [query, activeTags])

  return (
    <div style={{ minHeight: '100vh', background: THEME.bg, color: THEME.text, fontFamily: 'Inter, system-ui, -apple-system, Roboto, Arial', display: 'flex', flexDirection: 'column' }}>
      <Header query={query} setQuery={setQuery} inputRef={searchRef} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
        <input
          aria-label="Search cheat sheets"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') e.currentTarget.blur() }}
          placeholder="Search commands, tags, descriptions..."
          style={{
            background: 'none',
            border: '1px solid #00B9D1',
            color: THEME.text,
            padding: '8px 12px',
            borderRadius: 8,
            width: 320,
            fontSize: 15,
            fontWeight: 400,
            outline: 'none',
            boxShadow: '0 1px 8px 0 rgba(0,185,209,0.08)'
          }}
          ref={searchRef}
        />
      </div>
      <TagBar tags={allTags} activeTags={activeTags} toggleTag={toggleTag} />
      <CardsGrid cards={visible} onOpen={(c) => setOpenCard(c)} />

      {openCard && (
        <Modal
          card={openCard}
          onClose={() => setOpenCard(null)}
          onCopyAll={(msg) => showToast(msg)}
          onCopySingle={(msg) => showToast(msg)}
        />
      )}

      <Toast message={toast} />

      <footer style={{ marginTop: 'auto', padding: '22px 0 16px 0', textAlign: 'center', color: THEME.muted, fontSize: 16, fontWeight: 600, letterSpacing: '0.2px' }}>
        ©trahulprabhu38
      </footer>
    </div>
  )
}
