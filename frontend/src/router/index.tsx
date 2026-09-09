import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Rooms from '../pages/Rooms'
import RoomDetail from '../pages/RoomDetail'
import RoomsLive from '../pages/RoomsLive'
import RoomDetailLive from '../pages/RoomDetailLive'
import AdminConsole from '../pages/AdminConsole'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Rooms />,
      },
      {
        path: 'rooms/:id',
        element: <RoomDetail />,
      },
      {
        path: 'live',
        element: <RoomsLive />,
      },
      {
        path: 'live/rooms/:id',
        element: <RoomDetailLive />,
      },
      {
        path: 'admin/console',
        element: <AdminConsole />,
      },
    ],
  },
])
