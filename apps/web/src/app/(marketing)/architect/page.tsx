import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default function ArchitectRoot() {
  redirect("/architect/review");
}
