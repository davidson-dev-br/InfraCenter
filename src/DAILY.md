# Registro de Daily Stand-ups

## [2024-08-10]

### O que foi feito?
- **Diagnóstico e Correção Crítica:** Após uma intensa investigação colaborativa, identificamos e corrigimos a causa raiz de todas as falhas na população de dados. O problema era um erro de digitação (`withM` em vez de `widthM`) no script de criação da tabela `Rooms`, que causava falhas em cascata.
- **Estabilização do Ambiente de DEV:** Refatoramos completamente as `server actions` de população de dados (`dev-actions.ts`) para serem 100% idempotentes (re-executáveis sem erro) e dividimos o processo em botões fracionados no menu de desenvolvedor, garantindo um ambiente de teste confiável.
- **Harmonização de Nomenclatura:** Realizamos uma varredura completa no projeto para padronizar o uso de `widthM` (no banco de dados) e `comprimento` (no frontend), eliminando a inconsistência que causava bugs recorrentes.

### Foco do Dia: Construir a Interface da Central de Incidentes (`/incidents`)

O sistema já gera incidentes automaticamente para conexões não resolvidas. O objetivo de hoje é criar a tabela e os componentes visuais na página `/incidents` para que os usuários possam ver, filtrar e entender os incidentes de integridade de dados que foram abertos.

### Plano Específico (Step-by-Step)
1.  **Estrutura da Página:** Criar o layout principal da página usando um `Card` como container.
2.  **Busca de Dados:** Implementar a busca de dados no servidor (Server-Side Rendering) chamando a `server action` `getIncidents()` para obter a lista de incidentes.
3.  **Tabela de Exibição:** Usar o componente `Table` para listar os incidentes com colunas claras: Descrição, Status, Severidade, Data de Detecção e Data de Resolução.
4.  **Indicadores Visuais:** Criar `Badges` e ícones coloridos para os campos de "Status" e "Severidade" para facilitar a identificação rápida de problemas críticos.
5.  **Estado Vazio:** Garantir que a página exiba uma mensagem informativa caso nenhum incidente seja encontrado.

### Impedimentos
- Nenhum. O fluxo de desenvolvimento está estável.

---

## [2024-08-09]

### Foco do Dia: Construir a Interface da Central de Incidentes (`/incidents`)

O sistema já gera incidentes automaticamente para conexões não resolvidas. O objetivo de hoje é criar a tabela e os componentes visuais na página `/incidents` para que os usuários possam ver, filtrar e entender os incidentes de integridade de dados que foram abertos.

### Plano Específico (Step-by-Step)
1.  **Estrutura da Página:** Criar o layout principal da página usando um `Card` como container.
2.  **Busca de Dados:** Implementar a busca de dados no servidor (Server-Side Rendering) chamando a `server action` `getIncidents()` para obter a lista de incidentes.
3.  **Tabela de Exibição:** Usar o componente `Table` para listar os incidentes com colunas claras: Descrição, Status, Severidade, Data de Detecção e Data de Resolução.
4.  **Indicadores Visuais:** Criar `Badges` e ícones coloridos para os campos de "Status" e "Severidade" para facilitar a identificação rápida de problemas críticos.
5.  **Estado Vazio:** Garantir que a página exiba uma mensagem informativa caso nenhum incidente seja encontrado.

### Impedimentos
- Nenhum. O fluxo de desenvolvimento está estável.

---

## [2024-08-08]

### Foco do Dia
- **Reunião de Alinhamento sobre Autenticação:**
  - Discutir a questão levantada sobre a unificação de logins (Microsoft e E-mail/Senha) para o mesmo endereço de e-mail.
  - Definir a arquitetura final do sistema de login e criação de usuários.

### Planos e Possibilidades para Discussão
- **Cenário 1: Unificação de Contas (Account Linking)**
  - **O que é?** Permitir que um usuário com o mesmo e-mail possa logar com diferentes "provedores" (Microsoft, Google, E-mail/Senha) e acessar a mesma conta no sistema.
  - **Como funciona?** O Firebase permite vincular múltiplas credenciais a uma única conta de usuário. Quando um usuário tenta fazer login com um novo método (ex: senha) e o Firebase detecta que o e-mail já existe (ex: de um login Microsoft), ele retorna um erro específico. Podemos capturar esse erro e guiar o usuário para "vincular" a nova forma de login à sua conta existente.
  - **Vantagens:** Experiência de usuário fluida e flexível. Um único registro de usuário no nosso sistema para múltiplos métodos de login.
  - **Complexidade:** Requer uma lógica mais elaborada na tela de login para tratar o erro de "conta já existe" e guiar o usuário na vinculação.

- **Cenário 2: Login Único Dedicado (E-mail/Senha)**
  - **O que é?** Manter apenas o sistema de E-mail/Senha, removendo completamente a opção de login via Microsoft.
  - **Como funciona?** Um administrador cria o usuário (nome, e-mail, senha, cargo) diretamente no InfraVision. A aplicação, por baixo dos panos, cria o usuário tanto no Firebase Auth quanto no nosso banco de dados.
  - **Vantagens:** Simplicidade e controle total do ciclo de vida do usuário dentro da aplicação, alinhado com outras aplicações da TIM.
  - **Complexidade:** Menor complexidade de implementação no frontend, mas maior responsabilidade na gestão de senhas (criação, reset, etc.).

- **Cenário 3: Manter Ambos, mas Separados**
  - **O que é?** Manter os dois métodos de login, mas tratá-los como contas completamente separadas, mesmo que usem o mesmo e-mail.
  - **Como funciona?** O estado atual. Um usuário que se cadastra com Microsoft é diferente de um usuário que se cadastra com e-mail/senha, mesmo com e-mails idênticos.
  - **Vantagens:** Simples de manter.
  - **Complexidade:** Pode ser confuso para o usuário e levar a dados duplicados ou problemas de acesso como o que foi observado. **(Não recomendado)**

### Impedimentos
- A falta de uma decisão final sobre a arquitetura de login está gerando retrabalho. Esta reunião é crucial para definir o caminho e avançar com confiança.

---

## [2024-08-07]

### O que foi feito hoje?
- **Finalizada a Interface De/Para (`/depara`):**
  - Implementada a lógica de "Conexão Rápida" e "Conexão com Evidência".
  - Criado o modal para upload de imagem e texto da etiqueta.
- **Implementado o Fluxo de "Conexão Não Resolvida":**
  - Modificado o banco de dados e a `server action` `createConnection` para permitir o registro de apenas um lado da conexão.
  - Implementada a geração automática de um "incidente de integridade" quando uma conexão é salva como não resolvida.
- **Alinhamento Estratégico:**
  - Redefinimos o propósito da página `/connections` para ser um "Inventário de Portas" central.
  - A página `/depara` foi confirmada como a "Central de Conexões" para criar e visualizar ligações.
- **Correção de Bugs:** Resolvidos erros de schema no banco de dados relacionados à tabela `Connections`.

### Foco do Dia
- **Avançar na Interface De/Para:** Implementar a lógica para criar e visualizar conexões na página `/depara`.

### Impedimentos
- Nenhum. O alinhamento sobre o propósito das páginas de conexões e de/para foi crucial e nos colocou no caminho certo.

---

## [2024-08-06]

### O que foi feito hoje?
- **Definida a estrutura da tabela `EquipmentPorts`**:
  - Adicionado o comando `CREATE TABLE` no arquivo `user-service.ts` para garantir que a tabela seja criada se não existir.
  - Atualizado o script de infraestrutura `infra_setup.sql` na pasta `/public` para incluir a nova tabela.
  - A tabela possui chaves estrangeiras para `ChildItems` e `PortTypes`, estabelecendo a base para o relacionamento de conexões.
- **Atualizada a Documentação**:
  - O `ARCHITECTURE.md` foi atualizado para marcar a fase `7.3` como concluída.
  - A `DAILY.md` foi atualizada com o progresso de hoje.

### Foco do Dia
- **Criar a tabela `EquipmentPorts` no banco de dados**:
    - **Objetivo:** Estabelecer a tabela que armazenará cada porta individual dos equipamentos, preparando o terreno para o mapeamento De/Para.

### Impedimentos
- Nenhum.

---

## [2024-08-05]

### O que foi feito hoje?
- **Implementado o CRUD completo para "Tipos de Porta"**:
  - Criada a tabela `PortTypes` no banco de dados.
  - Desenvolvidas as `server actions` para adicionar, editar e excluir tipos de porta.
  - Construída a interface (tabela e modais) na aba "Gerenciamento de Conexões" da página de Sistema.
- **Implementado o CRUD completo para "Tipos de Conexão"**:
  - Criada a tabela `ConnectionTypes` no banco de dados.
  - Desenvolvidas as `server actions` para o CRUD de tipos de conexão.
  - Construída a interface completa na página de Sistema.
- **Melhorias de Robustez e Experiência do Usuário**:
  - Aumentado o timeout da conexão com o banco de dados para evitar falhas por lentidão.
  - Implementada uma página de erro global (`error.tsx`) para capturar falhas e permitir que o usuário tente novamente.
  - Criada uma página `404 Not Found` personalizada.
  - Ajustada a inicialização do servidor para não travar caso o banco de dados esteja indisponível.
- **Atualizada a Documentação**:
  - O `ARCHITECTURE.md` foi atualizado para refletir a conclusão das tarefas de "Tipos de Porta" e "Tipos de Conexão".

### Foco do Dia
- **Finalizar as fundações de conectividade na página `/system`**:
    - **Objetivo:** Construir a lógica e a interface para gerenciar `PortTypes` e `ConnectionTypes`.

### Impedimentos
- Nenhum.

---

## [2024-08-02] - Post-Mortem & Replanejamento

### O que foi feito?
- **Imprevisto Crítico:** O banco de dados do Azure SQL atingiu o limite da cota gratuita e foi pausado.
- **Tentativa de Solução (SQLite):** Tentamos implementar uma solução dinâmica com SQLite para continuar o desenvolvimento. A tentativa falhou, introduzindo instabilidade e erros de `Must declare the scalar variable "@undefined"`.
- **Ação Corretiva:** Revertemos com sucesso todas as alterações relacionadas ao SQLite, retornando a aplicação a um estado estável, conectada apenas ao Azure SQL (que já foi reativado).
- **Reunião de Análise (Post-Mortem):**
  - **Causa Raiz do Erro:** O problema não era o SQLite, mas a tentativa de usar um cookie (informação do lado do cliente) para controlar dinamicamente a conexão do banco de dados no servidor. Isso gerou um conflito com o ciclo de vida de renderização do Next.js.
  - **Aprendizados:** A troca de dependências críticas como o banco de dados exige um planejamento de arquitetura cuidadoso. A estabilidade do ambiente de desenvolvimento é prioritária.
  - **Nova Proposta (MySQL):** Discutimos a viabilidade de usar um servidor MySQL local como ambiente de desenvolvimento, que simula melhor o ambiente de produção.
- **Decisão:** Manter o desenvolvimento no Azure SQL por enquanto para garantir estabilidade. Planejar uma futura implementação de um ambiente de desenvolvimento local com MySQL, usando variáveis de ambiente (`.env.local`) para a troca, uma abordagem mais robusta.

### Foco do Dia (Revisado)
- **Finalizar a configuração da página de Equipamentos no menu principal:**
  - O objetivo era construir a lógica de "Modelos", que depende de "Fabricantes".
  - Isso nos permitiria, no futuro, popular automaticamente as portas de um equipamento quando ele for adicionado ao inventário.
- **Estruturar o "backend" (configurações) da página de Conexões dentro da página de Sistema.**

### Plano Específico (Step-by-Step)
1.  **Implementar o CRUD para a entidade "Modelos"**:
    - Criar a tabela `Models` no banco de dados.
    - Desenvolver as ações de servidor (`addModel`, `updateModel`, `deleteModel`).
    - Construir a interface na página `/system` (tabela, botões e diálogos).
    - Garantir que cada "Modelo" seja vinculado a um "Fabricante" existente através de um `select`.
2.  **Definir a Base para Portas Padrão**:
    - No diálogo de criação/edição de Modelos, adicionar um campo (provavelmente um `textarea`) onde o usuário possa definir a configuração de portas padrão (ex: `24xRJ45;4xSFP+`).
    - Salvar essa configuração como um campo de texto no registro do Modelo.
3.  **Testar e validar** a funcionalidade completa de Fabricantes e a nova gestão de Modelos.

### Impedimentos
- O imprevisto com o banco de dados foi contornado e agora serve como um importante aprendizado de arquitetura.
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
