"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { cancelTransaction } from "../actions";

type CancelTransactionButtonProps = {
  transactionId: string;
};

export function CancelTransactionButton({ transactionId }: CancelTransactionButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleCancel = async () => {
    setErrorMessage("");
    setToastMessage("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("transactionId", transactionId);
      await cancelTransaction(formData);
      setToastMessage("Transaction has been cancelled.");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to cancel transaction."
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
          variant="destructive"
          className="bg-destructive text-white hover:bg-destructive/90"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Cancelling..." : "Cancel Transaction"}
        </Button>
      </div>
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
      {toastMessage ? (
        <Toast
          message={toastMessage}
          variant="success"
          onClose={() => setToastMessage("")}
        />
      ) : null}
    </div>
  );
}
