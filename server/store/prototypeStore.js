// In-memory store (temporary DB)
const prototypes = new Map();

// Generate unique prototype ID
export const generatePrototypeId = () => {
  return 'proto_' + Math.random().toString(36).substr(2, 9);
};

// Save onboarding data
export const savePrototypeOnboarding = (id, data) => {
  prototypes.set(id, data);
};

// Get onboarding data by ID
export const getPrototypeOnboardingById = (id) => {
  return prototypes.get(id);
};