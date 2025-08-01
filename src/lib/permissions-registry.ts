
import { ShieldCheck, Server, Users, Grid, LayoutGrid, AlertTriangle, ImageUp, Upload, Network, FileText, CheckSquare, History, HardDrive, Settings, Building, Trash2, Replace, ClipboardList, Trash, BrickWall, DatabaseZap, FileUp, FlaskConical, Wrench, Eye } from 'lucide-react';
import { ComponentType } from 'react';

// Com grandes poderes vêm grandes responsabilidades. Esta função tem grandes poderes.

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: React.ComponentType<any>;
}

// Este é o registro central de todas as permissões do sistema.
// Quando uma nova funcionalidade que precisa de controle é criada,
// ela deve ser adicionada aqui.
export const PERMISSIONS_REGISTRY: Permission[] = [
  // Permissões de Seção do Menu
  { id: 'section:management:view', name: 'Ver Seção de Gerenciamento', description: 'Permite visualizar a seção de gerenciamento no menu.', category: 'Acesso a Seções', icon: Wrench },
  { id: 'section:supervisor:view', name: 'Ver Seção de Supervisor', description: 'Permite visualizar a seção de supervisor no menu.', category: 'Acesso a Seções', icon: Eye },

  // Permissões de Páginas Principais
  { id: 'page:datacenter:view', name: 'Ver Página da Planta Baixa', description: 'Permite o acesso à planta baixa do data center.', icon: LayoutGrid, category: 'Acesso a Páginas' },
  { id: 'page:inventory:view', name: 'Ver Página de Equipamentos', description: 'Permite o acesso ao inventário de equipamentos.', icon: HardDrive, category: 'Acesso a Páginas' },
  { id: 'page:connections:view', name: 'Ver Página de Conexões', description: 'Permite visualizar as conexões de rede e energia.', icon: Network, category: 'Acesso a Páginas' },
  { id: 'page:depara:view', name: 'Ver Página De/Para', description: 'Permite visualizar e gerenciar o De/Para de conexões.', icon: Replace, category: 'Acesso a Páginas' },
  { id: 'page:import:view', name: 'Ver Página de Importação', description: 'Permite o acesso à ferramenta de importação de dados.', icon: Upload, category: 'Acesso a Páginas' },
  { id: 'page:reports:view', name: 'Ver Página de Relatórios', description: 'Permite visualizar e gerar relatórios.', icon: FileText, category: 'Acesso a Páginas' },

  // Permissões de Páginas de Gerenciamento
  { id: 'page:users:view', name: 'Ver Página de Usuários', description: 'Permite o acesso à página de gerenciamento de usuários.', icon: Users, category: 'Acesso a Páginas (Gerenciamento)' },
  { id: 'page:permissions:view', name: 'Ver Página de Permissões', description: 'Permite o acesso à página de gerenciamento de permissões de cargos.', icon: ShieldCheck, category: 'Acesso a Páginas (Gerenciamento)' },
  { id: 'page:settings:view', name: 'Ver Página de Configurações', description: 'Permite acesso à página de configurações do sistema.', icon: Settings, category: 'Acesso a Páginas (Gerenciamento)' },
  { id: 'page:buildings:view', name: 'Ver Página de Prédios', description: 'Permite acesso à página para gerenciar prédios.', icon: Building, category: 'Acesso a Páginas (Gerenciamento)' },
  { id: 'page:system:view', name: 'Ver Página do Sistema', description: 'Permite gerenciar configurações do sistema, como tipos de itens.', icon: Settings, category: 'Acesso a Páginas (Gerenciamento)' },


  // Permissões de Páginas de Supervisor
  { id: 'page:incidents:view', name: 'Ver Central de Incidentes', description: 'Permite acesso à central para visualizar incidentes de integridade do sistema.', icon: AlertTriangle, category: 'Acesso a Páginas (Supervisor)' },
  { id: 'page:approvals:view', name: 'Ver Central de Aprovação', description: 'Permite acesso à central para aprovar ou rejeitar solicitações.', icon: CheckSquare, category: 'Acesso a Páginas (Supervisor)' },
  { id: 'page:audit:view', name: 'Ver Auditoria (Log)', description: 'Permite acesso aos logs de auditoria do sistema.', icon: History, category: 'Acesso a Páginas (Supervisor)' },
  { id: 'page:trash:view', name: 'Ver Lixeira', description: 'Permite acesso à lixeira para visualizar ou restaurar itens excluídos.', icon: Trash2, category: 'Acesso a Páginas (Supervisor)' },

  // Permissões de Ações de Itens
  { id: 'item:image:upload', name: 'Upload de Imagem do Item', description: 'Permite que o usuário faça upload ou altere a foto de um item.', icon: ImageUp, category: 'Ações (Itens)' },
  { id: 'item:delete:draft', name: 'Excluir Rascunho de Item', description: 'Permite excluir permanentemente um item que ainda está em rascunho.', icon: Trash, category: 'Ações (Itens)' },
  { id: 'item:decommission:active', name: 'Descomissionar Item Ativo', description: 'Permite iniciar o processo de descomissionamento de um item ativo, movendo-o para a lixeira.', icon: Trash2, category: 'Ações (Itens)' },

  // Permissões de Ações de Usuários
  { id: 'user:create', name: 'Criar Usuário', description: 'Permite a criação de novos usuários no sistema.', category: 'Ações (Usuários)' },
  { id: 'user:edit:role', name: 'Editar Cargo do Usuário', description: 'Permite alterar o cargo de outros usuários.', category: 'Ações (Usuários)' },
  { id: 'user:edit:permissions', name: 'Editar Permissões do Usuário', description: 'Permite customizar as permissões individuais de um usuário.', category: 'Ações (Usuários)' },
];

export function getPermissionsByCategory() {
  return PERMISSIONS_REGISTRY.reduce((acc, permission) => {
    const category = permission.category || 'Outras';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);
}
