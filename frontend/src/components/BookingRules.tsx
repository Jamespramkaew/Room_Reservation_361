import type { CSSProperties } from 'react'
import lineIcon from '../assets/Line.png'

const RULES = [
  'จองล่วงหน้าได้ไม่เกิน 7 วัน ครั้งละไม่เกิน 2 ชั่วโมง',
  'เข้าใช้ห้องภายใน 15 นาที หลังเวลาเริ่ม ไม่งั้นระบบจะยกเลิกอัตโนมัติ',
  'ยกเลิกก่อนเวลาอย่างน้อย 1 ชั่วโมง หากไม่ต้องการใช้ห้องแล้ว',
  'รักษาความสะอาดและเก็บอุปกรณ์ ให้อยู่ในสภาพเดิมก่อนออกจากห้อง',
]

interface BookingRulesProps {
  contactHref?: string
}

export default function BookingRules({ contactHref = '#' }: BookingRulesProps) {
  return (
    <section style={styles.section}>
      <h2 style={styles.heading}>การจองและกฎของการใช้งาน</h2>
      <div style={styles.row}>
        <ol style={styles.list}>
          {RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ol>
        <div style={styles.contactRow}>
          <span style={styles.officeTag}>ติดต่อที่ : สำนักทะเบียน CSTU</span>
          <span style={styles.or}>หรือ</span>
          <a href={contactHref} style={styles.lineBtn}>
            <img src={lineIcon} alt="LINE" style={styles.lineIcon} />
            <span>ติดต่อเจ้าหน้าที่</span>
          </a>
        </div>
      </div>
    </section>
  )
}

const styles: Record<string, CSSProperties> = {
  section: {
    marginTop: 28,
    background: '#ffffff',
    borderRadius: 14,
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    padding: '26px 28px 30px',
  },
  heading: { margin: '0 0 18px', fontSize: 19, fontWeight: 700, color: '#1a1a1a' },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 40,
    flexWrap: 'wrap',
  },
  list: {
    margin: 0,
    paddingLeft: 26,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    fontSize: 15,
    color: '#3a3a3a',
    lineHeight: 1.5,
  },
  contactRow: { display: 'flex', alignItems: 'center', gap: 20, flex: 'none' },
  officeTag: {
    display: 'flex',
    alignItems: 'center',
    height: 42,
    padding: '0 22px',
    background: '#111111',
    color: '#ffffff',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  or: { fontSize: 15, color: '#6b6b6b' },
  lineBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    height: 42,
    padding: '0 22px',
    background: '#22C55E',
    color: '#ffffff',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    textDecoration: 'none',
  },
  lineIcon: { width: 22, height: 22, borderRadius: 5, display: 'block', flex: 'none' },
}
