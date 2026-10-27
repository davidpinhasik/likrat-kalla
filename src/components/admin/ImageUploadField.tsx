'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('Image must be under 15MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

      // 1. Try Direct Client-side upload to Supabase Storage (fastest & handles large files)
      const supabase = createClient();
      if (supabase) {
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            contentType: file.type || 'image/jpeg',
            upsert: true,
          });

        if (!uploadError) {
          const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
          if (data?.publicUrl) {
            onChange(data.publicUrl);
            setUploading(false);
            return;
          }
        }
      }

      // 2. Fallback to Server Action if client-side upload didn't succeed
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadImage(formData, bucket);

      if (result.ok && result.data?.url) {
        onChange(result.data.url);
      } else {
        const msg = !result.ok && result.message ? result.message : 'Upload failed. You can paste a direct URL below.';
        setError(msg);
        setShowUrlInput(true);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setError('Upload failed. You can paste a direct URL below.');
      setShowUrlInput(true);
    } finally {
      setUploading(false);
    }
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
            id={`file-upload-${bucket}-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 hover:border-brand-gold transition-colors shadow-sm disabled:opacity-50"
          >
            {uploading ? (
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
            PNG, JPG, WebP up to 15MB (stored securely in Supabase)
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
