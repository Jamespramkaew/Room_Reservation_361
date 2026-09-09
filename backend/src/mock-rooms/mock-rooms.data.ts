export interface MockRoom {
  id: string;
  name: string;
  desc: string;
  type: string;
  size: 'Small' | 'Medium' | 'Large';
  status: string;
  seats?: number;
  computers?: number;
  projector?: number;
  mic?: number;
  image?: string;
  images?: string[];
}

const S3 = 'https://roomreserve-image-private.s3.ap-southeast-1.amazonaws.com';

export const ROOM_TYPES = [
  'ห้องแลป',
  'ห้องเล็คเชอร์',
  'ห้องประชุม',
  'ห้อง Co-working',
];

export const EQUIPMENT_OPTIONS = ['คอมพิวเตอร์', 'โปรเจกเตอร์', 'ไมโครโฟน'];

export const mockRooms: MockRoom[] = [
  {
    id: 'lc101',
    name: 'LC-101 room',
    desc: 'ห้องเรียนสำหรับทำกิจกรรมแล็บในรายวิชา',
    type: 'ห้องแลป',
    size: 'Large',
    status: 'Available',
    seats: 39,
    computers: 39,
    projector: 1,
    mic: 2,
    image: `${S3}/Room1.jpg`,
    images: [`${S3}/Room1.jpg`, `${S3}/Room1-1.jpg`, `${S3}/Room1-2.jpg`],
  },
  {
    id: 'lc102',
    name: 'LC-102 room',
    desc: 'ห้องเรียนสำหรับทำกิจกรรมแล็บในรายวิชา',
    type: 'ห้องแลป',
    size: 'Large',
    status: 'Available',
    seats: 67,
    computers: 67,
    projector: 2,
    mic: 2,
    image: `${S3}/Room102.jpg`,
    images: [`${S3}/Room102.jpg`, `${S3}/Room105(4).jpg`, `${S3}/Room106.jpg`],
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
    image: `${S3}/lec1.jpg`,
    images: [`${S3}/lec1.jpg`, `${S3}/lec4.jpg`, `${S3}/lec5.jpg`],
  },
  {
    id: 'lc104',
    name: 'LC-104 room',
    desc: 'ห้อง lecture สำหรับคนที่อยากตากแอร์',
    type: 'ห้องเล็คเชอร์',
    size: 'Medium',
    status: 'Available',
    seats: 40,
    projector: 1,
    mic: 1,
    image: `${S3}/lec2.jpg`,
    images: [`${S3}/lec2.jpg`, `${S3}/lec4.jpg`, `${S3}/lec5.jpg`],
  },
  {
    id: 'lc105',
    name: 'LC-105 room',
    desc: 'ห้อง lecture สำหรับคนที่อยากตากแอร์',
    type: 'ห้องเล็คเชอร์',
    size: 'Small',
    status: 'Available',
    seats: 30,
    projector: 1,
    mic: 1,
    image: `${S3}/lec3.jpg`,
    images: [`${S3}/lec3.jpg`, `${S3}/lec4.jpg`, `${S3}/lec5.jpg`],
  },
  {
    id: 'lc106',
    name: 'LC-106 room',
    desc: 'ห้องประชุมกลุ่มย่อย',
    type: 'ห้องประชุม',
    size: 'Small',
    status: 'Available',
    seats: 12,
    projector: 1,
    image: `${S3}/meet1.jpg`,
    images: [`${S3}/meet1.jpg`, `${S3}/meet2.jpg`, `${S3}/meet3.jpg`],
  },
  {
    id: 'cowork01',
    name: 'Co-working Space',
    desc: 'พื้นที่ทำงานร่วมกัน เหมาะสำหรับนั่งทำงานและอ่านหนังสือ',
    type: 'ห้อง Co-working',
    size: 'Large',
    status: 'Available',
    seats: 50,
    image: `${S3}/co-working.jpg`,
    images: [`${S3}/co-working.jpg`, `${S3}/co2.png`, `${S3}/co3.jpg`],
  },
];
