(function(){
"use strict";

const RF = {};
const KEY = "rf_dashboard_pro_analytics_state";
const routes = ["dashboard","transactions","wallets","goals","reports","ai","cloud","architecture","settings"];
const categories = ["Salário","Alimentação","Transporte","Moradia","Saúde","Educação","Lazer","Cartão","Investimentos","Assinaturas","Pix","Outros"];

RF.$ = (id) => document.getElementById(id);
RF.money = (v) => Number(v || 0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
RF.today = () => new Date().toISOString().slice(0,10);
RF.month = () => new Date().toISOString().slice(0,7);
RF.id = () => (crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()+Math.random()));
RF.download = (filename, content, type="text/plain") => {
  const blob = new Blob([content],{type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

function defaultState(){
  return {theme:"dark",transactions:[],wallets:[],goals:[]};
}
RF.state = load();
function load(){
  try { return Object.assign(defaultState(), JSON.parse(localStorage.getItem(KEY) || "{}")); }
  catch { return defaultState(); }
}
function save(){
  localStorage.setItem(KEY, JSON.stringify(RF.state));
}
function emit(){
  save();
  renderAll();
}

function txMonth(){
  return RF.state.transactions.filter(x => String(x.date || "").slice(0,7) === RF.month());
}
function totals(){
  const tx = txMonth();
  const income = tx.filter(x=>x.type==="income").reduce((s,x)=>s+Number(x.amount||0),0);
  const expense = tx.filter(x=>x.type==="expense").reduce((s,x)=>s+Number(x.amount||0),0);
  const wallets = RF.state.wallets.reduce((s,x)=>s+Number(x.balance||0),0);
  return {income,expense,balance:income-expense,wallets,networth:wallets+income-expense};
}
function score(t){
  let s = 82;
  if(t.balance < 0) s -= 30;
  if(t.income && t.balance / t.income < .1) s -= 12;
  if(t.expense > t.income && t.income > 0) s -= 15;
  return Math.max(0, Math.min(100, Math.round(s)));
}

function showError(msg){
  let box = RF.$("navErrorBox");
  if(!box){
    box = document.createElement("div");
    box.id = "navErrorBox";
    box.className = "nav-error";
    document.body.appendChild(box);
  }
  box.textContent = msg;
  setTimeout(()=>box.remove(),3500);
}

function normalizeRoute(route){
  return routes.includes(route) ? route : "dashboard";
}
function openDrawer(){
  RF.$("drawer")?.classList.remove("hidden");
  RF.$("drawerBackdrop")?.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function closeDrawer(){
  RF.$("drawer")?.classList.add("hidden");
  RF.$("drawerBackdrop")?.classList.add("hidden");
  document.body.style.overflow = "";
}
function setPage(route){
  route = normalizeRoute(route);
  const page = RF.$(route);
  if(!page){
    showError("Página não encontrada. Voltando ao início.");
    route = "dashboard";
  }
  document.querySelectorAll(".page").forEach(p=>{
    const active = p.id === route;
    p.classList.toggle("active", active);
    p.hidden = !active;
  });
  document.querySelectorAll("[data-page]").forEach(btn=>{
    const active = btn.dataset.page === route;
    btn.classList.toggle("active", active);
    if(active) btn.setAttribute("aria-current","page");
    else btn.removeAttribute("aria-current");
  });
  document.body.dataset.route = route;
  closeDrawer();
  try{ localStorage.setItem("rf_bundle_last_route", route); }catch{}
  if(location.hash !== "#" + route) history.replaceState(null,"","#"+route);
  window.scrollTo({top:0,behavior:"smooth"});
}

function initNavigation(){
  document.addEventListener("click", (ev)=>{
    const btn = ev.target.closest("[data-page]");
    if(!btn) return;
    ev.preventDefault();
    setPage(btn.dataset.page);
  }, true);
  RF.$("menuBtn")?.addEventListener("click",(e)=>{e.preventDefault();openDrawer();});
  RF.$("closeDrawerBtn")?.addEventListener("click",(e)=>{e.preventDefault();closeDrawer();});
  RF.$("drawerBackdrop")?.addEventListener("click", closeDrawer);
  document.addEventListener("keydown",(e)=>{ if(e.key==="Escape") closeDrawer(); });
  window.addEventListener("hashchange",()=>setPage((location.hash||"#dashboard").slice(1)));
  const start = normalizeRoute((location.hash||"").slice(1) || localStorage.getItem("rf_bundle_last_route") || "dashboard");
  setPage(start);
}


function categoryTotals(){
  const cat = {};
  txMonth().filter(x=>x.type==="expense").forEach(x=>{
    const k = x.category || "Outros";
    cat[k] = (cat[k] || 0) + Number(x.amount || 0);
  });
  return Object.keys(cat).sort((a,b)=>cat[b]-cat[a]).map(k=>({category:k,total:cat[k]}));
}
function projectedMonthExpense(t){
  const day = Math.max(1, new Date().getDate());
  return (t.expense / day) * 30;
}
function renderDashboardAnalytics(){
  const box = RF.$("proAnalytics");
  const catsBox = RF.$("dashboardCategories");
  const topBox = RF.$("dashboardTopExpenses");
  if(!box && !catsBox && !topBox) return;

  const t = totals();
  const sc = score(t);
  const projected = projectedMonthExpense(t);
  const saving = t.income ? Math.round((t.balance / t.income) * 100) : 0;
  const daily = t.expense / Math.max(1, new Date().getDate());
  const level = sc >= 70 ? "Saudável" : sc >= 45 ? "Atenção" : "Crítico";
  const pressure = t.income ? Math.round((t.expense / t.income) * 100) : 0;

  if(box){
    box.innerHTML = `<div class="analytics-mini">
      <div class="analytics-card"><small>Score</small><div class="analytics-score">${sc}</div><b>${level}</b></div>
      <div class="analytics-card"><small>Gasto diário</small><h3>${RF.money(daily)}</h3></div>
      <div class="analytics-card"><small>Projeção 30 dias</small><h3>${RF.money(projected)}</h3></div>
      <div class="analytics-card"><small>Economia</small><h3>${saving}%</h3></div>
    </div>
    <div class="analytics-card">
      <div class="analytics-title"><b>Pressão de gastos</b><small>${pressure}% da renda</small></div>
      <div class="analytics-bar"><span style="width:${Math.min(100,pressure)}%"></span></div>
    </div>`;
  }

  const cats = categoryTotals();
  if(catsBox){
    catsBox.innerHTML = cats.map(x=>{
      const pct = t.expense ? Math.round((x.total/t.expense)*100) : 0;
      return `<div class="analytics-card">
        <div class="analytics-title"><b>${x.category}</b><small>${pct}%</small></div>
        <p>${RF.money(x.total)}</p>
        <div class="analytics-bar"><span style="width:${Math.min(100,pct)}%"></span></div>
      </div>`;
    }).join("") || `<div class="alert">Sem despesas por categoria neste mês.</div>`;
  }

  const top = txMonth().filter(x=>x.type==="expense").sort((a,b)=>b.amount-a.amount).slice(0,6);
  if(topBox){
    topBox.innerHTML = top.map((x,i)=>`
      <div class="row">
        <div><b>${i+1}. ${x.description}</b><small>${x.category} • ${x.date}</small></div>
        <span>${RF.money(x.amount)}</span>
      </div>
    `).join("") || `<div class="alert">Nenhuma despesa registrada neste mês.</div>`;
  }
}

function renderDashboard(){
  const t = totals(), sc = score(t);
  RF.$("incomeCard").textContent = RF.money(t.income);
  RF.$("expenseCard").textContent = RF.money(t.expense);
  RF.$("balanceCard").textContent = RF.money(t.balance);
  RF.$("networthCard").textContent = RF.money(t.networth);
  RF.$("heroScore").textContent = sc;
  RF.$("heroLabel").textContent = sc >= 70 ? "Saudável" : sc >= 45 ? "Atenção" : "Crítico";
  RF.$("smartSummary").innerHTML = `<div class="grid">
    <div class="alert"><b>Score</b><p>${sc}/100</p></div>
    <div class="alert"><b>Economia</b><p>${t.income?Math.round(t.balance/t.income*100):0}%</p></div>
    <div class="alert"><b>Carteiras</b><p>${RF.money(t.wallets)}</p></div>
    <div class="alert"><b>Lançamentos</b><p>${txMonth().length}</p></div>
  </div>`;
  renderDashboardAnalytics();
  RF.$("recentTransactions").innerHTML = txMonth().slice(0,6).map(x=>`
    <div class="row"><div><b>${x.description}</b><small>${x.category} • ${x.date}</small></div><span>${x.type==="income"?"+":"-"} ${RF.money(x.amount)}</span></div>
  `).join("") || `<div class="alert">Nenhum lançamento neste mês.</div>`;
}

function initTransactions(){
  RF.$("txCategory").innerHTML = categories.map(c=>`<option>${c}</option>`).join("");
  RF.$("txDate").value = RF.today();
  RF.$("addTxBtn").addEventListener("click",()=>{
    const description = RF.$("txDescription").value.trim();
    const amount = Number(RF.$("txAmount").value || 0);
    if(!description || amount <= 0) return alert("Preencha descrição e valor.");
    RF.state.transactions.unshift({
      id:RF.id(), description, amount,
      type:RF.$("txType").value,
      category:RF.$("txCategory").value,
      date:RF.$("txDate").value || RF.today()
    });
    RF.$("txDescription").value = "";
    RF.$("txAmount").value = "";
    emit();
  });
  RF.$("txSearch").addEventListener("input", renderTransactions);
  RF.$("txFilter").addEventListener("input", renderTransactions);
  document.addEventListener("click",(ev)=>{
    const btn = ev.target.closest("[data-del-tx]");
    if(btn){ RF.state.transactions = RF.state.transactions.filter(x=>x.id!==btn.dataset.delTx); emit(); }
  });
}
function renderTransactions(){
  const q = (RF.$("txSearch")?.value || "").toLowerCase();
  const f = RF.$("txFilter")?.value || "all";
  const arr = RF.state.transactions.filter(x=>(f==="all"||x.type===f) && String(x.description).toLowerCase().includes(q));
  RF.$("txList").innerHTML = arr.map(x=>`
    <div class="row"><div><b>${x.description}</b><small>${x.category} • ${x.date}</small></div><span>${x.type==="income"?"+":"-"} ${RF.money(x.amount)}</span><button data-del-tx="${x.id}" type="button">Excluir</button></div>
  `).join("") || `<div class="alert">Nenhum lançamento encontrado.</div>`;
}

function initWallets(){
  RF.$("addWalletBtn").addEventListener("click",()=>{
    const name = RF.$("walletName").value.trim();
    const balance = Number(RF.$("walletBalance").value || 0);
    if(!name) return alert("Informe o nome.");
    RF.state.wallets.unshift({id:RF.id(),name,balance});
    RF.$("walletName").value = "";
    RF.$("walletBalance").value = "";
    emit();
  });
  document.addEventListener("click",(ev)=>{
    const btn = ev.target.closest("[data-del-wallet]");
    if(btn){ RF.state.wallets = RF.state.wallets.filter(x=>x.id!==btn.dataset.delWallet); emit(); }
  });
}
function renderWallets(){
  RF.$("walletList").innerHTML = RF.state.wallets.map(x=>`
    <div class="row"><div><b>${x.name}</b><small>Carteira</small></div><span>${RF.money(x.balance)}</span><button data-del-wallet="${x.id}" type="button">Excluir</button></div>
  `).join("") || `<div class="alert">Nenhuma carteira cadastrada.</div>`;
}

function initGoals(){
  RF.$("addGoalBtn").addEventListener("click",()=>{
    const name = RF.$("goalName").value.trim();
    const target = Number(RF.$("goalTarget").value || 0);
    const saved = Number(RF.$("goalSaved").value || 0);
    if(!name || target <= 0) return alert("Preencha a meta.");
    RF.state.goals.unshift({id:RF.id(),name,target,saved});
    RF.$("goalName").value = "";
    RF.$("goalTarget").value = "";
    RF.$("goalSaved").value = "";
    emit();
  });
  document.addEventListener("click",(ev)=>{
    const btn = ev.target.closest("[data-del-goal]");
    if(btn){ RF.state.goals = RF.state.goals.filter(x=>x.id!==btn.dataset.delGoal); emit(); }
  });
}
function renderGoals(){
  RF.$("goalList").innerHTML = RF.state.goals.map(x=>{
    const pct = x.target ? Math.min(100, Math.round(x.saved/x.target*100)) : 0;
    return `<div class="alert"><b>${x.name}</b><p>${RF.money(x.saved)} de ${RF.money(x.target)} • ${pct}%</p><div class="progress"><span style="width:${pct}%"></span></div><button data-del-goal="${x.id}" type="button">Excluir</button></div>`;
  }).join("") || `<div class="alert">Nenhuma meta criada.</div>`;
}

function reportText(){
  const t = totals();
  const expenses = txMonth().filter(x=>x.type==="expense").sort((a,b)=>b.amount-a.amount);
  return ["Ramalho Finance - Relatório Pro","Mês: "+RF.month(),"Score: "+score(t),"Receitas: "+RF.money(t.income),"Despesas: "+RF.money(t.expense),"Saldo: "+RF.money(t.balance),"","Maiores gastos:",...expenses.slice(0,10).map((x,i)=>`${i+1}. ${x.description} - ${RF.money(x.amount)} - ${x.category}`)].join("\n");
}
function initReports(){
  RF.$("copyReportBtn").addEventListener("click",()=>navigator.clipboard?.writeText(reportText()).then(()=>alert("Relatório copiado.")));
  RF.$("exportTxtBtn").addEventListener("click",()=>RF.download("relatorio-ramalho-finance.txt",reportText()));
  RF.$("backupJsonBtn").addEventListener("click",()=>RF.download("backup-ramalho-finance.json",JSON.stringify(RF.state,null,2),"application/json"));
}
function renderReports(){
  const t = totals(), tx = txMonth(), expenses = tx.filter(x=>x.type==="expense"), cat = {};
  expenses.forEach(x=>cat[x.category]=(cat[x.category]||0)+Number(x.amount));
  RF.$("reportDiagnostic").innerHTML = `<div class="grid"><div class="alert"><b>Score</b><p>${score(t)}</p></div><div class="alert"><b>Receitas</b><p>${RF.money(t.income)}</p></div><div class="alert"><b>Despesas</b><p>${RF.money(t.expense)}</p></div><div class="alert"><b>Saldo</b><p>${RF.money(t.balance)}</p></div></div>`;
  RF.$("categoryReport").innerHTML = Object.keys(cat).sort((a,b)=>cat[b]-cat[a]).map(k=>{
    const pct = t.expense ? Math.round(cat[k]/t.expense*100) : 0;
    return `<div class="alert"><b>${k}</b><p>${RF.money(cat[k])} • ${pct}%</p><div class="progress"><span style="width:${pct}%"></span></div></div>`;
  }).join("") || `<div class="alert">Sem categorias.</div>`;
  const missing = RF.state.transactions.filter(x=>!x.description || x.category==="Outros").length;
  RF.$("dataQuality").innerHTML = `<div class="grid"><div class="alert"><b>Total histórico</b><p>${RF.state.transactions.length}</p></div><div class="alert"><b>Mês</b><p>${tx.length}</p></div><div class="alert ${missing?"warn":"good"}"><b>A revisar</b><p>${missing}</p></div><div class="alert good"><b>Status</b><p>OK</p></div></div>`;
}

function renderAI(){
  const t = totals(), sc = score(t), actions = [];
  if(t.balance < 0) actions.push("Reduzir despesas variáveis para recuperar o saldo.");
  if(t.income && t.balance/t.income < .1) actions.push("Tentar guardar pelo menos 10% da renda.");
  if(t.balance > 0) actions.push("Separar parte do saldo para reserva, metas ou investimentos.");
  if(!actions.length) actions.push("Manter rotina de revisão semanal.");
  RF.$("aiDiagnosis").innerHTML = `<div class="alert ${sc>=70?"good":sc>=45?"warn":"bad"}"><b>Score ${sc}/100</b><p>Receitas ${RF.money(t.income)}, despesas ${RF.money(t.expense)}, saldo ${RF.money(t.balance)}.</p></div>`;
  RF.$("aiActionPlan").innerHTML = actions.map((x,i)=>`<div class="alert"><b>Ação ${i+1}</b><p>${x}</p></div>`).join("");
  const high = txMonth().filter(x=>x.type==="expense" && x.amount>1000);
  RF.$("aiAlerts").innerHTML = high.length ? high.map(x=>`<div class="alert warn">Gasto alto: ${x.description} • ${RF.money(x.amount)}</div>`).join("") : `<div class="alert good">Nenhum alerta crítico detectado.</div>`;
}

function renderCloud(){
  RF.$("cloudChecklist").innerHTML = `<div class="alert"><b>1.</b> Criar projeto Firebase.</div><div class="alert"><b>2.</b> Ativar Login Google.</div><div class="alert"><b>3.</b> Criar Cloud Function.</div><div class="alert"><b>4.</b> Conectar OpenAI/Gemini no backend.</div><div class="alert"><b>5.</b> Testar upload de PDF isolado.</div>`;
}
function renderArchitecture(){
  const stages = ["Núcleo em bundle profissional","Navegação robusta validada","Estado centralizado","Dashboard, lançamentos, carteiras e metas","Relatórios e IA local","Cloud Ready preparado"];
  const mods = ["RF.Store","RF.Router","RF.Dashboard","RF.Transactions","RF.Wallets","RF.Goals","RF.Reports","RF.AI","RF.Cloud"];
  RF.$("doneStages").innerHTML = stages.map(x=>`<div class="alert good">${x}</div>`).join("");
  RF.$("moduleMap").innerHTML = mods.map(x=>`<div class="alert"><b>${x}</b><p>Módulo interno do bundle profissional.</p></div>`).join("");
}

function initSettings(){
  RF.$("demoBtn").addEventListener("click",()=>{
    RF.state.transactions = [
      {id:"1",description:"Salário",amount:2200,type:"income",category:"Salário",date:RF.today()},
      {id:"2",description:"Mercado",amount:280,type:"expense",category:"Alimentação",date:RF.today()},
      {id:"3",description:"Transporte",amount:90,type:"expense",category:"Transporte",date:RF.today()}
    ];
    RF.state.wallets = [{id:"w1",name:"Carteira principal",balance:650}];
    RF.state.goals = [{id:"g1",name:"Notebook",target:5000,saved:900}];
    emit();
  });
  RF.$("clearBtn").addEventListener("click",()=>{
    if(confirm("Limpar dados locais?")){
      localStorage.removeItem(KEY);
      location.reload();
    }
  });
}
function renderSettings(){
  RF.$("systemInfo").innerHTML = `<div class="alert"><b>Versão:</b> Dashboard Pro Analytics</div><div class="alert"><b>Armazenamento:</b> localStorage</div><div class="alert"><b>Pronto para:</b> Firebase, IA Cloud e PDF/OCR</div>`;
}

function applyTheme(){
  document.body.classList.toggle("light",RF.state.theme==="light");
}
function renderAll(){
  applyTheme();
  renderDashboard();
  renderTransactions();
  renderWallets();
  renderGoals();
  renderReports();
  renderAI();
  renderCloud();
  renderArchitecture();
  renderSettings();
}
function initTheme(){
  RF.$("themeBtn").addEventListener("click",()=>{
    RF.state.theme = RF.state.theme === "light" ? "dark" : "light";
    emit();
  });
}
function init(){
  try{
    initNavigation();
    initTheme();
    initTransactions();
    initWallets();
    initGoals();
    initReports();
    initSettings();
    renderAll();
    window.RF = RF;
    console.log("Ramalho Finance Dashboard Pro Analytics iniciado.");
  }catch(err){
    console.error(err);
    showError("Erro ao iniciar: "+err.message);
  }
}
document.addEventListener("DOMContentLoaded", init);
})();