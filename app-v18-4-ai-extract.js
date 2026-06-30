(function(){
'use strict';

const KEY='rf_v18_4_ai_extract';
const categoriesBase=['Alimentação','Transporte','Moradia','Educação','Saúde','Lazer','Cartão','Investimentos','Pix','Assinaturas','Salário','Outros'];
const defaultState={tx:[],wallets:[],cards:[],budgets:[],goals:[],investments:[],plan:[],assets:[],debts:[],subscriptions:[],favorites:[],recentActions:[],safeNotes:[],safeRoutine:[],incomeSources:[],taxes:[],goalPro:[],safeGoals:[],safeWishlist:[],safeHabits:[],customCategories:[],extractDraft:[],profileName:'Guilherme',theme:'dark',sortTx:false};

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
  const subscriptions=sum(state.subscriptions,t=>t.value);
  const taxes=sum(state.taxes,t=>t.value);
  const incomeSources=sum(state.incomeSources,t=>t.value);
  const cardUsed=sum(tx.filter(t=>t.cardId),t=>t.amount);
  const cardLimit=sum(state.cards,t=>t.limit);
  const gross=wallets+investments+assets;
  const net=gross+income-expense-debts;
  return {income,expense,balance:income-expense,wallets,investments,assets,debts,subscriptions,taxes,incomeSources,cardUsed,cardLimit,gross,net:net-taxes};
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


on('addSubBtn','click',()=>{state.subscriptions.push({id:id(),name:$('subName').value||'Assinatura',value:Number($('subValue').value||0),category:$('subCategory').value,due:Number($('subDue').value||1)});state.tx.push({id:id(),description:$('subName').value||'Assinatura',amount:Number($('subValue').value||0),type:'expense',category:$('subCategory').value,recurring:true,month:month(),date:today()});$('subName').value='';$('subValue').value='';$('subDue').value='';save();});
on('addFavoriteBtn','click',()=>{state.favorites.push({id:id(),name:$('favName').value||'Favorito',amount:Number($('favAmount').value||0),type:$('favType').value,category:$('favCategory').value});$('favName').value='';$('favAmount').value='';save();});
on('quickIncomeBtn','click',()=>quickTx('Receita rápida',100,'income','Salário'));
on('quickFoodBtn','click',()=>quickTx('Alimentação rápida',30,'expense','Alimentação'));
on('quickTransportBtn','click',()=>quickTx('Transporte rápido',15,'expense','Transporte'));
on('quickSubBtn','click',()=>quickTx('Assinatura rápida',39.90,'expense','Assinaturas'));
on('addSafeNoteBtn','click',()=>{const text=($('safeNoteText').value||'').trim();if(text)state.safeNotes.unshift({id:id(),text,date:today()});$('safeNoteText').value='';save();});
on('addRoutineBtn','click',()=>{state.safeRoutine.push({id:id(),text:$('routineText').value||'Rotina financeira',done:false});$('routineText').value='';save();});
on('globalSearch','input',renderGlobalSearch);
on('extractFile','change',handleExtractFile);
on('analyzeExtractBtn','click',analyzeExtractInput);
on('clearExtractBtn','click',()=>{state.extractDraft=[];if($('extractPaste'))$('extractPaste').value='';save();});
on('importExtractBtn','click',importExtractDraft);



on('addIncomeSourceBtn','click',()=>{state.incomeSources.push({id:id(),name:$('incomeSourceName').value||'Renda',value:Number($('incomeSourceValue').value||0),type:$('incomeSourceType').value});$('incomeSourceName').value='';$('incomeSourceValue').value='';save();});
on('addTaxBtn','click',()=>{state.taxes.push({id:id(),name:$('taxName').value||'Taxa',value:Number($('taxValue').value||0),due:$('taxDue').value});$('taxName').value='';$('taxValue').value='';$('taxDue').value='';save();});
on('addGoalProBtn','click',()=>{state.goalPro.push({id:id(),name:$('goalProName').value||'Meta Pro',target:Number($('goalProTarget').value||0),saved:Number($('goalProSaved').value||0),deadline:$('goalProDeadline').value});$('goalProName').value='';$('goalProTarget').value='';$('goalProSaved').value='';$('goalProDeadline').value='';save();});
on('addSafeGoalBtn','click',()=>{state.safeGoals.push({id:id(),name:$('safeGoalName').value||'Meta rápida',value:Number($('safeGoalValue').value||0)});$('safeGoalName').value='';$('safeGoalValue').value='';save();});
on('addWishBtn','click',()=>{state.safeWishlist.push({id:id(),name:$('wishName').value||'Desejo',value:Number($('wishValue').value||0),saved:Number($('wishSaved').value||0)});$('wishName').value='';$('wishValue').value='';$('wishSaved').value='';save();});
on('addHabitBtn','click',()=>{state.safeHabits.push({id:id(),name:$('habitName').value||'Hábito financeiro',done:false});$('habitName').value='';save();});
on('exportHtmlBtn','click',exportHtmlReport);
on('copySummaryBtn','click',copySummary);

on('sampleBtn','click',()=>{insertSample();save();});
on('exportCsvBtn','click',exportCsv);
on('backupBtn','click',()=>download('ramalho-finance-v18-4-ai-extract-backup.json',JSON.stringify(state,null,2),'application/json'));
on('restoreInput','change',e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{state=JSON.parse(r.result);save();}catch(err){alert('Backup inválido.');}};r.readAsText(file);});
on('printBtn','click',()=>print());
on('clearBtn','click',()=>{if(confirm('Apagar todos os dados?')){localStorage.removeItem(KEY);location.reload();}});

document.addEventListener('click',e=>{
  const btn=e.target.closest('[data-action]');
  if(!btn)return;
  const action=btn.dataset.action, itemId=btn.dataset.id;
  if(action==='togglePlan'){const p=state.plan.find(x=>x.id===itemId);if(p)p.done=!p.done;save();return;}
  if(action==='toggleRoutine'){const r=state.safeRoutine.find(x=>x.id===itemId);if(r)r.done=!r.done;save();return;}
  if(action==='toggleHabit'){const h=state.safeHabits.find(x=>x.id===itemId);if(h)h.done=!h.done;save();return;}
  if(action==='toggleExtract'){const ex=(state.extractDraft||[]).find(x=>x.id===itemId);if(ex)ex.approved=!ex.approved;save();return;}
  if(action==='deleteExtract'){state.extractDraft=(state.extractDraft||[]).filter(x=>x.id!==itemId);save();return;}
  if(action==='useFavorite'){const f=state.favorites.find(x=>x.id===itemId);if(f)quickTx(f.name,f.amount,f.type,f.category);return;}
  const map={tx:'tx',wallet:'wallets',card:'cards',budget:'budgets',goal:'goals',investment:'investments',plan:'plan',asset:'assets',debt:'debts',sub:'subscriptions',favorite:'favorites',note:'safeNotes',routine:'safeRoutine',incomeSource:'incomeSources',tax:'taxes',goalPro:'goalPro',safeGoal:'safeGoals',wish:'safeWishlist',habit:'safeHabits'};
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

  renderAI(t,score,saving,cardPct); renderInfinityStats(t,score); renderPremiumCenter(t,score); renderBars(t); renderCategoryBars(); renderAlerts(t,saving,cardPct);
  renderProfessionalAI(t,score,saving,cardPct); renderSmartForecast(t); renderAIProfessionalPage(t,score,saving,cardPct); renderTransactions(); renderWallets(); renderCards(); renderCardElite(); renderBudgets(); renderSubscriptions(); renderIncomeSources(); renderTaxes(); renderFutureBills(); renderGoals(); renderGoalPro(); renderInvestments(); renderPlanning(); renderAssetsDebts(); renderAnalytics(); renderFavorites(); renderRecentActions(); renderSafeTools(); renderSafeLife(); renderRestorePanel(t,score); renderCoachPlan(t,score); renderExportSummary(); renderGlobalSearch(); renderExtractReader(); renderMonthlySummary(); renderCloud();
}
function setText(id,v){const el=$(id);if(el)el.textContent=v;}
function greeting(){const h=new Date().getHours();return h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';}
function mainInsight(t,score){if(t.balance<0)return 'Seu mês está negativo. Priorize cortar gastos variáveis.'; if(score>=75)return 'Sua saúde financeira está forte.'; return 'Seu painel está pronto para novos lançamentos.';}
function populateSelects(){
  const cats=allCategories();
  ['txCategory','budgetCategory','subCategory','favCategory'].forEach(id=>{const el=$(id);if(el)el.innerHTML=cats.map(c=>`<option>${c}</option>`).join('');});
  const filter=$('txFilterCategory');if(filter)filter.innerHTML='<option value="all">Todas categorias</option>'+cats.map(c=>`<option value="${c}">${c}</option>`).join('');
}
function categoryMap(){const c={};currentTx().filter(t=>t.type==='expense').forEach(t=>c[t.category]=(c[t.category]||0)+t.amount);return c;}
function aiMetrics(t,score,saving,cardPct){
  const fixed=(t.subscriptions||0)+(t.taxes||0);
  const fixedPressure=t.income?Math.round(fixed/t.income*100):0;
  const reserveMonths=t.expense?Math.floor(t.wallets/t.expense):0;
  const daily=t.expense/Math.max(1,new Date().getDate());
  const projectedEndMonth=t.balance;
  const projected90=t.net+(t.balance/30*90);
  const projected365=t.net+(t.balance/30*365);
  return {fixed,fixedPressure,reserveMonths,daily,projectedEndMonth,projected90,projected365};
}
function aiRiskLabel(score){
  if(score>=80)return 'Excelente';
  if(score>=65)return 'Saudável';
  if(score>=45)return 'Atenção';
  return 'Crítico';
}
function aiRecommendations(t,score,saving,cardPct){
  const m=aiMetrics(t,score,saving,cardPct);
  const tips=[];
  if(t.balance<0)tips.push('Reduzir despesas variáveis ainda este mês para recuperar o saldo.');
  if(cardPct>60)tips.push('Evitar novas compras no cartão até o uso ficar abaixo de 50%.');
  if(m.reserveMonths<3&&t.expense>0)tips.push('Construir reserva de emergência de pelo menos 3 meses.');
  if(m.fixedPressure>45)tips.push('Revisar assinaturas, taxas e custos fixos que passam de 45% da renda.');
  if(t.balance>0)tips.push('Investir ou guardar '+brl(Math.max(0,t.balance*.3))+' neste mês.');
  if(!tips.length)tips.push('Manter rotina semanal de revisão e continuar alimentando os dados.');
  return tips;
}
function renderProfessionalAI(t,score,saving,cardPct){
  const el=$('aiProfessionalPanel');if(!el)return;
  const m=aiMetrics(t,score,saving,cardPct);
  el.innerHTML=`<div class="professional-kpi">
    <div class="alert"><span class="ai-chip">IA</span><p class="ai-level">${aiRiskLabel(score)}</p><small>nível financeiro</small></div>
    <div class="alert"><b>Pressão fixa</b><p>${m.fixedPressure}%</p><small>${brl(m.fixed)}</small></div>
    <div class="alert"><b>Reserva</b><p>${m.reserveMonths} mês(es)</p><small>ideal: ${brl(t.expense*6)}</small></div>
    <div class="alert"><b>Média diária</b><p>${brl(m.daily)}</p><small>gasto médio</small></div>
  </div>`;
}
function renderSmartForecast(t){
  const el=$('smartForecast');if(!el)return;
  const m=aiMetrics(t,0,0,0);
  el.innerHTML=`<div class="professional-kpi">
    <div class="alert"><b>Fim do mês</b><p>${brl(m.projectedEndMonth)}</p></div>
    <div class="alert"><b>90 dias</b><p>${brl(m.projected90)}</p></div>
    <div class="alert"><b>365 dias</b><p>${brl(m.projected365)}</p></div>
    <div class="alert"><b>Potencial 12m</b><p>${brl(Math.max(0,t.balance)*12)}</p></div>
  </div>`;
}
function renderAIProfessionalPage(t,score,saving,cardPct){
  const d=$('aiDiagnosis'), a=$('aiActionPlan'), o=$('aiOpportunities');
  if(!d&&!a&&!o)return;
  const m=aiMetrics(t,score,saving,cardPct);
  if(d)d.innerHTML=`<div class="alert"><b>Diagnóstico:</b> ${aiRiskLabel(score)}<p>Score ${score}/100, economia ${saving}%, cartão ${cardPct}%, reserva ${m.reserveMonths} mês(es), pressão fixa ${m.fixedPressure}%.</p></div>`;
  if(a)a.innerHTML=aiRecommendations(t,score,saving,cardPct).map((x,i)=>`<div class="alert"><b>Ação ${i+1}</b><p>${x}</p></div>`).join('');
  const opportunities=[];
  if(t.balance>0)opportunities.push('Converter saldo positivo em investimento ou meta.');
  if(cardPct<30)opportunities.push('Uso de cartão está controlado; manter limite sob controle.');
  if(m.reserveMonths>=3)opportunities.push('Reserva boa: considerar aportes em objetivos maiores.');
  if(!opportunities.length)opportunities.push('Oportunidade principal: estabilizar saldo e reduzir gastos fixos.');
  if(o)o.innerHTML=opportunities.map(x=>`<div class="alert">${x}</div>`).join('');
}
function quickTx(description,amount,type,category){
  state.tx.push({id:id(),description,amount,type,category,recurring:false,month:month(),date:today()});
  state.recentActions.unshift({id:id(),text:description+' • '+brl(amount),date:today()});
  state.recentActions=state.recentActions.slice(0,10);
  save();
}
function renderInfinityStats(t,score){
  const daily=t.expense/Math.max(1,new Date().getDate());
  const el=$('infinityStats');if(!el)return;
  el.innerHTML=`<div class="mini-grid"><div class="alert infinity-glow"><b>Média diária</b><p>${brl(daily)}</p></div><div class="alert"><b>Categoria crítica</b><p>${criticalCategory()}</p></div><div class="alert"><b>Score</b><p>${score}</p></div><div class="alert"><b>Projeção 12m</b><p>${brl(t.net+t.balance*12)}</p></div></div>`;
}
function renderPremiumCenter(t,score){
  const el=$('premiumCenter');if(!el)return;
  el.innerHTML=`<div class="mini-grid"><div class="alert"><b>Assinaturas</b><p>${brl(t.subscriptions)}</p></div><div class="alert"><b>Patrimônio bruto</b><p>${brl(t.gross)}</p></div><div class="alert"><b>Dívidas</b><p>${brl(t.debts)}</p></div><div class="alert"><b>Nível</b><p>${score>=70?'Forte':score>=45?'Atenção':'Crítico'}</p></div></div>`;
}
function criticalCategory(){const map=categoryMap();const keys=Object.keys(map).sort((a,b)=>map[b]-map[a]);return keys[0]||'Nenhuma';}
function renderAI(t,score,saving,cardPct){
  const m=aiMetrics(t,score,saving,cardPct);
  $('aiPanel').innerHTML=`<div class="alert"><span class="ai-chip">Finance AI Professional</span><p><b>${aiRiskLabel(score)}</b> • Score ${score}/100</p><p>Economia: ${saving}% • Cartão: ${cardPct}% • Reserva: ${m.reserveMonths} mês(es)</p></div><div class="alert"><b>Recomendação principal:</b> ${aiRecommendations(t,score,saving,cardPct)[0]}</div>`;
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
function renderSubscriptions(){
  const el=$('subList');if(!el)return;
  el.innerHTML=(state.subscriptions.length?`<div class="alert"><b>Total mensal:</b> ${brl(sum(state.subscriptions,s=>s.value))}</div>`:'')+
  state.subscriptions.map(s=>`<div class="row"><div><b>${s.name}</b><small>${s.category} • vence dia ${s.due}</small></div><span>${brl(s.value)}</span><button class="delete" data-action="sub" data-id="${s.id}">Excluir</button></div>`).join('')||'<p>Nenhuma assinatura.</p>';
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
function renderAnalytics(){
  const a=$('analyticsSummary'), r=$('categoryRanking'), tl=$('timelineList'); if(!a&&!r&&!tl)return;
  const t=totals(), daily=t.expense/Math.max(1,new Date().getDate());
  if(a)a.innerHTML=`<div class="mini-grid"><div class="alert"><b>Média diária</b><p>${brl(daily)}</p></div><div class="alert"><b>Média semanal</b><p>${brl(daily*7)}</p></div><div class="alert"><b>Maior categoria</b><p>${criticalCategory()}</p></div><div class="alert"><b>Economia 12m</b><p>${brl(Math.max(0,t.balance)*12)}</p></div></div>`;
  const map=categoryMap();const keys=Object.keys(map).sort((a,b)=>map[b]-map[a]);
  if(r)r.innerHTML=keys.map((k,i)=>`<div class="row"><b>${i+1}. ${k}</b><span>${brl(map[k])}</span></div>`).join('')||'<p>Sem ranking.</p>';
  if(tl)tl.innerHTML=state.tx.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,80).map(x=>`<div class="alert"><b>${x.description}</b><p>${x.date} • ${x.category} • ${x.type==='income'?'+':'-'} ${brl(x.amount)}</p></div>`).join('')||'<p>Sem timeline.</p>';
}
function renderFavorites(){
  const el=$('favoriteList');if(!el)return;
  el.innerHTML=state.favorites.map(f=>`<div class="alert"><b>${f.name}</b><p>${f.category} • ${brl(f.amount)}</p><button class="favorite-btn" data-action="useFavorite" data-id="${f.id}">Usar favorito</button><button class="delete" data-action="favorite" data-id="${f.id}">Excluir</button></div>`).join('')||'<p>Nenhum favorito.</p>';
}
function renderRecentActions(){
  const el=$('recentActions');if(!el)return;
  el.innerHTML=state.recentActions.map(a=>`<div class="row"><b>${a.text}</b><small>${a.date}</small></div>`).join('')||'<p>Nenhuma ação recente.</p>';
}
function renderSafeTools(){
  const notes=$('safeNoteList'), routine=$('routineList');
  if(notes)notes.innerHTML=state.safeNotes.map(n=>`<div class="alert note-card"><b>${n.date}</b><p>${n.text}</p><button class="delete" data-action="note" data-id="${n.id}">Excluir</button></div>`).join('')||'<p>Nenhuma nota.</p>';
  if(routine)routine.innerHTML=state.safeRoutine.map(r=>`<div class="row"><b class="${r.done?'done':''}">${r.text}</b><button data-action="toggleRoutine" data-id="${r.id}">${r.done?'Reabrir':'Concluir'}</button><button class="delete" data-action="routine" data-id="${r.id}">Excluir</button></div>`).join('')||'<p>Nenhuma rotina.</p>';
}
function renderGlobalSearch(){
  const el=$('globalResults'), input=$('globalSearch'); if(!el||!input)return;
  const q=(input.value||'').toLowerCase(); if(!q){el.innerHTML='<p>Digite para pesquisar.</p>';return;}
  const results=[];
  state.tx.forEach(x=>{if((x.description||'').toLowerCase().includes(q)||(x.category||'').toLowerCase().includes(q))results.push('Lançamento: '+x.description+' • '+brl(x.amount));});
  state.goals.forEach(x=>{if((x.name||'').toLowerCase().includes(q))results.push('Meta: '+x.name);});
  state.investments.forEach(x=>{if((x.name||'').toLowerCase().includes(q))results.push('Investimento: '+x.name+' • '+brl(x.amount));});
  state.cards.forEach(x=>{if((x.name||'').toLowerCase().includes(q))results.push('Cartão: '+x.name);});
  el.innerHTML=results.slice(0,20).map(r=>`<div class="search-result">${r}</div>`).join('')||'<p>Nenhum resultado.</p>';
}
function renderRestorePanel(t,score){
  const el=$('legacyRestorePanel');if(!el)return;
  el.innerHTML=`<div class="mini-grid"><div class="alert restore-card"><b>Rendas previstas</b><p>${brl(t.incomeSources)}</p></div><div class="alert"><b>Taxas</b><p>${brl(t.taxes)}</p></div><div class="alert"><b>Metas Pro</b><p>${state.goalPro.length}</p></div><div class="alert"><b>SAFE Life</b><p>${state.safeGoals.length+state.safeWishlist.length+state.safeHabits.length}</p></div></div>`;
}
function renderIncomeSources(){
  const el=$('incomeSourceList');if(!el)return;
  el.innerHTML=(state.incomeSources.length?`<div class="alert"><b>Total previsto:</b> ${brl(sum(state.incomeSources,x=>x.value))}</div>`:'')+state.incomeSources.map(x=>`<div class="row"><div><b>${x.name}</b><small>${x.type}</small></div><span>${brl(x.value)}</span><button class="delete" data-action="incomeSource" data-id="${x.id}">Excluir</button></div>`).join('')||'<p>Nenhuma fonte de renda.</p>';
}
function renderTaxes(){
  const el=$('taxList');if(!el)return;
  el.innerHTML=(state.taxes.length?`<div class="alert"><b>Total:</b> ${brl(sum(state.taxes,x=>x.value))}</div>`:'')+state.taxes.map(x=>`<div class="row"><div><b>${x.name}</b><small>${x.due||'sem data'}</small></div><span>${brl(x.value)}</span><button class="delete" data-action="tax" data-id="${x.id}">Excluir</button></div>`).join('')||'<p>Nenhuma taxa.</p>';
}
function renderFutureBills(){
  const el=$('futureBillsList');if(!el)return;
  const list=[];
  state.tx.filter(t=>t.due).forEach(t=>list.push({name:t.description,value:t.amount,due:t.due,type:'Lançamento'}));
  state.subscriptions.forEach(s=>list.push({name:s.name,value:s.value,due:'Dia '+s.due,type:'Assinatura'}));
  state.taxes.filter(t=>t.due).forEach(t=>list.push({name:t.name,value:t.value,due:t.due,type:'Taxa'}));
  el.innerHTML=list.map(x=>`<div class="row"><div><b>${x.name}</b><small>${x.type} • ${x.due}</small></div><span>${brl(x.value)}</span></div>`).join('')||'<p>Nenhum compromisso futuro.</p>';
}
function renderCardElite(){
  const el=$('cardEliteList');if(!el)return;
  el.innerHTML=state.cards.map(c=>{const used=sum(currentTx().filter(t=>t.cardId===c.id),t=>t.amount);const free=Math.max(0,c.limit-used);const pct=c.limit?Math.round(used/c.limit*100):0;return `<div class="alert"><b>${c.name}</b><p>Usado ${brl(used)} • Livre ${brl(free)} • ${pct}%</p><div class="progress"><span style="width:${Math.min(100,pct)}%"></span></div></div>`;}).join('')||'<p>Nenhum cartão.</p>';
}
function renderGoalPro(){
  const el=$('goalProList');if(!el)return;
  el.innerHTML=state.goalPro.map(g=>{const pct=g.target?Math.min(100,Math.round(g.saved/g.target*100)):0;return `<div class="alert"><b>${g.name}</b><p>${brl(g.saved)} de ${brl(g.target)} • ${pct}% ${g.deadline?'• '+g.deadline:''}</p><div class="progress"><span style="width:${pct}%"></span></div><button class="delete" data-action="goalPro" data-id="${g.id}">Excluir</button></div>`;}).join('')||'<p>Nenhuma meta Pro.</p>';
}
function renderSafeLife(){
  const g=$('safeGoalList'), w=$('wishList'), h=$('habitList');
  if(g)g.innerHTML=state.safeGoals.map(x=>`<div class="row"><b>${x.name}</b><span>${brl(x.value)}</span><button class="delete" data-action="safeGoal" data-id="${x.id}">Excluir</button></div>`).join('')||'<p>Nenhuma meta rápida.</p>';
  if(w)w.innerHTML=state.safeWishlist.map(x=>{const pct=x.value?Math.min(100,Math.round(x.saved/x.value*100)):0;return `<div class="alert"><b>${x.name}</b><p>${brl(x.saved)} de ${brl(x.value)} • ${pct}%</p><div class="progress"><span style="width:${pct}%"></span></div><button class="delete" data-action="wish" data-id="${x.id}">Excluir</button></div>`;}).join('')||'<p>Nenhum desejo.</p>';
  if(h)h.innerHTML=state.safeHabits.map(x=>`<div class="row"><b class="${x.done?'habit-done':''}">${x.name}</b><button data-action="toggleHabit" data-id="${x.id}">${x.done?'Reabrir':'Concluir'}</button><button class="delete" data-action="habit" data-id="${x.id}">Excluir</button></div>`).join('')||'<p>Nenhum hábito.</p>';
}
function renderCoachPlan(t,score){
  const el=$('coachPlan');if(!el)return;
  const tips=[];
  if(t.balance<0)tips.push('Reduzir gastos variáveis até o saldo ficar positivo.');
  if(t.debts>0)tips.push('Priorizar pagamento de dívidas pendentes.');
  if(t.wallets<t.expense*3&&t.expense>0)tips.push('Construir reserva de emergência de pelo menos 3 meses.');
  if(t.balance>0)tips.push('Direcionar '+brl(t.balance*.3)+' para metas ou investimentos.');
  if(!tips.length)tips.push('Manter consistência e revisar gastos semanalmente.');
  el.innerHTML=tips.map((tip,i)=>`<div class="alert"><b>Passo ${i+1}</b><p>${tip}</p></div>`).join('');
}
function summaryText(){
  const t=totals();
  return `Ramalho Finance V18.3 Professional AI\nPatrimônio líquido: ${brl(t.net)}\nReceitas: ${brl(t.income)}\nDespesas: ${brl(t.expense)}\nSaldo: ${brl(t.balance)}\nDívidas: ${brl(t.debts)}\nTaxas: ${brl(t.taxes)}\nInvestimentos: ${brl(t.investments)}`;
}
function renderExportSummary(){const el=$('exportSummary');if(el)el.innerHTML=`<div class="alert"><pre style="white-space:pre-wrap">${summaryText()}</pre></div>`;}
function copySummary(){if(navigator.clipboard)navigator.clipboard.writeText(summaryText()).then(()=>renderExportSummary());}
function exportHtmlReport(){download('relatorio-ramalho-finance-v18-2.html','<!doctype html><meta charset="utf-8"><pre>'+summaryText()+'</pre>','text/html');}
function handleExtractFile(e){
  const file=e.target.files&&e.target.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{if($('extractPaste'))$('extractPaste').value=String(reader.result||''); analyzeExtractInput();};
  reader.readAsText(file);
}
function analyzeExtractInput(){
  const raw=($('extractPaste')&&$('extractPaste').value)||'';
  state.extractDraft=parseExtractText(raw);
  save();
}
function parseExtractText(raw){
  const lines=String(raw||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const out=[];
  lines.forEach(line=>{
    const lower=line.toLowerCase();
    if(lower.includes('saldo anterior')||lower.includes('saldo atual')||lower.includes('total')||lower.includes('data,')||lower.includes('descrição,')||lower.includes('descricao,'))return;
    const parts=line.includes(';')?line.split(';'):line.includes(',')?line.split(','):line.split(/\s{2,}|\t/);
    let date='', description='', amountText='';
    const dateMatch=line.match(/(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/);
    if(dateMatch)date=normalizeDate(dateMatch[1]);
    const moneyMatches=line.match(/-?\s?(?:R\$)?\s?\d{1,3}(?:\.\d{3})*,\d{2}|-?\s?(?:R\$)?\s?\d+\.\d{2}|-?\s?\d+,\d{2}/g);
    if(moneyMatches&&moneyMatches.length)amountText=moneyMatches[moneyMatches.length-1];
    if(parts.length>=3){
      if(!date)date=normalizeDate(parts[0]);
      amountText=amountText||parts[parts.length-1];
      description=parts.slice(1,parts.length-1).join(' ').trim();
    }else{
      description=line.replace(dateMatch?dateMatch[0]:'','').replace(amountText,'').replace(/R\$/g,'').trim();
    }
    const amount=parseMoney(amountText);
    if(!amount||!description||description.length<2)return;
    const type=amount>=0&&!isExpenseDescription(description)?'income':'expense';
    out.push({id:id(),approved:true,date:date||today(),month:(date||today()).slice(0,7),description:cleanDescription(description),amount:Math.abs(amount),type,category:guessCategory(description,type),source:'extrato'});
  });
  return out.slice(0,200);
}
function normalizeDate(value){
  const v=String(value||'').trim();
  let m=v.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if(m)return `${m[1]}-${String(m[2]).padStart(2,'0')}-${String(m[3]).padStart(2,'0')}`;
  m=v.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?$/);
  if(m){let year=m[3]||String(new Date().getFullYear());if(year.length===2)year='20'+year;return `${year}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;}
  return today();
}
function parseMoney(text){
  let s=String(text||'').replace(/R\$/gi,'').replace(/\s/g,'').trim();
  if(!s)return 0;
  const negative=/^-/.test(s)||/\(\s?\d/.test(s);
  s=s.replace(/[()]/g,'').replace(/^-/, '');
  if(s.includes(',')&&s.includes('.'))s=s.replace(/\./g,'').replace(',','.');
  else if(s.includes(','))s=s.replace(',','.');
  const n=Number(s.replace(/[^\d.]/g,''));
  return negative?-n:n;
}
function cleanDescription(desc){return String(desc||'').replace(/\s+/g,' ').replace(/[-–|]+$/,'').trim().slice(0,80);}
function isExpenseDescription(desc){
  const d=String(desc||'').toLowerCase();
  return /(compra|pagamento|pix enviado|débito|debito|tarifa|saque|boleto|mercado|farmacia|ifood|uber|99|posto|cartão|cartao|transferencia enviada|enviado)/.test(d);
}
function guessCategory(desc,type){
  const d=String(desc||'').toLowerCase();
  if(type==='income')return d.includes('sal')?'Salário':'Outros';
  if(/mercado|super|ifood|restaurante|lanche|padaria/.test(d))return 'Alimentação';
  if(/uber|99|ônibus|onibus|transporte|posto|combust/.test(d))return 'Transporte';
  if(/aluguel|energia|água|agua|internet|telefone|condominio|condomínio/.test(d))return 'Moradia';
  if(/farmacia|farmácia|hospital|consulta|saude|saúde/.test(d))return 'Saúde';
  if(/netflix|spotify|assinatura|prime|disney|youtube/.test(d))return 'Assinaturas';
  if(/cartao|cartão|fatura/.test(d))return 'Cartão';
  if(/curso|faculdade|escola|livro/.test(d))return 'Educação';
  return 'Outros';
}
function renderExtractReader(){
  const list=$('extractPreview'), summary=$('extractAiSummary');
  if(!list&&!summary)return;
  const draft=state.extractDraft||[];
  const approved=draft.filter(x=>x.approved);
  const income=approved.filter(x=>x.type==='income').reduce((s,x)=>s+x.amount,0);
  const expense=approved.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0);
  if(summary)summary.innerHTML=`<div class="professional-kpi"><div class="alert"><b>Detectados</b><p>${draft.length}</p></div><div class="alert"><b>Aprovados</b><p>${approved.length}</p></div><div class="alert"><b>Receitas</b><p>${brl(income)}</p></div><div class="alert"><b>Despesas</b><p>${brl(expense)}</p></div></div><div class="alert"><span class="ai-chip">IA local</span> Revise antes de importar. Extratos de bancos diferentes podem precisar de ajustes.</div>`;
  if(list)list.innerHTML=draft.map(item=>`<div class="extract-row">
    <div class="extract-grid">
      <input value="${escapeHtml(item.date)}" data-extract-field="date" data-id="${item.id}">
      <input value="${escapeHtml(item.description)}" data-extract-field="description" data-id="${item.id}">
      <input type="number" value="${item.amount}" data-extract-field="amount" data-id="${item.id}">
      <select data-extract-field="type" data-id="${item.id}"><option value="income"${item.type==='income'?' selected':''}>Receita</option><option value="expense"${item.type==='expense'?' selected':''}>Despesa</option></select>
      <select data-extract-field="category" data-id="${item.id}">${allCategories().map(c=>`<option${c===item.category?' selected':''}>${c}</option>`).join('')}</select>
      <button data-action="toggleExtract" data-id="${item.id}">${item.approved?'Aprovado':'Ignorado'}</button>
    </div>
    <button class="delete" data-action="deleteExtract" data-id="${item.id}">Remover</button>
  </div>`).join('')||'<p>Nenhum lançamento detectado.</p>';
  document.querySelectorAll('[data-extract-field]').forEach(el=>{
    el.onchange=()=>{const item=state.extractDraft.find(x=>x.id===el.dataset.id);if(!item)return;const field=el.dataset.extractField;item[field]=field==='amount'?Number(el.value||0):el.value;save();};
  });
}
function escapeHtml(value){return String(value||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function importExtractDraft(){
  const approved=(state.extractDraft||[]).filter(x=>x.approved);
  approved.forEach(x=>state.tx.push({id:id(),description:x.description,amount:Number(x.amount||0),type:x.type,category:x.category,due:'',recurring:false,month:(x.date||today()).slice(0,7),date:x.date||today(),source:'extrato'}));
  state.extractDraft=[];
  if($('extractPaste'))$('extractPaste').value='';
  save();
  alert(approved.length+' lançamento(s) importado(s).');
}
function renderMonthlySummary(){
  const m={};state.tx.forEach(t=>{m[t.month]=m[t.month]||{income:0,expense:0};t.type==='income'?m[t.month].income+=t.amount:m[t.month].expense+=t.amount;});
  $('monthlySummary').innerHTML=Object.keys(m).sort().reverse().map(k=>`<div class="row"><b>${k}</b><span>Receitas ${brl(m[k].income)} • Despesas ${brl(m[k].expense)}</span></div>`).join('')||'<p>Sem resumo.</p>';
}
function renderCloud(){$('cloudStatus').innerHTML='<div class="alert">Firebase: preparado/desligado</div><div class="alert">Banco atual: localStorage</div><div class="alert">GitHub Pages: compatível</div>';}

function exportCsv(){const rows=['Mes,Data,Tipo,Categoria,Descricao,Valor'];state.tx.forEach(t=>rows.push([t.month,t.date,t.type,t.category,'"'+t.description+'"',t.amount].join(',')));download('ramalho-finance-v18-4-ai-extract.csv',rows.join('\n'),'text/csv');}
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
  state.debts=[{id:id(),name:'Parcela antiga',total:600,paid:200}];state.subscriptions=[{id:id(),name:'Internet',value:99,category:'Assinaturas',due:10}];state.favorites=[{id:id(),name:'Mercado padrão',amount:80,type:'expense',category:'Alimentação'}];state.recentActions=[];state.safeNotes=[{id:id(),text:'Revisar orçamento no fim do mês',date:today()}];state.safeRoutine=[{id:id(),text:'Conferir cartão toda semana',done:false}];state.incomeSources=[{id:id(),name:'Salário estimado',value:1800,type:'Fixa'}];state.taxes=[{id:id(),name:'Tarifa bancária',value:12,due:''}];state.goalPro=[{id:id(),name:'Reserva de emergência',target:3000,saved:500,deadline:''}];state.safeGoals=[{id:id(),name:'Comprar notebook',value:5000}];state.safeWishlist=[{id:id(),name:'Setup gamer',value:3000,saved:450}];state.safeHabits=[{id:id(),name:'Evitar compra por impulso',done:false}];
}

try{render();}catch(err){console.error(err);alert('Erro ao iniciar: '+err.message);}
if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister()));}
})();