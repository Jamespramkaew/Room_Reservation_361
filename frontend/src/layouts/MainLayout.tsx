import { Outlet, Link } from 'react-router-dom'

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            Room Reservation
          </Link>
          <div className="flex gap-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-indigo-600 font-medium transition"
            >
              Home
            </Link>
            <Link
              to="/rooms"
              className="text-gray-700 hover:text-indigo-600 font-medium transition"
            >
              Rooms
            </Link>
            <Link
              to="/admin/console"
              className="text-gray-700 hover:text-indigo-600 font-medium transition"
            >
              Admin
            </Link>
          </div>
        </div>
      </nav>

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
