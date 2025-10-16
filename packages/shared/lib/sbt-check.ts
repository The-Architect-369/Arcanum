// 🜃 Soul-bound token detection — local identity resonance.
export function isSoulBound(): boolean {
  if (typeof window === "undefined") return false;
  const sbt = localStorage.getItem("chaincode-sbt");
  return Boolean(sbt);
}