import { useEffect } from "react";
import { db, fs } from "../services/firebase";
import { createFirestoreRefs } from "../services/firestorePaths";

function mapDocs(snapshot) {
  return snapshot.docs.map(d => ({ ...d.data(), _id: d.id }));
}

function useFinanceData({
  user,
  householdId,
  setHouseholdId,
  setSync,
  setDbLoading,
  setTxs,
  setGoals,
  setShortcuts,
  setRecurring,
  setCards,
  setShopping,
  setClosings,
  setCategoryRules,
  setInvites
}) {
  useEffect(() => {
    if (!user) return;

    const { onSnapshot, deleteDoc, getDocs, query, where } = fs;
    const refs = createFirestoreRefs({ db, fs, user, householdId });

    async function cleanSeed() {
      try {
        const st = await getDocs(refs.txCol());
        for (const d of st.docs) if (d.data().seeded) await deleteDoc(refs.ownerCollectionDoc("transactions", d.id));
        const sg = await getDocs(refs.goalCol());
        for (const d of sg.docs) if (d.data().seeded) await deleteDoc(refs.ownerCollectionDoc("goals", d.id));
      } catch (e) {}
    }
    cleanSeed();

    const handleDataError = e => {
      console.error("Erro ao carregar dados financeiros:", e);
      setSync("err");
      setDbLoading(false);
      if (householdId) {
        localStorage.removeItem("financas-household-" + user.uid);
        setHouseholdId("");
      }
    };

    const unsubT = onSnapshot(
      refs.txCol(),
      s => {
        setTxs(mapDocs(s).filter(d => !d.seeded));
        setDbLoading(false);
      },
      handleDataError
    );
    const unsubG = onSnapshot(refs.goalCol(), s => setGoals(mapDocs(s).filter(d => !d.seeded)), e => console.warn("Metas indisponiveis:", e));
    const unsubS = onSnapshot(refs.shortcutCol(), s => setShortcuts(mapDocs(s)), e => console.warn("Atalhos indisponiveis:", e));
    const unsubR = onSnapshot(refs.recurringCol(), s => setRecurring(mapDocs(s)), e => console.warn("Recorrencias indisponiveis:", e));
    const unsubC = onSnapshot(refs.cardCol(), s => setCards(mapDocs(s)), e => console.warn("Cartoes indisponiveis:", e));
    const unsubShop = onSnapshot(refs.shoppingCol(), s => setShopping(mapDocs(s)), e => console.warn("Lista de compras indisponivel:", e));
    const unsubClose = onSnapshot(
      refs.closingCol(),
      s => setClosings(mapDocs(s).sort((a, b) => (b.closedAtMs || 0) - (a.closedAtMs || 0))),
      e => console.warn("Fechamentos indisponiveis:", e)
    );
    const unsubRules = onSnapshot(
      refs.categoryRuleCol(),
      s => setCategoryRules(mapDocs(s).sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0))),
      e => console.warn("Regras indisponiveis:", e)
    );

    const email = (user.email || "").toLowerCase();
    const inviteQuery = query(refs.inviteCol(), where("toEmail", "==", email));
    const unsubI = onSnapshot(
      inviteQuery,
      s => setInvites(mapDocs(s).filter(i => i.status === "pending")),
      e => {
        console.warn("Convites indisponiveis:", e);
        setSync("err");
        setInvites([]);
      }
    );

    return () => {
      unsubT();
      unsubG();
      unsubS();
      unsubR();
      unsubC();
      unsubShop();
      unsubClose();
      unsubRules();
      unsubI();
    };
  }, [user, householdId]);
}

export { useFinanceData };
