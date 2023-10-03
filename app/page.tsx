import { Button } from "@/components/ui/button";
import { TypographyH1 } from "@/components/ui/typography/TypographyH1";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <UserButton afterSignOutUrl="/" />

      <TypographyH1>AI Adventure</TypographyH1>
      <Button asChild>
        <Link href="/game">Get Started</Link>
      </Button>
    </main>
  );
}
