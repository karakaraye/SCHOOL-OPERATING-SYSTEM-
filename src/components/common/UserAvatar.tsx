import React, { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';

interface UserAvatarProps {
  name?: string;
  avatar?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'rounded';
  className?: string;
  editable?: boolean;
  onUpload?: (dataUrl: string) => void;
  onRemove?: () => void;
  alt?: string;
}

const COLOR_GRADIENTS = [
  'from-blue-600 to-indigo-700 text-white',
  'from-emerald-600 to-teal-700 text-white',
  'from-violet-600 to-purple-700 text-white',
  'from-amber-500 to-orange-600 text-white',
  'from-rose-500 to-pink-600 text-white',
  'from-cyan-600 to-blue-700 text-white',
  'from-slate-700 to-slate-900 text-white',
];

function getGradientForName(name: string = ''): string {
  if (!name) return COLOR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_GRADIENTS.length;
  return COLOR_GRADIENTS[index];
}

function getInitials(name: string = ''): string {
  if (!name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-xs font-bold',
  lg: 'w-12 h-12 text-sm font-bold',
  xl: 'w-14 h-14 text-base font-extrabold',
  '2xl': 'w-20 h-20 text-xl font-black',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = '',
  avatar,
  size = 'md',
  shape = 'circle',
  className = '',
  editable = false,
  onUpload,
  onRemove,
  alt,
}) => {
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = getInitials(name);
  const gradient = getGradientForName(name);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';

  const hasValidAvatar = avatar && avatar.trim().length > 0 && !imgError;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read as Base64 Data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result && onUpload) {
        setImgError(false);
        onUpload(result);
      }
    };
    reader.readAsDataURL(file);

    // Reset input value so same file can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative inline-block flex-shrink-0 group ${className}`}>
      <div
        className={`${sizeClass} ${shapeClass} flex items-center justify-center overflow-hidden border border-slate-200/80 shadow-2xs transition-transform duration-200 ${
          hasValidAvatar ? 'bg-slate-100' : `bg-gradient-to-tr ${gradient}`
        }`}
      >
        {hasValidAvatar ? (
          <img
            src={avatar}
            alt={alt || name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <span className="font-heading uppercase tracking-wider select-none">
            {initials}
          </span>
        )}
      </div>

      {/* Optional upload trigger button overlay */}
      {editable && onUpload && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div className="absolute -bottom-1 -right-1 flex items-center gap-1 z-10">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload photo from laptop"
              className="w-6 h-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md border-2 border-white transition-all hover:scale-110"
            >
              <Camera size={12} />
            </button>
            {hasValidAvatar && onRemove && (
              <button
                type="button"
                onClick={onRemove}
                title="Remove photo"
                className="w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md border-2 border-white transition-all hover:scale-110"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserAvatar;
