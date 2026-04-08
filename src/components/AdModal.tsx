import React, { useState, useEffect } from 'react';
import { X, PlayCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: () => void;
}

const AD_LINKS = [
  'https://www.profitablecpmratenetwork.com/aprr50fa68?key=f1cbd9edf1dd1107620b5c89444c68b5',
  'https://www.profitablecpmratenetwork.com/fppqz28us5?key=9814bc7ec14a3154fbde0a9f5194efe0',
  'https://www.profitablecpmratenetwork.com/t0txuqaf8?key=172c9992860891cd5beaf257cfb938f8',
  'https://www.profitablecpmratenetwork.com/nn98c476?key=0b0cdb93e540626b8a2a0f46638fb230'
];

const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalVariants = {
  initial: { scale: 0.9, opacity: 0, y: 20 },
  animate: { scale: 1, opacity: 1, y: 0 },
  exit: { scale: 0.9, opacity: 0, y: 20 }
};

const contentVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 }
};

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 }
};

export function AdModal({ isOpen, onClose, onReward }: AdModalProps) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentAdUrl, setCurrentAdUrl] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(30);
      setIsPlaying(false);
      setIsFinished(false);
      return;
    }

    let timer: number;
    if (isPlaying && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isFinished) {
      setIsFinished(true);
      onReward();
    }

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, timeLeft, isFinished, onReward]);

  useEffect(() => {
    let adTimer: number;
    if (isPlaying && !isFinished) {
      adTimer = window.setInterval(() => {
        const randomLink = AD_LINKS[Math.floor(Math.random() * AD_LINKS.length)];
        setCurrentAdUrl(randomLink);
      }, 10000); // Change ad every 10 seconds
    }
    return () => clearInterval(adTimer);
  }, [isPlaying, isFinished]);

  const handlePlayAd = () => {
    // Pick a random ad link from the provided list
    const randomLink = AD_LINKS[Math.floor(Math.random() * AD_LINKS.length)];
    setCurrentAdUrl(randomLink);
    setIsPlaying(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          variants={backdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div 
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">Get More Storage</h3>
              {(!isPlaying || isFinished) && (
                <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col items-center text-center overflow-y-auto">
              {!isPlaying && !isFinished ? (
                <motion.div 
                  variants={contentVariants}
                  initial="initial"
                  animate="animate"
                  className="w-full flex flex-col items-center"
                >
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 shrink-0">
                    <PlayCircle className="w-10 h-10 text-blue-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Watch an Ad for 2 GB</h4>
                  <p className="text-gray-600 mb-6">
                    Watch a short 30-second sponsored video to permanently add 2 GB of storage to your NOVA Drive.
                  </p>
                  <button 
                    onClick={handlePlayAd}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Watch Ad Now
                  </button>
                </motion.div>
              ) : isPlaying && !isFinished ? (
                <motion.div 
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  className="w-full flex flex-col items-center"
                >
                  <div className="w-full aspect-video bg-gray-100 rounded-lg mb-6 flex items-center justify-center relative overflow-hidden shrink-0 border border-gray-200">
                    {/* Real Ad Content via iframe */}
                    <iframe 
                      src={currentAdUrl} 
                      className="absolute inset-0 w-full h-full border-0"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                      title="Sponsored Ad"
                    />
                    
                    {/* Timer overlay */}
                    <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-md z-10">
                      {timeLeft}s
                    </div>
                  </div>
                  <p className="text-gray-600 font-medium">Please wait until the timer finishes...</p>
                </motion.div>
              ) : (
                <motion.div 
                  variants={modalVariants}
                  initial="initial"
                  animate="animate"
                  className="w-full flex flex-col items-center"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 shrink-0">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Storage Expanded!</h4>
                  <p className="text-gray-600 mb-6">
                    You have successfully earned 2 GB of additional storage.
                  </p>
                  <button 
                    onClick={onClose}
                    className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-medium transition-colors"
                  >
                    Continue
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
