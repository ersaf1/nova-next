'use client'

import { useState } from 'react'
import DocsSidebar from './DocsSidebar'
import DocsHeader from './DocsHeader'
import { DocRole } from '@/lib/docs-data'

export default function DocsLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<DocRole | 'ALL'>('ALL')

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 flex flex-col font-sans">
      <DocsHeader onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Persistent Sidebar */}
        <div className="hidden md:block h-[calc(100vh-4rem)] sticky top-16">
          <DocsSidebar selectedRole={selectedRole} onSelectRole={setSelectedRole} />
        </div>

        {/* Mobile Slide-out Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden animate-fadeIn">
            <div
              className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-80 max-w-[85vw] h-full bg-white z-10 shadow-2xl">
              <DocsSidebar
                selectedRole={selectedRole}
                onSelectRole={setSelectedRole}
                onCloseMobile={() => setMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto min-w-0 bg-[#FAF9F6]">
          {children}
        </main>
      </div>
    </div>
  )
}
