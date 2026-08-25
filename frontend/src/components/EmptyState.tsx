import type { CSSProperties } from 'react'
import emptyImg from '../assets/empty-search.png'

export default function EmptyState() {
  return (
    <div style={styles.wrap}>
      <img src={emptyImg} alt="" style={styles.img} />
      <p style={styles.title}>ไม่พบห้องเรียนที่ค้นหา</p>
      <p style={styles.text}>
        เราได้ค้นหาจากห้องเรียนทั้งหมดในระบบแล้ว
        <br />
        แต่ไม่พบห้องที่ตรงกับเงื่อนไขของคุณ
      </p>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    maxWidth: 1240,
    margin: '64px auto 40px',
    textAlign: 'center',
  },
  img: { width: 220, height: 'auto', display: 'block', marginBottom: 12 },
  title: { margin: 0, fontSize: 20, fontWeight: 700, color: '#1a1a1a' },
  text: { margin: 0, fontSize: 15, fontWeight: 400, color: '#6b6b6b', lineHeight: 1.6 },
}
