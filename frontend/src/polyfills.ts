import { Buffer } from 'buffer';

window.global = window;
global.Buffer = Buffer;

// Ensure window.ethereum is properly detected
if (typeof window !== 'undefined') {
  // Create a mock ethereum object if it doesn't exist
  if (!window.ethereum) {
    console.log('Creating mock ethereum object for development');
    window.ethereum = {
      isMetaMask: true,
      selectedAddress: '0x0000000000000000000000000000000000000000',
      chainId: '0x1',
      isConnected: () => true,
      request: async ({ method }) => {
        if (method === 'eth_requestAccounts') {
          return ['0x0000000000000000000000000000000000000000'];
        }
        return null;
      }
    };
  }

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