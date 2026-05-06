import { useEffect } from "react";

function useHouseholdActions({
  user,
  householdId,
  joinCode,
  partnerEmail,
  householdRepo,
  setHouseholdId,
  setInvites,
  setJoinCode,
  setPartnerEmail,
  setSync,
  setView
}) {
  async function syncActiveHousehold(sharedId) {
    if (!user || !sharedId) return;
    try {
      await householdRepo.saveActiveHousehold(user, sharedId);
    } catch (e) {
      console.warn("Nao foi possivel salvar household ativo:", e);
    }
  }

  async function migrateIndividualDataToHousehold(sharedId, { force = false } = {}) {
    if (!user || !sharedId) return;
    try {
      setSync("saving");
      const total = await householdRepo.migrateIndividualDataToHousehold(user, sharedId, { force });
      setSync("ok");
      if (total > 0) console.log("Dados individuais copiados para a conta compartilhada:", total);
    } catch (e) {
      console.error("Erro ao migrar dados para household:", e);
      setSync("err");
    }
  }

  useEffect(() => {
    if (user && householdId) migrateIndividualDataToHousehold(householdId);
  }, [user, householdId]);

  async function sendInvite() {
    const toEmail = partnerEmail.trim().toLowerCase();
    if (!toEmail || !user.email) return;
    setSync("saving");
    try {
      let sharedId = householdId;
      if (!sharedId) {
        sharedId = "household-" + user.uid;
        await householdRepo.createOwnedHousehold(user, sharedId);
        await migrateIndividualDataToHousehold(sharedId, { force: true });
        await syncActiveHousehold(sharedId);
        setHouseholdId(sharedId);
      }
      await householdRepo.sendInvite(user, { toEmail, householdId: sharedId, fromName: user.displayName || "Eu" });
      setPartnerEmail("");
      setSync("ok");
    } catch (e) {
      setSync("err");
      alert("Erro: " + e.message);
    }
  }

  async function answerInvite(invite, status) {
    setSync("saving");
    try {
      await householdRepo.answerInvite(user, invite, status);
      if (status === "accepted") {
        await migrateIndividualDataToHousehold(invite.householdId, { force: true });
        await syncActiveHousehold(invite.householdId);
        setHouseholdId(invite.householdId);
        setView("dashboard");
      }
      setSync("ok");
    } catch (e) {
      setSync("err");
      alert("Erro: " + e.message);
    }
  }

  async function refreshInvites() {
    if (!user?.email) return;
    setSync("saving");
    try {
      setInvites(await householdRepo.refreshInvites(user.email));
      setSync("ok");
    } catch (e) {
      setSync("err");
      alert("Erro ao buscar convites: " + e.message);
    }
  }

  async function joinHouseholdByCode() {
    const code = joinCode.trim();
    if (!code) return;
    setSync("saving");
    try {
      await householdRepo.joinHousehold(user, code);
      await migrateIndividualDataToHousehold(code, { force: true });
      await syncActiveHousehold(code);
      setHouseholdId(code);
      setJoinCode("");
      setView("dashboard");
      setSync("ok");
    } catch (e) {
      setSync("err");
      alert("Erro ao entrar na conta compartilhada: " + e.message);
    }
  }

  return {
    answerInvite,
    joinHouseholdByCode,
    migrateIndividualDataToHousehold,
    refreshInvites,
    sendInvite,
    syncActiveHousehold
  };
}

export { useHouseholdActions };
