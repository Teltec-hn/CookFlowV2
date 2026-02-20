'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function IntroAnimation({ onComplete }: { onComplete?: () => void }) {
    const [step, setStep] = useState(0);
    const [country, setCountry] = useState({ name: 'Mundo', code: 'US' });

    useEffect(() => {
        // Detect country (mock or real)
        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => setCountry({ name: data.country_name, code: data.country_code }))
            .catch(() => console.log('Using default location'));

        // Sequence
        const timers = [
            setTimeout(() => setStep(1), 100),  // Start
            setTimeout(() => setStep(2), 500),  // Rapper Bounce
            setTimeout(() => setStep(3), 1500), // Text
            setTimeout(() => setStep(4), 2500), // Flag
            setTimeout(() => {
                setStep(5);
                if (onComplete) onComplete();
            }, 4000)
        ];

        return () => timers.forEach(clearTimeout);
    }, [onComplete]);

    if (step === 5) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground transition-opacity duration-500">

            {/* Rapper Character */}
            <div
                className={`transition-all duration-700 transform ${step >= 2 ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-10'
                    }`}
            >
                <div className="w-48 h-48 bg-chef-fire rounded-full flex items-center justify-center animate-pulse-gold overflow-hidden border-4 border-mustard">
                    {/* Placeholder for Rapper Image */}
                    <span className="text-4xl">👨‍🍳🎤</span>
                </div>
            </div>

            {/* Title */}
            <h1
                className={`mt-6 text-5xl font-bold text-mustard tracking-tighter transition-all duration-700 ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                    }`}
            >
                CookFlow TV
            </h1>

            {/* Country Greeting */}
            <div
                className={`mt-4 flex items-center space-x-2 text-cream text-xl transition-all duration-700 ${step >= 4 ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                <span>Bienvenido, Chef de {country.name}</span>
                {country.code && (
                    <img
                        src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                        alt={country.name}
                        className="w-6 h-auto rounded-sm shadow-sm"
                    />
                )}
            </div>

        </div>
    );
}
