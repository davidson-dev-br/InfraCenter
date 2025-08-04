
import * as admin from 'firebase-admin';
import 'server-only';
import fs from 'fs';
import path from 'path';

/**
 * Ponto de entrada para obter o serviço de autenticação do Firebase Admin.
 * Garante que o SDK esteja inicializado antes de retornar o serviço de autenticação.
 * Esta função é agora o único ponto de inicialização e acesso.
 * @returns O serviço de autenticação do Firebase Admin.
 */
export function getFirebaseAuth() {
    // Se o app já foi inicializado, apenas retorne a instância de auth existente.
    if (admin.apps.length > 0 && admin.apps[0]) {
        return admin.auth(admin.apps[0]);
    }

    // Constrói o caminho absoluto para o arquivo de credenciais na raiz do projeto.
    const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');

    // Verifica de forma síncrona se o arquivo existe. Se não, lança um erro claro.
    if (!fs.existsSync(serviceAccountPath)) {
        console.error("FALHA CRÍTICA: O arquivo 'serviceAccountKey.json' não foi encontrado na raiz do projeto.");
        throw new Error("Arquivo de credenciais do Firebase (serviceAccountKey.json) não encontrado.");
    }
    
    try {
        // Lê e analisa o arquivo de credenciais.
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

        console.log("Tentando inicializar o Firebase Admin SDK com serviceAccountKey.json...");
        
        // Inicializa o app com as credenciais lidas.
        const app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        
        console.log("Firebase Admin SDK inicializado com sucesso.");
        // Retorna o serviço de autenticação do app recém-criado.
        return admin.auth(app);

    } catch (error: any) {
        console.error("FALHA CRÍTICA na inicialização do Firebase Admin:", error.stack);
        throw new Error(`Falha crítica ao inicializar o Firebase Admin SDK: ${error.message}`);
    }
}
