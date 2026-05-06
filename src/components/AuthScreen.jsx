import { useState } from "react";
import { Btn } from "./ui";
import { theme } from "../domain/constants";
import { auth, authApi } from "../services/firebase";

function AuthScreen() {
  const [mode, setMode]     = useState("login");
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [pass,  setPass]    = useState("");
  const [err,   setErr]     = useState("");
  const [busy,  setBusy]    = useState(false);

  async function submit() {
    if (busy) return;
    setErr(""); setBusy(true);
    try {
      if (mode==="signup") {
        if (!name.trim()) { setErr("Informe seu nome."); setBusy(false); return; }
        const c = await authApi.createUserWithEmailAndPassword(auth, email, pass);
        await authApi.updateProfile(c.user, {displayName: name.trim()});
      } else {
        await authApi.signInWithEmailAndPassword(auth, email, pass);
      }
    } catch(e) {
      const M = {
        "auth/email-already-in-use":"Este email já está cadastrado.",
        "auth/invalid-email":"Email inválido.",
        "auth/weak-password":"Senha muito fraca (mínimo 6 caracteres).",
        "auth/user-not-found":"Email não encontrado.",
        "auth/wrong-password":"Senha incorreta.",
        "auth/invalid-credential":"Email ou senha incorretos.",
        "auth/too-many-requests":"Muitas tentativas. Tente mais tarde.",
      };
      setErr(M[e.code]||"Erro: "+e.message);
      setBusy(false);
    }
  }

  const inp = {width:"100%",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,padding:"12px 14px",color:theme.text,fontSize:15,outline:"none"};
  const lbl = {fontSize:12,color:theme.nav,display:"block",marginBottom:7,fontWeight:600,letterSpacing:".05em",textTransform:"uppercase"};

  return <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 30% 40%,#0d1b2a,#0A0F1A)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div style={{width:"100%",maxWidth:400}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:700,color:theme.text}}>Spend Wise</div>
        <div style={{fontSize:13,color:"#4ade80",marginTop:6,fontFamily:"'DM Mono',monospace"}}>● gestão financeira do casal</div>
      </div>
      <div className="card" style={{padding:"28px 24px"}}>
        <div style={{display:"flex",background:"rgba(255,255,255,.05)",borderRadius:10,padding:4,marginBottom:24}}>
          {[["login","Entrar"],["signup","Criar conta"]].map(([m,l])=>(
            <button key={m} onClick={()=>{setMode(m);setErr("");}} style={{flex:1,padding:9,borderRadius:8,border:"none",cursor:"pointer",background:mode===m?"rgba(110,231,183,.15)":"transparent",color:mode===m?"#6EE7B7":"#64748b",fontWeight:600,fontSize:14,transition:"all .2s"}}>{l}</button>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {mode==="signup" && <div>
            <label style={lbl}>Seu nome</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: Vinicius" onKeyDown={e=>e.key==="Enter"&&submit()} style={inp}/>
          </div>}
          <div>
            <label style={lbl}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" onKeyDown={e=>e.key==="Enter"&&submit()} style={inp}/>
          </div>
          <div>
            <label style={lbl}>Senha</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="mínimo 6 caracteres" onKeyDown={e=>e.key==="Enter"&&submit()} style={inp}/>
          </div>
          {err && <div style={{background:"#F8717122",border:"1px solid #F8717155",borderRadius:8,padding:"10px 14px",color:"#F87171",fontSize:13}}>{err}</div>}
          <Btn onClick={submit} disabled={busy} style={{marginTop:4,padding:14,fontSize:15}}>
            {busy?"Aguarde...":mode==="login"?"Entrar":"Criar conta"}
          </Btn>
        </div>
      </div>
    </div>
  </div>;
}

export { AuthScreen };
