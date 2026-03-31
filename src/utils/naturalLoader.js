// src/utils/naturalLoader.js
let naturalInstance = null;

export async function loadNatural() {
  if (naturalInstance) {
    return naturalInstance;
  }
  
  try {
    // Dynamic import to avoid build-time issues
    const natural = await import('natural');
    naturalInstance = natural.default || natural;
    return naturalInstance;
  } catch (error) {
    console.error('Failed to load natural:', error);
    return null;
  }
}

// Use in your component
export async function useNaturalClassifier() {
  const natural = await loadNatural();
  if (natural && natural.BayesClassifier) {
    return new natural.BayesClassifier();
  }
  return null;
}