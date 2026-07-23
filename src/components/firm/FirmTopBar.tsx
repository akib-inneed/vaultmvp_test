import type { FC } from 'react';

interface FirmTopBarProps {
  firmName: string;
  firmEmail: string;
}

export const FirmTopBar: FC<FirmTopBarProps> = ({ firmName, firmEmail }) => (
  <div className="bg-[var(--fw-ink)] px-6 py-4 flex items-center justify-between xl:px-8 xl:py-5">
    {/* Brand */}
    <div className="flex items-center gap-3">
      <div className="w-[30px] h-[30px] rounded-full bg-[var(--fw-coffee)] flex items-center justify-center">
        <span className="font-['Fraunces',serif] font-black text-[var(--fw-brass)] text-base">H</span>
      </div>
      <div>
        <div className="font-['Fraunces',serif] font-black text-[var(--fw-brass)] text-base tracking-[0.04em] leading-none">
          Heirlo
        </div>
        <div className="text-[9px] tracking-[0.16em] uppercase text-[#CF9D7B]/50 mt-0.5">
          For Firms
        </div>
      </div>
    </div>

    {/* Firm identity */}
    <div className="text-right">
      <div className="text-[12.5px] text-[var(--fw-linen)] font-medium">
        {firmName}
      </div>
      <div className="text-[10.5px] text-[#EDE5DB]/50">
        {firmEmail}
      </div>
    </div>
  </div>
);
