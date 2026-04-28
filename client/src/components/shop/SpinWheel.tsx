import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

const segments = [
  { label: '10% OFF', color: '#8B5E3C' },
  { label: 'No luck', color: '#D2B48C' },
  { label: '5% OFF', color: '#8B5E3C' },
  { label: 'Free shipping', color: '#D2B48C' },
  { label: 'Sorry...', color: '#8B5E3C' },
  { label: '15% OFF', color: '#D2B48C' },
  { label: 'Almost', color: '#8B5E3C' },
  { label: 'Try again', color: '#D2B48C' },
];

export function SpinWheel() {
  const { toast } = useToast();
  const setDiscount = useCart(state => state.setDiscount);
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    const hasSeenWheel = localStorage.getItem('hasSeenSpinWheel');
    if (!hasSeenWheel) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000); // Show after 3 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenSpinWheel', 'true');
  };

  const spin = () => {
    if (isSpinning || !email || !phone) return;
    
    setIsSpinning(true);
    const newRotation = rotation + 1800 + Math.random() * 360; // Spin at least 5 times
    setRotation(newRotation);

    setTimeout(async () => {
      setIsSpinning(false);
      const actualRotation = newRotation % 360;
      const segmentIndex = Math.floor((360 - (actualRotation % 360)) / (360 / segments.length)) % segments.length;
      const prizeLabel = segments[segmentIndex].label;
      setResult(prizeLabel);

      // Apply discount automatically if it's a percentage
      if (prizeLabel.includes('% OFF')) {
        const discountValue = parseInt(prizeLabel.split('%')[0]);
        setDiscount(discountValue);
        toast({
          title: "Congratulations!",
          description: `A ${discountValue}% discount has been automatically applied to your cart.`,
        });
      }

      // Save lead to database
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, phone, prize: prizeLabel })
        });
      } catch (error) {
        console.error('Failed to save lead:', error);
      }
    }, 5000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-[#FDF5E6] rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center p-8 pt-12"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-primary/40 hover:text-primary transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Wheel Container */}
            <div className="relative w-64 h-64 mb-8">
              <motion.div
                animate={{ rotate: rotation }}
                transition={{ duration: 5, ease: [0.1, 0, 0.1, 1] }}
                className="w-full h-full rounded-full border-8 border-white shadow-lg overflow-hidden relative"
                style={{ background: 'conic-gradient(from 0deg, ' + segments.map((s, i) => `${s.color} ${i * (360/segments.length)}deg ${(i+1) * (360/segments.length)}deg`).join(', ') + ')' }}
              >
                {segments.map((s, i) => (
                  <div
                    key={i}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1/2 origin-bottom flex flex-col items-center pt-2"
                    style={{ transform: `rotate(${i * (360/segments.length) + (180/segments.length)}deg)` }}
                  >
                    <span className="text-[8px] font-bold text-white uppercase transform rotate-180" style={{ writingMode: 'vertical-rl' }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </motion.div>
              
              {/* Pointer */}
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[12px] border-r-primary -translate-x-1" />
                </div>
              </div>

              {/* Center Pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg z-20 border-4 border-[#8B5E3C]" />
            </div>

            <div className="text-center space-y-4 w-full">
              <h2 className="text-3xl font-serif text-[#8B5E3C] font-bold uppercase tracking-widest">Spin to win</h2>
              <p className="text-[#8B5E3C]/80 text-sm">Enter your email for the chance to win a discount.</p>

              {!result ? (
                <div className="space-y-4 pt-4">
                  <Input 
                    placeholder="Email address" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="bg-white/50 border-[#8B5E3C]/20 focus:ring-[#8B5E3C] h-12 rounded-xl"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-[#8B5E3C]/60 border-e border-[#8B5E3C]/20 pe-2">
                      <span className="text-sm">🇪🇬</span> +20
                    </span>
                    <Input 
                      placeholder="Phone number" 
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="bg-white/50 border-[#8B5E3C]/20 focus:ring-[#8B5E3C] h-12 rounded-xl ps-16"
                    />
                  </div>
                  <Button 
                    onClick={spin}
                    disabled={isSpinning || !email || !phone}
                    className="w-full h-14 bg-[#8B5E3C] hover:bg-[#6D472D] text-white rounded-xl font-serif text-lg uppercase tracking-widest shadow-xl"
                  >
                    {isSpinning ? 'Spinning...' : 'Try your luck'}
                  </Button>
                  <button onClick={handleClose} className="text-xs text-[#8B5E3C]/60 hover:text-[#8B5E3C] transition-colors">
                    No, I don't feel lucky
                  </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-6 space-y-4"
                >
                  <p className="text-xl font-serif text-[#8B5E3C]">Result:</p>
                  <div className="text-4xl font-serif font-bold text-[#8B5E3C] uppercase tracking-tighter">
                    {result}
                  </div>
                  <Button 
                    onClick={handleClose}
                    className="w-full h-14 bg-[#8B5E3C] text-white rounded-xl font-serif text-lg uppercase tracking-widest"
                  >
                    Continue
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
