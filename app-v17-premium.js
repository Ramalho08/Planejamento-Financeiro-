(function(){
'use strict';

function $(id){return document.getElementById(id);}
function brl(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function month(){return new Date().toISOString().slice(0,7);}
function today(){return new Date().toISOString().slice(0,10);}
function safeParse(raw,fallback){try{return raw?JSON.parse(raw):fallback;}catch(e){return fallback;}}
function showError(err){var box=$('errorBox');if(box){box.classList.remove('hidden');box.textContent='Erro no app: '+(err.message||err);}}

var KEY='rf_v17_ultimate_premium';
var defaultState={tx:[],wallets:[],cards:[],goals:[],investments:[],budgets:[],subscriptions:[],plan:[],customCategories:[],profileName:'Guilherme',theme:'dark',sortTx:false};
var state=safeParse(localStorage.getItem(KEY),defaultState);

function save(){localStorage.setItem(KEY,JSON.stringify(state));render();}
function currentTx(){return state.tx.filter(function(t){return t.month===month();});}
function allCategories(){
  var base=['Alimentação','Transporte','Moradia','Educação','Saúde','Lazer','Cartão','Investimentos','Pix','Assinaturas','Salário','Outros'];
  (state.customCategories||[]).forEach(function(c){if(base.indexOf(c.name)<0)base.push(c.name);});
  return base;
}
function totals(){
  var tx=currentTx();
  var income=tx.filter(function(t){return t.type==='income';}).reduce(function(s,t){return s+t.amount;},0);
  var expense=tx.filter(function(t){return t.type==='expense';}).reduce(function(s,t){return s+t.amount;},0);
  var wallets=state.wallets.reduce(function(s,w){return s+w.balance;},0);
  var investments=state.investments.reduce(function(s,i){return s+i.amount;},0);
  var cardUsed=tx.filter(function(t){return t.cardId;}).reduce(function(s,t){return s+t.amount;},0);
  var cardLimit=state.cards.reduce(function(s,c){return s+c.limit;},0);
  var subTotal=(state.subscriptions||[]).reduce(function(s,x){return s+x.value;},0);
  return {income:income,expense:expense,balance:income-expense,wallets:wallets,investments:investments,cardUsed:cardUsed,cardLimit:cardLimit,subTotal:subTotal,net:wallets+investments+income-expense};
}

function on(id,event,handler){var el=$(id);if(el)el.addEventListener(event,handler);}
function setPage(page){
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
  var el=$(page); if(el)el.classList.add('active');
  document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');});
  var tab=document.querySelector('.tab[data-page="'+page+'"]'); if(tab)tab.classList.add('active');
  var sheet=$('sheet'); if(sheet)sheet.classList.add('hidden');
  window.scrollTo(0,0);
}
document.querySelectorAll('.tab,.sheet-link').forEach(function(btn){btn.addEventListener('click',function(){if(btn.dataset.page)setPage(btn.dataset.page);});});

on('themeBtn','click',function(){state.theme=state.theme==='dark'?'light':'dark';save();});
on('menuBtn','click',function(){$('sheet').classList.toggle('hidden');});

on('addTxBtn','click',function(){
  state.tx.push({id:Date.now().toString(36),description:$('txDesc').value||'Lançamento',amount:Number($('txAmount').value||0),type:$('txType').value,category:$('txCategory').value,due:$('txDue').value,recurring:$('txRecurring').checked,month:month(),date:today()});
  $('txDesc').value='';$('txAmount').value='';$('txDue').value='';$('txRecurring').checked=false;save();
});
on('searchTx','input',renderTransactions);
on('filterType','change',renderTransactions);
on('filterCategory','change',renderTransactions);
on('sortTxBtn','click',function(){state.sortTx=!state.sortTx;save();});

on('addWalletBtn','click',function(){
  state.wallets.push({id:Date.now().toString(36),name:$('walletName').value||'Carteira',balance:Number($('walletBalance').value||0)});
  $('walletName').value='';$('walletBalance').value='';save();
});
on('transferBtn','click',function(){
  var from=state.wallets.find(function(w){return w.id===$('fromWallet').value;});
  var to=state.wallets.find(function(w){return w.id===$('toWallet').value;});
  var amount=Number($('transferAmount').value||0);
  if(from&&to&&from.id!==to.id&&amount>0){
    from.balance-=amount;to.balance+=amount;
    state.tx.push({id:Date.now().toString(36),description:'Transferência '+from.name+' → '+to.name,amount:amount,type:'expense',category:'Transferência',month:month(),date:today()});
  }
  $('transferAmount').value='';save();
});

on('addCardBtn','click',function(){
  state.cards.push({id:Date.now().toString(36),name:$('cardName').value||'Cartão',limit:Number($('cardLimit').value||0),due:Number($('cardDue').value||1)});
  $('cardName').value='';$('cardLimit').value='';$('cardDue').value='';save();
});
on('addParcelBtn','click',function(){
  var total=Number($('parcelTotal').value||0),count=Math.max(1,Number($('parcelCount').value||1));
  var card=state.cards.find(function(c){return c.id===$('parcelCard').value;});
  var part=total/count;
  for(var i=0;i<count;i++){
    var d=new Date();d.setMonth(d.getMonth()+i);
    state.tx.push({id:Date.now().toString(36)+i,description:$('parcelDesc').value||'Compra parcelada',amount:part,type:'expense',category:'Cartão',cardId:card?card.id:'',cardName:card?card.name:'',installment:(i+1)+'/'+count,month:d.toISOString().slice(0,7),date:d.toISOString().slice(0,10)});
  }
  $('parcelDesc').value='';$('parcelTotal').value='';$('parcelCount').value='';save();
});

on('addBudgetBtn','click',function(){
  var cat=$('budgetCategory').value,limit=Number($('budgetLimit').value||0);
  var existing=state.budgets.find(function(b){return b.category===cat;});
  if(existing)existing.limit=limit;else state.budgets.push({id:Date.now().toString(36),category:cat,limit:limit});
  $('budgetLimit').value='';save();
});
on('addSubBtn','click',function(){
  var name=$('subName').value||'Assinatura',value=Number($('subValue').value||0),cat=$('subCategory').value,due=Number($('subDue').value||1);
  state.subscriptions.push({id:Date.now().toString(36),name:name,value:value,category:cat,due:due});
  state.tx.push({id:Date.now().toString(36)+'s',description:name,amount:value,type:'expense',category:cat,recurring:true,month:month(),date:today()});
  $('subName').value='';$('subValue').value='';$('subDue').value='';save();
});
on('addPlanBtn','click',function(){
  state.plan.push({id:Date.now().toString(36),title:$('planTitle').value||'Item do plano',priority:$('planPriority').value,done:false});
  $('planTitle').value='';save();
});
on('addCategoryBtn','click',function(){
  var name=($('newCategory').value||'').trim();
  if(name&&!state.customCategories.find(function(c){return c.name===name;}))state.customCategories.push({id:Date.now().toString(36),name:name});
  $('newCategory').value='';save();
});

on('addGoalBtn','click',function(){
  state.goals.push({id:Date.now().toString(36),name:$('goalName').value||'Meta',target:Number($('goalTarget').value||0),saved:Number($('goalSaved').value||0)});
  $('goalName').value='';$('goalTarget').value='';$('goalSaved').value='';save();
});
on('simulateGoalBtn','click',function(){
  var g=state.goals[0],m=Number($('monthlySave').value||0);
  $('goalSimulation').textContent=g&&m>0?'Guardando '+brl(m)+' por mês, você alcança "'+g.name+'" em '+Math.ceil((g.target-g.saved)/m)+' mês(es).':'Crie uma meta e informe um valor mensal.';
});
on('addInvestBtn','click',function(){
  state.investments.push({id:Date.now().toString(36),name:$('investName').value||'Investimento',amount:Number($('investAmount').value||0),rate:Number($('investRate').value||0)});
  $('investName').value='';$('investAmount').value='';$('investRate').value='';save();
});
on('simulateWealthBtn','click',function(){
  var total=state.investments.reduce(function(s,i){return s+i.amount;},0),months=Number($('wealthYears').value||0)*12,ap=Number($('wealthMonthly').value||0);
  for(var i=0;i<months;i++)total=(total+ap)*1.008;
  $('wealthSimulation').textContent='Patrimônio estimado: '+brl(total);
});
on('generateReportBtn','click',function(){$('aiReport').innerHTML=aiReport();});
on('simulateFutureBtn','click',simulateFuture);
on('saveProfileBtn','click',function(){state.profileName=$('profileName').value||'Guilherme';save();});
on('sampleBtn','click',function(){insertSample();save();});
on('exportCsvBtn','click',exportCsv);
on('backupBtn','click',function(){download('ramalho-finance-v17-premium-backup.json',JSON.stringify(state,null,2),'application/json');});
on('restoreInput','change',function(e){var file=e.target.files[0];if(!file)return;var r=new FileReader();r.onload=function(){try{state=JSON.parse(r.result);save();}catch(err){showError(err);}};r.readAsText(file);});
on('printBtn','click',function(){window.print();});
on('clearBtn','click',function(){if(confirm('Apagar todos os dados?')){localStorage.removeItem(KEY);location.reload();}});

document.addEventListener('click',function(e){
  var btn=e.target.closest('[data-action]');
  if(!btn)return;
  var action=btn.dataset.action,id=btn.dataset.id;
  var maps={tx:'tx',wallet:'wallets',card:'cards',goal:'goals',invest:'investments',budget:'budgets',sub:'subscriptions',plan:'plan',category:'customCategories'};
  if(action==='togglePlan'){var p=state.plan.find(function(x){return x.id===id;});if(p)p.done=!p.done;save();return;}
  var key=maps[action];
  if(key){state[key]=state[key].filter(function(x){return x.id!==id;});save();}
});

function render(){
  document.body.classList.toggle('light',state.theme==='light');
  populateSelects();
  var t=totals(),saving=t.income?Math.round(t.balance/t.income*100):0,cardPct=t.cardLimit?Math.round(t.cardUsed/t.cardLimit*100):0,reserveMonths=t.expense?Math.floor(t.wallets/t.expense):0;
  var score=Math.max(0,Math.min(100,50+saving-(t.balance<0?25:0)-(cardPct>50?15:0)));
  $('greeting').textContent=greeting()+', '+(state.profileName||'Guilherme');
  $('netWorth').textContent=brl(t.net);$('incomeTotal').textContent=brl(t.income);$('expenseTotal').textContent=brl(t.expense);$('balanceTotal').textContent=brl(t.balance);$('reserveIdeal').textContent=brl(t.expense*6);
  $('walletTotal').textContent=brl(t.wallets);$('investmentTotal').textContent=brl(t.investments);$('cardDebt').textContent=brl(t.cardUsed);$('subTotal').textContent=brl(t.subTotal);
  $('availableMoney').textContent=brl(t.wallets);$('projection12').textContent=brl(t.net+t.balance*12);$('cardUsage').textContent=cardPct+'%';$('reserveMonths').textContent=reserveMonths+' meses';
  $('score').textContent=score;$('savingRate').textContent=saving+'%';$('riskLevel').textContent=score>=70?'Baixo':score>=45?'Médio':'Alto';
  var al=alerts(t,saving,cardPct);$('mainInsight').textContent=al[0];$('alerts').innerHTML=al.map(function(a){return '<div class="alert">'+a+'</div>';}).join('');
  $('aiSummary').innerHTML=smartSummary(t,score,saving,cardPct);
  renderBars(t);renderCategories();renderTopExpenses();renderMonthlyCompare();renderPremiumCenter(t,score,saving,cardPct);renderDailyFlow();renderGoalInsights();renderAnalytics(t,score);renderCategoryRanking();renderTransactions();renderWallets();renderCards();renderBudgets();renderSubs();renderPlan();renderCustomCategories();renderCalendar();renderGoals();renderInvests();renderChecklist(t);renderCloud();renderSummary();
}
function populateSelects(){
  var cats=allCategories();
  ['txCategory','budgetCategory','subCategory'].forEach(function(id){var el=$(id);if(el)el.innerHTML=cats.map(function(c){return '<option>'+c+'</option>';}).join('');});
  var fc=$('filterCategory');if(fc)fc.innerHTML='<option value="all">Todas categorias</option>'+cats.map(function(c){return '<option value="'+c+'">'+c+'</option>';}).join('');
}
function greeting(){var h=new Date().getHours();return h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';}
function alerts(t,s,cp){var a=[];if(t.income===0)a.push('💡 Cadastre sua renda mensal.');if(t.balance<0)a.push('⚠️ Seu mês está negativo.');if(s>=25)a.push('🚀 Boa economia neste mês.');if(t.expense>t.income*.75&&t.income>0)a.push('🚨 Mais de 75% da renda comprometida.');if(cp>50)a.push('💳 Cartão acima de 50% do limite.');if(t.subTotal>t.income*.3&&t.income>0)a.push('🔁 Assinaturas altas para sua renda.');if(!a.length)a.push('✅ Finanças equilibradas.');a.push('🛡️ Reserva ideal: '+brl(t.expense*6));return a;}
function smartSummary(t,score,s,cp){return '<div class="row"><strong>Saúde financeira</strong><span>'+(score>=70?'Boa':score>=45?'Atenção':'Crítica')+'</span></div><div class="row"><strong>Categoria crítica</strong><span>'+criticalCategory()+'</span></div><div class="row"><strong>Guardar este mês</strong><span>'+brl(Math.max(0,t.balance*.3))+'</span></div><div class="row"><strong>Ação sugerida</strong><span>'+(t.balance<0?'Cortar gastos variáveis':cp>50?'Reduzir cartão':'Investir saldo positivo')+'</span></div>';}
function categoryMap(){var c={};currentTx().filter(function(t){return t.type==='expense';}).forEach(function(t){c[t.category]=(c[t.category]||0)+t.amount;});return c;}
function criticalCategory(){var c=categoryMap(),keys=Object.keys(c).sort(function(a,b){return c[b]-c[a];});return keys[0]||'Nenhuma';}
function bar(label,value,max){return '<small>'+label+' — '+brl(value)+'</small><div class="bar"><span style="width:'+Math.round((value/max)*100)+'%"></span></div>';}
function renderBars(t){var data=[['Receitas',t.income],['Despesas',t.expense],['Carteiras',t.wallets],['Investimentos',t.investments],['Cartões',t.cardUsed]],max=Math.max(1,t.income,t.expense,t.wallets,t.investments,t.cardUsed);$('flowBars').innerHTML=data.map(function(d){return bar(d[0],d[1],max);}).join('');}
function renderCategories(){var c=categoryMap(),vals=Object.values(c),max=Math.max(1,...vals);$('categoryBars').innerHTML=Object.keys(c).map(function(k){return bar(k,c[k],max);}).join('')||'<p>Sem despesas por categoria.</p>';}
function renderTopExpenses(){var list=currentTx().filter(function(t){return t.type==='expense';}).sort(function(a,b){return b.amount-a.amount;}).slice(0,5);$('topExpenses').innerHTML=list.map(function(t){return '<div class="row"><strong>'+t.description+'</strong><span>'+brl(t.amount)+'</span></div>';}).join('')||'<p>Sem gastos.</p>';}
function renderMonthlyCompare(){var m={};state.tx.forEach(function(t){m[t.month]=m[t.month]||{income:0,expense:0};t.type==='income'?m[t.month].income+=t.amount:m[t.month].expense+=t.amount;});var keys=Object.keys(m).sort().slice(-4),max=Math.max(1,...keys.map(function(k){return Math.abs(m[k].income-m[k].expense);}));$('monthlyCompare').innerHTML=keys.map(function(k){var saldo=m[k].income-m[k].expense;return bar(k+' saldo',Math.abs(saldo),max);}).join('')||'<p>Sem meses suficientes.</p>';}
function renderTransactions(){var q=($('searchTx').value||'').toLowerCase(),ft=$('filterType').value,fc=$('filterCategory').value;var list=currentTx().filter(function(t){return (ft==='all'||t.type===ft)&&(fc==='all'||t.category===fc)&&t.description.toLowerCase().includes(q);});if(state.sortTx)list=list.sort(function(a,b){return b.amount-a.amount;});$('txList').innerHTML=list.map(function(t){return '<div class="row"><div><strong>'+t.description+'</strong><small>'+t.category+(t.installment?' • '+t.installment:'')+(t.recurring?' • recorrente':'')+'</small></div><strong class="'+(t.type==='income'?'positive':'negative')+'">'+(t.type==='income'?'+':'-')+' '+brl(t.amount)+'</strong><button class="delete-mini" data-action="tx" data-id="'+t.id+'">Excluir</button></div>';}).join('')||'<p>Nenhum lançamento.</p>';}
function renderWallets(){var opts=state.wallets.map(function(w){return '<option value="'+w.id+'">'+w.name+'</option>';}).join('');$('fromWallet').innerHTML=opts;$('toWallet').innerHTML=opts;$('walletList').innerHTML=state.wallets.map(function(w){return '<div class="row"><strong>'+w.name+'</strong><span>'+brl(w.balance)+'</span><button class="delete-mini" data-action="wallet" data-id="'+w.id+'">Excluir</button></div>';}).join('')||'<p>Nenhuma carteira.</p>';}
function renderCards(){$('parcelCard').innerHTML=state.cards.map(function(c){return '<option value="'+c.id+'">'+c.name+'</option>';}).join('');$('cardList').innerHTML=state.cards.map(function(c){var used=currentTx().filter(function(t){return t.cardId===c.id;}).reduce(function(s,t){return s+t.amount;},0),p=c.limit?Math.min(100,Math.round(used/c.limit*100)):0;return '<div class="alert"><strong>'+c.name+'</strong><p>Usado '+brl(used)+' de '+brl(c.limit)+' • vence dia '+c.due+'</p><div class="progress"><span style="width:'+p+'%"></span></div><button class="delete-mini" data-action="card" data-id="'+c.id+'">Excluir cartão</button></div>';}).join('')||'<p>Nenhum cartão.</p>';}
function renderBudgets(){var spent=categoryMap();$('budgetList').innerHTML=state.budgets.map(function(b){var used=spent[b.category]||0,p=b.limit?Math.min(100,Math.round(used/b.limit*100)):0,cls=p>=100?'negative':p>=80?'warn':'ok';return '<div class="alert"><strong>'+b.category+'</strong><p class="'+cls+'">'+brl(used)+' de '+brl(b.limit)+' • '+p+'%</p><div class="progress"><span style="width:'+p+'%"></span></div><button class="delete-mini" data-action="budget" data-id="'+b.id+'">Excluir orçamento</button></div>';}).join('')||'<p>Nenhum orçamento.</p>';}
function renderSubs(){$('subList').innerHTML=(state.subscriptions.length?'<div class="alert"><strong>Total mensal:</strong> '+brl(state.subscriptions.reduce(function(s,x){return s+x.value;},0))+'</div>':'')+state.subscriptions.map(function(s){return '<div class="row"><div><strong>'+s.name+'</strong><small>'+s.category+' • vence dia '+s.due+'</small></div><span>'+brl(s.value)+'</span><button class="delete-mini" data-action="sub" data-id="'+s.id+'">Excluir</button></div>';}).join('')||'<p>Nenhuma assinatura.</p>';}
function renderPlan(){$('planList').innerHTML=state.plan.map(function(p){return '<div class="row"><div><strong class="'+(p.done?'done':'')+'">'+p.title+'</strong><small>Prioridade '+p.priority+'</small></div><button data-action="togglePlan" data-id="'+p.id+'">'+(p.done?'Reabrir':'Concluir')+'</button><button class="delete-mini" data-action="plan" data-id="'+p.id+'">Excluir</button></div>';}).join('')||'<p>Nenhum item no plano.</p>';}
function renderCustomCategories(){$('customCategoryList').innerHTML=state.customCategories.map(function(c){return '<div class="row"><strong>'+c.name+'</strong><button class="delete-mini" data-action="category" data-id="'+c.id+'">Excluir</button></div>';}).join('')||'<p>Nenhuma categoria personalizada.</p>';}
function renderCalendar(){var items=state.tx.filter(function(t){return t.due;}).sort(function(a,b){return a.due.localeCompare(b.due);});$('calendarList').innerHTML=items.map(function(t){return '<div class="row"><strong>'+t.description+'</strong><span>'+t.due+' • '+brl(t.amount)+'</span></div>';}).join('')||'<p>Nenhum vencimento.</p>';}
function renderGoals(){$('goalList').innerHTML=state.goals.map(function(g){var p=g.target?Math.min(100,Math.round(g.saved/g.target*100)):0;return '<div class="alert"><strong>'+g.name+'</strong><p>'+brl(g.saved)+' de '+brl(g.target)+' • '+p+'%</p><div class="progress"><span style="width:'+p+'%"></span></div><button class="delete-mini" data-action="goal" data-id="'+g.id+'">Excluir meta</button></div>';}).join('')||'<p>Nenhuma meta.</p>';}
function renderInvests(){var fut=state.investments.reduce(function(s,i){return s+i.amount*Math.pow(1+(i.rate||0)/100,12);},0);$('investList').innerHTML=(state.investments.length?'<div class="alert"><strong>Projeção 12 meses:</strong> '+brl(fut)+'</div>':'')+state.investments.map(function(i){return '<div class="row"><strong>'+i.name+'</strong><span>'+brl(i.amount)+' • '+i.rate+'% mês</span><button class="delete-mini" data-action="invest" data-id="'+i.id+'">Excluir</button></div>';}).join('')||'<p>Nenhum investimento.</p>';}
function renderChecklist(t){var l=[(t.income?'✅':'⬜')+' Receita cadastrada',(t.expense?'✅':'⬜')+' Despesas monitoradas',(state.wallets.length?'✅':'⬜')+' Carteira cadastrada',(state.cards.length?'✅':'⬜')+' Cartão cadastrado',(state.goals.length?'✅':'⬜')+' Meta ativa',(state.investments.length?'✅':'⬜')+' Investimentos registrados',(state.budgets.length?'✅':'⬜')+' Orçamentos definidos',(t.balance>=0?'✅':'⚠️')+' Saldo mensal positivo'];$('checklist').innerHTML=l.map(function(x){return '<div class="alert">'+x+'</div>';}).join('');}
function renderCloud(){var pn=$('profileName');if(pn)pn.value=state.profileName||'Guilherme';$('profileBox').innerHTML='<div class="row"><strong>Perfil</strong><span>'+(state.profileName||'Guilherme')+'</span></div>';$('cloudStatus').innerHTML='<div class="row"><strong>Firebase</strong><span>Preparado / desligado</span></div><div class="row"><strong>Banco local</strong><span>localStorage</span></div><div class="row"><strong>GitHub Pages</strong><span>Compatível</span></div>';}
function renderSummary(){var m={};state.tx.forEach(function(t){m[t.month]=m[t.month]||{income:0,expense:0};t.type==='income'?m[t.month].income+=t.amount:m[t.month].expense+=t.amount;});$('summary').innerHTML=Object.keys(m).sort().reverse().map(function(k){return '<div class="row"><strong>'+k+'</strong><span>Receitas '+brl(m[k].income)+' • Despesas '+brl(m[k].expense)+'</span></div>';}).join('')||'<p>Sem resumo.</p>';}

function renderPremiumCenter(t,score,saving,cardPct){
  var el=$('premiumCenter'); if(!el)return;
  var status=score>=70?'Premium saudável':score>=45?'Atenção estratégica':'Plano de recuperação';
  var free=Math.max(0,t.balance);
  var investSuggestion=free*.35;
  el.innerHTML='<div class="mini-grid">'+
    '<div class="alert pulse"><span class="ai-tag">AI</span><strong>'+status+'</strong><p>Score atual: '+score+'</p></div>'+
    '<div class="alert"><strong>Potencial de investimento</strong><p>'+brl(investSuggestion)+'</p></div>'+
    '<div class="alert"><strong>Uso do cartão</strong><p>'+cardPct+'%</p></div>'+
    '<div class="alert"><strong>Economia mensal</strong><p>'+saving+'%</p></div>'+
  '</div>';
}
function renderDailyFlow(){
  var el=$('dailyFlow'); if(!el)return;
  var days={};
  currentTx().forEach(function(t){
    var day=(t.date||today()).slice(8,10);
    days[day]=days[day]||{income:0,expense:0};
    t.type==='income'?days[day].income+=t.amount:days[day].expense+=t.amount;
  });
  var keys=Object.keys(days).sort();
  var max=Math.max(1,...keys.map(function(k){return Math.abs(days[k].income-days[k].expense);}));
  el.innerHTML=keys.map(function(k){
    var saldo=days[k].income-days[k].expense;
    return '<small>Dia '+k+' — '+brl(saldo)+'</small><div class="bar"><span style="width:'+Math.round(Math.abs(saldo)/max*100)+'%"></span></div>';
  }).join('')||'<p>Sem fluxo diário neste mês.</p>';
}
function renderGoalInsights(){
  var el=$('goalInsights'); if(!el)return;
  el.innerHTML=state.goals.map(function(g){
    var pct=g.target?Math.min(100,Math.round(g.saved/g.target*100)):0;
    var falta=Math.max(0,g.target-g.saved);
    var meses=totals().balance>0?Math.ceil(falta/Math.max(1,totals().balance*.3)):'sem previsão';
    return '<div class="alert"><strong>'+g.name+'</strong><p>'+pct+'% concluída • falta '+brl(falta)+' • previsão: '+meses+' mês(es)</p><div class="progress"><span style="width:'+pct+'%"></span></div></div>';
  }).join('')||'<p>Nenhuma meta cadastrada.</p>';
}
function renderAnalytics(t,score){
  var el=$('analyticsSummary'); if(!el)return;
  var cat=criticalCategory();
  var reserve=t.expense?Math.floor(t.wallets/t.expense):0;
  el.innerHTML='<div class="mini-grid">'+
    '<div class="alert"><strong>Categoria crítica</strong><p>'+cat+'</p></div>'+
    '<div class="alert"><strong>Reserva atual</strong><p>'+reserve+' mês(es)</p></div>'+
    '<div class="alert"><strong>Score</strong><p>'+score+'</p></div>'+
    '<div class="alert"><strong>Patrimônio projetado</strong><p>'+brl(t.net+t.balance*12)+'</p></div>'+
  '</div>';
}
function renderCategoryRanking(){
  var el=$('categoryRanking'); if(!el)return;
  var c=categoryMap();
  var keys=Object.keys(c).sort(function(a,b){return c[b]-c[a];});
  el.innerHTML=keys.map(function(k,i){
    return '<div class="row"><strong><span class="rank-number">'+(i+1)+'</span>'+k+'</strong><span>'+brl(c[k])+'</span></div>';
  }).join('')||'<p>Sem categorias para ranquear.</p>';
}
function simulateFuture(){
  var monthly=Number($('futureMonthly').value||0);
  var years=Number($('futureYears').value||0);
  var rate=Number($('futureRate').value||0)/100;
  var total=totals().net;
  for(var i=0;i<years*12;i++)total=(total+monthly)*(1+rate);
  $('futureResult').textContent='Resultado projetado: '+brl(total);
}
function aiReport(){var t=totals(),s=t.income?Math.round(t.balance/t.income*100):0,cp=t.cardLimit?Math.round(t.cardUsed/t.cardLimit*100):0;return '<div class="alert"><strong>Relatório Finance AI</strong><p>Saldo mensal: '+brl(t.balance)+'<br>Taxa de economia: '+s+'%<br>Reserva ideal: '+brl(t.expense*6)+'<br>Uso do cartão: '+cp+'%<br>Assinaturas: '+brl(t.subTotal)+'<br>Categoria crítica: '+criticalCategory()+'<br><br>Recomendação: '+(t.balance>0?'direcione parte do saldo para metas e investimentos.':'reduza gastos variáveis antes de assumir novas parcelas.')+'</p></div>';}
function exportCsv(){var rows=['Mes,Data,Tipo,Categoria,Descricao,Valor,Recorrente'];state.tx.forEach(function(t){rows.push([t.month,t.date,t.type,t.category,'"'+t.description+'"',t.amount,!!t.recurring].join(','));});download('ramalho-finance-v17-premium.csv',rows.join('\n'),'text/csv');}
function download(name,content,type){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type:type}));a.download=name;a.click();}
function insertSample(){state.wallets=[{id:'w1',name:'Nubank',balance:1200},{id:'w2',name:'Dinheiro',balance:150}];state.tx=[{id:'t1',description:'Salário',amount:1800,type:'income',category:'Salário',recurring:true,month:month(),date:today()},{id:'t2',description:'Mercado',amount:430,type:'expense',category:'Alimentação',recurring:false,month:month(),date:today()},{id:'t3',description:'Transporte',amount:180,type:'expense',category:'Transporte',recurring:true,month:month(),date:today()}];state.cards=[{id:'c1',name:'Cartão principal',limit:2000,due:10}];state.goals=[{id:'g1',name:'Notebook',target:5000,saved:800}];state.investments=[{id:'i1',name:'Reserva CDB',amount:500,rate:.8}];state.budgets=[{id:'b1',category:'Alimentação',limit:600},{id:'b2',category:'Transporte',limit:250}];state.subscriptions=[{id:'s1',name:'Internet',value:99,category:'Assinaturas',due:10}];state.plan=[{id:'p1',title:'Guardar R$ 200 este mês',priority:'Alta',done:false}];state.customCategories=[{id:'cc1',name:'Freelance'}];}
try{render();}catch(e){showError(e);}
if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister();});});}
})();