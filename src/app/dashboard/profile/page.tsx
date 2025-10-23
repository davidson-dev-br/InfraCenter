import { redirect } from 'next/navigation';

export default function ProfilePage() {
  // A página de perfil foi convertida em um modal,
  // então esta rota agora redireciona para o dashboard.
  redirect('/dashboard');
}
