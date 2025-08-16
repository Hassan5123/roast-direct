// client/src/app/page.tsx (landing page)

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-amber-900/80 to-amber-800 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Fresh Coffee,<br />
              <span className="text-amber-300">Complete Transparency</span>
            </h1>
            <p className="text-lg max-w-2xl">
              While most online coffee shops leave out key details, we provide everything: 
              farm information, processing methods, tasting notes, and more. All our coffee is sold as 1 pound per bag.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/products" 
                className="px-6 py-3 bg-amber-500 text-amber-900 font-semibold rounded-md hover:bg-amber-400 transition-colors duration-300 text-center"
              >
                Shop Fresh Coffee
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 h-64 md:h-96 w-full md:w-auto">
            <Image 
              src="/web-images/landing-page.jpg" 
              alt="Freshly roasted coffee beans"
              width={780}
              height={438}
              className="rounded-lg shadow-xl h-full w-full object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-amber-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-amber-900 mb-12">
            What Sets Us Apart
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Freshness Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-amber-600 hover:shadow-lg transition-shadow duration-300">
              <div className="text-amber-600 text-2xl mb-4">✓</div>
              <h3 className="font-bold text-xl mb-2 text-amber-900">Freshness Guarantee</h3>
              <p className="text-gray-700">
                All products on our site are within 2 weeks of roast date. Items are automatically removed once they cross that threshold.
              </p>
            </div>

            {/* Complete Details Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-amber-600 hover:shadow-lg transition-shadow duration-300">
              <div className="text-amber-600 text-2xl mb-4">✓</div>
              <h3 className="font-bold text-xl mb-2 text-amber-900">Complete Details</h3>
              <p className="text-gray-700">
                Every coffee includes origin country, elevation, farm info, processing method, and detailed tasting notes.
              </p>
            </div>

            {/* Support Roasters Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-amber-600 hover:shadow-lg transition-shadow duration-300">
              <div className="text-amber-600 text-2xl mb-4">✓</div>
              <h3 className="font-bold text-xl mb-2 text-amber-900">Support Roasters</h3>
              <p className="text-gray-700">
                Direct connection with passionate specialty roasters who prioritize quality and craftsmanship.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-amber-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Discover Coffee With Complete Clarity</h2>
          <p className="text-lg mb-8 text-amber-100">
            Know exactly what you're brewing with detailed information that most coffee shops leave out.
          </p>
          <Link 
            href="/products" 
            className="inline-block px-8 py-3 bg-white text-amber-900 font-semibold rounded-md hover:bg-amber-100 transition-colors duration-300"
          >
            Browse Coffee Selection
          </Link>
        </div>
      </section>
    </div>
  );
}