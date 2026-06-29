(function(){
'use strict';
function $(id){return document.getElementById(id);}
function brl(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function month(){return new Date().toISOString().slice(0,7);}
function today(){return new Date().toISOString().slice(0,10);}
function safe(raw,fallback){try{return raw?JSON.parse(raw):fallback;}catch(e){return fallback;}}
function showError(err){var b=$('errorBox');if(b){b.classList.remove('hidden');b.textContent='Erro: '+(err.message||err);}}

var KEY='rf_v14_2_force_update';
var state=safe(localStorage.getItem(KEY),{tx:[],wallets:[],cards:[],goals:[],investments:[],theme:'dark',sortTx:false});

function save(){localStorage.setItem(KEY,JSON.stringify(state));render();}
function currentTx(){return state.tx.filter(function(t){return t.month===month();});}
function totals(){
 var tx=currentTx();
 var income=tx.filter(function(t){return t.type==='income';}).reduce(function(s,t){return s+t.amount;},0);
 var expense=tx.filter(function(t){return t.type==='expense';}).reduce(function(s,t){return s+t.amount;},0);
 var wallets=state.wallets.reduce(function(s,w){return s+w.balance;},0);
 var investments=state.investments.reduce(function(s,i){return s+i.amount;},0);
 var cardUsed=tx.filter(function(t){return t.cardId;}).reduce(function(s,t){return s+t.amount;},0);
 var recurring=state.tx.filter(function(t){return t.recurring;}).reduce(function(s,t){return s+t.amount;},0);
 return {income:income,expense:expense,balance:income-expense,wallets:wallets,investments:investments,cardUsed:cardUsed,recurring:recurring,net:wallets+investments+income-expense};
}
function setPage(page){
 document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
 var el=$(page); if(el)el.classList.add('active');
 document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');});
 var btn=document.querySelector('.tab[data-page="'+page+'"]'); if(btn)btn.classList.add('active');
 $('menuSheet').classList.add('hidden'); window.scrollTo(0,0);
}
document.querySelectorAll('.tab,.sheet-link').forEach(function(btn){btn.addEventListener('click',function(){if(btn.dataset.page)setPage(btn.dataset.page);});});

$('themeBtn').addEventListener('click',function(){state.theme=state.theme==='dark'?'light':'dark';save();});
$('menuBtn').addEventListener('click',function(){$('menuSheet').classList.toggle('hidden');});

$('addTxBtn').addEventListener('click',function(){
 state.tx.push({id:Date.now().toString(36),description:$('txDescription').value||'Lançamento',amount:Number($('txAmount').value||0),type:$('txType').value,category:$('txCategory').value,due:$('txDue').value,recurring:$('txRecurring').checked,month:month(),date:today()});
 $('txDescription').value='';$('txAmount').value='';$('txDue').value='';$('txRecurring').checked=false;save();
});
$('searchTx').addEventListener('input',renderTransactions);
$('sortTxBtn').addEventListener('click',function(){state.sortTx=!state.sortTx;save();});

$('addWalletBtn').addEventListener('click',function(){state.wallets.push({id:Date.now().toString(36),name:$('walletName').value||'Carteira',balance:Number($('walletBalance').value||0)});$('walletName').value='';$('walletBalance').value='';save();});
$('transferBtn').addEventListener('click',function(){
 var from=state.wallets.find(function(w){return w.id===$('fromWallet').value;});
 var to=state.wallets.find(function(w){return w.id===$('toWallet').value;});
 var amount=Number($('transferAmount').value||0);
 if(from&&to&&from.id!==to.id&&amount>0){from.balance-=amount;to.balance+=amount;state.tx.push({id:Date.now().toString(36),description:'Transferência '+from.name+' → '+to.name,amount:amount,type:'expense',category:'Transferência',month:month(),date:today()});}
 $('transferAmount').value='';save();
});
$('addCardBtn').addEventListener('click',function(){state.cards.push({id:Date.now().toString(36),name:$('cardName').value||'Cartão',limit:Number($('cardLimit').value||0),due:Number($('cardDue').value||1)});$('cardName').value='';$('cardLimit').value='';$('cardDue').value='';save();});
$('addParcelBtn').addEventListener('click',function(){
 var total=Number($('parcelTotal').value||0),count=Math.max(1,Number($('parcelCount').value||1));var card=state.cards.find(function(c){return c.id===$('parcelCard').value;});var part=total/count;
 for(var i=0;i<count;i++){var d=new Date();d.setMonth(d.getMonth()+i);state.tx.push({id:Date.now().toString(36)+i,description:$('parcelDesc').value||'Compra parcelada',amount:part,type:'expense',category:'Cartão',cardId:card?card.id:'',cardName:card?card.name:'',installment:(i+1)+'/'+count,month:d.toISOString().slice(0,7),date:d.toISOString().slice(0,10)});}
 $('parcelDesc').value='';$('parcelTotal').value='';$('parcelCount').value='';save();
});
$('addGoalBtn').addEventListener('click',function(){state.goals.push({id:Date.now().toString(36),name:$('goalName').value||'Meta',target:Number($('goalTarget').value||0),saved:Number($('goalSaved').value||0)});$('goalName').value='';$('goalTarget').value='';$('goalSaved').value='';save();});
$('simulateGoalBtn').addEventListener('click',function(){var g=state.goals[0],monthly=Number($('monthlySave').value||0);$('goalSimulation').textContent=g&&monthly>0?'Guardando '+brl(monthly)+' por mês, você alcança "'+g.name+'" em '+Math.ceil((g.target-g.saved)/monthly)+' mês(es).':'Crie uma meta e informe um valor mensal.';});
$('addInvestmentBtn').addEventListener('click',function(){state.investments.push({id:Date.now().toString(36),name:$('investmentName').value||'Investimento',amount:Number($('investmentAmount').value||0),rate:Number($('investmentRate').value||0)});$('investmentName').value='';$('investmentAmount').value='';$('investmentRate').value='';save();});
$('simulateWealthBtn').addEventListener('click',function(){var total=state.investments.reduce(function(s,i){return s+i.amount;},0);var months=Number($('wealthYears').value||0)*12,aporte=Number($('wealthMonthly').value||0);for(var i=0;i<months;i++)total=(total+aporte)*1.008;$('wealthSimulation').textContent='Patrimônio estimado: '+brl(total);});
$('generatePlanBtn').addEventListener('click',function(){var t=totals();$('assistantPlan').innerHTML='<div class="alert"><strong>Plano inteligente do mês</strong><p>1. Priorize despesas essenciais.<br>2. Tente guardar '+brl(Math.max(0,t.balance*.3))+'.<br>3. Sua reserva ideal é '+brl(t.expense*6)+'.<br>4. Revise categorias com maiores gastos.<br>5. Evite parcelamentos acima da sua renda mensal.</p></div>';});
$('sampleBtn').addEventListener('click',function(){insertSample();save();});
$('exportCsvBtn').addEventListener('click',function(){var rows=['Mes,Data,Tipo,Categoria,Descricao,Valor,Recorrente'];state.tx.forEach(function(t){rows.push([t.month,t.date,t.type,t.category,'"'+t.description+'"',t.amount,!!t.recurring].join(','));});download('ramalho-finance-v14-2.csv',rows.join('\\n'),'text/csv');});
$('backupBtn').addEventListener('click',function(){download('ramalho-finance-v14-2-backup.json',JSON.stringify(state,null,2),'application/json');});
$('restoreInput').addEventListener('change',function(e){var file=e.target.files[0];if(!file)return;var r=new FileReader();r.onload=function(){try{state=JSON.parse(r.result);save();}catch(err){showError(err);}};r.readAsText(file);});
$('printBtn').addEventListener('click',function(){window.print();});
$('resetAppBtn').addEventListener('click',function(){if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(regs){regs.forEach(function(r){r.unregister();});localStorage.setItem('rf_force_refresh','v14.2');alert('Atualização local forçada. Reabra o site.');});}else{alert('Atualize a página agora.');}});
$('clearBtn').addEventListener('click',function(){if(confirm('Apagar todos os dados?')){localStorage.removeItem(KEY);location.reload();}});

function download(name,content,type){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type:type}));a.download=name;a.click();}
function render(){
 document.body.classList.toggle('light',state.theme==='light');
 var t=totals();var saving=t.income?Math.round((t.balance/t.income)*100):0;var score=Math.max(0,Math.min(100,50+saving-(t.balance<0?25:0)-(t.cardUsed>t.income*.5&&t.income>0?15:0)));
 $('netWorth').textContent=brl(t.net);$('incomeTotal').textContent=brl(t.income);$('expenseTotal').textContent=brl(t.expense);$('balanceTotal').textContent=brl(t.balance);$('reserveTotal').textContent=brl(t.expense*6);$('walletTotal').textContent=brl(t.wallets);$('investmentTotal').textContent=brl(t.investments);$('cardUsedTotal').textContent=brl(t.cardUsed);$('recurringTotal').textContent=brl(t.recurring);$('score').textContent=score;$('savingRate').textContent=saving+'%';$('risk').textContent=score>=70?'Baixo':score>=45?'Médio':'Alto';
 var alerts=makeAlerts(t,saving);$('mainInsight').textContent=alerts[0];$('alerts').innerHTML=alerts.map(function(a){return '<div class="alert">'+a+'</div>';}).join('');
 $('smartResume').innerHTML='<div class="row"><strong>Saldo mensal</strong><span class="'+(t.balance>=0?'positive':'negative')+'">'+brl(t.balance)+'</span></div><div class="row"><strong>Previsão 12 meses</strong><span class="gold">'+brl(t.net+(t.balance*12))+'</span></div><div class="row"><strong>Saúde financeira</strong><span>'+ (score>=70?'Boa':score>=45?'Atenção':'Crítica') +'</span></div>';
 renderBars(t);renderCategories();renderTransactions();renderWallets();renderCards();renderCalendar();renderGoals();renderInvestments();renderChecklist(t);renderSummary();
}
function makeAlerts(t,saving){var arr=[];if(t.income===0)arr.push('💡 Cadastre sua renda mensal.');if(t.balance<0)arr.push('⚠️ Seu mês está negativo.');if(saving>=25)arr.push('🚀 Boa economia neste mês.');if(t.expense>t.income*.75&&t.income>0)arr.push('🚨 Mais de 75% da renda comprometida.');if(t.cardUsed>t.income*.5&&t.income>0)arr.push('💳 Cartões acima de 50% da renda.');if(!arr.length)arr.push('✅ Finanças equilibradas.');arr.push('🛡️ Reserva ideal: '+brl(t.expense*6));return arr;}
function renderBars(t){var data=[['Receitas',t.income],['Despesas',t.expense],['Carteiras',t.wallets],['Investimentos',t.investments],['Cartões',t.cardUsed]];var max=Math.max(1,t.income,t.expense,t.wallets,t.investments,t.cardUsed);$('bars').innerHTML=data.map(function(d){return '<small>'+d[0]+' — '+brl(d[1])+'</small><div class="bar"><span style="width:'+Math.round((d[1]/max)*100)+'%"></span></div>';}).join('');}
function renderCategories(){var cats={};currentTx().filter(function(t){return t.type==='expense';}).forEach(function(t){cats[t.category]=(cats[t.category]||0)+t.amount;});var values=Object.values(cats),max=Math.max(1,...values);$('categoryBars').innerHTML=Object.keys(cats).map(function(c){return '<small>'+c+' — '+brl(cats[c])+'</small><div class="bar"><span style="width:'+Math.round((cats[c]/max)*100)+'%"></span></div>';}).join('')||'<p>Sem despesas por categoria.</p>';}
function renderTransactions(){var q=($('searchTx').value||'').toLowerCase();var list=currentTx().filter(function(t){return t.description.toLowerCase().includes(q);});if(state.sortTx)list=list.sort(function(a,b){return b.amount-a.amount;});$('transactionList').innerHTML=list.map(function(t){return '<div class="row"><div><strong>'+t.description+'</strong><small>'+t.category+(t.installment?' • '+t.installment:'')+(t.recurring?' • recorrente':'')+'</small></div><strong class="'+(t.type==='income'?'positive':'negative')+'">'+(t.type==='income'?'+':'-')+' '+brl(t.amount)+'</strong></div>';}).join('')||'<p>Nenhum lançamento.</p>';}
function renderWallets(){var opts=state.wallets.map(function(w){return '<option value="'+w.id+'">'+w.name+'</option>';}).join('');$('fromWallet').innerHTML=opts;$('toWallet').innerHTML=opts;$('walletList').innerHTML=state.wallets.map(function(w){return '<div class="row"><strong>'+w.name+'</strong><span>'+brl(w.balance)+'</span></div>';}).join('')||'<p>Nenhuma carteira.</p>';}
function renderCards(){$('parcelCard').innerHTML=state.cards.map(function(c){return '<option value="'+c.id+'">'+c.name+'</option>';}).join('');$('cardList').innerHTML=state.cards.map(function(c){var used=currentTx().filter(function(t){return t.cardId===c.id;}).reduce(function(s,t){return s+t.amount;},0);var pct=c.limit?Math.min(100,Math.round((used/c.limit)*100)):0;return '<div class="alert"><strong>'+c.name+'</strong><p>Usado '+brl(used)+' de '+brl(c.limit)+' • vence dia '+c.due+'</p><div class="progress"><span style="width:'+pct+'%"></span></div></div>';}).join('')||'<p>Nenhum cartão.</p>';}
function renderCalendar(){var items=state.tx.filter(function(t){return t.due;}).sort(function(a,b){return a.due.localeCompare(b.due);});$('calendarList').innerHTML=items.map(function(t){return '<div class="row"><strong>'+t.description+'</strong><span>'+t.due+' • '+brl(t.amount)+'</span></div>';}).join('')||'<p>Nenhum vencimento.</p>';}
function renderGoals(){$('goalList').innerHTML=state.goals.map(function(g){var pct=g.target?Math.min(100,Math.round((g.saved/g.target)*100)):0;return '<div class="alert"><strong>'+g.name+'</strong><p>'+brl(g.saved)+' de '+brl(g.target)+' • '+pct+'%</p><div class="progress"><span style="width:'+pct+'%"></span></div></div>';}).join('')||'<p>Nenhuma meta.</p>';}
function renderInvestments(){var future=state.investments.reduce(function(s,i){return s+i.amount*Math.pow(1+(i.rate||0)/100,12);},0);$('investmentList').innerHTML=(state.investments.length?'<div class="alert"><strong>Projeção 12 meses:</strong> '+brl(future)+'</div>':'')+state.investments.map(function(i){return '<div class="row"><strong>'+i.name+'</strong><span>'+brl(i.amount)+' • '+i.rate+'% mês</span></div>';}).join('')||'<p>Nenhum investimento.</p>';}
function renderChecklist(t){var list=[(t.income?'✅':'⬜')+' Receita cadastrada',(t.expense?'✅':'⬜')+' Despesas monitoradas',(state.wallets.length?'✅':'⬜')+' Carteira cadastrada',(state.cards.length?'✅':'⬜')+' Cartão cadastrado',(state.goals.length?'✅':'⬜')+' Meta ativa',(state.investments.length?'✅':'⬜')+' Investimentos registrados',(t.balance>=0?'✅':'⚠️')+' Saldo mensal positivo'];$('healthChecklist').innerHTML=list.map(function(x){return '<div class="alert">'+x+'</div>';}).join('');}
function renderSummary(){var m={};state.tx.forEach(function(t){m[t.month]=m[t.month]||{income:0,expense:0};t.type==='income'?m[t.month].income+=t.amount:m[t.month].expense+=t.amount;});$('monthlySummary').innerHTML=Object.keys(m).sort().reverse().map(function(k){return '<div class="row"><strong>'+k+'</strong><span>Receitas '+brl(m[k].income)+' • Despesas '+brl(m[k].expense)+'</span></div>';}).join('')||'<p>Sem resumo.</p>';}
function insertSample(){state.wallets=[{id:'w1',name:'Nubank',balance:1200},{id:'w2',name:'Dinheiro',balance:150}];state.tx=[{id:'t1',description:'Salário',amount:1800,type:'income',category:'Trabalho',recurring:true,month:month(),date:today()},{id:'t2',description:'Mercado',amount:430,type:'expense',category:'Alimentação',recurring:false,month:month(),date:today()},{id:'t3',description:'Transporte',amount:180,type:'expense',category:'Transporte',recurring:true,month:month(),date:today()}];state.cards=[{id:'c1',name:'Cartão principal',limit:2000,due:10}];state.goals=[{id:'g1',name:'Notebook',target:5000,saved:800}];state.investments=[{id:'i1',name:'Reserva CDB',amount:500,rate:0.8}];}
try{render();}catch(err){showError(err);}
if('serviceWorker' in navigator){navigator.serviceWorker.register('./service-worker-'+v142_force_2026+'.js').catch(function(){});}
})();