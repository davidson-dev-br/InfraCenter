# Arquitetura e Plano de Desenvolvimento: InfraVision

## 1. Visão Geral do Projeto

**InfraVision** é um sistema avançado de gerenciamento de infraestrutura de data center (DCIM) projetado para fornecer uma visualização clara, controle preciso e automação inteligente sobre todos os ativos e operações em um ambiente de missão crítica. A aplicação combina uma planta baixa interativa com um robusto sistema de gerenciamento de inventário, permissões e fluxos de trabalho, culminando em futuras integrações com Inteligência Artificial para automação da coleta de dados.

O desenvolvimento é faseado para garantir estabilidade, segurança e a integração contínua de funcionalidades essenciais como controle de acesso e logs de auditoria desde o início.

---

## 2. Tech Stack

- **Frontend:** Next.js, React, TypeScript
- **UI Framework:** Tailwind CSS com componentes ShadCN
- **State Management:** React Context API & Hooks
- **Banco de Dados:** Azure SQL
- **Autenticação:** Firebase Authentication (com provedor Microsoft)
- **Armazenamento de Arquivos:** Azure Blob Storage
- **Inteligência Artificial:** Azure AI Services (Visão Computacional)
- **Versionamento:** Git

---

## 3. Fases do Desenvolvimento

### Fase 1: Fundações e Gerenciamento de Dados (Foco Atual)

Construir o alicerce de dados da aplicação. Cada nova funcionalidade nesta fase deve ser desenvolvida em uma página de teste isolada antes da integração.

1.  **Estrutura de Dados dos Itens (Planta Baixa):**
    *   **Descrição:** Definir e criar no Azure SQL a tabela principal `Itens` (Assets). Esta tabela conterá todos os equipamentos (Racks, ACs, Switches, etc.).
    *   **Status:** **Próximo Passo.**

2.  **Gerenciamento de Prédios e Salas (CRUD):**
    *   **Descrição:** Implementar a funcionalidade completa na página **/buildings** para Criar, Renomear e Excluir Prédios e Salas, gerenciando as tabelas `Buildings` e `Rooms` no banco de dados.
    *   **Status:** A fazer.

3.  **CRUD Básico de Itens:**
    *   **Descrição:** Implementar a lógica no modal da Planta Baixa para Adicionar, Salvar e Excluir itens, conectando-se diretamente à tabela `Itens` do banco de dados.
    *   **Status:** A fazer.

### Fase 2: Visualização e Interação do Usuário

Conectar a interface do usuário aos dados do backend.

1.  **Conectar Planta Baixa ao Banco de Dados:**
    *   **Descrição:** Fazer a página `/datacenter` buscar e exibir dinamicamente os itens, salas e prédios do banco de dados. A seleção de prédio e sala filtrará os itens exibidos em tempo real.
    *   **Status:** A fazer.

2.  **Funcionalidade de Lixeira:**
    *   **Descrição:** Desenvolver a página `/trash` para listar itens marcados como "excluídos", permitindo restaurá-los ou excluí-los permanentemente.
    *   **Status:** A fazer.

3.  **Upload de Imagens:**
    *   **Descrição:** Conectar a funcionalidade de upload no modal de edição de item ao Azure Blob Storage. A URL da imagem será armazenada no registro do item no banco de dados.
    *   **Status:** A fazer.

### Fase 3: Conectividade e Inteligência

Expandir a aplicação para incluir o relacionamento entre os itens e adicionar camadas de inteligência.

1.  **Mapeamento de Conexões e "De/Para":**
    *   **Descrição:** Desenvolver a lógica para mapear conexões físicas e lógicas entre equipamentos (ex: porta de switch para patch panel, servidor para storage). Isso exigirá uma tabela `Connections` no banco de dados. A página `/depara` fornecerá uma interface de visualização e gerenciamento.
    *   **Status:** A fazer.

2.  **Sistema de Aprovações:**
    *   **Descrição:** Criar um fluxo de trabalho onde ações críticas (ex: mover um rack de produção) geram um pedido de aprovação. A página `/approvals` permitirá que usuários com permissão gerenciem esses pedidos.
    *   **Status:** A fazer.

3.  **Log de Auditoria:**
    *   **Descrição:** Implementar a tabela `AuditLog` no banco de dados. Todas as ações importantes (login, alterações de dados, mudanças de permissão) registrarão uma entrada. A página `/audit` exibirá esses logs.
    *   **Status:** A fazer.

### Fase 4: Automação e Otimização

Introduzir automação e funcionalidades avançadas.

1.  **Coleta de Dados com IA (Visão Computacional):**
    *   **Descrição:** Desenvolver uma funcionalidade que utiliza a câmera do dispositivo do usuário para escanear etiquetas de equipamentos (DE/PARA, Ativos, etc.) em tempo real. A IA (Azure AI Vision) irá extrair as informações, pré-preencher um formulário de validação, e após a confirmação do usuário, popular ou atualizar o inventário no banco de dados. Este sistema incluirá um ciclo de aprendizado (learning machine) para melhorar a precisão da captura ao longo do tempo.
    *   **Status:** A fazer.

2.  **Importação de Dados em Massa:**
    *   **Descrição:** Construir uma ferramenta na página `/import` para permitir o upload de planilhas (CSV/Excel) para popular o inventário de itens em massa.
    *   **Status:** A fazer.

3.  **Relatórios e Dashboards:**
    *   **Descrição:** Implementar a página `/reports` para gerar relatórios customizáveis (inventário, consumo de energia, ocupação de racks). Futuramente, criar uma dashboard principal com os principais KPIs.
    *   **Status:** A fazer.
---

## Desenvolvedor Principal

- **Nome:** Davidson Santos Conceição
- **Cargo (TIM):** Critical Mission Environment Operations Resident
- **Empresa Contratante:** Fundamentos Sistemas
- **Contatos:**
  - **E-mail Fundamentos:** `davidson.conceicao@fundamentos.com.br`
  - **E-mail TIM:** `dconceicao_fundamentos@timbrasil.com`
  - **E-mail Pessoal:** `davidson.php@gmail.com`
  - **Telefones:**
    - `+55 12 99732-4548`
    - `+55 91 98426-0688`
    - `+55 73 99119-9676`
