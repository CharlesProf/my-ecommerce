"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { completeTransaction } from "./actions";

type CompleteTransactionButtonProps = {
  transactionId: string;
};

export function CompleteTransactionButton({ transactionId }: CompleteTransactionButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleComplete = async () => {
    setErrorMessage("");
    setToastMessage("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("transactionId", transactionId);
      await completeTransaction(formData);
      setToastMessage("Transaction has been set to Completed");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to complete transaction."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <Button
          type="button"
          variant="secondary"
          className="bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={handleComplete}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Completing..." : "Mark as Completed"}
        </Button>
      </div>
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
      {toastMessage ? (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage("")}
        />
      ) : null}
    </div>
  );
}
