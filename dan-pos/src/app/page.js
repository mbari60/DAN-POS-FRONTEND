import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/pos-sale');
}

export const metadata = {
  title: 'POS System',
};