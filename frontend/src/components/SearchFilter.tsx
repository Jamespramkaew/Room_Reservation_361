import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { ROOM_TYPES } from '../data/rooms'

interface SearchFilterProps {
  query: string
  onQueryChange: (value: string) => void
  type: string
  onTypeChange: (value: string) => void
}

export default function SearchFilter({
  query,
  onQueryChange,
  type,
  onTypeChange,
}: SearchFilterProps) {
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [open])

  const options = [{ label: 'ทั้งหมด', value: '' }, ...ROOM_TYPES.map((t) => ({ label: t, value: t }))]

  return (
    <section className="search-filter" style={styles.panel}>
      <style>{keyframes}</style>
      <h2 style={styles.heading}>Searching and Filter</h2>
      <div className="search-filter-row" style={styles.row}>
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="ค้นหาชื่อห้องเรียน"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            style={styles.input}
          />
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ flex: 'none' }}
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
        </div>

        <div ref={boxRef} className="search-filter-dropdown" style={styles.dropdownWrap}>
          <button onClick={() => setOpen((v) => !v)} style={styles.selectBtn}>
            <span style={styles.selectLabel}>{type || 'ชนิดห้องเรียน'}</span>
            <Chevron />
          </button>
          {open && (
            <div style={styles.menu}>
              {options.map((o) => (
                <button
                  key={o.label}
                  onClick={() => {
                    onTypeChange(o.value)
                    setOpen(false)
                  }}
                  style={styles.menuItem}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button style={{ ...styles.selectBtn, width: 200, flex: 'none' }}>
          <span>อุปกรณ์</span>
          <Chevron />
        </button>
      </div>
    </section>
  )
}

function Chevron() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6b6b6b"
      strokeWidth="2"
      strokeLinecap="round"
      style={{ flex: 'none' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

const keyframes = `@keyframes dropdown-in{from{opacity:0;transform:translateY(-6px) scaleY(.9)}to{opacity:1;transform:translateY(0) scaleY(1)}}`

const styles: Record<string, CSSProperties> = {
  panel: {
    maxWidth: 1240,
    margin: '0 auto',
    background: '#F7F7F7',
    border: '1px solid #E5E5E5',
    borderRadius: 14,
    padding: '20px 24px 24px',
  },
  heading: { margin: '0 0 18px', fontSize: 17, fontWeight: 700, color: '#1a1a1a' },
  row: { display: 'flex', alignItems: 'center', gap: 20, paddingLeft: 44 },
  searchBox: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    background: '#ffffff',
    border: '1px solid #E0E0E0',
    borderRadius: 10,
    height: 44,
    padding: '0 16px',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: 'inherit',
    fontSize: 15,
    color: '#1a1a1a',
    minWidth: 0,
  },
  dropdownWrap: { position: 'relative', flex: 'none', width: 200 },
  selectBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
    width: '100%',
    height: 44,
    padding: '0 16px',
    background: '#ffffff',
    border: '1px solid #E0E0E0',
    borderRadius: 10,
    fontFamily: 'inherit',
    fontSize: 15,
    color: '#4a4a4a',
    cursor: 'pointer',
    textAlign: 'left',
  },
  selectLabel: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  menu: {
    boxSizing: 'border-box',
    position: 'absolute',
    top: 43,
    left: 0,
    width: '100%',
    background: '#ffffff',
    border: '1px solid #E0E0E0',
    borderTopColor: '#EDEDED',
    borderRadius: '0 0 10px 10px',
    boxShadow: '0 10px 24px rgba(0,0,0,0.14)',
    padding: 6,
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    transformOrigin: 'top center',
    animation: 'dropdown-in 180ms cubic-bezier(0.22,0.61,0.36,1) both',
  },
  menuItem: {
    display: 'block',
    width: '100%',
    padding: '10px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: 7,
    fontFamily: 'inherit',
    fontSize: 15,
    color: '#1a1a1a',
    textAlign: 'left',
    cursor: 'pointer',
  },
}
