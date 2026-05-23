import { redirect } from 'next/navigation';

export default function WalletIndex() {
  redirect('/wallet/receipts');
}
