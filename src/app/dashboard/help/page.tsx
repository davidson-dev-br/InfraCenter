
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Download, BookOpen, LayoutGrid, Server, Spline, FileText, Settings, Users, BrainCircuit } from 'lucide-react';
import { saveAs } from 'file-saver';

// Content for downloadable files
const README_CONTENT = `# Firebase Studio - InfraCenter Manager

Este é um projeto Next.js para gerenciamento de infraestrutura de datacenters, construído com o Firebase Studio.

## Funcionalidades Principais

- **Login Seguro**: Autenticação de usuários via Firebase Auth.
- **Planta Baixa Interativa**: Visualize e organize a disposição física de seus ativos.
- **Gerenciamento de Ativos**: Adicione, edite e remova Racks, Equipamentos e Conexões.
- **Relatórios**: Exporte dados para Excel ou gere relatórios imprimíveis em PDF.
- **IA Integrada**: Utilize IA para adicionar equipamentos e conexões a partir de fotos e importar dados de planilhas.
- **Gerenciamento de Usuários e Permissões**: Controle de acesso granular por cargos.
- **Configurações do Sistema**: Personalize a aplicação de acordo com suas necessidades.
`;

const CHANGELOG_CONTENT = `# Histórico de Alterações - InfraCenter Manager

## [v4.0] - 2024-07-29

### ✨ Adicionado
- **Página de Ajuda e Documentação**: Uma nova seção dedicada a guiar os usuários, com manuais para download e tutoriais de funcionalidades.
- **Executor de Migrações de Banco de Dados**: Ferramenta de desenvolvedor para atualizar a estrutura de dados de forma segura, com análise prévia e confirmação.
- **Laboratório de Treinamento de IA (Learning Machine)**: Página dedicada para treinar a IA a ler etiquetas de cabos através de captura de vídeo e correção manual.
- **Testador de Fluxos de IA Aprimorado**: Agora permite edição de prompts em tempo real, upload de imagens e salvamento das alterações no banco de dados.
- **Download de Documentos**: Funcionalidade na página de Ajuda para baixar README.md e CHANGELOG.md.

### 🔄 Alterado
- **Fluxos de IA Dinâmicos**: Os prompts da IA agora são carregados do banco de dados, permitindo edições sem a necessidade de reimplantar a aplicação.
- **Segurança do Executor de Migrações**: O processo de migração agora é feito em duas etapas (Analisar e Executar) para evitar ações acidentais.
- **Interface do Testador de Fluxos**: Nomes dos fluxos foram atualizados para serem mais intuitivos e descritivos.
- **Prompts da IA**: Prompts padrão foram traduzidos para o português para melhor performance e clareza.

### 🐞 Corrigido
- Corrigidos múltiplos erros de build e runtime relacionados a importações de módulos e à diretiva "use server".
- Estrutura de schemas de IA foi refatorada para um arquivo central (src/ai/schemas.ts) para resolver conflitos de exportação.

---

## [v3.2.6] - 2024-07-28

- Versão inicial do projeto com as funcionalidades principais de gerenciamento de datacenter, planta baixa interativa, inventário de equipamentos e gerenciamento de conexões.
`;


export default function HelpPage() {

    const handleDownload = (filename: string, content: string) => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, filename);
    };

    return (
        <div className="container p-4 mx-auto my-8 sm:p-8">
            <Card className="mb-8 shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <BookOpen className="w-10 h-10 text-primary" />
                        <div>
                            <CardTitle className="text-2xl font-headline">Central de Ajuda e Documentação</CardTitle>
                            <CardDescription>Encontre guias, manuais e informações sobre as funcionalidades do InfraCenter Manager.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Guia de Funcionalidades</CardTitle>
                            <CardDescription>Clique em uma seção para expandir e ver os detalhes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="planta-baixa">
                                    <AccordionTrigger className="text-lg font-semibold"><LayoutGrid className="mr-2" />Planta Baixa</AccordionTrigger>
                                    <AccordionContent className="prose max-w-none">
                                        <p>A Planta Baixa é a tela principal do sistema, oferecendo uma representação visual e interativa do seu datacenter.</p>
                                        <ul>
                                            <li><strong>Navegação:</strong> Use o scroll do mouse para zoom ou clique e arraste para mover a visualização.</li>
                                            <li><strong>Adicionar Itens:</strong> Clique em "Adicionar Item", selecione o tipo (ex: Rack), e ele será posicionado no primeiro espaço livre.</li>
                                            <li><strong>Mover Itens:</strong> Clique e arraste um item para reposicioná-lo na planta. O sistema impede colisões.</li>
                                            <li><strong>Editar/Excluir:</strong> Dê um duplo clique em um item para abrir a janela de detalhes, onde você pode editar suas propriedades ou movê-lo para a lixeira.</li>
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="equipamentos">
                                    <AccordionTrigger className="text-lg font-semibold"><Server className="mr-2" />Gerenciamento de Equipamentos</AccordionTrigger>
                                    <AccordionContent className="prose max-w-none">
                                        <p>Esta seção lista todos os seus ativos de hardware, como servidores, switches e storages.</p>
                                        <ul>
                                            <li><strong>Adição Manual:</strong> Use o botão "Adicionar Equipamento" para abrir um formulário detalhado e cadastrar um novo ativo.</li>
                                            <li><strong>Adição com IA:</strong> Use o botão "Adicionar com Foto IA" para carregar uma imagem do equipamento. A IA tentará preencher automaticamente campos como fabricante, modelo e tipo.</li>
                                            <li><strong>Edição:</strong> Clique no menu de ações (três pontos) e em "Editar" para atualizar as informações de um equipamento.</li>
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="conexoes">
                                    <AccordionTrigger className="text-lg font-semibold"><Spline className="mr-2" />Gerenciamento de Conexões</AccordionTrigger>
                                    <AccordionContent className="prose max-w-none">
                                        <p>Mapeie as conexões físicas entre seus equipamentos para ter uma documentação completa do seu cabeamento.</p>
                                         <ul>
                                            <li><strong>Adição Manual:</strong> Use o botão "Adicionar Conexão" para especificar o equipamento e a porta de origem e de destino.</li>
                                            <li><strong>Adição com IA:</strong> Use o botão "Adicionar com Etiqueta (IA)" para tirar uma foto de uma etiqueta de cabo. A IA irá ler as informações e preencher os campos de origem e destino para você.</li>
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                                 <AccordionItem value="relatorios">
                                    <AccordionTrigger className="text-lg font-semibold"><FileText className="mr-2" />Relatórios e Importação/Exportação</AccordionTrigger>
                                    <AccordionContent className="prose max-w-none">
                                        <p>Extraia dados do sistema ou importe inventários existentes.</p>
                                        <ul>
                                            <li><strong>Relatório HTML/PDF:</strong> Gere um relatório completo e visual, ideal para impressão ou arquivamento digital. Inclui inventário, conexões e assinaturas.</li>
                                            <li><strong>Exportar para Excel:</strong> Exporte dados brutos de itens, equipamentos e conexões para uma planilha .xlsx para análise externa.</li>
                                            <li><strong>Importar com IA:</strong> Faça o upload de uma planilha com seu inventário e a IA irá analisar, mapear as colunas e importar os equipamentos para a sala que você selecionar.</li>
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                                 <AccordionItem value="configuracoes">
                                    <AccordionTrigger className="text-lg font-semibold"><Settings className="mr-2" />Configurações do Sistema</AccordionTrigger>
                                    <AccordionContent className="prose max-w-none">
                                        <p>Esta área (geralmente para administradores) permite personalizar as opções disponíveis em todo o sistema.</p>
                                        <ul>
                                            <li><strong>Configurações da Empresa:</strong> Altere o nome e o logo da empresa que aparecem nos relatórios.</li>
                                            <li><strong>Listas de Opções:</strong> Adicione ou remova tipos de equipamento, status, tipos de cabo, motivos de exclusão, etc. Essas opções aparecerão nos formulários correspondentes.</li>
                                            <li><strong>Permissões:</strong> Defina o que cada cargo de usuário (ex: Técnico, Supervisor) pode ver e fazer no sistema.</li>
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-8">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Manuais para Download</CardTitle>
                            <CardDescription>Baixe a documentação do projeto em formato de texto.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <Button variant="outline" onClick={() => handleDownload('README.txt', README_CONTENT)}>
                                <Download className="mr-2" />
                                Baixar README.md
                            </Button>
                             <Button variant="outline" onClick={() => handleDownload('CHANGELOG.txt', CHANGELOG_CONTENT)}>
                                <Download className="mr-2" />
                                Baixar CHANGELOG.md
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
