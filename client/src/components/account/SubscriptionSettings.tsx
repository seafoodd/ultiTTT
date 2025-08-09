import {
  useCancelSubscription,
  useResumeSubscription,
} from "@/shared/api/mutations/payments";
import { useGetSubscriptionStatus } from "@/shared/api/queries/payments";
import Button from "@/shared/ui/Button";
import LoadingCircle from "@/components/LoadingCircle";
import { Link } from "react-router-dom";
import { useCallback } from "react";
import { cn } from "@/shared/lib/client/cn";

const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const SubscriptionSettings = () => {
  const { mutate: cancelSubscription, isPending: isCancelPending } =
    useCancelSubscription();
  const { mutate: resumeSubscription, isPending: isResumePending } =
    useResumeSubscription();
  const { data, isPending, error, isRefetching } = useGetSubscriptionStatus();

  const handleCancel = useCallback(
    () => cancelSubscription(),
    [cancelSubscription],
  );
  const handleResume = useCallback(
    () => resumeSubscription(),
    [resumeSubscription],
  );

  if (isPending || isRefetching) return <LoadingCircle />;

  if (error)
    return (
      <div
        className="text-color-danger-600 p-4 border border-color-danger-600 rounded"
        aria-live="polite"
      >
        Error loading subscription status: {error.message}
      </div>
    );

  const sub = data.subscription;
  if (!sub) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-start text-3xl font-medium mb-4">
          Manage Subscription
        </h2>
        <div className="space-y-2 text-md">
          <div className="flex justify-between">
            <span className="text-start w-40 font-medium">Status:</span>
            <span className="text-color-danger-500">
              No active subscription
            </span>
          </div>
        </div>
        <Button
          asChild
          className="bg-color-accent-500 hover:bg-color-accent-400 w-28 h-10 mt-4"
        >
          <Link to="/donate">Donate</Link>
        </Button>
      </div>
    );
  }

  const item = sub.items.data?.[0];
  if (!item) return <div>No subscription items found.</div>;

  const price = (item.price.unit_amount / 100).toFixed(2);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-start text-3xl font-medium mb-4">
        Manage Subscription
      </h2>

      <div className="space-y-2 text-md">
        <div className="flex justify-between">
          <span className="text-start w-40 font-medium">Status:</span>
          <span
            aria-live="polite"
            className={cn(
              sub.cancel_at_period_end
                ? "text-color-danger-500"
                : "text-color-success-500",
            )}
          >
            {sub.cancel_at_period_end ? "Cancelling" : "Active"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-start w-40 font-medium">Plan:</span>
          <span>
            €{price} / {item.price.recurring.interval}
          </span>
        </div>

        {sub.cancel_at_period_end && (
          <div className="flex justify-between">
            <span className="text-start w-40 font-medium">
              Cancellation Date:
            </span>
            <span>{formatDate(sub.cancel_at)}</span>
          </div>
        )}
      </div>

      <div className="flex mt-4">
        {sub.cancel_at_period_end ? (
          <Button
            onClick={handleResume}
            isLoading={isResumePending}
            disabled={isResumePending}
            className={cn(
              "w-28 h-10 bg-color-accent-500",
              "hover:bg-color-accent-400",
              "disabled:hover:bg-color-accent-500",
            )}
          >
            Resume
          </Button>
        ) : (
          <Button
            onClick={handleCancel}
            isLoading={isCancelPending}
            disabled={isCancelPending}
            className={cn(
              "w-28 h-10 bg-color-danger-600",
              "hover:bg-color-danger-500",
              "disabled:hover:bg-color-danger-600",
            )}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSettings;
