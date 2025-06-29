// ABOUTME: Ultra-simple journal page - just dots, nothing else
// Guarantees visible dot grid

'use client';

export default function SimpleJournalPage() {
  return (
    <div 
      className="w-full h-screen"
      style={{
        backgroundColor: '#ffffff',
        backgroundImage: 'radial-gradient(circle, #999999 1px, transparent 1px)',
        backgroundSize: '19px 19px',
        backgroundPosition: '0 0',
      }}
    >
      {/* Minimal header */}
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
        <h1 className="text-lg font-semibold text-gray-800">Bullet Journal</h1>
        <p className="text-sm text-gray-600">Visible dot grid - 5mm spacing</p>
      </div>

      {/* Page indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded text-sm text-gray-600">
        Page 1
      </div>
    </div>
  );
}