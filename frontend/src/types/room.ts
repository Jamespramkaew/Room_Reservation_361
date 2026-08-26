export interface Room {
  id: string
  name: string
  desc: string
  type: string
  size: 'Small' | 'Medium' | 'Large'
  status: string
  seats?: number
  projector?: number
  mic?: number
  image?: string
  images?: string[]
}
