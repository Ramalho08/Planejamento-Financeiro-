# Arquitetura UI/UX - Dashboard e Interfaces

## 🎨 Princípios de Design

### Design System
- **Paleta de Cores**: Cores que transmitem confiança e segurança financeira
- **Tipografia**: Hierarquia clara e legibilidade em todos os tamanhos
- **Espaçamento**: Consistência visual com grid 8px
- **Componentes Reutilizáveis**: Biblioteca de componentes padronizada

### Cores Principais
```
Primária (Confiança):     #0066CC (Azul)
Secundária (Ação):        #00CC99 (Verde Esmeralda)
Destaque (Alerta):        #FF6B6B (Vermelho)
Sucesso:                  #2ECC71 (Verde)
Aviso:                    #FFA500 (Laranja)
Neutro:                   #F0F2F5 (Cinza Claro)
Texto Principal:          #1A1A1A (Quase Preto)
Texto Secundário:         #666666 (Cinza Médio)
```

---

## 📱 Estrutura Responsiva

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE (< 768px)                         │
│                                                             │
│  Navegação: Bottom Tab Bar                                 │
│  Layout: Full width, stacked vertically                    │
│  Gráficos: Reduzidos, otimizados para toque                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              TABLET (768px - 1024px)                        │
│                                                             │
│  Navegação: Sidebar colapsável                             │
│  Layout: 2-3 colunas                                       │
│  Gráficos: Médios, interativos                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│             DESKTOP (> 1024px)                              │
│                                                             │
│  Navegação: Sidebar permanente + Top Bar                   │
│  Layout: Multi-colunas, modular                            │
│  Gráficos: Completos, com múltiplas dimensões             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏠 Dashboard Principal

### Layout Desktop (1440px)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          HEADER (90px)                                  │
│ ┌────────┐                                    ┌──────┐ ┌──────┐ ┌────┐ │
│ │  Logo  │  Planejamento Financeiro          │🔔    │ │🔔    │ │👤  │ │
│ └────────┘                                    └──────┘ └──────┘ └────┘ │
├──────────────┬──────────────────────────────────────────────────────────┤
│              │                    MAIN CONTENT AREA                      │
│  SIDEBAR     │                                                          │
│  (250px)     │  ┌──────────────────────────────────────────────────┐   │
│              │  │ Bem-vindo, João! | Hoje, 17 de Junho de 2026    │   │
│              │  └──────────────────────────────────────────────────┘   │
│ ┌──────────┐ │                                                          │
│ │ 📊 Home  │ │  ┌─────────────────┐ ┌─────────────────┐               │
│ │ ✓ Ativo  │ │  │ 💰 Saldo Total  │ │ 📈 Receitas     │               │
│ └──────────┘ │  │   R$ 5.432,50   │ │   R$ 8.900,00   │               │
│              │  │ (Este período)  │ │ (Este período)  │               │
│ ┌──────────┐ │  └─────────────────┘ └─────────────────┘               │
│ │ 💳 Trans │ │                                                          │
│ │  ações  │ │  ┌─────────────────┐ ┌─────────────────┐               │
│ └──────────┘ │  │ 📉 Despesas     │ │ ⚠️  Alertas      │               │
│              │  │   R$ 3.467,50   │ │ 2 itens         │               │
│ ┌──────────┐ │  │ (Este período)  │ │ importantes     │               │
│ │ 📋 Relat │ │  └─────────────────┘ └─────────────────┘               │
│ │  órios  │ │                                                          │
│ └──────────┘ │  ┌──────────────────────────────────────────────────┐  │
│              │  │            GRÁFICO: Despesas por Categoria       │  │
│ ┌──────────┐ │  │  (Gráfico de Rosca / Pie Chart)                 │  │
│ │ 🧠 Insi  │ │  │  ┌────────────────────────────────────────────┐ │  │
│ │  ghts   │ │  │  │      ░░░░░  Alimentação   32% | R$ 1,108  │ │  │
│ └──────────┘ │  │  │      ▓▓▓▓▓  Transporte   18% | R$ 623    │ │  │
│              │  │  │      ▒▒▒▒▒  Entretenm.  15% | R$ 520    │ │  │
│ ┌──────────┐ │  │  │      ░░░░░  Utilities    12% | R$ 416    │ │  │
│ │ ⚙️  Conf │ │  │  │      ▓▓▓▓▓  Outros       23% | R$ 798    │ │  │
│ │  igs    │ │  │  └────────────────────────────────────────────┘ │  │
│ └──────────┘ │  └──────────────────────────────────────────────────┘  │
│              │                                                          │
│              │  ┌──────────────────────────────────────────────────┐  │
│              │  │        GRÁFICO: Evolução de Gastos (Mês)        │  │
│              │  │                                                  │  │
│              │  │  Despesas por semana:                           │  │
│              │  │  ┌─────────────────────────────────────────┐   │  │
│              │  │  │ 1500│    *                              │   │  │
│              │  │  │ 1000│   *  *                            │   │  │
│              │  │  │  500│  *   *  *                         │   │  │
│              │  │  │    0└───────────────────────────────────│   │  │
│              │  │  │    Sem1 Sem2 Sem3 Sem4                 │   │  │
│              │  └──────────────────────────────────────────────────┘  │
│              │                                                          │
│              │  ┌──────────────────────────────────────────────────┐  │
│              │  │    🎯 INSIGHTS & RECOMENDAÇÕES (Top 3)         │  │
│              │  │                                                  │  │
│              │  │  1. 🔴 ALERTA: Você gastou 35% a mais com       │  │
│              │  │     "Delivery" este mês (R$ 450 vs R$ 333).     │  │
│              │  │     💡 Dica: Prepare refeições em casa          │  │
│              │  │     [Ver Mais]                                  │  │
│              │  │                                                  │  │
│              │  │  2. 💡 Oportunidade: Com seu saldo positivo,    │  │
│              │  │     considere investir em Tesouro Direto (CDB)  │  │
│              │  │     Rentabilidade: ~13% a.a.                   │  │
│              │  │     [Explorar]                                  │  │
│              │  │                                                  │  │
│              │  │  3. 📈 Meta Atingida: Você controlou suas       │  │
│              │  │     despesas em 3 categorias este mês! 🎉       │  │
│              │  │     [Parabéns!]                                 │  │
│              │  └──────────────────────────────────────────────────┘  │
│              │                                                          │
└──────────────┴──────────────────────────────────────────────────────────┘
```

### Explicação dos Elementos

#### 1. **Header Superior (90px)**
- Logo + Nome da Aplicação (lado esquerdo)
- Notificações (🔔 com badge)
- Menu de Usuário (👤 com dropdown)

#### 2. **Sidebar Esquerda (250px)**
Menu vertical com ícones e labels:
- 📊 Dashboard (Home)
- 💳 Transações
- 📋 Relatórios
- 🧠 Insights
- ⚙️ Configurações
- 🚪 Logout

#### 3. **Seção de Boas-vindas**
- Saudação personalizada
- Data atual
- Período selecionado (com dropdown para mudar ciclo)

#### 4. **Cards de Resumo (4 colunas)**
```
┌─────────────────────┐
│ 💰 SALDO TOTAL      │ ← Card com ícone, label e valor
│ R$ 5.432,50         │
│ (Este período)      │
│ ↑ +15% vs último    │ ← Comparação com período anterior
└─────────────────────┘
```

Cada card contém:
- Ícone em cor (32x32px)
- Label (título)
- Valor principal (grande, peso bold)
- Período
- Tendência (↑/↓ com %)

#### 5. **Gráfico de Rosca (Pizza) - Despesas por Categoria**
```javascript
{
  width: "100%",
  height: "300px",
  data: [
    { category: "Alimentação", value: 1108, percentage: 32, color: "#FF6B6B" },
    { category: "Transporte", value: 623, percentage: 18, color: "#0066CC" },
    { category: "Entretenimento", value: 520, percentage: 15, color: "#00CC99" },
    { category: "Utilities", value: 416, percentage: 12, color: "#FFA500" },
    { category: "Outros", value: 798, percentage: 23, color: "#9B9B9B" }
  ]
}
```

#### 6. **Gráfico de Linha - Evolução de Gastos**
- Eixo X: Semanas do mês
- Eixo Y: Valores em R$
- Linha de tendência com área preenchida
- Hover mostra valor exato

#### 7. **Seção de Insights & Recomendações**
Exibe 3 cards prioritários:
1. Alertas (vermelho) - Gastos elevados
2. Oportunidades (azul) - Sugestões de investimento
3. Celebrações (verde) - Conquistas

---

## 📱 Página de Transações

```
┌─────────────────────────────────────────────────────────┐
│ TRANSAÇÕES                                              │
├─────────────────────────────────────────────────────────┤
│ [Filtro por Período ▼] [Filtro por Categoria ▼]        │
│ [Buscar por descrição...                            ]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ JUN 17 (HOJE)                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🍕 Alimentação                     -R$ 45,90       │ │
│ │ Pizza Luigi - 20:30                [Editar][X]    │ │
│ │ # pizza #delivery                                  │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 💳 Salário (Entrada)               +R$ 5.000,00   │ │
│ │ Salário Mensal - 08:00             [Editar][X]    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ JUN 16                                                  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🚕 Transporte                     -R$ 32,50       │ │
│ │ Uber para trabalho - 08:15        [Editar][X]    │ │
│ │ # trabalho #transporte                            │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🏪 Alimentação                     -R$ 128,75      │ │
│ │ Supermercado Pão de Quó - 18:45   [Editar][X]    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [Carregar Mais...]                                      │
└─────────────────────────────────────────────────────────┘
```

### Ações disponíveis por transação:
- **Clique**: Ver detalhes completos (modal)
- **Editar**: Modificar valor, categoria, descrição
- **Deletar**: Remover com confirmação
- **Expandir**: Ver anexos e tags

---

## ➕ Modal de Nova Transação

```
┌────────────────────────────────────┐
│ ➕ NOVA TRANSAÇÃO              [X] │
├────────────────────────────────────┤
│                                    │
│ Tipo de Transação:                 │
│ [● Despesa] [○ Receita]            │
│                                    │
│ Valor:                             │
│ [          R$ 0,00      ]          │
│                                    │
│ Categoria:                         │
│ [▼ Selecione...]                   │
│   • Alimentação                    │
│   • Transporte                     │
│   • Saúde                          │
│   • Educação                       │
│   • Entretenimento                 │
│   • Assinaturas                    │
│                                    │
│ Descrição (opcional):              │
│ [_________________________]        │
│                                    │
│ Data e Horário:                    │
│ [Jun 17, 2026] [20:30]            │
│                                    │
│ Tags (opcional):                   │
│ [# adicione tags...]               │
│                                    │
│ Anexar Comprovante:                │
│ [📷 Camera] [📁 Galeria] [X.pdf]  │
│                                    │
│ Observações (opcional):            │
│ [_________________________]        │
│                                    │
│ [Cancelar]  [SALVAR TRANSAÇÃO]    │
└────────────────────────────────────┘
```

### Validações de Entrada:
- Valor: Mínimo R$ 0,01
- Descrição: Máximo 500 caracteres
- Data: Não pode ser no futuro (por padrão)
- Categoria: Campo obrigatório
- Arquivo: Máximo 10MB, formatos: JPG, PNG, PDF

---

## 📊 Página de Relatórios

```
┌────────────────────────────────────────────────────────┐
│ RELATÓRIOS & CICLOS FINANCEIROS                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Período Selecionado: [Junho 2026 ▼]                  │
│                                                        │
│ ┌──────────────────────────────────────────────────┐  │
│ │ 📅 CICLO: 01/06 até 30/06 (30 dias) [FECHADO]  │  │
│ │                                                  │  │
│ │ Receitas Totais:      R$ 8.900,00  ↑ +5%       │  │
│ │ Despesas Totais:      R$ 3.467,50  ↓ -8%       │  │
│ │ Saldo Líquido:        R$ 5.432,50  ↑ +15%      │  │
│ │                                                  │  │
│ │ ▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  │
│ │ 38,9% do orçamento utilizado                   │  │
│ │                                                  │  │
│ │ [Gerar PDF]  [Exportar Excel]  [Compartilhar]  │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ 📈 AVALIAÇÃO DE DESEMPENHO                           │
│ ┌──────────────────────────────────────────────────┐  │
│ │ ✅ Conquistas:                                   │  │
│ │   • Você controlou seus gastos em 3 categorias  │  │
│ │   • Poupança aumentou 15% vs mês anterior       │  │
│ │   • Reduziu entretenimento em 22%               │  │
│ │                                                  │  │
│ │ ⚠️ Pontos de Atenção:                            │  │
│ │   • Delivery 35% acima da média histórica       │  │
│ │   • Assinaturas aumentaram 50% (novos?)        │  │
│ │   • Café/Lanches: +18%                          │  │
│ │                                                  │  │
│ │ 💡 Recomendações para o próximo período:        │  │
│ │   1. Revisar e cancelar assinaturas não usadas  │  │
│ │   2. Reduzir pedidos de delivery em 2 dias/sem │  │
│ │   3. Considerar investir o saldo extra          │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ 📋 HISTÓRICO DE CICLOS ANTERIORES                     │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Maio 2026     R$ 7.200,00  →  R$ 3.800,50 ✓   │  │
│ │ Abril 2026    R$ 6.500,00  →  R$ 2.100,00 ✓   │  │
│ │ Março 2026    R$ 5.890,00  →  R$ 1.650,75 ✓   │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🧠 Página de Insights

```
┌────────────────────────────────────────────────────┐
│ INSIGHTS & INTELIGÊNCIA FINANCEIRA                │
├────────────────────────────────────────────────────┤
│                                                    │
│ 🔴 ALERTAS CRÍTICOS (2)                           │
│ ┌─────────────────────────────────────────────┐   │
│ │ ⚠️ Categoria em Risco: Delivery              │   │
│ │ Você gastou R$ 450 em Junho (+35% vs maio) │   │
│ │ Limite recomendado: R$ 333                 │   │
│ │                                             │   │
│ │ Ações:                                      │   │
│ │ [Ver Transações] [Ajustar Limite] [X]      │   │
│ └─────────────────────────────────────────────┘   │
│                                                    │
│ 💡 DICAS DE ECONOMIA (3)                          │
│ ┌─────────────────────────────────────────────┐   │
│ │ 🎯 Dica #1: Reduza Assinaturas               │   │
│ │ Você tem 6 assinaturas ativas (R$ 87/mês)   │   │
│ │ Cancele 2 não utilizadas = +R$ 30/mês       │   │
│ │                                             │   │
│ │ Assinaturas detectadas:                     │   │
│ │ ✓ Netflix              R$ 32,90/mês         │   │
│ │ ✓ Spotify              R$ 19,90/mês         │   │
│ │ ? Prime Video          R$ 14,90/mês (❓)    │   │
│ │ ? Adobe Creative Cloud R$ 19,90/mês (❓)    │   │
│ │                                             │   │
│ │ [Revisar] [Sugerir Alternativas]            │   │
│ └─────────────────────────────────────────────┘   │
│                                                    │
│ 💰 SUGESTÕES DE INVESTIMENTO                      │
│ ┌─────────────────────────────────────────────┐   │
│ │ 📊 Seu perfil: Moderado (Rebalanceamento)   │   │
│ │ Saldo disponível: R$ 5.432,50               │   │
│ │                                             │   │
│ │ 1. Tesouro Direto (Prefixado)              │   │
│ │    Taxa: 12% a.a. | Risco: Baixo           │   │
│ │    Mín: R$ 100 | Ideal: R$ 2.000           │   │
│ │    [Saiba Mais] [Investir]                 │   │
│ │                                             │   │
│ │ 2. CDB com Liquidez Diária                 │   │
│ │    Taxa: 11% a.a. | Risco: Baixo           │   │
│ │    Mín: R$ 50 | Ideal: R$ 2.500            │   │
│ │    [Saiba Mais] [Investir]                 │   │
│ │                                             │   │
│ │ 3. Fundo Imobiliário (FII)                 │   │
│ │    Div Yield: 8% a.a. | Risco: Médio       │   │
│ │    Mín: R$ 200 | Ideal: R$ 1.000           │   │
│ │    [Saiba Mais] [Investir]                 │   │
│ └─────────────────────────────────────────────┘   │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## ⚙️ Página de Configurações

```
┌────────────────────────────────────────────────┐
│ CONFIGURAÇÕES                                  │
├────────────────────────────────────────────────┤
│                                                │
│ 👤 PERFIL                                     │
│ [Foto] João Silva                             │
│        joao@example.com                       │
│        [Editar Perfil] [Alterar Foto]        │
│                                               │
│ 🔐 SEGURANÇA                                  │
│ □ Autenticação de Dois Fatores               │
│   Status: Desativada [Ativar]                │
│                                               │
│ □ Reconhecimento Facial                      │
│   Status: Desativada [Ativar]                │
│                                               │
│ [Alterar Senha]  [Alterar Email]            │
│                                               │
│ 💳 PREFERÊNCIAS DE TRANSAÇÕES                 │
│ Ciclo Financeiro:  [Mensal ▼]                │
│                   (01 a 30/mês)              │
│ Moeda:             [Real (R$) ▼]             │
│ Timezone:          [America/Sao_Paulo ▼]   │
│                                               │
│ 🔔 NOTIFICAÇÕES                              │
│ ✓ Emails                                     │
│ □ SMS (OTP login)                            │
│ ✓ Notificações Push                          │
│   Frequência: [Diário ▼]                     │
│                                               │
│ 🔗 INTEGRAÇÕES                               │
│ [Conectar com Google Drive]                  │
│ [Conectar com Planilhas Google]              │
│ [Conectar com Stripe] (Future)               │
│                                               │
│ 🗑️ DADOS                                      │
│ [Exportar Meus Dados]                        │
│ [Deletar Conta e Dados]                      │
│                                               │
│ 📄 LEGAL                                      │
│ [Termos de Serviço]                          │
│ [Política de Privacidade]                    │
│ [LGPD - Direitos do Usuário]                 │
│                                               │
│                    [SALVAR] [CANCELAR]       │
└────────────────────────────────────────────────┘
```

---

## 🎯 Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────┐
│                  LOGIN / REGISTRO                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │  📱 PLANEJAMENTO FINANCEIRO                │  │
│  │                                            │  │
│  │  Bem-vindo! Faça login para continuar    │  │
│  │                                            │  │
│  │  Email ou Telefone:                       │  │
│  │  [_________________________]              │  │
│  │                                            │  │
│  │  Senha:                                   │  │
│  │  [_________________________]              │  │
│  │                                            │  │
│  │  [ ✓ Lembrar-me ]  [Esqueci a Senha]   │  │
│  │                                            │  │
│  │  [ENTRAR]                                 │  │
│  │                                            │  │
│  ├────────── OU ──────────┤                 │  │
│  │                                            │  │
│  │  [🔵 Entrar com Google]                  │  │
│  │  [🔵 Entrar com Facebook]                │  │
│  │  [📱 Entrar com Telefone (OTP)]         │  │
│  │                                            │  │
│  │  Não tem conta? [Criar Conta]           │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘

         ↓ (Clica em "Telefone")

┌──────────────────────────────────┐
│  📱 VERIFICAÇÃO POR SMS/WHATSAPP  │
├──────────────────────────────────┤
│                                  │
│  Número de Telefone:             │
│  [+55] [_____________]           │
│                                  │
│  [ ] WhatsApp  [ ] SMS           │
│                                  │
│  [ENVIAR CÓDIGO]                 │
│                                  │
│  ────────────────────────────    │
│  Código recebido?                │
│  [___] [___] [___] [___]        │
│                                  │
│  [VERIFICAR]                     │
│                                  │
└──────────────────────────────────┘
```

---

## 📐 Componentes Reutilizáveis

### 1. **Card de Transação**
```jsx
<TransactionCard
  icon="🍕"
  category="Alimentação"
  description="Pizza Luigi"
  amount={-45.90}
  time="20:30"
  tags={["pizza", "delivery"]}
  onEdit={() => {}}
  onDelete={() => {}}
/>
```

### 2. **Card de Métrica**
```jsx
<MetricCard
  icon="💰"
  label="Saldo Total"
  value={5432.50}
  trend={+15}
  period="Este período"
/>
```

### 3. **Gráfico Responsivo**
```jsx
<ResponsiveChart
  type="pie" | "line" | "bar"
  data={[...]}
  height={300}
  responsive={true}
/>
```

### 4. **Modal com Validação**
```jsx
<FormModal
  title="Nova Transação"
  fields={[
    { name: "amount", type: "currency", required: true },
    { name: "category", type: "select", required: true },
    { name: "description", type: "text" },
    { name: "date", type: "datetime", required: true }
  ]}
  onSubmit={(data) => {}}
/>
```

---

## 🎨 Acessibilidade (WCAG 2.1 AA)

✅ **Contraste**: Mínimo 4.5:1 para textos
✅ **Navegação**: Suporte completo a teclado
✅ **Screen Readers**: Labels descritivos
✅ **Cores**: Não apenas para significado (+ícones)
✅ **Motion**: Respeita preferências de redução de movimento

---

## 📱 Responsive Breakpoints

| Device | Breakpoint | Layout |
|--------|-----------|--------|
| Mobile | < 768px | 1 coluna, Bottom Tab |
| Tablet | 768px - 1024px | 2 colunas, Sidebar colapsável |
| Desktop | > 1024px | 3+ colunas, Sidebar permanente |

---

## 🚀 Prototipagem e Design Tools

**Ferramentas Recomendadas:**
- **Figma**: Design colaborativo e prototipagem
- **Storybook**: Documentação de componentes
- **Cypress**: Testes E2E de interfaces
- **Lighthouse**: Auditoria de performance

