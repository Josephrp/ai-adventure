import { createAgent } from "@/lib/agent/agent.server";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function AdventurePage({
  params,
  searchParams,
}: {
  params: { adventureId: string };
  searchParams: { [key: string]: string };
}) {
  const { userId } = auth();
  if (!userId) throw new Error("no user");

  const agent = await createAgent(userId, params.adventureId);
  const search = new URLSearchParams(searchParams);
  redirect(`/play/${agent.handle}/character-creation?${search.toString()}`);
}
