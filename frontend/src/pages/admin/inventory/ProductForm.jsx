import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Save, AlertCircle, Loader2, Package, Hash, StickyNote } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { getAllCategories } from '../../../api/categories';
import { getProductById, createProduct, updateProduct } from '../../../api/products';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import Select from '../../../components/ui/Select';
import Textarea from '../../../components/ui/Textarea';
import Switch from '../../../components/ui/Switch';
import ImageCropperModal from '../../../components/shared/ImageCropperModal';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    price: '',
    stock_qty: '0',
    low_stock_threshold: '5',
    is_active: '1'
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageToCrop, setImageToCrop] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  async function fetchInitialData() {
    try {
      setLoading(true);
      const cats = await getAllCategories();
      setCategories(cats);

      if (id) {
        const product = await getProductById(id);
        setFormData({
          name: product.name,
          category_id: product.category_id,
          description: product.description || '',
          price: product.price,
          stock_qty: product.stock_qty,
          low_stock_threshold: product.low_stock_threshold,
          is_active: product.is_active.toString()
        });
        if (product.image_path) {
          setImagePreview(`/image.php?file=${product.image_path}`);
        }
      }
    } catch (err) {
      setError('Failed to load product data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleCropSave = (croppedBlob) => {
    // Create preview
    const croppedUrl = URL.createObjectURL(croppedBlob);
    setImagePreview(croppedUrl);
    
    // Convert blob to file for submission
    const file = new File([croppedBlob], 'product-image.jpg', { type: 'image/jpeg' });
    setSelectedFile(file);
    
    // Close cropper
    setImageToCrop(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (!formData.category_id) {
      setError('Please select a category');
      setSubmitting(false);
      return;
    }

    if (!id && !selectedFile) {
      setError('Please upload a product image');
      setSubmitting(false);
      return;
    }

    const submissionData = new FormData();
    Object.keys(formData).forEach(key => {
      submissionData.append(key, formData[key]);
    });
    if (selectedFile) {
      submissionData.append('image', selectedFile);
    }

    try {
      if (id) {
        await updateProduct(id, submissionData);
      } else {
        await createProduct(submissionData);
      }
      navigate('/admin/inventory');
    } catch (err) {
      setError(err.message || 'Failed to save product');
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="animate-spin text-teal-600" size={40} />
      <p className="text-sage-400 font-medium tracking-tight">Loading product specifications...</p>
    </div>
  );

  const categoryOptions = categories.map(cat => ({
    value: cat.category_id,
    label: cat.name
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin/inventory" 
            className="p-3 bg-white border border-sage-100 rounded-2xl text-sage-400 hover:text-teal-600 hover:border-teal-100 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-sage-800 tracking-tight">
              {id ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-sm text-sage-400 font-medium">
              {id ? 'Update aquatic species specifications' : 'Register a new addition to the catalog'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[32px] border border-sage-100 shadow-xl shadow-teal-500/5 overflow-hidden">
        <div className="p-8 md:p-12 space-y-12">
          {error && (
            <div className="p-4 bg-coral-50 text-coral-500 rounded-2xl border border-coral-100 flex items-center gap-2 animate-in slide-in-from-top-2">
              <AlertCircle size={20} />
              <span className="font-bold text-sm tracking-tight">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column: Visuals */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-teal-600">
                <Upload size={18} />
                <h3 className="font-bold uppercase text-[10px] tracking-widest">Product Visuals</h3>
              </div>
              
              <div 
                {...getRootProps()}
                className={`relative aspect-square rounded-[2.5rem] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group overflow-hidden ${
                  isDragActive 
                    ? 'border-teal-500 bg-teal-50/50 scale-[1.02] shadow-xl shadow-teal-500/10' 
                    : 'border-sage-100 bg-sage-50/50 hover:border-teal-300 hover:bg-white'
                }`}
              >
                <input {...getInputProps()} />
                
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 bg-teal-600/60 backdrop-blur-[2px] flex flex-col items-center justify-center transition-opacity duration-300 ${isDragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <Upload size={40} className="text-white animate-bounce" />
                      <span className="text-white font-black text-xs uppercase tracking-widest mt-2 px-6 py-2 bg-black/20 rounded-full">
                        {isDragActive ? 'Drop to Update' : 'Change Image'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 flex flex-col items-center gap-6">
                    <div className={`p-8 rounded-[2rem] transition-all duration-300 ${isDragActive ? 'bg-teal-100 text-teal-600 scale-110' : 'bg-white text-sage-200 shadow-sm border border-sage-50 group-hover:text-teal-300 group-hover:scale-110'}`}>
                      <Upload size={48} />
                    </div>
                    <div>
                      <p className={`text-sm font-black uppercase tracking-widest transition-colors ${isDragActive ? 'text-teal-600' : 'text-sage-400'}`}>
                        {isDragActive ? 'Drop it here!' : 'Drag & Drop Image'}
                      </p>
                      <p className="text-[10px] text-sage-300 uppercase font-black tracking-widest mt-2 opacity-60">or click to browse local files</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Right Column: Key Specifications */}
            <div className="space-y-12">
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-teal-600">
                  <Package size={18} />
                  <h3 className="font-bold uppercase text-[10px] tracking-widest">Key Specifications</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" required>Product Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      placeholder="e.g. Java Fern Mini" 
                      required 
                      className="bg-sage-50/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category_id" required>Category</Label>
                    <Select
                      id="category_id"
                      name="category_id"
                      options={categoryOptions}
                      value={formData.category_id}
                      onChange={handleChange}
                      placeholder="Select category"
                      required={true}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="price" required>Price (₱)</Label>
                      <Input 
                        id="price" 
                        name="price" 
                        type="number" 
                        step="0.01" 
                        value={formData.price} 
                        onChange={handleChange} 
                        placeholder="0.00" 
                        required 
                        className="bg-sage-50/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Online Status</Label>
                      <Switch
                        id="is_active"
                        name="is_active"
                        variant="segmented"
                        offLabel="Hidden"
                        onLabel="Visible"
                        checked={formData.is_active === '1'}
                        onChange={handleChange}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-2 text-teal-600">
                  <Hash size={18} />
                  <h3 className="font-bold uppercase text-[10px] tracking-widest">Inventory Settings</h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="stock_qty" required>Current Stock</Label>
                    <Input 
                      id="stock_qty" 
                      name="stock_qty" 
                      type="number" 
                      value={formData.stock_qty} 
                      onChange={handleChange} 
                      required 
                      className="bg-sage-50/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="low_stock_threshold" required>Low Stock Alert</Label>
                    <Input 
                      id="low_stock_threshold" 
                      name="low_stock_threshold" 
                      type="number" 
                      value={formData.low_stock_threshold} 
                      onChange={handleChange} 
                      required 
                      className="bg-sage-50/50"
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>

          <section className="space-y-6">
            <div className="flex items-center gap-2 text-teal-600">
              <StickyNote size={18} />
              <h3 className="font-bold uppercase text-[10px] tracking-widest">Detailed Description</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Species Overview & Care</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe biological traits, maintenance level, water parameter requirements, etc."
                rows="5"
                className="bg-sage-50/50"
              />
            </div>
          </section>
        </div>

        <div className="px-8 md:px-12 py-8 bg-sage-50/50 border-t border-sage-100 flex items-center justify-end">
          <Button 
            type="submit" 
            variant="primary" 
            disabled={submitting}
            className="flex items-center gap-2 py-4 px-10 shadow-lg shadow-teal-500/20 min-w-[200px]"
          >
            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {id ? 'Update Product' : 'Register Product'}
          </Button>
        </div>
      </form>

      {imageToCrop && (
        <ImageCropperModal
          image={imageToCrop}
          onSave={handleCropSave}
          onCancel={() => setImageToCrop(null)}
        />
      )}
    </div>
  );
}
