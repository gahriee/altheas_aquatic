import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';
import Button from '../ui/Button';
import getCroppedImg from '../../utils/imageCrop';

export default function ImageCropperModal({ image, onSave, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onSave(croppedImage);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-teal-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-teal-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-sage-50 bg-sage-50/30">
          <div>
            <h2 className="text-xl font-black text-teal-600 tracking-tight leading-none">Crop Product Image</h2>
            <p className="text-[10px] text-sage-400 font-bold uppercase tracking-widest mt-1">Locked to 1:1 Aspect Ratio</p>
          </div>
          <button 
            onClick={onCancel}
            className="p-3 rounded-2xl hover:bg-coral-50 text-sage-300 hover:text-coral-500 transition-all duration-300 group"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative flex-1 min-h-[400px] bg-slate-900">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            classes={{
              containerClassName: 'bg-slate-900',
              mediaClassName: 'object-contain',
              cropAreaClassName: 'border-2 border-mint-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] rounded-lg'
            }}
          />
        </div>

        {/* Controls */}
        <div className="px-8 py-8 space-y-6 bg-white">
          <div className="flex items-center gap-6">
            <ZoomOut size={20} className="text-sage-300" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-sage-100 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-600 transition-all"
            />
            <ZoomIn size={20} className="text-sage-300" />
          </div>

          <div className="flex gap-4">
            <Button 
              variant="secondary" 
              className="flex-1 py-4 rounded-2xl border-2" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              className="flex-[2] py-4 rounded-2xl shadow-lg shadow-teal-500/20" 
              onClick={handleSave}
              isLoading={loading}
            >
              <div className="flex items-center justify-center gap-3">
                <Check size={24} />
                <span className="font-bold text-lg">Save Crop</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
