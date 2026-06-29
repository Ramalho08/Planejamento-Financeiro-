(function(){
'use strict';
window.RF = window.RF || {};

RF.setPage=function(page){
 document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
 var el=RF.$(page); if(el)el.classList.add('active');
 document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');});
 var btn=document.querySelector('.tab[data-page="'+page+'"]'); if(btn)btn.classList.add('active');
 RF.$('menuSheet').classList.add('hidden');
 window.scrollTo(0,0);
};

RF.makeAlerts=function(t,saving){
 var arr=[];
 if(t.income===0)arr.push('💡 Cadastre sua renda mensal.');
 if(t.balance<0)arr.push('⚠️ Seu mês está negativo.');
 if(saving>=25)arr.push('🚀 Boa economia neste mês.');
 if(t.expense>t.income*.75&&t.income>0)arr.push('🚨 Mais de 75% da renda comprometida.');
 if(t.cardUsed>t.income*.5&&t.income>0)arr.push('💳 Cartões acima de 50% da renda.');
 if(!arr.length)arr.push('✅ Finanças equilibradas.');
 arr.push('🛡️ Reserva ideal: '+RF.brl(t.expense*6));
 return arr;
};

RF.render=function(){
 document.body.classList.toggle('light',RF.state.theme==='light');
 var t=RF.totals();
 var saving=t.income?Math.round((t.balance/t.income)*100):0;
 var score=Math.max(0,Math.min(100,50+saving-(t.balance<0?25:0)-(t.cardUsed>t.income*.5&&t.income>0?15:0)));
 RF.$('netWorth').textContent=RF.brl(t.net);
 RF.$('incomeTotal').textContent=RF.brl(t.income);
 RF.$('expenseTotal').textContent=RF.brl(t.expense);
 RF.$('balanceTotal').textContent=RF.brl(t.balance);
 RF.$('reserveTotal').textContent=RF.brl(t.expense*6);
 RF.$('walletTotal').textContent=RF.brl(t.wallets);
 RF.$('investmentTotal').textContent=RF.brl(t.investments);
 RF.$('cardUsedTotal').textContent=RF.brl(t.cardUsed);
 RF.$('recurringTotal').textContent=RF.brl(t.recurring);
 RF.$('score').textContent=score;
 RF.$('savingRate').textContent=saving+'%';
 RF.$('risk').textContent=score>=70?'Baixo':score>=45?'Médio':'Alto';
 var alerts=RF.makeAlerts(t,saving);
 RF.$('mainInsight').textContent=alerts[0];
 RF.$('alerts').innerHTML=alerts.map(function(a){return '<div class="alert">'+a+'</div>';}).join('');
 RF.renderBars(t);RF.renderCategories();RF.renderTransactions();RF.renderWallets();RF.renderCards();RF.renderCalendar();RF.renderGoals();RF.renderInvestments();RF.renderChecklist(t);RF.renderSummary();RF.renderMonthCompare();
};

RF.renderBars=function(t){
 var data=[['Receitas',t.income],['Despesas',t.expense],['Carteiras',t.wallets],['Investimentos',t.investments],['Cartões',t.cardUsed]];
 var max=Math.max(1,t.income,t.expense,t.wallets,t.investments,t.cardUsed);
 RF.$('bars').innerHTML=data.map(function(d){return '<small>'+d[0]+' — '+RF.brl(d[1])+'</small><div class="bar"><span style="width:'+Math.round((d[1]/max)*100)+'%"></span></div>';}).join('');
};

RF.renderCategories=function(){
 var cats={};
 RF.currentTx().filter(function(t){return t.type==='expense';}).forEach(function(t){cats[t.category]=(cats[t.category]||0)+t.amount;});
 var values=Object.values(cats),max=Math.max(1,...values);
 RF.$('categoryBars').innerHTML=Object.keys(cats).map(function(c){return '<small>'+c+' — '+RF.brl(cats[c])+'</small><div class="bar"><span style="width:'+Math.round((cats[c]/max)*100)+'%"></span></div>';}).join('')||'<p>Sem despesas por categoria.</p>';
};

RF.renderTransactions=function(){
 var q=(RF.$('searchTx').value||'').toLowerCase();
 var list=RF.currentTx().filter(function(t){return t.description.toLowerCase().includes(q);});
 if(RF.state.sortTx)list=list.sort(function(a,b){return b.amount-a.amount;});
 RF.$('transactionList').innerHTML=list.map(function(t){return '<div class="row"><div><strong>'+t.description+'</strong><small>'+t.category+(t.installment?' • '+t.installment:'')+(t.recurring?' • recorrente':'')+'</small></div><strong class="'+(t.type==='income'?'positive':'negative')+'">'+(t.type==='income'?'+':'-')+' '+RF.brl(t.amount)+'</strong></div>';}).join('')||'<p>Nenhum lançamento.</p>';
};

RF.renderWallets=function(){
 var opts=RF.state.wallets.map(function(w){return '<option value="'+w.id+'">'+w.name+'</option>';}).join('');
 RF.$('fromWallet').innerHTML=opts; RF.$('toWallet').innerHTML=opts;
 RF.$('walletList').innerHTML=RF.state.wallets.map(function(w){return '<div class="row"><strong>'+w.name+'</strong><span>'+RF.brl(w.balance)+'</span></div>';}).join('')||'<p>Nenhuma carteira.</p>';
};

RF.renderCards=function(){
 RF.$('parcelCard').innerHTML=RF.state.cards.map(function(c){return '<option value="'+c.id+'">'+c.name+'</option>';}).join('');
 RF.$('cardList').innerHTML=RF.state.cards.map(function(c){
  var used=RF.currentTx().filter(function(t){return t.cardId===c.id;}).reduce(function(s,t){return s+t.amount;},0);
  var pct=c.limit?Math.min(100,Math.round((used/c.limit)*100)):0;
  return '<div class="alert"><strong>'+c.name+'</strong><p>Usado '+RF.brl(used)+' de '+RF.brl(c.limit)+' • vence dia '+c.due+'</p><div class="progress"><span style="width:'+pct+'%"></span></div></div>';
 }).join('')||'<p>Nenhum cartão.</p>';
};

RF.renderCalendar=function(){
 var items=RF.state.tx.filter(function(t){return t.due;}).sort(function(a,b){return a.due.localeCompare(b.due);});
 RF.$('calendarList').innerHTML=items.map(function(t){return '<div class="row"><strong>'+t.description+'</strong><span>'+t.due+' • '+RF.brl(t.amount)+'</span></div>';}).join('')||'<p>Nenhum vencimento.</p>';
};

RF.renderGoals=function(){
 RF.$('goalList').innerHTML=RF.state.goals.map(function(g){var pct=g.target?Math.min(100,Math.round((g.saved/g.target)*100)):0;return '<div class="alert"><strong>'+g.name+'</strong><p>'+RF.brl(g.saved)+' de '+RF.brl(g.target)+' • '+pct+'%</p><div class="progress"><span style="width:'+pct+'%"></span></div></div>';}).join('')||'<p>Nenhuma meta.</p>';
};

RF.renderInvestments=function(){
 var future=RF.state.investments.reduce(function(s,i){return s+i.amount*Math.pow(1+(i.rate||0)/100,12);},0);
 RF.$('investmentList').innerHTML=(RF.state.investments.length?'<div class="alert"><strong>Projeção 12 meses:</strong> '+RF.brl(future)+'</div>':'')+RF.state.investments.map(function(i){return '<div class="row"><strong>'+i.name+'</strong><span>'+RF.brl(i.amount)+' • '+i.rate+'% mês</span></div>';}).join('')||'<p>Nenhum investimento.</p>';
};

RF.renderChecklist=function(t){
 var list=[(t.income?'✅':'⬜')+' Receita cadastrada',(t.expense?'✅':'⬜')+' Despesas monitoradas',(RF.state.wallets.length?'✅':'⬜')+' Carteira cadastrada',(RF.state.cards.length?'✅':'⬜')+' Cartão cadastrado',(RF.state.goals.length?'✅':'⬜')+' Meta ativa',(RF.state.investments.length?'✅':'⬜')+' Investimentos registrados',(t.balance>=0?'✅':'⚠️')+' Saldo mensal positivo'];
 RF.$('healthChecklist').innerHTML=list.map(function(x){return '<div class="alert">'+x+'</div>';}).join('');
};

RF.renderSummary=function(){
 var m={};RF.state.tx.forEach(function(t){m[t.month]=m[t.month]||{income:0,expense:0};t.type==='income'?m[t.month].income+=t.amount:m[t.month].expense+=t.amount;});
 RF.$('monthlySummary').innerHTML=Object.keys(m).sort().reverse().map(function(k){return '<div class="row"><strong>'+k+'</strong><span>Receitas '+RF.brl(m[k].income)+' • Despesas '+RF.brl(m[k].expense)+'</span></div>';}).join('')||'<p>Sem resumo.</p>';
};

RF.renderMonthCompare=function(){
 var m={};RF.state.tx.forEach(function(t){m[t.month]=m[t.month]||{income:0,expense:0};t.type==='income'?m[t.month].income+=t.amount:m[t.month].expense+=t.amount;});
 var keys=Object.keys(m).sort().slice(-4);
 var max=Math.max(1,...keys.map(function(k){return Math.abs(m[k].income-m[k].expense);}));
 RF.$('monthCompare').innerHTML=keys.map(function(k){var saldo=m[k].income-m[k].expense;return '<small>'+k+' — saldo '+RF.brl(saldo)+'</small><div class="bar"><span style="width:'+Math.round((Math.abs(saldo)/max)*100)+'%"></span></div>';}).join('')||'<p>Sem meses suficientes.</p>';
};
})();