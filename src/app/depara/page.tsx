import { getConnectableChildItems } from "@/lib/connection-actions";
import { DeParaClient } from "@/components/depara/depara-client";

// O código é como um labirinto, se você se perder, a culpa não é minha.
// Esta página será o cérebro das conexões De/Para.
export const dynamic = 'force-dynamic';

export default async function DeParaPage() {
  // Busca todos os equipamentos que podem ter conexões
  const connectableItems = await getConnectableChildItems();

  return <DeParaClient items={connectableItems} />;
}
