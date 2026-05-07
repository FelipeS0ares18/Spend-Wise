import { MONTHS, fmt, pct, Bar, OnboardingCard, CommercialInsightsGrid, EmptyState, TxRow } from "../components/appPrimitives";

export function DashboardView({ctx}) {
  const { mobile, theme, light, userName, selMonth, selYear, now, balance, invites, setView, setShowQuickEntry, pendingShopping, showOnboarding, onboardingSteps, onboardingProgress, hideOnboarding, runOnboardingAction, onboardingAnswers, setOnboardingAnswers, saveOnboardingAnswers, financialSpace, financeHealth, financeInsights, income, expense, pending, shortcuts, launchShortcut, topCats, maxCat, goals, monthTxs, togglePaid, setEditing, setShowTxForm, deleteTx, openChat } = ctx;
  const onboardingInput = {background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:9,padding:"10px 12px",color:theme.text,fontSize:13,outline:"none",width:"100%"};
  const setAnswer=(key,value)=>setOnboardingAnswers({...onboardingAnswers,[key]:value});
  return <div className="fade">
          <div style={{marginBottom:18}}>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:mobile?20:26,color:theme.text}}>{financialSpace?.name||"Spend Wise"}</h1>
            <div style={{color:"#6EE7B7",fontSize:12,fontWeight:700,marginTop:3}}>Ola, {userName}</div>
            <p style={{color:light?"#334155":"#64748b",marginTop:4,fontSize:12}}>{selMonth===now.getMonth()&&selYear===now.getFullYear()?new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"}):MONTHS[selMonth]+" de "+selYear}</p>
            {mobile&&<div style={{marginTop:12,background:balance>=0?"rgba(110,231,183,.08)":"rgba(248,113,113,.08)",border:`1px solid ${balance>=0?"#6EE7B733":"#F8717133"}`,borderRadius:12,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,color:light?"#475569":"#888"}}>SALDO DO MÊS</span>
              <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:balance>=0?"#6EE7B7":"#F87171"}}>{fmt(balance)}</span>
            </div>}
            <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
              <button onClick={()=>setView("shared")} style={{padding:"8px 12px",borderRadius:9,border:"none",cursor:"pointer",background:invites.length?"#FCD34D22":"rgba(255,255,255,.05)",color:invites.length?"#FCD34D":"#94a3b8",fontSize:12}}>Conta compartilhada{invites.length?" ("+invites.length+")":""}</button>
              <button onClick={()=>setShowQuickEntry(true)} style={{padding:"8px 12px",borderRadius:9,border:"none",cursor:"pointer",background:"rgba(110,231,183,.16)",color:"#6EE7B7",fontSize:12,fontWeight:700}}>Entrada rápida</button>
              <button onClick={()=>setView("shortcuts")} style={{padding:"8px 12px",borderRadius:9,border:"none",cursor:"pointer",background:"rgba(110,231,183,.12)",color:"#6EE7B7",fontSize:12}}>Atalhos rapidos</button>
              <button onClick={()=>setView("recurring")} style={{padding:"8px 12px",borderRadius:9,border:"none",cursor:"pointer",background:"rgba(255,255,255,.05)",color:theme.nav,fontSize:12}}>Recorrentes</button>
              <button onClick={()=>setView("shopping")} style={{padding:"8px 12px",borderRadius:9,border:"none",cursor:"pointer",background:"rgba(255,255,255,.05)",color:theme.nav,fontSize:12}}>Compras ({pendingShopping.length})</button>
            </div>
          </div>
          {showOnboarding&&<OnboardingCard steps={onboardingSteps} progress={onboardingProgress} onSkip={hideOnboarding} onAction={runOnboardingAction} light={light} theme={theme}/>}
          {showOnboarding&&<div className="card" style={{marginBottom:mobile?14:18}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:mobile?"flex-start":"center",flexDirection:mobile?"column":"row",marginBottom:14}}>
              <div>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:theme.text,marginBottom:4}}>Configure seu espaco</h3>
                <p style={{color:light?"#334155":"#64748b",fontSize:12,lineHeight:1.4}}>Essas respostas personalizam os insights e deixam o Spend Wise com cara de central financeira, nao so lista de gastos.</p>
              </div>
              <button onClick={()=>saveOnboardingAnswers()} style={{border:"none",borderRadius:9,padding:"10px 13px",background:"#6EE7B722",color:"#6EE7B7",fontWeight:700,cursor:"pointer",fontSize:12}}>Salvar contexto</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(4,1fr)",gap:10}}>
              <label style={{display:"grid",gap:6,fontSize:12,color:theme.nav}}>Renda mensal
                <select value={onboardingAnswers.incomeRange||""} onChange={e=>setAnswer("incomeRange",e.target.value)} style={onboardingInput}>
                  <option value="">Selecionar</option>
                  <option value="ate-3k">Ate R$ 3 mil</option>
                  <option value="3k-8k">R$ 3 mil a R$ 8 mil</option>
                  <option value="8k-15k">R$ 8 mil a R$ 15 mil</option>
                  <option value="15k-plus">Acima de R$ 15 mil</option>
                </select>
              </label>
              <label style={{display:"grid",gap:6,fontSize:12,color:theme.nav}}>Objetivo principal
                <select value={onboardingAnswers.mainGoal||""} onChange={e=>setAnswer("mainGoal",e.target.value)} style={onboardingInput}>
                  <option value="">Selecionar</option>
                  <option value="organizar">Organizar rotina</option>
                  <option value="quitar">Quitar dividas</option>
                  <option value="investir">Sobrar para investir</option>
                  <option value="familia">Controlar familia/casal</option>
                </select>
              </label>
              <label style={{display:"grid",gap:6,fontSize:12,color:theme.nav}}>Cartoes
                <select value={onboardingAnswers.usesCards||""} onChange={e=>setAnswer("usesCards",e.target.value)} style={onboardingInput}>
                  <option value="">Selecionar</option>
                  <option value="sim">Uso cartao todo mes</option>
                  <option value="parcelas">Tenho muitas parcelas</option>
                  <option value="nao">Quase nao uso</option>
                </select>
              </label>
              <label style={{display:"grid",gap:6,fontSize:12,color:theme.nav}}>Compartilhamento
                <select value={onboardingAnswers.sharesFinance||""} onChange={e=>setAnswer("sharesFinance",e.target.value)} style={onboardingInput}>
                  <option value="">Selecionar</option>
                  <option value="solo">Uso sozinho</option>
                  <option value="casal">Casal</option>
                  <option value="familia">Familia</option>
                  <option value="negocio">Pequeno negocio</option>
                </select>
              </label>
            </div>
          </div>}
          <CommercialInsightsGrid health={financeHealth} items={financeInsights} onOpen={setView} light={light} theme={theme}/>
          {/* KPIs */}
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(4,1fr)",gap:mobile?10:14,marginBottom:mobile?14:18}}>
            {[{l:"Receitas",v:income,c:"#6EE7B7",i:"⬆"},{l:"Despesas",v:expense,c:"#F87171",i:"⬇"},{l:"Saldo",v:balance,c:balance>=0?"#6EE7B7":"#F87171",i:"◈"},{l:"Pendentes",v:pending,c:"#FCD34D",i:"⏱",cnt:true}].map((k,i)=>(
              <div key={i} className="card">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontSize:10,color:light?"#334155":"#64748b",marginBottom:5,fontWeight:600,letterSpacing:".05em",textTransform:"uppercase"}}>{k.l}</div>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:mobile?15:19,color:k.c,fontWeight:700}}>{k.cnt?k.v:fmt(k.v)}</div>
                  </div>
                  <span style={{fontSize:16,opacity:.5}}>{k.i}</span>
                </div>
              </div>
            ))}
          </div>
          {shortcuts.length>0&&<div className="card" style={{marginBottom:mobile?14:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:15,color:theme.text}}>Atalhos rapidos</h3>
              <button onClick={()=>setView("shortcuts")} style={{background:"none",border:"none",color:"#6EE7B7",fontSize:12,cursor:"pointer"}}>Configurar</button>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{shortcuts.slice(0,8).map(s=><button key={s._id} onClick={()=>launchShortcut(s)} style={{padding:"9px 12px",borderRadius:9,border:"1px solid rgba(255,255,255,.08)",background:s.type==="income"?"#6EE7B71A":"#F871711A",color:s.type==="income"?"#6EE7B7":"#F87171",cursor:"pointer",fontSize:12,fontWeight:700}}>{s.label} - {fmt(s.amount)}</button>)}</div>
          </div>}

          {/* cats + goals */}
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1.2fr 1fr",gap:mobile?12:14,marginBottom:mobile?14:18}}>
            <div className="card">
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:15,marginBottom:14,color:theme.text}}>Gastos por Categoria</h3>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {topCats.length===0?<div style={{color:light?"#334155":"#64748b",fontSize:13}}>Nenhuma despesa este mês</div>:topCats.map(([cat,val])=>(
                  <div key={cat}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:13}}>
                      <span style={{color:"#cbd5e1"}}>{cat}</span>
                      <span style={{color:theme.nav,fontFamily:"'DM Mono',monospace"}}>{fmt(val)}</span>
                    </div>
                    <Bar val={val} max={maxCat} color="#6EE7B7"/>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:15,color:theme.text}}>Metas</h3>
                <button onClick={()=>setView("goals")} style={{background:"none",border:"none",color:"#6EE7B7",fontSize:12,cursor:"pointer"}}>Ver todas</button>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {goals.length===0?<div style={{color:light?"#334155":"#64748b",fontSize:13}}>Nenhuma meta criada</div>:goals.slice(0,3).map(g=>(
                  <div key={g._id}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                      <span style={{fontSize:16}}>{g.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,color:light?"#1f2937":"#e2e8f0"}}>{g.name}</div>
                        <div style={{fontSize:11,color:light?"#334155":"#64748b",fontFamily:"'DM Mono',monospace"}}>{fmt(g.saved)} / {fmt(g.target)} · {pct(g.saved,g.target)}%</div>
                      </div>
                    </div>
                    <Bar val={g.saved} max={g.target} color={g.color}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* recent txs */}
          <div className="card" style={{padding:0,overflow:"hidden"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 16px 0"}}>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:15,color:theme.text}}>Transações Recentes</h3>
              <button onClick={()=>setView("transactions")} style={{background:"none",border:"none",color:"#6EE7B7",fontSize:12,cursor:"pointer"}}>Ver todas</button>
            </div>
            <div style={{marginTop:8}}>
              {monthTxs.length===0?<div style={{padding:"12px 16px 16px"}}><EmptyState title="Nenhuma transação este mês" body="Quando você lançar receitas, despesas ou importar um OFX, elas aparecem aqui." action="Use + Nova Transação para começar."/></div>:monthTxs.slice(0,5).map((t,i)=>(
                <div key={t._id} style={{borderTop:i>0?"1px solid rgba(255,255,255,.05)":"none"}}>
                  <TxRow t={t} onToggle={togglePaid} onEdit={t=>{setEditing(t);setShowTxForm(true);}} onDelete={deleteTx} onChat={openChat} mobile={mobile} userName={userName}/>
                </div>
              ))}
            </div>
          </div>
        </div>;
}
