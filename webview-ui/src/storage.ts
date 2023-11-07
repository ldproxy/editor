const createStorage = (initial: object) => {
  let storage = initial;
  const subscribers = new Set<Function>();

  return {
    get() {
      return storage;
    },
    set(obj: object) {
      storage = obj;
      // Benachrichtigen Sie alle Abonnenten über die Änderung
      for (const subscriber of subscribers) {
        subscriber(storage);
      }
    },
    subscribe(subscriber: (data: object) => void) {
      subscribers.add(subscriber);
      // Gib eine Funktion zurück, um das Abonnement zu beenden
      return () => {
        subscribers.delete(subscriber);
      };
    },
  };
};

export const remoteStorage = createStorage({
  name: "App Storage",
  description: "Stored States",
});
