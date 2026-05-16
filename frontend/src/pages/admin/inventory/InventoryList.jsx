import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit3, Trash2, AlertCircle, CheckCircle, Info, X, AlertTriangle, PackageX, PackageMinus, Filter } from 'lucide-react';
import { getAllProducts, deactivateProduct } from '../../../api/products';
import { getAllCategories } from '../../../api/categories';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import DataTable from '../../../components/admin/DataTable';
import TrashDialog from '../../../components/admin/TrashDialog';
import ConfirmationDialog from '../../../components/admin/ConfirmationDialog';
import Tooltip from '../../../components/ui/Tooltip';
import { useDebounce } from '../../../hooks/useDebounce';

export default function InventoryList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load inventory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleDeactivate = async () => {
    if (!confirmDeactivate) return;

    try {
      setIsDeactivating(true);
      await deactivateProduct(confirmDeactivate.id);
      setConfirmDeactivate(null);
      fetchProducts(); // Refresh list
    } catch (err) {
      setError('Failed to deactivate product: ' + err.message);
    } finally {
      setIsDeactivating(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (!p.is_active) return false;

      const matchesSearch = 
        p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.category_name.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || p.category_id?.toString() === selectedCategory?.toString();
      
      const isLowStock = p.stock_qty <= p.low_stock_threshold;
      const matchesLowStock = showLowStockOnly ? isLowStock : true;

      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [products, debouncedSearch, selectedCategory, showLowStockOnly]);

  const lowStockProducts = useMemo(() => products.filter(p => p.is_active && p.stock_qty <= p.low_stock_threshold), [products]);
  const criticalCount = useMemo(() => lowStockProducts.filter(p => parseInt(p.stock_qty, 10) === 0).length, [lowStockProducts]);
  const warningCount = lowStockProducts.length - criticalCount;

  const columns = [
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (product) => {
        const isLowStock = product.stock_qty <= product.low_stock_threshold;
        const isInactive = !product.is_active;

        return (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sage-50 flex-shrink-0 flex items-center justify-center overflow-hidden border border-sage-100 shadow-sm">
              {product.image_path ? (
                <img 
                  src={`/image.php?file=${product.image_path}`} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sage-300 text-xs font-bold uppercase">{product.name.substring(0, 2)}</span>
              )}
            </div>
            <div>
              <p className="font-bold text-sage-800">{product.name}</p>
              {isLowStock && !isInactive && (
                <span className="text-[9px] text-coral-500 font-bold uppercase tracking-widest bg-coral-50 px-1.5 py-0.5 rounded-md border border-coral-100">Low Stock</span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'category_name',
      label: 'Category',
      sortable: true,
      render: (p) => <span className="text-sage-500 font-semibold">{p.category_name}</span>
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (p) => <span className="font-bold font-display text-teal-600">₱{parseFloat(p.price).toFixed(2)}</span>
    },
    {
      key: 'stock_qty',
      label: 'Stock',
      sortable: true,
      align: 'center',
      render: (p) => {
        const isLowStock = p.stock_qty <= p.low_stock_threshold;
        return (
          <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold ${
            isLowStock ? 'bg-coral-500 text-white shadow-lg shadow-coral-500/20' : 'bg-mint-100 text-teal-600'
          }`}>
            {p.stock_qty}
          </span>
        );
      }
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      align: 'center',
      render: (p) => p.is_active ? (
        <span className="inline-flex items-center gap-1 text-emerald-500 font-bold text-[10px] uppercase tracking-widest px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
          <CheckCircle size={12} /> Active
        </span>
      ) : (
        <span className="text-sage-300 font-bold text-[10px] uppercase tracking-widest px-2 py-1 bg-sage-50 rounded-lg border border-sage-100">Inactive</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (product) => (
        <div className="flex justify-end gap-1">
          <Tooltip text="Edit Product">
            <Link 
              to={`/admin/inventory/edit/${product.product_id}`}
              className="p-2 text-sage-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
              onClick={(e) => e.stopPropagation()} // Prevent row toggle
            >
              <Edit3 size={18} />
            </Link>
          </Tooltip>
          {product.is_active && (
            <Tooltip text="Deactivate & Archive">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent row toggle
                  setConfirmDeactivate({ id: product.product_id, name: product.name });
                }}
                className="p-2 text-sage-400 hover:text-coral-500 hover:bg-coral-50 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </Tooltip>
          )}
        </div>
      )
    }
  ];

  const isSearching = searchTerm !== debouncedSearch;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl xl:text-4xl font-bold font-display text-teal-600 tracking-tight">Inventory</h1>
          <p className="text-sage-500 text-sm xl:text-lg mt-1">Manage your aquatic species catalog and stock levels.</p>
        </div>
      </div>

      {/* Inventory Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div 
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          className={`group cursor-pointer p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
            showLowStockOnly 
              ? 'bg-teal-500 border-teal-600 shadow-lg shadow-teal-500/30' 
              : 'bg-white border-sage-200 hover:border-teal-300 hover:shadow-md'
          }`}
        >
          {/* Background pattern/accent */}
          <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150 ${showLowStockOnly ? 'bg-white' : 'bg-teal-500'}`}></div>
          
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Filter size={16} className={showLowStockOnly ? 'text-teal-100' : 'text-sage-400 group-hover:text-teal-500'} />
                <p className={`text-sm font-bold uppercase tracking-wider ${showLowStockOnly ? 'text-teal-50' : 'text-sage-500 group-hover:text-teal-600'}`}>
                  Low Stock Filter
                </p>
              </div>
              <p className={`text-xl xl:text-3xl font-bold font-display ${showLowStockOnly ? 'text-white' : 'text-teal-600'}`}>
                {lowStockProducts.length} <span className={`text-base xl:text-lg font-medium ${showLowStockOnly ? 'text-teal-200' : 'text-sage-400'}`}>Items</span>
              </p>
              <p className={`text-xs mt-3 font-medium flex items-center gap-1.5 ${showLowStockOnly ? 'text-teal-100' : 'text-sage-400'}`}>
                {showLowStockOnly ? (
                  <>Showing only low stock. Click to remove filter.</>
                ) : (
                  <>Click to filter the table below.</>
                )}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${showLowStockOnly ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-600 group-hover:bg-teal-100'}`}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-coral-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-coral-500 opacity-5"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-coral-600/80 text-sm font-bold uppercase tracking-wider mb-2">Critical Stock</p>
              <p className="text-xl xl:text-3xl font-bold font-display text-coral-600">{criticalCount} <span className="text-base xl:text-lg font-medium text-coral-400">Items</span></p>
            </div>
            <div className="p-3 rounded-xl bg-coral-50 text-coral-500 border border-coral-100">
              <PackageX size={24} />
            </div>
          </div>
          <p className="text-xs font-medium text-coral-500 mt-3 relative z-10">
            Completely out of stock (0 units)
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-amber-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-amber-500 opacity-5"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-amber-600/80 text-sm font-bold uppercase tracking-wider mb-2">Warning Stock</p>
              <p className="text-xl xl:text-3xl font-bold font-display text-amber-600">{warningCount} <span className="text-base xl:text-lg font-medium text-amber-400">Items</span></p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-500 border border-amber-100">
              <PackageMinus size={24} />
            </div>
          </div>
          <p className="text-xs font-medium text-amber-600 mt-3 relative z-10">
            At or below threshold (needs restock)
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-coral-50 text-coral-500 rounded-2xl border border-coral-100 flex items-center gap-2 animate-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <span className="font-bold text-sm tracking-tight">{error}</span>
        </div>
      )}

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto flex-1">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300 group-focus-within:text-teal-500 transition-colors" size={18} />
            <Input 
              placeholder="Search catalog by name..." 
              className="pl-12 bg-white" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select 
            className="w-full md:w-56 !bg-white"
            placeholder="All Categories"
            options={[
              { label: 'All Categories', value: 'all' },
              ...categories.map(c => ({ 
                label: c.name, 
                value: c.category_id?.toString() || c.name 
              }))
            ]}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />

          {(searchTerm !== '' || selectedCategory !== 'all' || showLowStockOnly) && (
            <Tooltip text="Clear Filters">
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setShowLowStockOnly(false); }}
                className="p-3 text-sage-400 hover:text-coral-500 bg-white rounded-2xl border border-sage-100 transition-all hover:bg-coral-50"
              >
                <X size={20} />
              </button>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            variant="secondary" 
            className="flex items-center gap-2"
            onClick={() => setIsTrashOpen(true)}
          >
            <Trash2 size={20} />
            Trash
          </Button>
          <Link to="/admin/inventory/add" className="flex-1 sm:flex-none">
            <Button variant="primary">
              <Plus size={20} />
              Add New Product
            </Button>
          </Link>
        </div>
      </div>

      <DataTable 
        columns={columns}
        data={filteredProducts}
        loading={loading || isSearching}
        pageSize={10}
        renderExpanded={(product) => (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2 text-teal-600">
                <Info size={18} />
                <h4 className="font-bold uppercase text-[10px] tracking-widest">Product Description</h4>
              </div>
              <p className="text-sage-500 leading-relaxed font-medium bg-white p-6 rounded-2xl border border-sage-100 shadow-sm">
                {product.description || 'No description provided for this aquatic species.'}
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-teal-600">
                <AlertCircle size={18} />
                <h4 className="font-bold uppercase text-[10px] tracking-widest">Inventory Detail</h4>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-sage-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-sage-400 font-bold">Low Stock Threshold</span>
                  <span className="text-sage-700 font-bold">{product.low_stock_threshold}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-sage-400 font-bold">Total Sales (placeholder)</span>
                  <span className="text-sage-700 font-bold">0</span>
                </div>
              </div>
            </div>
          </div>
        )}
      />

      <TrashDialog 
        isOpen={isTrashOpen} 
        onClose={() => setIsTrashOpen(false)} 
        onRestored={fetchProducts}
      />

      <ConfirmationDialog
        isOpen={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Product"
        message={`Are you sure you want to deactivate "${confirmDeactivate?.name}"? It will be moved to the archive and hidden from the storefront.`}
        confirmLabel="Deactivate"
        variant="danger"
        loading={isDeactivating}
      />
    </div>
  );
}
