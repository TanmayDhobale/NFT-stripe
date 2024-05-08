import { CardElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";

const CreditCardForm = () => {
  const elements = useElements();
  const stripe = useStripe();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement || elements) {
      return;
    }

    try {
      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: "http://localhost:3000",
        },
        redirect: "if_required",
      });
      if (error) {
        throw error.message;
      }
      if (paymentIntent.status === "succeeded") {
        alert(
          "Payment success. The NFT will be delivered to your wallet shortly."
        );
        setLoading(true);
      } else {
        alert("Payment failed. Please try again.");
      }
    } catch (e) {
      alert(`There was an error with the payment. ${e}`);
    }

    setLoading(false);
  };


  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        disabled={loading || succeeded}
        className="margin-top-3 bg-blue-500 text-white px-4 py-2 rounded-lg width: 100% cursor-pointer mt-3"
        type="submit"
      >
        {succeeded ? "Payment Succeeded" : loading ? "Payment Processing..." : "Pay Now"}
      </button>
      {error && <div>{error}</div>}
    </form>
  );
};

export default CreditCardForm;