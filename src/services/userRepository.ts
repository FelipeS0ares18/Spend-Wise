type UserLike = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  phoneNumber?: string | null;
};

type UserFirestoreApi = {
  doc: (...pathSegments: string[]) => unknown;
  getDoc: (docRef: unknown) => Promise<{ exists: () => boolean; data: () => Record<string, unknown> }>;
  setDoc: (docRef: unknown, data: Record<string, unknown>, options?: { merge?: boolean }) => Promise<void>;
};

type AuthApi = {
  updateProfile: (user: UserLike, data: { displayName: string }) => Promise<void>;
} | null;

function createUserRepository({ db, fs, authApi }: { db: string; fs: UserFirestoreApi; authApi: AuthApi }) {
  const userDoc = (user: UserLike) => fs.doc(db, "users", user.uid);
  const profilePhoneKey = (user: UserLike) => "financas-profile-phone-" + user.uid;
  const householdKey = (user: UserLike) => "financas-household-" + user.uid;

  return {
    userDoc,

    getLocalProfilePhone(user: UserLike) {
      return localStorage.getItem(profilePhoneKey(user)) || user.phoneNumber || "";
    },

    setLocalProfilePhone(user: UserLike, phone: string) {
      localStorage.setItem(profilePhoneKey(user), phone || "");
    },

    getLocalHouseholdId(user: UserLike) {
      return localStorage.getItem(householdKey(user)) || "";
    },

    setLocalHouseholdId(user: UserLike, householdId: string) {
      localStorage.setItem(householdKey(user), householdId || "");
    },

    async loadUserData(user: UserLike) {
      const snap = await fs.getDoc(userDoc(user));
      return snap.exists() ? snap.data() : {};
    },

    async saveActiveHousehold(user: UserLike | null | undefined, householdId: string) {
      if (!user || !householdId) return;
      this.setLocalHouseholdId(user, householdId);
      await fs.setDoc(
        userDoc(user),
        { activeHouseholdId: householdId, activeHouseholdUpdatedAtMs: Date.now() },
        { merge: true }
      );
    },

    async saveProfile(user: UserLike, { name, phone }: { name: string; phone: string }) {
      if (name !== (user.displayName || "") && authApi) await authApi.updateProfile(user, { displayName: name });
      await fs.setDoc(userDoc(user), { name, email: user.email || "", phone, updatedAtMs: Date.now() }, { merge: true });
      this.setLocalProfilePhone(user, phone);
    },

    async saveWhatsappCode(user: UserLike, { code, phone, householdId }: { code: string; phone: string; householdId: string }) {
      await fs.setDoc(
        userDoc(user),
        {
          whatsappConnectCode: code,
          whatsappConnectCodeAtMs: Date.now(),
          phone: (phone || "").trim(),
          activeHouseholdId: householdId || ""
        },
        { merge: true }
      );
    },

    async hideOnboarding(user: UserLike) {
      await fs.setDoc(userDoc(user), { onboardingHidden: true, onboardingHiddenAtMs: Date.now() }, { merge: true });
    }
  };
}

export { createUserRepository };
