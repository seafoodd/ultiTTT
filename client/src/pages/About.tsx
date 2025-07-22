import { useClientSeo } from "@/shared/hooks/use-client-seo";
import UnderConstruction from "../components/UnderConstruction";

const About = () => {

  useClientSeo({
    title: "About"
  })

  return (
    <div>
      <UnderConstruction/>
    </div>
  );
};

export default About;
