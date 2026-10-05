import { notFound } from "next/navigation";
import Lab from "@/components/Lab";
import { ALGORITHMS, getAlgorithm } from "@/lib/ciphers";

export const dynamicParams = false;
export const generateStaticParams = () => ALGORITHMS.map((a) => ({ id: a.id }));

export default async function AlgorithmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getAlgorithm(id)) notFound();
  return <Lab key={id} initialId={id} />;
}
