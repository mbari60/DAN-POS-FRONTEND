import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/sales');
}

export const metadata = {
  title: 'Managerp',
};