import HeroSection from "../components/home/HeroSection";
import CategorySection from "../components/home/CategorySection";
import FeaturedProducts from "../components/home/FeaturedProducts";
import PromoBanner from "../components/home/PromoBanner";

const Home = () => {
  return (
    <main>
      <HeroSection />
      <CategorySection />
      <FeaturedProducts />
      <PromoBanner />
    </main>
  );
};

export default Home;