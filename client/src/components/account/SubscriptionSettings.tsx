import {
  useCancelSubscription,
  useResumeSubscription,
} from "@/shared/api/mutations/payments";
import { useGetSubscriptionStatus } from "@/shared/api/queries/payments";
import Button from "@/shared/ui/Button";
import LoadingCircle from "@/components/LoadingCircle";

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

  const { data, isPending } = useGetSubscriptionStatus();

  if (isPending) return <LoadingCircle />;

  const sub = data.subscription;
  const item = sub.items.data[0];
  const price = (item.price.unit_amount / 100).toFixed(2);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-start text-3xl font-medium mb-4">Subscription Settings</h2>

      <div className="space-y-2 text-md">
        <div className="flex justify-between">
          <span className="text-start w-40 font-medium">Status:</span>
          <span
            className={
              sub.cancel_at_period_end ? "text-color-danger-500" : "text-color-success-500"
            }
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
            <span className="text-start w-40 font-medium">Cancellation Date:</span>
            <span>{formatDate(sub.cancel_at)}</span>
          </div>
        )}
      </div>

      <div className="flex mt-4">
        {sub.cancel_at_period_end ? (
          <Button
            onClick={() => resumeSubscription()}
            isLoading={isResumePending}
            className="bg-color-accent-500 hover:bg-color-accent-400 w-28 h-10"
          >
            Resume
          </Button>
        ) : (
          <Button
            onClick={() => cancelSubscription()}
            isLoading={isCancelPending}
            className="bg-color-danger-600 hover:bg-color-danger-500 w-28 h-10"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSettings;
