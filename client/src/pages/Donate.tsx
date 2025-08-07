import { useClientSeo } from "@/shared/hooks/use-client-seo";
import { Env } from "@/shared/constants/env";
import { loadStripe } from "@stripe/stripe-js";
// import { useSearchParams } from "react-router-dom";
import Button from "@/shared/ui/Button";
import {
  // useCancelSubscription,
  useCreateCheckoutSession,
  // useResumeSubscription,
} from "@/shared/api/mutations/payments";
import { AiFillHeart } from "react-icons/ai";
import { useAuth } from "@/shared/providers/auth-provider";
import { useNavigate } from "react-router-dom";

const Donate = () => {
  useClientSeo({ title: "Donate" });

  const navigate = useNavigate();

  const priceId = "price_1RnjOAFpvYpqnz7jwhDM8CMB";

  const stripeKey = Env.VITE_STRIPE_PUBLISHABLE_KEY;
  const stripePromise = loadStripe(stripeKey);

  // const { mutate: cancelSubscription, isPending: isCancelSubscriptionPending } =
  //   useCancelSubscription();
  // const { mutate: resumeSubscription, isPending: isResumeSubscriptionPending } =
  //   useResumeSubscription();
  const {
    mutateAsync: createCheckoutSession,
    isPending: isCreateCheckoutPending,
    error: createCheckoutError,
  } = useCreateCheckoutSession();

  const { currentUser, isAuth } = useAuth();

  // const [searchParams] = useSearchParams();
  // const sessionId = searchParams.get("session_id");

  const checkout = async () => {
    const response = await createCheckoutSession(priceId);
    const { sessionId } = response.data;

    console.log(sessionId);
    const stripe = await stripePromise;
    if (!stripe) {
      console.log("Stripe failed to load");
      return;
    }

    await stripe.redirectToCheckout({ sessionId });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Support ultiTTT</h1>
      <p className="text-lg max-w-xl">
        {currentUser?.supporter
          ? "Thank you for supporting ultiTTT! 🙌 Your contribution helps\n" +
            "us maintain and grow the platform. You can manage your\n" +
            "subscription at any time in the settings:"
          : "ultiTTT is a free and open platform for competitive Ultimate Tic\n" +
            "Tac Toe. Your donations help cover server costs, development time,\n" +
            "and future improvements."}
      </p>
      <div className="flex flex-col items-center mt-8">
        <Button
          className="bg-color-accent-500 px-3 py-2 w-fit"
          onClick={
            isAuth
              ? currentUser?.supporter
                ? () => navigate("/settings/subscription")
                : () => checkout()
              : () => navigate("/login")
          }
          isLoading={!currentUser?.supporter && isCreateCheckoutPending}
        >
          {isAuth ? (
            currentUser?.supporter ? (
              "Manage subscription"
            ) : (
              <>
                <AiFillHeart /> Subscribe for $5/month
              </>
            )
          ) : (
            "Log In to Donate"
          )}
        </Button>
        {createCheckoutError && createCheckoutError.response?.data?.message && (
          <p className="text-red-600">
            {createCheckoutError.response.data.message}
          </p>
        )}
      </div>
      <div className="mt-6 text-md">
        <p>
          {currentUser?.supporter
            ? "Enjoy your supporter perks"
            : "Donors will receive the following perks"}
          :
        </p>
        <ul className="mx-auto w-fit my-2 list-disc list-inside">
          <li>Supporter badge on your profile</li>
        </ul>
        More perks coming soon!
      </div>

      <p className="text-sm text-muted-foreground mt-12">
        Payments are processed securely via Stripe. We never store your card
        details.
      </p>

      {/*<div className="mt-8 flex gap-4 justify-center items-center">*/}
      {/*  <Button*/}
      {/*    onClick={() => cancelSubscription()}*/}
      {/*    isLoading={isCancelSubscriptionPending}*/}
      {/*    className="bg-color-accent-600 p-3 w-24 h-12"*/}
      {/*  >*/}
      {/*    CANCEL*/}
      {/*  </Button>*/}
      {/*  <Button*/}
      {/*    onClick={() => resumeSubscription()}*/}
      {/*    isLoading={isResumeSubscriptionPending}*/}
      {/*    className="bg-color-accent-600 p-3 w-24 h-12"*/}
      {/*  >*/}
      {/*    RESUME*/}
      {/*  </Button>*/}
      {/*</div>*/}
    </div>
  );
};

export default Donate;
