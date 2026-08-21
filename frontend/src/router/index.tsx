import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Home from '../pages/Home'
import Rooms from '../pages/Rooms'
import AdminConsole from '../pages/AdminConsole'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'rooms',
        element: <Rooms />,
      },
      {
        path: 'admin/console',
        element: <AdminConsole />,
      },
    ],
  },
])
