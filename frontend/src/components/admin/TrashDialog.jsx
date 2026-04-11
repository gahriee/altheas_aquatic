import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, RotateCcw, X, Loader2 } from 'lucide-react';
import { getInactiveProducts, restoreProduct, hardDeleteProduct } from '../../api/products';
import ConfirmationDialog from './ConfirmationDialog';
import Tooltip from '../ui/Tooltip';

/**
 * ----------------------------------------
 * TrashDialog
 * ----------------------------------------
 * A premium modal for managing soft-deleted products.
 * Uses React Portal for proper viewport overlay.
 */
export default function TrashDialog({ isOpen, onClose, onRestored }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmData, setConfirmData] = useState(null); // { type, id, name }

  useEffect(() => {
    if (isOpen) {
      fetchTrash();
    }
  }, [isOpen]);

  async function fetchTrash() {
    try {
      setLoading(true);
      const data = await getInactiveProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load trash:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleRestore = async () => {
    if (!confirmData) return;
    const { id } = confirmData;
    try {
      setRestoringId(id);
      await restoreProduct(id);
      setProducts(products.filter(p => p.product_id !== id));
      setConfirmData(null);
      onRestored();
    } catch (err) {
      console.error('Failed to restore product:', err);
    } finally {
      setRestoringId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmData) return;
    const { id } = confirmData;

    try {
      setDeletingId(id);
      await hardDeleteProduct(id);
      setProducts(products.filter(p => p.product_id !== id));
      setConfirmData(null);
    } catch (err) {
      console.error('Failed to delete product:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-sage-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl shadow-sage-900/20 border border-sage-100 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-sage-100 flex items-center justify-between bg-sage-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-coral-500/10 flex items-center justify-center text-coral-500 shadow-inner">
              <Trash2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-sage-800 tracking-tight">Product Trash</h2>
              <p className="text-xs font-bold text-sage-400 uppercase tracking-widest">Restore deleted items to active inventory</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-sage-100 flex items-center justify-center text-sage-400 hover:text-sage-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-teal-600" size={40} />
              <p className="text-sage-400 font-bold uppercase text-[10px] tracking-widest">Searching deep sea archives...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="bg-sage-50/30 rounded-3xl border border-sage-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-sage-50/80 border-b border-sage-100">
                    <th className="px-6 py-4 text-[10px] font-black text-sage-400 uppercase tracking-widest">Product</th>
                    <th className="px-6 py-4 text-[10px] font-black text-sage-400 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-[10px] font-black text-sage-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-100">
                  {products.map((p) => (
                    <tr key={p.product_id} className="hover:bg-white transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-sage-100 p-1">
                            {p.image_path ? (
                              <img 
                                src={`/image.php?file=${p.image_path}`} 
                                alt={p.name} 
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sage-300 font-bold text-xs uppercase">
                                {p.name.substring(0, 2)}
                              </div>
                            )}
                          </div>
                          <span className="font-bold text-sage-700">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-black text-sage-400 uppercase tracking-widest">{p.category_name}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Tooltip text="Restore Product">
                            <button
                              onClick={() => setConfirmData({ type: 'restore', id: p.product_id, name: p.name })}
                              disabled={restoringId === p.product_id || deletingId === p.product_id}
                              className="p-2 text-sage-400 hover:text-emerald-500 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all"
                            >
                              {restoringId === p.product_id ? (
                                <Loader2 className="animate-spin" size={18} />
                              ) : (
                                <RotateCcw size={18} />
                              )}
                            </button>
                          </Tooltip>
                          <Tooltip text="Purge Forever">
                            <button
                              onClick={() => setConfirmData({ type: 'delete', id: p.product_id, name: p.name })}
                              disabled={restoringId === p.product_id || deletingId === p.product_id}
                              className="p-2 text-sage-400 hover:text-coral-500 hover:bg-coral-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all"
                            >
                              {deletingId === p.product_id ? (
                                <Loader2 className="animate-spin" size={18} />
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-sage-50 flex items-center justify-center text-sage-300">
                <Trash2 size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-sage-700 font-black">Archive is empty</p>
                <p className="text-sm text-sage-400 font-medium">No soft-deleted products found.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={!!confirmData}
        onClose={() => setConfirmData(null)}
        onConfirm={confirmData?.type === 'restore' ? handleRestore : handleDelete}
        title={confirmData?.type === 'restore' ? 'Restore Product' : 'Purge Product'}
        message={
          confirmData?.type === 'restore'
            ? `Are you sure you want to restore "${confirmData?.name}"? It will be moved back to the active inventory.`
            : `Are you sure you want to PERMANENTLY delete "${confirmData?.name}"? This action cannot be undone.`
        }
        confirmLabel={confirmData?.type === 'restore' ? 'Restore' : 'Purge Forever'}
        variant={confirmData?.type === 'restore' ? 'success' : 'danger'}
        loading={!!restoringId || !!deletingId}
      />
    </div>,
    document.body
  );
}
