import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { pct, theme, light } from "../domain/constants";

const Portal = ({children}) => createPortal(children, document.body);

function useWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => { const h=()=>setW(window.innerWidth); window.addEventListener("resize",h); return()=>window.removeEventListener("resize",h); },[]);
  return w;
}

/* ─── tiny ui ────────────────────────────────────────────────── */
function Spin() {
  return <div style={{position:"fixed",inset:0,background:"#0A0F1A",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
    <div style={{width:36,height:36,border:"3px solid #ffffff11",borderTopColor:"#6EE7B7",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
    <span style={{fontSize:14,color:light?"#334155":"#64748b"}}>Carregando...</span>
  </div>;
}

function Bar({val,max,color}) {
  return <div style={{background:"rgba(255,255,255,.07)",borderRadius:99,height:7,overflow:"hidden"}}>
    <div style={{width:Math.min(pct(val,max),100)+"%",height:"100%",borderRadius:99,background:`linear-gradient(90deg,${color}88,${color})`,transition:"width .6s"}}/>
  </div>;
}

function Badge({children,color}) {
  return <span style={{background:color+"22",color,border:`1px solid ${color}44`,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:600,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>{children}</span>;
}

function EmptyState({title,body,action}) {
  return <div style={{padding:18,border:"1px dashed rgba(148,163,184,.32)",borderRadius:12,background:"rgba(148,163,184,.06)",color:light?"#334155":"#94a3b8",fontSize:13,lineHeight:1.4}}>
    <div style={{color:theme.text,fontWeight:700,marginBottom:4}}>{title}</div>
    {body&&<div>{body}</div>}
    {action&&<div style={{marginTop:8,color:"#6EE7B7",fontWeight:700}}>{action}</div>}
  </div>;
}

function Btn({children,onClick,style={},disabled=false}) {
  return <button onClick={onClick} disabled={disabled}
    style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"12px 20px",background:"linear-gradient(135deg,#6EE7B7,#3B82F6)",border:"none",borderRadius:12,color:theme.text,fontWeight:700,fontSize:14,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.6:1,...style}}>
    {children}
  </button>;
}

/* ─── Modal portal ───────────────────────────────────────────── */
function Modal({children, onClose}) {
  useEffect(()=>{
    document.body.style.overflow="hidden";
    return()=>{ document.body.style.overflow=""; };
  },[]);
  return <Portal>
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.78)",backdropFilter:"blur(6px)",zIndex:9999,overflowY:"auto",WebkitOverflowScrolling:"touch"}}
         onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{width:"min(100% - 24px, 460px)",maxWidth:"100%",margin:window.innerWidth<=768?"12px auto calc(18px + env(safe-area-inset-bottom, 0px))":"60px auto 60px",pointerEvents:"auto"}}
           onClick={e=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  </Portal>;
}

function ModalCard({children}) {
  const mobile = window.innerWidth <= 768;
  return <div style={{background:"#111827",border:"1px solid rgba(255,255,255,.15)",borderRadius:mobile?14:20,padding:mobile?"18px 14px":"28px 24px",boxShadow:mobile?"0 14px 36px rgba(0,0,0,.5)":"0 24px 64px rgba(0,0,0,.6)",maxWidth:"100%",overflowX:"hidden"}}>
    {children}
  </div>;
}

function Field({label,children}) {
  return <div><label style={{fontSize:12,color:theme.nav,display:"block",marginBottom:7,fontWeight:600,letterSpacing:".04em",textTransform:"uppercase"}}>{label}</label>{children}</div>;
}

const inputBase = {width:"100%",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,padding:"11px 14px",color:theme.text,fontSize:15,outline:"none"};

export {
  Portal,
  useWidth,
  Spin,
  Bar,
  Badge,
  EmptyState,
  Btn,
  Modal,
  ModalCard,
  Field,
  inputBase
};
