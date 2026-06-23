import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/components/ui/Container";
import { CheckoutForm } from "./CheckoutForm";

// Checkout requires sign-in (guest checkout is deferred). Anonymous buyers
// are bounced to login with a return path, matching the role-gate pattern
// used in app/admin and app/dashboard.
export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/checkout");

  return (
    <Container width="mid" className="py-12">
      <h1 className="font-serif text-[34px] font-light text-ch mb-6">Checkout</h1>
      <CheckoutForm />
    </Container>
  );
}
