import { useState, useEffect } from 'react';
import { getProducts } from '../../api/products';
import ProductCard from '../../components/storefront/ProductCard';
import CategoryTabs from '../../components/storefront/CategoryTabs';
import { Waves, Loader2, Info } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts(selectedCategoryId);
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategoryId]);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative h-[460px] rounded-[48px] overflow-hidden bg-teal-500 shadow-2xl shadow-teal-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-teal-600 to-sage-800 opacity-90" />
        
        {/* Abstract "Water" Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Waves className="absolute -top-12 -left-12 text-white" size={400} />
          <Waves className="absolute -bottom-24 -right-24 text-white" size={500} />
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-center px-6 max-w-3xl mx-auto space-y-6">
          <span className="inline-block px-4 py-1.5 bg-mint-300 text-teal-900 text-xs font-black uppercase tracking-widest rounded-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            Premium Aquatic Collection
          </span>
          <h1 className="text-5xl sm:text-7xl font-black text-white leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
            A Living Jewel <br />
            <span className="text-mint-300">In Every Tank.</span>
          </h1>
          <p className="text-teal-50 text-lg font-medium opacity-90 max-w-xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Discover a curated world of rare aquatic species, lush plants, and premium supplies designed for the sophisticated aquarist.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-black text-sage-800 mb-2">The Collection</h2>
            <p className="text-sage-500 font-medium">Browse our ethically sourced aquatic treasures</p>
          </div>
          <CategoryTabs 
            selectedCategoryId={selectedCategoryId} 
            onSelectCategory={setSelectedCategoryId} 
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="text-teal-500 animate-spin" size={48} />
            <p className="text-sage-300 font-bold tracking-widest uppercase text-xs">Refreshing the waters...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.product_id}
                id={product.product_id}
                name={product.name}
                price={product.price}
                imagePath={product.image_path}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-6 bg-white rounded-[40px] border border-dashed border-sage-200 text-center space-y-4">
            <div className="h-16 w-16 bg-sage-50 rounded-full flex items-center justify-center text-sage-300">
              <Waves size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold text-sage-800">Calm Waters Ahead</p>
              <p className="text-sage-500">We couldn't find any products in this category at the moment.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
