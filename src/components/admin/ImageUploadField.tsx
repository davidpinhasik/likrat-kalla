'use client';

import { useState, useRef, useTransition } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '@/app/actions/admin';

type Props = {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  bucket?: 'catalog' | 'gallery';
};

export default function ImageUploadField({
  label = 'Image',
  value,
  onChange,
  bucket = 'catalog',
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB');
      return;
    }

    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    startTransition(async () => {
      const result = await uploadImage(formData, bucket);
      if (result.ok && result.data?.url) {
        onChange(result.data.url);
      } else {
        const errorMsg = !result.ok && result.message ? result.message : 'Failed to upload image. You can paste a direct URL below.';
        setError(errorMsg);
        setShowUrlInput(true);
      }
    });
  }

  function handleClear() {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-gray-700">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-brand-gold-dark hover:underline"
        >
          {showUrlInput ? 'Hide URL input' : 'Paste direct URL instead'}
        </button>
      </div>

      {/* Preview & Upload Box */}
      <div className="flex items-center gap-4 p-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
        {value ? (
          <div className="relative w-20 h-20 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => setError('Image failed to load from URL')}
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
              title="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center text-gray-400 flex-shrink-0">
            <ImageIcon className="w-6 h-6" />
            <span className="text-[10px] mt-1">No image</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
            id={`file-upload-${bucket}`}
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 hover:border-brand-gold transition-colors shadow-sm disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-brand-navy" />
                Upload from Computer
              </>
            )}
          </button>
          <p className="text-[11px] text-gray-400 mt-1">
            PNG, JPG, WebP up to 10MB (stored securely in Supabase)
          </p>
        </div>
      </div>

      {/* Direct URL text field (if toggled or fallback) */}
      {showUrlInput && (
        <div>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold"
          />
        </div>
      )}

      {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}
    </div>
  );
}
