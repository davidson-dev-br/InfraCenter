
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Download, BookOpen, LayoutGrid, Server, Spline, FileText, Settings, Users, BrainCircuit } from 'lucide-react';
import { saveAs } from 'file-saver';

// Content for downloadable files
const README_CONTENT = `# InfraCenter Manager v4.0

## Visão Geral

O **InfraCenter Manager** é uma aplicação web moderna e robusta, desenvolvida em Next.js e Firebase, projetada para o gerenciamento completo da infraestrutura de datacenters. A plataforma oferece uma solução visual e interativa para catalogar, organizar e documentar todos os ativos de hardware, desde racks e servidores até as conexões físicas entre eles.

Com uma forte integração de Inteligência Artificial (Google Gemini via Genkit), o sistema automatiza tarefas complexas como a extração de dados de equipamentos a partir de fotos e a importação inteligente de inventários de planilhas.

---

## Funcionalidades Principais

- **Planta Baixa Interativa**:
  - Representação visual e em escala da sala do datacenter.
  - Adicione, mova (com detecção de colisão) e edite itens como Racks, Ar Condicionados e Quadros de Força.
  - Zoom e pan para navegação fluida.
  - Suporte a múltiplas salas e prédios.

- **Gerenciamento de Ativos**:
  - **Equipamentos**: Crie um inventário detalhado de servidores, switches, roteadores, etc. Armazene informações como hostname, modelo, fabricante, número de série, posição no rack (U), e mais.
  - **Conexões**: Mapeie o cabeamento físico entre equipamentos, especificando portas de origem e destino, tipo de cabo e status da conexão.
  - **Itens da Planta**: Gerencie a disposição física dos Racks e outros elementos estruturais.

- **Inteligência Artificial (Google Gemini & Genkit)**:
  - **Adicionar Equipamento com Foto**: Tire uma foto de um equipamento e a IA preencherá automaticamente os campos de fabricante, modelo e tipo.
  - **Adicionar Conexão com Etiqueta**: Capture uma imagem de uma etiqueta de cabo (formato DE/PARA) e a IA extrairá as informações de origem e destino.
  - **Importar de Planilha**: Faça o upload de um arquivo \`.xlsx\` e a IA analisará as colunas, mapeará para os campos corretos e importará os equipamentos em lote.
  - **Learning Machine**: Um laboratório de treinamento dedicado onde a IA aprende a ler etiquetas de cabos com mais precisão a cada correção manual feita pelo usuário.

- **Relatórios e Exportação**:
  - Gere relatórios completos em formato HTML/PDF, prontos para impressão, incluindo inventário e assinaturas digitais.
  - Exporte dados brutos de equipamentos, itens e conexões para Excel (\`.xlsx\`).

- **Administração e Segurança**:
  - **Gerenciamento de Usuários**: Adicione e edite usuários do sistema.
  - **Controle de Permissões por Cargo**: Sistema granular que define o que cada cargo (Técnico, Supervisor, Gerente, Desenvolvedor) pode ver e fazer.
  - **Configurações do Sistema**: Personalize listas de opções (tipos de equipamento, status, etc.), nome e logo da empresa.
  - **Logs de Atividade e Exclusão**: Rastreie todas as ações importantes realizadas no sistema.

- **Ferramentas de Desenvolvedor**:
  - **Laboratório de Prompts**: Teste e edite os prompts de IA em tempo real, com a capacidade de salvar as alterações no banco de dados.
  - **Executor de Migrações**: Ferramenta segura em duas etapas (Analisar e Executar) para aplicar atualizações na estrutura de dados.
  - **Ações do Banco de Dados**: Popule o banco com dados de teste ou limpe a infraestrutura com segurança.

---

## Tecnologias Utilizadas

- **Framework**: Next.js (com App Router)
- **Linguagem**: TypeScript
- **Backend & Banco de Dados**: Firebase (Firestore, Authentication)
- **Inteligência Artificial**: Google Gemini Pro via Genkit
- **UI**: ShadCN UI, Tailwind CSS, Lucide Icons
- **Estado e Lógica**: React Hooks & Context API

---

## Contato do Desenvolvedor

Este projeto foi concebido e desenvolvido por:

- **Nome**: Davidson Santos Conceição
- **Telefones**: 
  - (91) 98426-0688
  - (12) 99743-4548
- **Email**: dcaonceicao_fundamentos@timbrasil.com.br
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
