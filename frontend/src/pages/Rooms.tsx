import type { CSSProperties } from 'react'
import RoomCard from '../components/RoomCard'
import { rooms } from '../data/rooms'

export default function Rooms() {
  return (
    <main style={styles.main}>
      <div style={styles.grid}>
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
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
