import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import AdminLayout from './pages/admin/AdminLayout.tsx'
import AdminDashboard from './pages/admin/AdminDashboard.tsx'
import HeroAdmin from './pages/admin/HeroAdmin.tsx'
import DestinationsAdmin from './pages/admin/DestinationsAdmin.tsx'
import PackagesAdmin from './pages/admin/PackagesAdmin.tsx'
import TestimonialsAdmin from './pages/admin/TestimonialsAdmin.tsx'
import FAQAdmin from './pages/admin/FAQAdmin.tsx'
import BookingPage from './pages/BookingPage.tsx'
import BookingsAdmin from './pages/admin/BookingsAdmin.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="hero" element={<HeroAdmin />} />
          <Route path="destinations" element={<DestinationsAdmin />} />
          <Route path="packages" element={<PackagesAdmin />} />
          <Route path="testimonials" element={<TestimonialsAdmin />} />
          <Route path="faqs" element={<FAQAdmin />} />
          <Route path="bookings" element={<BookingsAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
