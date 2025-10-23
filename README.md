<<<<<<< HEAD
# InfraVision - Sistema de Gerenciamento de Infraestrutura de Data Center

## 1. Descrição do Projeto

**InfraVision** é uma aplicação web moderna e robusta (DCIM - Data Center Infrastructure Management) projetada para oferecer visualização, gerenciamento e automação detalhados da infraestrutura de TI em ambientes de missão crítica.

O sistema permite que operadores, técnicos e gerentes visualizem a disposição física dos equipamentos através de uma planta baixa interativa, gerenciem o inventário de ativos, controlem permissões de acesso baseadas em cargos e, futuramente, utilizem ferramentas de IA para otimizar e automatizar a coleta de dados em campo.

## 2. Documentação do Projeto

Para um entendimento completo da arquitetura, decisões de design e progresso do desenvolvimento, consulte os seguintes documentos:

- **[ARCHITECTURE.md](ARCHITECTURE.md):** Detalha a visão do projeto, o tech stack e o plano de desenvolvimento faseado.
- **[DAILY.md](DAILY.md):** Registra as discussões, metas e impedimentos das nossas reuniões diárias.
- **[CHANGELOG.md](CHANGELOG.md):** Mantém um histórico de todas as mudanças notáveis implementadas no projeto.

## 3. Stack de Tecnologia

A aplicação é construída utilizando um conjunto de tecnologias modernas, seguras e escaláveis:

- **Framework Principal:** [Next.js](https://nextjs.org/) (com App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Biblioteca de UI:** [React](https://react.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes:** [ShadCN/UI](https://ui.shadcn.com/)
- **Banco de Dados:** [Azure SQL](https://azure.microsoft.com/en-us/products/azure-sql/database/)
- **Autenticação:** [Firebase Authentication](https://firebase.google.com/docs/auth) (com provedor Microsoft)
- **Armazenamento de Arquivos:** [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)
- **Inteligência Artificial (Futuro):** [Azure AI Services](https://azure.microsoft.com/en-us/products/ai-services)

## 4. Instalação e Configuração

Para executar este projeto localmente, siga estes passos:

1.  **Clone o repositório.**
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Configure as Variáveis de Ambiente:**
    -   Copie o arquivo `.env.example` para um novo arquivo chamado `.env`.
    -   Abra o arquivo `.env` e preencha as variáveis com suas credenciais do Firebase e do Azure SQL.
4.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

## 5. Desenvolvedor Principal

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

---
*Este projeto está sendo desenvolvido no Firebase Studio.*
=======
# InfraCenter Manager v4.0

## Visão Geral

O **InfraCenter Manager** é uma aplicação web moderna e robusta, desenvolvida em Next.js e Firebase, projetada para o gerenciamento completo da infraestrutura de datacenters. A plataforma oferece uma solução visual e interativa para catalogar, organizar e documentar todos os ativos de hardware, desde racks e servidores até as conexões físicas entre eles.

Com uma forte integração de Inteligência Artificial (Google Gemini via Genkit), o sistema automatiza tarefas complexas como a extração de dados de equipamentos a partir de fotos e a importação inteligente de inventários de planilhas.

---

## Funcionalidades Principais

- **Planta Baixa Interativa**:
  - Representação visual e em escala da sala do datacenter.
  - Adicione, mova (com detecção de colisão) e edite itens como Racks, Ar Condicionados e Quadros de Força.
  - Zoom e pan para navegação fluida.
  - Suporte a múltiplas salas e prédios.

- **Gerenciamento de Ativos**:
  - **Equipamentos**: Crie um inventário detalhado de servidores, switches, roteadores, etc. Armazene informações como hostname, modelo, fabricante, número de série, posição no rack (U), e mais.
  - **Conexões**: Mapeie o cabeamento físico entre equipamentos, especificando portas de origem e destino, tipo de cabo e status da conexão.
  - **Itens da Planta**: Gerencie a disposição física dos Racks e outros elementos estruturais.

- **Inteligência Artificial (Google Gemini & Genkit)**:
  - **Adicionar Equipamento com Foto**: Tire uma foto de um equipamento e a IA preencherá automaticamente os campos de fabricante, modelo e tipo.
  - **Adicionar Conexão com Etiqueta**: Capture uma imagem de uma etiqueta de cabo (formato DE/PARA) e a IA extrairá as informações de origem e destino.
  - **Importar de Planilha**: Faça o upload de um arquivo `.xlsx` e a IA analisará as colunas, mapeará para os campos corretos e importará os equipamentos em lote.
  - **Learning Machine**: Um laboratório de treinamento dedicado onde a IA aprende a ler etiquetas de cabos com mais precisão a cada correção manual feita pelo usuário.

- **Relatórios e Exportação**:
  - Gere relatórios completos em formato HTML/PDF, prontos para impressão, incluindo inventário e assinaturas digitais.
  - Exporte dados brutos de equipamentos, itens e conexões para Excel (`.xlsx`).

- **Administração e Segurança**:
  - **Gerenciamento de Usuários**: Adicione e edite usuários do sistema.
  - **Controle de Permissões por Cargo**: Sistema granular que define o que cada cargo (Técnico, Supervisor, Gerente, Desenvolvedor) pode ver e fazer.
  - **Configurações do Sistema**: Personalize listas de opções (tipos de equipamento, status, etc.), nome e logo da empresa.
  - **Logs de Atividade e Exclusão**: Rastreie todas as ações importantes realizadas no sistema.

- **Ferramentas de Desenvolvedor**:
  - **Laboratório de Prompts**: Teste e edite os prompts de IA em tempo real, com a capacidade de salvar as alterações no banco de dados.
  - **Executor de Migrações**: Ferramenta segura em duas etapas (Analisar e Executar) para aplicar atualizações na estrutura de dados.
  - **Ações do Banco de Dados**: Popule o banco com dados de teste ou limpe a infraestrutura com segurança.

---

## Tecnologias Utilizadas

- **Framework**: Next.js (com App Router)
- **Linguagem**: TypeScript
- **Backend & Banco de Dados**: Firebase (Firestore, Authentication)
- **Inteligência Artificial**: Google Gemini Pro via Genkit
- **UI**: ShadCN UI, Tailwind CSS, Lucide Icons
- **Estado e Lógica**: React Hooks & Context API

---

## Contato do Desenvolvedor

Este projeto foi concebido e desenvolvido por:

- **Nome**: Davidson Santos Conceição
- **Telefones**: 
  - (91) 98426-0688
  - (12) 99743-4548
- **Email**: dcaonceicao_fundamentos@timbrasil.com.br
>>>>>>> d3ee8b12c20e0454b2def011137783add0a5af09
