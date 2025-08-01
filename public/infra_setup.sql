-- =================================================================
-- Script de Setup da Infraestrutura - InfraVision
-- Autor: Davidson Santos Conceição
-- Gerado por: Firebase Studio AI
-- Versão: 1.0
--
-- INSTRUÇÕES:
-- 1. Execute este script em um banco de dados SQL Server limpo.
-- 2. Após a execução, a estrutura básica estará pronta.
-- 3. IMPORTANTE: O primeiro login deve ser feito com o usuário
--    padrão 'dev@dev.com'. Assim que acessar o sistema, crie seu
--    próprio usuário administrador e, se possível, desative ou
--    remova o usuário padrão por segurança.
-- =================================================================

-- Tabela de Usuários
PRINT 'Criando tabela Users...';
CREATE TABLE Users (
    id NVARCHAR(100) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    displayName NVARCHAR(255),
    photoURL NVARCHAR(MAX),
    role NVARCHAR(50) NOT NULL,
    lastLoginAt DATETIME2 NOT NULL,
    permissions NVARCHAR(MAX),
    accessibleBuildingIds NVARCHAR(MAX),
    preferences NVARCHAR(MAX),
    isTestData BIT NOT NULL DEFAULT 0
);
GO

-- Tabela de Prédios
PRINT 'Criando tabela Buildings...';
CREATE TABLE Buildings (
    id NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    address NVARCHAR(255),
    isTestData BIT NOT NULL DEFAULT 0
);
GO

-- Tabela de Salas
PRINT 'Criando tabela Rooms...';
CREATE TABLE Rooms (
    id NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    buildingId NVARCHAR(50) NOT NULL,
    widthM FLOAT,
    largura FLOAT,
    tileWidthCm FLOAT,
    tileHeightCm FLOAT,
    xAxisNaming NVARCHAR(20) DEFAULT 'alpha',
    yAxisNaming NVARCHAR(20) DEFAULT 'numeric',
    backgroundImageUrl NVARCHAR(MAX),
    backgroundScale FLOAT,
    backgroundPosX FLOAT,
    backgroundPosY FLOAT,
    isTestData BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (buildingId) REFERENCES Buildings(id) ON DELETE CASCADE
);
GO

-- Tabela de Status dos Itens
PRINT 'Criando tabela ItemStatuses...';
CREATE TABLE ItemStatuses (
    id NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(255),
    color NVARCHAR(20) NOT NULL,
    isArchived BIT NOT NULL DEFAULT 0,
    isDefault BIT NOT NULL DEFAULT 0
);
GO

-- Tabela de Tipos de Itens (Planta Baixa)
PRINT 'Criando tabela ItemTypes...';
CREATE TABLE ItemTypes (
    id NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    category NVARCHAR(100) NOT NULL,
    defaultWidthM FLOAT NOT NULL,
    defaultHeightM FLOAT NOT NULL,
    iconName NVARCHAR(50),
    canHaveChildren BIT NOT NULL DEFAULT 0,
    isResizable BIT NOT NULL DEFAULT 1,
    status NVARCHAR(50) NOT NULL DEFAULT 'active',
    defaultColor NVARCHAR(50),
    isTestData BIT NOT NULL DEFAULT 0
);
GO

-- Tabela de Tipos de Equipamentos Aninhados
PRINT 'Criando tabela ItemTypesEqp...';
CREATE TABLE ItemTypesEqp (
    id NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    category NVARCHAR(100) NOT NULL,
    defaultWidthM FLOAT NOT NULL,
    defaultHeightM FLOAT NOT NULL,
    iconName NVARCHAR(50),
    status NVARCHAR(50) NOT NULL DEFAULT 'active',
    defaultColor NVARCHAR(50),
    isTestData BIT NOT NULL DEFAULT 0
);
GO

-- Tabela de Itens Pais (Planta Baixa)
PRINT 'Criando tabela ParentItems...';
CREATE TABLE ParentItems (
    id NVARCHAR(50) PRIMARY KEY,
    label NVARCHAR(100) NOT NULL,
    x INT NOT NULL DEFAULT 0,
    y INT NOT NULL DEFAULT 0,
    width FLOAT NOT NULL DEFAULT 0.6,
    height FLOAT NOT NULL DEFAULT 1.0,
    type NVARCHAR(50) NOT NULL,
    status NVARCHAR(50) NOT NULL,
    roomId NVARCHAR(50),
    serialNumber NVARCHAR(100),
    brand NVARCHAR(100),
    tag NVARCHAR(100),
    isTagEligible BIT,
    ownerEmail NVARCHAR(255),
    dataSheetUrl NVARCHAR(MAX),
    description NVARCHAR(MAX),
    imageUrl NVARCHAR(MAX),
    modelo NVARCHAR(100),
    preco FLOAT,
    trellisId NVARCHAR(100),
    tamanhoU INT,
    potenciaW INT,
    color NVARCHAR(50),
    isTestData BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (roomId) REFERENCES Rooms(id) ON DELETE CASCADE
);
GO

-- Tabela de Itens Filhos (Aninhados)
PRINT 'Criando tabela ChildItems...';
CREATE TABLE ChildItems (
    id NVARCHAR(50) PRIMARY KEY,
    label NVARCHAR(100) NOT NULL,
    parentId NVARCHAR(50) NOT NULL,
    type NVARCHAR(50) NOT NULL,
    status NVARCHAR(50) NOT NULL,
    serialNumber NVARCHAR(100),
    brand NVARCHAR(100),
    tag NVARCHAR(100),
    isTagEligible BIT,
    ownerEmail NVARCHAR(255),
    dataSheetUrl NVARCHAR(MAX),
    description NVARCHAR(MAX),
    imageUrl NVARCHAR(MAX),
    modelo NVARCHAR(100),
    preco FLOAT,
    trellisId NVARCHAR(100),
    tamanhoU INT,
    posicaoU INT,
    isTestData BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (parentId) REFERENCES ParentItems(id) ON DELETE CASCADE
);
GO

-- Tabela de Fabricantes
PRINT 'Criando tabela Manufacturers...';
CREATE TABLE Manufacturers (
    id NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE
);
GO

-- Tabela de Modelos
PRINT 'Criando tabela Models...';
CREATE TABLE Models (
    id NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    manufacturerId NVARCHAR(50) NOT NULL,
    portConfig NVARCHAR(MAX),
    tamanhoU INT,
    isTestData BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (manufacturerId) REFERENCES Manufacturers(id) ON DELETE CASCADE,
    UNIQUE (name, manufacturerId)
);
GO

-- Tabela de Tipos de Porta
PRINT 'Criando tabela PortTypes...';
CREATE TABLE PortTypes (
    id NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(255),
    isDefault BIT NOT NULL DEFAULT 0
);
GO

-- Tabela de Tipos de Conexão
PRINT 'Criando tabela ConnectionTypes...';
CREATE TABLE ConnectionTypes (
    id NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(255),
    isDefault BIT NOT NULL DEFAULT 0
);
GO

-- Tabela de Conexões (Exemplo básico, pode ser expandida)
PRINT 'Criando tabela Connections...';
CREATE TABLE Connections (
    id NVARCHAR(50) PRIMARY KEY,
    label NVARCHAR(100) NOT NULL,
    fromItemId NVARCHAR(50) NOT NULL,
    fromPortId NVARCHAR(50) NOT NULL,
    toItemId NVARCHAR(50) NOT NULL,
    toPortId NVARCHAR(50) NOT NULL,
    connectionTypeId NVARCHAR(50) NOT NULL,
    status NVARCHAR(50),
    FOREIGN KEY (fromItemId) REFERENCES ParentItems(id), -- Simplificado
    FOREIGN KEY (toItemId) REFERENCES ParentItems(id),   -- Simplificado
    FOREIGN KEY (connectionTypeId) REFERENCES ConnectionTypes(id)
);
GO

-- Tabela de Log de Auditoria
PRINT 'Criando tabela AuditLog...';
CREATE TABLE AuditLog (
    id INT IDENTITY(1,1) PRIMARY KEY,
    timestamp DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    userId NVARCHAR(100) NOT NULL,
    userDisplayName NVARCHAR(255),
    action NVARCHAR(255) NOT NULL,
    entityType NVARCHAR(50),
    entityId NVARCHAR(100),
    details NVARCHAR(MAX)
);
GO

-- Tabela de Incidentes
PRINT 'Criando tabela Incidents...';
CREATE TABLE Incidents (
    id NVARCHAR(50) PRIMARY KEY,
    description NVARCHAR(MAX) NOT NULL,
    severity NVARCHAR(50) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    status NVARCHAR(50) NOT NULL CHECK (status IN ('open', 'investigating', 'closed')),
    detectedAt DATETIME2 NOT NULL,
    resolvedAt DATETIME2,
    entityType NVARCHAR(50),
    entityId NVARCHAR(100)
);
GO

-- Tabela de Evidências (para Incidentes)
PRINT 'Criando tabela Evidence...';
CREATE TABLE Evidence (
    id NVARCHAR(50) PRIMARY KEY,
    incidentId NVARCHAR(50) NOT NULL,
    timestamp DATETIME2 NOT NULL,
    type NVARCHAR(50) NOT NULL,
    data NVARCHAR(MAX) NOT NULL,
    FOREIGN KEY (incidentId) REFERENCES Incidents(id) ON DELETE CASCADE
);
GO

-- Tabela de Sensores
PRINT 'Criando tabela Sensors...';
CREATE TABLE Sensors (
    id NVARCHAR(50) PRIMARY KEY,
    itemId NVARCHAR(50) NOT NULL,
    type NVARCHAR(100) NOT NULL,
    value FLOAT,
    unit NVARCHAR(20),
    lastReading DATETIME2,
    FOREIGN KEY (itemId) REFERENCES ParentItems(id) ON DELETE CASCADE
);
GO

-- =================================================================
-- INSERÇÃO DE DADOS INICIAIS
-- =================================================================
PRINT 'Inserindo dados iniciais...';

-- Usuário Padrão
INSERT INTO Users (id, email, displayName, role, lastLoginAt, permissions, accessibleBuildingIds, preferences)
VALUES ('dev_user_01', 'dev@dev.com', 'Desenvolvedor Padrão', 'developer', GETUTCDATE(), '["*"]', '[]', '{}');
GO

-- Prédio e Sala Padrão
INSERT INTO Buildings (id, name, address, isTestData)
VALUES ('B_INIT_01', 'DC-TESTE', 'Endereço Inicial', 0);
GO

INSERT INTO Rooms (id, name, buildingId, isTestData)
VALUES ('R_INIT_01', 'SALA-TESTE', 'B_INIT_01', 0);
GO

-- Status Padrão para Itens
INSERT INTO ItemStatuses (id, name, description, color, isArchived, isDefault) VALUES
('draft', 'Rascunho', 'Item recém-criado, aguardando submissão.', 'amber', 0, 1),
('pending_approval', 'Pendente', 'Item submetido, aguardando aprovação.', 'yellow', 0, 1),
('active', 'Ativo', 'Item aprovado e operacional.', 'green', 0, 1),
('maintenance', 'Manutenção', 'Item em manutenção, temporariamente indisponível.', 'orange', 0, 1),
('decommissioned', 'Descomissionado', 'Item removido e movido para a lixeira.', 'gray', 1, 1);
GO

PRINT '=================================================';
PRINT 'Setup da infraestrutura concluído com sucesso!';
PRINT '=================================================';
GO
