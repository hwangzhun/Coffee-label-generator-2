import React from 'react';
import { CoffeeBean } from '../types';
import { Droplets, Coffee } from 'lucide-react';

interface LabelProps {
  bean: CoffeeBean;
  scale?: number;
  showBorder?: boolean;
}

// Dimensions in mm
const SIZES = {
  '105x74': { w: 105, h: 74.25 },
  '60x85': { w: 60, h: 85 },
};

export const Label: React.FC<LabelProps> = ({ bean, scale = 1, showBorder = true }) => {
  const sizeKey = bean.labelSize || '105x74';
  const { w, h } = SIZES[sizeKey];

  const containerStyle: React.CSSProperties = {
    width: `${w}mm`,
    height: `${h}mm`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'white'
  };

  // Metric Bar Component (1-5)
  const MetricBar = ({ value, label }: { value: number, label: string }) => (
    <div className="flex items-center gap-1 text-[8px] w-full">
        <span className="w-6 text-right font-bold text-coffee-700 opacity-70">{label}</span>
        <div className="flex-1 flex gap-0.5 h-1.5">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`flex-1 rounded-sm ${i <= value ? 'bg-coffee-600' : 'bg-gray-200'}`} />
            ))}
        </div>
    </div>
  );

  // Placeholder Flag (Circle)
  const FlagPlaceholder = () => (
    <div className="w-5 h-5 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
         {/* Placeholder for server flag image */}
         {bean.country ? (
            // In the future, this src will be dynamic based on bean.country
            // <img src={`/flags/${bean.country}.png`} alt={bean.country} className="w-full h-full object-cover" />
            <span className="text-[6px] text-gray-500 font-bold">{bean.country.slice(0,2)}</span>
         ) : (
            <div className="bg-gray-100 w-full h-full" />
         )}
    </div>
  );

  const Divider = () => (
      bean.showDivider ? <div className="w-full border-t border-coffee-200 my-1 opacity-60"></div> : <div className="my-1"></div>
  );

  const renderContent = () => {
    if (sizeKey === '60x85') {
      // PORTRAIT LAYOUT (60mm x 85mm)
      return (
        <div className="flex flex-col h-full p-4 text-center text-coffee-900">
           
           {/* Header */}
           <div className="mb-2 flex flex-col items-center">
              <FlagPlaceholder />
              <div className="mt-2 leading-tight">
                  <span className="font-sans font-light text-lg block">{bean.nameLight || "庄园名称"}</span>
                  <span className="font-serif font-bold text-xl block">{bean.nameBold || "豆种名称"}</span>
              </div>
           </div>

           <Divider />

           {/* Specs */}
           <div className="flex flex-col gap-1.5 text-[9px] font-sans items-center justify-center flex-1 py-1">
              <div className="flex flex-col items-center">
                 <span className="font-bold text-coffee-500 scale-90 mb-0.5">产地 ORIGIN</span>
                 <span className="font-medium">{bean.origin || "-"}</span>
              </div>
              
              <div className="flex flex-col items-center">
                 <span className="font-bold text-coffee-500 scale-90 mb-0.5">处理 PROCESS</span>
                 <span className="font-medium">{bean.process || "-"}</span>
              </div>

              <div className="flex flex-col items-center">
                 <span className="font-bold text-coffee-500 scale-90 mb-0.5">烘焙 ROAST</span>
                 <span className="font-medium">{bean.roastLevel}</span>
              </div>
           </div>

           <Divider />

           {/* Flavor */}
           <div className="pt-1">
              <p className="font-medium text-xs text-coffee-800 leading-tight mb-0.5">
                {bean.flavorCN || "风味描述"}
              </p>
              <p className="font-serif italic text-[9px] text-coffee-500 leading-tight">
                {bean.flavorEN || "Flavor Description"}
              </p>
              <div className="mt-3 text-[8px] font-bold tracking-[0.2em] text-coffee-400">
                NET WT. 200g
              </div>
           </div>
        </div>
      );
    }

    // LANDSCAPE LAYOUT (105mm x 74.25mm)
    return (
      <div className="flex h-full p-5 text-coffee-900 relative">
        
        {/* Category Icon (Top Right) */}
        <div className="absolute top-4 right-4 text-coffee-200">
             {bean.category === 'espresso' ? <Coffee size={24} /> : <Droplets size={24} />}
        </div>

        {/* Left Column: Info */}
        <div className="flex-1 flex flex-col justify-between pr-4 border-r border-coffee-100">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <FlagPlaceholder />
                    <span className="text-[10px] font-bold tracking-widest uppercase text-coffee-400">{bean.country || "COUNTRY"}</span>
                </div>
                <div className="leading-tight mb-3">
                    <span className="font-sans font-light text-xl block text-coffee-800">{bean.nameLight || "庄园名称"}</span>
                    <span className="font-serif font-bold text-2xl block text-coffee-900">{bean.nameBold || "豆种名称"}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-[9px] text-coffee-700">
                    <div>
                        <span className="block font-bold text-coffee-400 scale-90 origin-left">产地 ORIGIN</span>
                        <span className="block truncate">{bean.origin}</span>
                    </div>
                    <div>
                        <span className="block font-bold text-coffee-400 scale-90 origin-left">海拔 ALTITUDE</span>
                        <span className="block truncate">{bean.altitude}</span>
                    </div>
                    <div>
                        <span className="block font-bold text-coffee-400 scale-90 origin-left">处理 PROCESS</span>
                        <span className="block truncate">{bean.process}</span>
                    </div>
                    <div>
                        <span className="block font-bold text-coffee-400 scale-90 origin-left">烘焙 ROAST</span>
                        <span className="block truncate">{bean.roastLevel}</span>
                    </div>
                </div>
            </div>
            
            <div className="text-[8px] font-bold tracking-[0.2em] text-coffee-400 mt-2">
                NET WEIGHT 200g
            </div>
        </div>

        {/* Right Column: Flavor & Metrics */}
        <div className="w-[35%] pl-4 flex flex-col justify-center">
            <div className="mb-6 text-center">
                <p className="font-medium text-sm text-coffee-800 leading-snug mb-1">
                    {bean.flavorCN || "中文风味"}
                </p>
                <p className="font-serif italic text-[10px] text-coffee-500 leading-snug">
                    {bean.flavorEN || "English Flavor"}
                </p>
            </div>

            {bean.showDivider && <div className="border-t border-coffee-100 w-full mb-4"></div>}

            <div className="space-y-2 px-1">
                <MetricBar value={bean.acidity || 3} label="ACID" />
                <MetricBar value={bean.bitterness || 3} label="BODY" />
            </div>
            
            <div className="mt-4 text-center">
                 <span className="text-[9px] font-bold text-coffee-400 border border-coffee-200 px-2 py-0.5 rounded-full uppercase">
                    {bean.category === 'espresso' ? 'Espresso Roast' : 'Filter Roast'}
                 </span>
            </div>
        </div>

      </div>
    );
  };

  return (
    <div 
      style={containerStyle} 
      className={`bg-white flex flex-col ${showBorder ? 'border border-gray-200 shadow-sm' : ''} transition-all`}
    >
        {renderContent()}
    </div>
  );
};
