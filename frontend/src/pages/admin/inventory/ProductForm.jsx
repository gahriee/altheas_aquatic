import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Save, AlertCircle, Loader2 } from 'lucide-react';
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
        <Link 
          to="/admin/inventory" 
          className="flex items-center gap-2 text-sage-400 hover:text-teal-600 transition font-bold group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Inventory
        </Link>
        <h1 className="text-2xl font-bold text-teal-600">
          {id ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-sage-100 p-8 space-y-8 transition-all duration-500">
        {error && (
          <div className="p-4 bg-coral-50 text-coral-500 rounded-2xl border border-coral-100 flex items-center gap-2 animate-in slide-in-from-top-2">
            <AlertCircle size={20} />
            <span className="font-bold text-sm">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Image Upload Dropzone */}
          <div className="space-y-4">
            <Label>Product Image</Label>
            <div 
              {...getRootProps()}
              className={`relative aspect-square rounded-[2rem] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group overflow-hidden ${
                isDragActive 
                  ? 'border-teal-500 bg-teal-50/50 scale-[1.02] shadow-xl shadow-teal-500/10' 
                  : 'border-sage-100 bg-sage-50/50 hover:border-mint-300 hover:bg-white'
              }`}
            >
              <input {...getInputProps()} />
              
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-teal-600/60 backdrop-blur-[2px] flex flex-col items-center justify-center transition-opacity duration-300 ${isDragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <Upload size={40} className="text-white animate-bounce" />
                    <span className="text-white font-black text-sm uppercase tracking-widest mt-2 px-4 py-2 bg-black/20 rounded-full">
                      {isDragActive ? 'Drop to Update' : 'Change Image'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 flex flex-col items-center gap-4">
                  <div className={`p-6 rounded-3xl transition-all duration-300 ${isDragActive ? 'bg-teal-100 text-teal-600 scale-110' : 'bg-white text-sage-200 shadow-sm border border-sage-50 group-hover:text-mint-300 group-hover:scale-110'}`}>
                    <Upload size={48} />
                  </div>
                  <div>
                    <p className={`text-sm font-black uppercase tracking-widest transition-colors ${isDragActive ? 'text-teal-600' : 'text-sage-400'}`}>
                      {isDragActive ? 'Drop it here!' : 'Drag & Drop Image'}
                    </p>
                    <p className="text-[10px] text-sage-300 uppercase font-black tracking-tighter mt-1 opacity-60">or click to browse local files</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Key Details */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="e.g. Java Fern Mini" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input 
                  id="price" 
                  name="price" 
                  type="number" 
                  step="0.01" 
                  value={formData.price} 
                  onChange={handleChange} 
                  placeholder="0.00" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Switch
                  id="is_active"
                  name="is_active"
                  variant="segmented"
                  offLabel="Inactive"
                  onLabel="Active"
                  checked={formData.is_active === '1'}
                  onChange={handleChange}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock_qty">Current Stock</Label>
                <Input 
                  id="stock_qty" 
                  name="stock_qty" 
                  type="number" 
                  value={formData.stock_qty} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="low_stock_threshold">Low Stock Alert</Label>
                <Input 
                  id="low_stock_threshold" 
                  name="low_stock_threshold" 
                  type="number" 
                  value={formData.low_stock_threshold} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the species, care requirements, etc."
            rows="6"
          ></Textarea>
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full py-4 text-lg"
            isLoading={submitting}
          >
            <div className="flex items-center justify-center gap-2">
              <Save size={24} />
              {id ? 'Update Product' : 'Create Product'}
            </div>
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
