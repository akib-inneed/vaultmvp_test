'use client'

import React from 'react'

interface DandelionMarkProps {
  size?: number
  color?: string
  stemColor?: string
  animate?: boolean
  className?: string
}

export default function DandelionMark({
  size = 64,
  color = '#CF9D7B',
  stemColor = '#724B39',
  animate = true,
  className = '',
}: DandelionMarkProps) {
  return (
    <>
      <style>{`
        @keyframes heirlo-drift-a {
          0%,100% { transform: translate(0,0) rotate(0deg); opacity: 0.55; }
          50%      { transform: translate(9px,-11px) rotate(8deg); opacity: 0.2; }
        }
        @keyframes heirlo-drift-b {
          0%,100% { transform: translate(0,0) rotate(0deg); opacity: 0.45; }
          50%      { transform: translate(13px,-8px) rotate(-5deg); opacity: 0.15; }
        }
        @keyframes heirlo-drift-c {
          0%,100% { transform: translate(0,0) rotate(0deg); opacity: 0.35; }
          50%      { transform: translate(7px,-14px) rotate(12deg); opacity: 0.1; }
        }
        .heirlo-drifter-a {
          animation: ${animate ? 'heirlo-drift-a 4s ease-in-out infinite 0.5s' : 'none'};
          transform-origin: 210px 68px;
          transform-box: fill-box;
        }
        .heirlo-drifter-b {
          animation: ${animate ? 'heirlo-drift-b 5s ease-in-out infinite 1.5s' : 'none'};
          transform-origin: 215px 110px;
          transform-box: fill-box;
        }
        .heirlo-drifter-c {
          animation: ${animate ? 'heirlo-drift-c 6s ease-in-out infinite 3s' : 'none'};
          transform-origin: 222px 55px;
          transform-box: fill-box;
        }
        @media (prefers-reduced-motion: reduce) {
          .heirlo-drifter-a,
          .heirlo-drifter-b,
          .heirlo-drifter-c { animation: none; }
        }
      `}</style>

      <svg
        width={size}
        height={size}
        viewBox="0 0 280 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ overflow: 'visible' }}
        aria-label="Heirlo"
        role="img"
      >
        <defs>
          <filter id="heirlo-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge>
              <feMergeNode in="b"/>
              <feMergeNode in="b"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path d="M140 178 Q138 198 136 218" stroke={stemColor} strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M138 202 Q118 196 112 207 Q128 210 138 204" stroke={stemColor} strokeWidth="1.25" strokeLinecap="round" opacity="0.65"/>
        <path d="M137 212 Q157 206 162 217 Q148 218 137 214" stroke={stemColor} strokeWidth="1" strokeLinecap="round" opacity="0.45"/>
        <circle cx="140" cy="122" r="8" stroke={color} strokeWidth="1.75" filter="url(#heirlo-glow)"/>
        <circle cx="140" cy="122" r="4" fill={color} opacity="0.55"/>
        <line x1="140" y1="114" x2="140" y2="67" stroke={color} strokeWidth="1" opacity="0.9"/>
        <circle cx="140" cy="65" r="3" fill={color} filter="url(#heirlo-glow)"/>
        <ellipse cx="140" cy="59" rx="10" ry="3" stroke={color} strokeWidth="1.25" opacity="0.85" filter="url(#heirlo-glow)"/>
        <line x1="144" y1="115" x2="167" y2="74" stroke={color} strokeWidth="1" opacity="0.88"/>
        <circle cx="168" cy="72" r="3" fill={color} filter="url(#heirlo-glow)"/>
        <ellipse cx="172" cy="67" rx="10" ry="3" stroke={color} strokeWidth="1.25" opacity="0.8" transform="rotate(-30 172 67)" filter="url(#heirlo-glow)"/>
        <line x1="148" y1="117" x2="188" y2="94" stroke={color} strokeWidth="1" opacity="0.85"/>
        <circle cx="189" cy="93" r="3" fill={color} filter="url(#heirlo-glow)"/>
        <ellipse cx="194" cy="89" rx="10" ry="3" stroke={color} strokeWidth="1.25" opacity="0.78" transform="rotate(-60 194 89)" filter="url(#heirlo-glow)"/>
        <line x1="148" y1="122" x2="195" y2="122" stroke={color} strokeWidth="1" opacity="0.82"/>
        <circle cx="197" cy="122" r="3" fill={color}/>
        <ellipse cx="203" cy="122" rx="10" ry="3" stroke={color} strokeWidth="1.25" opacity="0.72" transform="rotate(90 203 122)"/>
        <line x1="147" y1="129" x2="187" y2="150" stroke={color} strokeWidth="1" opacity="0.78"/>
        <circle cx="188" cy="151" r="2.5" fill={color} opacity="0.85"/>
        <ellipse cx="193" cy="155" rx="9" ry="2.5" stroke={color} strokeWidth="1" opacity="0.65" transform="rotate(60 193 155)"/>
        <line x1="143" y1="130" x2="167" y2="170" stroke={color} strokeWidth="1" opacity="0.72"/>
        <circle cx="168" cy="172" r="2.5" fill={color} opacity="0.8"/>
        <ellipse cx="171" cy="177" rx="9" ry="2.5" stroke={color} strokeWidth="1" opacity="0.6" transform="rotate(30 171 177)"/>
        <line x1="137" y1="130" x2="113" y2="170" stroke={color} strokeWidth="1" opacity="0.72"/>
        <circle cx="112" cy="172" r="2.5" fill={color} opacity="0.8"/>
        <ellipse cx="109" cy="177" rx="9" ry="2.5" stroke={color} strokeWidth="1" opacity="0.6" transform="rotate(-30 109 177)"/>
        <line x1="133" y1="129" x2="93" y2="150" stroke={color} strokeWidth="1" opacity="0.78"/>
        <circle cx="92" cy="151" r="2.5" fill={color} opacity="0.85"/>
        <ellipse cx="87" cy="155" rx="9" ry="2.5" stroke={color} strokeWidth="1" opacity="0.65" transform="rotate(-60 87 155)"/>
        <line x1="132" y1="122" x2="85" y2="122" stroke={color} strokeWidth="1" opacity="0.82"/>
        <circle cx="83" cy="122" r="3" fill={color}/>
        <ellipse cx="77" cy="122" rx="10" ry="3" stroke={color} strokeWidth="1.25" opacity="0.72" transform="rotate(90 77 122)"/>
        <line x1="132" y1="117" x2="92" y2="94" stroke={color} strokeWidth="1" opacity="0.85"/>
        <circle cx="91" cy="93" r="3" fill={color} filter="url(#heirlo-glow)"/>
        <ellipse cx="86" cy="89" rx="10" ry="3" stroke={color} strokeWidth="1.25" opacity="0.78" transform="rotate(60 86 89)" filter="url(#heirlo-glow)"/>
        <line x1="136" y1="115" x2="113" y2="74" stroke={color} strokeWidth="1" opacity="0.88"/>
        <circle cx="112" cy="72" r="3" fill={color} filter="url(#heirlo-glow)"/>
        <ellipse cx="108" cy="67" rx="10" ry="3" stroke={color} strokeWidth="1.25" opacity="0.8" transform="rotate(30 108 67)" filter="url(#heirlo-glow)"/>
        <g className="heirlo-drifter-a">
          <line x1="207" y1="72" x2="213" y2="60" stroke={color} strokeWidth="0.75"/>
          <circle cx="214" cy="58" r="2" fill={color}/>
          <ellipse cx="216" cy="54" rx="7" ry="2" stroke={color} strokeWidth="0.9" transform="rotate(-25 216 54)"/>
        </g>
        <g className="heirlo-drifter-b">
          <line x1="212" y1="114" x2="220" y2="104" stroke={color} strokeWidth="0.75"/>
          <circle cx="221" cy="102" r="2" fill={color}/>
          <ellipse cx="224" cy="99" rx="7" ry="2" stroke={color} strokeWidth="0.9" transform="rotate(-10 224 99)"/>
        </g>
        <g className="heirlo-drifter-c">
          <line x1="219" y1="59" x2="226" y2="47" stroke={color} strokeWidth="0.6"/>
          <circle cx="227" cy="45" r="1.75" fill={color}/>
          <ellipse cx="229" cy="42" rx="6" ry="1.75" stroke={color} strokeWidth="0.75" transform="rotate(-30 229 42)"/>
        </g>
      </svg>
    </>
  )
}
