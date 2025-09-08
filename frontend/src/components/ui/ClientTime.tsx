'use client';

import { useState, useEffect } from 'react';

interface ClientTimeProps {
  format?: Intl.DateTimeFormatOptions;
  className?: string;
}

export default function ClientTime({ format, className }: ClientTimeProps) {
  const [time, setTime] = useState<string>('--:--:--');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', format || {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [format]);

  if (!mounted) {
    return <span className={className}>--:--:--</span>;
  }

  return <span className={className}>{time}</span>;
}
