import type { CSSProperties } from 'react'

interface RoomGalleryProps {
  images?: string[]
  alt?: string
}

export default function RoomGallery({ images = [], alt = '' }: RoomGalleryProps) {
  const [main, second, third] = images

  return (
    <div className="room-gallery" style={styles.grid}>
      <div className="room-gallery-main" style={styles.mainBox}>
        {main ? <img src={main} alt={alt} style={styles.img} /> : null}
      </div>
      <div className="room-gallery-side" style={styles.sideCol}>
        <div style={styles.sideBox}>
          {second ? <img src={second} alt={alt} style={styles.img} /> : null}
        </div>
        <div style={styles.sideBox}>
          {third ? <img src={third} alt={alt} style={styles.img} /> : null}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  grid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, alignItems: 'stretch' },
  mainBox: {
    position: 'relative',
    height: 420,
    background: '#EDEDED',
    borderRadius: 6,
    overflow: 'hidden',
  },
  sideCol: { display: 'grid', gridTemplateRows: '1fr 1fr', gap: 20, height: 420 },
  sideBox: { position: 'relative', background: '#EDEDED', borderRadius: 6, overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
}
