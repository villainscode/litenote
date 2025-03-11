'use client';

import React from 'react';

export default function Header() {
  return (
    <header className="h-18 bg-[#3c3f41] text-white flex items-center justify-between px-4 w-full">
      <div className="flex items-center space-x-4">
        <button className="hover:bg-gray-700 p-2 rounded flex items-center">
          <span className="material-symbols-outlined">fullscreen</span>
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <button className="hover:bg-gray-700 p-2 rounded flex items-center">
          <span className="material-symbols-outlined">note_add</span>
        </button>
        <button className="hover:bg-gray-700 p-2 rounded flex items-center">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  );
} 