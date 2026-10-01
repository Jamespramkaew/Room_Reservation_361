import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import RoomCard from '../components/RoomCard'
import SearchFilter from '../components/SearchFilter'
import EmptyState from '../components/EmptyState'
import { useApi } from '../hooks/useApi'
import { roomsService } from '../services/roomsService'
import { mapRoomFromApi, ROOM_TYPE_REVERSE_MAP } from '../types/room'
import type { Room } from '../types/room'

// Map equipment filter label → API facility key
const EQUIPMENT_API_MAP: Record<string, string> = {
  'คอมพิวเตอร์': 'computers',
  'โปรเจกเตอร์': 'projector',
  'ไมโครโฟน': 'mic',
}

export default function Rooms() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [equipment, setEquipment] = useState('')

  // Build API search params
  const searchParams = useMemo(() => {
    const params: Record<string, string> = {}
    if (query.trim()) params.q = query.trim()
    if (type) params.room_type = ROOM_TYPE_REVERSE_MAP[type] || type
    if (equipment) params.facilities = EQUIPMENT_API_MAP[equipment] || equipment
    return params
  }, [query, type, equipment])

  // Fetch rooms from API
  const { data: apiRooms, loading, error, execute } = useApi(() => 
    roomsService.getAllRooms(searchParams)
  )

  // Execute search whenever params change
  useEffect(() => {
    execute()
  }, [execute, searchParams])

  // Map API response to UI format
  const rooms = useMemo(() => {
    if (!apiRooms) return []
    return apiRooms.map(mapRoomFromApi)
  }, [apiRooms])

  const handleOpenRoom = (room: Room) => {
    navigate(`/rooms/${room.id}`)
  }

  if (loading) {
    return (
      <main className="rooms-page" style={styles.main}>
        <div style={styles.loading}>กำลังโหลดข้อมูล...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="rooms-page" style={styles.main}>
        <div style={styles.error}>เกิดข้อผิดพลาด: {error}</div>
      </main>
    )
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
      <div className="rooms-grid" style={styles.grid}>
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} onOpen={handleOpenRoom} />
        ))}
      </div>
      {rooms.length === 0 && <EmptyState />}
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
  },
  loading: {
    maxWidth: 1240,
    margin: '0 auto',
    textAlign: 'center',
    padding: '80px 0',
    fontSize: 18,
    color: '#6b6b6b',
  },
  error: {
    maxWidth: 1240,
    margin: '0 auto',
    textAlign: 'center',
    padding: '80px 0',
    fontSize: 18,
    color: '#ef4444',
  },
}
