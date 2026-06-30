(function(){
'use strict';

const KEY='rf_v18_ultimate_rebuild';
const categoriesBase=['Alimentação','Transporte','Moradia','Educação','Saúde','Lazer','Cartão','Investimentos','Pix','Assinaturas','Salário','Outros'];
const defaultState={tx:[],wallets:[],cards:[],budgets:[],goals:[],investments:[],plan:[],assets:[],debts:[],customCategories:[],profileName:'Guilherme',theme:'dark',sortTx:false};

let state=loadState();

function $(id){return document.getElementById(id);}
function brl(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function today(){return new Date().toISOString().slice(0,10);}
function month(){return new Date().toISOString().slice(0,7);}
function id(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function loadState(){try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(defaultState);}catch(e){return structuredClone(defaultState);}}
function save(){localStorage.setItem(KEY,JSON.stringify(state));render();}
function allCategories(){const extra=(state.customCategories||[]).map(c=>c.name);return [...new Set([...categoriesBase,...extra])];}
function currentTx(){return state.tx.filter(t=>t.month===month());}
function sum(arr,fn){return arr.reduce((s,x)=>s+fn(x),0);}
function totals(){
  const tx=currentTx();
  const income=sum(tx.filter(t=>t.type==='income'),t=>t.amount);
  const expense=sum(tx.filter(t=>t.type==='expense'),t=>t.amount);
  const wallets=sum(state.wallets,t=>t.balance);
  const investments=sum(state.investments,t=>t.amount);
  const assets=sum(state.assets,t=>t.value);
  const debts=sum(state.debts,t=>Math.max(0,t.total-t.paid));
  const cardUsed=sum(tx.filter(t=>t.cardId),t=>t.amount);
  const cardLimit=sum(state.cards,t=>t.limit);
  const gross=wallets+investments+assets;
  const net=gross+income-expense-debts;
  return {income,expense,balance:income-expense,wallets,investments,assets,debts,cardUsed,cardLimit,gross,net};
}
function on(id,event,fn){const el=$(id);if(el)el.addEventListener(event,fn);}

function setPage(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const target=$(page); if(target)target.classList.add('active');
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.page===page));
  const sheet=$('sheet'); if(sheet)sheet.classList.add('hidden');
  scrollTo(0,0);
}

document.querySelectorAll('[data-page]').forEach(btn=>btn.addEventListener('click',()=>setPage(btn.dataset.page)));
on('menuBtn','click',()=> $('sheet').classList.toggle('hidden'));
on('themeBtn','click',()=>{state.theme=state.theme==='dark'?'light':'dark';save();});

on('addTxBtn','click',()=>{
  state.tx.push({id:id(),description:$('txDescription').value||'Lançamento',amount:Number($('txAmount').value||0),type:$('txType').value,category:$('txCategory').value,due:$('txDue').value,recurring:$('txRecurring').checked,month:month(),date:today()});
  $('txDescription').value='';$('txAmount').value='';$('txDue').value='';$('txRecurring').checked=false;save();
});
on('txSearch','input',renderTransactions);
on('txFilterType','change',renderTransactions);
on('txFilterCategory','change',renderTransactions);
on('txSortBtn','click',()=>{state.sortTx=!state.sortTx;save();});

on('addWalletBtn','click',()=>{
  state.wallets.push({id:id(),name:$('walletName').value||'Carteira',balance:Number($('walletBalance').value||0)});
  $('walletName').value='';$('walletBalance').value='';save();
});
on('transferBtn','click',()=>{
  const from=state.wallets.find(w=>w.id===$('fromWallet').value);
  const to=state.wallets.find(w=>w.id===$('toWallet').value);
  const amount=Number($('transferAmount').value||0);
  if(from&&to&&from.id!==to.id&&amount>0){from.balance-=amount;to.balance+=amount;state.tx.push({id:id(),description:`Transferência ${from.name} → ${to.name}`,amount,type:'expense',category:'Transferência',month:month(),date:today()});}
  $('transferAmount').value='';save();
});
on('addCardBtn','click',()=>{
  state.cards.push({id:id(),name:$('cardName').value||'Cartão',limit:Number($('cardLimit').value||0),due:Number($('cardDue').value||1)});
  $('cardName').value='';$('cardLimit').value='';$('cardDue').value='';save();
});
on('addParcelBtn','click',()=>{
  const total=Number($('parcelTotal').value||0), count=Math.max(1,Number($('parcelCount').value||1));
  const card=state.cards.find(c=>c.id===$('parcelCard').value);
  for(let i=0;i<count;i++){const d=new Date();d.setMonth(d.getMonth()+i);state.tx.push({id:id(),description:$('parcelDesc').value||'Compra parcelada',amount:total/count,type:'expense',category:'Cartão',cardId:card?card.id:'',installment:`${i+1}/${count}`,month:d.toISOString().slice(0,7),date:d.toISOString().slice(0,10)});}
  $('parcelDesc').value='';$('parcelTotal').value='';$('parcelCount').value='';save();
});
on('addBudgetBtn','click',()=>{
  const cat=$('budgetCategory').value, limit=Number($('budgetLimit').value||0);
  const b=state.budgets.find(x=>x.category===cat);
  if(b)b.limit=limit;else state.budgets.push({id:id(),category:cat,limit});
  $('budgetLimit').value='';save();
});
on('addGoalBtn','click',()=>{
  state.goals.push({id:id(),name:$('goalName').value||'Meta',target:Number($('goalTarget').value||0),saved:Number($('goalSaved').value||0),deadline:$('goalDeadline').value});
  $('goalName').value='';$('goalTarget').value='';$('goalSaved').value='';$('goalDeadline').value='';save();
});
on('addInvestmentBtn','click',()=>{
  state.investments.push({id:id(),name:$('investmentName').value||'Investimento',amount:Number($('investmentAmount').value||0),rate:Number($('investmentRate').value||0)});
  $('investmentName').value='';$('investmentAmount').value='';$('investmentRate').value='';save();
});
on('addPlanBtn','click',()=>{
  state.plan.push({id:id(),text:$('planText').value||'Plano financeiro',priority:$('planPriority').value,done:false});
  $('planText').value='';save();
});
on('addAssetBtn','click',()=>{
  state.assets.push({id:id(),name:$('assetName').value||'Bem',value:Number($('assetValue').value||0)});
  $('assetName').value='';$('assetValue').value='';save();
});
on('addDebtBtn','click',()=>{
  state.debts.push({id:id(),name:$('debtName').value||'Dívida',total:Number($('debtTotalInput').value||0),paid:Number($('debtPaidInput').value||0)});
  $('debtName').value='';$('debtTotalInput').value='';$('debtPaidInput').value='';save();
});

on('sampleBtn','click',()=>{insertSample();save();});
on('exportCsvBtn','click',exportCsv);
on('backupBtn','click',()=>download('ramalho-finance-v18-backup.json',JSON.stringify(state,null,2),'application/json'));
on('restoreInput','change',e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{state=JSON.parse(r.result);save();}catch(err){alert('Backup inválido.');}};r.readAsText(file);});
on('printBtn','click',()=>print());
on('clearBtn','click',()=>{if(confirm('Apagar todos os dados?')){localStorage.removeItem(KEY);location.reload();}});

document.addEventListener('click',e=>{
  const btn=e.target.closest('[data-action]');
  if(!btn)return;
  const action=btn.dataset.action, itemId=btn.dataset.id;
  if(action==='togglePlan'){const p=state.plan.find(x=>x.id===itemId);if(p)p.done=!p.done;save();return;}
  const map={tx:'tx',wallet:'wallets',card:'cards',budget:'budgets',goal:'goals',investment:'investments',plan:'plan',asset:'assets',debt:'debts'};
  const key=map[action];
  if(key){state[key]=state[key].filter(x=>x.id!==itemId);save();}
});

function render(){
  document.body.classList.toggle('light',state.theme==='light');
  populateSelects();
  const t=totals();
  const saving=t.income?Math.round(t.balance/t.income*100):0;
  const cardPct=t.cardLimit?Math.round(t.cardUsed/t.cardLimit*100):0;
  const score=Math.max(0,Math.min(100,50+saving-(t.balance<0?25:0)-(cardPct>60?15:0)-(t.debts>0?5:0)));

  $('greeting').textContent=greeting()+', '+state.profileName;
  setText('netWorth',brl(t.net)); setText('incomeTotal',brl(t.income)); setText('expenseTotal',brl(t.expense)); setText('balanceTotal',brl(t.balance)); setText('reserveIdeal',brl(t.expense*6));
  setText('walletTotal',brl(t.wallets)); setText('investmentTotal',brl(t.investments)); setText('debtTotal',brl(t.debts)); setText('grossWorth',brl(t.gross));
  setText('score',score); setText('savingRate',saving+'%'); setText('riskLevel',score>=70?'Baixo':score>=45?'Médio':'Alto');
  $('mainInsight').textContent=mainInsight(t,score);

  renderAI(t,score,saving,cardPct); renderBars(t); renderCategoryBars(); renderAlerts(t,saving,cardPct);
  renderTransactions(); renderWallets(); renderCards(); renderBudgets(); renderGoals(); renderInvestments(); renderPlanning(); renderAssetsDebts(); renderMonthlySummary(); renderCloud();
}
function setText(id,v){const el=$(id);if(el)el.textContent=v;}
function greeting(){const h=new Date().getHours();return h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';}
function mainInsight(t,score){if(t.balance<0)return 'Seu mês está negativo. Priorize cortar gastos variáveis.'; if(score>=75)return 'Sua saúde financeira está forte.'; return 'Seu painel está pronto para novos lançamentos.';}
function populateSelects(){
  const cats=allCategories();
  ['txCategory','budgetCategory'].forEach(id=>{const el=$(id);if(el)el.innerHTML=cats.map(c=>`<option>${c}</option>`).join('');});
  const filter=$('txFilterCategory');if(filter)filter.innerHTML='<option value="all">Todas categorias</option>'+cats.map(c=>`<option value="${c}">${c}</option>`).join('');
}
function categoryMap(){const c={};currentTx().filter(t=>t.type==='expense').forEach(t=>c[t.category]=(c[t.category]||0)+t.amount);return c;}
function renderAI(t,score,saving,cardPct){
  $('aiPanel').innerHTML=`<div class="alert"><b>Score:</b> ${score}/100<br>Economia: ${saving}%<br>Cartão: ${cardPct}%<br>Reserva ideal: ${brl(t.expense*6)}</div><div class="alert"><b>Sugestão:</b> ${t.balance>0?'direcione parte do saldo para metas/investimentos.':'reduza despesas antes de assumir novas parcelas.'}</div>`;
}
function renderBars(t){
  const data=[['Receitas',t.income],['Despesas',t.expense],['Carteiras',t.wallets],['Investimentos',t.investments],['Dívidas',t.debts]];
  const max=Math.max(1,...data.map(x=>x[1]));
  $('flowBars').innerHTML=data.map(([label,value])=>bar(label,value,max)).join('');
}
function renderCategoryBars(){const map=categoryMap();const keys=Object.keys(map);const max=Math.max(1,...keys.map(k=>map[k]));$('categoryBars').innerHTML=keys.map(k=>bar(k,map[k],max)).join('')||'<p>Nenhum gasto por categoria.</p>';}
function bar(label,value,max){return `<small>${label} — ${brl(value)}</small><div class="bar"><span style="width:${Math.round(value/max*100)}%"></span></div>`;}
function renderAlerts(t,saving,cardPct){
  const arr=[]; if(t.balance<0)arr.push('⚠️ Saldo mensal negativo.'); if(cardPct>60)arr.push('💳 Uso do cartão acima de 60%.'); if(t.wallets<t.expense*3&&t.expense>0)arr.push('🛡️ Reserva abaixo de 3 meses.'); if(!arr.length)arr.push('✅ Nenhum alerta crítico.');
  $('alerts').innerHTML=arr.map(a=>`<div class="alert">${a}</div>`).join('');
}
function renderTransactions(){
  const q=($('txSearch').value||'').toLowerCase(), ft=$('txFilterType').value, fc=$('txFilterCategory').value;
  let list=currentTx().filter(t=>(ft==='all'||t.type===ft)&&(fc==='all'||t.category===fc)&&(t.description||'').toLowerCase().includes(q));
  if(state.sortTx)list=list.sort((a,b)=>b.amount-a.amount);
  $('txList').innerHTML=list.map(t=>`<div class="row"><div><b>${t.description}</b><small>${t.category}${t.installment?' • '+t.installment:''}</small></div><b class="${t.type==='income'?'positive':'negative'}">${t.type==='income'?'+':'-'} ${brl(t.amount)}</b><button class="delete" data-action="tx" data-id="${t.id}">Excluir</button></div>`).join('')||'<p>Nenhum lançamento.</p>';
}
function renderWallets(){
  const opts=state.wallets.map(w=>`<option value="${w.id}">${w.name}</option>`).join('');
  $('fromWallet').innerHTML=opts;$('toWallet').innerHTML=opts;
  $('walletList').innerHTML=state.wallets.map(w=>`<div class="row"><b>${w.name}</b><span>${brl(w.balance)}</span><button class="delete" data-action="wallet" data-id="${w.id}">Excluir</button></div>`).join('')||'<p>Nenhuma carteira.</p>';
}
function renderCards(){
  $('parcelCard').innerHTML=state.cards.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
  $('cardList').innerHTML=state.cards.map(c=>{const used=sum(currentTx().filter(t=>t.cardId===c.id),t=>t.amount);const pct=c.limit?Math.min(100,Math.round(used/c.limit*100)):0;return `<div class="alert"><b>${c.name}</b><p>Usado ${brl(used)} de ${brl(c.limit)} • vence dia ${c.due}</p><div class="progress"><span style="width:${pct}%"></span></div><button class="delete" data-action="card" data-id="${c.id}">Excluir</button></div>`;}).join('')||'<p>Nenhum cartão.</p>';
}
function renderBudgets(){
  const spent=categoryMap();
  $('budgetList').innerHTML=state.budgets.map(b=>{const used=spent[b.category]||0;const pct=b.limit?Math.min(100,Math.round(used/b.limit*100)):0;return `<div class="alert"><b>${b.category}</b><p>${brl(used)} de ${brl(b.limit)} • ${pct}%</p><div class="progress"><span style="width:${pct}%"></span></div><button class="delete" data-action="budget" data-id="${b.id}">Excluir</button></div>`;}).join('')||'<p>Nenhum orçamento.</p>';
}
function renderGoals(){
  $('goalList').innerHTML=state.goals.map(g=>{const pct=g.target?Math.min(100,Math.round(g.saved/g.target*100)):0;return `<div class="alert"><b>${g.name}</b><p>${brl(g.saved)} de ${brl(g.target)} • ${pct}% ${g.deadline?'• '+g.deadline:''}</p><div class="progress"><span style="width:${pct}%"></span></div><button class="delete" data-action="goal" data-id="${g.id}">Excluir</button></div>`;}).join('')||'<p>Nenhuma meta.</p>';
}
function renderInvestments(){
  const total=sum(state.investments,i=>i.amount);
  $('investmentList').innerHTML=state.investments.map(i=>`<div class="row"><div><b>${i.name}</b><small>${i.rate}% ao mês</small></div><span>${brl(i.amount)}</span><button class="delete" data-action="investment" data-id="${i.id}">Excluir</button></div>`).join('')||'<p>Nenhum investimento.</p>';
  let future=total;for(let i=0;i<120;i++)future=(future+100)*1.008;
  $('investmentProjection').innerHTML=`<div class="alert">Com aporte simulado de R$100/mês por 10 anos: <b>${brl(future)}</b></div>`;
}
function renderPlanning(){
  $('planList').innerHTML=state.plan.map(p=>`<div class="row"><div><b class="${p.done?'done':''}">${p.text}</b><small>Prioridade ${p.priority}</small></div><button data-action="togglePlan" data-id="${p.id}">${p.done?'Reabrir':'Concluir'}</button><button class="delete" data-action="plan" data-id="${p.id}">Excluir</button></div>`).join('')||'<p>Nenhum plano.</p>';
}
function renderAssetsDebts(){
  const assets=state.assets.map(a=>`<div class="row"><div><b>${a.name}</b><small>Bem</small></div><span>${brl(a.value)}</span><button class="delete" data-action="asset" data-id="${a.id}">Excluir</button></div>`).join('');
  const debts=state.debts.map(d=>`<div class="row"><div><b>${d.name}</b><small>Dívida • falta ${brl(Math.max(0,d.total-d.paid))}</small></div><span>${brl(d.total)}</span><button class="delete" data-action="debt" data-id="${d.id}">Excluir</button></div>`).join('');
  $('assetDebtList').innerHTML=assets+debts||'<p>Nenhum bem ou dívida.</p>';
}
function renderMonthlySummary(){
  const m={};state.tx.forEach(t=>{m[t.month]=m[t.month]||{income:0,expense:0};t.type==='income'?m[t.month].income+=t.amount:m[t.month].expense+=t.amount;});
  $('monthlySummary').innerHTML=Object.keys(m).sort().reverse().map(k=>`<div class="row"><b>${k}</b><span>Receitas ${brl(m[k].income)} • Despesas ${brl(m[k].expense)}</span></div>`).join('')||'<p>Sem resumo.</p>';
}
function renderCloud(){$('cloudStatus').innerHTML='<div class="alert">Firebase: preparado/desligado</div><div class="alert">Banco atual: localStorage</div><div class="alert">GitHub Pages: compatível</div>';}

function exportCsv(){const rows=['Mes,Data,Tipo,Categoria,Descricao,Valor'];state.tx.forEach(t=>rows.push([t.month,t.date,t.type,t.category,'"'+t.description+'"',t.amount].join(',')));download('ramalho-finance-v18.csv',rows.join('\n'),'text/csv');}
function download(name,content,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();}
function insertSample(){
  state.wallets=[{id:id(),name:'Nubank',balance:1200},{id:id(),name:'Dinheiro',balance:150}];
  state.tx=[{id:id(),description:'Salário',amount:1800,type:'income',category:'Salário',month:month(),date:today()},{id:id(),description:'Mercado',amount:430,type:'expense',category:'Alimentação',month:month(),date:today()},{id:id(),description:'Transporte',amount:180,type:'expense',category:'Transporte',month:month(),date:today()}];
  state.cards=[{id:id(),name:'Cartão principal',limit:2000,due:10}];
  state.budgets=[{id:id(),category:'Alimentação',limit:600},{id:id(),category:'Transporte',limit:250}];
  state.goals=[{id:id(),name:'Notebook',target:5000,saved:800,deadline:''}];
  state.investments=[{id:id(),name:'Reserva CDB',amount:500,rate:.8}];
  state.plan=[{id:id(),text:'Guardar R$200 este mês',priority:'Alta',done:false}];
  state.assets=[{id:id(),name:'Celular',value:1000}];
  state.debts=[{id:id(),name:'Parcela antiga',total:600,paid:200}];
}

try{render();}catch(err){console.error(err);alert('Erro ao iniciar: '+err.message);}
if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister()));}
})();