import { useState, useEffect, useRef } from "react";
import { CATS, theme, light } from "../domain/constants";
import { Btn, Modal, ModalCard } from "./ui";
import { parseNaturalTransaction } from "../domain/naturalParser";
import { auth } from "../services/firebase";

function TxForm({onSave, onClose, editing}) {
  const [f, setF] = useState(editing||{desc:"",amount:"",type:"expense",category:"Outros",owner:"casal",date:new Date().toISOString().split("T")[0],paid:false});
  const [err, setErr] = useState("");
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const user = auth.currentUser;
  const userName = user?.displayName||"Eu";

  function save() {
    if (!f.desc.trim()) { setErr("Informe a descrição."); return; }
    if (!f.amount||isNaN(f.amount)||parseFloat(f.amount)<=0) { setErr("Informe um valor válido."); return; }
    onSave({...f, amount:parseFloat(f.amount)});
  }

  function attachReceipt(file) {
    if(!file)return;
    if(file.size > 900000){ setErr("Imagem muito grande. Use um comprovante menor."); return; }
    const reader = new FileReader();
    reader.onload = () => set("receiptData", reader.result);
    reader.readAsDataURL(file);
  }

  const inp = {width:"100%",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,padding:"11px 14px",color:theme.text,fontSize:15,outline:"none"};
  const lbl = {fontSize:12,color:theme.nav,display:"block",marginBottom:7,fontWeight:600,letterSpacing:".04em",textTransform:"uppercase"};

  return <Modal onClose={onClose}>
    <ModalCard>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:theme.text}}>{editing?"Editar":"Nova"} Transação</h2>
        <button onClick={onClose} style={{background:"rgba(255,255,255,.08)",border:"none",borderRadius:8,width:32,height:32,color:"#aaa",cursor:"pointer",fontSize:18}}>×</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {/* Tipo */}
        <div style={{display:"flex",gap:10}}>
          {["income","expense"].map(t=>(
            <button key={t} onClick={()=>set("type",t)} style={{flex:1,padding:11,borderRadius:10,border:"none",cursor:"pointer",background:f.type===t?(t==="income"?"#6EE7B733":"#F8717133"):"rgba(255,255,255,.05)",color:f.type===t?(t==="income"?"#6EE7B7":"#F87171"):"#888",fontWeight:600,fontSize:14}}>
              {t==="income"?"⬆ Receita":"⬇ Despesa"}
            </button>
          ))}
        </div>
        {/* Campos */}
        {[{label:"Descrição",key:"desc",type:"text",ph:"Ex: Supermercado"},{label:"Valor (R$)",key:"amount",type:"number",ph:"0,00"},{label:"Data",key:"date",type:"date",ph:""}].map(fi=>(
          <div key={fi.key}>
            <label style={lbl}>{fi.label}</label>
            <input type={fi.type} value={f[fi.key]} placeholder={fi.ph} onChange={e=>set(fi.key,e.target.value)} style={inp}/>
          </div>
        ))}
        {/* Categoria */}
        <div>
          <label style={lbl}>Categoria</label>
          <select value={f.category} onChange={e=>set("category",e.target.value)} style={{...inp,cursor:"pointer"}}>
            {CATS.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {/* Responsável */}
        <div>
          <label style={lbl}>Responsável</label>
          <div style={{display:"flex",gap:8}}>
            {[["casal","👫 Casal","#6EE7B7"],[user?.uid||"eu", userName,"#F9A8D4"]].map(([v,l,c])=>(
              <button key={v} onClick={()=>set("owner",v)} style={{flex:1,padding:10,borderRadius:10,border:"none",cursor:"pointer",background:f.owner===v?c+"22":"rgba(255,255,255,.04)",color:f.owner===v?c:"#888",fontSize:13,fontWeight:f.owner===v?600:400}}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {/* Pago */}
        <div style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer",padding:"4px 0"}} onClick={()=>set("paid",!f.paid)}>
          <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${f.paid?"#6EE7B7":"#444"}`,background:f.paid?"#6EE7B722":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {f.paid&&<span style={{color:"#6EE7B7",fontSize:13}}>✓</span>}
          </div>
          <span style={{color:"#aaa",fontSize:14}}>Já pago / recebido</span>
        </div>
        <div>
          <label style={lbl}>Comprovante</label>
          <input type="file" accept="image/*" onChange={e=>attachReceipt(e.target.files?.[0])} style={{...inp,padding:"9px 12px"}}/>
          {f.receiptData&&<div style={{marginTop:8,display:"flex",alignItems:"center",gap:10}}><img src={f.receiptData} style={{width:48,height:48,objectFit:"cover",borderRadius:8,border:"1px solid rgba(255,255,255,.12)"}}/><button onClick={()=>set("receiptData","")} style={{background:"#F8717111",border:"none",borderRadius:8,padding:"7px 10px",color:"#F87171",cursor:"pointer",fontSize:12}}>Remover</button></div>}
        </div>
        {err&&<div style={{background:"#F8717122",border:"1px solid #F8717155",borderRadius:8,padding:"10px 14px",color:"#F87171",fontSize:13}}>{err}</div>}
        <Btn onClick={save} style={{padding:14,fontSize:15,marginTop:4}}>{editing?"Salvar alterações":"Adicionar transação"}</Btn>
      </div>
    </ModalCard>
  </Modal>;
}


function QuickEntryForm({onSave,onClose}) {
  const user = auth.currentUser;
  const [text,setText] = useState("");
  const [f,setF] = useState(parseNaturalTransaction("",user));
  const [err,setErr] = useState("");
  const [listening,setListening] = useState(false);
  const recRef = useRef(null);
  const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
  const speechSupported = !!Speech;
  const inp = {width:"100%",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,padding:"11px 14px",color:theme.text,fontSize:15,outline:"none"};
  const lbl = {fontSize:12,color:theme.nav,display:"block",marginBottom:7,fontWeight:600,letterSpacing:".04em",textTransform:"uppercase"};

  function applyText(nextText) {
    setText(nextText);
    setF(parseNaturalTransaction(nextText,user));
    setErr("");
  }
  function set(k,v){ setF(p=>({...p,[k]:v})); }
  function startVoice() {
    if(!speechSupported){ setErr("Entrada por voz indisponível neste navegador."); return; }
    try{
      const rec = new Speech();
      rec.lang = "pt-BR";
      rec.continuous = false;
      rec.interimResults = false;
      rec.onstart = () => setListening(true);
      rec.onerror = () => { setListening(false); setErr("Não consegui ouvir. Tente novamente ou digite a frase."); };
      rec.onend = () => setListening(false);
      rec.onresult = e => {
        const spoken = Array.from(e.results).map(r=>r[0]?.transcript||"").join(" ").trim();
        if(spoken) applyText(spoken);
      };
      recRef.current = rec;
      rec.start();
    }catch(e){ setListening(false); setErr("Não foi possível iniciar o microfone."); }
  }
  function stopVoice(){
    try{ recRef.current?.stop(); }catch(e){}
    setListening(false);
  }
  function save(){
    if(!f.desc.trim()){ setErr("Informe ou dite uma descrição."); return; }
    if(!f.amount||isNaN(f.amount)||Number(f.amount)<=0){ setErr("Não encontrei um valor válido. Ex: paguei 89,90 no mercado ontem."); return; }
    onSave({...f,amount:Number(f.amount)});
  }
  useEffect(()=>()=>{try{recRef.current?.stop();}catch(e){}},[]);

  return <Modal onClose={onClose}><ModalCard>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <div><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:theme.text}}>Entrada rápida</h2><div style={{color:light?"#334155":"#64748b",fontSize:12,marginTop:4}}>Digite ou fale uma frase com valor, data e categoria. Você confirma antes de salvar.</div></div>
      <button onClick={onClose} style={{background:"rgba(255,255,255,.08)",border:"none",borderRadius:8,width:32,height:32,color:"#aaa",cursor:"pointer",fontSize:18}}>×</button>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div>
        <label style={lbl}>Frase</label>
        <textarea autoFocus value={text} onChange={e=>applyText(e.target.value)} placeholder="Ex: paguei 89,90 no mercado ontem categoria Alimentação" rows={3} style={{...inp,resize:"vertical",lineHeight:1.4}}/>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button onClick={listening?stopVoice:startVoice} style={{padding:"10px 12px",borderRadius:9,border:"1px solid rgba(255,255,255,.12)",background:listening?"#F871711A":"#6EE7B71A",color:listening?"#F87171":"#6EE7B7",cursor:"pointer",fontWeight:700,fontSize:13}}>{listening?"Parar voz":"Falar"}</button>
        {["paguei 89,90 no mercado ontem categoria Alimentação","recebi 300 de pix hoje categoria Salário","conta de luz 210 vence dia 12 categoria Utilidades"].map(ex=><button key={ex} onClick={()=>applyText(ex)} style={{padding:"10px 12px",borderRadius:9,border:"none",background:"rgba(255,255,255,.05)",color:theme.nav,cursor:"pointer",fontSize:12}}>{ex}</button>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div><label style={lbl}>Tipo</label><select value={f.type} onChange={e=>set("type",e.target.value)} style={inp}><option value="expense">Despesa</option><option value="income">Receita</option></select></div>
        <div><label style={lbl}>Valor</label><input type="number" value={f.amount} onChange={e=>set("amount",e.target.value)} style={inp}/></div>
      </div>
      <div><label style={lbl}>Descrição</label><input value={f.desc} onChange={e=>set("desc",e.target.value)} style={inp}/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div><label style={lbl}>Categoria</label><select value={f.category} onChange={e=>set("category",e.target.value)} style={inp}>{CATS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
        <div><label style={lbl}>Data</label><input type="date" value={f.date} onChange={e=>set("date",e.target.value)} style={inp}/></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>set("paid",!f.paid)}>
        <div style={{width:22,height:22,borderRadius:6,border:"2px solid "+(f.paid?"#6EE7B7":"#444"),background:f.paid?"#6EE7B722":"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>{f.paid&&<span style={{color:"#6EE7B7",fontSize:13}}>✓</span>}</div>
        <span style={{color:"#aaa",fontSize:14}}>Já pago / recebido</span>
      </div>
      {err&&<div style={{background:"#F8717122",border:"1px solid #F8717155",borderRadius:8,padding:"10px 14px",color:"#F87171",fontSize:13}}>{err}</div>}
      <Btn onClick={save} style={{padding:14,fontSize:15}}>Confirmar lançamento</Btn>
    </div>
  </ModalCard></Modal>;
}

/* ─── GOAL FORM ──────────────────────────────────────────────── */
function GoalForm({onSave, onClose}) {
  const [g, setG] = useState({name:"",target:"",icon:"🎯",color:"#6EE7B7"});
  const [err, setErr] = useState("");
  const set = (k,v) => setG(p=>({...p,[k]:v}));

  function save() {
    if (!g.name.trim()) { setErr("Informe o nome da meta."); return; }
    if (!g.target||isNaN(g.target)||parseFloat(g.target)<=0) { setErr("Informe um valor válido."); return; }
    onSave({...g, target:parseFloat(g.target), saved:0});
  }

  const inp = {width:"100%",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,padding:"11px 14px",color:theme.text,fontSize:15,outline:"none"};
  const lbl = {fontSize:12,color:theme.nav,display:"block",marginBottom:7,fontWeight:600,letterSpacing:".04em",textTransform:"uppercase"};

  return <Modal onClose={onClose}>
    <ModalCard>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:theme.text}}>Nova Meta</h2>
        <button onClick={onClose} style={{background:"rgba(255,255,255,.08)",border:"none",borderRadius:8,width:32,height:32,color:"#aaa",cursor:"pointer",fontSize:18}}>×</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {[{label:"Nome da meta",key:"name",ph:"Ex: Viagem para Europa"},{label:"Valor alvo (R$)",key:"target",ph:"Ex: 5000",type:"number"},{label:"Ícone (emoji)",key:"icon",ph:"Ex: ✈️ 🏠 🚗"}].map(fi=>(
          <div key={fi.key}>
            <label style={lbl}>{fi.label}</label>
            <input type={fi.type||"text"} value={g[fi.key]} placeholder={fi.ph} onChange={e=>set(fi.key,e.target.value)} style={inp}/>
          </div>
        ))}
        <div>
          <label style={lbl}>Cor</label>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {["#6EE7B7","#F9A8D4","#FCD34D","#93C5FD","#FB923C","#C4B5FD"].map(c=>(
              <div key={c} onClick={()=>set("color",c)} style={{width:30,height:30,borderRadius:"50%",background:c,cursor:"pointer",border:g.color===c?"3px solid #fff":"3px solid transparent",transition:"border .15s"}}/>
            ))}
          </div>
        </div>
        {err&&<div style={{background:"#F8717122",border:"1px solid #F8717155",borderRadius:8,padding:"10px 14px",color:"#F87171",fontSize:13}}>{err}</div>}
        <div style={{display:"flex",gap:10,marginTop:4}}>
          <button onClick={onClose} style={{flex:1,padding:13,borderRadius:12,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:light?"#475569":"#888",cursor:"pointer",fontSize:14}}>Cancelar</button>
          <Btn onClick={save} style={{flex:2,padding:13,fontSize:15}}>Criar Meta</Btn>
        </div>
      </div>
    </ModalCard>
  </Modal>;
}


function ShortcutForm({onSave,onClose,editing,user}) {
  const [f,setF]=useState(editing||{label:"",desc:"",amount:"",type:"expense",category:"Outros",owner:"casal",paid:true});
  const [err,setErr]=useState("");
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const inp={width:"100%",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,padding:"11px 14px",color:theme.text,fontSize:15,outline:"none"};
  const lbl={fontSize:12,color:theme.nav,display:"block",marginBottom:7,fontWeight:600,letterSpacing:".04em",textTransform:"uppercase"};
  function save(){
    if(!f.desc.trim()){setErr("Informe a descricao.");return;}
    if(!f.amount||isNaN(f.amount)||parseFloat(f.amount)<=0){setErr("Informe um valor valido.");return;}
    onSave({...f,label:f.label.trim()||f.desc.trim(),amount:parseFloat(f.amount)});
  }
  return <Modal onClose={onClose}><ModalCard>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
      <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:theme.text}}>{editing?"Editar":"Novo"} Atalho</h2>
      <button onClick={onClose} style={{background:"rgba(255,255,255,.08)",border:"none",borderRadius:8,width:32,height:32,color:"#aaa",cursor:"pointer",fontSize:18}}>x</button>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",gap:10}}>{["income","expense"].map(t=><button key={t} onClick={()=>set("type",t)} style={{flex:1,padding:11,borderRadius:10,border:"none",cursor:"pointer",background:f.type===t?(t==="income"?"#6EE7B733":"#F8717133"):"rgba(255,255,255,.05)",color:f.type===t?(t==="income"?"#6EE7B7":"#F87171"):"#888",fontWeight:600,fontSize:14}}>{t==="income"?"Receita":"Despesa"}</button>)}</div>
      {[{label:"Nome do botao",key:"label",ph:"Ex: Almoco R$25"},{label:"Descricao",key:"desc",ph:"Ex: Almoco"},{label:"Valor (R$)",key:"amount",ph:"25,00",type:"number"}].map(fi=><div key={fi.key}><label style={lbl}>{fi.label}</label><input type={fi.type||"text"} value={f[fi.key]} placeholder={fi.ph} onChange={e=>set(fi.key,e.target.value)} style={inp}/></div>)}
      <div><label style={lbl}>Categoria</label><select value={f.category} onChange={e=>set("category",e.target.value)} style={{...inp,cursor:"pointer"}}>{CATS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
      <div><label style={lbl}>Responsavel</label><div style={{display:"flex",gap:8}}>{[["casal","Casal","#6EE7B7"],[user?.uid||"eu",user?.displayName||"Eu","#F9A8D4"]].map(([v,l,c])=><button key={v} onClick={()=>set("owner",v)} style={{flex:1,padding:10,borderRadius:10,border:"none",cursor:"pointer",background:f.owner===v?c+"22":"rgba(255,255,255,.04)",color:f.owner===v?c:"#888",fontSize:13,fontWeight:f.owner===v?600:400}}>{l}</button>)}</div></div>
      {err&&<div style={{background:"#F8717122",border:"1px solid #F8717155",borderRadius:8,padding:"10px 14px",color:"#F87171",fontSize:13}}>{err}</div>}
      <div style={{display:"flex",gap:10,marginTop:4}}><button onClick={onClose} style={{flex:1,padding:13,borderRadius:12,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:light?"#475569":"#888",cursor:"pointer",fontSize:14}}>Cancelar</button><Btn onClick={save} style={{flex:2,padding:13,fontSize:15}}>Salvar atalho</Btn></div>
    </div>
  </ModalCard></Modal>;
}

function ChatModal({tx,messages,draft,setDraft,onSend,onClose}) {
  const listRef=useRef(null);
  useEffect(()=>{if(listRef.current)listRef.current.scrollTop=listRef.current.scrollHeight;},[messages]);
  if(!tx)return null;
  return <Modal onClose={onClose}><ModalCard>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:16}}>
      <div><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:theme.text}}>Notas</h2><div style={{color:light?"#334155":"#64748b",fontSize:13,marginTop:4}}>{tx.desc}</div></div>
      <button onClick={onClose} style={{background:"rgba(255,255,255,.08)",border:"none",borderRadius:8,width:32,height:32,color:"#aaa",cursor:"pointer",fontSize:18}}>x</button>
    </div>
    <div ref={listRef} style={{height:300,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,marginBottom:14,paddingRight:4}}>
      {messages.length===0?<div style={{color:light?"#334155":"#64748b",fontSize:13,textAlign:"center",marginTop:120}}>Nenhuma mensagem ainda</div>:messages.map(m=><div key={m._id||m.createdAtMs} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:12,padding:"10px 12px"}}><div style={{display:"flex",justifyContent:"space-between",gap:10,marginBottom:4}}><span style={{color:"#6EE7B7",fontSize:12,fontWeight:700}}>{m.authorName||m.authorEmail||"Usuario"}</span><span style={{color:"#475569",fontSize:11}}>{m.createdAtText}</span></div><div style={{color:light?"#1f2937":"#e2e8f0",fontSize:14,lineHeight:1.4}}>{m.text}</div></div>)}
    </div>
    <div style={{display:"flex",gap:10}}><input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")onSend();}} placeholder="Escreva uma nota..." style={{flex:1,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,padding:"11px 14px",color:theme.text,fontSize:15,outline:"none"}}/><Btn onClick={onSend} style={{padding:"11px 16px"}}>Enviar</Btn></div>
  </ModalCard></Modal>;
}



function Field({label,children}) {
  return <div><label style={{fontSize:12,color:theme.nav,display:"block",marginBottom:7,fontWeight:600,letterSpacing:".04em",textTransform:"uppercase"}}>{label}</label>{children}</div>;
}

const inputBase = {width:"100%",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,padding:"11px 14px",color:theme.text,fontSize:15,outline:"none"};

function RecurringForm({onSave,onClose}) {
  const [f,setF]=useState({desc:"",amount:"",day:"",category:"Utilidades"});
  const [err,setErr]=useState("");
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  function save(){
    const amount=parseFloat(f.amount);
    const day=parseInt(f.day);
    if(!f.desc.trim())return setErr("Informe a descricao.");
    if(!amount||isNaN(amount))return setErr("Informe um valor valido.");
    if(!day||day<1||day>28)return setErr("Informe um dia entre 1 e 28.");
    onSave({...f,amount,day,type:"expense",active:true});
  }
  return <Modal onClose={onClose}><ModalCard><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:theme.text,marginBottom:20}}>Nova recorrencia</h2><div style={{display:"flex",flexDirection:"column",gap:14}}>
    <Field label="Descricao"><input value={f.desc} onChange={e=>set("desc",e.target.value)} placeholder="Internet" style={inputBase}/></Field>
    <Field label="Valor mensal"><input type="number" value={f.amount} onChange={e=>set("amount",e.target.value)} placeholder="120" style={inputBase}/></Field>
    <Field label="Dia de vencimento"><input type="number" min="1" max="28" value={f.day} onChange={e=>set("day",e.target.value)} placeholder="10" style={inputBase}/></Field>
    <Field label="Categoria"><select value={f.category} onChange={e=>set("category",e.target.value)} style={{...inputBase,cursor:"pointer"}}>{CATS.map(c=><option key={c} value={c}>{c}</option>)}</select></Field>
    {err&&<div style={{background:"#F8717122",border:"1px solid #F8717155",borderRadius:8,padding:"10px 14px",color:"#F87171",fontSize:13}}>{err}</div>}
    <div style={{display:"flex",gap:10}}><button onClick={onClose} style={{flex:1,padding:13,borderRadius:12,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:light?"#475569":"#888",cursor:"pointer"}}>Cancelar</button><Btn onClick={save} style={{flex:2}}>Salvar</Btn></div>
  </div></ModalCard></Modal>;
}

function CardForm({onSave,onClose}) {
  const [f,setF]=useState({name:"",limit:"",closingDay:"1",dueDay:"10"});
  const [err,setErr]=useState("");
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  function save(){
    if(!f.name.trim())return setErr("Informe o nome do cartao.");
    onSave({name:f.name.trim(),limit:parseFloat(f.limit)||0,closingDay:parseInt(f.closingDay)||1,dueDay:parseInt(f.dueDay)||10});
  }
  return <Modal onClose={onClose}><ModalCard><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:theme.text,marginBottom:20}}>Novo cartao</h2><div style={{display:"flex",flexDirection:"column",gap:14}}>
    <Field label="Nome"><input value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Nubank" style={inputBase}/></Field>
    <Field label="Limite"><input type="number" value={f.limit} onChange={e=>set("limit",e.target.value)} placeholder="5000" style={inputBase}/></Field>
    <Field label="Fechamento"><input type="number" min="1" max="28" value={f.closingDay} onChange={e=>set("closingDay",e.target.value)} style={inputBase}/></Field>
    <Field label="Vencimento"><input type="number" min="1" max="28" value={f.dueDay} onChange={e=>set("dueDay",e.target.value)} style={inputBase}/></Field>
    {err&&<div style={{background:"#F8717122",border:"1px solid #F8717155",borderRadius:8,padding:"10px 14px",color:"#F87171",fontSize:13}}>{err}</div>}
    <div style={{display:"flex",gap:10}}><button onClick={onClose} style={{flex:1,padding:13,borderRadius:12,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:light?"#475569":"#888",cursor:"pointer"}}>Cancelar</button><Btn onClick={save} style={{flex:2}}>Salvar</Btn></div>
  </div></ModalCard></Modal>;
}

function PurchaseForm({card,onSave,onClose}) {
  const [f,setF]=useState({desc:"",amount:"",installments:"1",category:"Outros"});
  const [err,setErr]=useState("");
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  function save(){
    const amount=parseFloat(f.amount);
    const installments=Math.max(1,parseInt(f.installments)||1);
    if(!f.desc.trim())return setErr("Informe a descricao.");
    if(!amount||isNaN(amount))return setErr("Informe um valor valido.");
    onSave({card,desc:f.desc.trim(),amount,installments,category:f.category});
  }
  return <Modal onClose={onClose}><ModalCard><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:theme.text,marginBottom:6}}>Compra no cartao</h2><div style={{color:light?"#334155":"#64748b",fontSize:13,marginBottom:18}}>{card?.name}</div><div style={{display:"flex",flexDirection:"column",gap:14}}>
    <Field label="Descricao"><input value={f.desc} onChange={e=>set("desc",e.target.value)} placeholder="Mercado" style={inputBase}/></Field>
    <Field label="Valor total"><input type="number" value={f.amount} onChange={e=>set("amount",e.target.value)} placeholder="240" style={inputBase}/></Field>
    <Field label="Parcelas"><input type="number" min="1" value={f.installments} onChange={e=>set("installments",e.target.value)} style={inputBase}/></Field>
    <Field label="Categoria"><select value={f.category} onChange={e=>set("category",e.target.value)} style={{...inputBase,cursor:"pointer"}}>{CATS.map(c=><option key={c} value={c}>{c}</option>)}</select></Field>
    {err&&<div style={{background:"#F8717122",border:"1px solid #F8717155",borderRadius:8,padding:"10px 14px",color:"#F87171",fontSize:13}}>{err}</div>}
    <div style={{display:"flex",gap:10}}><button onClick={onClose} style={{flex:1,padding:13,borderRadius:12,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:light?"#475569":"#888",cursor:"pointer"}}>Cancelar</button><Btn onClick={save} style={{flex:2}}>Lancar compra</Btn></div>
  </div></ModalCard></Modal>;
}

function ShoppingForm({onSave,onClose}) {
  const [f,setF]=useState({name:"",qty:"1",unit:"und",estimate:""});
  const [err,setErr]=useState("");
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  function save(){
    if(!f.name.trim())return setErr("Informe o item.");
    onSave({name:f.name.trim(),qty:f.qty||"1",unit:f.unit||"und",estimate:parseFloat(f.estimate)||0,done:false});
  }
  return <Modal onClose={onClose}><ModalCard><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:theme.text,marginBottom:20}}>Novo item</h2><div style={{display:"flex",flexDirection:"column",gap:14}}>
    <Field label="Item"><input value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Arroz" style={inputBase}/></Field>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Field label="Quantidade"><input value={f.qty} onChange={e=>set("qty",e.target.value)} placeholder="1" style={inputBase}/></Field><Field label="Unidade"><input value={f.unit} onChange={e=>set("unit",e.target.value)} placeholder="und, pct, cx" style={inputBase}/></Field></div>
    <Field label="Estimativa"><input type="number" value={f.estimate} onChange={e=>set("estimate",e.target.value)} placeholder="25" style={inputBase}/></Field>
    {err&&<div style={{background:"#F8717122",border:"1px solid #F8717155",borderRadius:8,padding:"10px 14px",color:"#F87171",fontSize:13}}>{err}</div>}
    <div style={{display:"flex",gap:10}}><button onClick={onClose} style={{flex:1,padding:13,borderRadius:12,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:light?"#475569":"#888",cursor:"pointer"}}>Cancelar</button><Btn onClick={save} style={{flex:2}}>Salvar</Btn></div>
  </div></ModalCard></Modal>;
}

function DepositForm({goal,onSave,onClose}) {
  const [amount,setAmount]=useState("");
  const [err,setErr]=useState("");
  function save(){
    const value=parseFloat(amount);
    if(!value||isNaN(value))return setErr("Informe um valor valido.");
    onSave(goal,value);
  }
  return <Modal onClose={onClose}><ModalCard><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:theme.text,marginBottom:6}}>Depositar na meta</h2><div style={{color:light?"#334155":"#64748b",fontSize:13,marginBottom:18}}>{goal?.name}</div><div style={{display:"flex",flexDirection:"column",gap:14}}>
    <Field label="Valor"><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="100" style={inputBase}/></Field>
    {err&&<div style={{background:"#F8717122",border:"1px solid #F8717155",borderRadius:8,padding:"10px 14px",color:"#F87171",fontSize:13}}>{err}</div>}
    <div style={{display:"flex",gap:10}}><button onClick={onClose} style={{flex:1,padding:13,borderRadius:12,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:light?"#475569":"#888",cursor:"pointer"}}>Cancelar</button><Btn onClick={save} style={{flex:2}}>Depositar</Btn></div>
  </div></ModalCard></Modal>;
}

export {
  TxForm,
  QuickEntryForm,
  GoalForm,
  ShortcutForm,
  ChatModal,
  RecurringForm,
  CardForm,
  PurchaseForm,
  ShoppingForm,
  DepositForm
};
