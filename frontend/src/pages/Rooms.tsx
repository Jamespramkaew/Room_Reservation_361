import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import RoomCard from '../components/RoomCard'
import SearchFilter from '../components/SearchFilter'
import EmptyState from '../components/EmptyState'
import { useAsync } from '../hooks/useAsync'
import { searchRooms } from '../services/rooms'
import type { Room } from '../types/room'
import { formatMinutes, shortDateLabel, type TimeSlot } from '../utils/bkkDate'

export default function Rooms() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [equipment, setEquipment] = useState('')
  const [slot, setSlot] = useState<TimeSlot | null>(null)

  // Wait for the user to stop typing before searching
  const [debouncedQuery, setDebouncedQuery] = useState('')
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(id)
  }, [query])

  const search = { query: debouncedQuery, type, equipment, slot }
  const { data, previous, error, loading, reload } = useAsync(JSON.stringify(search), () => searchRooms(search))
  // Keep showing the last results while the next search loads
  const rooms = data ?? previous ?? []

  const handleOpenRoom = (room: Room) => {
    navigate(slot ? `/rooms/${room.id}?date=${slot.date}` : `/rooms/${room.id}`)
  }

  return (
    <main className="rooms-page" style={styles.main}>
      <SearchFilter
        query={query}
        onQueryChange={setQuery}
        type={type}
        onTypeChange={setType}
        equipment={equipment}
        onEquipmentChange={setEquipment}
        slot={slot}
        onSlotChange={setSlot}
      />

      {slot && (
        <p style={styles.slotHint}>
          แสดงเฉพาะห้องที่ว่าง {shortDateLabel(slot.date)} เวลา {formatMinutes(slot.startMin)}–{formatMinutes(slot.endMin)}
        </p>
      )}

      {error ? (
        <div style={styles.error}>
          <span>โหลดรายการห้องไม่สำเร็จ: {error}</span>
          <button style={styles.retry} onClick={reload}>
            ลองใหม่
          </button>
        </div>
      ) : (
        <div className="rooms-grid" style={{ ...styles.grid, opacity: loading && previous ? 0.5 : 1 }}>
          {loading && !previous
            ? Array.from({ length: 6 }, (_, i) => <div key={i} style={styles.skeleton} />)
            : rooms.map((room) => <RoomCard key={room.id} room={room} onOpen={handleOpenRoom} />)}
        </div>
      )}
      {!loading && !error && rooms.length === 0 && <EmptyState />}
    </main>
  )
}

const styles: Record<string, CSSProperties> = {
  main: { padding: '56px 40px 80px' },
  grid: {
    maxWidth: 1240,
    margin: '32px auto 0',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 32,
    transition: 'opacity 0.15s',
  },
  skeleton: { height: 320, borderRadius: 12, background: '#EDEDED' },
  slotHint: { maxWidth: 1240, margin: '18px auto 0', fontSize: 15, color: '#1a1a1a', fontWeight: 600 },
  error: {
    maxWidth: 1240,
    margin: '32px auto 0',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    color: '#B91C1C',
    fontSize: 15,
  },
  retry: {
    height: 38,
    padding: '0 16px',
    borderRadius: 8,
    border: '1.5px solid #1a1a1a',
    background: '#ffffff',
    fontFamily: 'inherit',
    fontSize: 14,
    cursor: 'pointer',
  },
}
