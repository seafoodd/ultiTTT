import { useClientSeo } from "@/shared/hooks/use-client-seo";
import UnderConstruction from "../components/UnderConstruction";

const Donate = () => {

  useClientSeo({
    title: "Donate"
  })

  return (
    <div>
      <UnderConstruction/>
    </div>
  );
};

export default Donate;
