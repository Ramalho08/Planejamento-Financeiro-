const DEFAULT_CATEGORIES = ['Alimentação','Transporte','Moradia','Educação','Saúde','Lazer','Assinaturas','Trabalho','Investimentos','Outros'];
const $ = id => document.getElementById(id);
const monthKey = (date=new Date()) => date.toISOString().slice(0,7);
const BRL = v => Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
let deferredPrompt, catChart, monChart;

const state = JSON.parse(localStorage.getItem('ramalhoFinanceV6')) || {
  transactions: [],
  goals: [],
  budgets: {},
  categories: DEFAULT_CATEGORIES,
  theme: 'dark',
  privacy: false
};

function save(){ localStorage.setItem('ramalhoFinanceV6', JSON.stringify(state)); render(); }
function currentItems(){ return state.transactions.filter(t => t.month === monthKey()); }
function totals(items=currentItems()){
  return items.reduce((a,t)=>{ t.type==='income'?a.income+=t.amount:a.expense+=t.amount; return a; },{income:0,expense:0});
}
function expensesByCategory(items=currentItems()){
  const map = {};
  items.filter(t=>t.type==='expense').forEach(t=>map[t.category]=(map[t.category]||0)+t.amount);
  return map;
}
function applyRecurring(){
  const current = monthKey();
  if(state.transactions.some(t=>t.month===current && t.generatedRecurring)) return;
  const rec = state.transactions.filter(t=>t.recurring && t.month !== current);
  const unique = new Map(rec.map(t=>[t.description+t.amount+t.category+t.type,t]));
  unique.forEach(t=>state.transactions.push({...t,id:crypto.randomUUID(),date:new Date().toISOString(),month:current,generatedRecurring:true}));
  localStorage.setItem('ramalhoFinanceV6', JSON.stringify(state));
}

function render(){
  document.body.classList.toggle('light', state.theme === 'light');
  document.body.classList.toggle('privacy', state.privacy);
  $('dateLabel').textContent = new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  renderCategories();
  renderDashboard();
  renderTransactions();
  renderBudgets();
  renderGoals();
  renderCalendar();
  renderReports();
}

function renderCategories(){
  const opts = state.categories.map(c=>`<option>${c}</option>`).join('');
  ['category','filterCategory','budgetCategory'].forEach(id=>{
    const el=$(id); if(!el)return;
    if(id==='filterCategory') el.innerHTML = '<option value="all">Todas categorias</option>'+opts;
    else el.innerHTML = opts;
  });
  $('categoryTags').innerHTML = state.categories.map(c=>`<span>#${c}</span>`).join('');
}

function renderDashboard(){
  const items = currentItems();
  const t = totals(items);
  const balance = t.income - t.expense;
  const saving = t.income ? Math.round((balance/t.income)*100) : 0;
  const score = Math.max(0, Math.min(100, 50 + saving - (balance<0?35:0)));
  $('balanceHero').innerHTML = `<span class="money">${BRL(balance)}</span>`;
  $('incomeTotal').innerHTML = `<span class="money">${BRL(t.income)}</span>`;
  $('expenseTotal').innerHTML = `<span class="money">${BRL(t.expense)}</span>`;
  $('savingRate').textContent = `${saving}%`;
  $('emergencyFund').innerHTML = `<span class="money">${BRL(t.expense*6)}</span>`;
  $('projection6').innerHTML = `<span class="money">${BRL(balance*6)}</span>`;
  $('score').textContent = score;
  $('statusLabel').textContent = score>=75?'Ótimo':score>=55?'Estável':score>=35?'Atenção':'Crítico';

  const byCat = expensesByCategory(items);
  const top = Object.entries(byCat).sort((a,b)=>b[1]-a[1])[0];
  const insights = makeInsights(t,balance,saving,top,byCat);
  $('heroText').textContent = insights[0] || 'Finanças sob controle.';
  $('smartInsights').innerHTML = insights.map(i=>`<div class="insight">${i}</div>`).join('');

  renderRisk(byCat,t);
  renderCategoryBars(byCat);
  drawCharts(byCat);
}

function makeInsights(t,balance,saving,top,byCat){
  const arr = [];
  if(t.income === 0) arr.push('💡 Cadastre sua renda para liberar análises mais precisas.');
  if(balance < 0) arr.push('⚠️ Você está fechando o mês no negativo. Revise despesas variáveis.');
  if(saving >= 30) arr.push('🚀 Excelente: sua taxa de economia está acima de 30%.');
  if(saving > 0 && saving < 20) arr.push('📈 Tente elevar sua taxa de economia para pelo menos 20%.');
  if(top) arr.push(`🔎 Maior gasto: ${top[0]} (${BRL(top[1])}).`);
  Object.entries(state.budgets).forEach(([cat,limit])=>{
    if(byCat[cat] > limit) arr.push(`🚨 Orçamento de ${cat} ultrapassado em ${BRL(byCat[cat]-limit)}.`);
  });
  if(state.goals.length && balance>0) arr.push('🎯 Você tem metas ativas e saldo positivo. Direcione parte do saldo para elas.');
  return arr.length?arr:['✅ Nenhum alerta crítico encontrado neste mês.'];
}

function renderRisk(byCat,t){
  const risks = [];
  if(t.income && t.expense/t.income > .85) risks.push(['Alto comprometimento','Mais de 85% da renda já foi usada.']);
  if(Object.keys(state.budgets).length===0) risks.push(['Sem orçamentos','Crie limites por categoria para controlar melhor.']);
  const noEmergency = t.expense>0; if(noEmergency) risks.push(['Reserva recomendada',`Sua reserva ideal é ${BRL(t.expense*6)}.`]);
  $('riskRadar').innerHTML = risks.map(r=>`<div class="risk-item"><strong>${r[0]}</strong><p class="muted">${r[1]}</p></div>`).join('');
}

function renderCategoryBars(byCat){
  const max = Math.max(1,...Object.values(byCat));
  $('categoryBars').innerHTML = Object.entries(byCat).map(([c,v])=>`
    <div><div class="bar-label"><span>${c}</span><span>${BRL(v)}</span></div><div class="bar"><span style="width:${Math.round(v/max*100)}%"></span></div></div>
  `).join('');
}

function drawCharts(byCat){
  if(!window.Chart) return;
  if(catChart) catChart.destroy();
  catChart = new Chart($('categoryChart'),{type:'doughnut',data:{labels:Object.keys(byCat),datasets:[{data:Object.values(byCat)}]},options:{responsive:true,plugins:{legend:{position:'bottom'}}}});
  const months = [...new Set(state.transactions.map(t=>t.month))].sort().slice(-8);
  const data = months.map(m=>{const tt=totals(state.transactions.filter(t=>t.month===m));return tt.income-tt.expense;});
  if(monChart) monChart.destroy();
  monChart = new Chart($('monthlyChart'),{type:'line',data:{labels:months,datasets:[{label:'Saldo',data,tension:.35,borderWidth:3}]},options:{responsive:true}});
}

function renderTransactions(){
  const q = ($('search').value||'').toLowerCase();
  const ft = $('filterType').value || 'all';
  const fc = $('filterCategory').value || 'all';
  const items = currentItems().filter(t=>(ft==='all'||t.type===ft)&&(fc==='all'||t.category===fc)&&t.description.toLowerCase().includes(q));
  $('transactionList').innerHTML = items.map(t=>`
    <div class="row">
      <div><strong>${t.description}</strong><div class="tag">${t.category} • ${new Date(t.date).toLocaleDateString('pt-BR')} ${t.dueDate?'• venc. '+t.dueDate:''} ${t.recurring?'• recorrente':''}</div></div>
      <strong class="amount ${t.type} money">${t.type==='income'?'+':'-'} ${BRL(t.amount)}</strong>
      <button class="delete" onclick="deleteTransaction('${t.id}')">Excluir</button>
    </div>`).join('') || '<p class="muted">Nenhuma movimentação encontrada.</p>';
}

function renderBudgets(){
  const byCat = expensesByCategory();
  $('budgetList').innerHTML = Object.entries(state.budgets).map(([cat,limit])=>{
    const used = byCat[cat]||0, pct=Math.min(100,Math.round(used/limit*100));
    return `<div class="row"><div style="width:100%"><strong>${cat}</strong><p class="muted">${BRL(used)} de ${BRL(limit)} • ${pct}%</p><div class="progress"><span style="width:${pct}%"></span></div></div><button class="delete" onclick="deleteBudget('${cat}')">Excluir</button></div>`;
  }).join('') || '<p class="muted">Nenhum orçamento cadastrado.</p>';
}

function renderGoals(){
  const balance = totals().income - totals().expense;
  $('goalList').innerHTML = state.goals.map(g=>{
    const pct = Math.min(100,Math.round((g.saved/g.target)*100));
    return `<article class="goal"><div style="width:100%"><strong>${g.name}</strong><p class="muted">${BRL(g.saved)} de ${BRL(g.target)} • ${pct}% ${g.deadline?'• até '+g.deadline:''}</p><div class="progress"><span style="width:${pct}%"></span></div></div><button class="delete" onclick="deleteGoal('${g.id}')">Excluir</button></article>`;
  }).join('') || '<p class="muted">Nenhuma meta cadastrada.</p>';
  const g = state.goals[0];
  if(g && balance>0) $('simulationResult').textContent = `Com o saldo atual, "${g.name}" pode levar ${Math.ceil((g.target-g.saved)/balance)} mês(es).`;
}

function renderCalendar(){
  const items = state.transactions.filter(t=>t.dueDate).sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
  $('calendarList').innerHTML = items.map(t=>`<div class="row"><div><strong>${t.description}</strong><div class="tag">${t.dueDate} • ${t.category}</div></div><strong class="money">${BRL(t.amount)}</strong></div>`).join('') || '<p class="muted">Nenhum vencimento cadastrado.</p>';
}

function renderReports(){
  const months = {};
  state.transactions.forEach(t=>{months[t.month] ||= {income:0,expense:0}; t.type==='income'?months[t.month].income+=t.amount:months[t.month].expense+=t.amount;});
  $('monthlySummary').innerHTML = Object.entries(months).sort().reverse().map(([m,v])=>`<div class="row"><strong>${m}</strong><span class="money">Receitas ${BRL(v.income)} • Despesas ${BRL(v.expense)} • Saldo ${BRL(v.income-v.expense)}</span></div>`).join('') || '<p class="muted">Sem relatórios ainda.</p>';
}

window.deleteTransaction = id => {state.transactions=state.transactions.filter(t=>t.id!==id);save();}
window.deleteGoal = id => {state.goals=state.goals.filter(g=>g.id!==id);save();}
window.deleteBudget = cat => {delete state.budgets[cat];save();}

document.querySelectorAll('.nav').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('.nav,.page').forEach(x=>x.classList.remove('active'));btn.classList.add('active');$(btn.dataset.page).classList.add('active');$('pageTitle').textContent=btn.textContent;});

$('transactionForm').onsubmit = e => {e.preventDefault();state.transactions.push({id:crypto.randomUUID(),description:$('description').value,amount:Number($('amount').value),type:$('type').value,category:$('category').value,dueDate:$('dueDate').value,recurring:$('recurring').checked,date:new Date().toISOString(),month:monthKey()});$('transactionForm').reset();save();}
$('budgetForm').onsubmit = e => {e.preventDefault();state.budgets[$('budgetCategory').value]=Number($('budgetLimit').value);$('budgetForm').reset();save();}
$('goalForm').onsubmit = e => {e.preventDefault();state.goals.push({id:crypto.randomUUID(),name:$('goalName').value,target:Number($('goalTarget').value),saved:Number($('goalSaved').value||0),deadline:$('goalDeadline').value});$('goalForm').reset();save();}
$('categoryForm').onsubmit = e => {e.preventDefault();const c=$('newCategory').value.trim();if(c&&!state.categories.includes(c))state.categories.push(c);$('newCategory').value='';save();}
$('simulateBtn').onclick = () => {const g=state.goals[0], val=Number($('simAmount').value);$('simulationResult').textContent = g&&val>0 ? `Guardando ${BRL(val)}/mês, você alcança "${g.name}" em ${Math.ceil((g.target-g.saved)/val)} mês(es).` : 'Informe uma meta e um valor mensal.';}
$('quickIncome').onclick = () => {document.querySelector('[data-page="movements"]').click();$('type').value='income';}
$('quickExpense').onclick = () => {document.querySelector('[data-page="movements"]').click();$('type').value='expense';}
$('themeBtn').onclick = () => {state.theme=state.theme==='dark'?'light':'dark';save();}
$('privacyMode').onchange = e => {state.privacy=e.target.checked;save();}
$('search').oninput=renderTransactions;$('filterType').onchange=renderTransactions;$('filterCategory').onchange=renderTransactions;
$('sampleDataBtn').onclick = () => {state.transactions.push({id:crypto.randomUUID(),description:'Salário',amount:1800,type:'income',category:'Trabalho',date:new Date().toISOString(),month:monthKey()},{id:crypto.randomUUID(),description:'Mercado',amount:420,type:'expense',category:'Alimentação',date:new Date().toISOString(),month:monthKey()},{id:crypto.randomUUID(),description:'Ônibus',amount:180,type:'expense',category:'Transporte',date:new Date().toISOString(),month:monthKey()});save();}

function download(name,content,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();}
$('exportCsvBtn').onclick = () => {const rows=['Data,Mes,Tipo,Categoria,Descricao,Valor,Vencimento'];state.transactions.forEach(t=>rows.push(`${t.date},${t.month},${t.type},${t.category},"${t.description}",${t.amount},${t.dueDate||''}`));download('ramalho-finance-v6.csv',rows.join('\n'),'text/csv');}
$('exportJsonBtn').onclick = () => download('ramalho-finance-v6-backup.json',JSON.stringify(state,null,2),'application/json');
$('importJson').onchange = e => {const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{Object.assign(state,JSON.parse(r.result));save();};r.readAsText(file);}
$('printBtn').onclick=()=>window.print();
$('clearBtn').onclick=()=>{if(confirm('Apagar todos os dados?')){localStorage.removeItem('ramalhoFinanceV6');location.reload();}}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;});
$('installBtn').onclick=()=>deferredPrompt?deferredPrompt.prompt():alert('No celular/notebook, use o menu do navegador e escolha Instalar aplicativo.');

function animateBg(){const c=$('techBg'),x=c.getContext('2d');let w,h,pts;function resize(){w=c.width=innerWidth;h=c.height=innerHeight;pts=Array.from({length:Math.min(100,Math.floor(w*h/13000))},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.55,vy:(Math.random()-.5)*.55}))}function loop(){x.clearRect(0,0,w,h);x.fillStyle='rgba(34,211,238,.7)';pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;x.beginPath();x.arc(p.x,p.y,1.4,0,Math.PI*2);x.fill()});x.strokeStyle='rgba(34,211,238,.12)';for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y;if(dx*dx+dy*dy<8500){x.beginPath();x.moveTo(pts[i].x,pts[i].y);x.lineTo(pts[j].x,pts[j].y);x.stroke()}}requestAnimationFrame(loop)}resize();addEventListener('resize',resize);loop()}
applyRecurring();animateBg();render();
if('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
