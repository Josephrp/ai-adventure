import { Message, StreamingTextResponse } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { getSteamshipClient } from "@/lib/utils";
import { SteamshipStream } from "@/lib/streaming-client/src";

// IMPORTANT! Set the runtime to edgew
export const runtime = "edge";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    console.log("[Error] No user");
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  console.log("[Debug] Begin POST /api/chat");
  // Extract the `prompt` from the body of the request
  const { context_id, messages } = (await req.json()) as {
    context_id: string;
    messages: Message[];
  };
  console.log(
    `[Debug] Begin message length=${messages?.length} context_id=${context_id}`
  );
  const mostRecentUserMessage = messages
    .reverse()
    .find((message) => message.role === "user");
  console.log(`[Debug] Begin message=${mostRecentUserMessage}`);

  const steamship = getSteamshipClient();
  // See https://docs.steamship.com/javascript_client for information about:
  // - The BASE_URL where your running Agent lives
  // - The context_id which mediates your Agent's server-side chat history
  const response = await steamship.agent.respondAsync({
    url: process.env.PLACEHOLDER_STEAMSHIP_AGENT_URL!,
    input: {
      prompt: mostRecentUserMessage?.content || "",
      context_id,
    },
  });

  console.log(`[Debug] Steamship response ${response}`);

  // Adapt the Streamship Blockstream into a Markdown Stream
  const stream = await SteamshipStream(response, steamship, {
    streamTimeoutSeconds: 600,
    // Use: "markdown" | "json"
    format: "json-no-inner-stream",
  });

  // Respond with a stream of Markdown
  return new StreamingTextResponse(stream);
}
