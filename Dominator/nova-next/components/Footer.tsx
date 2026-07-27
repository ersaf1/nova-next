import React from 'react'
import LogoIcon from './LogoIcon'
import { Globe, Mail, MessageCircle, Video } from 'lucide-react'

const Footer: React.FC = () => {
  const links = {
    Product: ['Destinations', 'Experiences', 'How it works', 'Pricing', 'Enterprise'],
    Company: ['About us', 'Blog', 'Careers', 'Press', 'Contact'],
    Support: ['Help Center', 'Safety', 'Cancellation policy', 'Accessibility', 'Community'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Licenses'],
  }

  return (
    <footer className="bg-[#0A0A0A] px-6 py-16">
      <div className="max-w-[88rem] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <LogoIcon className="w-6 h-6 text-white" />
              <span className="text-xl font-medium text-white" style={{ letterSpacing: '-0.03em' }}>
                Nova
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              The world's most seamless global travel platform.
            </p>
            <div className="flex gap-3">
              {[Globe, Mail, MessageCircle, Video].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors duration-200"
                  aria-label="Social link"
                >
                  <Icon className="w-4 h-4 text-white/60" />
                </a>
              ))}
            </div>
          </div>
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white/60 text-xs font-medium tracking-widest uppercase mb-4">
                {category}
              </h4>
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-white/40 text-sm hover:text-white transition-colors duration-200">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">© 2026 NOVA. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-white/30 text-sm hover:text-white/60 transition-colors duration-200">Privacy</a>
            <a href="#" className="text-white/30 text-sm hover:text-white/60 transition-colors duration-200">Terms</a>
            <a href="#" className="text-white/30 text-sm hover:text-white/60 transition-colors duration-200">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
