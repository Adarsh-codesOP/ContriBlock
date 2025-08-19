import { Buffer } from 'buffer';

window.global = window;
global.Buffer = Buffer;

// Ensure window.ethereum is properly detected
if (typeof window !== 'undefined') {
  // Log ethereum detection on page load
  window.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - Ethereum detection:', {
      hasEthereum: !!window.ethereum,
      isMetaMask: window.ethereum?.isMetaMask,
      provider: window.ethereum ? 'Available' : 'Not available'
    });
  });

  // Check for ethereum injection after a short delay
  setTimeout(() => {
    console.log('Delayed check - Ethereum detection:', {
      hasEthereum: !!window.ethereum,
      isMetaMask: window.ethereum?.isMetaMask,
      provider: window.ethereum ? 'Available' : 'Not available'
    });
  }, 1000);
}