'use client';

import React from 'react';
import { LocaleProvider } from '../components/LocaleContext';
import ImpactDashboard from '../components/ImpactDashboard';

export default function Home() {
  return (
    <LocaleProvider>
      <main className="min-h-screen bg-charcoal-dark">
        <ImpactDashboard />
      </main>
    </LocaleProvider>
  );
}
