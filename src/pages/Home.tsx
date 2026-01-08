import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/home/HeroSection';
import ImageCarousel from '../components/home/ImageCarousel';
import ProductCategories from '../components/home/ProductCategories';
import WhyChooseUs from '../components/home/WhyChooseUs';
import AboutSection from '../components/home/AboutSection';
import CustomerReviews from '../components/home/CustomerReviews';
import InstagramFeed from '../components/home/InstagramFeed';
import Newsletter from '../components/home/Newsletter';

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <HeroSection />
                <ProductCategories />
                <ImageCarousel />
                <WhyChooseUs />
                <AboutSection />
                <CustomerReviews />
                <InstagramFeed />
                <Newsletter />
            </main>
            <Footer />
        </div>
    );
}
