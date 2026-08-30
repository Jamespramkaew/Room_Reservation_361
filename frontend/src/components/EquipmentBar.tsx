import { Fragment } from 'react'
import type { CSSProperties } from 'react'
import monitorIcon from '../assets/icon-mornitor.png'
import projectorIcon from '../assets/icon-projector.svg'
import micIcon from '../assets/icon-mic.svg'
import type { Room } from '../types/room'

interface EquipmentBarProps {
  room: Room
}

export default function EquipmentBar({ room }: EquipmentBarProps) {
  const items = [
    { key: 'seats', icon: monitorIcon, label: 'เครื่องคอมพิวเตอร์', count: room.seats },
    { key: 'projector', icon: projectorIcon, label: 'โปรเจกเตอร์', count: room.projector },
    { key: 'mic', icon: micIcon, label: 'ไมโครโฟน', count: room.mic },
  ].filter((i) => i.count != null)

  if (items.length === 0) return null

  return (
    <div style={styles.bar}>
      {items.map((item) => (
        <Fragment key={item.key}>
          <span style={styles.iconCell}>
            <img src={item.icon} alt={item.label} style={styles.icon} />
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
  iconCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 44,
    background: '#ffffff',
  },
  icon: { width: 22, height: 22, objectFit: 'contain', display: 'block' },
  countCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 52,
    padding: '0 14px',
    height: 44,
    background: '#1a1a1a',
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 600,
  },
}
