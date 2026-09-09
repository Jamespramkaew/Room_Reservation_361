import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import RoomGallery from '../components/RoomGallery'
import EquipmentBar from '../components/EquipmentBar'
import BookingRules from '../components/BookingRules'
import { fetchRoomById } from '../services/rooms.api'
import type { Room } from '../types/room'
import monitorIcon from '../assets/icon-mornitor.png'

export default function RoomDetailLive() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    setLoading(true)
    setError(null)

    fetchRoomById(id)
      .then((data) => {
        if (!cancelled) setRoom(data)
      })
      .catch((err) => {
        if (cancelled) return
        setError(
          err?.response?.status === 404
            ? 'ไม่พบห้องที่ต้องการ'
            : 'โหลดข้อมูลห้องไม่สำเร็จ ตรวจสอบว่า backend รันอยู่ที่ port 3000 หรือไม่',
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const backButton = (
    <button onClick={() => navigate(-1)} style={styles.back}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flex: 'none' }}
      >
        <line x1="20" y1="12" x2="4" y2="12" />
        <polyline points="10 6 4 12 10 18" />
      </svg>
      <span>ย้อนกลับ</span>
    </button>
  )

  if (loading) {
    return (
      <main className="room-detail-page" style={styles.main}>
        <div style={styles.container}>
          {backButton}
          <p style={styles.message}>กำลังโหลดข้อมูลห้อง…</p>
        </div>
      </main>
    )
  }

  if (error || !room) {
    return (
      <main className="room-detail-page" style={styles.main}>
        <div style={styles.container}>
          {backButton}
          <p style={{ ...styles.message, ...styles.error }}>{error ?? 'ไม่พบห้องที่ต้องการ'}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="room-detail-page" style={styles.main}>
      <div style={styles.container}>
        {backButton}

        <div className="room-detail-card" style={styles.card}>
          <RoomGallery images={room.images} alt={room.name} />

          <div className="room-detail-head" style={styles.headRow}>
            <div style={styles.titleCol}>
              <h1 className="room-detail-title" style={styles.title}>{room.name}</h1>
              <p style={styles.desc}>{room.desc}</p>
            </div>
            <div className="room-detail-tags" style={styles.tags}>
              <span className="room-detail-capacity" style={styles.capacityTag}>
                <img src={monitorIcon} alt="capacity" style={styles.capacityIcon} />
                <span style={styles.capacityText}>Seat: </span>
                <span style={styles.capacityValue}>{room.seats ?? 0}</span>
              </span>
              <span className="room-detail-status" style={styles.statusTag}>{room.status}</span>
            </div>
          </div>

          <EquipmentBar room={room} />
        </div>

        <BookingRules />
      </div>
    </main>
  )
}

const styles: Record<string, CSSProperties> = {
  main: { padding: '32px 40px 80px' },
  container: { maxWidth: 1240, margin: '0 auto' },
  message: { padding: '48px 0', textAlign: 'center', fontSize: 15, color: '#6b6b6b' },
  error: { color: '#DC2626' },
  back: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
    padding: '6px 4px',
    background: 'transparent',
    border: 'none',
    fontFamily: 'inherit',
    fontSize: 17,
    color: '#1a1a1a',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  card: {
    background: '#ffffff',
    borderRadius: 14,
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    padding: 28,
  },
  headRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 40,
    marginTop: 36,
  },
  titleCol: { display: 'flex', flexDirection: 'column', gap: 6 },
  title: { margin: 0, fontSize: 26, fontWeight: 600, color: '#1a1a1a' },
  desc: { margin: 0, fontSize: 14, color: '#6b6b6b' },
  tags: { display: 'flex', alignItems: 'center', gap: 20, flex: 'none' },
  capacityTag: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    height: 40,
    padding: '0 18px 0 12px',
    background: '#111111',
    color: '#ffffff',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  capacityIcon: {
    width: 18,
    height: 18,
    display: 'block',
    objectFit: 'contain',
    filter: 'brightness(0) invert(1)',
  },
  capacityText: { fontSize: 15, fontWeight: 600 },
  capacityValue: { fontSize: 15, fontWeight: 700 },
  statusTag: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 40,
    background: '#22C55E',
    color: '#ffffff',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
}
