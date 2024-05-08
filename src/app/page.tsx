// page.tsx
"use client";
import { ConnectButton, ConnectEmbed, MediaRenderer, useActiveAccount, useReadContract } from "thirdweb/react";
import { client } from "@/app/client";
import { chain } from "@/app/chain";
import { contract } from "@/utils/contract";
import { getContractMetadata } from "thirdweb/extensions/common";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CreditCardForm from './CreditCardForm';

export default function Home() {
  const account = useActiveAccount();
  const [clientSecret, setClientSecret] = useState<string>("");
  const { data: contractMetadata } = useReadContract(getContractMetadata, {
    contract: contract,
  });

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error("Missing Stripe publishable key");
  }

  const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

  const onClick = async () => {
    const res = await fetch("/api/stripe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ buyerWalletAddress: account?.address }),
    });

    if (res.ok) {
      const json = await res.json();
      setClientSecret(json.clientSecret);
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-500 to-white flex flex-col justify-center items-center">
        <h1 className="text-white text-5xl text-center mb-8">Stripe + Engine</h1>
        <div className="border border-gray-300 p-4 rounded-lg shadow-lg">
          <ConnectEmbed className="w-full h-auto" client={client} chain={chain} />
        </div>
      </div>
    );
  }

  if (account) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-b from-purple-500 to-white flex flex-col justify-center items-center">
          <ConnectButton client={client} chain={chain} />
          {contractMetadata && (
            <div>
              <MediaRenderer
                className="w-64 h-64 rounded-lg shadow-lg mt-3"
                client={client}
                src={contractMetadata.image}
              />
            </div>
          )}
          {!clientSecret ? (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-3"
              onClick={onClick}
              disabled={!account}
            >
              BUY WITH CREDIT CARD
            </button>
          ) : (
            <>
              <Elements
                options={{
                  clientSecret: clientSecret,
                  appearance: { theme: "night" },
                }}
                stripe={stripe}
              >
                <div className="mt-3">
                  <CreditCardForm />
                </div>
              </Elements>
            </>
          )}
        </div>
      </>
    );
  }
}