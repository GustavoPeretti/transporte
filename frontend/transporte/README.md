# Frontend — Sistema de Transporte

Interface web responsiva (desktop e mobile) em **React 19 + Vite + Tailwind CSS v4**,
com **React Router** para navegação. A estrutura é modular e a camada de serviços
consome diretamente a API do backend Django REST.

## Como rodar

Suba o **backend** e o **frontend** juntos.

```bash
# 1) Backend (Django) — na pasta backend/transporte
python manage.py runserver        # http://localhost:8000

# 2) Frontend — nesta pasta
npm install
npm run dev                       # http://localhost:5173
```

Em desenvolvimento o Vite faz **proxy** de `/api` e `/media` para
`http://localhost:8000` (ver `vite.config.js`), então as chamadas são
same-origin e não exigem CORS.

> Para acessar pelo celular: `npm run dev -- --host` e abra o IP da rede
> mostrado no terminal (PC e celular na mesma Wi-Fi).

## Autenticação (estado atual)

O backend ainda **não** expõe endpoint de login/token. Por isso o login
(`src/services/auth.js`) resolve o usuário pelo `username` na lista real de
`/api/usuarios/` e deriva o papel pelos perfis:

- tem `PerfilMotorista` → **motorista**
- tem `PerfilPassageiro` → **passageiro**
- nenhum dos dois → **administrador**

A **senha ainda não é validada**. Cadastre usuários e perfis pelo admin do
Django (`/admin`). Quando o backend tiver autenticação (ex.: DRF authtoken),
basta ajustar `services/auth.js` e o `apiClient` já envia o header `Token`.

## Rotas da API consumidas

CRUDs padrão (DRF router): `veiculos`, `planejamentos`, `usuarios`,
`instituicoes`, `perfis-passageiro`, `perfis-motorista`, `confirmacoes`,
`advertencias`, `alocacoes-veiculo`, `alocacoes-instituicao`.

**Rotas especiais:**

1. `POST /api/confirmacoes/registrar-embarque/` — registra presença
   `{ data, id_passageiro, tipo: 'ida' | 'retorno' }` (tela do Motorista, QR/manual).
2. `POST /api/planejamentos/{id}/organizar/` — alocação automática
   (botão "Organizar automaticamente" no Admin).

## Estrutura

```
src/
  config.js              # base da API, papéis e rotas iniciais
  lib/
    apiClient.js         # wrapper de fetch (base URL, token, erros)
    dates.js             # utilitários de semana/data (domingo..sábado)
  services/              # 1 arquivo por recurso, consome a API real
    auth, veiculos, instituicoes, perfis,
    planejamentos, alocacoes, confirmacoes, advertencias
  context/AuthContext.jsx
  hooks/useSemana.js
  components/
    ui/                  # Button, Card, Modal, Toggle, Badge, Spinner
    layout/              # AppShell, TopBar
    WeekStrip.jsx        # faixa de seleção semanal
    QrScanner.jsx        # leitor de QR via câmera (html5-qrcode)
    ProtectedRoute.jsx
  pages/
    LoginPage.jsx        # login único, redireciona por papel
    admin/               # dashboard de planejamento/alocação + PDF
    motorista/           # embarque do dia + registrar embarque (QR)
    passageiro/          # embarque, grade ida/volta, advertências, carteirinha
```

## Pendências conhecidas no backend

- **`Advertencia` sem campo `justificativa`**: o botão "Justificar" do passageiro
  envia `PATCH /advertencias/{id}/`, mas o valor não persiste até o campo ser
  adicionado ao modelo + serializer.
- **Rota `organizar`**: o `PlanejamentoService.organizar_planejamento`
  consulta `Confirmacao.objects...values('instituicao')` (campo inexistente em
  `Confirmacao`; deveria ser `passageiro__instituicao`) e não retorna status no
  caminho de sucesso (retorna `None`, e a view acessa `.name`). Enquanto isso, o
  botão "Organizar automaticamente" exibirá erro.
