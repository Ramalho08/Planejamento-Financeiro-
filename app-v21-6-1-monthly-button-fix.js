(function(){
'use strict';

const KEY='rf_v21_6_1_monthly_close_button_fix';
const categoriesBase=['Alimentação','Transporte','Moradia','Educação','Saúde','Lazer','Cartão','Investimentos','Pix','Assinaturas','Salário','Outros'];
const defaultState={tx:[],wallets:[],cards:[],budgets:[],goals:[],investments:[],plan:[],assets:[],debts:[],subscriptions:[],favorites:[],recentActions:[],safeNotes:[],safeRoutine:[],incomeSources:[],taxes:[],goalPro:[],safeGoals:[],safeWishlist:[],safeHabits:[],customCategories:[],extractDraft:[],categoryLearning:{},lastImportSummary:null,profileName:'Guilherme',theme:'dark',sortTx:false};

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
on('approveAllSafeBtn','click',()=>{(state.extractDraft||[]).forEach(x=>{x.approved=x.status==='safe';});save();});
on('ignoreAllExtractBtn','click',()=>{(state.extractDraft||[]).forEach(x=>x.approved=false);save();});
on('approveReviewedBtn','click',()=>{(state.extractDraft||[]).forEach(x=>{if(x.status!=='danger'&&x.status!=='duplicate')x.approved=true;});save();});




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
on('backupBtn','click',()=>download('ramalho-finance-v21-6-1-monthly-close-button-fix-backup.json',JSON.stringify(state,null,2),'application/json'));
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
  renderProfessionalAI(t,score,saving,cardPct); renderSmartForecast(t); renderAIProfessionalPage(t,score,saving,cardPct); renderTransactions(); renderWallets(); renderCards(); renderCardElite(); renderBudgets(); renderSubscriptions(); renderIncomeSources(); renderTaxes(); renderFutureBills(); renderGoals(); renderGoalPro(); renderInvestments(); renderPlanning(); renderAssetsDebts(); renderAnalytics(); renderFavorites(); renderRecentActions(); renderSafeTools(); renderSafeLife(); renderRestorePanel(t,score); renderCoachPlan(t,score); renderExportSummary(); renderGlobalSearch(); renderExtractReader(); renderMonthlySummary(); renderCloud();rf2151AfterRender();rf213BindMenu();rf213StableAI();renderStablePlus();initStablePlusButtons();rebindNavigationButtons();initSafeCloudButtons();rebindNavigationButtons();
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
async function handleExtractFile(e){
  const file=e.target.files&&e.target.files[0];
  if(!file)return;
  const isPdf=file.type==='application/pdf' || /\.pdf$/i.test(file.name||'');
  try{
    if(isPdf){
      const text=await readPdfText(file);
      if($('extractPaste'))$('extractPaste').value=text || 'Não consegui extrair texto deste PDF. Se ele for escaneado, copie o texto manualmente ou use uma versão CSV/TXT.';
      analyzeExtractInput();
    }else{
      const reader=new FileReader();
      reader.onload=()=>{if($('extractPaste'))$('extractPaste').value=String(reader.result||''); analyzeExtractInput();};
      reader.readAsText(file);
    }
  }catch(err){
    console.error(err);
    alert('Não consegui ler o arquivo. Tente copiar o texto do extrato e colar no campo.');
  }
}
async function readPdfText(file){
  if(!window.pdfjsLib){
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    if(window.pdfjsLib)window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
  if(!window.pdfjsLib)return '';
  const data=await file.arrayBuffer();
  const pdf=await window.pdfjsLib.getDocument({data}).promise;
  let text='';
  for(let pageNum=1;pageNum<=pdf.numPages;pageNum++){
    const page=await pdf.getPage(pageNum);
    const content=await page.getTextContent();
    text+=content.items.map(item=>item.str).join(' ')+'\n';
  }
  return text;
}
function loadScript(src){
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);
  });
}
function analyzeExtractInput(){
  const raw=($('extractPaste')&&$('extractPaste').value)||'';
  state.extractDraft=parseExtractTextV19(raw);
  state.lastImportSummary=buildImportSummary(state.extractDraft);
  save();
}
function parseExtractTextV19(raw){
  const normalized=String(raw||'')
    .replace(/\u00a0/g,' ')
    .replace(/[ ]{3,}/g,'  ')
    .replace(/(\d{2}\/\d{2}\/\d{4})/g,'\n$1')
    .replace(/(\d{2}\/\d{2})(?=\s)/g,'\n$1');
  const lines=normalized.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const out=[];
  lines.forEach(line=>{
    if(isIgnoredExtractLine(line))return;
    const groups=splitPossibleMultiTransactions(line);
    groups.forEach(g=>{
      const parsed=parseExtractLineV19(g);
      if(parsed)out.push(parsed);
    });
  });
  return dedupeDraft(out).slice(0,350);
}
function splitPossibleMultiTransactions(line){
  // Alguns PDFs vêm com tudo em uma linha. Quebra onde aparece nova data.
  const pieces=String(line).split(/(?=\b\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?\b)/).map(x=>x.trim()).filter(Boolean);
  return pieces.length>1?pieces:[line];
}
function parseExtractLineV19(line){
  const cols=splitExtractLine(line);
  const dateMatch=line.match(/(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/);
  const date=dateMatch?normalizeDate(dateMatch[1]):today();
  const money=findBestMoneyV19(line,cols);
  if(!money || !money.value)return null;

  let description=extractDescriptionV19(line,cols,money,dateMatch);
  description=cleanDescription(description);
  if(!description || description.length<2)return null;

  const type=detectExtractType(line,description,money.value);
  const learned=learnedCategoryFor(description);
  const category=learned || guessCategory(description,type);
  const amount=Math.abs(money.value);
  let confidence=88;
  if(money.ambiguous)confidence-=20;
  if(amount>1000000)confidence-=50;
  else if(amount>100000)confidence-=30;
  if(!dateMatch)confidence-=10;
  if(!learned && category==='Outros')confidence-=7;
  if(description.length<5)confidence-=10;

  return {
    id:id(),approved:confidence>=35,date,month:date.slice(0,7),
    description,amount,type,category,source:'extrato',
    confidence:Math.max(5,Math.min(99,confidence)),raw:line,
    duplicate:isPotentialDuplicate({date,description,amount,type})
  };
}
function findBestMoneyV19(line,cols){
  const candidates=[];
  cols.forEach((col,i)=>{
    const value=parseMoneyStrictV19(col);
    if(value!==null)candidates.push({raw:String(col).trim(),value,colIndex:i,score:scoreMoneyCandidateV19(String(col),i,cols.length)});
  });
  const regex=/(?:^|[\s;,\t])([DCdc+-]?\s*(?:R\$)?\s*\(?-?\d{1,3}(?:\.\d{3})*,\d{2}\)?|[DCdc+-]?\s*(?:R\$)?\s*\(?-?\d+\.\d{2}\)?|[DCdc+-]?\s*(?:R\$)?\s*\(?-?\d+,\d{2}\)?)(?=$|[\s;,\t])/g;
  let m;
  while((m=regex.exec(line))!==null){
    const raw=m[1].trim();
    const value=parseMoneyStrictV19(raw);
    if(value!==null)candidates.push({raw,value,colIndex:-1,score:scoreMoneyCandidateV19(raw,99,100)});
  }
  if(!candidates.length)return null;
  candidates.sort((a,b)=>b.score-a.score);
  const best=candidates[0];
  best.ambiguous=candidates.length>1 && Math.abs((candidates[0].score||0)-(candidates[1].score||0))<8;
  return best;
}
function parseMoneyStrictV19(text){
  let raw=String(text||'').trim();
  if(!raw)return null;
  const negative=/^\s*-/.test(raw)||/\(\s*-?\s*(?:R\$)?\s*\d/.test(raw)||/(^|\s)(d|debito|débito|saida|saída)\b/i.test(raw);
  raw=raw.replace(/\b(D|C|DEBITO|DÉBITO|CREDITO|CRÉDITO|SAIDA|SAÍDA|ENTRADA)\b/ig,'');
  raw=raw.replace(/R\$/ig,'').replace(/\s/g,'').replace(/[()]/g,'').replace(/^\+/,'');
  let neg=negative;
  if(raw.startsWith('-')){neg=true;raw=raw.slice(1);}
  if(!/^\d+([,.]\d{2})?$|^\d{1,3}(\.\d{3})+,\d{2}$/.test(raw))return null;
  let normalized=raw;
  if(raw.includes(',')&&raw.includes('.'))normalized=raw.replace(/\./g,'').replace(',','.');
  else if(raw.includes(','))normalized=raw.replace(',','.');
  else if(raw.includes('.')){
    const parts=raw.split('.');
    if(parts[parts.length-1].length!==2)return null;
  }
  const n=Number(normalized.replace(/[^\d.]/g,''));
  if(!Number.isFinite(n))return null;
  return neg?-n:n;
}
function scoreMoneyCandidateV19(raw,index,total){
  let score=0; const s=String(raw||'');
  if(/\d+[,.]\d{2}/.test(s))score+=45;
  if(/R\$/i.test(s))score+=12;
  if(/^[\s+-]*[DCdc]/.test(s))score+=8;
  if(index===total-1)score+=10;
  if(index===total-2)score+=6;
  if(/\d{1,2}[\/\-]\d{1,2}/.test(s))score-=45;
  const abs=Math.abs(parseMoneyStrictV19(s)||0);
  if(abs>0&&abs<100000)score+=10;
  if(abs>1000000)score-=45;
  return score;
}
function extractDescriptionV19(line,cols,money,dateMatch){
  let description='';
  if(cols.length>=3){
    description=cols.filter((c,i)=>i!==money.colIndex && !looksLikeDate(c) && !isValueMarker(c) && parseMoneyStrictV19(c)===null).join(' ').trim();
  }
  if(!description){
    description=line;
    if(dateMatch)description=description.replace(dateMatch[0],'');
    if(money.raw)description=description.replace(money.raw,'');
    description=description.replace(/\b(D|C|DEBITO|DÉBITO|CREDITO|CRÉDITO|SAIDA|SAÍDA|ENTRADA)\b/ig,'');
  }
  return description;
}
function learnedCategoryFor(description){
  const learn=state.categoryLearning||{};
  const d=String(description||'').toLowerCase();
  let best='';
  Object.keys(learn).forEach(k=>{if(k && d.includes(k) && (!best || k.length>best.length))best=k;});
  return best?learn[best]:'';
}
function saveCategoryLearning(description,category){
  state.categoryLearning=state.categoryLearning||{};
  const key=String(description||'').toLowerCase().replace(/[^a-z0-9áàâãéêíóôõúç ]/gi,'').split(/\s+/).filter(w=>w.length>=4).slice(0,3).join(' ');
  if(key&&category)state.categoryLearning[key]=category;
}
function isPotentialDuplicate(item){
  return state.tx.some(t=>t.date===item.date && Math.abs(Number(t.amount)-Number(item.amount))<0.01 && t.type===item.type && String(t.description||'').toLowerCase().slice(0,12)===String(item.description||'').toLowerCase().slice(0,12));
}
function dedupeDraft(list){
  const seen=new Set();
  return list.filter(x=>{
    const key=[x.date,x.type,x.amount,String(x.description).toLowerCase().slice(0,20)].join('|');
    if(seen.has(key))return false;
    seen.add(key);
    return true;
  });
}
function buildImportSummary(draft){
  const approved=draft.filter(x=>x.approved&&!x.duplicate);
  const income=approved.filter(x=>x.type==='income').reduce((s,x)=>s+x.amount,0);
  const expense=approved.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0);
  const low=draft.filter(x=>(x.confidence||0)<60).length;
  const dup=draft.filter(x=>x.duplicate).length;
  return {detected:draft.length,approved:approved.length,income,expense,low,dup};
}
function renderExtractReader(){
  const list=$('extractPreview'), summary=$('extractAiSummary'), learning=$('learningBox');
  if(!list&&!summary&&!learning)return;
  const draft=state.extractDraft||[];
  const s=buildImportSummary(draft);
  if(summary){
    const cls=s.low||s.dup?'ai-import-warn':'ai-import-ok';
    summary.innerHTML=`<div class="professional-kpi"><div class="alert"><b>Detectados</b><p>${s.detected}</p></div><div class="alert"><b>Aprovados</b><p>${s.approved}</p></div><div class="alert"><b>Receitas</b><p>${brl(s.income)}</p></div><div class="alert"><b>Despesas</b><p>${brl(s.expense)}</p></div></div><div class="alert ${cls}"><span class="import-status">IA V19</span> ${s.dup? s.dup+' possível(eis) duplicado(s). ':''}${s.low? s.low+' item(ns) com baixa confiança. ':''}Revise antes de importar.</div>`;
  }
  if(learning){
    const keys=Object.keys(state.categoryLearning||{});
    learning.innerHTML=keys.length?keys.map(k=>`<span class="learning-pill">${k} → ${state.categoryLearning[k]}</span>`).join(''):'<p>Nenhum aprendizado local ainda.</p>';
  }
  if(list)list.innerHTML=draft.map(item=>`<div class="extract-row ${item.duplicate?'ai-import-danger':(item.confidence<60?'ai-import-warn':'')}">
    <div class="extract-grid-v19">
      <input value="${escapeHtml(item.date)}" data-extract-field="date" data-id="${item.id}">
      <input value="${escapeHtml(item.description)}" data-extract-field="description" data-id="${item.id}">
      <input type="number" value="${item.amount}" data-extract-field="amount" data-id="${item.id}">
      <select data-extract-field="type" data-id="${item.id}"><option value="income"${item.type==='income'?' selected':''}>Receita</option><option value="expense"${item.type==='expense'?' selected':''}>Despesa</option></select>
      <select data-extract-field="category" data-id="${item.id}">${allCategories().map(c=>`<option${c===item.category?' selected':''}>${c}</option>`).join('')}</select>
      <button data-action="toggleExtract" data-id="${item.id}">${item.approved?'Aprovado':'Ignorado'}</button>
    </div>
    <div class="extract-tools">
      <span class="extract-tag">Confiança: ${item.confidence||70}%</span>
      ${item.duplicate?'<span class="extract-tag">Possível duplicado</span>':''}
      <button class="delete" data-action="deleteExtract" data-id="${item.id}">Remover</button>
    </div>
  </div>`).join('')||'<p>Nenhum lançamento detectado.</p>';
  document.querySelectorAll('[data-extract-field]').forEach(el=>{
    el.onchange=()=>{
      const item=state.extractDraft.find(x=>x.id===el.dataset.id);
      if(!item)return;
      const field=el.dataset.extractField;
      item[field]=field==='amount'?Number(el.value||0):el.value;
      if(field==='category')saveCategoryLearning(item.description,item.category);
      save();
    };
  });
}
function importExtractDraft(){
  const approved=(state.extractDraft||[]).filter(x=>x.approved&&!x.duplicate);
  approved.forEach(x=>{
    saveCategoryLearning(x.description,x.category);
    state.tx.push({id:id(),description:x.description,amount:Number(x.amount||0),type:x.type,category:x.category,due:'',recurring:false,month:(x.date||today()).slice(0,7),date:x.date||today(),source:'extrato'});
  });
  state.lastImportSummary=buildImportSummary(state.extractDraft||[]);
  state.extractDraft=[];
  if($('extractPaste'))$('extractPaste').value='';
  save();
  alert(approved.length+' lançamento(s) importado(s).');
}
function normalizeDate(value){
  const v=String(value||'').trim();
  let m=v.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if(m)return `${m[1]}-${String(m[2]).padStart(2,'0')}-${String(m[3]).padStart(2,'0')}`;
  m=v.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?$/);
  if(m){let year=m[3]||String(new Date().getFullYear());if(year.length===2)year='20'+year;return `${year}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;}
  return today();
}
function isIgnoredExtractLine(line){
  const lower=String(line||'').toLowerCase();
  return !lower||lower.includes('saldo anterior')||lower.includes('saldo atual')||lower.includes('saldo disponível')||lower.includes('saldo disponivel')||lower.includes('limite disponível')||lower.includes('limite disponivel')||/^data[;,]/i.test(lower)||lower.includes('descrição,')||lower.includes('descricao,')||lower.includes('lançamento,')||lower.includes('lancamento,');
}
function splitExtractLine(line){
  if(line.includes(';'))return line.split(';').map(x=>x.trim());
  if(line.includes('\t'))return line.split('\t').map(x=>x.trim());
  const comma=line.split(',').map(x=>x.trim());
  if(comma.length>=4)return comma;
  return line.split(/\s{2,}/).map(x=>x.trim()).filter(Boolean);
}
function detectExtractType(line,description,value){
  const text=(line+' '+description).toLowerCase();
  if(value<0)return 'expense';
  if(/\b(d|debito|débito|saida|saída)\b/.test(text))return 'expense';
  if(/\b(c|credito|crédito|entrada)\b/.test(text))return 'income';
  if(isExpenseDescription(description))return 'expense';
  if(/sal[aá]rio|pix recebido|recebido|dep[oó]sito|deposito|cr[eé]dito/.test(text))return 'income';
  return 'expense';
}
function looksLikeDate(value){return /(\d{1,2}[\/\-]\d{1,2}|\d{4}[\/\-]\d{1,2})/.test(String(value||''));}
function isValueMarker(value){return /^\s*(D|C|DEBITO|DÉBITO|CREDITO|CRÉDITO|SAIDA|SAÍDA|ENTRADA)\s*$/i.test(String(value||''));}
function parseMoney(text){const n=parseMoneyStrictV19(text);return n===null?0:n;}
function cleanDescription(desc){return String(desc||'').replace(/\s+/g,' ').replace(/[";]/g,' ').replace(/[-–|]+$/,'').trim().slice(0,90);}
function isExpenseDescription(desc){
  const d=String(desc||'').toLowerCase();
  return /(compra|pagamento|pix enviado|débito|debito|tarifa|saque|boleto|mercado|farmacia|farmácia|ifood|uber|99|posto|cartão|cartao|transferencia enviada|transferência enviada|enviado)/.test(d);
}
function guessCategory(desc,type){
  const d=String(desc||'').toLowerCase();
  if(type==='income')return d.includes('sal')?'Salário':'Outros';
  if(/mercado|super|ifood|restaurante|lanche|padaria|acougue|açougue/.test(d))return 'Alimentação';
  if(/uber|99|ônibus|onibus|transporte|posto|combust|gasolina/.test(d))return 'Transporte';
  if(/aluguel|energia|luz|água|agua|internet|telefone|condominio|condomínio/.test(d))return 'Moradia';
  if(/farmacia|farmácia|hospital|consulta|saude|saúde/.test(d))return 'Saúde';
  if(/netflix|spotify|assinatura|prime|disney|youtube/.test(d))return 'Assinaturas';
  if(/cartao|cartão|fatura/.test(d))return 'Cartão';
  if(/curso|faculdade|escola|livro/.test(d))return 'Educação';
  return 'Outros';
}
function escapeHtml(value){return String(value||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function renderMonthlySummary(){
  const m={};state.tx.forEach(t=>{m[t.month]=m[t.month]||{income:0,expense:0};t.type==='income'?m[t.month].income+=t.amount:m[t.month].expense+=t.amount;});
  $('monthlySummary').innerHTML=Object.keys(m).sort().reverse().map(k=>`<div class="row"><b>${k}</b><span>Receitas ${brl(m[k].income)} • Despesas ${brl(m[k].expense)}</span></div>`).join('')||'<p>Sem resumo.</p>';
}
function renderCloud(){
  const el=$('cloudStatus');
  if(el)el.innerHTML='<div class="alert safe-cloud-ok">Modo local: funcionando</div><div class="alert safe-cloud-warn">Firebase: opcional e isolado</div><div class="alert">A navegação não depende do Cloud AI.</div>';
  safeCloudStatus();
}

function safeCloudStatus(){
  const box=$('firebaseSafeStatus');
  if(!box)return;
  const cfg=window.RF_FIREBASE_CONFIG||{};
  const ready=cfg.apiKey && !String(cfg.apiKey).includes('COLE_AQUI') && cfg.projectId && !String(cfg.projectId).includes('SEU_PROJETO');
  box.innerHTML=ready?'<div class="alert safe-cloud-ok">firebase-config.js parece configurado.</div>':'<div class="alert safe-cloud-warn">Firebase ainda não configurado. Edite firebase-config.js.</div>';
}

function initSafeCloudButtons(){
  const check=$('safeFirebaseCheckBtn');
  if(check&&!check.dataset.ready){check.dataset.ready='1';check.addEventListener('click',safeCloudStatus);}
  const login=$('googleLoginBtn');
  if(login&&!login.dataset.ready){login.dataset.ready='1';login.addEventListener('click',function(){alert('Firebase está isolado nesta versão para proteger as abas. Próxima versão ativa login real após configurar firebase-config.js.');});}
  const logout=$('googleLogoutBtn');
  if(logout&&!logout.dataset.ready){logout.dataset.ready='1';logout.addEventListener('click',function(){alert('Login ainda não ativo nesta versão Safe.');});}
  const send=$('sendCloudAiBtn');
  if(send&&!send.dataset.ready){send.dataset.ready='1';send.addEventListener('click',function(){const box=$('cloudAiResult');if(box)box.innerHTML='<div class="alert safe-cloud-warn">Cloud AI preparada, mas isolada para não quebrar o app. Configure o Firebase e depois ativamos a integração real.</div>';});}
}

function exportCsv(){const rows=['Mes,Data,Tipo,Categoria,Descricao,Valor'];state.tx.forEach(t=>rows.push([t.month,t.date,t.type,t.category,'"'+t.description+'"',t.amount].join(',')));download('ramalho-finance-v21-6-1-monthly-close-button-fix.csv',rows.join('\n'),'text/csv');}
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


// V19.1 SAFE WIZARD OVERRIDES
function analyzeExtractInput(){
  const raw=($('extractPaste')&&$('extractPaste').value)||'';
  const cfg={valueMode:($('extractValueMode')&&$('extractValueMode').value)||'br',review:!!($('extractRequireReview')&&$('extractRequireReview').checked)};
  state.extractDraft=parseWizardSafe(raw,cfg);
  save();
}
function parseWizardSafe(raw,cfg){
  const lines=String(raw||'').replace(/\u00a0/g,' ').replace(/(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/g,'\n$1').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const arr=[];
  lines.forEach(line=>{
    if(isIgnoredExtractLine(line))return;
    const parsed=parseWizardLineSafe(line,cfg);
    if(parsed)arr.push(parsed);
  });
  return dedupeDraft(arr).slice(0,350);
}
function parseWizardLineSafe(line,cfg){
  const cols=line.includes(';')?line.split(';').map(x=>x.trim()):line.includes('\t')?line.split('\t').map(x=>x.trim()):line.split(/\s{2,}/).map(x=>x.trim()).filter(Boolean);
  const dm=line.match(/(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/);
  const date=dm?normalizeDate(dm[1]):today();
  const money=findWizardMoney(line,cols,cfg.valueMode);
  if(!money)return null;
  let desc=cols.length>=3?cols.filter((c,i)=>i!==money.index&&!looksLikeDate(c)&&parseWizardMoney(c,cfg.valueMode)===null&&!isValueMarker(c)).join(' '):'';
  if(!desc){desc=line.replace(dm?dm[0]:'','').replace(money.raw,'').replace(/\b(D|C|DEBITO|DÉBITO|CREDITO|CRÉDITO|SAIDA|SAÍDA|ENTRADA)\b/ig,'');}
  desc=cleanDescription(desc);
  if(!desc||desc.length<2)return null;
  const type=detectExtractType(line,desc,money.value);
  const amount=Math.abs(money.value);
  const duplicate=isPotentialDuplicate({date,description:desc,amount,type});
  const suspicious=duplicate||(cfg.review&&amount>1000)||amount>50000||desc.length<4||money.weak;
  const category=learnedCategoryFor(desc)||guessCategory(desc,type);
  const confidence=Math.max(5,Math.min(99,90-(suspicious?25:0)-(duplicate?25:0)-(amount>1000?8:0)-(category==='Outros'?5:0)));
  return {id:id(),approved:!suspicious,date,month:date.slice(0,7),description:desc,amount,type,category,source:'extrato',confidence,duplicate,suspicious,reason:suspicious?wizardReason({duplicate,amount,weak:money.weak,cfg,desc}):'ok',raw:line};
}
function findWizardMoney(line,cols,mode){
  const cand=[];
  cols.forEach((c,i)=>{const v=parseWizardMoney(c,mode);if(v!==null)cand.push({raw:c,value:v,index:i,score:scoreW(c,i,cols.length,mode)});});
  if(!cand.length){
    const ms=line.match(/-?\s?(?:R\$)?\s?\(?\d{1,3}(?:\.\d{3})*,\d{2}\)?|-?\s?(?:R\$)?\s?\(?\d+\.\d{2}\)?|-?\s?\d+,\d{2}/g)||[];
    ms.forEach(m=>{const v=parseWizardMoney(m,mode);if(v!==null)cand.push({raw:m,value:v,index:-1,score:scoreW(m,99,100,mode)-10,weak:true});});
  }
  if(!cand.length)return null;
  cand.sort((a,b)=>b.score-a.score);
  return cand[0];
}
function parseWizardMoney(text,mode){
  let raw=String(text||'').trim();
  if(!raw)return null;
  const neg=/^\s*-/.test(raw)||/\(\s*-?\s*(?:R\$)?\s*\d/.test(raw)||/(^|\s)(d|debito|débito|saida|saída)\b/i.test(raw);
  raw=raw.replace(/\b(D|C|DEBITO|DÉBITO|CREDITO|CRÉDITO|SAIDA|SAÍDA|ENTRADA)\b/ig,'').replace(/R\$/ig,'').replace(/\s/g,'').replace(/[()]/g,'').replace(/^\+/,'');
  let negative=neg;if(raw.startsWith('-')){negative=true;raw=raw.slice(1);}
  let norm='';
  if(mode==='br'){
    if(!/^\d+,\d{2}$|^\d{1,3}(\.\d{3})+,\d{2}$/.test(raw))return null;
    norm=raw.replace(/\./g,'').replace(',','.');
  }else if(mode==='us'){
    if(!/^\d+\.\d{2}$|^\d{1,3}(,\d{3})+\.\d{2}$/.test(raw))return null;
    norm=raw.replace(/,/g,'');
  }else{
    if(raw.includes(',')&&raw.includes('.'))norm=raw.lastIndexOf(',')>raw.lastIndexOf('.')?raw.replace(/\./g,'').replace(',','.'):raw.replace(/,/g,'');
    else if(raw.includes(','))norm=raw.replace(',','.');
    else if(raw.includes('.'))norm=raw;
    else return null;
  }
  const n=Number(norm.replace(/[^\d.]/g,'')); if(!Number.isFinite(n))return null;
  return negative?-n:n;
}
function scoreW(raw,index,total,mode){
  let s=0; const txt=String(raw||''); if(/[,.]\d{2}/.test(txt))s+=40;if(/R\$/i.test(txt))s+=12;if(index===total-1)s+=12;if(index===total-2)s+=6;if(looksLikeDate(txt))s-=60;
  const v=Math.abs(parseWizardMoney(txt,mode)||0); if(v>0&&v<10000)s+=15;if(v>100000)s-=35; return s;
}
function wizardReason(o){const r=[];if(o.duplicate)r.push('duplicado');if(o.cfg.review&&o.amount>1000)r.push('valor alto');if(o.amount>50000)r.push('valor muito alto');if(o.weak)r.push('valor fora de coluna clara');if((o.desc||'').length<4)r.push('descrição curta');return r.join(', ')||'revisar';}
function renderExtractReader(){
  const list=$('extractPreview'), summary=$('extractAiSummary'), learning=$('learningBox'); if(!list&&!summary&&!learning)return;
  const draft=state.extractDraft||[]; const approved=draft.filter(x=>x.approved&&!x.duplicate&&!x.suspicious);
  const income=approved.filter(x=>x.type==='income').reduce((s,x)=>s+x.amount,0); const expense=approved.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0);
  const sus=draft.filter(x=>x.suspicious).length, dup=draft.filter(x=>x.duplicate).length;
  if(summary)summary.innerHTML=`<div class="professional-kpi"><div class="alert"><b>Detectados</b><p>${draft.length}</p></div><div class="alert"><b>Aprovados</b><p>${approved.length}</p></div><div class="alert"><b>Receitas</b><p>${brl(income)}</p></div><div class="alert"><b>Despesas</b><p>${brl(expense)}</p></div></div><div class="alert ${sus||dup?'ai-import-warn':'ai-import-ok'}"><span class="import-status">Wizard seguro</span> ${sus} suspeito(s), ${dup} duplicado(s). Suspeitos não entram automaticamente.</div>`;
  if(learning){const keys=Object.keys(state.categoryLearning||{});learning.innerHTML=keys.length?keys.map(k=>`<span class="learning-pill">${k} → ${state.categoryLearning[k]}</span>`).join(''):'<p>Nenhum aprendizado local ainda.</p>';}
  if(list)list.innerHTML=draft.map(item=>`<div class="extract-row ${item.suspicious?'wizard-suspicious':'wizard-safe'}"><div class="extract-grid-v19"><input value="${escapeHtml(item.date)}" data-extract-field="date" data-id="${item.id}"><input value="${escapeHtml(item.description)}" data-extract-field="description" data-id="${item.id}"><input type="number" value="${item.amount}" data-extract-field="amount" data-id="${item.id}"><select data-extract-field="type" data-id="${item.id}"><option value="income"${item.type==='income'?' selected':''}>Receita</option><option value="expense"${item.type==='expense'?' selected':''}>Despesa</option></select><select data-extract-field="category" data-id="${item.id}">${allCategories().map(c=>`<option${c===item.category?' selected':''}>${c}</option>`).join('')}</select><button data-action="toggleExtract" data-id="${item.id}">${item.approved?'Aprovado':'Ignorado'}</button></div><div class="extract-tools"><span class="wizard-tag">Confiança: ${item.confidence||70}%</span>${item.suspicious?`<span class="wizard-tag">Revisar: ${item.reason}</span>`:''}<button class="delete" data-action="deleteExtract" data-id="${item.id}">Remover</button></div></div>`).join('')||'<p>Nenhum lançamento detectado.</p>';
  document.querySelectorAll('[data-extract-field]').forEach(el=>{el.onchange=()=>{const item=state.extractDraft.find(x=>x.id===el.dataset.id);if(!item)return;const f=el.dataset.extractField;item[f]=f==='amount'?Number(el.value||0):el.value;if(f==='category')saveCategoryLearning(item.description,item.category);item.suspicious=false;item.reason='revisado manualmente';save();};});
}
function importExtractDraft(){
  const approved=(state.extractDraft||[]).filter(x=>x.approved&&!x.duplicate&&!x.suspicious);
  approved.forEach(x=>{saveCategoryLearning(x.description,x.category);state.tx.push({id:id(),description:x.description,amount:Number(x.amount||0),type:x.type,category:x.category,due:'',recurring:false,month:(x.date||today()).slice(0,7),date:x.date||today(),source:'extrato'});});
  state.extractDraft=[]; if($('extractPaste'))$('extractPaste').value=''; save(); alert(approved.length+' lançamento(s) importado(s). Suspeitos/duplicados foram ignorados.');
}


// V20 PROFESSIONAL AI ENGINE OVERRIDES
function analyzeExtractInput(){
  const raw=($('extractPaste')&&$('extractPaste').value)||'';
  const cfg={
    bankProfile:($('aiBankProfile')&&$('aiBankProfile').value)||'auto',
    valueProfile:($('aiValueProfile')&&$('aiValueProfile').value)||'br',
    strictness:($('aiImportStrictness')&&$('aiImportStrictness').value)||'safe'
  };
  const result=AI20_analyze(raw,cfg);
  state.extractDraft=result.items;
  state.lastImportSummary=result.summary;
  save();
}
function AI20_analyze(raw,cfg){
  const text=String(raw||'').replace(/\u00a0/g,' ').replace(/[ ]{4,}/g,'  ').replace(/(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/g,'\n$1');
  const bank=cfg.bankProfile==='auto'?AI20_detectBank(text):cfg.bankProfile;
  const lines=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).filter(x=>!AI20_ignoreLine(x));
  const items=[];
  lines.forEach(line=>{
    const parsed=AI20_parseLine(line,{...cfg,bank});
    if(parsed)items.push(parsed);
  });
  const clean=AI20_dedupe(items).slice(0,500);
  return {items:clean,summary:AI20_summary(clean,bank,cfg)};
}
function AI20_detectBank(text){
  const l=String(text||'').toLowerCase();
  if(/nubank|nu pagamentos|nuconta|roxinho/.test(l))return 'nubank';
  if(/banco inter|intermedium/.test(l))return 'inter';
  if(/ita[uú]|unibanco/.test(l))return 'itau';
  if(/santander/.test(l))return 'santander';
  if(/bradesco/.test(l))return 'bradesco';
  if(/banco do brasil|bb s\/a/.test(l))return 'bb';
  if(/caixa econ[oô]mica|caixa economica|cef/.test(l))return 'caixa';
  return 'generic';
}
function AI20_ignoreLine(line){
  const l=String(line||'').toLowerCase();
  return !l||l.includes('saldo anterior')||l.includes('saldo atual')||l.includes('saldo disponível')||l.includes('saldo disponivel')||l.includes('limite disponível')||l.includes('limite disponivel')||l.includes('agência')||l.includes('agencia')||l.includes('titular')||l.includes('cpf')||/^data[;, ]/i.test(l)||l.includes('descrição,')||l.includes('descricao,')||l.includes('lançamento,')||l.includes('lancamento,');
}
function AI20_split(line){
  if(line.includes(';'))return line.split(';').map(x=>x.trim()).filter(Boolean);
  if(line.includes('\t'))return line.split('\t').map(x=>x.trim()).filter(Boolean);
  return line.split(/\s{2,}/).map(x=>x.trim()).filter(Boolean);
}
function AI20_parseLine(line,cfg){
  const cols=AI20_split(line);
  const date=AI20_date(line,cols);
  const money=AI20_money(line,cols,cfg.valueProfile);
  if(!money)return null;
  const description=AI20_description(line,cols,money);
  if(!description||description.length<2)return null;
  const type=AI20_type(line,description,money.value);
  const amount=Math.abs(money.value);
  const category=learnedCategoryFor(description)||guessCategory(description,type);
  const duplicate=AI20_duplicate({date,description,amount,type});
  const status=AI20_status({amount,description,money,duplicate,cfg,category});
  const confidence=AI20_confidence({amount,money,duplicate,status,category});
  return {id:id(),approved:status==='safe',date,month:date.slice(0,7),description,amount,type,category,source:'extrato',confidence,duplicate,status,reason:AI20_reason({amount,description,money,duplicate,status,cfg,category}),bank:cfg.bank,raw:line};
}
function AI20_date(line,cols){
  for(const c of cols){const m=String(c).match(/(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/);if(m)return normalizeDate(m[1]);}
  const m=String(line).match(/(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/);
  return m?normalizeDate(m[1]):today();
}
function AI20_money(line,cols,mode){
  const cand=[];
  cols.forEach((col,i)=>{const v=AI20_parseMoney(col,mode);if(v!==null)cand.push({raw:String(col).trim(),value:v,index:i,score:AI20_scoreMoney(col,i,cols.length,mode),weak:false});});
  if(!cand.length){
    const matches=String(line).match(/-?\s?(?:R\$)?\s?\(?\d{1,3}(?:\.\d{3})*,\d{2}\)?|-?\s?(?:R\$)?\s?\(?\d+\.\d{2}\)?|-?\s?\d+,\d{2}/g)||[];
    matches.forEach(m=>{const v=AI20_parseMoney(m,mode);if(v!==null)cand.push({raw:m.trim(),value:v,index:-1,score:AI20_scoreMoney(m,99,100,mode)-12,weak:true});});
  }
  if(!cand.length)return null;
  cand.sort((a,b)=>b.score-a.score);
  cand[0].ambiguous=cand[1]&&Math.abs(cand[0].score-cand[1].score)<7;
  return cand[0];
}
function AI20_parseMoney(text,mode){
  let raw=String(text||'').trim();
  if(!raw)return null;
  const negative=/^\s*-/.test(raw)||/\(\s*-?\s*(?:R\$)?\s*\d/.test(raw)||/(^|\s)(d|debito|débito|saida|saída)\b/i.test(raw);
  raw=raw.replace(/\b(D|C|DEBITO|DÉBITO|CREDITO|CRÉDITO|SAIDA|SAÍDA|ENTRADA)\b/ig,'').replace(/R\$/ig,'').replace(/\s/g,'').replace(/[()]/g,'').replace(/^\+/,'');
  let neg=negative;if(raw.startsWith('-')){neg=true;raw=raw.slice(1);}
  let norm='';
  if(mode==='br'){if(!/^\d+,\d{2}$|^\d{1,3}(\.\d{3})+,\d{2}$/.test(raw))return null;norm=raw.replace(/\./g,'').replace(',','.');}
  else if(mode==='us'){if(!/^\d+\.\d{2}$|^\d{1,3}(,\d{3})+\.\d{2}$/.test(raw))return null;norm=raw.replace(/,/g,'');}
  else{if(raw.includes(',')&&raw.includes('.'))norm=raw.lastIndexOf(',')>raw.lastIndexOf('.')?raw.replace(/\./g,'').replace(',','.'):raw.replace(/,/g,'');else if(raw.includes(','))norm=raw.replace(',','.');else if(raw.includes('.'))norm=raw;else return null;}
  const n=Number(norm.replace(/[^\d.]/g,''));if(!Number.isFinite(n))return null;
  return neg?-n:n;
}
function AI20_scoreMoney(raw,index,total,mode){
  let score=0;const txt=String(raw||'');if(/[,.]\d{2}/.test(txt))score+=42;if(/R\$/i.test(txt))score+=12;if(index===total-1)score+=14;if(index===total-2)score+=8;if(looksLikeDate(txt))score-=70;
  const v=Math.abs(AI20_parseMoney(txt,mode)||0);if(v>0&&v<10000)score+=16;else if(v>=10000&&v<100000)score+=5;else if(v>=100000)score-=30;return score;
}
function AI20_description(line,cols,money){
  let desc='';
  if(cols.length>=3){desc=cols.filter((c,i)=>i!==money.index&&!looksLikeDate(c)&&AI20_parseMoney(c,($('aiValueProfile')&&$('aiValueProfile').value)||'br')===null&&!isValueMarker(c)).join(' ');}
  if(!desc){desc=String(line).replace(money.raw,'').replace(/\b(D|C|DEBITO|DÉBITO|CREDITO|CRÉDITO|SAIDA|SAÍDA|ENTRADA)\b/ig,'');const dm=String(line).match(/(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/);if(dm)desc=desc.replace(dm[0],'');}
  return cleanDescription(desc);
}
function AI20_type(line,description,value){
  const text=(line+' '+description).toLowerCase();if(value<0)return 'expense';if(/\b(d|debito|débito|saida|saída)\b/.test(text))return 'expense';if(/\b(c|credito|crédito|entrada)\b/.test(text))return 'income';if(isExpenseDescription(description))return 'expense';if(/sal[aá]rio|pix recebido|recebido|dep[oó]sito|deposito|cr[eé]dito|transferência recebida|transferencia recebida/.test(text))return 'income';return 'expense';
}
function AI20_duplicate(item){return state.tx.some(t=>t.date===item.date&&Math.abs(Number(t.amount)-Number(item.amount))<0.01&&t.type===item.type&&String(t.description||'').toLowerCase().slice(0,14)===String(item.description||'').toLowerCase().slice(0,14));}
function AI20_status(ctx){if(ctx.duplicate)return 'duplicate';if(ctx.amount>50000)return 'danger';if(ctx.cfg.strictness==='safe'&&ctx.amount>1000)return 'review';if(ctx.cfg.strictness==='balanced'&&ctx.amount>3000)return 'review';if(ctx.money.weak||ctx.money.ambiguous)return 'review';if((ctx.description||'').length<4)return 'review';if(ctx.category==='Outros'&&ctx.amount>500)return 'review';return 'safe';}
function AI20_reason(ctx){const r=[];if(ctx.duplicate)r.push('possível duplicado');if(ctx.amount>50000)r.push('valor muito alto');if(ctx.cfg.strictness==='safe'&&ctx.amount>1000)r.push('valor alto');if(ctx.money.weak)r.push('valor fora de coluna clara');if(ctx.money.ambiguous)r.push('valor ambíguo');if((ctx.description||'').length<4)r.push('descrição curta');if(ctx.category==='Outros'&&ctx.amount>500)r.push('categoria incerta');return r.join(', ')||'seguro';}
function AI20_confidence(ctx){let c=94;if(ctx.status==='review')c-=20;if(ctx.status==='danger')c-=45;if(ctx.duplicate)c-=45;if(ctx.money.weak)c-=12;if(ctx.money.ambiguous)c-=10;if(ctx.category==='Outros')c-=5;return Math.max(5,Math.min(99,c));}
function AI20_dedupe(list){const seen=new Set();return list.filter(x=>{const k=[x.date,x.type,x.amount,String(x.description).toLowerCase().slice(0,24)].join('|');if(seen.has(k))return false;seen.add(k);return true;});}
function AI20_summary(items,bank,cfg){const approved=items.filter(x=>x.approved&&!x.duplicate);return{bank,mode:cfg.strictness,detected:items.length,approved:approved.length,income:approved.filter(x=>x.type==='income').reduce((s,x)=>s+x.amount,0),expense:approved.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0),review:items.filter(x=>x.status==='review').length,danger:items.filter(x=>x.status==='danger').length,duplicate:items.filter(x=>x.duplicate).length};}
function renderExtractReader(){
  const list=$('extractPreview'), summary=$('extractAiSummary'), learning=$('learningBox');if(!list&&!summary&&!learning)return;
  const draft=state.extractDraft||[];const bank=(draft[0]&&draft[0].bank)||'auto';const s=AI20_summary(draft,bank,{strictness:'safe'});
  if(summary)summary.innerHTML=`<div class="professional-kpi"><div class="alert"><b>Banco</b><p>${s.bank}</p></div><div class="alert"><b>Detectados</b><p>${s.detected}</p></div><div class="alert"><b>Aprovados</b><p>${s.approved}</p></div><div class="alert"><b>Despesas</b><p>${brl(s.expense)}</p></div></div><div class="alert ${s.review||s.danger||s.duplicate?'ai20-review':'ai20-safe'}"><span class="import-status">AI Engine V20</span> ${s.review} revisar, ${s.danger} crítico(s), ${s.duplicate} duplicado(s). Apenas seguros entram automaticamente.</div>`;
  if(learning){const keys=Object.keys(state.categoryLearning||{});learning.innerHTML=keys.length?keys.map(k=>`<span class="learning-pill">${k} → ${state.categoryLearning[k]}</span>`).join(''):'<p>Nenhum aprendizado local ainda.</p>';}
  if(list)list.innerHTML=draft.map(item=>`<div class="extract-row ${item.status==='safe'?'ai20-safe':item.status==='duplicate'||item.status==='danger'?'ai20-danger':'ai20-review'}"><div class="ai20-grid"><input value="${escapeHtml(item.date)}" data-extract-field="date" data-id="${item.id}"><input value="${escapeHtml(item.description)}" data-extract-field="description" data-id="${item.id}"><input type="number" value="${item.amount}" data-extract-field="amount" data-id="${item.id}"><select data-extract-field="type" data-id="${item.id}"><option value="income"${item.type==='income'?' selected':''}>Receita</option><option value="expense"${item.type==='expense'?' selected':''}>Despesa</option></select><select data-extract-field="category" data-id="${item.id}">${allCategories().map(c=>`<option${c===item.category?' selected':''}>${c}</option>`).join('')}</select><button data-action="toggleExtract" data-id="${item.id}">${item.approved?'Aprovado':'Ignorado'}</button></div><div class="ai20-tools"><span class="ai20-tag">Status: ${item.status}</span><span class="ai20-tag">Confiança: ${item.confidence}%</span><span class="ai20-tag">Motivo: ${item.reason}</span><span class="ai20-tag">Banco: ${item.bank}</span><button class="delete" data-action="deleteExtract" data-id="${item.id}">Remover</button></div></div>`).join('')||'<p>Nenhum lançamento detectado.</p>';
  document.querySelectorAll('[data-extract-field]').forEach(el=>{el.onchange=()=>{const item=state.extractDraft.find(x=>x.id===el.dataset.id);if(!item)return;const field=el.dataset.extractField;item[field]=field==='amount'?Number(el.value||0):el.value;if(field==='category')saveCategoryLearning(item.description,item.category);item.status='safe';item.approved=true;item.reason='revisado manualmente';item.confidence=99;save();};});
}
function importExtractDraft(){
  const approved=(state.extractDraft||[]).filter(x=>x.approved&&x.status!=='duplicate'&&x.status!=='danger');
  approved.forEach(x=>{saveCategoryLearning(x.description,x.category);state.tx.push({id:id(),description:x.description,amount:Number(x.amount||0),type:x.type,category:x.category,due:'',recurring:false,month:(x.date||today()).slice(0,7),date:x.date||today(),source:'extrato'});});
  state.lastImportSummary={imported:approved.length,date:today()};state.extractDraft=[];if($('extractPaste'))$('extractPaste').value='';save();alert(approved.length+' lançamento(s) importado(s). Duplicados/críticos foram ignorados.');
}



// V21.3 STABLE CLEAN FIX

// V21.4.1 REBIND FIX
function rebindNavigationButtons(){
  document.querySelectorAll('[data-page]').forEach(function(btn){
    if(btn.dataset.rf2141)return;
    btn.dataset.rf2141='1';
    btn.addEventListener('click',function(ev){
      ev.preventDefault();
      if(typeof setPage==='function')setPage(btn.dataset.page);
    });
  });
}

function rf213OpenMenu(){
  const sheet=$('sheet'), backdrop=$('sheetBackdrop');
  if(sheet){sheet.classList.remove('hidden');sheet.scrollTop=0;}
  if(backdrop)backdrop.classList.remove('hidden');
  document.body.classList.add('menu-open');
}
function rf213CloseMenu(){
  const sheet=$('sheet'), backdrop=$('sheetBackdrop');
  if(sheet)sheet.classList.add('hidden');
  if(backdrop)backdrop.classList.add('hidden');
  document.body.classList.remove('menu-open');
}
function rf213BindMenu(){
  const menu=$('menuBtn'), close=$('closeSheetBtn'), backdrop=$('sheetBackdrop'), sheet=$('sheet');
  if(menu&&!menu.dataset.rf213){menu.dataset.rf213='1';menu.addEventListener('click',function(e){e.preventDefault();rf213OpenMenu();});}
  if(close&&!close.dataset.rf213){close.dataset.rf213='1';close.addEventListener('click',function(e){e.preventDefault();rf213CloseMenu();});}
  if(backdrop&&!backdrop.dataset.rf213){backdrop.dataset.rf213='1';backdrop.addEventListener('click',rf213CloseMenu);}
  if(sheet&&!sheet.dataset.rf213){sheet.dataset.rf213='1';sheet.addEventListener('touchmove',function(e){e.stopPropagation();},{passive:true});}
  document.querySelectorAll('.sheet-link').forEach(function(btn){
    if(!btn.dataset.rf213){
      btn.dataset.rf213='1';
      btn.addEventListener('click',function(){setTimeout(rf213CloseMenu,80);});
    }
  });
}
function rf213StableAI(){
  const t=totals();
  const tx=currentTx();
  const expenses=tx.filter(function(x){return x.type==='expense';});
  const cat=categoryMap();
  const cats=Object.keys(cat).sort(function(a,b){return cat[b]-cat[a];});
  const topCat=cats[0]||'Nenhuma';
  const topValue=cat[topCat]||0;
  const saving=t.income?Math.round((t.balance/t.income)*100):0;
  const daily=t.expense/Math.max(1,new Date().getDate());
  const projected=daily*30;
  const reserve=t.expense?Math.floor(t.wallets/t.expense):0;
  const cardPct=t.cardLimit?Math.round(t.cardUsed/t.cardLimit*100):0;
  let score=80;
  if(t.balance<0)score-=30;
  if(saving<10)score-=12;
  if(cardPct>60)score-=12;
  if(reserve<1&&t.expense>0)score-=12;
  if(projected>t.income&&t.income>0)score-=10;
  score=Math.max(0,Math.min(100,score));
  const level=score>=70?'Saudável':score>=45?'Atenção':'Crítico';
  const cls=score>=70?'ai-stable-ok':score>=45?'ai-stable-warn':'ai-stable-bad';
  const actions=[];
  if(t.balance<0)actions.push('Saldo negativo: reduza gastos variáveis antes de novas compras.');
  if(topValue>0)actions.push('Maior foco: '+topCat+' com '+brl(topValue)+'. Revise os maiores gastos dessa categoria.');
  if(cardPct>60)actions.push('Cartão acima de 60%. Tente manter abaixo de 50%.');
  if(reserve<3&&t.expense>0)actions.push('Reserva cobre '+reserve+' mês(es). Objetivo profissional: 3 a 6 meses.');
  if(t.balance>0)actions.push('Saldo positivo: separe '+brl(t.balance*.3)+' para reserva ou investimento.');
  if(!actions.length)actions.push('Finanças equilibradas. Continue registrando e revisando semanalmente.');
  const ai=$('aiPanel'), pro=$('aiProfessionalPanel'), diag=$('aiDiagnosis'), plan=$('aiActionPlan'), opp=$('aiOpportunities'), forecast=$('smartForecast');
  const kpi='<div class="professional-kpi"><div class="alert ai-stable-card"><span class="ai-chip">AI Local Stable</span><p class="ai-level">'+score+'</p><small>score</small></div><div class="alert '+cls+'"><b>Nível</b><p>'+level+'</p></div><div class="alert"><b>Maior categoria</b><p>'+topCat+'</p><small>'+brl(topValue)+'</small></div><div class="alert"><b>Projeção 30d</b><p>'+brl(projected)+'</p></div></div>';
  if(pro)pro.innerHTML=kpi;
  if(ai)ai.innerHTML='<div class="alert '+cls+'"><b>Diagnóstico:</b> '+level+' • Score '+score+'/100<br>Economia: '+saving+'% • Cartão: '+cardPct+'% • Reserva: '+reserve+' mês(es)</div><div class="alert"><b>Próxima ação:</b> '+actions[0]+'</div>';
  if(forecast)forecast.innerHTML='<div class="professional-kpi"><div class="alert"><b>Gasto diário</b><p>'+brl(daily)+'</p></div><div class="alert"><b>Gasto 30d</b><p>'+brl(projected)+'</p></div><div class="alert"><b>Saldo 12m</b><p>'+brl(t.balance*12)+'</p></div><div class="alert"><b>Reserva ideal</b><p>'+brl(t.expense*6)+'</p></div></div>';
  if(diag)diag.innerHTML='<div class="alert '+cls+'"><b>Análise:</b><p>Score '+score+', nível '+level+', economia '+saving+'%, uso do cartão '+cardPct+'% e reserva de '+reserve+' mês(es).</p></div>';
  if(plan)plan.innerHTML=actions.map(function(x,i){return '<div class="alert"><b>Ação '+(i+1)+'</b><p>'+x+'</p></div>';}).join('');
  if(opp){
    const unusual=expenses.filter(function(x){return x.amount>daily*4&&x.amount>150;}).slice(0,5);
    opp.innerHTML=unusual.length?unusual.map(function(x){return '<div class="alert ai-stable-warn"><b>Gasto fora do padrão</b><p>'+x.description+' • '+brl(x.amount)+' • '+x.category+'</p></div>';}).join(''):'<div class="alert ai-stable-ok">Nenhum gasto fora do padrão detectado.</div>';
  }
}
document.addEventListener('DOMContentLoaded',function(){rf213BindMenu();setTimeout(rf213StableAI,50);});
document.addEventListener('keydown',function(e){if(e.key==='Escape')rf213CloseMenu();});


// V21.4 STABLE PLUS
function renderStablePlus(){
  const status=$('stableSystemStatus'), next=$('nextStepBox');
  if(status){
    const txCount=(state.tx||[]).length;
    const walletCount=(state.wallets||[]).length;
    const goalCount=(state.goals||[]).length+(state.goalPro||[]).length;
    const localSize=JSON.stringify(state||{}).length;
    status.innerHTML='<div class="stable-kpi">'+
      '<div class="alert"><b>Lançamentos</b><p>'+txCount+'</p></div>'+
      '<div class="alert"><b>Carteiras</b><p>'+walletCount+'</p></div>'+
      '<div class="alert"><b>Metas</b><p>'+goalCount+'</p></div>'+
      '<div class="alert"><b>Dados locais</b><p>'+Math.round(localSize/1024)+' KB</p></div>'+
    '</div><div class="alert"><span class="stable-pill">Menu estável</span><span class="stable-pill">Cloud isolado</span><span class="stable-pill">IA local segura</span><span class="stable-pill">GitHub Pages OK</span></div>';
  }
  if(next){
    next.innerHTML='<div class="alert"><b>Recomendação:</b><p>Manter esta base estável e só ativar Firebase/Login Google depois que os dados reais do projeto Firebase estiverem configurados.</p></div><div class="alert"><b>Próxima versão segura:</b><p>V21.5 pode adicionar uma tela de configuração guiada do Firebase, sem ativar scripts externos automaticamente.</p></div>';
  }
}
function initStablePlusButtons(){
  const clean=$('stableCleanCacheBtn');
  if(clean&&!clean.dataset.ready){
    clean.dataset.ready='1';
    clean.addEventListener('click',function(){
      try{
        if(window.caches){caches.keys().then(function(keys){keys.forEach(function(k){caches.delete(k);});});}
        if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(regs){regs.forEach(function(r){r.unregister();});});}
      }catch(e){console.warn(e);}
      location.replace(location.href.split('?')[0]+'?v=2161monthlyfix&t='+Date.now());
    });
  }
  const backup=$('stableBackupBtn');
  if(backup&&!backup.dataset.ready){
    backup.dataset.ready='1';
    backup.addEventListener('click',function(){
      download('ramalho-finance-v21-6-1-monthly-close-button-fix-backup.json',JSON.stringify(state,null,2),'application/json');
    });
  }
}
document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){renderStablePlus();initStablePlusButtons();},100);});


// V21.5.1 SMART REVIEW + BUTTON FIX
function rf2151GoPage(page){
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
  var target=document.getElementById(page);
  if(target)target.classList.add('active');
  document.querySelectorAll('.tab').forEach(function(t){t.classList.toggle('active',t.dataset.page===page);});
  var sheet=document.getElementById('sheet');
  if(sheet)sheet.classList.add('hidden');
  var backdrop=document.getElementById('sheetBackdrop');
  if(backdrop)backdrop.classList.add('hidden');
  document.body.classList.remove('menu-open');
  try{window.scrollTo(0,0);}catch(e){}
}
function rebindNavigationButtons(){
  document.querySelectorAll('[data-page]').forEach(function(btn){
    if(btn.dataset.rf2151)return;
    btn.dataset.rf2151='1';
    btn.addEventListener('click',function(ev){
      ev.preventDefault();
      rf2151GoPage(btn.dataset.page);
    });
  });
}
function getSmartReviewItems(){
  var tx=(state.tx||[]).slice();
  var current=currentTx();
  var expenses=current.filter(function(x){return x.type==='expense';});
  var avg=expenses.length?expenses.reduce(function(s,x){return s+x.amount;},0)/expenses.length:0;
  var items=[];
  tx.forEach(function(t){
    var reasons=[];
    var severity='mid';
    if(t.category==='Outros')reasons.push('Categoria indefinida');
    if(Number(t.amount)>1000){reasons.push('Valor alto');severity='high';}
    if(avg>0 && t.type==='expense' && Number(t.amount)>avg*3 && Number(t.amount)>150){reasons.push('Gasto fora do padrão');severity='high';}
    var dup=tx.some(function(o){return o.id!==t.id && o.date===t.date && o.type===t.type && Math.abs(Number(o.amount)-Number(t.amount))<0.01 && String(o.description||'').toLowerCase().slice(0,12)===String(t.description||'').toLowerCase().slice(0,12);});
    if(dup){reasons.push('Possível duplicado');severity='high';}
    if(!t.description || String(t.description).length<3)reasons.push('Descrição muito curta');
    if(reasons.length)items.push({tx:t,reasons:reasons,severity:severity});
  });
  return items.slice(0,80);
}
function renderSmartReview(){
  var summary=document.getElementById('reviewSummary'), list=document.getElementById('reviewList');
  if(!summary&&!list)return;
  var items=getSmartReviewItems();
  var high=items.filter(function(x){return x.severity==='high';}).length;
  var mid=items.length-high;
  if(summary)summary.innerHTML='<div class="stable-kpi">'+
    '<div class="alert '+(items.length?'review-mid':'review-ok')+'"><b>Total</b><p>'+items.length+'</p></div>'+
    '<div class="alert review-high"><b>Alta atenção</b><p>'+high+'</p></div>'+
    '<div class="alert review-mid"><b>Atenção média</b><p>'+mid+'</p></div>'+
    '<div class="alert review-ok"><b>Status</b><p>'+(items.length?'Revisar':'Tudo ok')+'</p></div>'+
  '</div>';
  if(list)list.innerHTML=items.map(function(item){
    var t=item.tx;
    return '<div class="alert '+(item.severity==='high'?'review-high':'review-mid')+'">'+
      '<b>'+t.description+'</b><p>'+t.date+' • '+t.category+' • '+(t.type==='income'?'+':'-')+' '+brl(t.amount)+'</p>'+
      item.reasons.map(function(r){return '<span class="review-tag">'+r+'</span>';}).join('')+
    '</div>';
  }).join('') || '<div class="alert review-ok">Nenhum lançamento suspeito encontrado.</div>';
}
function rf2151AfterRender(){
  rebindNavigationButtons();
  renderSmartReview();
}
document.addEventListener('DOMContentLoaded',function(){setTimeout(rf2151AfterRender,100);setTimeout(rf2151AfterRender,700);});


// V21.6.1 MONTHLY CLOSE - ISOLATED BUTTON SAFE
function rf2161MonthlyData(){
  var tx=currentTx();
  var income=tx.filter(function(x){return x.type==='income';}).reduce(function(s,x){return s+Number(x.amount||0);},0);
  var expense=tx.filter(function(x){return x.type==='expense';}).reduce(function(s,x){return s+Number(x.amount||0);},0);
  var balance=income-expense;
  var saving=income?Math.round((balance/income)*100):0;
  var expenses=tx.filter(function(x){return x.type==='expense';}).sort(function(a,b){return Number(b.amount||0)-Number(a.amount||0);});
  var cat={};
  expenses.forEach(function(x){var k=x.category||'Outros';cat[k]=(cat[k]||0)+Number(x.amount||0);});
  var cats=Object.keys(cat).sort(function(a,b){return cat[b]-cat[a];}).map(function(k){return {category:k,total:cat[k]};});
  return {tx:tx,income:income,expense:expense,balance:balance,saving:saving,expenses:expenses,cats:cats};
}
function rf2161MonthlyText(){
  var d=rf2161MonthlyData();
  var lines=['Ramalho Finance - Fechamento Mensal','Mês: '+month(),'Receitas: '+brl(d.income),'Despesas: '+brl(d.expense),'Saldo: '+brl(d.balance),'Economia: '+d.saving+'%','','Maiores gastos:'];
  d.expenses.slice(0,10).forEach(function(x,i){lines.push((i+1)+'. '+x.description+' - '+brl(x.amount)+' - '+x.category);});
  lines.push('','Categorias:');
  d.cats.forEach(function(x){lines.push(x.category+': '+brl(x.total));});
  return lines.join('\n');
}
function rf2161RenderMonthly(){
  var summary=document.getElementById('monthlyCloseSummary');
  var top=document.getElementById('monthlyCloseTopExpenses');
  var cats=document.getElementById('monthlyCloseCategories');
  if(!summary&&!top&&!cats)return;
  var d=rf2161MonthlyData();
  var cls=d.balance>=0?'monthly-good':'monthly-bad';
  if(summary)summary.innerHTML='<div class="stable-kpi">'+
    '<div class="alert monthly-good"><b>Receitas</b><p>'+brl(d.income)+'</p></div>'+
    '<div class="alert '+(d.expense>d.income?'monthly-bad':'monthly-warn')+'"><b>Despesas</b><p>'+brl(d.expense)+'</p></div>'+
    '<div class="alert '+cls+'"><b>Saldo</b><p>'+brl(d.balance)+'</p></div>'+
    '<div class="alert '+cls+'"><b>Economia</b><p>'+d.saving+'%</p></div>'+
  '</div><div class="alert '+cls+'"><span class="monthly-tag">Mês '+month()+'</span> Fechamento atualizado.</div>';
  if(top)top.innerHTML=d.expenses.slice(0,10).map(function(x,i){
    return '<div class="row"><div><b>'+(i+1)+'. '+x.description+'</b><small>'+x.category+' • '+x.date+'</small></div><span>'+brl(x.amount)+'</span></div>';
  }).join('') || '<div class="alert monthly-good">Nenhuma despesa registrada neste mês.</div>';
  if(cats)cats.innerHTML=d.cats.map(function(x){
    var pct=d.expense?Math.round((x.total/d.expense)*100):0;
    return '<div class="alert"><b>'+x.category+'</b><p>'+brl(x.total)+' • '+pct+'%</p><div class="progress"><span style="width:'+Math.min(100,pct)+'%"></span></div></div>';
  }).join('') || '<div class="alert">Sem categorias neste mês.</div>';
}
function rf2161BindMonthlyButtons(){
  var copy=document.getElementById('copyMonthlyCloseBtn');
  if(copy&&!copy.dataset.rf2161){
    copy.dataset.rf2161='1';
    copy.addEventListener('click',function(){
      var text=rf2161MonthlyText();
      if(navigator.clipboard)navigator.clipboard.writeText(text).then(function(){alert('Fechamento copiado.');});
      else alert(text);
    });
  }
  var exp=document.getElementById('exportMonthlyCloseBtn');
  if(exp&&!exp.dataset.rf2161){
    exp.dataset.rf2161='1';
    exp.addEventListener('click',function(){
      download('fechamento-mensal-ramalho-finance-'+month()+'.txt',rf2161MonthlyText(),'text/plain');
    });
  }
}
function rf2161SafeInit(){
  if(typeof rebindNavigationButtons==='function')rebindNavigationButtons();
  rf2161RenderMonthly();
  rf2161BindMonthlyButtons();
}
document.addEventListener('DOMContentLoaded',function(){setTimeout(rf2161SafeInit,150);setTimeout(rf2161SafeInit,900);});
document.addEventListener('click',function(e){
  var btn=e.target.closest&&e.target.closest('[data-page]');
  if(btn&&btn.dataset.page==='monthlyClose')setTimeout(rf2161SafeInit,120);
},true);

try{render();}catch(err){console.error(err);alert('Erro ao iniciar: '+err.message);}
if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister()));}
})();