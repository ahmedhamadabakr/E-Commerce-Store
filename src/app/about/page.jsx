export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center py-10">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-4">About Us</h1>
        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
          Our online store is dedicated to providing the best products with top quality and competitive prices, offering a seamless and secure shopping experience for all our customers.
        </p>
        <div className="bg-blue-50 rounded-xl p-6 mt-6">
          <h2 className="text-2xl font-bold text-blue-700 mb-2">Our Vision</h2>
          <p className="text-gray-600 mb-4">
            To be the first choice for online shopping, delivering a unique experience that combines quality, variety, and reliability.
          </p>
          <h2 className="text-2xl font-bold text-blue-700 mb-2">Our Values</h2>
          <ul className="text-gray-600 list-disc list-inside text-left">
            <li>Transparency and honesty in all dealings</li>
            <li>Continuous innovation and improvement</li>
            <li>Customer satisfaction is our priority</li>
            <li>Commitment to quality</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
