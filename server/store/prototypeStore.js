const onboardingMemoryStore = new Map();

export function savePrototypeOnboarding(record) {
  onboardingMemoryStore.set(record._id, record);
  return record;
}

export function getPrototypeOnboardingById(id) {
  return onboardingMemoryStore.get(id) || null;
}

export function generatePrototypeId() {
  return `proto_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
