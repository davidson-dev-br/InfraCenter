
import { config } from 'dotenv';
config();

import * as admin from 'firebase-admin';

function initializeFirebaseAdmin() {
    // Se o aplicativo já estiver inicializado, retorne-o.
    if (admin.apps.length > 0) {
        return admin.app();
    }
    
    // Em um ambiente de produção do Firebase/Google Cloud, o SDK encontra
    // as credenciais automaticamente, então não precisamos passar nada.
    return admin.initializeApp();
}

// Inicializa imediatamente ao carregar o módulo
initializeFirebaseAdmin();

// Exporta uma função que retorna a instância de autenticação do app já inicializado.
export function getFirebaseAuth() {
    return admin.auth();
}
