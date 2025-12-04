import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- API UTILITIES (For Gemini LLM Feature) ---
// NOTE: Since you provided your key locally, I'm using the placeholder again here.
// When you copy this code back to VS Code, you must replace the "" with your key
// to test locally.


const exponentialBackoff = async (fn, maxRetries = 5, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
    }
};

const fetchWithRetry = async (url, options) => {
    const fn = async () => {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`API Error: ${response.status} - ${errorBody.error?.message || 'Unknown error'}`);
        }
        return response.json();
    };
    return exponentialBackoff(fn);
};

// --- STYLING (The CSS is defined here using template literals for a single-file build) ---

const styles = {
  global: `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Dancing+Script:wght@400;700&display=swap');
    
    :root {
      --color-primary: #a3386e; /* Deep Rose */
      --color-secondary: #f0f4f8; /* Soft Off-White */
      --color-accent: #ffb8c0; /* Light Pink */
      --color-text: #3c3c3c;
      --font-main: 'Playfair Display', serif;
      --font-script: 'Dancing Script', cursive;
      --color-shadow: rgba(163, 56, 110, 0.2);
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: var(--font-main);
      color: var(--color-text);
      background-color: var(--color-secondary);
      line-height: 1.6;
      
    //   /* --- CUSTOM RIBBON CURSOR --- */
    //   /* Base64 encoded SVG for a solid rose-colored ribbon/bow (24x24 px, hot-spot 12 12) */
    //   cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2EzMzg2ZSI+PHBhdGggZD0iTTEyIDEuOTlDNy4wMyAxLjk5IDMgNi4wMiAzIDExYzAgMy4wOSAxLjU4IDUuODYgNCA3LjQyVjIybDUtMiA1IDJ2LTMuNThjMi40Mi0xLjU2IDQtNC4zMyA0LTcuNDIgMC00Ljk4LTQuMDMtOS4wMS05LTkuMDF6bS0zLjEzIDYuNGMwLS43NS42MS0xLjM2IDEuMzYtMS4zNmgzLjU0Yy43NSAwIDEuMzYuNjEgMS4zNiAxLjM2di40N2gtNi4yNnYtLjQ3em02LjI2IDMuMTJjMCAxLjEtLjkgMi0yIDJoLTIuMjZjLTEuMSAwLTItLjktMi0yVjkuOTloNi4yNnYyLjUyeiIvPjwvc3ZnPg==") 12 12, auto;
    // }
    
    /* Ensure interactive elements still use the standard pointer for UX */
    button, a, .polaroid-frame, .modal-button, .modal-close-button, .dot, .gemini-button {
      cursor: pointer !important;
    }


    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Dancing+Script:wght@400;700&display=swap');
    
    :root {
      --color-primary: #a3386e; /* Deep Rose */
      --color-secondary: #f0f4f8; /* Soft Off-White */
      --color-accent: #ffb8c0; /* Light Pink */
      --color-text: #3c3c3c;
      --font-main: 'Playfair Display', serif;
      --font-script: 'Dancing Script', cursive;
      --color-shadow: rgba(163, 56, 110, 0.2);
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: var(--font-main);
      color: var(--color-text);
      background-color: var(--color-secondary);
      line-height: 1.6;
    }
    
    /* Subtle Pulse Animation (used for titles/buttons) */
    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.02); opacity: 1; }
      100% { transform: scale(1); opacity: 0.9; }
    }
    
    /* --- FLOATING HEART ANIMATION (for personalization) --- */
    /* Heart shape using pseudo-elements */
    .heart {
        position: absolute;
        width: 15px;
        height: 15px;
        background: var(--color-accent);
        transform: rotate(-45deg);
        opacity: 0;
        /* Using multiple classes to stagger the animation delays */
    }
    .heart:before, .heart:after {
        content: "";
        position: absolute;
        width: 15px;
        height: 15px;
        background: var(--color-accent);
        border-radius: 50%;
    }
    .heart:before {
        top: -50%;
        left: 0;
    }
    .heart:after {
        left: 50%;
        top: 0;
    }

    /* Animation for Floating */
    @keyframes floatUp {
        0% { transform: translateY(100vh) scale(0.5) rotate(-45deg); opacity: 0; }
        10% { opacity: 0.7; }
        90% { opacity: 0.7; }
        100% { transform: translateY(-50vh) scale(1) rotate(-45deg); opacity: 0; }
    }
    
    .heart-float {
        animation: floatUp 15s infinite ease-in-out;
    }

    /* Staggered delays for a natural look */
    .heart-delay-1 { animation-delay: 0s; }
    .heart-delay-2 { animation-delay: 3s; }
    .heart-delay-3 { animation-delay: 6s; }
    .heart-delay-4 { animation-delay: 9s; }
    .heart-delay-5 { animation-delay: 12s; }
    /* --- END HEART ANIMATION --- */


    /* Timer Lock Styling */
    .timer-lock-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 46px); /* Adjusted for footer height */
        width: 100vw; 
        text-align: center;
        background: linear-gradient(135deg, var(--color-primary) 0%, #d4598d 50%, var(--color-accent) 100%); 
        color: white;
        padding: 2rem;
        position: relative; /* For heart particles */
    }

    .timer-title {
        font-family: var(--font-script);
        font-size: 3.5rem; 
        margin-bottom: 2rem;
        animation: pulse 2s infinite;
        text-shadow: 2px 2px 6px rgba(0,0,0,0.3);
        z-index: 2;
    }

    .countdown-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.5rem;
        margin-bottom: 3rem;
        max-width: 550px;
        width: 100%;
        z-index: 2;
    }

    .countdown-unit {
        background-color: rgba(255, 255, 255, 0.3); 
        backdrop-filter: blur(5px);
        padding: 1rem 0.5rem;
        border-radius: 12px;
        font-family: monospace;
        box-shadow: 0 6px 15px rgba(0,0,0,0.3), inset 0 0 10px rgba(255,255,255,0.5); 
        text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }

    .countdown-number {
        font-size: 4rem; 
        font-weight: 700;
        line-height: 1;
    }

    .countdown-label {
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-top: 0.5rem;
        font-weight: 700;
    }

    /* Standard App Styling below */
    .photo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
        gap: 1.5rem; 
        padding: 2rem;
        background-color: #e5e9ee; 
        border-radius: 12px;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.05);
    }
    
    .polaroid-frame {
        background: white;
        padding: 10px 10px 30px 10px; 
        box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        border: 1px solid #ddd;
        transition: transform 0.4s ease, box-shadow 0.4s ease;
        position: relative;
        cursor: pointer;
        
        /* Random Rotations for the Pinterest look */
        &:nth-child(3n + 1) { transform: rotate(-3deg); }
        &:nth-child(3n + 2) { transform: rotate(2deg); }
        &:nth-child(3n) { transform: rotate(-1deg); }
        
        &:hover {
            transform: scale(1.05) rotate(0deg); 
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10;
        }
    }
    
    .polaroid-img {
        width: 100%;
        height: 180px; 
        object-fit: cover;
        display: block;
        background-color: #ccc;
    }
    
    .polaroid-caption {
        text-align: center;
        margin-top: 10px;
        font-family: var(--font-script);
        font-size: 1.2rem;
        color: var(--color-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .gemini-input-box {
        background-color: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        margin-bottom: 2rem; 
    }

    .gemini-textarea {
        width: 100%;
        padding: 1rem;
        border: 2px solid var(--color-accent);
        border-radius: 8px;
        font-family: var(--font-main);
        font-size: 1rem;
        margin-bottom: 1rem;
        resize: vertical;
        min-height: 80px;
    }

    .gemini-button {
        background-color: var(--color-primary);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        font-family: var(--font-main);
        font-weight: 700;
        border-radius: 25px;
        cursor: pointer;
        transition: background-color 0.3s, transform 0.2s, box-shadow 0.3s;
        box-shadow: 0 5px 10px var(--color-shadow);
    }
    
    .gemini-button:hover {
        background-color: #8c2a58; 
        transform: translateY(-2px);
    }

    .gemini-output-box {
        border: 2px dashed var(--color-accent);
        padding: 2rem;
        border-radius: 12px;
        min-height: 100px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-script);
        font-size: 1.25rem; 
        color: var(--color-primary);
        line-height: 1.4;
    }
    
    /* --- MODAL/LIGHTBOX STYLES --- */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        padding: 20px;
    }

    .modal-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .modal-image {
        max-width: 100%;
        max-height: 70vh;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 0 40px rgba(255, 255, 255, 0.2);
        transition: opacity 0.5s ease-in-out; /* Add transition for image swap */
    }

    .modal-caption {
        color: white;
        font-family: var(--font-script);
        font-size: 2rem;
        margin-top: 15px;
        text-align: center;
        max-width: 100%;
        padding: 0 40px;
    }
    
    .modal-button {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        font-size: 2rem;
        padding: 10px 15px;
        cursor: pointer;
        border-radius: 50%;
        transition: background-color 0.3s;
        width: 50px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0.8;
    }
    
    .modal-button:hover {
        background: rgba(255, 255, 255, 0.4);
        opacity: 1;
    }

    .modal-close-button {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        color: white;
        border: 2px solid white;
        font-size: 1.5rem;
        padding: 5px 10px;
        cursor: pointer;
        border-radius: 50%;
        transition: transform 0.2s;
        z-index: 1001;
    }
    
    .modal-close-button:hover {
        transform: scale(1.1) rotate(90deg);
    }
    
    .modal-prev { left: 10px; }
    .modal-next { right: 10px; }
    
    /* --- CAROUSEL STYLES --- */
    .carousel-container {
        position: relative;
        width: 100%;
        overflow: hidden;
    }

    .carousel-image {
        width: 100%;
        height: 250px; 
        object-fit: cover;
        display: block;
        border-bottom: 1px solid #eee;
        transition: opacity 0.8s ease-in-out; /* Smooth fade effect */
    }

    .carousel-dots {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 8px;
        z-index: 10;
    }

    .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        transition: background-color 0.3s, transform 0.3s;
    }

    .dot.active {
        background-color: var(--color-primary);
        transform: scale(1.2);
        box-shadow: 0 0 5px rgba(0,0,0,0.5);
    }


  `,

  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
  },

  header: {
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    padding: '1rem 0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    zIndex: 10,
  },
  
  nav: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    maxWidth: '1200px',
    margin: '0 auto',
    gap: '0.5rem 1rem',
  },

  navButton: {
    backgroundColor: 'transparent',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontSize: '1rem',
    fontFamily: 'var(--font-main)',
    fontWeight: '700',
    transition: 'all 0.3s ease',
    borderRadius: '8px',
  },

  navButtonActive: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-primary)',
    transform: 'scale(1.1)',
    boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
  },

  mainContent: {
    flexGrow: 1,
    padding: '2rem 1rem',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    zIndex: 2, /* Content must be above particles */
  },

  // --- HOME PAGE STYLES ---
  home: {
    textAlign: 'center',
    padding: '4rem 1rem',
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', /* To contain heart particles */
    overflow: 'hidden', /* To prevent hearts from leaking outside */
    backgroundColor: 'var(--color-secondary)',
    borderBottom: '4px solid var(--color-accent)',
  },
  
  homeTitle: {
    fontSize: '3rem',
    fontFamily: 'var(--font-script)',
    color: 'var(--color-primary)',
    marginBottom: '1rem',
    zIndex: 2,
    textShadow: '1px 1px 3px rgba(0,0,0,0.1)',
  },
  
  homeSubtitle: {
    fontSize: '5vw', 
    fontWeight: '700',
    color: 'var(--color-text)',
    marginBottom: '2rem',
    maxWidth: '800px',
    lineHeight: '1.1',
    zIndex: 2,
  },

  // --- ABOUT HER STYLES ---
  aboutContainer: {
    display: 'grid',
    gap: '2rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  },
  
  card: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    transition: 'transform 0.3s ease',
    borderLeft: '5px solid var(--color-primary)',
  },

  cardTitle: {
    fontSize: '1.5rem',
    color: 'var(--color-primary)',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
    // --- IMAGE CARD STYLES ---
  imageCard: {
    padding: '0', 
    borderLeft: '5px solid var(--color-accent)', 
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  imageCardCaptionContainer: {
    padding: '1rem',
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  imageCardTitle: {
    fontSize: '1.5rem',
    color: 'var(--color-primary)',
    marginBottom: '0.5rem',
  },
  imageCardText: {
    fontSize: '0.95rem',
    color: 'var(--color-text)',
  },

  // --- MILESTONES STYLES (Timeline) ---
  timelineContainer: {
    position: 'relative',
    paddingLeft: '30px', 
    marginTop: '3rem',
  },
  
  timelineLine: {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '10px',
    width: '2px',
    backgroundColor: 'var(--color-accent)',
  },

  timelineItem: {
    marginBottom: '2rem',
    paddingBottom: '1rem',
    position: 'relative',
    paddingLeft: '20px',
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },

  timelineDate: {
    fontWeight: '700',
    color: 'var(--color-primary)',
    marginBottom: '0.5rem',
    display: 'block',
    fontSize: '1.1rem',
  },

  timelineDot: {
    content: '""',
    position: 'absolute',
    left: '0',
    top: '25px', 
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    border: '2px solid white',
    zIndex: 10,
  },

  // --- FUTURE STYLES ---
  promiseBox: {
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    padding: '2rem',
    borderRadius: '16px',
    textAlign: 'center',
    margin: '2rem auto', 
    maxWidth: '600px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
  },
  
  promiseHeader: {
    fontFamily: 'var(--font-script)',
    fontSize: '2.5rem',
    marginBottom: '1rem',
  },

  footer: {
    backgroundColor: 'var(--color-text)',
    color: 'var(--color-secondary)',
    textAlign: 'center',
    padding: '1rem',
    fontSize: '0.8rem',
    width: '100%',
    minHeight: '46px', /* Consistent height for calculation */
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
    zIndex: 10,
  },
  
  devBypassButton: {
    position: 'fixed',
    bottom: '66px', /* Above the footer */
    right: '20px',
    zIndex: 1000,
    backgroundColor: 'var(--color-text)',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '25px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    transition: 'background-color 0.2s',
  },

  // Responsive adjustments for mobile
  '@media (max-width: 600px)': {
    homeSubtitle: {
      fontSize: '8vw',
    },
    timelineContainer: {
      paddingLeft: '20px',
    },
    timelineLine: {
      left: '5px',
    },
    timelineDot: {
      left: '5px',
    },
    timelineItem: {
      paddingLeft: '20px', 
    },
    polaroidFrame: {
      transform: 'rotate(0deg) !important', 
    },
    countdownGrid: {
        gridTemplateColumns: 'repeat(2, 1fr)',
    },
    modalButton: {
        fontSize: '1.5rem',
        width: '40px',
        height: '40px',
    },
    modalCaption: {
        fontSize: '1.5rem',
    }
  },
};

// --- DATA ---
const MILESTONE_DATA = [
  {
    date: 'October 4, 2024',
    title: 'Held her hand for the first time.',
    description: "Hadn't felt anything like that ever, my heart was fltuttering."
  },
  {
    date: 'October 9, 2023',
    title: 'Officially Together.',
    description: 'She said yes! The day my life changed forever. I felt like I knew you already.',
  },
  {
    date: 'November 28, 2023',
    title: 'First Kiss.',
    description: "A moment of pure magic. Time stood still, and the whole world faded away. It was perfect—soft, sweet, and everything I'd dreamed of.",
  },
  {
    date: 'January 27, 2024',
    title: "She said 'I Love you' Back",
    description: 'The three most beautiful words, finally heard back. It felt like my soul recognized home. The relief and pure, blinding joy washed over me completely.',
  },
  {
    date: 'February 25, 2024',
    title: 'She Gifted Me a Rolex(her hairband)',
    description: 'She wrapped it around my wrist and just like that, I was wearing a part of her. It means infinitely more than any watch ever could. A silent, constant connection we share.',
  },
  {
    date: 'June 22, 2024',
    title: 'She Blocked a guy for me.',
    description: 'The quiet power of her protecting our space. It made me feel incredibly loved and secure, knowing that I am her absolute priority, no matter the outside noise.'
  },
  {
    date: 'August 28, 2024',
    title: 'We played a videogame for the first time together.',
    description: "Seeing her eyes light up, even while struggling with the controls, was a profound moment. She didn't have to love the game, but she loved the shared experience. That effort is what I cherish.",
  },
  {
    date: 'August 30, 2024',
    title: 'She Wrote a love letter for me.',
    description: "A physical piece of her heart, written just for me. Reading her words in her own handwriting made the love feel so real, so permanent. It's a treasure I'll hold onto forever.",
  },
  {
    date: 'September 13, 2024',
    title: 'First Time Trying Waffles Together',
    description: "A delightful, perfect first. Sharing that sweet, crisp comfort felt like the ultimate cozy indulgence. Every bite, covered in syrup and laughter, was a taste of simple, perfect happiness with her.",
  },
  {
    date: 'September 26, 2024',
    title: 'First Shawarma Together.',
    description: "A delicious, slightly chaotic shared moment. We were messy and laughing, but the simple act of eating that first shawarma together made everything feel easy, natural, and utterly perfect.",
  },
  {
    date: 'November 6, 2024',
    title: 'She Bought Me Chocolates',
    description: "A small, unexpected moment that brightened the whole day. It wasn't about the gift, but the random, loving thought behind it—the perfect reminder that she thinks of me even when we're apart.",
  },  
  {
    date: 'November 18, 2024',
    title: 'First Cafe Date',
    description: "I remember the smell of fresh grounds and the easy warmth of the light. But mostly, I remember her smile. It felt like we were the only two people in the whole buzzing cafe.",
  },
  {
    date: 'February 10, 2025',
    title: 'Dinner Together',
    description: "It wasn't a formal date, but it felt better; easy, comfortable, and completely natural. Just sitting across from her, sharing a meal, solidified that we're moving past dating and into us.",
  },
  {
    date: 'March 12, 2025',
    title: "Babygurl's Train First Train Journey Alone.",
    description: "Seeing her step onto that train, confident and beautiful. A moment where I admired her independence and strength profoundly. The train might have taken her away briefly, but my heart was on the journey with her.",
  },
  {
    date: 'April 21, 2025',
    title: "First Ever Bike Ride Together!",
    description: "Starting a new journey, literally and metaphorically. The open road with her by my side (or behind me!). It made me feel like we could go anywhere and do anything, as long as we were together.",
  },
  {
    date: 'June 19, 2025',
    title: "My Princess Planned Me a Birthday Surprise!!!",
    description: "I was overwhelmed with happiness and gratitude. She took the stress away and simply gave me joy. That day was proof of how deeply she sees me and cares for my happiness.",
  },
  {
    date: 'July 2, 2025',
    title: "Babygurl Had a Major Surgery",
    description: "A difficult chapter that she faced with incredible grace and fortitude. A true test of her spirit. Those hours felt like an eternity, but she emerged victorious, her light only shining brighter for having gone through it. Every day of her recovery is a victory I cherish with her.",
  },
  {
    date: 'August 1, 2025',
    title: "Babygurl's First Day of College",
    description: "A day overflowing with immense pride. Watching her take that monumental step into her future was inspiring. She earned this, and I’m so happy to be cheering her on.",
  },
  {
    date: 'November 23, 2025',
    title: "1 AM Shawarma Delivery For My Princess",
    description: "The quiet magic of meeting her at her doorstep at 1 AM with a surprise. It wasn't just food; it was a reminder that I'll move mountains (or at least late-night traffic) for her comfort and happiness.",
  },
           
  {
    date: 'December 5, 2025',
    title: 'Happy Birthday!',
    description: 'May You have the Happiest Birthdayy. Cheers to Celebrating the most amazing woman in the world!',
  },
];

// --- PHOTO ALBUM DATA (40 entries) ---
// Replace the 40 sample URLs below with your real direct image links.
// Keep the array length at 40 (or any length you like).
const IMAGE_LINKS = [
  // paste your 40 URLs here, examples:
  'https://i.ibb.co/x8dT95Hn/lkasjdfl-asd.jpg',
  'https://i.ibb.co/4gS58RPz/1000119927.jpg',
  'https://i.ibb.co/v60nfXBX/1000119936.jpg',
  'https://i.ibb.co/HD0d2sjs/1000119898.jpg',
  'https://i.ibb.co/RpX2RMcY/1000119900.jpg',
  'https://i.ibb.co/9HK3ZXjv/1000119902.jpg',
  'https://i.ibb.co/zH71kx7N/1000119904.jpg',
  'https://i.ibb.co/v4xq6LGs/1000119913.jpg',
  'https://i.ibb.co/8gzmTQZj/1000119915.jpg',
  'https://i.ibb.co/tPpnj6pk/1000119918.jpg',
  'https://i.ibb.co/5grHX8DJ/1000119920.jpg',
  'https://i.ibb.co/nNDQwHq3/1000119921.jpg',
  'https://i.ibb.co/0pTDDfGs/1000119922.jpg',
  'https://i.ibb.co/dXbXk3x/1000119935.jpg',
  'https://i.ibb.co/5WPf417T/1000119940.jpg',
  'https://i.ibb.co/PvhnFPFW/1000119908.jpg',
  'https://i.ibb.co/qLCpdh6W/1000119909.jpg',
  'https://i.ibb.co/SD3v7Nt8/1000119910.jpg',
  'https://i.ibb.co/CKV4KsgK/1000119912.jpg',
  'https://i.ibb.co/yFcDqqkN/1000119914.jpg',
  'https://i.ibb.co/Ng0DwKkD/1000119916.jpg',
  'https://i.ibb.co/ccVVm0wY/1000119917.jpg',
  'https://i.ibb.co/mCJqR5SF/1000119919.jpg',
  'https://i.ibb.co/bgfH5M6n/1000119925.jpg',
  'https://i.ibb.co/7JhD2Bc4/1000119938.jpg',
  'https://i.ibb.co/k6r7McjQ/1000119899.jpg',
  'https://i.ibb.co/PZjKVsHg/1000119901.jpg',
  'https://i.ibb.co/fVtvbk8y/1000119905.jpg',
  'https://i.ibb.co/gMvR5hn9/Whats-App-Image-2025-11-26-at-02-41-04-8ce8ce88.jpg',
  'https://i.ibb.co/P0rPSpj/1000119907.jpg',
  'https://i.ibb.co/1f2PqN4h/1000119926.jpg',
  'https://i.ibb.co/205NX1dM/1000119928.jpg',
  'https://i.ibb.co/dhbs9Rc/1000119930.jpg',
  'https://i.ibb.co/4gTbRGF7/1000119937.jpg',
  'https://i.ibb.co/KxGYL9xp/1000119943.jpg',
  'https://i.ibb.co/Pst7bHGJ/1000119929.jpg',
  'https://i.ibb.co/vx5bHhwB/1000119932.jpg',
  'https://i.ibb.co/DPC6mP2K/1000119933.jpg',
  'https://i.ibb.co/gL0VzPxV/1000119934.jpg',
  'https://i.ibb.co/j9jJNwCk/1000119942.jpg'
];

// Build the photo objects from IMAGE_LINKS
const PHOTO_ALBUM_DATA = IMAGE_LINKS.map((url, i) => ({
  caption: `Sweet Moments #${i + 1}`,
  imgUrl: url,
  description: `A special moment from memory #${i + 1}.`
}));


// --- UPDATED ABOUT HER DATA (Carousel Card uses an array of imgUrls) ---
const CAROUSEL_IMAGES = [
  'https://i.ibb.co/wZKpDV7W/Whats-App-Image-2025-11-26-at-02-54-48-7b344c71.jpg', 
  'https://i.ibb.co/twySc5y2/Whats-App-Image-2025-11-26-at-03-13-36-75145f9d.jpg',
  'https://i.ibb.co/DHSh3L0H/Whats-App-Image-2025-11-26-at-02-56-44-8d205d1b.jpg',
  'https://i.ibb.co/p7fCjRV/Whats-App-Image-2025-11-26-at-03-10-00-cabd7a9c.jpg',
  'https://i.ibb.co/3ySGh1Sq/Whats-App-Image-2025-11-26-at-03-09-59-aa8fc2a5.jpg'
];

const ABOUT_HER_DATA = [
  // 1. FEATURED IMAGE CAROUSEL CARD 
  {
    title: 'My Favorite Views (5 Photos)',
    caption: 'Every one of these pictures captures your wonderful smile and warmth!',
    imgUrls: CAROUSEL_IMAGES, // Now an array
  },
  // 2. TEXT CARD 1
  {
    title: 'Your Brilliant Mind',
    text: 'Through our conversations I am constantly reminded of how smart you are. You challenge me, you teach me, and our deep talks are the highlight of my day.',
  },
  // 3. TEXT CARD 2 
  {
    title: 'Your Radiance',
    text: 'You have a light about you that draws people in. Your presence; and the warmth you radiate is calming, contagious, and always makes the room brighter.',
  },
  // 4. TEXT CARD 3
  {
    title: 'Your Incomparable Heart',
    text: 'The kindest, most generous person I know. Your empathy makes the world a better place, and I am so lucky to receive that warmth every day.',
  },
  // 5. TEXT CARD 4
  {
    title: 'Your Strength',
    text: 'You possess an incredible, quiet strength and resilience that I admire deeply. The way you face overwhelming challenges, from academic pressures to personal hardships and difficult transitions, shows a profound toughness and courage. I am constantly in awe of your spirit and how strong you are.',
  },
  // 6. TEXT CARD 5
  {
    title: 'Your Future Aspirations',
    text: 'I love watching you pursue your dreams with such passion. Whatever you set your mind to, I will always be your biggest cheerleader.',
  },
];

// --- TIMER CONSTANTS ---
// IMPORTANT: Set the target date/time here.
// December 5, 2025 at 00:00:00 (MIDNIGHT) Local Time
const TARGET_DATE = new Date('2025-12-05T00:00:00'); 

// --- COMPONENTS ---

// Function to generate and place the floating hearts
const HeartParticles = () => {
    const heartCount = 15;
    const hearts = Array.from({ length: heartCount }, (_, i) => {
        // Random values for positioning and staggering
        const startX = Math.random() * 100; // 0% to 100% width
        const size = 0.5 + Math.random() * 1.5; // size from 0.5x to 2.0x
        const delay = Math.random() * 15; // 0s to 15s delay
        const duration = 15 + Math.random() * 5; // 15s to 20s duration

        return (
            <div 
                key={i} 
                className={`heart heart-float`}
                style={{
                    left: `${startX}vw`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                    width: `${15 * size}px`,
                    height: `${15 * size}px`,
                    '--heart-size': `${15 * size}px`, // custom property for pseudo-elements
                    '--heart-top': `${-15 * size * 0.5}px`, 
                    '--heart-left': `${15 * size * 0.5}px`,
                }}
            ></div>
        );
    });
    
    // The container for the hearts must be positioned absolutely over the parent
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 1, /* Below content */
        }}>
            {hearts}
        </div>
    );
}

// Function to render the global styles
const GlobalStyle = () => (
  <style>{styles.global + (styles['@media (max-width: 600px)']?.homeSubtitle ? 
      `@media (max-width: 600px) { 
        h2.home-subtitle { font-size: 8vw !important; } 
        .polaroid-frame { transform: rotate(0deg) !important; } 
        .countdown-grid { grid-template-columns: repeat(2, 1fr); } 
        /* Adjusting pseudo-elements for heart size on mobile */
        .heart:before, .heart:after {
            width: var(--heart-size);
            height: var(--heart-size);
        }
        .heart:before {
            top: var(--heart-top);
        }
        .heart:after {
            left: var(--heart-left);
        }
      }` : '')}
  </style>
);

// Countdown Timer Component
const CountdownTimer = ({ targetDate, onUnlock }) => {
    const [timeLeft, setTimeLeft] = useState({});
    const [isUnlocked, setIsUnlocked] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference <= 0) {
                clearInterval(interval);
                setIsUnlocked(true);
                onUnlock(true); // Notify parent component
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate, onUnlock]);
    
    if (isUnlocked) {
        return null; // Timer vanishes if unlocked
    }

    return (
        <div className="timer-lock-container">
            <HeartParticles /> {/* Floating hearts added */}
            <h1 className="timer-title">
                {String.fromCodePoint(0x1F512)} The Countdown Begins {String.fromCodePoint(0x2764)}
            </h1>
            <p style={{marginBottom: '1rem', fontSize: '1.4rem', fontWeight: 'bold', textShadow: '0 0 5px rgba(0,0,0,0.1)', zIndex: 2}}>
                Our beautiful story is locked away...
            </p>
            <p style={{marginBottom: '2rem', fontSize: '1.1rem', fontStyle: 'italic', zIndex: 2}}>
                The treasure chest unlocks at the stroke of midnight, December 5th!
            </p>
            <div className="countdown-grid">
                <div className="countdown-unit">
                    <div className="countdown-number">{timeLeft.days || '00'}</div>
                    <div className="countdown-label">Days</div>
                </div>
                <div className="countdown-unit">
                    <div className="countdown-number">{timeLeft.hours || '00'}</div>
                    <div className="countdown-label">Hours</div>
                </div>
                <div className="countdown-unit">
                    <div className="countdown-number">{timeLeft.minutes || '00'}</div>
                    <div className="countdown-label">Minutes</div>
                </div>
                <div className="countdown-unit">
                    <div className="countdown-number">{timeLeft.seconds || '00'}</div>
                    <div className="countdown-label">Seconds</div>
                </div>
            </div>
            <p style={{fontFamily: 'var(--font-script)', fontSize: '1.8rem', marginTop: '1.5rem', textShadow: '0 0 5px rgba(0,0,0,0.2)', zIndex: 2}}>
                Patience my love, trust me it will be worth it. {String.fromCodePoint(0x1F496)}
            </p>
        </div>
    );
};



const Header = ({ currentPage, setCurrentPage }) => {
  const navItems = ['Home', 'About Her', 'Our Milestones', 'Photo Album', 'The Promise'];
  
  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => setCurrentPage(item)}
            style={{
              ...styles.navButton,
              ...(currentPage === item ? styles.navButtonActive : {}),
            }}
          >
            {item}
          </button>
        ))}
      </nav>
    </header>
  );
};

const Home = ({ setCurrentPage }) => {
  return (
    <div style={styles.home}>
      <HeartParticles /> {/* Floating hearts added */}
      <div style={{zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{
            backgroundColor: 'var(--color-accent)', 
            borderRadius: '50%', 
            padding: '2rem', 
            marginBottom: '2rem',
            boxShadow: '0 0 20px rgba(255,184,192,0.8), 0 0 40px rgba(255,184,192,0.5)',
            animation: 'pulse 3s infinite ease-in-out',
        }}>
            <span style={{fontSize: '5rem'}}>{String.fromCodePoint(0x1F496)}</span>
        </div>
        
        <h1 style={styles.homeTitle}>To My Dearest Baby Don...</h1>
        <h2 className="home-subtitle" style={styles.homeSubtitle}>
          Happy Birthday, My Sweet Sweet Princess!!!.
        </h2>
        <p style={{marginBottom: '2rem', fontSize: '1.2rem', color: 'var(--color-text)', maxWidth: '500px'}}>
          This is a small gift from your amazing boyfriend. 
          A celebration of your amazing self and the beautiful two years we shared together. Click below to begin your gift!
        </p>
        <button 
          onClick={() => setCurrentPage('About Her')} 
          style={{
            ...styles.navButton, 
            ...styles.navButtonActive, 
            fontSize: '1.2rem', 
            padding: '1rem 2rem',
            boxShadow: '0 8px 15px var(--color-shadow)',
          }}
        >
          Open My Gift {String.fromCodePoint(0x1F381)}
        </button>
      </div>
    </div>
  );
};

// Image Carousel Component (Unchanged)
const ImageCarousel = ({ imgUrls, caption }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const intervalRef = useRef(null);
    const totalImages = imgUrls.length;

    const nextImage = useCallback(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % totalImages);
    }, [totalImages]);
    
    const setManualIndex = (index) => {
        setCurrentIndex(index);
        // Reset auto-slide timer on manual interaction
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(nextImage, 4000); 
    };

    // Auto-slide effect
    useEffect(() => {
        intervalRef.current = setInterval(nextImage, 4000); // Slide every 4 seconds
        return () => clearInterval(intervalRef.current); // Cleanup on unmount
    }, [nextImage]);

    return (
        <div style={{...styles.card, ...styles.imageCard}}>
            <div className="carousel-container">
                {imgUrls.map((url, index) => (
                    <img
                        key={index}
                        src={url}
                        alt={`Featured photo ${index + 1}`}
                        className="carousel-image"
                        style={{ opacity: index === currentIndex ? 1 : 0, position: index === currentIndex ? 'relative' : 'absolute', top: 0 }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/300x250/cccccc/000000?text=Error+Loading+Image';
                        }}
                    />
                ))}
                
                {/* Dots for navigation */}
                <div className="carousel-dots">
                    {imgUrls.map((_, index) => (
                        <div
                            key={index}
                            className={`dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => setManualIndex(index)}
                        ></div>
                    ))}
                </div>
            </div>
            
            <div style={styles.imageCardCaptionContainer}>
                <h3 style={styles.imageCardTitle}>
                    {String.fromCodePoint(0x2764)} My Favorite Views
                </h3>
                <p style={styles.imageCardText}>{caption}</p>
            </div>
        </div>
    );
};


const AboutHer = () => (
  <>
    <h2 style={{color: 'var(--color-primary)', textAlign: 'center', marginBottom: '2rem'}}>
      All the Reasons I Love You
    </h2>
    <div style={styles.aboutContainer}>
      {ABOUT_HER_DATA.map((item, index) => {
        
        // Conditional rendering for the featured image carousel card
        if (item.imgUrls) {
          return (
            <ImageCarousel 
                key={index}
                imgUrls={item.imgUrls}
                caption={item.caption}
            />
          );
        }

        // Standard Text Card Rendering
        return (
          <div key={index} style={styles.card}>
            <h3 style={styles.cardTitle}>
              {item.title}
            </h3>
            <p>{item.text}</p>
          </div>
        );
      })}
      
      {/* My Personal Note Card (full width) */}
      <div style={{...styles.card, gridColumn: '1 / -1', borderLeft: '5px solid var(--color-accent)'}}>
        <h3 style={styles.cardTitle}>
          {/* Heart emoji kept in My Personal Note as requested */}
          {String.fromCodePoint(0x1F497)} 
          My Personal Note
        </h3>
        <p>
          Hi! There, I love you so, so much. More than words can say. You are the most important person in my life, and every day with you is a blessing. Thank you for simply being you. Happy Birthday!
        </p>
      </div>
    </div>
  </>
);

const Milestones = () => (
  <>
    <h2 style={{color: 'var(--color-primary)', textAlign: 'center', marginBottom: '2rem'}}>
      Milestones & Key Dates
    </h2>
    <div style={styles.timelineContainer}>
      {/* CSS for the line */}
      <div style={styles.timelineLine}></div> 
      {MILESTONE_DATA.map((item, index) => (
        <div key={index} style={styles.timelineItem}>
          <span style={styles.timelineDot}></span>
          <span style={styles.timelineDate}>{item.date}</span>
          <h3 style={{marginBottom: '0.25rem', color: 'var(--color-text)'}}>{item.title}</h3>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  </>
);

const PhotoAlbum = ({ openModal }) => (
    <>
        <h2 style={{color: 'var(--color-primary)', textAlign: 'center', marginBottom: '2rem'}}>
            Our Favourite Memories
        </h2>
        <div className="photo-grid">
            {PHOTO_ALBUM_DATA.map((photo, index) => (
                <div 
                    key={index} 
                    className="polaroid-frame" 
                    style={styles['@media (max-width: 600px)']?.polaroidFrame}
                    onClick={() => openModal(index)} // Open modal on click
                >
                    <img 
                        src={photo.imgUrl} 
                        alt={photo.caption} 
                        className="polaroid-img"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/300x180/cccccc/000000?text=Photo+Missing';
                        }}
                    />
                    <div className="polaroid-caption">{photo.caption}</div>
                </div>
            ))}
        </div>
        <p style={{textAlign: 'center', marginTop: '2rem', fontStyle: 'italic', color: '#666'}}>
            Click on any photo to view it full-screen!
        </p>
    </>
);

const PhotoModal = ({ photo, totalCount, index, onClose, onNext, onPrev }) => {
    
    // Add keyboard controls for navigation and closing
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            } else if (event.key === 'ArrowRight') {
                onNext();
            } else if (event.key === 'ArrowLeft') {
                onPrev();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose, onNext, onPrev]);


    if (!photo) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <button className="modal-close-button" onClick={onClose}>
                &times;
            </button>
            
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Image */}
                <img 
                    src={photo.imgUrl} 
                    alt={photo.caption} 
                    className="modal-image"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/800x600/cccccc/000000?text=Image+Load+Failed';
                    }}
                />

                {/* Caption/Description */}
                <p className="modal-caption">
                    {photo.caption} ({index + 1} of {totalCount})
                </p>
                
                {/* Navigation Buttons */}
                <button 
                    className="modal-button modal-prev" 
                    onClick={onPrev}
                    disabled={index === 0}
                    style={{ visibility: index === 0 ? 'hidden' : 'visible' }}
                >
                    &#10094;
                </button>
                <button 
                    className="modal-button modal-next" 
                    onClick={onNext}
                    disabled={index === totalCount - 1}
                    style={{ visibility: index === totalCount - 1 ? 'hidden' : 'visible' }}
                >
                    &#10095;
                </button>
            </div>
        </div>
    );
};

const Future = () => {
  const [futurePrompt, setFuturePrompt] = useState('');
  const [generatedStory, setGeneratedStory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleGenerateStory = useCallback(async () => {
    if (!futurePrompt.trim()) {
      setApiError("Please tell me a concept for your shared future story (e.g., 'Our 50th anniversary').");
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setGeneratedStory(null);

    // System prompt (server will combine/forward as-is)
    const systemPrompt =
      "You are a poetic and deeply romantic narrator writing a short, future memory about the couple's imagined life together. Focus on themes of lasting love, shared joy, and fulfilling dreams. Use a warm, sentimental tone. The output must be concise, beautiful, and imaginative, focusing on the emotional core of the event. Do not use markdown headers, bullet points, or list structures. Respond with only the generated paragraph.";

    const userQuery = `Write a romantic 'future memory' based on this concept of the couple's shared future: "${futurePrompt}".`;

    // Payload sent to our serverless function
    const payload = {
      prompt: userQuery,
      system: systemPrompt,
    };

    try {
      const resp = await fetch('/api/dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${resp.status}`);
      }

      const json = await resp.json();

      // Try common shapes returned by generative APIs
      // (adjust depending on your provider's actual response shape)
      const text =
        json?.result?.candidates?.[0]?.content?.parts?.[0]?.text ||
        json?.candidates?.[0]?.content?.parts?.[0]?.text ||
        json?.candidates?.[0]?.content?.text ||
        (json?.result && JSON.stringify(json.result).slice(0, 200));

      if (text) {
        setGeneratedStory(String(text).trim());
      } else {
        setApiError('Could not generate a story. Upstream returned an unexpected response.');
      }
    } catch (error) {
      console.error('Dream API error', error);
      setApiError(`Failed to connect to the romantic well of inspiration. Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [futurePrompt]);

  return (
    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
      <h2 style={{ color: 'var(--color-primary)', marginBottom: '3rem' }}>
        The Next Chapter of Your Incredible Story
      </h2>

      <div
        style={{
          backgroundColor: 'var(--color-accent)',
          padding: '1rem',
          borderRadius: '12px',
          marginBottom: '2rem',
        }}
      >
        <div
          className="gemini-input-box"
          style={{ marginBottom: '0', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
        >
          <h3 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
            {String.fromCodePoint(0x1F31F)} Write a Shared Future Memory
          </h3>
          <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666', fontWeight: 'bold' }}>
            Here is a little something for you to let your imagination run wild about our future, even if we are not
            together. Dream up a shared milestone, and I'll write a poetic memory of it.
          </p>

          <textarea
            className="gemini-textarea"
            placeholder="E.g., Our 50th anniversary celebration, or, Our trip to Paris."
            value={futurePrompt}
            onChange={(e) => setFuturePrompt(e.target.value)}
            disabled={isLoading}
          />

          <button className="gemini-button" onClick={handleGenerateStory} disabled={isLoading}>
            {isLoading ? 'Writing...' : '✨ Dream Up Story'}
          </button>
        </div>

        <div
          className="gemini-output-box"
          style={{ height: generatedStory || isLoading ? 'auto' : '100px', marginTop: '1.5rem' }}
        >
          {isLoading ? (
            <p style={{ color: 'var(--color-primary)' }}>Spinning gold into words...</p>
          ) : apiError ? (
            <p style={{ color: 'red', fontFamily: 'var(--font-main)', fontSize: '1rem' }}>{apiError}</p>
          ) : generatedStory ? (
            <p>{generatedStory}</p>
          ) : (
            <p style={{ color: '#999', fontFamily: 'var(--font-main)', fontSize: '1rem' }}>
              Your Shared Future Memory will appear here.
            </p>
          )}
        </div>
      </div>

      <div style={styles.promiseBox}>
        <h3 style={styles.promiseHeader}>My Enduring Wish for You</h3>
        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
          My deepest promise is to always believe in the incredible woman you are. I wish you boundless joy, success, and
          all the happiness you deserve in the next chapter of your life. Thank you for the two beautiful years we shared;
          they changed me forever and I will cherish them always.
        </p>
        <p style={{ fontFamily: 'var(--font-script)', fontSize: '1.8rem', marginTop: '1.5rem' }}>
          Happy Birthday, to you and best wishes for your wonderful future.
        </p>
      </div>

      <p style={{ fontSize: '0.9rem', color: '#666' }}>{String.fromCodePoint(0x1F493)} Wishing you all the magic in the world.</p>
    </div>
  );
};


// const Future = () => {
//     const [futurePrompt, setFuturePrompt] = useState('');
//     const [generatedStory, setGeneratedStory] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [apiError, setApiError] = useState(null);

//     const handleGenerateStory = useCallback(async () => {
//         if (!futurePrompt.trim()) {
//             setApiError("Please tell me a concept for your shared future story (e.g., 'Our 50th anniversary').");
//             return;
//         }

//         setIsLoading(true);
//         setApiError(null);
//         setGeneratedStory(null);

//         // System prompt updated to focus on shared, imaginative future, fulfilling the user's request.
//         const systemPrompt = "You are a poetic and deeply romantic narrator writing a short, future memory about the couple's imagined life together. Focus on themes of lasting love, shared joy, and fulfilling dreams. Use a warm, sentimental tone. The output must be concise, beautiful, and imaginative, focusing on the emotional core of the event. Do not use markdown headers, bullet points, or list structures. Respond with only the generated paragraph.";
        
//         const userQuery = `Write a romantic 'future memory' based on this concept of the couple's shared future: "${futurePrompt}".`;
        
//         const payload = {
//             contents: [{ parts: [{ text: userQuery }] }],
//             systemInstruction: { parts: [{ text: systemPrompt }] },
//         };
        
//         const apiUrl = `${BASE_URL}/${MODEL_NAME}:generateContent?key=${API_KEY}`;

//         try {
//             const result = await fetchWithRetry(apiUrl, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload)
//             });
            
//             const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
//             if (text) {
//                 setGeneratedStory(text.trim());
//             } else {
//                 setApiError("Could not generate a story. The API returned an empty response.");
//             }
//         } catch (error) {
//             console.error("Gemini API Call Failed:", error);
//             setApiError(`Failed to connect to the romantic well of inspiration. Error: ${error.message}`);
//         } finally {
//             setIsLoading(false);
//         }
//     }, [futurePrompt]);

//     return (
//         <div style={{textAlign: 'center', padding: '2rem 0'}}>
//             <h2 style={{color: 'var(--color-primary)', marginBottom: '3rem'}}>
//                 The Next Chapter of Your Incredible Story
//             </h2>
            
//             {/* The AI Story Writer section (now the imagination zone, focused on shared memories) */}
//             <div style={{
//                 backgroundColor: 'var(--color-accent)', 
//                 padding: '1rem', 
//                 borderRadius: '12px', 
//                 marginBottom: '2rem'
//             }}>
//                 <div className="gemini-input-box" style={{marginBottom: '0', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
//                     <h3 style={{color: 'var(--color-primary)', marginBottom: '1rem'}}>
//                         {String.fromCodePoint(0x1F31F)} Write a Shared Future Memory
//                     </h3>
//                     <p style={{marginBottom: '1rem', fontSize: '0.9rem', color: '#666', fontWeight: 'bold'}}>
//                         Here is a little something for you to let your imagination run wild about our future, even if we are not together. Dream up a shared milestone, and I'll write a poetic memory of it.
//                     </p>
                    
//                     <textarea
//                         className="gemini-textarea"
//                         placeholder="E.g., Our 50th anniversary celebration, or, Our trip to Paris."
//                         value={futurePrompt}
//                         onChange={(e) => setFuturePrompt(e.target.value)}
//                         disabled={isLoading}
//                     />
                    
//                     <button 
//                         className="gemini-button"
//                         onClick={handleGenerateStory}
//                         disabled={isLoading}
//                     >
//                         {isLoading ? 'Writing...' : '✨ Dream Up Story'}
//                     </button>
//                 </div>

//                 <div className="gemini-output-box" style={{height: generatedStory || isLoading ? 'auto' : '100px', marginTop: '1.5rem'}}>
//                     {isLoading ? (
//                         <p style={{ color: 'var(--color-primary)' }}>Spinning gold into words...</p>
//                     ) : apiError ? (
//                         <p style={{ color: 'red', fontFamily: 'var(--font-main)', fontSize: '1rem' }}>{apiError}</p>
//                     ) : generatedStory ? (
//                         <p>{generatedStory}</p>
//                     ) : (
//                         <p style={{ color: '#999', fontFamily: 'var(--font-main)', fontSize: '1rem' }}>Your Shared Future Memory will appear here.</p>
//                     )}
//                 </div>
//             </div>


//             {/* The Promise Box section (the enduring wish/dedication) - Unchanged */}
//             <div style={styles.promiseBox}>
//               <h3 style={styles.promiseHeader}>My Enduring Wish for You</h3>
//               <p style={{fontSize: '1.1rem', marginBottom: '1.5rem'}}>
//                 My deepest promise is to always believe in the incredible woman you are. I wish you boundless joy, success, and all the happiness you deserve in the next chapter of your life. Thank you for the two beautiful years we shared; they changed me forever and I will cherish them always.
//               </p>
//               <p style={{fontFamily: 'var(--font-script)', fontSize: '1.8rem', marginTop: '1.5rem'}}>
//                 Happy Birthday, to you and best wishes for your wonderful future.
//               </p>
//             </div>
            
//             <p style={{fontSize: '0.9rem', color: '#666'}}>
//               {String.fromCodePoint(0x1F493)} Wishing you all the magic in the world.
//             </p>
//         </div>
//     );
// };

const Footer = () => (
  <footer style={styles.footer}>
    &copy; {new Date().getFullYear()} A Gift From Your BF. Handcrafted with love.
  </footer>
);

// // Developer Bypass Component
// const DevBypass = ({ isDevMode, toggleDevMode }) => (
//     <button 
//         style={styles.devBypassButton} 
//         onClick={toggleDevMode}
//     >
//         {isDevMode ? 'Hide Content (Dev Off)' : 'Show Content (Dev On)'}
//     </button>
// );


// --- MAIN APPLICATION ---

const App = () => {
  const [currentPage, setCurrentPage] = useState('Home');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  // State for Photo Modal (Lightbox)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);


  // Check if the target date has passed
  useEffect(() => {
    if (new Date() >= TARGET_DATE) {
        setIsUnlocked(true);
    }
  }, []);

  const handleUnlock = useCallback((unlocked) => {
    setIsUnlocked(unlocked);
  }, []);
  
  const toggleDevMode = useCallback(() => {
    setIsDevMode(prev => !prev);
  }, []);

  // --- Modal Logic ---
  const openModal = useCallback((index) => {
    setSelectedPhotoIndex(index);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const navigatePhotos = useCallback((direction) => {
    setSelectedPhotoIndex(prevIndex => {
        const newIndex = prevIndex + direction;
        if (newIndex >= 0 && newIndex < PHOTO_ALBUM_DATA.length) {
            return newIndex;
        }
        return prevIndex;
    });
  }, []);

  const renderContent = () => {
    switch (currentPage) {
      case 'Home':
        return <Home setCurrentPage={setCurrentPage} />;
      case 'About Her':
        return <AboutHer />;
      case 'Our Milestones':
        return <Milestones />;
      case 'Photo Album':
        // Pass the openModal function to the PhotoAlbum component
        return <PhotoAlbum openModal={openModal} />;
      case 'The Promise':
        return <Future />;
      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  };
  
  // Logic to determine if the site should be locked
  const shouldBeLocked = !isUnlocked && !isDevMode;

  return (
    <>
      {/* Global styles injected here UNCONDITIONALLY */}
      <GlobalStyle /> 
      
      {/* Developer Bypass Button - only visible if the site is not naturally unlocked */}
      {/* {!isUnlocked && <DevBypass isDevMode={isDevMode} toggleDevMode={toggleDevMode} />} */}
      
      {shouldBeLocked ? (
          <>
            <CountdownTimer targetDate={TARGET_DATE} onUnlock={handleUnlock} />
            {/* FOOTER ADDED HERE FOR LOCKSCREEN */}
            <Footer />
          </>
      ) : (
          <div style={styles.app}>
            {/* Header only visible if unlocked AND not on the Home screen */}
            {currentPage !== 'Home' && (
              <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
            )}
            
            <main style={styles.mainContent}>
              {renderContent()}
            </main>
            
            <Footer />
          </div>
      )}
      
      {/* Photo Modal/Lightbox */}
      {isModalOpen && (
        <PhotoModal
            photo={PHOTO_ALBUM_DATA[selectedPhotoIndex]}
            totalCount={PHOTO_ALBUM_DATA.length}
            index={selectedPhotoIndex}
            onClose={closeModal}
            onNext={() => navigatePhotos(1)}
            onPrev={() => navigatePhotos(-1)}
        />
      )}
    </>
  );
};

export default App;