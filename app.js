(function(){
'use strict';
try{
 document.querySelectorAll('.tab,.sheet-link').forEach(function(btn){btn.addEventListener('click',function(){if(btn.dataset.page)RF.setPage(btn.dataset.page);});});
 RF.$('themeBtn').addEventListener('click',function(){RF.state.theme=RF.state.theme==='dark'?'light':'dark';RF.save();});
 RF.$('menuBtn').addEventListener('click',function(){RF.$('menuSheet').classList.toggle('hidden');});
 RF.$('addTxBtn').addEventListener('click',RF.addTx);
 RF.$('searchTx').addEventListener('input',RF.renderTransactions);
 RF.$('sortTxBtn').addEventListener('click',function(){RF.state.sortTx=!RF.state.sortTx;RF.save();});
 RF.$('addWalletBtn').addEventListener('click',RF.addWallet);
 RF.$('transferBtn').addEventListener('click',RF.transfer);
 RF.$('addCardBtn').addEventListener('click',RF.addCard);
 RF.$('addParcelBtn').addEventListener('click',RF.addParcel);
 RF.$('addGoalBtn').addEventListener('click',RF.addGoal);
 RF.$('simulateGoalBtn').addEventListener('click',function(){var g=RF.state.goals[0],monthly=Number(RF.$('monthlySave').value||0);RF.$('goalSimulation').textContent=g&&monthly>0?'Guardando '+RF.brl(monthly)+' por mês, você alcança "'+g.name+'" em '+Math.ceil((g.target-g.saved)/monthly)+' mês(es).':'Crie uma meta e informe um valor mensal.';});
 RF.$('addInvestmentBtn').addEventListener('click',RF.addInvestment);
 RF.$('simulateWealthBtn').addEventListener('click',function(){var total=RF.state.investments.reduce(function(s,i){return s+i.amount;},0);var months=Number(RF.$('wealthYears').value||0)*12,aporte=Number(RF.$('wealthMonthly').value||0);for(var i=0;i<months;i++)total=(total+aporte)*1.008;RF.$('wealthSimulation').textContent='Patrimônio estimado: '+RF.brl(total);});
 RF.$('generatePlanBtn').addEventListener('click',function(){var t=RF.totals();RF.$('assistantPlan').innerHTML='<div class="alert"><strong>Plano inteligente do mês</strong><p>1. Priorize despesas essenciais.<br>2. Tente guardar '+RF.brl(Math.max(0,t.balance*.3))+'.<br>3. Sua reserva ideal é '+RF.brl(t.expense*6)+'.<br>4. Revise categorias com maiores gastos.<br>5. Evite parcelamentos acima da sua renda mensal.</p></div>';});
 RF.$('sampleBtn').addEventListener('click',RF.insertSample);
 RF.$('exportCsvBtn').addEventListener('click',RF.exportCsv);
 RF.$('backupBtn').addEventListener('click',RF.backup);
 RF.$('restoreInput').addEventListener('change',function(e){RF.restore(e.target.files[0]);});
 RF.$('printBtn').addEventListener('click',function(){window.print();});
 RF.$('clearBtn').addEventListener('click',function(){if(confirm('Apagar todos os dados?')){localStorage.removeItem(RF.key);location.reload();}});
 RF.render();
 if('serviceWorker' in navigator){navigator.serviceWorker.register('./service-worker.js').catch(function(){});}
}catch(err){RF.showError(err);}
})();