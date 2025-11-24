import React from 'react';
import { PrintJobItem } from '../types';
import { Label } from './Label';
import { X } from 'lucide-react';

interface A4PrintLayoutProps {
  queue: PrintJobItem[];
  onRemoveItem: (id: string) => void;
  printRef: React.RefObject<HTMLDivElement | null>;
}

// A4 in mm: 210 x 297
// Label: 105 x 74.25
// Grid: 2 Cols, 4 Rows (Exactly fills A4)

export const A4PrintLayout: React.FC<A4PrintLayoutProps> = ({ queue, onRemoveItem, printRef }) => {
  
  // Flatten queue into individual label instances
  const labelsToRender = queue.flatMap(item => 
    Array(item.quantity).fill(item.bean).map((bean, idx) => ({
      uniqueId: `${item.id}-${idx}`,
      originalJobId: item.id,
      bean
    }))
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto bg-gray-200 p-8 flex justify-center items-start shadow-inner">
        
        {/* The visual wrapper for the A4 sheet on screen */}
        <div className="relative bg-white shadow-2xl" style={{ width: '210mm', minHeight: '297mm' }}>
            
            {/* Overlay Grid for UI management (Delete buttons) */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-4 z-50 pointer-events-none">
                {labelsToRender.map((item, index) => (
                    index < 8 && (
                        <div key={`overlay-${index}`} className="relative border border-dashed border-gray-300 pointer-events-auto group">
                             <button 
                                onClick={() => onRemoveItem(item.originalJobId)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-50 hover:scale-110"
                                title="从队列移除"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )
                ))}
            </div>

            {/* The Actual Printable Content */}
            <div ref={printRef} id="print-area" className="w-full h-full bg-white grid grid-cols-2 content-start">
                 {labelsToRender.slice(0, 8).map((item, index) => (
                    <div key={index} className="w-[105mm] h-[74.25mm] overflow-hidden">
                        <Label bean={item.bean} showBorder={false} />
                    </div>
                 ))}
                 {/* Fill empty spots to maintain grid if needed, though grid-cols-2 handles it */}
            </div>
        </div>
      </div>
      
      <div className="p-4 bg-white border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
        <span>当前容量: {Math.min(labelsToRender.length, 8)} / 8 标签</span>
        {labelsToRender.length > 8 && <span className="text-amber-600 font-bold">注意: 仅前8张会被打印。请清空队列以打印剩余。</span>}
      </div>
    </div>
  );
};