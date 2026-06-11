import { Link } from 'react-router-dom'
import { Instagram, Phone, Mail, MapPin, Heart, ExternalLink } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary-950 border-t border-primary-900 pt-16 pb-8">
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary-100 flex items-center justify-center">
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-primary-50 font-bold text-lg leading-none">RV Pets Zone</div>
                <div className="text-primary-500 text-xs">Premium Pet Marketplace</div>
              </div>
            </div>
            <p className="text-primary-400 text-sm leading-relaxed max-w-sm">
              India's most trusted premium pet marketplace. Find your perfect companion from verified sellers across the country.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://instagram.com/rv_pets_zone"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-900 border border-primary-800 flex items-center justify-center text-primary-400 hover:text-white hover:border-primary-500 transition-all"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://wa.me/919715487090?text=Hello%20RV%20Pets%20Zone!%20I%20am%20interested%20in%20a%20pet."
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-900 border border-primary-800 flex items-center justify-center text-primary-400 hover:text-[#25D366] hover:border-[#25D366] transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-primary-100 font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Browse Pets', to: '/browse' },
                { label: 'List Your Pet', to: '/dashboard/add-pet' },
                { label: 'My Dashboard', to: '/dashboard' },
                { label: 'Sign Up', to: '/signup' },
                { label: 'Login', to: '/login' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-primary-400 hover:text-primary-100 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-primary-100 font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-primary-400">
                <Phone size={15} className="text-primary-500 mt-0.5 shrink-0" />
                <a href="tel:+919715487090" className="hover:text-white transition-colors">+91 9715487090</a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-primary-400">
                <Mail size={15} className="text-primary-500 mt-0.5 shrink-0" />
                <a href="mailto:newupdate106@gmail.com" className="hover:text-white transition-colors">newupdate106@gmail.com</a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-primary-400">
                <Instagram size={15} className="text-primary-500 mt-0.5 shrink-0" />
                <a href="https://instagram.com/rv_pets_zone" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">@rv_pets_zone</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-primary-600 text-xs">
            © {currentYear} RV Pets Zone. All rights reserved.
          </p>
          <p className="text-primary-600 text-xs flex items-center gap-1">
            Made with <Heart size={12} className="text-red-500 fill-red-500" /> in India
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
