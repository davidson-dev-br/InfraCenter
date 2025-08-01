
'use server';

import { BlobServiceClient } from '@azure/storage-blob';
import 'server-only';

// Não é feitiçaria, é tecnologia (com um pouco de feitiçaria).
// Esta função converte um Data URI em algo que o Azure entenda.
function dataURIToBuffer(dataURI: string): { buffer: Buffer, contentType: string } {
    if (!dataURI || !dataURI.startsWith('data:')) {
        throw new Error('Invalid data URI provided.');
    }
    
    const [header, base64Data] = dataURI.split(',');
    if (!header || !base64Data) {
        throw new Error('Invalid data URI format. Expected "data:<mimetype>;base64,<data>".');
    }
    
    const mimeMatch = header.match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) {
        throw new Error('Could not determine MIME type from data URI header.');
    }
    
    const contentType = mimeMatch[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    return { buffer, contentType };
}


export async function uploadImage(dataURI: string, blobName: string): Promise<string> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

  if (!connectionString || !containerName) {
    const errorMsg = 'A configuração do Azure Storage está ausente ou incompleta. Verifique as variáveis de ambiente.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const { buffer, contentType } = dataURIToBuffer(dataURI);
    
    const containerClient = blobServiceClient.getContainerClient(containerName);
    // Alterado: Removido { access: 'blob' } para respeitar a configuração padrão de segurança do Azure.
    await containerClient.createIfNotExists();

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: contentType }
    });
    
    return blockBlobClient.url;
  } catch (error: any) {
    console.error(`Erro detalhado no upload para o Azure: ${error.message}`);
    // Lança um erro mais específico para ser capturado pela UI.
    throw new Error(`Falha no upload para o Azure: ${error.message}`);
  }
}
