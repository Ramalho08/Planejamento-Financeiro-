import{$}from"./utils.js";
import{store}from"./store.js";
import{initNavigation}from"./navigation.js";
import{renderDashboard}from"./dashboard.js";
import{initTransactions,renderTransactions}from"./transactions.js";
import{initWallets,renderWallets}from"./wallets.js";
import{initGoals,renderGoals}from"./goals.js";
import{initReports,renderReports}from"./reports.js";
import{renderAI}from"./ai.js";
import{renderCloud}from"./cloud.js";
import{renderArchitecture}from"./architecture.js";
import{initSettings,renderSettings}from"./settings.js";

function applyTheme(){
  document.body.classList.toggle("light",store.state.theme==="light");
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
  $("themeBtn").addEventListener("click",()=>{
    store.state.theme=store.state.theme==="light"?"dark":"light";
    store.emit();
  });
}
function init(){
  initNavigation();
  initTheme();
  initTransactions();
  initWallets();
  initGoals();
  initReports();
  initSettings();
  store.subscribe(renderAll);
  renderAll();
  console.log("Ramalho Finance Legacy Pro Alpha iniciado.");
}
init();
