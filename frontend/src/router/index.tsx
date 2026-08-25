import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Rooms from '../pages/Rooms'
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
        path: 'admin/console',
        element: <AdminConsole />,
      },
    ],
  },
])
