'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef } from 'react';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/');

  function handleCameraChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      sessionStorage.setItem('vault_pending_image', base64);
      router.push('/items/new');
    };
    reader.readAsDataURL(file);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-cream/95 backdrop-blur-md safe-area-pb">
      <div className="max-w-lg mx-auto flex items-end justify-around px-2 pt-2 pb-2">

        {/* Home */}
        <Link href="/dashboard" className={`flex flex-col items-center gap-1 px-3 pb-0.5 transition ${isActive('/dashboard') ? 'text-teal' : 'text-ink/30 hover:text-ink/60'}`}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M2 9.5L11 2L20 9.5V20a1 1 0 01-1 1H14v-5H8v5H3a1 1 0 01-1-1V9.5z"
              stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
              fill={isActive('/dashboard') ? 'currentColor' : 'none'} fillOpacity="0.12"
            />
          </svg>
          <span className="text-[10px] font-sans font-medium tracking-wide">Home</span>
        </Link>

        {/* Assigned */}
        <Link href="/assigned" className={`flex flex-col items-center gap-1 px-3 pb-0.5 transition ${isActive('/assigned') ? 'text-teal' : 'text-ink/30 hover:text-ink/60'}`}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5"
              fill={isActive('/assigned') ? 'currentColor' : 'none'} fillOpacity="0.10"
            />
            <path d="M7 11l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[10px] font-sans font-medium tracking-wide">Assigned</span>
        </Link>

        {/* Add Item — center CTA */}
        <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center text-ink/30 pb-0.5">
          <div className="-mt-6 mb-1 w-14 h-14 rounded-full bg-teal flex items-center justify-center shadow-lg shadow-brass/30 hover:bg-teal/90 transition">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 4v14M4 11h14" stroke="#0C1519" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-[10px] font-sans font-medium tracking-wide">Add item</span>
        </button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleCameraChange}
        />

        {/* Vaults */}
        <Link href="/vaults" className={`flex flex-col items-center gap-1 px-3 pb-0.5 transition ${isActive('/vaults') ? 'text-teal' : 'text-ink/30 hover:text-ink/60'}`}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="2" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6 6V4a2 2 0 012-2h6a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="11" cy="13" r="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 15v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-[10px] font-sans font-medium tracking-wide">Vaults</span>
        </Link>

        {/* Settings */}
        <Link href="/settings" className={`flex flex-col items-center gap-1 px-3 pb-0.5 transition ${isActive('/settings') ? 'text-teal' : 'text-ink/30 hover:text-ink/60'}`}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 2v2M11 18v2M2 11h2M18 11h2M4.22 4.22l1.42 1.42M16.36 16.36l1.42 1.42M4.22 17.78l1.42-1.42M16.36 5.64l1.42-1.42"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-[10px] font-sans font-medium tracking-wide">Settings</span>
        </Link>

      </div>
      <p className="text-center font-sans text-ink/25 tracking-wider pt-1 pb-2" style={{ fontSize: '9px', letterSpacing: '0.08em' }}>
        Heirlo is not a law firm · Not legal advice · Document of intent only
      </p>
    </nav>
  );
}
