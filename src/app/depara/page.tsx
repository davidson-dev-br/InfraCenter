
import { getConnectableChildItems, getAllConnections } from "@/lib/connection-actions";
import { DeParaClient } from "@/components/depara/depara-client";

// O código é como um labirinto, se você se perder, a culpa não é minha.
// Esta página será o cérebro das conexões De/Para.
export const dynamic = 'force-dynamic';

export default async function DeParaPage() {
  // Busca todos os equipamentos que podem ter conexões e as conexões existentes em paralelo
  const [connectableItems, existingConnections] = await Promise.all([
    getConnectableChildItems(),
    getAllConnections()
  ]);

  return <DeParaClient items={connectableItems} connections={existingConnections} />;
}
