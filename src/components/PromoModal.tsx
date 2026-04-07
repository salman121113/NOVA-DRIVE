import React, { useState } from 'react';
import { X, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCode: (code: string) => Promise<{ success: boolean; message: string }>;
}

export function PromoModal({ isOpen, onClose, onApplyCode }: PromoModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setIsApplying(true);
    const result = await onApplyCode(code);
    setIsApplying(false);

    if (result.success) {
      setSuccess(true);
      setSuccessMessage(result.message);
      setError('');
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setCode('');
      }, 3000);
    } else {
      setError(result.message);
    }
  };

  return (
    <animatepresence>
      {isOpen && (
        <motion.div initial="{{" opacity:="" 0="" }}="" animate="{{" opacity:="" 1="" }}="" exit="{{" opacity:="" 0="" }}="" classname="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial="{{" scale:="" 0.9,="" opacity:="" 0,="" y:="" 20="" }}="" animate="{{" scale:="" 1,="" opacity:="" 1,="" y:="" 0="" }}="" exit="{{" scale:="" 0.9,="" opacity:="" 0,="" y:="" 20="" }}="" transition="{{" type:="" "spring",="" damping:="" 25,="" stiffness:="" 300="" }}="" classname="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative">
            <div classname="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 classname="text-lg font-semibold text-gray-900">Premium Promo Code</h3>
              <button onclick="{onClose}" classname="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <x classname="w-5 h-5"/>
              </button>
            </div>
            <div classname="p-6">
              {success ? (
                <motion.div initial="{{" opacity:="" 0,="" scale:="" 0.8="" }}="" animate="{{" opacity:="" 1,="" scale:="" 1="" }}="" classname="text-center py-4">
                  <div classname="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <gift classname="w-8 h-8 text-green-600"/>
                  </div>
                  <h4 classname="text-xl font-bold text-gray-900 mb-2">Congratulations!</h4>
                  <p classname="text-green-600 font-medium">{successMessage}</p>
                </motion.div>
              ) : (
                <form onsubmit="{handleSubmit}">
                  <p classname="text-gray-600 mb-4 text-sm">Enter your promo code to unlock premium storage.</p>
                  <input type="text" value="{code}" onchange="{(e)" ==""> setCode(e.target.value)}
                    placeholder="Enter code here"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all mb-2 uppercase"
                    disabled={isApplying}
                  />
                  {error && <p classname="text-red-500 text-sm mb-4">{error}</p>}
                  <button type="submit" disabled="{isApplying}" classname="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors mt-4 disabled:opacity-70">
                    {isApplying ? 'Applying...' : 'Apply Code'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

