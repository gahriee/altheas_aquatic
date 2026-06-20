import { useState, useEffect } from 'react';
import { getProducts } from '../../api/products';
import ProductCard from '../../components/storefront/ProductCard';
import CategoryTabs from '../../components/storefront/CategoryTabs';
import { Waves, Loader2 } from 'lucide-react';

/**
 * Home page component — renders the storefront hero banner, category filter tabs,
 * and the product listing grid. Products are grouped by category when no filter
 * is active, or displayed as a flat grid when a specific category is selected.
 */
export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  useEffect(() => {
    /**
     * Fetches products from the API, optionally filtered by category,
     * and updates local state. Runs whenever selectedCategoryId changes.
     */
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts(selectedCategoryId);
        // Filter out products with 0 quantity
        const inStockProducts = data.filter(product => product.stock_qty > 0);
        setProducts(inStockProducts);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategoryId]);

  /**
   * Groups an array of product objects by their category_name field.
   * Returns an object keyed by category name, each value an array of products.
   */
  const groupProductsByCategory = (products) => {
    return products.reduce((groups, product) => {
      const category = product.category_name || 'Uncategorized';
      if (!groups[category]) groups[category] = [];
      groups[category].push(product);
      return groups;
    }, {});
  };

  const groupedProducts = groupProductsByCategory(products);

  return (
    <div className="space-y-8 sm:space-y-12">
      <section className="relative h-[280px] sm:h-[360px] md:h-[460px] rounded-3xl sm:rounded-[48px] overflow-hidden bg-teal-500 shadow-2xl shadow-teal-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-teal-600 to-sage-800 opacity-90" />

        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Waves className="absolute -top-12 -left-12 text-white hidden sm:block" size={400} />
          <Waves className="absolute -bottom-24 -right-24 text-white hidden sm:block" size={500} />
          <Waves className="absolute -top-6 -left-6 text-white sm:hidden" size={200} />
          <Waves className="absolute -bottom-12 -right-12 text-white sm:hidden" size={250} />
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-3xl mx-auto space-y-3 sm:space-y-6">
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-mint-300 text-teal-900 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            Grown with love, shipped with care
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold font-display text-white leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
            Breathe Life <br />
            <span className="text-mint-300">Into Your Home.</span>
          </h1>
          <p className="text-teal-50 text-sm sm:text-lg font-medium opacity-90 max-w-xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
            We help you build more than just an aquarium—we help you create a thriving underwater world. Explore our hand-picked collection of rare species, lush plants, and essentials.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-1 sm:px-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-16">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-sage-800 mb-1 sm:mb-2 tracking-tight">Meet the Residents</h2>
            <p className="text-sm sm:text-base text-sage-500 font-medium">Healthy, happy, and ready for their new home</p>
          </div>
          <CategoryTabs 
            selectedCategoryId={selectedCategoryId} 
            onSelectCategory={setSelectedCategoryId} 
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 space-y-4">
            <div className="relative">
              <Loader2 className="text-teal-500 animate-spin" size={48} />
              <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full animate-pulse" />
            </div>
            <p className="text-sage-300 font-bold tracking-[0.2em] uppercase text-[10px]">Getting the water just right...</p>
          </div>
        ) : products.length > 0 ? (
          selectedCategoryId === null ? (
            <div className="space-y-10 sm:space-y-16">
              {Object.entries(groupedProducts).map(([category, items]) => (
                <div key={category} className="space-y-4 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <h3 className="text-lg sm:text-xl font-bold font-display text-sage-800 tracking-tight flex-shrink-0">{category}</h3>
                    <div className="h-px w-full bg-gradient-to-r from-sage-100 to-transparent" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
                    {items.map((product) => (
                      <ProductCard
                        key={product.product_id}
                        id={product.product_id}
                        name={product.name}
                        price={product.price}
                        imagePath={product.image_path}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 sm:px-6 bg-white rounded-2xl sm:rounded-[40px] border border-dashed border-sage-200 text-center space-y-4 shadow-sm shadow-sage-100">
            <div className="h-14 w-14 sm:h-16 sm:w-16 bg-sage-50 rounded-full flex items-center justify-center text-sage-300">
              <Waves size={28} className="sm:hidden" />
              <Waves size={32} className="hidden sm:block" />
            </div>
            <div className="space-y-1">
              <p className="text-lg sm:text-xl font-bold font-display text-sage-800">Still Diving for Treasures</p>
              <p className="text-sm sm:text-base text-sage-500 font-medium">We're currently restocking these local favorites. Check back with us soon!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
