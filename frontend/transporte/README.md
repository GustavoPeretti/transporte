# Frontend — Sistema de Transporte

Interface web responsiva (desktop e mobile) em **React 19 + Vite + Tailwind CSS v4**,
com **React Router** para navegação. A estrutura é modular e a camada de serviços
espelha exatamente os endpoints do backend Django REST.

## Como rodar

```bash
npm install
npm run dev      # ambiente de desenvolvimento (http://localhost:5173)
npm run build    # build de produção
npm run lint     # análise estática
```

## Modo de dados (mock x API real)

Enquanto o backend ainda **não** expõe login/CORS, a aplicação roda com dados
simulados (`src/mock/db.js`). O comportamento é controlado em `src/config.js`:

- `USE_MOCK = true` (padrão): usa a base em memória.
- `USE_MOCK = false` (ou `VITE_USE_MOCK=false`): consome a API real em `/api`
  (o Vite faz proxy para `http://localhost:8000` — ver `vite.config.js`).

### Acesso de demonstração (modo mock)

| Usuário      | Senha        | Tela        |
| ------------ | ------------ | ----------- |
| `admin`      | `admin`      | Administrador |
| `motorista`  | `motorista`  | Motorista   |
| `passageiro` | `passageiro` | Passageiro  |

## Estrutura

```
src/
  config.js              # USE_MOCK, base da API, papéis e rotas iniciais
  lib/
    apiClient.js         # wrapper de fetch (base URL, token, erros)
    dates.js             # utilitários de semana/data (domingo..sábado)
  services/              # 1 arquivo por recurso, alterna mock x API real
    auth, veiculos, instituicoes, perfis,
    planejamentos, alocacoes, confirmacoes, advertencias
  mock/db.js             # base de dados em memória (espelha os serializers)
  context/AuthContext.jsx
  hooks/useSemana.js
  components/
    ui/                  # Button, Card, Modal, Toggle, Badge, Spinner
    layout/              # AppShell, TopBar
    WeekStrip.jsx        # faixa de seleção semanal (admin e passageiro)
    ProtectedRoute.jsx
  pages/
    LoginPage.jsx        # login único, redireciona por papel
    admin/               # dashboard de planejamento/alocação
    motorista/           # embarque do dia + registrar embarque
    passageiro/          # embarque, grade ida/volta e advertências
```

## Telas implementadas

- **Login** único; redireciona conforme o papel do usuário.
- **Administrador**: planejamento semanal (abrir/fechar dia), total de alunos,
  alocação automática/manual de veículos, vínculo de instituições e geração da
  lista de passageiros. CRUDs simples e regras de negócio ficam no admin do Django.
- **Motorista**: embarque do dia, abas Veículo/Instituições e **registrar embarque**
  (checklist de presença).
- **Passageiro**: embarque do dia, grade de confirmação Ida/Volta da semana e
  advertências.

## O que falta no backend para a integração real

A camada de serviços já está pronta para a API atual, mas para `USE_MOCK = false`
funcionar de ponta a ponta o backend precisa de:

1. **Autenticação na API** (ex.: `rest_framework.authtoken`) com endpoint de login
   que devolva um token — ver `services/auth.js` (`loginReal`).
2. **CORS** habilitado (`django-cors-headers`) para o front em `localhost:5173`.
3. **Identificação do papel** do usuário logado (admin/motorista/passageiro).
   Hoje é derivada da existência de `PerfilMotorista`/`PerfilPassageiro` em
   `carregarSessaoReal`; um endpoint `/api/me/` simplificaria isso.
