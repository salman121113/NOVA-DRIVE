import React, { useState, useEffect } from 'react';

const AD_LINKS = [
  'https://www.profitablecpmratenetwork.com/aprr50fa68?key=f1cbd9edf1dd1107620b5c89444c68b5',
  'https://www.profitablecpmratenetwork.com/fppqz28us5?key=9814bc7ec14a3154fbde0a9f5194efe0',
  'https://www.profitablecpmratenetwork.com/t0txuqaf8?key=172c9992860891cd5beaf257cfb938f8',
  'https://www.profitablecpmratenetwork.com/nn98c476?key=0b0cdb93e540626b8a2a0f46638fb230'
];

export function BannerAd() {
  const [adIndex, setAdIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % AD_LINKS.length);
    }, 15000); // Change ad every 15 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-14 bg-gray-100 border-b border-gray-200 overflow-hidden shrink-0 relative flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">Advertisement</div>
      <iframe 
        src={AD_LINKS[adIndex]} 
        className="relative z-10 w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        title="Banner Ad"
      />
    </div>
  );
}

