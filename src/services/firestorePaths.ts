type FirebaseUserLike = {
  uid: string;
};

type FirestoreApi = {
  doc: (db: unknown, ...segments: string[]) => unknown;
  collection: (db: unknown, ...segments: string[]) => unknown;
};

type CreateFirestoreRefsInput = {
  db: unknown;
  fs: FirestoreApi;
  user: FirebaseUserLike;
  householdId?: string;
};

const OWNER_COLLECTIONS = {
  transactions: "transactions",
  goals: "goals",
  shortcuts: "shortcuts",
  recurring: "recurring",
  cards: "cards",
  shopping: "shopping",
  monthlyClosings: "monthlyClosings",
  categoryRules: "categoryRules"
} as const;

type OwnerCollectionName = keyof typeof OWNER_COLLECTIONS;

function getOwnerPath(user: FirebaseUserLike, householdId?: string): string[] {
  if (householdId) return ["households", householdId];
  return ["users", user.uid];
}

function getOwnerId(user: FirebaseUserLike, householdId?: string): string {
  return householdId || user.uid;
}

function createFirestoreRefs({ db, fs, user, householdId = "" }: CreateFirestoreRefsInput) {
  const ownerPath = () => getOwnerPath(user, householdId);
  const ownerDoc = () => fs.doc(db, ...ownerPath());
  const ownerCollection = (name: string) => fs.collection(db, ...ownerPath(), name);
  const ownerCollectionDoc = (name: string, id: string) => fs.doc(db, ...ownerPath(), name, id);
  const transactionMessagesCollection = (transactionId: string) =>
    fs.collection(db, ...ownerPath(), OWNER_COLLECTIONS.transactions, transactionId, "messages");

  return {
    isShared: () => !!householdId,
    ownerPath,
    ownerDoc,
    ownerId: () => getOwnerId(user, householdId),
    ownerCollection,
    ownerCollectionDoc,
    transactionMessagesCollection,
    txCol: () => ownerCollection(OWNER_COLLECTIONS.transactions),
    goalCol: () => ownerCollection(OWNER_COLLECTIONS.goals),
    shortcutCol: () => ownerCollection(OWNER_COLLECTIONS.shortcuts),
    recurringCol: () => ownerCollection(OWNER_COLLECTIONS.recurring),
    cardCol: () => ownerCollection(OWNER_COLLECTIONS.cards),
    shoppingCol: () => ownerCollection(OWNER_COLLECTIONS.shopping),
    closingCol: () => ownerCollection(OWNER_COLLECTIONS.monthlyClosings),
    categoryRuleCol: () => ownerCollection(OWNER_COLLECTIONS.categoryRules),
    inviteCol: () => fs.collection(db, "invites")
  };
}

type FirestoreRefs = ReturnType<typeof createFirestoreRefs>;

export { OWNER_COLLECTIONS, createFirestoreRefs, getOwnerId, getOwnerPath };
export type { FirebaseUserLike, FirestoreRefs, OwnerCollectionName };
