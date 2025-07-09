
"use client";

import type { Building, PlacedItem, Room, Equipment, Connection, User, SystemSettings } from "@/lib/types";

interface PrintableReportProps {
    buildings: Building[];
    itemsByRoom: Record<string, PlacedItem[]>;
    equipment: Equipment[];
    connections: Connection[];
    users: User[];
    systemSettings: SystemSettings;
    includeSignatures: boolean;
}

export function PrintableReport({ 
    buildings, 
    itemsByRoom, 
    equipment, 
    connections, 
    users,
    systemSettings, 
    includeSignatures 
}: PrintableReportProps) {
    
    const { companyName, companyLogo } = systemSettings;
    const gerentes = users.filter(u => u.role === 'gerente');
    const supervisores = users.filter(u => u.role === 'supervisor');

    const formatRoleName = (role: string) => {
        if (!role) return '';
        if (role === 'gerente') return 'Gerente de Projetos';
        if (role === 'supervisor') return 'Supervisor';
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    return (
        <div className="p-8 font-sans bg-white text-black">
            <header className="flex justify-between items-center mb-8 pb-4 border-b-2 border-black">
                <div className="flex items-center gap-4">
                    {companyLogo && <img src={companyLogo} alt="Company Logo" className="h-16" />}
                    <h1 className="text-3xl font-bold">{companyName}</h1>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold">Relatório Completo de Infraestrutura</h2>
                    <p className="text-sm text-gray-600">Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
            </header>

            <main>
                <section className="mb-8 page-break-after">
                    <h3 className="text-xl font-bold mb-4 border-b border-gray-400 pb-2">Inventário de Equipamentos ({equipment.length})</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border">Hostname</th>
                                <th className="p-2 border">Tipo</th>
                                <th className="p-2 border">Fabricante</th>
                                <th className="p-2 border">Modelo</th>
                                <th className="p-2 border">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {equipment.map(eq => (
                                <tr key={eq.id}>
                                    <td className="p-2 border">{eq.hostname}</td>
                                    <td className="p-2 border">{eq.type}</td>
                                    <td className="p-2 border">{eq.brand}</td>
                                    <td className="p-2 border">{eq.model}</td>
                                    <td className="p-2 border">{eq.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
                
                <section className="mb-8 page-break-after">
                    <h3 className="text-xl font-bold mb-4 border-b border-gray-400 pb-2">Itens na Planta Baixa ({Object.values(itemsByRoom).flat().length})</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border">Nome</th>
                                <th className="p-2 border">Tipo</th>
                                <th className="p-2 border">Status</th>
                                <th className="p-2 border">Fabricante</th>
                                <th className="p-2 border">Serial</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(itemsByRoom).flat().map(item => (
                                <tr key={item.id}>
                                    <td className="p-2 border">{item.name}</td>
                                    <td className="p-2 border">{item.type}</td>
                                    <td className="p-2 border">{item.status}</td>
                                    <td className="p-2 border">{item.brand}</td>
                                    <td className="p-2 border">{item.serialNumber}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <section className="mb-8 page-break-after">
                    <h3 className="text-xl font-bold mb-4 border-b border-gray-400 pb-2">Conexões Físicas ({connections.length})</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border">Etiqueta</th>
                                <th className="p-2 border">De</th>
                                <th className="p-2 border">Para</th>
                                <th className="p-2 border">Tipo Cabo</th>
                                <th className="p-2 border">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {connections.map(conn => (
                                <tr key={conn.id}>
                                    <td className="p-2 border">{conn.cableLabel}</td>
                                    <td className="p-2 border">{equipment.find(e=>e.id === conn.sourceEquipmentId)?.hostname}:{conn.sourcePort}</td>
                                    <td className="p-2 border">{equipment.find(e=>e.id === conn.destinationEquipmentId)?.hostname}:{conn.destinationPort}</td>
                                    <td className="p-2 border">{conn.cableType}</td>
                                    <td className="p-2 border">{conn.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
                
                {includeSignatures && (
                    <section className="pt-16">
                        <h3 className="text-xl font-bold mb-8 text-center">Assinaturas</h3>
                        <div className="grid grid-cols-2 gap-x-16 gap-y-12">
                            {gerentes.map(user => (
                                <div key={user.id} className="text-center">
                                    <div className="w-full h-24 mb-2 flex items-center justify-center">
                                        {user.signatureUrl ? <img src={user.signatureUrl} alt={`Assinatura de ${user.name}`} className="max-h-24" /> : <div className="text-gray-400">(Sem Assinatura)</div>}
                                    </div>
                                    <div className="border-t-2 border-black pt-2">
                                        <p className="font-bold">{user.name}</p>
                                        <p className="text-sm capitalize">{formatRoleName(user.role)}</p>
                                    </div>
                                </div>
                            ))}
                             {supervisores.map(user => (
                                <div key={user.id} className="text-center">
                                    <div className="w-full h-24 mb-2 flex items-center justify-center">
                                        {user.signatureUrl ? <img src={user.signatureUrl} alt={`Assinatura de ${user.name}`} className="max-h-24" /> : <div className="text-gray-400">(Sem Assinatura)</div>}
                                    </div>
                                    <div className="border-t-2 border-black pt-2">
                                        <p className="font-bold">{user.name}</p>
                                        <p className="text-sm capitalize">{formatRoleName(user.role)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <footer className="mt-8 pt-4 border-t text-center text-xs text-gray-500 page-break-before">
                Relatório gerado por InfraCenter Manager
            </footer>
        </div>
    );
}
