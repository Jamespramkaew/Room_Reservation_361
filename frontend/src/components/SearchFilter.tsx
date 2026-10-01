import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { ROOM_TYPES, EQUIPMENT_OPTIONS } from '../data/rooms'
import { addDays, bkkToday, dayNumber, formatMinutes, nowMinutes, shortDateLabel, weekdayLabel } from '../utils/bkkDate'
import type { TimeSlot } from '../utils/bkkDate'

// Booking rules: up to 7 days ahead, at most 2 hours, within opening hours
const BOOKABLE_DAYS = 7
const OPEN_MIN = 8 * 60
const CLOSE_MIN = 20 * 60
const STEP_MIN = 30
const MAX_DURATION_MIN = 120

interface SearchFilterProps {
  query: string
  onQueryChange: (value: string) => void
  type: string
  onTypeChange: (value: string) => void
  equipment: string
  onEquipmentChange: (value: string) => void
  slot: TimeSlot | null
  onSlotChange: (value: TimeSlot | null) => void
}

export default function SearchFilter({
  query,
  onQueryChange,
  type,
  onTypeChange,
  equipment,
  onEquipmentChange,
  slot,
  onSlotChange,
}: SearchFilterProps) {
  const [openType, setOpenType] = useState(false)
  const [openEquip, setOpenEquip] = useState(false)
  const [openSlot, setOpenSlot] = useState(false)
  const typeRef = useRef<HTMLDivElement>(null)
  const equipRef = useRef<HTMLDivElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) setOpenType(false)
      if (equipRef.current && !equipRef.current.contains(e.target as Node)) setOpenEquip(false)
      if (slotRef.current && !slotRef.current.contains(e.target as Node)) setOpenSlot(false)
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
          <button onClick={() => { setOpenType((v) => !v); setOpenEquip(false); setOpenSlot(false) }} style={styles.selectBtn}>
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
          <button onClick={() => { setOpenEquip((v) => !v); setOpenType(false); setOpenSlot(false) }} style={styles.selectBtn}>
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

        {/* วันและเวลาที่จะจอง dropdown */}
        <div ref={slotRef} className="search-filter-dropdown" style={styles.slotWrap}>
          <button
            onClick={() => { setOpenSlot((v) => !v); setOpenType(false); setOpenEquip(false) }}
            style={{ ...styles.selectBtn, ...(slot ? styles.selectBtnActive : {}) }}
          >
            <span style={styles.selectLabel}>
              {slot
                ? `${shortDateLabel(slot.date)} · ${formatMinutes(slot.startMin)}–${formatMinutes(slot.endMin)}`
                : 'วันและเวลาที่จะจอง'}
            </span>
            <Chevron />
          </button>
          {openSlot && (
            <SlotPicker
              initial={slot}
              onApply={(value) => { onSlotChange(value); setOpenSlot(false) }}
            />
          )}
        </div>

        {/* Active filter chips */}
        {(type || equipment || slot) && (
          <button
            style={styles.clearBtn}
            onClick={() => { onTypeChange(''); onEquipmentChange(''); onSlotChange(null) }}
          >
            ล้าง filter
          </button>
        )}
      </div>
    </section>
  )
}

/** Start times on `date`, skipping times that already passed today */
function startTimes(date: string, today: string): number[] {
  const earliest = date === today ? Math.ceil((nowMinutes() + 1) / STEP_MIN) * STEP_MIN : OPEN_MIN
  const times: number[] = []
  for (let m = Math.max(OPEN_MIN, earliest); m + STEP_MIN <= CLOSE_MIN; m += STEP_MIN) times.push(m)
  return times
}

interface SlotPickerProps {
  initial: TimeSlot | null
  onApply: (value: TimeSlot | null) => void
}

function SlotPicker({ initial, onApply }: SlotPickerProps) {
  const today = bkkToday()
  const dates = Array.from({ length: BOOKABLE_DAYS + 1 }, (_, i) => addDays(today, i)).filter(
    (d) => startTimes(d, today).length > 0,
  )
  const [date, setDate] = useState(initial?.date && dates.includes(initial.date) ? initial.date : dates[0])
  const starts = date ? startTimes(date, today) : []
  const [start, setStart] = useState(initial?.startMin ?? starts[0])
  const startMin = starts.includes(start) ? start : starts[0]
  // End times after the start, at most 2 hours later and not past closing
  const ends: number[] = []
  for (let m = startMin + STEP_MIN; m <= Math.min(startMin + MAX_DURATION_MIN, CLOSE_MIN); m += STEP_MIN) ends.push(m)
  const [end, setEnd] = useState(initial?.endMin)
  // Keep the picked end while it is still valid, otherwise default to one hour after the start
  const endMin = end !== undefined && ends.includes(end) ? end : ends.includes(startMin + 60) ? startMin + 60 : ends[0]

  if (!date) {
    return <div style={{ ...styles.menu, ...styles.slotMenu }}>ไม่มีช่วงเวลาให้จองแล้ว</div>
  }

  return (
    <div style={{ ...styles.menu, ...styles.slotMenu }}>
      <span style={styles.slotLabel}>วันที่</span>
      <div style={styles.dateGrid}>
        {dates.map((d) => (
          <button
            key={d}
            onClick={() => setDate(d)}
            style={{ ...styles.dateChip, ...(d === date ? styles.dateChipActive : {}) }}
          >
            <span style={{ fontSize: 12 }}>{d === today ? 'วันนี้' : weekdayLabel(d)}</span>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{dayNumber(d)}</span>
          </button>
        ))}
      </div>

      <div style={styles.timeRow}>
        <label style={styles.timeField}>
          <span style={styles.slotLabel}>เริ่ม</span>
          <select value={startMin} onChange={(e) => setStart(Number(e.target.value))} style={styles.select}>
            {starts.map((m) => (
              <option key={m} value={m}>
                {formatMinutes(m)}
              </option>
            ))}
          </select>
        </label>
        <label style={styles.timeField}>
          <span style={styles.slotLabel}>ถึง</span>
          <select value={endMin} onChange={(e) => setEnd(Number(e.target.value))} style={styles.select}>
            {ends.map((m) => (
              <option key={m} value={m}>
                {formatMinutes(m)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={styles.slotActions}>
        <button style={styles.slotClear} onClick={() => onApply(null)}>
          ไม่ระบุเวลา
        </button>
        <button
          style={styles.slotApply}
          onClick={() => onApply({ date, startMin, endMin })}
        >
          ค้นหาห้องว่าง
        </button>
      </div>
    </div>
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
  slotWrap: { position: 'relative', flex: 'none', width: 250 },
  selectBtnActive: { borderColor: '#1a1a1a', color: '#1a1a1a', fontWeight: 600 },
  slotMenu: { width: 320, padding: 14, gap: 10, fontSize: 14, color: '#1a1a1a' },
  slotLabel: { fontSize: 13, color: '#6b6b6b' },
  dateGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 },
  dateChip: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '6px 0',
    borderRadius: 8,
    border: '1.5px solid #E0E0E0',
    background: '#ffffff',
    color: '#1a1a1a',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  dateChipActive: { background: '#1a1a1a', borderColor: '#1a1a1a', color: '#ffffff' },
  timeRow: { display: 'flex', gap: 10 },
  timeField: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 },
  select: {
    height: 38,
    padding: '0 8px',
    borderRadius: 8,
    border: '1px solid #E0E0E0',
    background: '#ffffff',
    fontFamily: 'inherit',
    fontSize: 14,
    color: '#1a1a1a',
  },
  slotActions: { display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 4 },
  slotClear: {
    height: 38,
    padding: '0 12px',
    background: 'transparent',
    border: 'none',
    fontFamily: 'inherit',
    fontSize: 14,
    color: '#6b6b6b',
    cursor: 'pointer',
  },
  slotApply: {
    height: 38,
    padding: '0 16px',
    background: '#111111',
    color: '#ffffff',
    border: 'none',
    borderRadius: 8,
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
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
