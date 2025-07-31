import { TestUploadForm } from "@/components/test-upload-form";

export default function TesteUploadPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">Teste de Upload</h1>
        <p className="text-muted-foreground">Esta página foi criada para testar a funcionalidade de upload de arquivos.</p>
      </div>
      <TestUploadForm />
    </div>
  );
}
