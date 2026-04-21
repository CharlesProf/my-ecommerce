"use client";

type ToastProps = {
  message: string;
  variant?: "success" | "error";
  onClose?: () => void;
};

export function Toast({ message, variant = "success", onClose }: ToastProps) {
  const baseClasses =
    "fixed bottom-4 right-4 z-50 max-w-xs rounded-xl border px-4 py-3 shadow-xl shadow-black/10 text-sm font-medium";
  const variantClasses =
    variant === "error"
      ? "bg-destructive/10 border-destructive text-destructive"
      : "bg-emerald-500/10 border-emerald-500 text-emerald-950";

  return (
    <div className={`${baseClasses} ${variantClasses}`}>
      <div className="flex items-center justify-between gap-3">
        <span>{message}</span>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xs font-semibold text-current opacity-80 hover:opacity-100"
          >
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
}
