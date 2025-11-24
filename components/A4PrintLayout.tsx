import React from 'react';
import { PrintJobItem } from '../types';
import { Label } from './Label';
import { X, AlertCircle } from 'lucide-react';

interface A4PrintLayoutProps {
  queue: PrintJobItem[];
  onRemoveItem: (id: string) => void;
  // Note: printRef is no longer a single ref, but we rely on a class selector for export
}

export const A4PrintLayout: React.FC<A4PrintLayoutProps> = ({ queue, onRemoveItem }) => {
  
  const dominantSize = queue.length > 0 ? (queue[0].bean.labelSize || '105x74') : '105x74';
  const hasSizeMismatch = queue.some(item => (item.bean.labelSize || '105x74') !== dominantSize);

  // Flatten queue into individual label instances
  const labelsToRender = queue.flatMap(item => 
    Array(item.quantity).fill(null).map((_, idx) => ({
      uniqueId: `${item.id}-${idx}`,
      originalJobId: item.id,
      bean: item.bean,
      weight: item.weight,
      productionDate: item.productionDate
    }))
  );

  // Configure Grid
  let gridConfig;
  if (dominantSize === '60x85') {
    // 3 Cols x 3 Rows = 9 Max
    gridConfig = {
        cols: 3,
        rows: 3,
        itemsPerPage: 9,
        itemW: '60mm',
        itemH: '85mm',
        containerPadding: '21mm 15mm', 
        gridGap: '0mm'
    };
  } else {
    // 2 Cols x 4 Rows = 8 Max
    gridConfig = {
        cols: 2,
        rows: 4,
        itemsPerPage: 8,
        itemW: '105mm',
        itemH: '74.25mm',
        containerPadding: '0',
        gridGap: '0'
    };
  }

  // Chunk items into pages
  const pages = [];
  for (let i = 0; i < labelsToRender.length; i += gridConfig.itemsPerPage) {
      pages.push(labelsToRender.slice(i, i + gridConfig.itemsPerPage));
  }
  // If empty, show at least one blank page
  if (pages.length === 0) pages.push([]);

  return (
    <div className="flex flex-col h-full bg-gray-200 overflow-auto">
      {hasSizeMismatch && (
          <div className="bg-amber-100 text-amber-800 text-xs p-2 flex items-center justify-center gap-2 shrink-0">
              <AlertCircle size={14} />
              <span>注意：队列中包含不同尺寸的标签。系统将按照第一张标签的尺寸 ({dominantSize}) 强制排版。</span>
          </div>
      )}

      <div className="flex-1 flex flex-col items-center py-8 gap-8">
        
        {pages.map((pageItems, pageIndex) => (
            <div key={pageIndex} className="relative shadow-2xl">
                 {/* Page Number Indicator (Screen only) */}
                 <div className="absolute -left-10 top-0 text-gray-400 text-xs font-bold">
                    Page {pageIndex + 1}
                 </div>

                 {/* The A4 Page - This class 'print-page' is used by the PDF exporter */}
                 <div 
                    className="print-page bg-white relative" 
                    style={{ 
                        width: '210mm', 
                        height: '297mm',
                        display: 'grid',
                        gridTemplateColumns: `repeat(${gridConfig.cols}, ${gridConfig.itemW})`,
                        gridTemplateRows: `repeat(${gridConfig.rows}, ${gridConfig.itemH})`,
                        padding: gridConfig.containerPadding,
                        gap: gridConfig.gridGap,
                        alignContent: 'start',
                        justifyContent: 'center'
                    }}
                >
                    {pageItems.map((item, index) => (
                        <div key={index} className="relative group" style={{ width: gridConfig.itemW, height: gridConfig.itemH }}>
                            <Label 
                                bean={item.bean} 
                                showBorder={false} 
                                weightInGrams={item.weight}
                                productionDate={item.productionDate}
                            />
                            
                            {/* Remove Button Overlay */}
                            <button 
                                onClick={() => onRemoveItem(item.originalJobId)}
                                className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm z-50 hover:scale-110"
                                title="移除"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        ))}
        
      </div>
      
      <div className="p-4 bg-white border-t border-gray-200 flex justify-between items-center text-sm text-gray-600 shrink-0">
        <div className="flex items-center gap-4">
            <span>当前尺寸: <span className="font-bold text-coffee-700">{dominantSize}</span></span>
            <span>总标签: {labelsToRender.length} 个</span>
            <span>总页数: {pages.length} 页</span>
        </div>
      </div>
    </div>
  );
};
