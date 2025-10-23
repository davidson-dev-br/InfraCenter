<<<<<<< HEAD
# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [Unreleased]

## [2024-08-09]

### Melhorado
- **Estabilizado o Fluxo de Criação de Usuário**: Revertida a tentativa de usar o Firebase Admin SDK no servidor, que causava instabilidade.
- **Melhoria de UX**: Adicionado um diálogo de confirmação (`AlertDialog`) na criação de usuário que informa ao administrador que ele será logado como o novo usuário para fins de teste de permissão. Isso transforma o comportamento anterior (que era uma falha) em uma funcionalidade clara e intencional.

### Corrigido
- Resolvido erro "Maximum update depth exceeded" que causava um loop infinito de renderização, ajustando a lógica no `BuildingProvider`.
- Corrigida a `server action` `updateItem` que não salvava as posições `x` ou `y` quando eram `0`.
- Corrigido o erro "Usuário não autenticado" ao salvar a posição de um item, passando o `userId` diretamente do cliente para a `server action`.

## [2024-08-07]

### Adicionado
- Implementado o fluxo completo de criação de conexões na página `/depara`.
- Adicionado suporte para "Conexão Rápida" e "Conexão com Evidência".
- Criado o modal de evidência com upload de imagem e campo para texto da etiqueta.
- Implementado o fluxo de "conexão não resolvida" (lado único), que gera um incidente de integridade automaticamente.
- Página `/connections` foi transformada em um "Inventário de Portas" centralizado.

### Corrigido
- Corrigida a estrutura da tabela `Connections` no banco de dados, que estava incorreta.
- Resolvidos bugs de build e de execução relacionados a colunas ausentes no banco de dados.

## [2024-08-06]

### Adicionado
- Criada a tabela `EquipmentPorts` no banco de dados para armazenar as portas individuais dos equipamentos.
- Adicionada a capacidade do sistema de gerar automaticamente as portas de um equipamento quando ele é criado com base em um `Modelo` que possui uma `portConfig` definida.

## [2024-08-05]

### Adicionado
- CRUD completo para "Tipos de Porta" (`PortTypes`) na página de Sistema.
- CRUD completo para "Tipos de Conexão" (`ConnectionTypes`) na página de Sistema.
- Adicionada página de erro global (`error.tsx`) e página `404 Not Found` personalizada.

### Melhorado
- Aumentado o timeout da conexão com o banco de dados para 30 segundos, melhorando a resiliência.

## [2024-08-02]

### Adicionado
- Implementado o CRUD completo para a entidade "Modelos", vinculando cada modelo a um "Fabricante".
- Adicionada a capacidade de definir uma configuração de portas padrão para cada modelo.

### Corrigido
- Revertida a tentativa de implementação de SQLite, estabilizando o ambiente de desenvolvimento de volta ao Azure SQL.

## [2024-08-01]

### Adicionado
- Gerenciador de Fabricantes na página de Sistema (`/system`).
- Separação da lógica de tipos de item em `ItemTypes` (planta baixa) e `ItemTypesEqp` (equipamentos aninhados).
- Adicionada aba "Atributos" na página de Sistema para centralizar a gestão de listas.

### Corrigido
- Consulta à tabela de tipos de item da planta baixa (`ItemTypes`).
- Atualização automática da UI após editar um tipo de item.

## [2024-07-31]

### Adicionado
- Implementação da separação de `Items` para `ParentItems` e `ChildItems` no banco de dados e na UI.
- Adição da configuração de colunas visíveis para as tabelas de inventário na página `/system`.
- Estruturação da página de Lixeira (`/trash`) para itens descomissionados.

## [2024-07-30]

### Adicionado
- Implementação do sistema de autenticação via Firebase com provedor Microsoft.
- Criação do sistema de controle de acesso baseado em cargos (RBAC) e por prédios.
- Estruturação das páginas de Usuários (`/users`) e Permissões (`/permissions`).
- Lógica inicial de `AuthProvider` e `PermissionsProvider`.

## [2024-07-29]

### Adicionado
- Criação da estrutura inicial do projeto com Next.js, TypeScript e ShadCN.
- Implementação da planta baixa interativa com grid, zoom e movimentação.
- Criação das tabelas iniciais no banco de dados para Prédios, Salas e Itens.
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
=======
# Histórico de Alterações - InfraCenter Manager

## [v4.0] - 2024-07-29

### ✨ Adicionado
- **Página de Ajuda e Documentação**: Uma nova seção dedicada a guiar os usuários, com manuais para download e tutoriais de funcionalidades.
- **Executor de Migrações de Banco de Dados**: Ferramenta de desenvolvedor para atualizar a estrutura de dados de forma segura, com análise prévia e confirmação.
- **Laboratório de Treinamento de IA (Learning Machine)**: Página dedicada para treinar a IA a ler etiquetas de cabos através de captura de vídeo e correção manual.
- **Testador de Fluxos de IA Aprimorado**: Agora permite edição de prompts em tempo real, upload de imagens e salvamento das alterações no banco de dados.
- **Download de Documentos**: Funcionalidade na página de Ajuda para baixar `README.md` e `CHANGELOG.md`.

### 🔄 Alterado
- **Fluxos de IA Dinâmicos**: Os prompts da IA agora são carregados do banco de dados, permitindo edições sem a necessidade de reimplantar a aplicação.
- **Segurança do Executor de Migrações**: O processo de migração agora é feito em duas etapas (Analisar e Executar) para evitar ações acidentais.
- **Interface do Testador de Fluxos**: Nomes dos fluxos foram atualizados para serem mais intuitivos e descritivos.
- **Prompts da IA**: Prompts padrão foram traduzidos para o português para melhor performance e clareza.

### 🐞 Corrigido
- Corrigidos múltiplos erros de build e runtime relacionados a importações de módulos e à diretiva "use server".
- Estrutura de schemas de IA foi refatorada para um arquivo central (`src/ai/schemas.ts`) para resolver conflitos de exportação.

---

## [v3.2.6] - 2024-07-28

- Versão inicial do projeto com as funcionalidades principais de gerenciamento de datacenter, planta baixa interativa, inventário de equipamentos e gerenciamento de conexões.
>>>>>>> d3ee8b12c20e0454b2def011137783add0a5af09
