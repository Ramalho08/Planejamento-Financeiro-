(function(){
'use strict';
window.RF=window.RF||{};

RF.addTx=function(){
 RF.state.tx.push({id:Date.now().toString(36),description:RF.$('txDescription').value||'Lançamento',amount:Number(RF.$('txAmount').value||0),type:RF.$('txType').value,category:RF.$('txCategory').value,due:RF.$('txDue').value,recurring:RF.$('txRecurring').checked,month:RF.month(),date:RF.today()});
 RF.$('txDescription').value='';RF.$('txAmount').value='';RF.$('txDue').value='';RF.$('txRecurring').checked=false;RF.save();
};

RF.addWallet=function(){
 RF.state.wallets.push({id:Date.now().toString(36),name:RF.$('walletName').value||'Carteira',balance:Number(RF.$('walletBalance').value||0)});
 RF.$('walletName').value='';RF.$('walletBalance').value='';RF.save();
};

RF.transfer=function(){
 var from=RF.state.wallets.find(function(w){return w.id===RF.$('fromWallet').value;});
 var to=RF.state.wallets.find(function(w){return w.id===RF.$('toWallet').value;});
 var amount=Number(RF.$('transferAmount').value||0);
 if(from&&to&&from.id!==to.id&&amount>0){from.balance-=amount;to.balance+=amount;RF.state.tx.push({id:Date.now().toString(36),description:'Transferência '+from.name+' → '+to.name,amount:amount,type:'expense',category:'Transferência',month:RF.month(),date:RF.today()});}
 RF.$('transferAmount').value='';RF.save();
};

RF.addCard=function(){
 RF.state.cards.push({id:Date.now().toString(36),name:RF.$('cardName').value||'Cartão',limit:Number(RF.$('cardLimit').value||0),due:Number(RF.$('cardDue').value||1)});
 RF.$('cardName').value='';RF.$('cardLimit').value='';RF.$('cardDue').value='';RF.save();
};

RF.addParcel=function(){
 var total=Number(RF.$('parcelTotal').value||0), count=Math.max(1,Number(RF.$('parcelCount').value||1));
 var card=RF.state.cards.find(function(c){return c.id===RF.$('parcelCard').value;});
 var part=total/count;
 for(var i=0;i<count;i++){var d=new Date();d.setMonth(d.getMonth()+i);RF.state.tx.push({id:Date.now().toString(36)+i,description:RF.$('parcelDesc').value||'Compra parcelada',amount:part,type:'expense',category:'Cartão',cardId:card?card.id:'',cardName:card?card.name:'',installment:(i+1)+'/'+count,month:d.toISOString().slice(0,7),date:d.toISOString().slice(0,10)});}
 RF.$('parcelDesc').value='';RF.$('parcelTotal').value='';RF.$('parcelCount').value='';RF.save();
};

RF.addGoal=function(){
 RF.state.goals.push({id:Date.now().toString(36),name:RF.$('goalName').value||'Meta',target:Number(RF.$('goalTarget').value||0),saved:Number(RF.$('goalSaved').value||0)});
 RF.$('goalName').value='';RF.$('goalTarget').value='';RF.$('goalSaved').value='';RF.save();
};

RF.addInvestment=function(){
 RF.state.investments.push({id:Date.now().toString(36),name:RF.$('investmentName').value||'Investimento',amount:Number(RF.$('investmentAmount').value||0),rate:Number(RF.$('investmentRate').value||0)});
 RF.$('investmentName').value='';RF.$('investmentAmount').value='';RF.$('investmentRate').value='';RF.save();
};

RF.insertSample=function(){
 RF.state.wallets=[{id:'w1',name:'Nubank',balance:1200},{id:'w2',name:'Dinheiro',balance:150}];
 RF.state.tx=[{id:'t1',description:'Salário',amount:1800,type:'income',category:'Trabalho',recurring:true,month:RF.month(),date:RF.today()},{id:'t2',description:'Mercado',amount:430,type:'expense',category:'Alimentação',recurring:false,month:RF.month(),date:RF.today()},{id:'t3',description:'Transporte',amount:180,type:'expense',category:'Transporte',recurring:true,month:RF.month(),date:RF.today()}];
 RF.state.cards=[{id:'c1',name:'Cartão principal',limit:2000,due:10}];
 RF.state.goals=[{id:'g1',name:'Notebook',target:5000,saved:800}];
 RF.state.investments=[{id:'i1',name:'Reserva CDB',amount:500,rate:0.8}];
 RF.save();
};

RF.exportCsv=function(){var rows=['Mes,Data,Tipo,Categoria,Descricao,Valor,Recorrente'];RF.state.tx.forEach(function(t){rows.push([t.month,t.date,t.type,t.category,'"'+t.description+'"',t.amount,!!t.recurring].join(','));});RF.download('ramalho-finance-v14.csv',rows.join('\n'),'text/csv');};
RF.backup=function(){RF.download('ramalho-finance-v14-backup.json',JSON.stringify(RF.state,null,2),'application/json');};
RF.restore=function(file){if(!file)return;var r=new FileReader();r.onload=function(){try{RF.state=JSON.parse(r.result);RF.save();}catch(err){RF.showError(err);}};r.readAsText(file);};
})();