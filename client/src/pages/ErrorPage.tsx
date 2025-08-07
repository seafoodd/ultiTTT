import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { useClientSeo } from "@/shared/hooks/use-client-seo";
import Button from "@/shared/ui/Button";
import { APP_ROUTES } from "@/shared/constants/app-routes";
import { BiHome } from "react-icons/bi";

const ErrorPage = () => {
  const error = useRouteError();
  useClientSeo({
    title: "Not Found",
  });

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div className="text-center mt-20 flex flex-col items-center">
          <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
          <p className="mt-4 text-lg">The page you are looking for doesn’t exist.</p>
          <Button asChild className="bg-color-accent-400 px-4 py-2 mt-4 w-fit">
            <Link to={APP_ROUTES.Home}>
              <BiHome className="h-full" />
              Home
            </Link>
          </Button>
        </div>
      );
    }
  }

  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-bold">Unexpected Error</h1>
      <p className="mt-2">
        {(error as Error).message || "Something went wrong."}
      </p>
    </div>
  );
};

export default ErrorPage;
