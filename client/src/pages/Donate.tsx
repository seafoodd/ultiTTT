import { useClientSeo } from "@/shared/hooks/use-client-seo";
import UnderConstruction from "../components/UnderConstruction";
import { useEffect, useState } from "react";
import Axios from "axios";
import { Env } from "@/shared/constants/env";
import { useAuth } from "@/shared/provider/auth-provider";
import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from "react-router-dom";

const Donate = () => {
  useClientSeo({ title: "Donate" });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const priceId = "price_1RnjOAFpvYpqnz7jwhDM8CMB";

  const stripePromise = loadStripe(
    "pk_test_51RYT1uFpvYpqnz7jIVrh2udLQNmeKBJuv0lJebf34eWRApam0Y450B60OBRkqR0g9YVlFJRoX0GBo0oVuXK89pxb00ILw0KRGe",
  );

  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) return;

    const fetchSessionStatus = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await Axios.get(
          `${Env.VITE_API_V2_URL}/payments/session-status?session_id=${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Assume your backend returns something like { payment_status: "paid" }
        const status = response.data.payment_status;
        setPaymentStatus(status);
      } catch (err: any) {
        setError(err.message || "Failed to fetch payment status");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionStatus();
  }, [sessionId, token]);

  const createCheckoutSession = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await Axios.post(
        `${Env.VITE_API_V2_URL}/payments/checkout`,
        {
          priceId,
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
        return setError("Failed to create checkout session");
      }

      const { sessionId } = response.data;

      const stripe = await stripePromise;
      if (!stripe) return setError("Stripe failed to load");

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        return setError(error.message ?? "Unknown Stripe error");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <UnderConstruction />

      {sessionId && (
        <div>
          {loading && <p>Checking payment status...</p>}
          {paymentStatus && <p>Payment status: {paymentStatus}</p>}
        </div>
      )}

      <button onClick={createCheckoutSession} disabled={loading}>
        {loading ? "Loading..." : "Donate / Subscribe"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Donate;
