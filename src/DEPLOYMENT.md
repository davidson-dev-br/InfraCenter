# Guia de Implantação e Transferência

Este documento descreve os passos essenciais para transferir a aplicação **InfraVision** para o seu repositório no GitHub.

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