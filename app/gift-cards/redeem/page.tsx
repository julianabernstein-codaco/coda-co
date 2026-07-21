import type { Metadata } from "next";
import { auth } from "@/auth";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { RedeemForm } from "./RedeemForm";

export const metadata: Metadata = {
  title: "Check a gift card balance · CodaCo",
};

export default async function RedeemGiftCardPage() {
  const session = await auth();

  return (
    <Container width="narrow" className="py-12">
      <div className="mb-8">
        <h1 className="font-serif text-[34px] font-light text-ch mb-2">Gift card balance</h1>
        <p className="text-[17px] text-cl leading-relaxed">
          Enter your gift card code to see what's left on it. Sign in to add the balance to
          your account so it applies automatically at checkout.
        </p>
      </div>

      <Card className="max-w-[460px]">
        <RedeemForm signedIn={Boolean(session?.user)} />
      </Card>
    </Container>
  );
}
