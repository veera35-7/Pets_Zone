import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Shield, Zap, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PetCard from '../components/PetCard'
import WhatsAppFAB from '../components/WhatsAppFAB'

// ==================== HERO SECTION ====================
const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    {/* Background gradient */}
    <div className="absolute inset-0 bg-primary-950">
      <div className="absolute inset-0 bg-gradient-radial from-primary-800/30 via-transparent to-transparent" />
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-accent-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl" />
    </div>

    <div className="relative page-container text-center z-10 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-primary-400 text-sm mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          India's Premium Pet Marketplace
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-primary-50 tracking-tight leading-[1.05] mb-6">
          Find Your
          <br />
          <span className="text-gradient-gold">Perfect</span>
          <br />
          Companion
        </h1>

        <p className="text-primary-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Discover verified premium pet listings from trusted sellers across India. Every listing is admin-reviewed for your safety.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/browse" className="btn-primary text-base px-8 py-4 group">
            Browse Pets
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/recommendations" className="flex items-center gap-2 px-8 py-4 bg-accent-gold/10 hover:bg-accent-gold/20 border border-accent-gold/30 hover:border-accent-gold/50 text-accent-gold rounded-xl text-base font-bold transition-all">
            <Sparkles size={16} /> Find Matches Quiz
          </Link>
          <Link to="/signup" className="btn-outline text-base px-8 py-4">
            List Your Pet
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-16">
          {[
            { label: 'Customers', value: '1,000+' },
            { label: 'Cities', value: '80+' },
            { label: 'Cows Listed', value: '450+' },
            { label: 'User Logins', value: '3,000+' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-black text-primary-50">{stat.value}</div>
              <div className="text-primary-500 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary-700 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-primary-400 rounded-full animate-bounce" />
        </div>
      </motion.div>
    </div>
  </section>
)

// ==================== FEATURES ====================
const FeaturesSection = () => (
  <section className="py-20 bg-primary-900/50">
    <div className="page-container">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Shield, title: 'Admin Verified', desc: 'Every listing is reviewed and approved by our team before going live.' },
          { icon: Star, title: 'Premium Quality', desc: 'Only the finest pets from responsible breeders and caring families.' },
          { icon: Zap, title: 'Instant Enquiry', desc: 'Contact sellers directly via WhatsApp, call, or our enquiry system.' },
        ].map(({ icon: Icon, title, desc }) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 hover:bg-white/8 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-100/10 flex items-center justify-center mb-4">
              <Icon size={22} className="text-primary-200" />
            </div>
            <h3 className="text-primary-50 font-bold text-lg mb-2">{title}</h3>
            <p className="text-primary-400 text-sm leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

// ==================== PET SECTION ====================
const PetSection = ({ title, subtitle, pets, loading }) => (
  <section className="py-20">
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-10"
      >
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">{subtitle}</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card">
              <div className="shimmer aspect-square" />
              <div className="p-4 space-y-3">
                <div className="shimmer h-5 rounded-lg w-3/4" />
                <div className="shimmer h-4 rounded-lg w-1/2" />
                <div className="shimmer h-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : pets?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {pets.map(pet => <PetCard key={pet._id} pet={pet} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-primary-500">No pets found</div>
      )}

      {pets?.length > 0 && (
        <div className="text-center mt-10">
          <Link to="/browse" className="btn-outline">
            View All Pets <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  </section>
)

// ==================== TESTIMONIALS ====================
const testimonials = [
  { name: 'Priya Sharma', location: 'Mumbai', text: 'Found my golden retriever pup through RV Pets Zone. The process was smooth and the seller was very responsive!', rating: 5 },
  { name: 'Rahul Verma', location: 'Delhi', text: 'Sold my Labrador puppies within a week. The admin approval system builds trust with buyers.', rating: 5 },
  { name: 'Ananya Patel', location: 'Bangalore', text: 'Premium platform! Love the design and how easy it is to find pets by location.', rating: 5 },
]

const TestimonialsSection = () => (
  <section className="py-20 bg-primary-900/30">
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="section-title">What Our Users Say</h2>
        <p className="section-subtitle">Trusted by thousands of pet lovers across India</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex gap-0.5 mb-4">
              {[...Array(t.rating)].map((_, j) => (
                <Star key={j} size={14} className="fill-accent-gold text-accent-gold" />
              ))}
            </div>
            <p className="text-primary-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-700 flex items-center justify-center text-primary-300 font-bold text-sm">
                {t.name[0]}
              </div>
              <div>
                <div className="text-primary-100 text-sm font-semibold">{t.name}</div>
                <div className="text-primary-500 text-xs">{t.location}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

// ==================== CONTACT SECTION ====================
const ContactSection = () => (
  <section className="py-20">
    <div className="page-container">
      <div className="glass-card p-8 md:p-12 text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title mb-4">Ready to Find Your Pet?</h2>
          <p className="text-primary-400 mb-8 leading-relaxed">
            Browse hundreds of verified pet listings or list your own pet today. Our admin team reviews every listing for safety.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/browse" className="btn-primary px-8 py-3">Browse Pets</Link>
            <Link to="/signup" className="btn-outline px-8 py-3">Start Selling</Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-primary-500">
            <a href="tel:+919715487090" className="hover:text-primary-200 transition-colors">📞 +91 9715487090</a>
            <a href="mailto:newupdate106@gmail.com" className="hover:text-primary-200 transition-colors">✉️ newupdate106@gmail.com</a>
            <a href="https://instagram.com/rv_pets_zone" target="_blank" rel="noopener noreferrer" className="hover:text-primary-200 transition-colors">📸 @rv_pets_zone</a>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
)

// ==================== HOME PAGE ====================
const HomePage = () => {
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured-pets'],
    queryFn: () => api.get('/pets/featured').then(r => r.data.pets)
  })

  const { data: latestData, isLoading: latestLoading } = useQuery({
    queryKey: ['latest-pets'],
    queryFn: () => api.get('/pets?limit=8&sort=newest').then(r => r.data.pets)
  })

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending-pets'],
    queryFn: () => api.get('/pets/trending').then(r => r.data.pets)
  })

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />

        {featuredData?.length > 0 && (
          <PetSection
            title="⭐ Featured Pets"
            subtitle="Hand-picked premium listings by our admin team"
            pets={featuredData}
            loading={featuredLoading}
          />
        )}

        <PetSection
          title="🐾 Latest Listings"
          subtitle="Freshest pet listings from verified sellers"
          pets={latestData}
          loading={latestLoading}
        />

        {trendingData?.length > 0 && (
          <PetSection
            title="🔥 Trending Now"
            subtitle="Most viewed and enquired pets this week"
            pets={trendingData}
            loading={trendingLoading}
          />
        )}

        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppFAB />
    </div>
  )
}

export default HomePage
