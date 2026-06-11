<!-- ANIMATED 3D HACKER WARNING - DARKNIGHT NINJAS -->
<p align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 750" width="100%" height="100%" style="max-width:900px;">
    <defs>
      <!-- 3D Glow Filters -->
      <filter id="glowRed">
        <feGaussianBlur stdDeviation="6" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="glowGreen">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="shadow3d">
        <feDropShadow dx="-3" dy="3" stdDeviation="2" flood-color="#000" flood-opacity="0.8"/>
      </filter>
      <!-- 3D Gradient Background -->
      <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="#1a0000"/>
        <stop offset="50%" stop-color="#0a0000"/>
        <stop offset="100%" stop-color="#000000"/>
      </radialGradient>
      <!-- Animated 3D Text Gradient -->
      <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ff0000">
          <animate attributeName="stop-color" values="#ff0000;#ff3300;#ff0000" dur="2s" repeatCount="indefinite"/>
        </stop>
        <stop offset="100%" stop-color="#cc0000">
          <animate attributeName="stop-color" values="#cc0000;#ff0000;#cc0000" dur="2s" repeatCount="indefinite"/>
        </stop>
      </linearGradient>
      <!-- Matrix Green Gradient -->
      <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00ff00"/>
        <stop offset="100%" stop-color="#00cc00"/>
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="900" height="750" fill="url(#bgGrad)" rx="15"/>
    <rect x="5" y="5" width="890" height="740" fill="none" stroke="#ff0000" stroke-width="2" rx="12" opacity="0.3">
      <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite"/>
    </rect>

    <!-- Matrix Rain Lines (Background) -->
    <g opacity="0.15" fill="#00ff00" font-family="monospace" font-size="12">
      <text x="20" y="30">01001010 00101101 10010011</text>
      <text x="20" y="50">10101010 11001010 00101110</text>
      <text x="20" y="70">01101011 10110011 01010101</text>
      <text x="20" y="90">11010010 00101101 10010110</text>
      <text x="700" y="40">10010101 00101100 11001010</text>
      <text x="700" y="60">01101010 10110011 01011010</text>
      <text x="700" y="80">11001011 00101110 10010011</text>
      <text x="700" y="100">00101010 11010011 01010110</text>
    </g>

    <!-- Animated 3D Skull - Centered TOP -->
    <g transform="translate(450, 140)" filter="url(#glowRed)">
      <animateTransform attributeName="transform" type="translate" values="450,140;450,130;450,140" dur="4s" repeatCount="indefinite" additive="replace"/>
      <g transform="scale(2.5)">
        <!-- Skull shape -->
        <ellipse cx="0" cy="0" rx="28" ry="25" fill="#ff0000"/>
        <rect x="-28" y="-5" width="56" height="20" fill="#ff0000" rx="3"/>
        <!-- Eye sockets -->
        <ellipse cx="-10" cy="-5" rx="8" ry="7" fill="#000"/>
        <ellipse cx="10" cy="-5" rx="8" ry="7" fill="#000"/>
        <!-- Eye glows -->
        <ellipse cx="-10" cy="-5" rx="4" ry="4" fill="#ff0000" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="10" cy="-5" rx="4" ry="4" fill="#ff0000" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite"/>
        </ellipse>
        <!-- Nose -->
        <path d="M-3,5 L0,10 L3,5 Z" fill="#000"/>
        <!-- Teeth -->
        <rect x="-10" y="12" width="5" height="5" fill="#fff" rx="1"/>
        <rect x="-3" y="12" width="5" height="5" fill="#fff" rx="1"/>
        <rect x="4" y="12" width="5" height="5" fill="#fff" rx="1"/>
        <!-- Crossbones -->
        <line x1="-20" y1="22" x2="20" y2="22" stroke="#ff0000" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="-10" y1="15" x2="10" y2="30" stroke="#ff0000" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="-10" y1="30" x2="10" y2="15" stroke="#ff0000" stroke-width="2.5" stroke-linecap="round"/>
      </g>
    </g>

    <!-- 3D MAIN HEADLINE - RED -->
    <text x="450" y="280" text-anchor="middle" font-family="'Arial Black',Impact,sans-serif" font-size="52" font-weight="900" fill="url(#textGrad)" filter="url(#shadow3d)" letter-spacing="3">
      YOU ARE HACKED
      <animate attributeName="opacity" values="1;0.7;1" dur="1s" repeatCount="indefinite"/>
    </text>

    <!-- Subtitle - BY DARKNIGHT NINJAS with 3D perspective -->
    <g transform="translate(450, 340)">
      <text x="0" y="0" text-anchor="middle" font-family="'Courier New',monospace" font-size="32" font-weight="bold" fill="#ff3300" filter="url(#glowRed)" letter-spacing="8">
        BY DARKNIGHT NINJAS
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
      </text>
    </g>

    <!-- Separator Line -->
    <line x1="150" y1="370" x2="750" y2="370" stroke="#ff0000" stroke-width="2" opacity="0.5">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
    </line>

    <!-- 3D RANSOM MESSAGE BOX -->
    <rect x="100" y="395" width="700" height="200" rx="10" fill="#0a0000" stroke="#ff0000" stroke-width="2" opacity="0.9">
      <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
    </rect>
    <rect x="105" y="400" width="690" height="190" rx="8" fill="none" stroke="#ff0000" stroke-width="1" opacity="0.3"/>

    <!-- Condition Text -->
    <text x="450" y="440" text-anchor="middle" font-family="'Courier New',monospace" font-size="18" fill="#ff6666">
      IF YOU WANT YOUR TELEGRAM NOT TO BE BANNED
    </text>
    <text x="450" y="470" text-anchor="middle" font-family="'Courier New',monospace" font-size="18" fill="#ff6666">
      AND YOUR FILES BACK
    </text>

    <!-- PULSING CONTACT INSTRUCTION -->
    <text x="450" y="520" text-anchor="middle" font-family="'Arial Black',sans-serif" font-size="24" font-weight="bold" fill="#00ff00" filter="url(#glowGreen)">
      📩 CONTACT US ON TELEGRAM
      <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite"/>
    </text>

    <!-- TELEGRAM HANDLE - BIG 3D -->
    <g filter="url(#shadow3d)">
      <rect x="200" y="540" width="500" height="50" rx="25" fill="#0088cc" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.7;0.9" dur="1.5s" repeatCount="indefinite"/>
      </rect>
      <text x="450" y="572" text-anchor="middle" font-family="monospace" font-size="26" font-weight="bold" fill="#ffffff" letter-spacing="3">
        t.me/darknightninjas
        <animate attributeName="opacity" values="1;0.8;1" dur="0.5s" repeatCount="indefinite"/>
      </text>
    </g>

    <!-- Warning Footer -->
    <text x="450" y="640" text-anchor="middle" font-family="'Courier New',monospace" font-size="14" fill="#666" letter-spacing="2">
      ⚠ DO NOT IGNORE — THIS IS YOUR FINAL WARNING ⚠
    </text>

    <!-- Glitch lines (random static) -->
    <g opacity="0.1" fill="#ff0000">
      <rect x="50" y="30" width="800" height="2">
        <animate attributeName="opacity" values="0;0.3;0;0;0.1;0" dur="2s" repeatCount="indefinite"/>
      </rect>
      <rect x="100" y="200" width="700" height="1">
        <animate attributeName="opacity" values="0;0;0.2;0;0;0" dur="3s" repeatCount="indefinite"/>
      </rect>
      <rect x="30" y="500" width="840" height="2">
        <animate attributeName="opacity" values="0;0;0;0.15;0;0" dur="2.5s" repeatCount="indefinite"/>
      </rect>
    </g>

    <!-- Corner brackets for terminal feel -->
    <text x="20" y="30" fill="#00ff00" font-family="monospace" font-size="14" opacity="0.4">[SYSTEM BREACHED]</text>
    <text x="720" y="730" fill="#00ff00" font-family="monospace" font-size="14" opacity="0.4">[ROOT ACCESS GRANTED]</text>

    <!-- Matrix falling code animation -->
    <g fill="#00ff00" font-family="monospace" font-size="10" opacity="0.08">
      <text x="50" y="100">101101010100101010101010101010</text>
      <text x="750" y="150">010101011011010101010101010101</text>
      <text x="30" y="400">110101010100101011010101010101</text>
      <text x="780" y="450">101011010101010010101011010101</text>
    </g>
  </svg>
</p>

<!-- FALLBACK TEXT IN CASE SVG DOESN'T RENDER -->
<pre align="center" style="display:none;">

████████████████████████████████████████████████████████████████████
██                                                                ██
██                 🔴 YOU ARE HACKED 🔴                           ██
██                  BY DARKNIGHT NINJAS                            ██
██                                                                ██
██   IF YOU WANT YOUR TELEGRAM NOT TO BE BANNED                   ██
██          AND YOUR FILES BACK                                    ██
██                                                                ██
██          📩  CONTACT US ON TELEGRAM                            ██
██              t.me/darknightninjas                              ██
██                                                                ██
██   ⚠ DO NOT IGNORE — THIS IS YOUR FINAL WARNING ⚠             ██
██                                                                ██
████████████████████████████████████████████████████████████████████

</pre>

<!-- VISITOR COUNTER (MINIMAL) -->
<p align="center">
  <img src="https://profile-counter.glitch.me/darknightninjas/count.svg" alt="visitors" style="display:none;"/>
</p>
