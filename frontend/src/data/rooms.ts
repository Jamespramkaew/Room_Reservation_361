import type { Room } from '../types/room'

export const ROOM_TYPES = ['ห้องแลป', 'ห้องเล็คเชอร์', 'ห้องประชุม']

export const rooms: Room[] = [
  {
    id: 'lc101',
    name: 'LC-101 room',
    desc: 'ห้องเรียนสำหรับทำกิจกรรมแล็บในรายวิชา',
    type: 'ห้องแลป',
    size: 'Large',
    status: 'Available',
    seats: 39,
    projector: 1,
    mic: 2,
    image: 'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room1.jpg',
    images: [
      'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room1.jpg',
      'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room1-1.jpg',
      'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room1-2.jpg'
    ],
  },
  {
    id: 'lc102',
    name: 'LC-102 room',
    desc: 'ห้องเรียนสำหรับทำกิจกรรมแล็บในรายวิชา',
    type: 'ห้องแลป',
    size: 'Large',
    status: 'Available',
    seats: 67,
    projector: 2,
    mic: 2,
    image: 'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room102.jpg',
    images: [
      'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room102.jpg',
      'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room1-1.jpg',
      'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room1-2.jpg'
    ],
  },
  {
    id: 'lc103',
    name: 'LC-103 room',
    desc: 'ห้อง lecture สำหรับคนที่อยากตากแอร์',
    type: 'ห้องเล็คเชอร์',
    size: 'Medium',
    status: 'Available',
    seats: 39,
    projector: 1,
    mic: 2,
    image: 'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room103.jpg',
    images: [
      'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room103.jpg',
      'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room1-1.jpg',
      'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room1-2.jpg'
    ],
  },
  {
    id: 'lc104',
    name: 'LC-104 room',
    desc: 'ห้อง lecture สำหรับคนที่อยากตากแอร์',
    type: 'ห้องเล็คเชอร์',
    size: 'Medium',
    status: 'Available',
    projector: 1,
    mic: 1,
    image: 'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room104.jpg',
    images: [
      'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room104.jpg',
      'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room1-1.jpg',
      'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room1-2.jpg'
    ],
  },
  {
    id: 'lc105',
    name: 'LC-105 room',
    desc: 'ห้อง lecture สำหรับคนที่อยากตากแอร์',
    type: 'ห้องเล็คเชอร์',
    size: 'Small',
    status: 'Available',
    projector: 1,
    mic: 1,
    image: 'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room105(4).jpg',
    images: [
      'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room105(4).jpg',
      'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room1-1.jpg',
      'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room1-2.jpg'
    ],
  },
  {
    id: 'lc106',
    name: 'LC-106 room',
    desc: 'ห้องประชุมกลุ่มย่อย',
    type: 'ห้องประชุม',
    size: 'Small',
    status: 'Available',
    projector: 1,
    image: 'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room106.jpg',
    images: [
      'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room106.jpg',
      'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room1-1.jpg',
      'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com/Room1-2.jpg'
    ],
  },
]
