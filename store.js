(function(){
'use strict';
window.RF = window.RF || {};
RF.$ = function(id){return document.getElementById(id);};
RF.brl = function(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});};
RF.month = function(){return new Date().toISOString().slice(0,7);};
RF.today = function(){return new Date().toISOString().slice(0,10);};
RF.safe = function(raw,fallback){try{return raw?JSON.parse(raw):fallback;}catch(e){return fallback;}};
RF.key = 'rf_v14_ultimate_modular_safe';
RF.state = RF.safe(localStorage.getItem(RF.key),{tx:[],wallets:[],cards:[],goals:[],investments:[],theme:'dark',sortTx:false});
RF.save = function(){localStorage.setItem(RF.key,JSON.stringify(RF.state));RF.render();};
RF.currentTx = function(){return RF.state.tx.filter(function(t){return t.month===RF.month();});};
RF.totals = function(){
 var tx=RF.currentTx();
 var income=tx.filter(function(t){return t.type==='income';}).reduce(function(s,t){return s+t.amount;},0);
 var expense=tx.filter(function(t){return t.type==='expense';}).reduce(function(s,t){return s+t.amount;},0);
 var wallets=RF.state.wallets.reduce(function(s,w){return s+w.balance;},0);
 var investments=RF.state.investments.reduce(function(s,i){return s+i.amount;},0);
 var cardUsed=tx.filter(function(t){return t.cardId;}).reduce(function(s,t){return s+t.amount;},0);
 var recurring=RF.state.tx.filter(function(t){return t.recurring;}).reduce(function(s,t){return s+t.amount;},0);
 return {income:income,expense:expense,balance:income-expense,wallets:wallets,investments:investments,cardUsed:cardUsed,recurring:recurring,net:wallets+investments+income-expense};
};
RF.showError=function(err){var b=RF.$('errorBox');if(b){b.classList.remove('hidden');b.textContent='Erro: '+(err.message||err);}};
RF.download=function(name,content,type){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type:type}));a.download=name;a.click();};
})();