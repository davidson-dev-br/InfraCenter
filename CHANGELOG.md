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
