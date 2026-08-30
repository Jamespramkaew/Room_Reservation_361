import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { ROOM_TYPES, EQUIPMENT_OPTIONS } from '../data/rooms'

interface SearchFilterProps {
  query: string
  onQueryChange: (value: string) => void
  type: string
  onTypeChange: (value: string) => void
  equipment: string
  onEquipmentChange: (value: string) => void
}

export default function SearchFilter({
  query,
  onQueryChange,
  type,
  onTypeChange,
  equipment,
  onEquipmentChange,
}: SearchFilterProps) {
  const [openType, setOpenType] = useState(false)
  const [openEquip, setOpenEquip] = useState(false)
  const typeRef = useRef<HTMLDivElement>(null)
  const equipRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) setOpenType(false)
      if (equipRef.current && !equipRef.current.contains(e.target as Node)) setOpenEquip(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const typeOptions = [{ label: 'ทั้งหมด', value: '' }, ...ROOM_TYPES.map((t) => ({ label: t, value: t }))]
  const equipOptions = [{ label: 'ทั้งหมด', value: '' }, ...EQUIPMENT_OPTIONS.map((e) => ({ label: e, value: e }))]

  return (
    <section className="search-filter" style={styles.panel}>
      <style>{keyframes}</style>
      <h2 style={styles.heading}>Searching and Filter</h2>
      <div className="search-filter-row" style={styles.row}>
        {/* Search box */}
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

        {/* ชนิดห้อง dropdown */}
        <div ref={typeRef} className="search-filter-dropdown" style={styles.dropdownWrap}>
          <button onClick={() => { setOpenType((v) => !v); setOpenEquip(false) }} style={styles.selectBtn}>
            <span style={styles.selectLabel}>{type || 'ชนิดห้องเรียน'}</span>
            <Chevron />
          </button>
          {openType && (
            <div style={styles.menu}>
              {typeOptions.map((o) => (
                <button
                  key={o.label}
                  onClick={() => { onTypeChange(o.value); setOpenType(false) }}
                  style={{
                    ...styles.menuItem,
                    ...(type === o.value ? styles.menuItemActive : {}),
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* อุปกรณ์ dropdown */}
        <div ref={equipRef} style={styles.dropdownWrap}>
          <button onClick={() => { setOpenEquip((v) => !v); setOpenType(false) }} style={styles.selectBtn}>
            <span style={styles.selectLabel}>{equipment || 'อุปกรณ์'}</span>
            <Chevron />
          </button>
          {openEquip && (
            <div style={styles.menu}>
              {equipOptions.map((o) => (
                <button
                  key={o.label}
                  onClick={() => { onEquipmentChange(o.value); setOpenEquip(false) }}
                  style={{
                    ...styles.menuItem,
                    ...(equipment === o.value ? styles.menuItemActive : {}),
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active filter chips */}
        {(type || equipment) && (
          <button
            style={styles.clearBtn}
            onClick={() => { onTypeChange(''); onEquipmentChange('') }}
          >
            ล้าง filter
          </button>
        )}
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
  row: { display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 44, flexWrap: 'wrap' },
  searchBox: {
    flex: 1,
    minWidth: 200,
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
  menuItemActive: {
    background: '#F59E0B22',
    color: '#92400e',
    fontWeight: 600,
  },
  clearBtn: {
    height: 44,
    padding: '0 16px',
    background: 'transparent',
    border: '1px dashed #d0d0d0',
    borderRadius: 10,
    fontFamily: 'inherit',
    fontSize: 14,
    color: '#888',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
}
