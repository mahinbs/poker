import React from 'react';

export default function BrandingHeader({ title, subtitle }) {
  const logoSrc = "/branding/logo.png";
  const [logoError, setLogoError] = React.useState(false);

  return (
    <header className="bg-gradient-to-r from-emerald-600 via-green-500 to-yellow-400 p-6 rounded-xl shadow-md flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center overflow-hidden border border-white/30">
          {!logoError ? (
            <img
              src={logoSrc}
              alt="Brand Logo"
              className="w-full h-full object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="text-white font-bold">WL</div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-gray-200 mt-1">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}


