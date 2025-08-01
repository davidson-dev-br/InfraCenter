# Guia de Implantação e Transferência

Este documento descreve os passos essenciais para implantar a aplicação **InfraVision** do zero e para transferi-la para seu próprio repositório no GitHub.

---
## Implantação Inicial do Banco de Dados

Para configurar o banco de dados pela primeira vez em um novo ambiente (local ou na nuvem), siga estes passos:

1.  **Acesse o Menu de Desenvolvedor:**
    *   No canto inferior direito da aplicação em execução, clique no ícone de engrenagem para abrir o "Dev Menu".

2.  **Baixe o Script de Infraestrutura:**
    *   Clique no botão **"Baixar Script de Infra (.sql)"**. Isso fará o download do arquivo `infra_setup.sql`.

3.  **Execute o Script no seu Banco de Dados:**
    *   Abra seu cliente de banco de dados preferido (como SQL Server Management Studio, Azure Data Studio, etc.).
    *   Conecte-se à sua instância de banco de dados SQL Server (ou Azure SQL) limpa.
    *   Abra e execute o conteúdo do arquivo `infra_setup.sql`.
    *   Este script criará todas as tabelas, relacionamentos e dados iniciais necessários para a aplicação funcionar.

4.  **Primeiro Login e Segurança:**
    *   O script cria um usuário padrão com acesso de desenvolvedor:
        *   **Email:** `dev@dev.com`
        *   **Senha:** (A autenticação é via Microsoft, então não há uma senha local)
    *   **MUITO IMPORTANTE:** Após fazer o login pela primeira vez com esta conta, acesse a página de **Gerenciamento de Usuários**, crie sua própria conta com as permissões necessárias e, em seguida, **desative ou exclua o usuário `dev@dev.com`** para garantir a segurança do seu ambiente.

---

## Como Enviar o Projeto Completo para o GitHub

Siga estes passos para enviar **todo o código do projeto** para o seu repositório `temporario` no GitHub.

1.  **Inicialize o Git (se ainda não o fez):**
    *Este comando só precisa ser executado uma vez. Se você já o executou, pode pular este passo.*
    ```bash
    git init
    ```

2.  **Conecte ao seu Repositório GitHub:**
    *Este comando diz ao Git para onde enviar seu código. Se você receber um erro dizendo que "origin already exists", pule este passo.*
    ```bash
    git remote add origin https://github.com/davidsoncabista/temporario.git
    ```

3.  **Adicione TODOS os Arquivos:**
    *O ponto `.` significa "tudo no diretório atual".*
    ```bash
    git add .
    ```

4.  **"Commite" as Mudanças:**
    *Isso cria um "pacote" de mudança com todos os seus arquivos.*
    ```bash
    git commit -m "Versão inicial do projeto InfraVision"
    ```

5.  **Defina o Ramo Principal:**
    *Isso garante que o seu ramo de trabalho principal se chame `main`, que é o padrão do GitHub.*
    ```bash
    git branch -M main
    ```

6.  **Envie para o GitHub:**
    *Este comando envia todo o seu código para o repositório `temporario`.*
    ```bash
    git push -u origin main
    ```

Após seguir estes passos, seu repositório no GitHub terá uma cópia exata do projeto, e você poderá cloná-lo para o seu computador.
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