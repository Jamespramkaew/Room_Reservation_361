import { Outlet } from 'react-router-dom'
import NavBar from '../components/NavBar'

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 Room Reservation System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
