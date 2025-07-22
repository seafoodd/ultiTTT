import { useClientSeo } from "@/shared/hooks/use-client-seo";
import Button from "../shared/ui/Button";
import { BiHome } from "react-icons/bi";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "@/shared/constants/app-routes";

const NotFound = () => {
  useClientSeo({
    title: "Not Found",
  });

  return (
    <div className="flex flex-col items-center gap-4 mt-12">
      <div className="font-medium text-3xl">404 - Page Not Found</div>
      <Button asChild className="bg-color-accent-400 px-4 py-2 mt-2">
        <Link to={APP_ROUTES.Home}>
          <BiHome className="h-full" />
          Home
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
