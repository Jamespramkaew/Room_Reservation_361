import { Fragment } from 'react'
import type { CSSProperties } from 'react'
import monitorIcon from '../assets/icon-mornitor.png'
import projectorIcon from '../assets/icon-projector.svg'
import micIcon from '../assets/icon-mic.svg'
import type { Room } from '../types/room'

interface EquipmentBarProps {
  room: Room
}

// Inline SVG icon for seat/person
function SeatIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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

export default function EquipmentBar({ room }: EquipmentBarProps) {
  const items: { key: string; icon: string | null; label: string; count: number | undefined; isSeat?: boolean }[] = [
    { key: 'seats', icon: null, label: 'ที่นั่ง', count: room.seats, isSeat: true },
    { key: 'computers', icon: monitorIcon, label: 'เครื่องคอมพิวเตอร์', count: room.computers },
    { key: 'projector', icon: projectorIcon, label: 'โปรเจกเตอร์', count: room.projector },
    { key: 'mic', icon: micIcon, label: 'ไมโครโฟน', count: room.mic },
  ].filter((i) => i.count != null && i.count > 0)

  if (items.length === 0) return null

  return (
    <div className="equipment-bar" style={styles.bar}>
      {items.map((item, idx) => (
        <Fragment key={item.key}>
          {idx > 0 && <span style={styles.divider} />}
          <span style={styles.iconCell} title={item.label}>
            {item.isSeat ? (
              <SeatIcon size={22} />
            ) : (
              <img src={item.icon!} alt={item.label} style={styles.icon} />
            )}
          </span>
          <span style={styles.countCell}>{item.count}</span>
        </Fragment>
      ))}
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    flex: 'none',
    width: 'max-content',
    marginTop: 26,
    background: '#ffffff',
    border: '1.5px solid #1a1a1a',
    borderRadius: 10,
    overflow: 'hidden',
    height: 44,
  },
  divider: {
    width: 1,
    height: 24,
    background: '#d0d0d0',
    flex: 'none',
  },
  iconCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 44,
    background: '#ffffff',
    cursor: 'default',
  },
  icon: { width: 22, height: 22, objectFit: 'contain', display: 'block' },
  countCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    padding: '0 12px',
    height: 44,
    background: '#1a1a1a',
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 600,
  },
}
