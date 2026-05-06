import { CCOLOR, fmt, theme } from "../domain/constants";
import { txStatus, creatorInfo } from "../domain/transactions";
import { Badge } from "./ui";

function TxRow({t, onToggle, onEdit, onDelete, onChat, mobile, userName}) {
  const c = CCOLOR[t.category]||"#94A3B8";
  const st = txStatus(t);
  const creator = creatorInfo(t,userName);
  const ownerLabel = t.owner==="casal" ? "Casal" : userName;
  const ownerColor = t.owner==="casal" ? "#6EE7B7" : "#F9A8D4";
  return <div className="tx-row" style={{display:"flex",alignItems:"center",gap:10,padding:mobile?"11px 14px":"12px 20px",borderLeft:`3px solid ${st.color}`,transition:"background .15s"}}>
    <button onClick={()=>onToggle(t)} title={st.label} style={{width:20,height:20,borderRadius:6,border:`2px solid ${st.color}`,background:t.paid?st.color+"22":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
      {t.paid&&<span style={{color:st.color,fontSize:11}}>✓</span>}
    </button>
    <div title={"Criado por "+creator.name} style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#334155,#0f172a)",border:`1px solid ${st.color}66`,color:"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0}}>
      {creator.initials}
    </div>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontSize:14,color:theme.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.desc}</div>
      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3,overflow:"hidden"}}>
        <Badge color={st.color}>{st.label}</Badge>
        <Badge color={c}>{t.category}</Badge>
        {!mobile&&<Badge color={ownerColor}>{ownerLabel}</Badge>}
        {!mobile&&<span style={{fontSize:11,color:"#64748b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{creator.name}</span>}
        <span style={{fontSize:11,color:"#475569",flexShrink:0}}>{new Date(t.date+"T12:00:00").toLocaleDateString("pt-BR")}</span>
      </div>
    </div>
    <div style={{fontFamily:"'DM Mono',monospace",fontSize:mobile?12:14,fontWeight:600,color:t.type==="income"?"#6EE7B7":"#F87171",flexShrink:0,textAlign:"right"}}>
      {t.type==="income"?"+":"-"}{fmt(t.amount)}
    </div>
    <div style={{display:"flex",gap:4,flexShrink:0}}>      {t.receiptData&&<button onClick={()=>{const w=window.open(""); if(w) w.document.write('<img src="'+t.receiptData+'" style="max-width:100%;height:auto"/>');}} style={{background:"rgba(255,255,255,.05)",border:"none",borderRadius:6,padding:"5px 8px",color:"#FCD34D",cursor:"pointer",fontSize:12}}>REC</button>}

      <button onClick={()=>onChat(t)} style={{background:(t.notesCount||0)>0?"#6EE7B722":"rgba(255,255,255,.05)",border:"none",borderRadius:6,padding:"5px 8px",color:(t.notesCount||0)>0?"#6EE7B7":"#94a3b8",cursor:"pointer",fontSize:12}}>MSG{(t.notesCount||0)>0?" "+t.notesCount:""}</button>
      <button onClick={()=>onEdit(t)} style={{background:"rgba(255,255,255,.05)",border:"none",borderRadius:6,padding:"5px 8px",color:theme.nav,cursor:"pointer",fontSize:12}}>✎</button>
      <button onClick={()=>onDelete(t)} style={{background:"#F8717111",border:"none",borderRadius:6,padding:"5px 8px",color:"#F87171",cursor:"pointer",fontSize:12}}>✕</button>
    </div>
  </div>;
}

export { TxRow };
