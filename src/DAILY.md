# Registro de Daily Stand-ups

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

## [2024-08-01]

### O que foi feito?
- Separada a lógica de tipos de item em duas tabelas distintas: `ItemTypes` (para a planta baixa) e `ItemTypesEqp` (para equipamentos aninhados), tornando o sistema mais robusto.
- Criado o gerenciador completo (CRUD) para a entidade "Fabricantes" na nova aba "Atributos" da página `/system`.
- Reorganizada a UI da página `/system` com abas para melhor navegação.
- Corrigidos bugs na exibição e atualização da tabela de tipos de item.

### Foco do Dia
- Implementar o gerenciador de "Fabricantes" e corrigir bugs da interface.

### Impedimentos
- A lógica de exibição dos tipos de item estava incorreta após a refatoração, o que foi resolvido.

---

## [2024-07-31]

### O que foi feito?
- Atualizada a documentação (`ARCHITECTURE.md`) para refletir o progresso e os novos planos.
- Esclarecida a separação entre itens da planta baixa e itens aninhados.
- Discutida a necessidade de criar listas de atributos (Fabricantes, Modelos) para padronizar a entrada de dados.

### Foco do Dia
- Alinhar a comunicação e a documentação.
- Planejar os próximos passos para a página `/system`.

### Impedimentos
- Havia uma pequena confusão sobre a estratégia para os modais e a página de sistema, que foi esclarecida.
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
