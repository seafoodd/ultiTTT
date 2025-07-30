import { useClientSeo } from "@/shared/hooks/use-client-seo";
import UnderConstruction from "../components/UnderConstruction";
import { useState } from "react";
import Axios from "axios";
import { Env } from "@/shared/constants/env";
import { useAuth } from "@/shared/provider/auth-provider";
import { loadStripe } from "@stripe/stripe-js";

const Donate = () => {
  useClientSeo({ title: "Donate" });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // Example priceId - replace with your actual price IDs from Stripe
  const priceId = "price_1RnjOAFpvYpqnz7jwhDM8CMB";

  const stripePromise = loadStripe("pk_test_51RYT1uFpvYpqnz7jIVrh2udLQNmeKBJuv0lJebf34eWRApam0Y450B60OBRkqR0g9YVlFJRoX0GBo0oVuXK89pxb00ILw0KRGe");

  const createCheckoutSession = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await Axios.post(
        `${Env.VITE_API_V2_URL}/payments/create-checkout-session`,
        {
          priceId,
          successUrl: window.location.origin,
          cancelUrl: window.location.origin + "/donate",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log(response);


      if (response.status !== 201 && response.status !== 200) {
        throw new Error("Failed to create checkout session");
      }

      const { sessionId } = response.data;

      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");

      const { error } = await stripe.redirectToCheckout({ sessionId });
      throw new Error(error.message)

    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <UnderConstruction />

      <button onClick={createCheckoutSession} disabled={loading}>
        {loading ? "Loading..." : "Donate / Subscribe"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Donate;
