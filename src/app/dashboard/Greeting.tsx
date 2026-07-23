'use client';

import { useState, useEffect } from 'react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function Greeting({ firstName }: { firstName: string }) {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  if (!greeting) return null;

  return (
    <>
      {greeting},<br className="sm:hidden" /> {firstName}
    </>
  );
}
