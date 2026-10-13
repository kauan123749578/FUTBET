import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const PasswordInput: React.FC<PasswordInputProps> = ({ className = '', ...props }) => {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visivel ? 'text' : 'password'}
        className={`w-full pr-10 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisivel(v => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-300 rounded-md"
        tabIndex={-1}
        aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {visivel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};
