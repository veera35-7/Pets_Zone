import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Shield, ArrowRight, Loader2, Home, Landmark, User, DollarSign, MapPin } from 'lucide-react';
import api from '../lib/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PetCard from '../components/PetCard';

const RecommendationPage = () => {
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState('');
  const [space, setSpace] = useState('');
  const [experience, setExperience] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => Math.max(1, s - 1));

  const runRecommendationEngine = async () => {
    setLoading(true);
    setStep(5); // Move to results step loading
    try {
      const { data } = await api.get('/pets/recommendations', {
        params: {
          budget,
          space,
          experience,
          city: city || undefined
        }
      });

      setResults(data.results || []);
    } catch (err) {
      console.error('Failed to run matchmaker scoring:', err);
    } finally {
      setLoading(false);
    }
  };

  const restartWizard = () => {
    setStep(1);
    setBudget('');
    setSpace('');
    setExperience('');
    setCity('');
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-primary-950 flex flex-col justify-between">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-20 page-container flex items-center justify-center">
        <div className="w-full max-w-2xl bg-primary-900/40 border border-primary-800 rounded-3xl p-8 md:p-12 shadow-luxury relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none" />

          <AnimatePresence mode="wait">
            {step === 1 && (
              /* STEP 1: Budget */
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 text-accent-gold text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={14} /> Step 1 of 4: Budget
                </div>
                <h2 className="text-3xl font-black text-primary-50">What is your ideal budget?</h2>
                <p className="text-primary-400 text-sm">Help us narrow down pet listings within your price expectation.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  {[
                    { value: 'low', label: 'Economy', desc: 'Under ₹2,000', icon: DollarSign },
                    { value: 'medium', label: 'Standard', desc: '₹2,000 - ₹8,000', icon: Landmark },
                    { value: 'high', label: 'Premium', desc: 'Above ₹8,000', icon: Sparkles }
                  ].map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setBudget(opt.value)}
                        className={`p-6 rounded-2xl border text-left transition-all duration-200 ${
                          budget === opt.value
                            ? 'bg-accent-gold/10 border-accent-gold text-primary-50'
                            : 'bg-primary-900 border-primary-800 text-primary-400 hover:border-primary-650'
                        }`}
                      >
                        <Icon size={20} className="text-accent-gold mb-4" />
                        <div className="font-bold text-primary-100">{opt.label}</div>
                        <div className="text-xs text-primary-500 mt-1">{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-6">
                  <button
                    onClick={handleNext}
                    disabled={!budget}
                    className="btn-primary flex items-center gap-1.5 disabled:opacity-50"
                  >
                    Next <ArrowRight size={15} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              /* STEP 2: Space */
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 text-accent-gold text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={14} /> Step 2 of 4: Outdoor/Home Space
                </div>
                <h2 className="text-3xl font-black text-primary-50">Where will the pet live?</h2>
                <p className="text-primary-400 text-sm">Matching listings to your home size ensures the pet is happy and healthy.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  {[
                    { value: 'apartment', label: 'Apartment', desc: 'Cozy indoor spaces', icon: Home },
                    { value: 'house', label: 'House / Yard', desc: 'Yard or backyard space', icon: Home },
                    { value: 'farm', label: 'Farm / Acreage', desc: 'Wide open fields', icon: Landmark }
                  ].map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setSpace(opt.value)}
                        className={`p-6 rounded-2xl border text-left transition-all duration-200 ${
                          space === opt.value
                            ? 'bg-accent-gold/10 border-accent-gold text-primary-50'
                            : 'bg-primary-900 border-primary-800 text-primary-400 hover:border-primary-650'
                        }`}
                      >
                        <Icon size={20} className="text-accent-gold mb-4" />
                        <div className="font-bold text-primary-100">{opt.label}</div>
                        <div className="text-xs text-primary-500 mt-1">{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-6">
                  <button onClick={handlePrev} className="btn-outline flex items-center gap-1.5">
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!space}
                    className="btn-primary flex items-center gap-1.5 disabled:opacity-50"
                  >
                    Next <ArrowRight size={15} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              /* STEP 3: Experience */
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 text-accent-gold text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={14} /> Step 3 of 4: Experience
                </div>
                <h2 className="text-3xl font-black text-primary-50">Your pet care experience?</h2>
                <p className="text-primary-400 text-sm">Matches easy-to-care breeds for beginners vs farm setups for experts.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  {[
                    { value: 'beginner', label: 'Beginner', desc: 'First-time pet owner', icon: User },
                    { value: 'intermediate', label: 'Intermediate', desc: 'Owned pets before', icon: User },
                    { value: 'expert', label: 'Expert', desc: 'Experienced in breeding/farming', icon: Shield }
                  ].map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setExperience(opt.value)}
                        className={`p-6 rounded-2xl border text-left transition-all duration-200 ${
                          experience === opt.value
                            ? 'bg-accent-gold/10 border-accent-gold text-primary-50'
                            : 'bg-primary-900 border-primary-800 text-primary-400 hover:border-primary-650'
                        }`}
                      >
                        <Icon size={20} className="text-accent-gold mb-4" />
                        <div className="font-bold text-primary-100">{opt.label}</div>
                        <div className="text-xs text-primary-500 mt-1">{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-6">
                  <button onClick={handlePrev} className="btn-outline flex items-center gap-1.5">
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!experience}
                    className="btn-primary flex items-center gap-1.5 disabled:opacity-50"
                  >
                    Next <ArrowRight size={15} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              /* STEP 4: Location */
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 text-accent-gold text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={14} /> Step 4 of 4: Location
                </div>
                <h2 className="text-3xl font-black text-primary-50">What is your location?</h2>
                <p className="text-primary-400 text-sm">Enter your city to locate matching companion breeders nearby.</p>

                <div className="relative pt-4 max-w-md">
                  <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500" />
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="input pl-10 h-12 w-full"
                    placeholder="Enter city (e.g. Chennai, Bangalore, Mumbai)"
                  />
                </div>

                <div className="flex justify-between pt-6">
                  <button onClick={handlePrev} className="btn-outline flex items-center gap-1.5">
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button
                    onClick={runRecommendationEngine}
                    className="btn-primary flex items-center gap-1.5"
                  >
                    Find Recommendations <Sparkles size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              /* Results & Matches */
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-accent-gold text-xs font-bold uppercase tracking-wider">
                    <Sparkles size={14} /> Smart AI Recommendations
                  </div>
                  <button
                    onClick={restartWizard}
                    className="text-xs text-primary-400 hover:text-accent-gold font-semibold transition-colors"
                  >
                    Restart Quiz
                  </button>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 size={36} className="text-accent-gold animate-spin" />
                    <span className="text-primary-400 text-sm">Evaluating local rules matching your profile...</span>
                  </div>
                ) : results.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-5xl mb-4">😿</div>
                    <h3 className="text-xl font-bold text-primary-200">No matching pets found</h3>
                    <p className="text-primary-500 text-sm mt-1 max-w-sm mx-auto">
                      We couldn't find listings matching your exact filters. Try relaxing your budget or space parameters!
                    </p>
                    <button onClick={restartWizard} className="btn-outline mt-6">Try Again</button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black text-primary-50">
                      We found {results.length} perfect matches! 🎉
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {results.map((pet) => (
                        <div key={pet._id} className="relative group rounded-2xl overflow-hidden border border-primary-800 bg-primary-950/60 p-4 hover:border-accent-gold/40 transition-colors flex flex-col justify-between gap-3">
                          <div className="flex gap-4">
                            <img
                              src={pet.images?.[0]?.url || 'https://placehold.co/100'}
                              alt={pet.petName}
                              className="w-20 h-20 rounded-xl object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start">
                                  <h4 className="text-sm font-bold text-primary-100 truncate">{pet.petName}</h4>
                                  <span className="text-[10px] bg-accent-gold/20 text-accent-gold font-black px-1.5 py-0.5 rounded shrink-0 ml-1">
                                    Score: {pet.score}
                                  </span>
                                </div>
                                <p className="text-[11px] text-primary-400 truncate">{pet.breed} • {pet.petType}</p>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-accent-gold font-black text-sm">₹{Number(pet.price).toLocaleString('en-IN')}</span>
                                <Link to={`/pet/${pet._id}`} className="text-[10px] text-primary-300 hover:text-white underline font-semibold">
                                  View Details →
                                </Link>
                              </div>
                            </div>
                          </div>
                          {pet.matchDetails && pet.matchDetails.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-2 border-t border-primary-800/40">
                              {pet.matchDetails.map((detail, idx) => (
                                <span key={idx} className="text-[9px] bg-primary-900 text-primary-300 px-2 py-0.5 rounded-full font-medium">
                                  ✨ {detail}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RecommendationPage;
