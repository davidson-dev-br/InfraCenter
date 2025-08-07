# Arquitetura e Plano de Desenvolvimento: InfraVision

## 1. Visão Geral do Projeto

**InfraVision** é um sistema avançado de gerenciamento de infraestrutura de data center (DCIM) projetado para fornecer uma visualização clara, controle preciso e automação inteligente sobre todos os ativos e operações em um ambiente de missão crítica. A aplicação combina uma planta baixa interativa com um robusto sistema de gerenciamento de inventário, permissões e fluxos de trabalho, culminando em futuras integrações com Inteligência Artificial para automação da coleta de dados.

O desenvolvimento é faseado para garantir estabilidade, segurança e a integração contínua de funcionalidades essenciais como controle de acesso e logs de auditoria desde o início.

---

## 2. Stack de Tecnologia

- **Frontend:** Next.js, React, TypeScript
- **UI Framework:** Tailwind CSS com componentes ShadCN
- **State Management:** React Context API & Hooks
- **Banco de Dados:** **Azure SQL** (Produção) / **MySQL** (Planejado para Desenvolvimento Local)
  - *Nota: A arquitetura está sendo preparada para suportar um ambiente de desenvolvimento local com MySQL para maior flexibilidade e resiliência.*
- **Autenticação:** Firebase Authentication (com provedor Microsoft). *A escolha desta ferramenta na fase inicial agiliza o desenvolvimento no ambiente Firebase Studio, com uma possível evolução futura para o Microsoft Entra ID.*
- **Armazenamento de Arquivos:** Azure Blob Storage
- **Inteligência Artificial (Futuro):** Azure AI Services (Visão Computacional)
- **Versionamento:** Git

---

## 3. Fases do Desenvolvimento

O projeto está organizado em fases, permitindo o desenvolvimento incremental e a entrega contínua de valor.

### Fase 1: Fundações e Gerenciamento de Dados
**Status:** `Concluído`
Construção do alicerce de dados da aplicação, incluindo as tabelas iniciais para prédios, salas e itens.

### Fase 2: Visualização e Interação do Usuário
**Status:** `Concluído`
Criação da planta baixa interativa com suporte a movimentação, zoom e CRUD básico de itens.

### Fase 3: Segurança e Controle de Acesso
**Status:** `Concluído`
Implementação de um sistema de segurança robusto com controle de acesso baseado em cargos (RBAC) e por prédios.

### Fase 4: Ciclo de Vida e Integridade dos Dados
**Status:** `Concluído`
Implementação dos fluxos de trabalho que governam o ciclo de vida de um ativo, incluindo a lixeira e o sistema de status.

### Fase 5: Inventário Hierárquico e Configurável
**Status:** `Concluído`
Separação estrutural dos dados em `ParentItems` e `ChildItems` no banco de dados e na interface, e criação da base para configuração de tipos de item na página de sistema.

### Fase 6: Gerenciamento Avançado de Entidades e Atributos
**Status:** `Concluído`
Expansão da página `/system` com a criação e gerenciamento de Fabricantes e Modelos de equipamentos.

### Fase 7: Fundações de Conectividade
**Status:** `Concluído`
Construção dos blocos fundamentais para o mapeamento de conexões físicas e lógicas.

1.  **7.1. Gerenciar Tipos de Porta:**
    *   **Descrição:** Criar a tabela `PortTypes` e implementar o CRUD na página de Sistema.
    *   **Status:** `Concluído`.

2.  **7.2. Gerenciar Tipos de Conexão:**
    *   **Descrição:** Implementar o CRUD para `ConnectionTypes`.
    *   **Status:** `Concluído`.

3.  **7.3. Gerenciar Portas de Equipamentos:**
    *   **Descrição:** Criar a tabela `EquipmentPorts` para armazenar cada porta individual.
    *   **Status:** `Concluído`.

### Fase 8: Mapeamento Avançado e Inteligência Proativa
**Status:** `Em Andamento`
Módulo central para mapear conexões e garantir a integridade dos dados de forma proativa.

1.  **8.1. Geração Automática de Portas:**
    *   **Descrição:** Modificar a criação de `ChildItems` para gerar automaticamente as instâncias de portas com base no modelo do equipamento.
    *   **Status:** `Concluído`.

2.  **8.2. Inventário Central de Portas:**
    *   **Descrição:** Transformar a página `/connections` em um "Inventário de Portas" centralizado, listando todas as portas de todos os equipamentos, seu status e onde estão conectadas.
    *   **Status:** `Concluído`.

3.  **8.3. Desenvolver Interface De/Para:**
    *   **Descrição:** Construir a interface visual na página `/depara` para permitir que os usuários conectem `Porta A` à `Porta B`, com suporte a conexão rápida e conexão com evidência (foto e texto da etiqueta). Implementar o fluxo de "conexão não resolvida" (lado único).
    *   **Status:** `Concluído`.

4.  **8.4. Central de Incidentes de Integridade:**
    *   **Descrição:** Desenvolver a página `/incidents` para visualizar e gerenciar as inconsistências de dados, como conexões não resolvidas, que são detectadas automaticamente pelo sistema.
    *   **Status:** **Próximo Passo**.

### Fase 9: Logs, Aprovações e Visualizações Avançadas
**Status:** `A Fazer`
Enriquecer a aplicação com camadas de dados visuais e fluxos de trabalho críticos.

1.  **9.1. Log de Auditoria e Central de Aprovações:**
    *   **Descrição:** Implementar a tabela `AuditLog` e a `Central de Aprovações` para gerenciar o fluxo de alterações e registrar todas as ações importantes.
    *   **Status:** A fazer.

2.  **9.2. Camadas Visuais na Planta Baixa:**
    *   **Descrição:** Implementar a capacidade de fazer upload de uma planta baixa como imagem de fundo e criar modos de visualização como "Mapa de Calor de Temperatura" e "Consumo de Energia".
    *   **Status:** A fazer.

### Fase 10: Automação com IA e Relatórios
**Status:** `A Fazer`
Adicionar automação inteligente e capacidades de análise de dados.

1.  **10.1. Coleta de Dados com IA (Visão Computacional):**
    *   **Descrição:** Desenvolver uma funcionalidade com a câmera do dispositivo para escanear etiquetas de equipamentos e pré-preencher formulários.
    *   **Status:** A fazer.

2.  **10.2. Relatórios e Dashboards:**
    *   **Descrição:** Implementar a página `/reports` para gerar relatórios customizáveis e analisar dados de evidências com IA.
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
