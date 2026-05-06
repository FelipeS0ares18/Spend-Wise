import { MONTHS, Btn, EmptyState, TxRow } from "../components/appPrimitives";

export function TransactionsView({ctx}) {
  const { mobile, theme, light, filtTxs, selMonth, selYear, setShowQuickEntry, setEditing, setShowTxForm, fType, setFType, fOwner, setFOwner, togglePaid, deleteTx, openChat, userName } = ctx;
  return <div className="fade">
          <div style={{display:"flex",flexDirection:mobile?"column":"row",justifyContent:"space-between",gap:12,marginBottom:mobile?14:22}}>
            <div>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:mobile?20:26,color:theme.text}}>Transações</h1>
              <p style={{color:light?"#334155":"#64748b",marginTop:4,fontSize:12}}>{filtTxs.length} lançamentos · {MONTHS[selMonth]} {selYear}</p>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button onClick={()=>setShowQuickEntry(true)} style={{padding:"12px 16px",borderRadius:12,border:"1px solid rgba(110,231,183,.35)",background:"rgba(110,231,183,.12)",color:"#6EE7B7",cursor:"pointer",fontWeight:700}}>Entrada rápida</button><Btn onClick={()=>{setEditing(null);setShowTxForm(true);}}>+ Nova Transação</Btn></div>
          </div>
          <div className="fbar" style={{marginBottom:14}}>
            {[["all","Todos"],["income","Receitas"],["expense","Despesas"]].map(([v,l])=>(
              <button key={v} onClick={()=>setFType(v)} style={{padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",background:fType===v?"#6EE7B722":"rgba(255,255,255,.05)",color:fType===v?"#6EE7B7":"#888",fontSize:13,whiteSpace:"nowrap",flexShrink:0}}>{l}</button>
            ))}
            <div style={{width:1,background:"#ffffff15",flexShrink:0,margin:"0 4px"}}/>
            {[["all","Todos"],["casal","Casal"],["me","Somente eu"]].map(([v,l])=>(
              <button key={v} onClick={()=>setFOwner(v)} style={{padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",background:fOwner===v?"#3B82F622":"rgba(255,255,255,.05)",color:fOwner===v?"#93C5FD":"#888",fontSize:13,whiteSpace:"nowrap",flexShrink:0}}>{l}</button>
            ))}
          </div>
          <div className="card" style={{padding:0,overflow:"hidden"}}>
            {filtTxs.length===0?<div style={{padding:24}}><EmptyState title="Nenhuma transação encontrada" body="Ajuste os filtros ou mude o mês para ver outros lançamentos."/></div>:filtTxs.map((t,i)=>(
              <div key={t._id} style={{borderTop:i>0?"1px solid rgba(255,255,255,.05)":"none"}}>
                <TxRow t={t} onToggle={togglePaid} onEdit={t=>{setEditing(t);setShowTxForm(true);}} onDelete={deleteTx} onChat={openChat} mobile={mobile} userName={userName}/>
              </div>
            ))}
          </div>
        </div>;
}
