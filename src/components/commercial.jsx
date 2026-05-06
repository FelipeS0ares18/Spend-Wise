import { Badge } from "./ui";

function OnboardingCard({steps, progress, onSkip, onAction, light, theme}) {
  return <div className="card onboarding-card" style={{marginBottom:14,border:"1px solid rgba(110,231,183,.22)",background:light?"#f8fafc":"linear-gradient(135deg,rgba(110,231,183,.10),rgba(59,130,246,.07))"}}>
    <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start",marginBottom:14}}>
      <div>
        <div style={{fontSize:11,color:"#6EE7B7",fontWeight:800,letterSpacing:".06em",textTransform:"uppercase"}}>Primeiros passos</div>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:theme.text,marginTop:3}}>Configure seu Spend Wise</h3>
      </div>
      <button onClick={onSkip} style={{border:"1px solid "+theme.border,background:theme.soft,color:theme.nav,borderRadius:8,padding:"7px 9px",fontSize:12,cursor:"pointer",flexShrink:0}}>Ocultar</button>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
      <div style={{flex:1,height:8,background:"rgba(148,163,184,.18)",borderRadius:99,overflow:"hidden"}}>
        <div style={{width:progress+"%",height:"100%",background:"linear-gradient(90deg,#6EE7B7,#3B82F6)",borderRadius:99}}/>
      </div>
      <strong style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#6EE7B7"}}>{progress}%</strong>
    </div>
    <div className="onboarding-steps" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:10}}>
      {steps.map(step=><button key={step.id} onClick={()=>!step.done&&onAction(step)} style={{textAlign:"left",border:"1px solid "+(step.done?"rgba(110,231,183,.35)":theme.border),background:step.done?"rgba(110,231,183,.10)":theme.soft,borderRadius:12,padding:"11px 12px",cursor:step.done?"default":"pointer",color:theme.text}}>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:5}}>
          <span style={{width:20,height:20,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",border:"1px solid "+(step.done?"#6EE7B7":"#64748b"),color:step.done?"#6EE7B7":"#94a3b8",fontSize:12,fontWeight:800}}>{step.done?"✓":step.icon}</span>
          <strong style={{fontSize:13}}>{step.title}</strong>
        </div>
        <div style={{fontSize:11,color:theme.nav,lineHeight:1.35}}>{step.body}</div>
      </button>)}
    </div>
  </div>;
}

function CommercialInsightsGrid({health, items, onOpen, light, theme}) {
  const colors={good:"#6EE7B7",warn:"#FCD34D",danger:"#F87171",info:"#93C5FD"};
  const cardBase=(color)=>({textAlign:"left",border:"1px solid "+color+"33",background:light?"#f8fafc":color+"12",borderRadius:12,padding:"12px 13px",minWidth:0,minHeight:78});
  return <div className="commercial-insights-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:10,marginBottom:14}}>
    <div style={cardBase(health.color)}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:7}}>
        <div style={{display:"flex",alignItems:"center",gap:7,minWidth:0}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:health.color,boxShadow:"0 0 16px "+health.color+"66",flexShrink:0}}/>
          <strong style={{fontSize:13,color:theme.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Saude financeira</strong>
        </div>
        <Badge color={health.color}>{health.label}</Badge>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
        <strong style={{fontFamily:"'DM Mono',monospace",fontSize:20,color:health.color,lineHeight:1}}>{health.score}</strong>
        <span style={{fontSize:10,color:theme.nav}}>de 100</span>
      </div>
      <div style={{height:6,borderRadius:99,background:"rgba(148,163,184,.16)",overflow:"hidden"}}>
        <div style={{width:health.score+"%",height:"100%",borderRadius:99,background:"linear-gradient(90deg,"+health.color+"99,"+health.color+")"}}/>
      </div>
    </div>
    {items.slice(0,3).map((item,idx)=>{const c=colors[item.tone]||colors.info;return <button key={idx} onClick={()=>onOpen(item.view)} style={{...cardBase(c),cursor:"pointer"}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
        <span style={{width:8,height:8,borderRadius:"50%",background:c,boxShadow:"0 0 16px "+c+"66",flexShrink:0}}/>
        <strong style={{fontSize:13,color:theme.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</strong>
      </div>
      <div style={{fontSize:11,color:theme.nav,lineHeight:1.35}}>{item.body}</div>
    </button>})}
  </div>;
}

export { OnboardingCard, CommercialInsightsGrid };
