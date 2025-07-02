import Button from "../shared/ui/Button";
import { BiHome } from "react-icons/bi";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center gap-4 mt-12">
      <div className="font-medium text-3xl">404 - Page Not Found</div>
      <Button
        icon={<BiHome className="h-full" />}
        href="/"
        className="bg-color-accent-400 px-4 py-2 mt-2"
      >
        Home
      </Button>
    </div>
  );
};

export default NotFound;
