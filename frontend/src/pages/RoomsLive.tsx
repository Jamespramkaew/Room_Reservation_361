import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import RoomCard from '../components/RoomCard'
import SearchFilter from '../components/SearchFilter'
import EmptyState from '../components/EmptyState'
import { fetchRooms } from '../services/rooms.api'
import type { Room } from '../types/room'

// Map equipment filter label → which room field to check
const EQUIPMENT_FIELD_MAP: Record<string, keyof Room> = {
  'คอมพิวเตอร์': 'computers',
  'โปรเจกเตอร์': 'projector',
  'ไมโครโฟน': 'mic',
}

export default function RoomsLive() {
  const navigate = useNavigate()
  const [allRooms, setAllRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [equipment, setEquipment] = useState('')

  useEffect(() => {
    let cancelled = false

    fetchRooms()
      .then((data) => {
        if (!cancelled) setAllRooms(data)
      })
      .catch(() => {
        if (!cancelled) setError('โหลดข้อมูลห้องไม่สำเร็จ ตรวจสอบว่า backend รันอยู่ที่ port 3000 หรือไม่')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const rooms = useMemo(() => {
    const q = query.trim().toLowerCase()
    const equipField = equipment ? EQUIPMENT_FIELD_MAP[equipment] : null
    return allRooms
      .filter((r) => !q || r.name.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q))
      .filter((r) => !type || r.type === type)
      .filter((r) => {
        if (!equipField) return true
        const val = r[equipField]
        return val != null && (val as number) > 0
      })
  }, [allRooms, query, type, equipment])

  const handleOpenRoom = (room: Room) => {
    navigate(`/live/rooms/${room.id}`)
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
      />

      {loading && <p style={styles.message}>กำลังโหลดข้อมูลห้อง…</p>}
      {error && <p style={{ ...styles.message, ...styles.error }}>{error}</p>}

      {!loading && !error && (
        <>
          <div className="rooms-grid" style={styles.grid}>
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} onOpen={handleOpenRoom} />
            ))}
          </div>
          {rooms.length === 0 && <EmptyState />}
        </>
      )}
    </main>
  )
}

const styles: Record<string, CSSProperties> = {
  main: { padding: '56px 40px 80px' },
  message: {
    maxWidth: 1240,
    margin: '32px auto 0',
    textAlign: 'center',
    fontSize: 15,
    color: '#6b6b6b',
  },
  error: { color: '#DC2626' },
  grid: {
    maxWidth: 1240,
    margin: '32px auto 0',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 32,
  },
}
