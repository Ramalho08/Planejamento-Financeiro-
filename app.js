const $=id=>document.getElementById(id);
const brl=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const month=()=>new Date().toISOString().slice(0,7);
let flowChart=null,categoryChart=null;

const empty={transactions:[],wallets:[],cards:[],investments:[],goals:[],theme:'dark',logged:false};
let state=JSON.parse(localStorage.getItem('ramalho_finance_v11_1')||'null')||empty;

function save(){localStorage.setItem('ramalho_finance_v11_1',JSON.stringify(state));render();}
function totals(){
  const income=state.transactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const expense=state.transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const wallets=state.wallets.reduce((s,w)=>s+w.balance,0);
  const investments=state.investments.reduce((s,i)=>s+i.amount,0);
  return {income,expense,balance:income-expense,wallets,investments,netWorth:wallets+investments+income-expense};
}

function enter(){state.logged=true;save();$('login').classList.add('hidden');$('app').classList.remove('hidden');}
function logout(){state.logged=false;save();location.reload();}

$('enterBtn').onclick=enter;
$('logoutBtn').onclick=logout;
$('themeBtn').onclick=()=>{state.theme=state.theme==='dark'?'light':'dark';save();};
$('today').textContent=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});

document.querySelectorAll('.nav').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.nav,.page').forEach(el=>el.classList.remove('active'));
    btn.classList.add('active');
    $(btn.dataset.page).classList.add('active');
    $('pageTitle').textContent=btn.textContent;
  };
});

$('addWalletBtn').onclick=()=>{
  state.wallets.push({id:crypto.randomUUID(),name:$('walletName').value||'Carteira',balance:Number($('walletBalance').value||0)});
  $('walletName').value='';$('walletBalance').value='';
  save();
};

$('addTransactionBtn').onclick=()=>{
  state.transactions.push({id:crypto.randomUUID(),description:$('txDescription').value||'Movimentação',amount:Number($('txAmount').value||0),type:$('txType').value,category:$('txCategory').value||'Outros',month:month()});
  $('txDescription').value='';$('txAmount').value='';
  save();
};

$('addCardBtn').onclick=()=>{
  state.cards.push({id:crypto.randomUUID(),name:$('cardName').value||'Cartão',limit:Number($('cardLimit').value||0),dueDay:Number($('cardDue').value||1)});
  $('cardName').value='';$('cardLimit').value='';$('cardDue').value='';
  save();
};

$('addInvestmentBtn').onclick=()=>{
  state.investments.push({id:crypto.randomUUID(),name:$('investmentName').value||'Investimento',amount:Number($('investmentAmount').value||0),rate:Number($('investmentRate').value||0)});
  $('investmentName').value='';$('investmentAmount').value='';$('investmentRate').value='';
  save();
};

$('addGoalBtn').onclick=()=>{
  state.goals.push({id:crypto.randomUUID(),name:$('goalName').value||'Meta',target:Number($('goalTarget').value||0),saved:Number($('goalSaved').value||0)});
  $('goalName').value='';$('goalTarget').value='';$('goalSaved').value='';
  save();
};

$('sampleBtn').onclick=()=>{
  state.wallets=[{id:crypto.randomUUID(),name:'Nubank',balance:1200}];
  state.transactions=[
    {id:crypto.randomUUID(),description:'Salário',amount:1800,type:'income',category:'Trabalho',month:month()},
    {id:crypto.randomUUID(),description:'Mercado',amount:430,type:'expense',category:'Alimentação',month:month()},
    {id:crypto.randomUUID(),description:'Transporte',amount:180,type:'expense',category:'Transporte',month:month()}
  ];
  state.cards=[{id:crypto.randomUUID(),name:'Cartão principal',limit:2000,dueDay:10}];
  state.investments=[{id:crypto.randomUUID(),name:'Reserva CDB',amount:500,rate:0.8}];
  state.goals=[{id:crypto.randomUUID(),name:'Notebook',target:5000,saved:800}];
  save();
};

$('exportCsvBtn').onclick=()=>{
  const rows=['Mes,Tipo,Categoria,Descricao,Valor'];
  state.transactions.forEach(t=>rows.push(`${t.month},${t.type},${t.category},"${t.description}",${t.amount}`));
  download('ramalho-finance.csv',rows.join('\\n'),'text/csv');
};

$('backupBtn').onclick=()=>download('ramalho-finance-backup.json',JSON.stringify(state,null,2),'application/json');

$('restoreInput').onchange=e=>{
  const file=e.target.files[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{state=JSON.parse(reader.result);save();};
  reader.readAsText(file);
};

$('printBtn').onclick=()=>window.print();
$('clearBtn').onclick=()=>{if(confirm('Apagar todos os dados?')){localStorage.removeItem('ramalho_finance_v11_1');location.reload();}};

function download(name,content,type){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([content],{type}));
  a.download=name;
  a.click();
}

function render(){
  document.body.classList.toggle('light',state.theme==='light');
  if(state.logged){$('login').classList.add('hidden');$('app').classList.remove('hidden');}

  const m=totals();
  const score=Math.max(0,Math.min(100,50+(m.income?Math.round((m.balance/m.income)*100):0)));

  $('netWorth').textContent=brl(m.netWorth);
  $('incomeTotal').textContent=brl(m.income);
  $('expenseTotal').textContent=brl(m.expense);
  $('balanceTotal').textContent=brl(m.balance);
  $('investmentTotal').textContent=brl(m.investments);
  $('score').textContent=score;

  const alerts=[];
  if(m.income===0)alerts.push('Cadastre sua renda para liberar análises melhores.');
  if(m.balance<0)alerts.push('Seu mês está negativo. Revise despesas variáveis.');
  if(m.balance>=0&&m.income>0)alerts.push('Seu mês está positivo. Continue acompanhando.');
  alerts.push(`Reserva recomendada: ${brl(m.expense*6)}.`);
  $('mainInsight').textContent=alerts[0];
  $('alerts').innerHTML=alerts.map(a=>`<p class="alert">${a}</p>`).join('');
  $('assistantTips').innerHTML=alerts.map(a=>`<p class="alert">${a}</p>`).join('');

  $('walletList').innerHTML=state.wallets.map(w=>`<div class="row"><strong>${w.name}</strong><span>${brl(w.balance)}</span></div>`).join('')||'<p>Nenhuma carteira.</p>';
  $('transactionList').innerHTML=state.transactions.map(t=>`<div class="row"><strong>${t.description}</strong><span>${t.type==='income'?'+':'-'} ${brl(t.amount)}</span></div>`).join('')||'<p>Nenhuma movimentação.</p>';
  $('cardList').innerHTML=state.cards.map(c=>`<div class="row"><strong>${c.name}</strong><span>${brl(c.limit)} • vence dia ${c.dueDay}</span></div>`).join('')||'<p>Nenhum cartão.</p>';

  const future=state.investments.reduce((s,i)=>s+i.amount*Math.pow(1+(i.rate||0)/100,12),0);
  $('investmentProjection').textContent=state.investments.length?`Projeção em 12 meses: ${brl(future)}`:'Cadastre investimentos para visualizar projeções.';
  $('investmentList').innerHTML=state.investments.map(i=>`<div class="row"><strong>${i.name}</strong><span>${brl(i.amount)} • ${i.rate}% mês</span></div>`).join('')||'<p>Nenhum investimento.</p>';

  $('goalList').innerHTML=state.goals.map(g=>{
    const pct=g.target?Math.min(100,Math.round((g.saved/g.target)*100)):0;
    return `<div class="row"><div style="width:100%"><strong>${g.name}</strong><p>${brl(g.saved)} de ${brl(g.target)} • ${pct}%</p><div class="progress"><span style="width:${pct}%"></span></div></div></div>`;
  }).join('')||'<p>Nenhuma meta.</p>';

  const monthly={};
  state.transactions.forEach(t=>{monthly[t.month]??={income:0,expense:0};t.type==='income'?monthly[t.month].income+=t.amount:monthly[t.month].expense+=t.amount;});
  $('monthlySummary').innerHTML=Object.entries(monthly).map(([mo,v])=>`<div class="row"><strong>${mo}</strong><span>Receitas ${brl(v.income)} • Despesas ${brl(v.expense)}</span></div>`).join('')||'<p>Sem relatórios.</p>';

  drawCharts(m);
}

function drawCharts(m){
  if(!window.Chart)return;
  if(flowChart)flowChart.destroy();
  flowChart=new Chart($('flowChart'),{type:'bar',data:{labels:['Receitas','Despesas','Investimentos'],datasets:[{data:[m.income,m.expense,m.investments]}]}});

  const cats={};
  state.transactions.filter(t=>t.type==='expense').forEach(t=>cats[t.category]=(cats[t.category]||0)+t.amount);
  if(categoryChart)categoryChart.destroy();
  categoryChart=new Chart($('categoryChart'),{type:'doughnut',data:{labels:Object.keys(cats),datasets:[{data:Object.values(cats)}]}});
}

function bg(){
  const c=$('bg'),ctx=c.getContext('2d'); let w,h,pts;
  function resize(){w=c.width=innerWidth;h=c.height=innerHeight;pts=Array.from({length:70},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)*.5}));}
  function loop(){ctx.clearRect(0,0,w,h);ctx.fillStyle='rgba(34,211,238,.7)';pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,1.4,0,7);ctx.fill();});requestAnimationFrame(loop);}
  resize();addEventListener('resize',resize);loop();
}

bg();
render();
if('serviceWorker' in navigator)navigator.serviceWorker.register('service-worker.js');
