import { redirect } from 'next/navigation';

export default function VitaeIndex() {
  // Default to the MIDDLE tab: Path
  redirect('/vitae/path');
}
