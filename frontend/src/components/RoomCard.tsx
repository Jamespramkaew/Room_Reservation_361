import type { CSSProperties } from 'react'
import monitorIcon from '../assets/icon-mornitor.png'
import type { Room } from '../types/room'

interface RoomCardProps {
  room: Room
  onOpen?: (room: Room) => void
}

export default function RoomCard({ room, onOpen = () => {} }: RoomCardProps) {
  return (
    <article style={styles.card}>
      <div style={styles.imageBox}>
        {room.image ? <img src={room.image} alt={room.name} style={styles.image} /> : null}
      </div>
      <div style={styles.body}>
        <h3 style={styles.name}>{room.name}</h3>
        <p style={styles.desc}>{room.desc}</p>
        <div style={styles.footer}>
          {room.seats != null && (
            <div style={styles.badge}>
              <span style={styles.badgeIcon}>
                <img
                  src={monitorIcon}
                  alt="เครื่องคอมพิวเตอร์"
                  style={{ width: 17, height: 17, display: 'block' }}
                />
              </span>
              <span style={styles.badgeCount}>{room.seats}</span>
            </div>
          )}
          <button onClick={() => onOpen(room)} style={styles.cta}>
            ดูรายละเอียด
          </button>
        </div>
      </div>
    </article>
  )
}

const styles: Record<string, CSSProperties> = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    background: '#ffffff',
    borderRadius: 12,
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    overflow: 'hidden',
  },
  imageBox: { position: 'relative', width: '100%', height: 180, background: '#EDEDED' },
  image: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  body: { display: 'flex', flexDirection: 'column', gap: 6, padding: '18px 20px 20px', flex: 1 },
  name: { margin: 0, fontSize: 19, fontWeight: 600, color: '#1a1a1a' },
  desc: { margin: 0, fontSize: 14, fontWeight: 400, color: '#6b6b6b' },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 14,
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    flex: 'none',
    background: '#ffffff',
    border: '1.5px solid #1a1a1a',
    borderRadius: 8,
    overflow: 'hidden',
    height: 30,
  },
  badgeIcon: { display: 'flex', alignItems: 'center', padding: '0 12px', height: '100%' },
  badgeCount: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    height: '100%',
    background: '#1a1a1a',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 600,
  },
  cta: {
    marginLeft: 'auto',
    flex: 'none',
    whiteSpace: 'nowrap',
    padding: '8px 18px',
    background: '#111111',
    color: '#ffffff',
    border: 'none',
    borderRadius: 8,
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
}
