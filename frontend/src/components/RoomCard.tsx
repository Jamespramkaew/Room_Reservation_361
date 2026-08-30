import { type CSSProperties, useState } from 'react'
import monitorIcon from '../assets/icon-mornitor.png'
import type { Room } from '../types/room'

interface RoomCardProps {
  room: Room
  onOpen?: (room: Room) => void
}

// Inline SVG seat icon for co-working / seats-only rooms
function SeatIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block' }}
    >
      <circle cx="12" cy="5" r="2.5" />
      <path d="M7 22v-5a5 5 0 0 1 10 0v5" />
      <line x1="9" y1="13" x2="15" y2="13" />
    </svg>
  )
}

export default function RoomCard({ room, onOpen = () => {} }: RoomCardProps) {
  const [hovered, setHovered] = useState(false)

  // Prefer computers; fall back to seats if no computers
  const showComputer = room.computers != null && room.computers > 0
  const showSeat = !showComputer && room.seats != null && room.seats > 0
  const badgeCount = showComputer ? room.computers : room.seats
  const badgeLabel = showComputer ? 'เครื่องคอมพิวเตอร์' : 'ที่นั่ง'

  return (
    <article style={styles.card}>
      <div style={styles.imageBox}>
        {room.image ? <img src={room.image} alt={room.name} style={styles.image} /> : null}
      </div>
      <div style={styles.body}>
        <h3 style={styles.name}>{room.name}</h3>
        <p style={styles.desc}>{room.desc}</p>
        <div style={styles.footer}>
          {(showComputer || showSeat) && (
            <div style={styles.badge} title={badgeLabel}>
              <span style={styles.badgeIcon}>
                {showComputer ? (
                  <img
                    src={monitorIcon}
                    alt={badgeLabel}
                    style={{ width: 17, height: 17, display: 'block' }}
                  />
                ) : (
                  <SeatIcon />
                )}
              </span>
              <span style={styles.badgeCount}>{badgeCount}</span>
            </div>
          )}
          <button
            onClick={() => onOpen(room)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ ...styles.cta, ...(hovered ? styles.ctaHover : {}) }}
          >
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
    cursor: 'default',
  },
  badgeIcon: { display: 'flex', alignItems: 'center', padding: '0 10px', height: '100%' },
  badgeCount: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 14px',
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
    transition: 'background 0.18s',
  },
  ctaHover: {
    background: '#F59E0B',
  },
}
