# Arquitetura do Banco de Dados

## 📊 Diagrama Conceitual

```
┌─────────────────────────────────────────────────────────────────────┐
│                       PLATAFORMA FINANCEIRA                          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│     USERS        │      │   TRANSACTIONS   │      │    CATEGORIES    │
├──────────────────┤      ├──────────────────┤      ├──────────────────┤
│ id (PK)          │◄─────│ user_id (FK)     │  ┌──│ id (PK)          │
│ email            │   1:N│ category_id (FK) ├──┘  │ name             │
│ phone            │      │ amount           │      │ type             │
│ password_hash    │      │ description      │      │ icon             │
│ full_name        │      │ transaction_date │      │ user_id (FK)     │
│ profile_picture  │      │ transaction_time │      └──────────────────┘
│ risk_profile     │      │ receipt_url      │
│ created_at       │      │ tags             │      ┌──────────────────┐
│ updated_at       │      │ created_at       │      │    BUDGETS       │
│ is_active        │      │ updated_at       │      ├──────────────────┤
└──────────────────┘      └──────────────────┘      │ id (PK)          │
        │                                           │ user_id (FK)     │
        │                                           │ category_id (FK) │
        │              ┌──────────────────┐         │ limit_amount     │
        │              │    ATTACHMENTS   │         │ current_spent    │
        │              ├──────────────────┤         │ period           │
        │              │ id (PK)          │         │ start_date       │
        └──────────────│ transaction_id FK│         │ end_date         │
                       │ file_url         │         │ created_at       │
                       │ file_type        │         └──────────────────┘
                       │ created_at       │
                       └──────────────────┘          ┌──────────────────┐
                                                    │     INSIGHTS     │
        ┌──────────────────┐                        ├──────────────────┤
        │  BILLING_CYCLES  │                        │ id (PK)          │
        ├──────────────────┤                        │ user_id (FK)     │
        │ id (PK)          │                        │ insight_type     │
        │ user_id (FK)     │                        │ title            │
        │ start_date       │                        │ description      │
        │ end_date         │                        │ priority         │
        │ status           │                        │ action_url       │
        │ total_income     │◄─────────────────────────│ created_at       │
        │ total_expense    │                        │ dismissed_at     │
        │ balance          │                        └──────────────────┘
        │ report_generated │
        │ created_at       │
        └──────────────────┘

        ┌──────────────────┐                        ┌──────────────────┐
        │  SOCIAL_AUTH     │                        │  INVESTMENT_TIPS │
        ├──────────────────┤                        ├──────────────────┤
        │ id (PK)          │                        │ id (PK)          │
        │ user_id (FK)     │                        │ user_id (FK)     │
        │ provider         │                        │ investment_type  │
        │ provider_id      │                        │ description      │
        │ email            │                        │ risk_level       │
        │ name             │                        │ expected_return  │
        │ picture_url      │                        │ link_url         │
        │ created_at       │                        │ created_at       │
        └──────────────────┘                        │ dismissed_at     │
                                                    └──────────────────┘
```

---

## 🗄️ Tabelas Detalhadas

### 1. **USERS** (Usuários)
Armazena dados de autenticação e perfil do usuário.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  profile_picture_url TEXT,
  bio TEXT,
  risk_profile ENUM('conservative', 'moderate', 'aggressive') DEFAULT 'moderate',
  monthly_income DECIMAL(12, 2) DEFAULT 0,
  language VARCHAR(10) DEFAULT 'pt-BR',
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL
);
```

### 2. **SOCIAL_AUTH** (Autenticação Social)
```sql
CREATE TABLE social_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_id VARCHAR(255) NOT NULL,
  provider_email VARCHAR(255),
  provider_name VARCHAR(255),
  picture_url TEXT,
  access_token_hash VARCHAR(255),
  refresh_token_hash VARCHAR(255),
  token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY (provider, provider_id)
);
```

### 3. **CATEGORIES** (Categorias)
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(7),
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY (user_id, name)
);
```

### 4. **TRANSACTIONS** (Transações)
Registro principal com data e hora separadas.

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category_id UUID NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  transaction_type ENUM('income', 'expense') NOT NULL,
  description VARCHAR(500),
  transaction_date DATE NOT NULL,
  transaction_time TIME NOT NULL,
  transaction_datetime DATETIME NOT NULL,
  tags JSON,
  receipt_url TEXT,
  notes TEXT,
  recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency VARCHAR(20),
  recurring_until DATE,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_user_date (user_id, transaction_date),
  INDEX idx_user_category_date (user_id, category_id, transaction_date)
);
```

### 5. **ATTACHMENTS** (Comprovantes)
```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size_bytes INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);
```

### 6. **BUDGETS** (Orçamentos)
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category_id UUID,
  limit_amount DECIMAL(12, 2) NOT NULL,
  current_spent DECIMAL(12, 2) DEFAULT 0,
  period VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  alert_threshold INT DEFAULT 80,
  alert_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);
```

### 7. **BILLING_CYCLES** (Ciclos Financeiros)
```sql
CREATE TABLE billing_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  cycle_type VARCHAR(20) NOT NULL,
  status ENUM('open', 'closed', 'archived') DEFAULT 'open',
  total_income DECIMAL(12, 2),
  total_expense DECIMAL(12, 2),
  balance DECIMAL(12, 2),
  report_generated BOOLEAN DEFAULT FALSE,
  report_url TEXT,
  performance_score INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, start_date)
);
```

### 8. **INSIGHTS** (Recomendações)
```sql
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  insight_type ENUM('spending_alert', 'savings_tip', 'investment_suggestion', 'budget_warning') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  action_url TEXT,
  data_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dismissed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 9. **INVESTMENT_TIPS** (Sugestões de Investimento)
```sql
CREATE TABLE investment_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  investment_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  risk_level ENUM('low', 'medium', 'high') NOT NULL,
  expected_return_percentage DECIMAL(5, 2),
  minimum_investment DECIMAL(12, 2),
  link_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dismissed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 10. **NOTIFICATIONS** (Notificações)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔐 Segurança e Conformidade

### LGPD/GDPR
- ✅ Soft delete (deleted_at)
- ✅ Audit trails
- ✅ Direito de exportação
- ✅ Direito de exclusão

### Criptografia
- ✅ Senhas: bcrypt (rounds: 12)
- ✅ Dados sensíveis: AES-256
- ✅ Tokens: JWT com expiração

### Índices para Performance
- ✅ (user_id, transaction_date)
- ✅ (user_id, category_id, transaction_date)
- ✅ (user_id) em insights
- ✅ (email) e (phone) para login rápido

---

## 📈 Relacionamentos

```
Users (1) ──── (N) Transactions
Users (1) ──── (N) Categories
Users (1) ──── (N) Budgets
Users (1) ──── (N) Insights
Transactions (1) ──── (N) Attachments
Transactions (N) ──── (1) Categories
```

