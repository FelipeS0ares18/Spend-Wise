import { useEffect } from "react";
import { createHouseholdRepository } from "../services/householdRepository";
import { authApi, db, fs } from "../services/firebase";
import { createUserRepository } from "../services/userRepository";

function useUserProfile({
  user,
  householdId,
  setHouseholdId,
  setProfileName,
  setProfilePhone,
  setWhatsappCode,
  setWhatsappConnectedPhone,
  setOnboardingHidden
}) {
  useEffect(() => {
    if (!user) return;
    const userRepo = createUserRepository({ db, fs, authApi });
    const householdRepo = createHouseholdRepository({ db, fs, userRepo });

    setProfileName(user.displayName || "");
    setProfilePhone(userRepo.getLocalProfilePhone(user));

    userRepo
      .loadUserData(user)
      .then(async data => {
        if (data.name) setProfileName(data.name);
        if (data.phone) {
          setProfilePhone(data.phone);
          userRepo.setLocalProfilePhone(user, data.phone);
        }
        if (data.whatsappConnectCode) setWhatsappCode(data.whatsappConnectCode);
        if (data.whatsappConnectedPhone) setWhatsappConnectedPhone(data.whatsappConnectedPhone);
        setOnboardingHidden(!!data.onboardingHidden);

        const localH = userRepo.getLocalHouseholdId(user);
        if (data.activeHouseholdId) {
          if (localH !== data.activeHouseholdId) userRepo.setLocalHouseholdId(user, data.activeHouseholdId);
          setHouseholdId(data.activeHouseholdId);
          return;
        }
        if (localH && !data.activeHouseholdId) {
          try {
            await userRepo.saveActiveHousehold(user, localH);
          } catch (e) {
            console.warn("Nao foi possivel sincronizar household local:", e);
          }
          return;
        }
        if (!localH && !data.activeHouseholdId) {
          try {
            const first = await householdRepo.findFirstHouseholdForUser(user);
            if (first) {
              userRepo.setLocalHouseholdId(user, first);
              await userRepo.saveActiveHousehold(user, first);
              setHouseholdId(first);
            }
          } catch (e) {
            console.warn("Household remoto indisponivel:", e);
          }
        }
      })
      .catch(e => console.warn("Perfil indisponivel:", e));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const userRepo = createUserRepository({ db, fs, authApi });
    const ref = userRepo.userDoc(user);
    const unsub = fs.onSnapshot(
      ref,
      snap => {
        const remoteData = snap.exists() ? snap.data() : {};
        const remote = remoteData.activeHouseholdId || "";
        if (remoteData.whatsappConnectedPhone) setWhatsappConnectedPhone(remoteData.whatsappConnectedPhone);
        setOnboardingHidden(!!remoteData.onboardingHidden);
        if (remote && remote !== householdId) {
          userRepo.setLocalHouseholdId(user, remote);
          setHouseholdId(remote);
        }
      },
      e => console.warn("Household ativo indisponivel:", e)
    );
    return () => unsub();
  }, [user, householdId]);
}

export { useUserProfile };
