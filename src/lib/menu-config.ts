
import {
    LayoutGrid,
    HardDrive,
    Network,
    Upload,
    FileText,
    CheckSquare,
    History,
    Users,
    ShieldCheck,
    FlaskConical,
    Building,
    Trash2,
    Replace,
    FileUp,
    DatabaseZap,
    BrickWall,
    AlertTriangle,
    Settings,
    ClipboardList,
    Server,
} from 'lucide-react';
import { ComponentType } from 'react';

export interface NavItem {
    href: string;
    label: string;
    icon: ComponentType<any>;
    permission: string;
}

export interface NavSection {
    title: string;
    items: NavItem[];
    permission?: string;
    isDeveloper?: boolean;
}

export const NAV_SECTIONS: NavSection[] = [
    {
      title: 'Principal',
      items: [
        { href: '/datacenter', label: 'Planta Baixa', icon: LayoutGrid, permission: 'page:datacenter:view' },
        { href: '/inventory', label: 'Equipamentos', icon: HardDrive, permission: 'page:inventory:view' },
        { href: '/connections', label: 'Conexões', icon: Network, permission: 'page:connections:view' },
        { href: '/depara', label: 'De/Para', icon: Replace, permission: 'page:depara:view' },
        { href: '/import', label: 'Importar', icon: Upload, permission: 'page:import:view' },
        { href: '/reports', label: 'Relatórios', icon: FileText, permission: 'page:reports:view' },
      ]
    },
    {
      title: 'Supervisionar',
      permission: 'section:supervisor:view',
      items: [
        { href: '/incidents', label: 'Incidentes', icon: AlertTriangle, permission: 'page:incidents:view' },
        { href: '/approvals', label: 'Aprovações', icon: CheckSquare, permission: 'page:approvals:view' },
        { href: '/audit', label: 'Auditoria (Log)', icon: History, permission: 'page:audit:view' },
        { href: '/trash', label: 'Lixeira', icon: Trash2, permission: 'page:trash:view' },
      ]
    },
    {
      title: 'Gerenciamento',
      permission: 'section:management:view',
      items: [
        { href: '/users', label: 'Usuários', icon: Users, permission: 'page:users:view' },
        { href: '/permissions', label: 'Permissões', icon: ShieldCheck, permission: 'page:permissions:view' },
        { href: '/buildings', label: 'Prédios', icon: Building, permission: 'page:buildings:view' },
        { href: '/system', label: 'Sistema', icon: Settings, permission: 'page:system:view' },
      ]
    },
    {
      title: 'Desenvolvimento',
      isDeveloper: true,
      items: [
        { href: '/teste-firebase', label: 'Teste Firebase', icon: Server, permission: '*' },
        { href: '/mapa-teste', label: 'CRUD de Itens (Mapa)', icon: FlaskConical, permission: '*' },
        { href: '/teste-upload', label: 'Teste de Upload', icon: FileUp, permission: '*' },
        { href: '/teste-conexoes', label: 'Teste de Conexões', icon: Network, permission: '*' },
        { href: '/teste-db', label: 'Teste de Banco de Dados', icon: DatabaseZap, permission: '*' },
        { href: '/teste-auth', label: 'Teste de Permissões', icon: BrickWall, permission: '*' },
      ]
    }
];
