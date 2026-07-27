import React from 'react'
import { ArrowRight } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

const cards = [
  { id: 1, colSpan: 'lg:col-span-2', backgroundImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=85', title: 'Every journey\nbegins here.', body: 'World-class travel, tailored to you.' },
  { id: 2, colSpan: '', backgroundImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=85', title: 'Always\nseamless.', body: 'One flow. Flights, hotels, experiences.' },
  { id: 3, colSpan: '', backgroundImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=85', title: 'Fully\npersonalized.', body: 'Smart picks based on your taste.' },
]

const MeetNovaSection: React.FC = () => {
  return (
    <section id="about" className="bg-[#FAFAFA] px-4 sm:px-6 py-20">
      <div className="max-w-[88rem] mx-auto">
        <ScrollReveal animation="slide-up">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <h2 className="text-black text-4xl md:text-5xl font-bold leading-tight" style={{ letterSpacing: '-0.04em' }}>Meet NOVA.</h2>
            <div className="flex items-center gap-4">
              <p className="text-black/50 text-base max-w-xs leading-relaxed hidden md:block">A global travel platform for extraordinary destinations.</p>
              <a href="/destinations" className="inline-flex items-center gap-3 bg-black text-white text-sm font-semibold pl-6 pr-2 py-2 rounded-full hover:bg-neutral-800 transition-colors duration-300 shrink-0">
                Discover
                <span className="bg-white rounded-full p-2.5"><ArrowRight className="w-3.5 h-3.5 text-black" /></span>
              </a>
            </div>
          </div>
        </ScrollReveal>
        
        <ScrollReveal staggerChildren={true} animation="slide-up" delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
              <div key={card.id} className={`group relative rounded-2xl overflow-hidden cursor-default transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 ${card.colSpan}`} style={{ minHeight: '320px' }}>
                <img src={card.backgroundImage} alt={card.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5" />
                <div className="relative z-10 p-8 min-h-80 flex flex-col justify-between h-full">
                  <div />
                  <div>
                    <p className="text-2xl font-bold leading-snug whitespace-pre-line text-white mb-2" style={{ letterSpacing: '-0.02em' }}>{card.title}</p>
                    <p className="text-white/60 text-sm leading-relaxed">{card.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default MeetNovaSection
