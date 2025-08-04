
import * as admin from 'firebase-admin';
import 'server-only';
import fs from 'fs';
import path from 'path';

/**
 * Inicializa o Firebase Admin SDK de forma segura, garantindo que as credenciais
 * sejam carregadas antes do uso. Esta função é o ponto central para interagir
 * com os serviços de admin do Firebase.
 * 
 * @returns A instância do app Firebase Admin inicializado.
 */
function initializeFirebaseAdmin() {
    // A biblioteca firebase-admin já gerencia a inicialização única.
    // Se já houver apps inicializados, retornamos o primeiro (padrão) para evitar erros.
    if (admin.apps.length > 0) {
        return admin.app();
    }
    
    // Constrói o caminho para o arquivo de credenciais na raiz do projeto
    const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');

    // Verifica se o arquivo existe antes de tentar lê-lo
    if (!fs.existsSync(serviceAccountPath)) {
        console.error("FALHA CRÍTICA: O arquivo 'serviceAccountKey.json' não foi encontrado na raiz do projeto.");
        throw new Error("Arquivo de credenciais do Firebase (serviceAccountKey.json) não encontrado.");
    }
    
    // Lê e faz o parse do arquivo de credenciais
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    try {
        console.log("Tentando inicializar o Firebase Admin SDK com serviceAccountKey.json...");
        const app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase Admin SDK inicializado com sucesso.");
        return app;
    } catch (error: any) {
        console.error("FALHA CRÍTICA na inicialização do Firebase Admin:", error.message);
        throw new Error(`Falha crítica ao inicializar o Firebase Admin SDK: ${error.message}`);
    }
}

/**
 * Ponto de entrada para obter o serviço de autenticação do Firebase Admin.
 * Garante que o SDK esteja inicializado antes de retornar o serviço de autenticação.
 * @returns O serviço de autenticação do Firebase Admin.
 */
export function getFirebaseAuth() {
    // Garante que a inicialização ocorra antes de tentar obter o serviço de auth.
    const firebaseApp = initializeFirebaseAdmin();
    return admin.auth(firebaseApp);
}
