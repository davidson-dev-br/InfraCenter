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
