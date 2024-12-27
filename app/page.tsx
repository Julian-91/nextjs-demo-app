'use client'
import { useState } from 'react';

export default function Home() {
  const [bgColor, setBgColor] = useState('');

  const changeBackground = (color: string) => {
    // Remove any existing color classes
    document.body.classList.remove('blue-bg', 'green-bg', 'red-bg');

    if (color) {
      document.body.classList.add(`${color}-bg`);
    }
    setBgColor(color);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-4">Background Color Changer</h1>

        <div className="flex gap-4">
          <button
            onClick={() => changeBackground('blue')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Change to Blue
          </button>

          <button
            onClick={() => changeBackground('green')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Change to Green
          </button>

          <button
            onClick={() => changeBackground('red')}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Change to Red
          </button>

          {bgColor && (
            <button
              onClick={() => changeBackground('')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Reset Color
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
