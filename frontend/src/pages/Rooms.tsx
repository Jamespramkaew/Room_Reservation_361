import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import RoomCard from '../components/RoomCard'
import SearchFilter from '../components/SearchFilter'
import EmptyState from '../components/EmptyState'
import { rooms as allRooms } from '../data/rooms'
import type { Room } from '../types/room'

export default function Rooms() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')

  const rooms = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allRooms
      .filter((r) => !q || r.name.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q))
      .filter((r) => !type || r.type === type)
  }, [query, type])

  const handleOpenRoom = (room: Room) => {
    navigate(`/rooms/${room.id}`)
  }

  return (
    <main style={styles.main}>
      <SearchFilter query={query} onQueryChange={setQuery} type={type} onTypeChange={setType} />
      <div style={styles.grid}>
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
}
