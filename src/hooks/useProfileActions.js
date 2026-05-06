function makeWhatsappCode() {
  return Math.random().toString(36).replace(/[^a-z0-9]/gi, "").slice(2, 8).toUpperCase();
}

function useProfileActions({
  householdId,
  profileName,
  profilePhone,
  setProfileName,
  setProfilePhone,
  setProfileSaving,
  setSync,
  setWhatsappCode,
  user,
  userRepo
}) {
  async function generateWhatsappCode() {
    if (!user) return;
    const code = makeWhatsappCode();
    setSync("saving");
    try {
      await userRepo.saveWhatsappCode(user, { code, phone: profilePhone, householdId });
      setWhatsappCode(code);
      setSync("ok");
    } catch (e) {
      setSync("err");
      alert("Erro ao gerar codigo do WhatsApp: " + e.message);
    }
  }

  async function saveProfile() {
    if (!user) return;
    const name = (profileName || "").trim() || "Eu";
    const phone = (profilePhone || "").trim();
    setProfileSaving(true);
    setSync("saving");
    try {
      await userRepo.saveProfile(user, { name, phone });
      setProfileName(name);
      setProfilePhone(phone);
      setSync("ok");
      alert("Perfil atualizado.");
    } catch (e) {
      setSync("err");
      alert("Erro ao salvar perfil: " + e.message);
    }
    setProfileSaving(false);
  }

  return { generateWhatsappCode, saveProfile };
}

export { makeWhatsappCode, useProfileActions };
