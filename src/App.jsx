import { useState, useEffect } from "react";
import { buildFinanceHealth, buildFinanceInsights } from "./domain/financeMetrics";
import { lazy, Suspense } from "react";
import { useCalendarSelection } from "./hooks/useCalendarSelection";
import { useCategoryRuleActions } from "./hooks/useCategoryRuleActions";
import { useFinanceData } from "./hooks/useFinanceData";
import { useFinanceActions } from "./hooks/useFinanceActions";
import { useFinanceModals } from "./hooks/useFinanceModals";
import { useGlobalSearch } from "./hooks/useGlobalSearch";
import { useHouseholdActions } from "./hooks/useHouseholdActions";
import { useImportActions } from "./hooks/useImportActions";
import { useImportState } from "./hooks/useImportState";
import { useMobileNavigation } from "./hooks/useMobileNavigation";
import { useNotifications } from "./hooks/useNotifications";
import { usePeriodSelection } from "./hooks/usePeriodSelection";
import { useMonthlyClosingActions } from "./hooks/useMonthlyClosingActions";
import { useProfileActions } from "./hooks/useProfileActions";
import { useThemeMode } from "./hooks/useThemeMode";
import { useTransactionFilters } from "./hooks/useTransactionFilters";
import { useUserProfile } from "./hooks/useUserProfile";
import { createFinanceRepository } from "./services/financeRepository";
import { createFirestoreRefs } from "./services/firestorePaths";
import { createHouseholdRepository } from "./services/householdRepository";
import { createCategoryRulesRepository, guessCategory as guessCategoryFromRules, matchCategoryRule as matchCategoryRuleFromRules } from "./services/categoryRulesRepository";
import { createMonthlyClosingRepository } from "./services/monthlyClosingRepository";
import { createStatementImportService } from "./services/statementImportService";
import { createUserRepository } from "./services/userRepository";
import { auth, authApi, db, fs } from "./services/firebase";
import { CalendarDayModal, DesktopSidebar, FloatingActionButton, MobileBottomNav, MobileDrawer, MobileNavSettingsModal, MobileTopBar } from "./components/layout";
import {
  MONTHS,
  CATS,
  CCOLOR,
  fmt,
  pct,
  useWidth,
  Spin,
  Bar,
  Badge,
  txStatus,
  creatorInfo,
  OnboardingCard,
  CommercialInsightsGrid,
  EmptyState,
  Btn,
  Portal,
  Modal,
  ModalCard,
  AuthScreen,
  PasswordResetScreen,
  TxForm,
  QuickEntryForm,
  GoalForm,
  ShortcutForm,
  ChatModal,
  Field,
  inputBase,
  RecurringForm,
  CardForm,
  PurchaseForm,
  ShoppingForm,
  DepositForm,
  TxRow
} from "./components/appPrimitives";

const CalendarView = lazy(() => import("./views/CalendarView").then(m => ({ default: m.CalendarView })));
const CardsView = lazy(() => import("./views/CardsView").then(m => ({ default: m.CardsView })));
const ClosingView = lazy(() => import("./views/ClosingView").then(m => ({ default: m.ClosingView })));
const DashboardView = lazy(() => import("./views/DashboardView").then(m => ({ default: m.DashboardView })));
const GoalsView = lazy(() => import("./views/GoalsView").then(m => ({ default: m.GoalsView })));
const ImportView = lazy(() => import("./views/ImportView").then(m => ({ default: m.ImportView })));
const NotificationsView = lazy(() => import("./views/NotificationsView").then(m => ({ default: m.NotificationsView })));
const ProfileView = lazy(() => import("./views/ProfileView").then(m => ({ default: m.ProfileView })));
const RecurringView = lazy(() => import("./views/RecurringView").then(m => ({ default: m.RecurringView })));
const ReportView = lazy(() => import("./views/ReportView").then(m => ({ default: m.ReportView })));
const RulesView = lazy(() => import("./views/RulesView").then(m => ({ default: m.RulesView })));
const SearchView = lazy(() => import("./views/SearchView").then(m => ({ default: m.SearchView })));
const SharedAccountView = lazy(() => import("./views/SharedAccountView").then(m => ({ default: m.SharedAccountView })));
const ShoppingView = lazy(() => import("./views/ShoppingView").then(m => ({ default: m.ShoppingView })));
const ShortcutsView = lazy(() => import("./views/ShortcutsView").then(m => ({ default: m.ShortcutsView })));
const TransactionsView = lazy(() => import("./views/TransactionsView").then(m => ({ default: m.TransactionsView })));

function App() {
  const query = new URLSearchParams(window.location.search);
  const resetCode = query.get("mode") === "resetPassword" ? query.get("oobCode") : "";
  const width  = useWidth();
  const mobile = width <= 768;
  if (resetCode) return <PasswordResetScreen actionCode={resetCode}/>;

  const [user,      setUser]      = useState(null);
  const [authDone,  setAuthDone]  = useState(false);
  const [txs,       setTxs]       = useState([]);
  const [goals,     setGoals]     = useState([]);
  const [shortcuts, setShortcuts] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [cards,     setCards]     = useState([]);
  const [shopping,  setShopping]  = useState([]);
  const [invites,   setInvites]   = useState([]);
  const [closings,  setClosings]  = useState([]);
  const [categoryRules,setCategoryRules]=useState([]);
  const [householdId,setHouseholdId]=useState("");
  const [dbLoading, setDbLoading] = useState(true);
  const [view,      setView]      = useState("dashboard");
  const [partnerEmail,setPartnerEmail]=useState("");
  const [joinCode,setJoinCode]=useState("");
  const [sync,      setSync]      = useState("ok"); // ok | saving | err
  const [profileName,setProfileName]=useState("");
  const [profilePhone,setProfilePhone]=useState("");
  const [profileSaving,setProfileSaving]=useState(false);
  const [whatsappCode,setWhatsappCode]=useState("");
  const [whatsappConnectedPhone,setWhatsappConnectedPhone]=useState("");
  const [onboardingHidden,setOnboardingHidden]=useState(false);
  const [ruleText,setRuleText]=useState("");
  const [ruleCategory,setRuleCategory]=useState("Outros");
  const now = new Date();
  const { light, theme, toggleTheme } = useThemeMode();
  const {
    mobileMenuOpen,setMobileMenuOpen,showMobileNavSettings,setShowMobileNavSettings,
    mobileNavIds,navItems,mobileNavItems,goView,toggleMobileNav
  } = useMobileNavigation({setView});
  const {
    showTxForm,setShowTxForm,showQuickEntry,setShowQuickEntry,editing,setEditing,
    showGoal,setShowGoal,showShortcut,setShowShortcut,editingShortcut,setEditingShortcut,
    activeChat,chatMessages,setChatMessages,chatDraft,setChatDraft,showRecurringForm,
    setShowRecurringForm,showCardForm,setShowCardForm,purchaseCard,setPurchaseCard,
    showShoppingForm,setShowShoppingForm,depositGoal,setDepositGoal,openChat,closeChat,
    closeTxForm,closeShortcutForm
  } = useFinanceModals();
  const {
    importText,setImportText,importRows,setImportRows,importFileName,setImportFileName,
    importSaving,setImportSaving,updateImportRow,removeImportRow,resetImport
  } = useImportState();

  /* auth state */
  useEffect(()=>{
    const unsub = authApi.onAuthStateChanged(auth, u=>{
      setUser(u);
      setProfileName(u?.displayName||"");
      setProfilePhone(u?localStorage.getItem("financas-profile-phone-"+u.uid)||"": "");
      setHouseholdId(u?localStorage.getItem("financas-household-"+u.uid)||"": "");
      setOnboardingHidden(false);
      setAuthDone(true);
    });
    return()=>unsub();
  },[]);

  useUserProfile({
    user,householdId,setHouseholdId,setProfileName,setProfilePhone,
    setWhatsappCode,setWhatsappConnectedPhone,setOnboardingHidden
  });

  useFinanceData({
    user,householdId,setHouseholdId,setSync,setDbLoading,setTxs,setGoals,setShortcuts,
    setRecurring,setCards,setShopping,setClosings,setCategoryRules,setInvites
  });

  /* â”€â”€ crud â”€â”€ */
  const refs=createFirestoreRefs({db,fs,user,householdId});
  const uid = refs.ownerId;
  const financeRepo=createFinanceRepository({fs,refs});
  const userRepo=createUserRepository({db,fs,authApi});
  const householdRepo=createHouseholdRepository({db,fs,userRepo});
  const categoryRulesRepo=createCategoryRulesRepository({fs,refs});
  const statementImportService=createStatementImportService({fs,refs});
  const monthlyClosingRepo=createMonthlyClosingRepository({fs,refs,pct});
  const { sendInvite,answerInvite,refreshInvites,joinHouseholdByCode } = useHouseholdActions({
    user,householdId,joinCode,partnerEmail,householdRepo,setHouseholdId,
    setInvites,setJoinCode,setPartnerEmail,setSync,setView
  });

  const matchCategoryRule=desc=>matchCategoryRuleFromRules(desc,categoryRules);
  const guessCategory=(desc,type)=>guessCategoryFromRules(desc,type,categoryRules);
  const { deleteCategoryRule,saveCategoryRule } = useCategoryRuleActions({
    categoryRulesRepo,ruleCategory,ruleText,setCategoryRules,setRuleCategory,setRuleText,setSync
  });
  const { generateWhatsappCode,saveProfile } = useProfileActions({
    householdId,profileName,profilePhone,setProfileName,setProfilePhone,
    setProfileSaving,setSync,setWhatsappCode,user,userRepo
  });

  useEffect(()=>{
    if(!activeChat||!user)return;
    const col=refs.transactionMessagesCollection(activeChat._id);
    const unsub=fs.onSnapshot(col,s=>{
      setChatMessages(s.docs.map(d=>({...d.data(),_id:d.id})).sort((a,b)=>(a.createdAtMs||0)-(b.createdAtMs||0)));
    });
    return()=>unsub();
  },[activeChat,user,householdId]);

  async function sendChatMessage(){
    const text=chatDraft.trim();
    if(!text||!activeChat)return;
    setChatDraft("");
    try{
      await fs.addDoc(refs.transactionMessagesCollection(activeChat._id),{text,authorEmail:user.email,authorName:user.displayName||"Eu",createdAtMs:Date.now(),createdAtText:new Date().toLocaleString("pt-BR")});
      await fs.updateDoc(refs.ownerCollectionDoc("transactions",activeChat._id),{notesCount:(activeChat.notesCount||0)+1});
    }catch(e){setSync("err");alert("Erro: "+e.message);}
  }



  async function logout(){
    await authApi.signOut(auth);
  }

  /* â”€â”€ derived â”€â”€ */
  const { selMonth, selYear, goMonth, monthTxs } = usePeriodSelection(txs, now);

  const MonthPicker=({compact=false})=>(
    <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.07)",borderRadius:8,padding:compact?"5px 10px":"10px 14px"}}>
      <button onClick={()=>goMonth(1)} style={{background:"none",border:"none",color:light?"#475569":"#888",cursor:"pointer",fontSize:16,lineHeight:1,padding:"0 2px"}}>â€¹</button>
      <span style={{fontFamily:"'DM Mono',monospace",fontSize:compact?12:13,color:theme.text,minWidth:compact?56:70,textAlign:"center"}}>{MONTHS[selMonth]} {selYear}</span>
      <button onClick={()=>goMonth(-1)} style={{background:"none",border:"none",color:light?"#475569":"#888",cursor:"pointer",fontSize:16,lineHeight:1,padding:"0 2px"}}>â€º</button>
    </div>
  );

  const income  =monthTxs.filter(t=>t.type==="income"&&t.paid).reduce((s,t)=>s+t.amount,0);
  const expense =monthTxs.filter(t=>t.type==="expense"&&t.paid).reduce((s,t)=>s+t.amount,0);
  const pending =monthTxs.filter(t=>!t.paid).length;
  const balance =income-expense;

  const byCat={};
  monthTxs.filter(t=>t.type==="expense").forEach(t=>{byCat[t.category]=(byCat[t.category]||0)+t.amount;});
  const topCats=Object.entries(byCat).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxCat=topCats[0]?.[1]||1;

  const { fOwner,setFOwner,fType,setFType,filtTxs } = useTransactionFilters(monthTxs);

  const { globalSearch,setGlobalSearch,searchQ,searchResults } = useGlobalSearch({txs,goals,recurring,cards,shopping,shortcuts,fmt});
  const { selectedCalendarDay,setSelectedCalendarDay,calendarCells,selectedCalendarTxs,selectedCalendarRecurring } = useCalendarSelection({selMonth,selYear,monthTxs,recurring});
  const cardSpend=cards.map(card=>({...card,used:txs.filter(t=>t.cardId===card._id&&t.type==="expense").reduce((s,t)=>s+t.amount,0)}));
  const pendingShopping=shopping.filter(i=>!i.done);
  const { notifEnabled,enableNotifications,dueRecurring } = useNotifications({uid,monthTxs,recurring,householdId});
  const { handleOfxFile,parseStatement,saveImportedRows } = useImportActions({
    guessCategory,householdId,importRows,setImportFileName,setImportRows,setImportSaving,
    setImportText,setSync,selMonth,selYear,statementImportService,resetImport,user
  });
  const { closeSelectedMonth,reopenClosing } = useMonthlyClosingActions({
    balance,expense,goals,income,monthTxs,monthlyClosingRepo,pending,selMonth,selYear,setSync,topCats
  });
  const {
    addShoppingItem,deleteCard,deleteGoal,deleteRecurring,deleteShortcut,deleteShoppingItem,
    deleteTx,generateRecurring,launchShortcut,saveCard,saveCardPurchase,saveGoal,
    saveGoalDeposit,saveQuickEntry,saveRecurring,saveShortcut,saveTx,togglePaid,toggleShoppingItem
  } = useFinanceActions({
    financeRepo,matchCategoryRule,user,profileName,editing,editingShortcut,selMonth,selYear,
    closeTxForm,closeShortcutForm,setDepositGoal,setPurchaseCard,setShowCardForm,setShowGoal,
    setShowQuickEntry,setShowRecurringForm,setShowShoppingForm,setSync
  });

  const financeHealth=buildFinanceHealth({income,expense,balance,pending,monthTxs,goals,recurring});
  const financeInsights=buildFinanceInsights({income,expense,balance,pending,monthTxs,recurring,goals,topCats,selMonth,selYear});
  const onboardingSteps=[
    {id:"profile",icon:"1",title:"Completar perfil",body:"Nome e telefone ajudam no compartilhamento e no WhatsApp.",done:!!(profileName&&profileName.trim()),view:"profile"},
    {id:"first-tx",icon:"2",title:"Primeiro lancamento",body:"Use texto, voz ou WhatsApp para registrar uma movimentacao.",done:txs.length>0,quick:true},
    {id:"whatsapp",icon:"3",title:"Conectar WhatsApp",body:"Receba entradas pelo Twilio Sandbox enquanto validamos o produto.",done:!!whatsappConnectedPhone,view:"profile"},
    {id:"goal",icon:"4",title:"Criar uma meta",body:"Mostre para onde o dinheiro deve ir, nao so onde ele foi gasto.",done:goals.length>0,view:"goals"}
  ];
  const onboardingProgress=Math.round(onboardingSteps.filter(s=>s.done).length/onboardingSteps.length*100);
  const showOnboarding=!onboardingHidden&&onboardingProgress<100;
  const hideOnboarding=async()=>{
    setOnboardingHidden(true);
    if(!user)return;
    setSync("saving");
    try{
      await userRepo.hideOnboarding(user);
      setSync("ok");
    }catch(e){
      setSync("err");
      console.warn("Nao foi possivel salvar preferencia do onboarding:",e);
    }
  };
  const runOnboardingAction=step=>{if(step.quick){setShowQuickEntry(true);return;} if(step.view)setView(step.view);};

  const syncColor=sync==="saving"?"#FCD34D":sync==="err"?"#F87171":"#4ade80";
  const userName =profileName||user?.displayName||"Eu";
  const dashboardCtx={
    mobile,theme,light,userName,selMonth,selYear,now,balance,invites,setView,setShowQuickEntry,
    pendingShopping,showOnboarding,onboardingSteps,onboardingProgress,hideOnboarding,runOnboardingAction,
    financeHealth,financeInsights,income,expense,pending,shortcuts,launchShortcut,topCats,maxCat,
    goals,monthTxs,togglePaid,setEditing,setShowTxForm,deleteTx,openChat
  };
  const transactionsCtx={
    mobile,theme,light,filtTxs,selMonth,selYear,setShowQuickEntry,setEditing,setShowTxForm,
    fType,setFType,fOwner,setFOwner,togglePaid,deleteTx,openChat,userName
  };
  const searchCtx={
    mobile,theme,light,globalSearch,setGlobalSearch,searchQ,searchResults,setView
  };
  const calendarCtx={
    mobile,theme,light,selMonth,selYear,monthTxs,recurring,calendarCells,MonthPicker,setSelectedCalendarDay
  };
  const closingCtx={
    mobile,theme,light,selMonth,income,expense,balance,pending,closings,closeSelectedMonth,reopenClosing
  };
  const rulesCtx={
    mobile,theme,light,ruleText,setRuleText,ruleCategory,setRuleCategory,
    saveCategoryRule,categoryRules,deleteCategoryRule
  };
  const importCtx={
    mobile,theme,light,importRows,importSaving,importFileName,setImportRows,setImportFileName,
    setImportText,saveImportedRows,handleOfxFile,updateImportRow,removeImportRow,guessCategory
  };
  const notificationsCtx={
    mobile,theme,light,notifEnabled,enableNotifications,monthTxs,dueRecurring
  };
  const recurringCtx={
    mobile,theme,light,recurring,setShowRecurringForm,generateRecurring,deleteRecurring
  };
  const cardsCtx={
    mobile,theme,light,cardSpend,setShowCardForm,setPurchaseCard,deleteCard
  };
  const shoppingCtx={
    mobile,theme,light,shopping,pendingShopping,setShowShoppingForm,toggleShoppingItem,deleteShoppingItem
  };
  const shortcutsCtx={
    mobile,theme,light,shortcuts,setEditingShortcut,setShowShortcut,launchShortcut,deleteShortcut
  };
  const sharedAccountCtx={
    mobile,theme,light,householdId,user,partnerEmail,setPartnerEmail,sendInvite,
    joinCode,setJoinCode,joinHouseholdByCode,refreshInvites,invites,answerInvite
  };
  const profileCtx={
    mobile,theme,light,user,userName,profileName,setProfileName,profilePhone,setProfilePhone,
    profileSaving,saveProfile,whatsappCode,generateWhatsappCode,sync,syncColor,householdId
  };
  const goalsCtx={
    mobile,theme,light,goals,showGoal,setShowGoal,saveGoal,setDepositGoal,deleteGoal
  };
  const reportCtx={
    mobile,theme,light,selMonth,selYear,income,expense,balance,monthTxs,topCats
  };

  /* â”€â”€ guards â”€â”€ */
  if(!authDone) return <Spin/>;
  if(!user) return <AuthScreen/>;
  if(dbLoading) return <Spin/>;

    return <div style={{display:"flex",flexDirection:"column",minHeight:"100dvh",height:"100dvh",background:theme.page,color:theme.text,overflow:"hidden"}}>

    {mobile&&<MobileTopBar light={light} logout={logout} MonthPicker={MonthPicker} setMobileMenuOpen={setMobileMenuOpen} syncColor={syncColor} theme={theme} toggleTheme={toggleTheme}/>}
    {mobile&&mobileMenuOpen&&<MobileDrawer goView={goView} light={light} navItems={navItems} setMobileMenuOpen={setMobileMenuOpen} setShowMobileNavSettings={setShowMobileNavSettings} sync={sync} syncColor={syncColor} theme={theme} toggleTheme={toggleTheme} user={user} userName={userName} view={view}/>}

    <div style={{display:"flex",flex:1,overflow:"hidden"}}>

      {!mobile&&<DesktopSidebar balance={balance} goMonth={goMonth} light={light} logout={logout} navItems={navItems} selMonth={selMonth} selYear={selYear} setView={setView} sync={sync} syncColor={syncColor} theme={theme} toggleTheme={toggleTheme} user={user} userName={userName} view={view}/>}

      {/* â”€â”€ main â”€â”€ */}
      <main style={{flex:1,minWidth:0,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",padding:mobile?"12px 10px calc(168px + env(safe-area-inset-bottom, 0px))":"28px 32px"}}>

        <Suspense fallback={<Spin/>}>
          {view==="dashboard"&&<DashboardView ctx={dashboardCtx}/>}
          {view==="transactions"&&<TransactionsView ctx={transactionsCtx}/>}
          {view==="search"&&<SearchView ctx={searchCtx}/>}
          {view==="calendar"&&<CalendarView ctx={calendarCtx}/>}
          {view==="closing"&&<ClosingView ctx={closingCtx}/>}
          {view==="rules"&&<RulesView ctx={rulesCtx}/>}
          {view==="import"&&<ImportView ctx={importCtx}/>}
          {view==="notifications"&&<NotificationsView ctx={notificationsCtx}/>}
          {view==="recurring"&&<RecurringView ctx={recurringCtx}/>}
          {view==="cards"&&<CardsView ctx={cardsCtx}/>}
          {view==="shopping"&&<ShoppingView ctx={shoppingCtx}/>}
          {view==="shortcuts"&&<ShortcutsView ctx={shortcutsCtx}/>}
          {view==="shared"&&<SharedAccountView ctx={sharedAccountCtx}/>}
          {view==="profile"&&<ProfileView ctx={profileCtx}/>}
          {view==="goals"&&<GoalsView ctx={goalsCtx}/>}
          {view==="report"&&<ReportView ctx={reportCtx}/>}
        </Suspense>

        {mobile&&<div aria-hidden="true" style={{height:"calc(76px + env(safe-area-inset-bottom, 0px))",flexShrink:0}}/>}
      </main>
    </div>

    {mobile&&<MobileBottomNav light={light} mobileNavItems={mobileNavItems} setMobileMenuOpen={setMobileMenuOpen} goView={goView} view={view}/>}

    <FloatingActionButton mobile={mobile} theme={theme} onAdd={()=>{setEditing(null);setShowTxForm(true);}}/>

    {selectedCalendarDay&&<CalendarDayModal generateRecurring={generateRecurring} light={light} onClose={()=>setSelectedCalendarDay(null)} onEditTransaction={t=>{setEditing(t);setShowTxForm(true);setSelectedCalendarDay(null);}} selectedCalendarDay={selectedCalendarDay} selectedCalendarRecurring={selectedCalendarRecurring} selectedCalendarTxs={selectedCalendarTxs} selMonth={selMonth} theme={theme} togglePaid={togglePaid} userName={userName}/>}
    {showTxForm&&<TxForm editing={editing} onSave={saveTx} onClose={closeTxForm}/>}
    {showQuickEntry&&<QuickEntryForm onSave={saveQuickEntry} onClose={()=>setShowQuickEntry(false)}/>} 
    {showShortcut&&<ShortcutForm editing={editingShortcut} user={user} onSave={saveShortcut} onClose={closeShortcutForm}/>}
    <ChatModal tx={activeChat} messages={chatMessages} draft={chatDraft} setDraft={setChatDraft} onSend={sendChatMessage} onClose={closeChat}/>
    {showRecurringForm&&<RecurringForm onSave={saveRecurring} onClose={()=>setShowRecurringForm(false)}/>}
    {showCardForm&&<CardForm onSave={saveCard} onClose={()=>setShowCardForm(false)}/>}
    {purchaseCard&&<PurchaseForm card={purchaseCard} onSave={saveCardPurchase} onClose={()=>setPurchaseCard(null)}/>}
    {showShoppingForm&&<ShoppingForm onSave={addShoppingItem} onClose={()=>setShowShoppingForm(false)}/>} 
    {showMobileNavSettings&&<MobileNavSettingsModal theme={theme} navItems={navItems} mobileNavIds={mobileNavIds} toggleMobileNav={toggleMobileNav} onClose={()=>setShowMobileNavSettings(false)}/>}
    {depositGoal&&<DepositForm goal={depositGoal} onSave={saveGoalDeposit} onClose={()=>setDepositGoal(null)}/>} 
  </div>;
}

function Root() {
  return <App/>;
}

export default Root;
