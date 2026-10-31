import { Outlet } from 'react-router-dom'
import AppSidebar from './AppSidebar'
import AppTopbar from './AppTopbar'

export default function AppLayout() {
  return (
    <div className="min-h-dvh flex bg-cream">
      <AppSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <AppTopbar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}