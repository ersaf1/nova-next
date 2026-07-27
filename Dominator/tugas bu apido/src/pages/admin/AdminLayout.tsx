import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { path: '/admin', label: 'Dashboard', exact: true },
  { path: '/admin/hero', label: 'Hero' },
  { path: '/admin/destinations', label: 'Destinations' },
  { path: '/admin/packages', label: 'Packages' },
  { path: '/admin/testimonials', label: 'Testimonials' },
  { path: '/admin/faqs', label: 'FAQ' },
  { path: '/admin/bookings', label: 'Bookings' },
]

const AdminLayout: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-black text-white flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <span className="text-lg font-bold tracking-tight">NOVA Admin</span>
        </div>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-white text-black' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors text-left"
          >
            ← Back to site
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
