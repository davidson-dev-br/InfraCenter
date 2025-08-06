-- InfraVision Database Setup Script
-- Gerado em: 2024-08-12
-- Este script cria todas as tabelas necessárias e popula dados essenciais.

-- Tabela de Usuários
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users')
BEGIN
    CREATE TABLE Users (
        id NVARCHAR(100) PRIMARY KEY,
        email NVARCHAR(255) NOT NULL UNIQUE,
        displayName NVARCHAR(255),
        photoURL NVARCHAR(MAX),
        role NVARCHAR(50) NOT NULL,
        permissions NVARCHAR(MAX),
        accessibleBuildingIds NVARCHAR(MAX),
        lastLoginAt DATETIME2 NOT NULL,
        preferences NVARCHAR(MAX),
        isTestData BIT NOT NULL DEFAULT 0
    );
END
GO

-- Tabela de Prédios
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Buildings')
BEGIN
    CREATE TABLE Buildings (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        address NVARCHAR(255),
        isTestData BIT NOT NULL DEFAULT 0
    );
END
GO

-- Tabela de Salas
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Rooms')
BEGIN
    CREATE TABLE Rooms (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        buildingId NVARCHAR(50) NOT NULL,
        largura FLOAT,
        widthM FLOAT,
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
END
GO

-- Tabela de Tipos de Item (Planta Baixa)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ItemTypes')
BEGIN
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
        isTestData BIT NOT NULL DEFAULT 0,
        defaultColor NVARCHAR(50)
    );
END
GO

-- Tabela de Tipos de Equipamento (Aninhados)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ItemTypesEqp')
BEGIN
    CREATE TABLE ItemTypesEqp (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        category NVARCHAR(100) NOT NULL,
        defaultWidthM FLOAT NOT NULL,
        defaultHeightM FLOAT NOT NULL,
        iconName NVARCHAR(50),
        status NVARCHAR(50) NOT NULL DEFAULT 'active',
        isTestData BIT NOT NULL DEFAULT 0,
        defaultColor NVARCHAR(50)
    );
END
GO

-- Tabela de Fabricantes
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Manufacturers')
BEGIN
    CREATE TABLE Manufacturers (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        isTestData BIT NOT NULL DEFAULT 0
    );
END
GO

-- Tabela de Modelos
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Models')
BEGIN
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
END
GO

-- Tabela de Status de Itens
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ItemStatuses')
BEGIN
    CREATE TABLE ItemStatuses (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(255),
        color NVARCHAR(20) NOT NULL,
        isArchived BIT NOT NULL DEFAULT 0,
        isDefault BIT NOT NULL DEFAULT 0
    );
END
GO

-- Tabela de Itens Pai (Planta Baixa)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ParentItems')
BEGIN
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
        FOREIGN KEY (roomId) REFERENCES Rooms(id) ON DELETE SET NULL,
        FOREIGN KEY (status) REFERENCES ItemStatuses(id)
    );
END
GO

-- Tabela de Itens Filho (Aninhados)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ChildItems')
BEGIN
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
        FOREIGN KEY (parentId) REFERENCES ParentItems(id) ON DELETE CASCADE,
        FOREIGN KEY (status) REFERENCES ItemStatuses(id)
    );
END
GO

-- Tabela de Tipos de Porta
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PortTypes')
BEGIN
    CREATE TABLE PortTypes (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(255),
        isDefault BIT NOT NULL DEFAULT 0
    );
END
GO

-- Tabela de Tipos de Conexão
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ConnectionTypes')
BEGIN
    CREATE TABLE ConnectionTypes (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(255),
        isDefault BIT NOT NULL DEFAULT 0
    );
END
GO

-- Tabela de Portas de Equipamentos
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'EquipmentPorts')
BEGIN
    CREATE TABLE EquipmentPorts (
        id NVARCHAR(50) PRIMARY KEY,
        childItemId NVARCHAR(50) NOT NULL,
        portTypeId NVARCHAR(50) NOT NULL,
        label NVARCHAR(100) NOT NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'down',
        connectedToPortId NVARCHAR(50),
        notes NVARCHAR(MAX),
        FOREIGN KEY (childItemId) REFERENCES ChildItems(id) ON DELETE CASCADE,
        FOREIGN KEY (portTypeId) REFERENCES PortTypes(id),
        FOREIGN KEY (connectedToPortId) REFERENCES EquipmentPorts(id),
        UNIQUE(connectedToPortId)
    );
END
GO

-- Tabela de Conexões
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Connections')
BEGIN
    CREATE TABLE Connections (
        id NVARCHAR(50) PRIMARY KEY,
        portA_id NVARCHAR(50) NOT NULL,
        portB_id NVARCHAR(50),
        connectionTypeId NVARCHAR(50) NOT NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'active',
        isTestData BIT NOT NULL DEFAULT 0,
        imageUrl NVARCHAR(MAX),
        labelText NVARCHAR(255),
        FOREIGN KEY (portA_id) REFERENCES EquipmentPorts(id),
        FOREIGN KEY (portB_id) REFERENCES EquipmentPorts(id),
        FOREIGN KEY (connectionTypeId) REFERENCES ConnectionTypes(id),
        UNIQUE (portA_id),
        UNIQUE (portB_id)
    );
END
GO

-- Tabela de Status de Incidentes
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'IncidentStatuses')
BEGIN
    CREATE TABLE IncidentStatuses (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(255),
        color NVARCHAR(20) NOT NULL,
        iconName NVARCHAR(50),
        isDefault BIT NOT NULL DEFAULT 0
    );
END
GO

-- Tabela de Severidades de Incidentes
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'IncidentSeverities')
BEGIN
    CREATE TABLE IncidentSeverities (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(255),
        color NVARCHAR(20) NOT NULL,
        rank INT NOT NULL UNIQUE,
        isDefault BIT NOT NULL DEFAULT 0
    );
END
GO

-- Tabela de Incidentes
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Incidents')
BEGIN
    CREATE TABLE Incidents (
        id NVARCHAR(50) PRIMARY KEY,
        description NVARCHAR(MAX) NOT NULL,
        severityId NVARCHAR(50) NOT NULL,
        statusId NVARCHAR(50) NOT NULL,
        detectedAt DATETIME2 NOT NULL,
        resolvedAt DATETIME2 NULL,
        entityType NVARCHAR(50),
        entityId NVARCHAR(100),
        FOREIGN KEY (severityId) REFERENCES IncidentSeverities(id),
        FOREIGN KEY (statusId) REFERENCES IncidentStatuses(id)
    );
END
GO

-- Tabela de Aprovações
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Approvals')
BEGIN
    CREATE TABLE Approvals (
        id NVARCHAR(50) PRIMARY KEY,
        entityType NVARCHAR(50) NOT NULL,
        entityId NVARCHAR(100) NOT NULL,
        requestedByUserId NVARCHAR(100) NOT NULL,
        requestedByUserDisplayName NVARCHAR(255),
        requestedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        status NVARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        details NVARCHAR(MAX),
        resolvedByUserId NVARCHAR(100),
        resolvedByUserDisplayName NVARCHAR(255),
        resolvedAt DATETIME2,
        resolverNotes NVARCHAR(MAX)
    );
END
GO

-- Tabela de Auditoria
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AuditLog')
BEGIN
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
END
GO

-- Tabela de Evidências (para auditoria futura)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Evidence')
BEGIN
    CREATE TABLE Evidence (
        id NVARCHAR(50) PRIMARY KEY,
        incidentId NVARCHAR(50) NOT NULL,
        timestamp DATETIME2 NOT NULL,
        type NVARCHAR(50) NOT NULL,
        data NVARCHAR(MAX) NOT NULL,
        FOREIGN KEY (incidentId) REFERENCES Incidents(id) ON DELETE CASCADE
    );
END
GO

-- Tabela de Sensores (para telemetria futura)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Sensors')
BEGIN
    CREATE TABLE Sensors (
        id NVARCHAR(50) PRIMARY KEY,
        itemId NVARCHAR(50) NOT NULL,
        type NVARCHAR(100) NOT NULL,
        value FLOAT,
        unit NVARCHAR(20),
        lastReading DATETIME2,
        FOREIGN KEY (itemId) REFERENCES ParentItems(id) ON DELETE CASCADE
    );
END
GO

-- Populando dados padrão
MERGE INTO ItemStatuses AS Target
USING (VALUES
    ('draft', 'Rascunho', 'Item recém-criado, aguardando submissão.', 'amber', 0, 1),
    ('pending_approval', 'Pendente', 'Item submetido, aguardando aprovação.', 'yellow', 0, 1),
    ('active', 'Ativo', 'Item aprovado e operacional.', 'green', 0, 1),
    ('maintenance', 'Manutenção', 'Item em manutenção, temporariamente indisponível.', 'orange', 0, 1),
    ('decommissioned', 'Descomissionado', 'Item removido e movido para a lixeira.', 'gray', 1, 1)
) AS Source (id, name, description, color, isArchived, isDefault)
ON Target.id = Source.id
WHEN NOT MATCHED BY TARGET THEN
    INSERT (id, name, description, color, isArchived, isDefault)
    VALUES (Source.id, Source.name, Source.description, Source.color, Source.isArchived, Source.isDefault);
GO

MERGE INTO PortTypes AS Target
USING (VALUES
    ('port_rj45', 'RJ45', 'Conector de rede padrão para cabos UTP (par trançado).', 1),
    ('port_sfp', 'SFP/SFP+', 'Conector para transceptores ópticos ou de cobre de pequena dimensão.', 1)
) AS Source (id, name, description, isDefault)
ON Target.id = Source.id
WHEN NOT MATCHED BY TARGET THEN
    INSERT (id, name, description, isDefault)
    VALUES (Source.id, Source.name, Source.description, Source.isDefault);
GO

MERGE INTO ConnectionTypes AS Target
USING (VALUES
    ('conn_utp', 'Dados UTP', 'Conexão de dados via cabo de par trançado.', 1),
    ('conn_fibra', 'Fibra Óptica', 'Conexão de dados via fibra óptica monomodo ou multimodo.', 1)
) AS Source (id, name, description, isDefault)
ON Target.id = Source.id
WHEN NOT MATCHED BY TARGET THEN
    INSERT (id, name, description, isDefault)
    VALUES (Source.id, Source.name, Source.description, Source.isDefault);
GO

MERGE INTO IncidentStatuses AS Target
USING (VALUES
    ('open', 'Aberto', 'O incidente foi detectado e precisa de atenção.', 'red', 'AlertTriangle', 1),
    ('investigating', 'Investigando', 'Alguém está ativamente trabalhando no incidente.', 'yellow', 'Clock', 1),
    ('closed', 'Fechado', 'O incidente foi resolvido.', 'green', 'CheckCircle', 1)
) AS Source (id, name, description, color, iconName, isDefault)
ON Target.id = Source.id
WHEN NOT MATCHED BY TARGET THEN
    INSERT (id, name, description, color, iconName, isDefault)
    VALUES (Source.id, Source.name, Source.description, Source.color, Source.iconName, Source.isDefault);
GO

MERGE INTO IncidentSeverities AS Target
USING (VALUES
    ('critical', 'Crítica', 'Impacto severo no serviço.', 'red', 1, 1),
    ('high', 'Alta', 'Impacto significativo no serviço.', 'orange', 2, 1),
    ('medium', 'Média', 'Impacto moderado, pode se tornar crítico.', 'yellow', 3, 1),
    ('low', 'Baixa', 'Baixo impacto, não afeta o serviço diretamente.', 'blue', 4, 1)
) AS Source (id, name, description, color, rank, isDefault)
ON Target.id = Source.id
WHEN NOT MATCHED BY TARGET THEN
    INSERT (id, name, description, color, rank, isDefault)
    VALUES (Source.id, Source.name, Source.description, Source.color, Source.rank, Source.isDefault);
GO

PRINT 'Script de setup do InfraVision concluído.';
GO
