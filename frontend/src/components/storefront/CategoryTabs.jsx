import { useState, useEffect } from 'react';
import { getCategories } from '../../api/categories';
import { LayoutGrid, Loader2 } from 'lucide-react';

export default function CategoryTabs({ selectedCategoryId, onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sage-300">
        <Loader2 className="animate-spin" size={16} />
        <span className="text-sm font-medium">Loading filters...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-8">
      <button
        onClick={() => onSelectCategory(null)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
          selectedCategoryId === null
            ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 scale-105'
            : 'bg-white text-sage-500 hover:bg-sage-50 border border-sage-100'
        }`}
      >
        <LayoutGrid size={16} />
        All Species
      </button>

      {categories.map((category) => (
        <button
          key={category.category_id}
          onClick={() => onSelectCategory(category.category_id)}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
            selectedCategoryId === category.category_id
              ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 scale-105'
              : 'bg-white text-sage-500 hover:bg-sage-50 border border-sage-100'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
