import { createUserRepository } from "./userRepository";

type UserLike = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
};

type Invite = {
  _id: string;
  householdId: string;
};

type InviteRecord = Record<string, unknown> & {
  _id: string;
  status?: string;
};

type HouseholdFirestoreApi = {
  addDoc: (collectionRef: unknown, data: Record<string, unknown>) => Promise<unknown>;
  arrayUnion: (...values: string[]) => unknown;
  collection: (...pathSegments: string[]) => unknown;
  doc: (...pathSegments: string[]) => unknown;
  getDoc: (docRef: unknown) => Promise<{ exists: () => boolean; data: () => Record<string, unknown> }>;
  getDocs: (queryOrCollection: unknown) => Promise<{ docs: Array<{ id: string; data: () => Record<string, unknown> }> }>;
  query: (...parts: unknown[]) => unknown;
  setDoc: (docRef: unknown, data: Record<string, unknown>, options?: { merge?: boolean }) => Promise<void>;
  updateDoc: (docRef: unknown, data: Record<string, unknown>) => Promise<void>;
  where: (...parts: unknown[]) => unknown;
};

type UserRepositoryLike = {
  saveActiveHousehold: (user: UserLike, householdId: string) => Promise<void> | void;
};

const HOUSEHOLD_COLLECTIONS = [
  "transactions",
  "goals",
  "shortcuts",
  "cards",
  "shopping",
  "recurring",
  "monthlyClosings",
  "categoryRules"
] as const;

async function migrateCollectionToHousehold({
  db,
  fs,
  user,
  householdId,
  colName
}: {
  db: string;
  fs: HouseholdFirestoreApi;
  user: UserLike;
  householdId: string;
  colName: (typeof HOUSEHOLD_COLLECTIONS)[number];
}) {
  if (!user || !householdId) return 0;
  const snap = await fs.getDocs(fs.collection(db, "users", user.uid, colName));
  let count = 0;
  for (const d of snap.docs) {
    const data = d.data();
    if (data.seeded) continue;
    await fs.setDoc(
      fs.doc(db, "households", householdId, colName, d.id),
      { ...data, migratedFrom: user.uid, migratedAtMs: Date.now() },
      { merge: true }
    );
    count++;
  }
  return count;
}

function createHouseholdRepository({
  db,
  fs,
  userRepo
}: {
  db: string;
  fs: HouseholdFirestoreApi;
  userRepo?: UserRepositoryLike;
}) {
  const users = userRepo || createUserRepository({ db, fs, authApi: null });
  const migrationKey = (user: UserLike, householdId: string) => "financas-migrated-" + user.uid + "-" + householdId;

  return {
    async findFirstHouseholdForUser(user: UserLike) {
      const q = fs.query(fs.collection(db, "households"), fs.where("members", "array-contains", user.uid));
      const snap = await fs.getDocs(q);
      return snap.docs[0]?.id || "";
    },

    async migrateIndividualDataToHousehold(user: UserLike | null | undefined, householdId: string, { force = false } = {}) {
      if (!user || !householdId) return 0;
      const key = migrationKey(user, householdId);
      if (!force && localStorage.getItem(key)) return 0;
      let total = 0;
      for (const colName of HOUSEHOLD_COLLECTIONS) {
        total += await migrateCollectionToHousehold({ db, fs, user, householdId, colName });
      }
      localStorage.setItem(key, "1");
      return total;
    },

    async createOwnedHousehold(user: UserLike, householdId: string) {
      await fs.setDoc(
        fs.doc(db, "households", householdId),
        { owner: user.uid, members: [user.uid], createdAtMs: Date.now() },
        { merge: true }
      );
    },

    async sendInvite(user: UserLike, { toEmail, householdId, fromName }: { toEmail: string; householdId: string; fromName?: string }) {
      await fs.addDoc(fs.collection(db, "invites"), {
        toEmail,
        fromEmail: (user.email || "").toLowerCase(),
        fromUid: user.uid,
        fromName: fromName || user.displayName || "Eu",
        householdId,
        status: "pending",
        createdAtMs: Date.now(),
        createdAtText: new Date().toLocaleString("pt-BR")
      });
    },

    async answerInvite(user: UserLike, invite: Invite, status: string) {
      await fs.updateDoc(fs.doc(db, "invites", invite._id), { status });
      if (status !== "accepted") return;
      await fs.setDoc(
        fs.doc(db, "households", invite.householdId),
        { members: fs.arrayUnion(user.uid) },
        { merge: true }
      );
    },

    async refreshInvites(email: string) {
      const q = fs.query(fs.collection(db, "invites"), fs.where("toEmail", "==", (email || "").toLowerCase()));
      const snap = await fs.getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), _id: d.id }) as InviteRecord).filter(i => i.status === "pending");
    },

    async joinHousehold(user: UserLike, householdId: string) {
      await fs.setDoc(
        fs.doc(db, "households", householdId),
        { members: fs.arrayUnion(user.uid) },
        { merge: true }
      );
    },

    saveActiveHousehold(user: UserLike, householdId: string) {
      return users.saveActiveHousehold(user, householdId);
    }
  };
}

export { HOUSEHOLD_COLLECTIONS, createHouseholdRepository };
