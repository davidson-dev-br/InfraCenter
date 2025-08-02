-- Arquivo de Setup de Infraestrutura para InfraVision
-- Gerado por davidson.dev.br via Firebase Studio
-- Versão: 2024-08-06

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
END;

-- Tabela de Prédios
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Buildings')
BEGIN
    CREATE TABLE Buildings (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        address NVARCHAR(255),
        isTestData BIT NOT NULL DEFAULT 0
    );
END;

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
END;

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
END;

-- Tabela de Tipos de Equipamentos (Aninhados)
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
END;

-- Tabela de Fabricantes
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Manufacturers')
BEGIN
    CREATE TABLE Manufacturers (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        isTestData BIT NOT NULL DEFAULT 0
    );
END;

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
END;

-- Tabela de Itens Pais (Planta Baixa)
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
        FOREIGN KEY (roomId) REFERENCES Rooms(id) ON DELETE CASCADE
    );
END;

-- Tabela de Itens Filhos (Aninhados)
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
        FOREIGN KEY (parentId) REFERENCES ParentItems(id) ON DELETE CASCADE
    );
END;

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
END;

-- Tabela de Tipos de Porta
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PortTypes')
BEGIN
    CREATE TABLE PortTypes (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(255),
        isDefault BIT NOT NULL DEFAULT 0
    );
END;

-- Tabela de Tipos de Conexão
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ConnectionTypes')
BEGIN
    CREATE TABLE ConnectionTypes (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(255),
        isDefault BIT NOT NULL DEFAULT 0
    );
END;

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
        FOREIGN KEY (connectedToPortId) REFERENCES EquipmentPorts(id)
    );
END;

-- Tabela de Log de Auditoria
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
END;

-- Inserção de Dados Iniciais --

-- Status Padrão
IF (SELECT COUNT(*) FROM ItemStatuses) = 0
BEGIN
    INSERT INTO ItemStatuses (id, name, description, color, isArchived, isDefault) VALUES 
    ('draft', 'Rascunho', 'Item recém-criado, aguardando submissão.', 'amber', 0, 1),
    ('pending_approval', 'Pendente', 'Item submetido, aguardando aprovação.', 'yellow', 0, 1),
    ('active', 'Ativo', 'Item aprovado e operacional.', 'green', 0, 1),
    ('maintenance', 'Manutenção', 'Item em manutenção, temporariamente indisponível.', 'orange', 0, 1),
    ('decommissioned', 'Descomissionado', 'Item removido e movido para a lixeira.', 'gray', 1, 1);
END;

-- Usuário Padrão de Desenvolvimento
IF NOT EXISTS (SELECT 1 FROM Users WHERE email = 'dev@dev.com')
BEGIN
    -- O hash da senha 'davidson' deve ser gerado pelo sistema de autenticação, aqui apenas criamos o registro.
    INSERT INTO Users (id, email, displayName, role, lastLoginAt, permissions, accessibleBuildingIds, preferences)
    VALUES ('dev_user_01', 'dev@dev.com', 'Desenvolvedor Padrão', 'developer', GETUTCDATE(), '["*"]', '[]', '{}');
END;

-- Prédio e Sala Iniciais
IF NOT EXISTS (SELECT 1 FROM Buildings WHERE name = 'DC-TESTE')
BEGIN
    INSERT INTO Buildings (id, name, address) VALUES ('B-001', 'DC-TESTE', 'Infraestrutura Inicial');
    INSERT INTO Rooms (id, name, buildingId) VALUES ('S-001', 'SALA-TESTE', 'B-001');
END;

PRINT 'Script de infraestrutura concluído com sucesso.';
