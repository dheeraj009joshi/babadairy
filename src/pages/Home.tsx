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
                <div className="px-4 sm:px-6 lg:px-8">
                    <section className="mt-0 mb-8 sm:mt-0 sm:mb-12 lg:mt-0 lg:mb-16">
                        <HeroSection />
                    </section>

                    <section className="my-8 sm:my-12 lg:my-16">
                        <AboutSection />
                    </section>

                    <section className="my-8 sm:my-12 lg:my-16">
                        <ProductCategories />
                    </section>

                    <section className="my-8 sm:my-12 lg:my-16">
                        <ImageCarousel />
                    </section>

                    <section className="my-8 sm:my-12 lg:my-16">
                        <WhyChooseUs />
                    </section>

                    <section className="my-8 sm:my-12 lg:my-16">
                        <CustomerReviews />
                    </section>

                    <section className="my-8 sm:my-12 lg:my-16">
                        <Newsletter />
                    </section>

                    <section className="my-8 sm:my-12 lg:my-16">
                        <InstagramFeed />
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
