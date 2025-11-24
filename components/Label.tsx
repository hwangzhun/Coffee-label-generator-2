import React from 'react';
import { CoffeeBean } from '../types';

interface LabelProps {
  bean: CoffeeBean;
  scale?: number;
  showBorder?: boolean;
}

// 105mm x 74.25mm
// To display on screen, we use a standard pixel conversion (approx 3.78px per mm)
// Width: ~397px, Height: ~281px
const LABEL_WIDTH_MM = 105;
const LABEL_HEIGHT_MM = 74.25;

export const Label: React.FC<LabelProps> = ({ bean, scale = 1, showBorder = true }) => {
  const containerStyle: React.CSSProperties = {
    width: `${LABEL_WIDTH_MM}mm`,
    height: `${LABEL_HEIGHT_MM}mm`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    position: 'relative',
    overflow: 'hidden',
  };

  const defaultBg = "https://picsum.photos/id/113/600/400?grayscale"; // Nice blurry coffee background style

  return (
    <div 
      style={containerStyle} 
      className={`bg-white text-slate-800 flex flex-col ${showBorder ? 'border border-gray-200 shadow-sm' : ''}`}
    >
        {/* Background Layer */}
        <div className="absolute inset-0 z-0 opacity-20">
             <img 
                src={bean.backgroundImageUrl || defaultBg} 
                alt="bg" 
                className="w-full h-full object-cover" 
            />
        </div>

        {/* Border / Safe Zone Decoration */}
        <div className="absolute inset-2 border-2 border-coffee-800 z-10 pointer-events-none opacity-80" />

        {/* Content Layer */}
        <div className="relative z-20 flex flex-col h-full p-6 justify-between">
            
            {/* Header */}
            <div className="text-center border-b border-coffee-300 pb-2">
                <h1 className="font-serif font-bold text-2xl text-coffee-900 leading-tight">
                    {bean.name || "咖啡豆名称"}
                </h1>
                <p className="font-sans text-xs uppercase tracking-widest text-coffee-700 mt-1">
                    {bean.origin || "产地"}
                </p>
            </div>

            {/* Middle Specs */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-sans text-coffee-900">
                <div>
                    <span className="font-bold block text-coffee-600">处理法 (PROCESS)</span>
                    {bean.process || "水洗处理"}
                </div>
                <div>
                    <span className="font-bold block text-coffee-600">烘焙度 (ROAST)</span>
                    {bean.roastLevel}
                </div>
                <div>
                    <span className="font-bold block text-coffee-600">海拔 (ALTITUDE)</span>
                    {bean.altitude || "1200 - 1500m"}
                </div>
                <div>
                    <span className="font-bold block text-coffee-600">净含量 (NET WT)</span>
                    200g
                </div>
            </div>

            {/* Flavor Notes & Desc */}
            <div className="text-center">
                 <p className="font-serif italic text-sm text-coffee-800 mb-1 leading-relaxed">
                    {bean.flavorNotes || "风味描述区域：花香，柑橘，巧克力..."}
                 </p>
            </div>
        </div>
    </div>
  );
};