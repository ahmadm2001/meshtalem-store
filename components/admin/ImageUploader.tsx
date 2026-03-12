'use client';
import { useState, useRef, useCallback, DragEvent } from 'react';
import { Upload, X, Link, Image as ImageIcon, Plus, Loader2, AlertCircle } from 'lucide-react';
import { uploadsApi } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImageUploaderProps {
  /** Current list of image URLs */
  images: string[];
  /** Called whenever the list changes */
  onChange: (images: string[]) => void;
  /** Max number of images allowed (default: 10) */
  maxImages?: number;
  /** Label shown above the uploader */
  label?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_SIZE_MB = 10;

function isValidImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:' || url.startsWith('data:image/');
  } catch {
    return false;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageUploader({
  images,
  onChange,
  maxImages = 10,
  label = 'תמונות',
}: ImageUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState<string[]>([]); // track uploading file names
  const [errors, setErrors] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Upload logic ─────────────────────────────────────────────────────────────

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrors((e) => [...e, `"${file.name}" — סוג קובץ לא נתמך (JPEG/PNG/WebP בלבד)`]);
      return null;
    }
    // Validate size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrors((e) => [...e, `"${file.name}" — קובץ גדול מדי (מקסימום ${MAX_SIZE_MB}MB)`]);
      return null;
    }

    setUploading((u) => [...u, file.name]);
    try {
      const url = await uploadsApi.uploadImage(file);
      return url;
    } catch (err: any) {
      // Fallback: read as local data URL (works offline / without backend)
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => {
          setErrors((e) => [...e, `"${file.name}" — שגיאה בהעלאה`]);
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    } finally {
      setUploading((u) => u.filter((n) => n !== file.name));
    }
  }, []);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setErrors([]);
    const fileArray = Array.from(files);
    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      setErrors([`הגעת למקסימום ${maxImages} תמונות`]);
      return;
    }
    const toUpload = fileArray.slice(0, remaining);
    const results = await Promise.all(toUpload.map(uploadFile));
    const newUrls = results.filter((url): url is string => url !== null);
    if (newUrls.length > 0) {
      onChange([...images, ...newUrls]);
    }
  }, [images, maxImages, onChange, uploadFile]);

  // ── Drag & Drop ──────────────────────────────────────────────────────────────

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const onDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFiles(files);
    }
  };

  // ── URL input ────────────────────────────────────────────────────────────────

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (!isValidImageUrl(url)) {
      setErrors(['כתובת URL לא תקינה']);
      return;
    }
    if (images.includes(url)) {
      setErrors(['תמונה זו כבר קיימת ברשימה']);
      return;
    }
    if (images.length >= maxImages) {
      setErrors([`הגעת למקסימום ${maxImages} תמונות`]);
      return;
    }
    onChange([...images, url]);
    setUrlInput('');
    setShowUrlInput(false);
    setErrors([]);
  };

  // ── Remove ───────────────────────────────────────────────────────────────────

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  const moveImage = (idx: number, dir: 'left' | 'right') => {
    const updated = [...images];
    const target = dir === 'left' ? idx - 1 : idx + 1;
    if (target < 0 || target >= updated.length) return;
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    onChange(updated);
  };

  const isUploading = uploading.length > 0;
  const canAddMore = images.length < maxImages;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3" dir="rtl">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          <span className="text-gray-400 font-normal text-xs mr-2">
            ({images.length}/{maxImages})
          </span>
        </label>
      )}

      {/* ── Thumbnail grid ── */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((url, idx) => (
            <div key={idx} className="relative group">
              <div className={`w-24 h-24 rounded-xl overflow-hidden border-2 ${idx === 0 ? 'border-blue-400' : 'border-gray-200'} bg-gray-100`}>
                <img
                  src={url}
                  alt={`תמונה ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="%23f3f4f6"/><text x="48" y="52" text-anchor="middle" font-size="12" fill="%239ca3af">שגיאה</text></svg>';
                  }}
                />
                {/* First image badge */}
                {idx === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-blue-500/80 text-white text-xs text-center py-0.5">
                    ראשית
                  </div>
                )}
              </div>

              {/* Hover controls */}
              <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {idx > 0 && (
                  <button type="button" onClick={() => moveImage(idx, 'left')}
                    className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white text-xs font-bold">
                    ›
                  </button>
                )}
                <button type="button" onClick={() => removeImage(idx)}
                  className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600">
                  <X className="w-3.5 h-3.5" />
                </button>
                {idx < images.length - 1 && (
                  <button type="button" onClick={() => moveImage(idx, 'right')}
                    className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white text-xs font-bold">
                    ‹
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add more slot */}
          {canAddMore && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span className="text-xs">הוסף</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* ── Drop zone (shown when no images or as secondary) ── */}
      {images.length === 0 && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragging
              ? 'border-blue-500 bg-blue-50 scale-[1.01]'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          } ${isUploading ? 'pointer-events-none opacity-70' : ''}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-blue-600 font-medium">מעלה תמונות...</p>
              <p className="text-xs text-gray-400">{uploading.join(', ')}</p>
            </div>
          ) : (
            <>
              <Upload className={`w-10 h-10 mx-auto mb-3 ${dragging ? 'text-blue-500' : 'text-gray-300'}`} />
              <p className="text-sm font-semibold text-gray-600 mb-1">
                {dragging ? 'שחרר כאן להעלאה' : 'גרור תמונות לכאן'}
              </p>
              <p className="text-xs text-gray-400 mb-3">
                או לחץ לבחירת קבצים מהמכשיר
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>JPEG, PNG, WebP עד {MAX_SIZE_MB}MB</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Action buttons (when images exist) ── */}
      {images.length > 0 && canAddMore && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-xl p-4 transition-all ${
            dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isUploading ? 'מעלה...' : 'העלה תמונות'}
            </button>

            <button
              type="button"
              onClick={() => { setShowUrlInput((s) => !s); setErrors([]); }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Link className="w-4 h-4" />
              הוסף לפי URL
            </button>

            <p className="text-xs text-gray-400 mr-auto">
              {dragging ? '📎 שחרר כאן' : 'או גרור תמונות לכאן'}
            </p>
          </div>
        </div>
      )}

      {/* ── URL input ── */}
      {showUrlInput && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addUrl()}
            placeholder="https://example.com/door-image.jpg"
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono"
            dir="ltr"
            autoFocus
          />
          <button type="button" onClick={addUrl}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            הוסף
          </button>
          <button type="button" onClick={() => { setShowUrlInput(false); setUrlInput(''); }}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Errors ── */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {err}
            </div>
          ))}
        </div>
      )}

      {/* ── Upload progress indicator ── */}
      {isUploading && images.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          מעלה {uploading.length} תמונות...
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = ''; // reset so same file can be re-selected
          }
        }}
      />
    </div>
  );
}
