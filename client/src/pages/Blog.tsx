import UnderConstruction from "@/components/UnderConstruction";
import { useClientSeo } from "@/shared/hooks/use-client-seo";

const Blog = () => {
  useClientSeo({
    title: "Blog"
  })

  return (
    <div>
      <UnderConstruction />
    </div>
  );
};

export default Blog;
