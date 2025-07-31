# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [Unreleased]

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
