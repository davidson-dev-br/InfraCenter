

'use server';

import sql from 'mssql';
import { getDbPool } from './db';
import type { UserRole } from '@/components/permissions-provider';
import { getRolePermissions } from './role-actions';

// Adicionado inventoryColumns às preferências do usuário
export interface UserPreferences {
  hiddenMenuItems?: string[];
  inventoryColumns?: Record<string, Record<string, boolean>>;
}


export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  permissions: string[];
  accessibleBuildingIds: string[];
  lastLoginAt: string;
  preferences?: UserPreferences;
  isTestData?: boolean;
}

// ====================================================================
// FUNÇÕES DE VERIFICAÇÃO E CRIAÇÃO DE SCHEMA (Lógica Segura)
// ====================================================================
async function ensureTableExists(pool: sql.ConnectionPool, tableName: string, createQuery: string) {
    try {
        const result = await pool.request().query(`SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${tableName}'`);
        if (result.recordset.length === 0) {
            console.log(`Tabela '${tableName}' não existe. Criando...`);
            await pool.request().query(createQuery);
            console.log(`Tabela '${tableName}' criada.`);
            return true; // Indica que a tabela foi criada
        }
        return false; // Indica que a tabela já existia
    } catch (error) {
        console.error(`Erro ao verificar/criar a tabela ${tableName}:`, error);
        throw error;
    }
}

// ====================================================================
// DEFINIÇÃO E CRIAÇÃO DE CADA TABELA DO SISTEMA
// ====================================================================
async function ensureUsersTableExists(pool: sql.ConnectionPool) {
    await ensureTableExists(pool, 'Users', `
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
    `);
}

async function ensureBuildingsTableExists(pool: sql.ConnectionPool) {
    await ensureTableExists(pool, 'Buildings', `
        CREATE TABLE Buildings (
            id NVARCHAR(50) PRIMARY KEY,
            name NVARCHAR(100) NOT NULL UNIQUE,
            address NVARCHAR(255),
            isTestData BIT NOT NULL DEFAULT 0
        );
    `);
}

async function ensureRoomsTableExists(pool: sql.ConnectionPool) {
    await ensureTableExists(pool, 'Rooms', `
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
    `);
}

async function ensureParentItemsTableExists(pool: sql.ConnectionPool) {
    await ensureTableExists(pool, 'ParentItems', `
        CREATE TABLE ParentItems (
            id NVARCHAR(50) PRIMARY KEY,
            label NVARCHAR(100) NOT NULL,
            x INT NOT NULL DEFAULT 0,
            y INT NOT NULL DEFAULT 0,
            width FLOAT NOT NULL DEFAULT 0.6,
            height FLOAT NOT NULL DEFAULT 1.0,
            type NVARCHAR(50) NOT NULL,
            status NVARCHAR(50) NOT NULL,
            roomId NVARCHAR(50) NOT NULL,
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
    `);
}

async function ensureChildItemsTableExists(pool: sql.ConnectionPool) {
    await ensureTableExists(pool, 'ChildItems', `
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
    `);
}

async function ensureItemTypesTableExists(pool: sql.ConnectionPool) {
    await ensureTableExists(pool, 'ItemTypes', `
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
    `);
}

async function ensureItemTypesEqpTableExists(pool: sql.ConnectionPool) {
    await ensureTableExists(pool, 'ItemTypesEqp', `
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
    `);
}

async function ensureItemStatusesTableExists(pool: sql.ConnectionPool) {
    const wasCreated = await ensureTableExists(pool, 'ItemStatuses', `
        CREATE TABLE ItemStatuses (
            id NVARCHAR(50) PRIMARY KEY,
            name NVARCHAR(100) NOT NULL UNIQUE,
            description NVARCHAR(255),
            color NVARCHAR(20) NOT NULL,
            isArchived BIT NOT NULL DEFAULT 0,
            isDefault BIT NOT NULL DEFAULT 0
        );
    `);

    if(wasCreated) {
        const defaultStatuses = [
            { id: 'draft', name: 'Rascunho', description: 'Item recém-criado, aguardando submissão.', color: 'amber', isArchived: 0, isDefault: 1 },
            { id: 'pending_approval', name: 'Pendente', description: 'Item submetido, aguardando aprovação.', color: 'yellow', isArchived: 0, isDefault: 1 },
            { id: 'active', name: 'Ativo', description: 'Item aprovado e operacional.', color: 'green', isArchived: 0, isDefault: 1 },
            { id: 'maintenance', name: 'Manutenção', description: 'Item em manutenção, temporariamente indisponível.', color: 'orange', isArchived: 0, isDefault: 1 },
            { id: 'decommissioned', name: 'Descomissionado', description: 'Item removido e movido para a lixeira.', color: 'gray', isArchived: 1, isDefault: 1 },
            { id: 'aposentado', name: 'Aposentado', description: 'Item permanentemente aposentado.', color: 'red', isArchived: 1, isDefault: 1 },
            { id: 'rejected', name: 'Rejeitado', description: 'Item rejeitado na aprovação, aguardando correção.', color: 'red', isArchived: 0, isDefault: 1 },
        ];
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            const request = new sql.Request(transaction);
            for (const status of defaultStatuses) {
                await request.query`
                    INSERT INTO ItemStatuses (id, name, description, color, isArchived, isDefault)
                    VALUES (${status.id}, ${status.name}, ${status.description}, ${status.color}, ${status.isArchived}, ${status.isDefault})
                `;
            }
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
}

async function ensureManufacturersTableExists(pool: sql.ConnectionPool) {
    await ensureTableExists(pool, 'Manufacturers', `
        CREATE TABLE Manufacturers (
            id NVARCHAR(50) PRIMARY KEY,
            name NVARCHAR(100) NOT NULL UNIQUE
        );
    `);
}

async function ensureModelsTableExists(pool: sql.ConnectionPool) {
    await ensureTableExists(pool, 'Models', `
        CREATE TABLE Models (
            id NVARCHAR(50) PRIMARY KEY,
            name NVARCHAR(100) NOT NULL,
            manufacturerId NVARCHAR(50) NOT NULL,
            portConfig NVARCHAR(MAX),
            tamanhoU INT,
            FOREIGN KEY (manufacturerId) REFERENCES Manufacturers(id) ON DELETE CASCADE,
            UNIQUE (name, manufacturerId)
        );
    `);
}

async function ensurePortTypesTableExists(pool: sql.ConnectionPool) {
    await ensureTableExists(pool, 'PortTypes', `
        CREATE TABLE PortTypes (
            id NVARCHAR(50) PRIMARY KEY,
            name NVARCHAR(100) NOT NULL UNIQUE,
            description NVARCHAR(255),
            isDefault BIT NOT NULL DEFAULT 0
        );
    `);
}


async function ensureAuditLogTableExists(pool: sql.ConnectionPool) {
    await ensureTableExists(pool, 'AuditLog', `
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
    `);
}

async function ensureAllTablesExist() {
    try {
        const pool = await getDbPool();
        // A ordem é importante por causa das chaves estrangeiras (FK)
        await ensureUsersTableExists(pool);
        await ensureBuildingsTableExists(pool);
        await ensureRoomsTableExists(pool);
        await ensureParentItemsTableExists(pool);
        await ensureChildItemsTableExists(pool);
        await ensureItemTypesTableExists(pool);
        await ensureItemTypesEqpTableExists(pool);
        await ensureItemStatusesTableExists(pool);
        await ensureManufacturersTableExists(pool);
        await ensureModelsTableExists(pool);
        await ensurePortTypesTableExists(pool);
        await ensureAuditLogTableExists(pool);
    } catch (error) {
        console.error("Falha ao inicializar o schema do banco de dados.", error);
        // Em um cenário de produção, você pode querer parar a aplicação se o DB não puder ser inicializado.
    }
}

// Executa a verificação ao iniciar o servidor
ensureAllTablesExist();


// ====================================================================
// FUNÇÕES DE SERVIÇO DE USUÁRIO
// ====================================================================

const parseUser = (dbRecord: any): User => {
    let permissions: string[] = [];
    if (dbRecord.permissions) {
        try {
            permissions = JSON.parse(dbRecord.permissions);
        } catch (e) {
            console.error(`Falha ao analisar permissões para o usuário ${dbRecord.id}:`, e);
        }
    }

    let accessibleBuildingIds: string[] = [];
    if (dbRecord.accessibleBuildingIds) {
        try {
            accessibleBuildingIds = JSON.parse(dbRecord.accessibleBuildingIds);
        } catch (e) {
            console.error(`Falha ao analisar accessibleBuildingIds para o usuário ${dbRecord.id}:`, e);
        }
    }

    let preferences: UserPreferences = {};
    if (dbRecord.preferences) {
        try {
            preferences = JSON.parse(dbRecord.preferences);
        } catch (e) {
            console.error(`Falha ao analisar preferências para o usuário ${dbRecord.id}:`, e);
        }
    }

    return {
      id: dbRecord.id,
      email: dbRecord.email,
      displayName: dbRecord.displayName,
      photoURL: dbRecord.photoURL,
      role: dbRecord.role,
      lastLoginAt: new Date(dbRecord.lastLoginAt).toISOString(),
      permissions,
      accessibleBuildingIds,
      preferences,
      isTestData: !!dbRecord.isTestData // Garante que seja booleano
    };
};

export async function _getUserByEmail(email: string): Promise<User | null> {
    try {
        const pool = await getDbPool();
        const result = await pool.request()
            .input('email', sql.NVarChar, email.toLowerCase())
            .query('SELECT * FROM Users WHERE email = @email');

        if (result.recordset.length > 0) {
            return parseUser(result.recordset[0]);
        }
        return null;
    } catch (error) {
        console.error("Erro ao buscar usuário por e-mail:", error);
        throw error; // Re-lança o erro para ser tratado pela camada superior
    }
}

export async function _getUsers(): Promise<User[]> {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query('SELECT * FROM Users ORDER BY displayName');
    return result.recordset.map(parseUser);
  } catch (err) {
    console.error('Consulta ao banco de dados para getUsers falhou:', err);
    return [];
  }
}


export async function _updateUser(userData: Partial<User> & ({ email: string } | { id: string })): Promise<User> {
    const pool = await getDbPool();
    const rolePermissions = await getRolePermissions();
    
    let existingUser: User | null = null;
    
    if ('id' in userData && userData.id) {
        const result = await pool.request().input('id', sql.NVarChar, userData.id).query('SELECT * FROM Users WHERE id = @id');
        if (result.recordset.length > 0) {
            existingUser = parseUser(result.recordset[0]);
        }
    } else if ('email' in userData && userData.email) {
        existingUser = await _getUserByEmail(userData.email);
    }

    if (existingUser) {
        // Mescla os dados existentes com os novos dados
        const mergedData = { ...existingUser, ...userData };

        // Se o cargo foi alterado e nenhuma permissão customizada foi enviada,
        // aplica as permissões padrão do novo cargo.
        if (userData.role && userData.role !== existingUser.role && !userData.permissions) {
             mergedData.permissions = rolePermissions[userData.role] || [];
        }

        await pool.request()
            .input('id', sql.NVarChar, mergedData.id)
            .input('displayName', sql.NVarChar, mergedData.displayName)
            .input('photoURL', sql.NVarChar, mergedData.photoURL)
            .input('role', sql.NVarChar, mergedData.role)
            .input('lastLoginAt', sql.DateTime2, new Date(mergedData.lastLoginAt))
            .input('permissions', sql.NVarChar, JSON.stringify(mergedData.permissions || []))
            .input('accessibleBuildingIds', sql.NVarChar, JSON.stringify(mergedData.accessibleBuildingIds || []))
            .input('preferences', sql.NVarChar, JSON.stringify(mergedData.preferences || {}))
            .query`UPDATE Users 
                    SET displayName = @displayName, photoURL = @photoURL, role = @role, lastLoginAt = @lastLoginAt, 
                        permissions = @permissions, accessibleBuildingIds = @accessibleBuildingIds, preferences = @preferences
                    WHERE id = @id`;
    } else if ('email' in userData && userData.email) {
        // Se o usuário não existe, cria um novo
        const email = userData.email.toLowerCase();
        const newId = `user_${Date.now()}`;
        const role = userData.role || 'guest';
        
        await pool.request()
            .input('id', sql.NVarChar, newId)
            .input('email', sql.NVarChar, email)
            .input('displayName', sql.NVarChar, userData.displayName || null)
            .input('photoURL', sql.NVarChar, userData.photoURL || null)
            .input('role', sql.NVarChar, role)
            .input('permissions', sql.NVarChar, JSON.stringify(userData.permissions || rolePermissions[role] || []))
            .input('accessibleBuildingIds', sql.NVarChar, JSON.stringify(userData.accessibleBuildingIds || []))
            .input('lastLoginAt', sql.DateTime2, new Date(userData.lastLoginAt || new Date()))
            .input('preferences', sql.NVarChar, JSON.stringify(userData.preferences || {}))
            .input('isTestData', sql.Bit, userData.isTestData || false)
            .query`INSERT INTO Users (id, email, displayName, photoURL, role, permissions, accessibleBuildingIds, lastLoginAt, preferences, isTestData) 
                    VALUES (@id, @email, @displayName, @photoURL, @role, @permissions, @accessibleBuildingIds, @lastLoginAt, @preferences, @isTestData)`;
    } else {
        throw new Error("A atualização ou criação do usuário falhou: dados insuficientes (ID ou email são necessários).");
    }

    const finalEmail = 'email' in userData ? userData.email!.toLowerCase() : existingUser!.email;
    const updatedUser = await _getUserByEmail(finalEmail);
    if (!updatedUser) {
        throw new Error("Falha crítica: não foi possível recuperar o usuário após a operação no banco de dados.");
    }

    return updatedUser;
}
