const STORAGE_KEY = 'ramalhoFinanceV3';
const BRL = new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' });
const currentMonth = () => new Date().toISOString().slice(0,7);

const defaultData = { activeMonth: currentMonth(), months: {}, recurring: [], goal: { name:'', amount:0 }, theme:'dark' };
let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultData;

function ensureMonth(month = state.activeMonth){
  if(!state.months[month]) state.months[month] = { transactions: [] };
}
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); render(); }
function monthTransactions(){ ensureMonth(); return state.months[state.activeMonth].transactions; }
function uid(){ return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()+Math.random()); }

function applyRecurring(){
  ensureMonth();
  const txs = monthTransactions();
  state.recurring.forEach(item => {
    const exists = txs.some(t => t.recurringId === item.id);
    if(!exists){ txs.push({ ...item, id: uid(), recurringId: item.id, date: new Date().toLocaleDateString('pt-BR') }); }
  });
}

function totals(transactions = monthTransactions()){
  const income = transactions.filter(t=>t.type==='income').reduce((a,t)=>a+t.amount,0);
  const expense = transactions.filter(t=>t.type==='expense').reduce((a,t)=>a+t.amount,0);
  return { income, expense, balance: income-expense, savingRate: income ? ((income-expense)/income)*100 : 0 };
}

function addTransaction(e){
  e.preventDefault(); ensureMonth();
  const transaction = {
    id: uid(), description: description.value.trim(), amount: Number(amount.value),
    type: type.value, category: category.value, date: new Date().toLocaleDateString('pt-BR')
  };
  if(!transaction.description || !transaction.amount) return;
  monthTransactions().push(transaction);
  if(recurring.checked){ state.recurring.push({ ...transaction, id: uid() }); }
  e.target.reset(); save();
}

function deleteTransaction(id){ state.months[state.activeMonth].transactions = monthTransactions().filter(t=>t.id!==id); save(); }
function saveGoal(){ state.goal = { name: goalName.value.trim(), amount: Number(goalAmount.value) || 0 }; save(); }
function closeMonth(){
  const [y,m] = state.activeMonth.split('-').map(Number);
  const next = m === 12 ? `${y+1}-01` : `${y}-${String(m+1).padStart(2,'0')}`;
  state.activeMonth = next; ensureMonth(); applyRecurring(); save();
}
function toggleTheme(){ document.body.classList.toggle('light'); state.theme = document.body.classList.contains('light') ? 'light' : 'dark'; localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function exportCSV(){
  const header = 'Data,Descricao,Categoria,Tipo,Valor\n';
  const rows = monthTransactions().map(t => `${t.date},${t.description},${t.category},${t.type},${t.amount}`).join('\n');
  downloadFile(`ramalho-finance-${state.activeMonth}.csv`, header + rows, 'text/csv');
}
function backupJSON(){ downloadFile('ramalho-finance-backup.json', JSON.stringify(state,null,2), 'application/json'); }
function restoreJSON(e){
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = () => { try { state = JSON.parse(reader.result); save(); } catch { alert('Backup inválido.'); } };
  reader.readAsText(file);
}
function downloadFile(name, content, type){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([content],{type})); a.download=name; a.click(); }

let categoryChart, monthChart;
function renderCharts(){
  const txs = monthTransactions();
  const byCat = {};
  txs.filter(t=>t.type==='expense').forEach(t=> byCat[t.category]=(byCat[t.category]||0)+t.amount);
  if(categoryChart) categoryChart.destroy();
  categoryChart = new Chart(document.getElementById('categoryChart'), { type:'doughnut', data:{ labels:Object.keys(byCat), datasets:[{ data:Object.values(byCat) }] } });

  const labels = Object.keys(state.months).sort();
  const balances = labels.map(m => totals(state.months[m].transactions).balance);
  if(monthChart) monthChart.destroy();
  monthChart = new Chart(document.getElementById('monthChart'), { type:'line', data:{ labels, datasets:[{ label:'Saldo', data:balances, tension:.35 }] } });
}

function renderInsight(t){
  if(t.balance < 0) return '⚠️ Seus gastos ultrapassaram suas receitas neste mês.';
  if(state.goal.amount && t.balance >= state.goal.amount) return '🎉 Você já alcançou a meta financeira cadastrada.';
  if(t.savingRate >= 30) return '🚀 Excelente! Você está economizando mais de 30% da renda.';
  if(t.expense > t.income * .8) return '📉 Atenção: suas despesas passaram de 80% das receitas.';
  return '✅ Sua situação está positiva. Continue acompanhando seus gastos.';
}

function render(){
  ensureMonth(); applyTheme();
  const t = totals();
  incomeTotal.textContent = BRL.format(t.income); expenseTotal.textContent = BRL.format(t.expense);
  balanceTotal.textContent = BRL.format(t.balance); savingRate.textContent = `${Math.max(0,t.savingRate).toFixed(0)}%`;
  goalName.value = state.goal.name || ''; goalAmount.value = state.goal.amount || '';
  const gp = state.goal.amount ? Math.min(100, Math.max(0, (t.balance/state.goal.amount)*100)) : 0;
  goalLabel.textContent = state.goal.name ? state.goal.name : 'Sem meta definida'; goalPercent.textContent = `${gp.toFixed(0)}%`; goalBar.style.width = `${gp}%`;
  smartInsight.textContent = renderInsight(t);

  transactionTable.innerHTML = monthTransactions().map(tx => `<tr><td>${tx.date}</td><td>${tx.description}</td><td>${tx.category}</td><td>${tx.type === 'income' ? 'Receita' : 'Despesa'}</td><td class="${tx.type}">${BRL.format(tx.amount)}</td><td><button class="ghost" onclick="deleteTransaction('${tx.id}')">Excluir</button></td></tr>`).join('') || '<tr><td colspan="6">Nenhuma movimentação cadastrada.</td></tr>';

  historyList.innerHTML = Object.keys(state.months).sort().reverse().map(month => {
    const mt = totals(state.months[month].transactions);
    return `<div class="history-card"><strong>${month}</strong><p>Receitas: ${BRL.format(mt.income)}</p><p>Despesas: ${BRL.format(mt.expense)}</p><p>Saldo: ${BRL.format(mt.balance)}</p></div>`;
  }).join('');
  renderCharts();
}
function applyTheme(){ document.body.classList.toggle('light', state.theme === 'light'); }

transactionForm.addEventListener('submit', addTransaction);
saveGoal.addEventListener('click', saveGoal);
newMonthBtn.addEventListener('click', closeMonth);
themeToggle.addEventListener('click', toggleTheme);
exportCsv.addEventListener('click', exportCSV);
backupJson.addEventListener('click', backupJSON);
restoreJson.addEventListener('change', restoreJSON);
if('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
ensureMonth(); applyRecurring(); render();
