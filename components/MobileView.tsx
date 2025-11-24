import React, { useState, useEffect, useRef } from 'react';
import { CoffeeBean, PrintJobItem } from '../types';
import { A4PrintLayout } from './A4PrintLayout';
import { Label } from './Label';
import { Printer, Download, Plus, ShoppingBag, X } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Helper for ID generation
const uid = () => Math.random().toString(36).substr(2, 9);

export const MobileView: React.FC = () => {
  const [savedTemplates, setSavedTemplates] = useState<CoffeeBean[]>([]);
  const [printQueue, setPrintQueue] = useState<PrintJobItem[]>([]);
  const [activeTab, setActiveTab] = useState<'select' | 'queue'>('select');
  const [selectedForAdd, setSelectedForAdd] = useState<CoffeeBean | null>(null);
  const [addQty, setAddQty] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('beanTemplates');
    if (saved) {
      setSavedTemplates(JSON.parse(saved));
    }
  }, []);

  const handleAddToQueue = () => {
    if (!selectedForAdd) return;
    
    const currentCount = printQueue.reduce((acc, item) => acc + item.quantity, 0);
    if (currentCount + addQty > 8) {
      alert("A4纸最多8个标签。超出限制。");
      return;
    }

    setPrintQueue([...printQueue, { 
        id: uid(), 
        bean: selectedForAdd, 
        quantity: addQty 
    }]);
    
    setSelectedForAdd(null);
    setAddQty(1);
    setActiveTab('queue');
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    // Give UI a moment to update
    await new Promise(r => setTimeout(r, 100));

    try {
      // Temporarily make the print area visible but offscreen if needed, 
      // but since it's absolute positioned far away, it should be renderable.
      const canvas = await html2canvas(printRef.current, {
        scale: 2, // Slightly lower scale for mobile performance
        useCORS: true,
        windowWidth: 210 * 3.78 + 100, // Ensure window thinks it's wide enough
        windowHeight: 297 * 3.78 + 100
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save('coffee-labels-mobile.pdf');
    } catch (err) {
      console.error(err);
      alert("PDF生成失败");
    } finally {
      setIsExporting(false);
    }
  };

  const totalLabels = printQueue.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 text-slate-800 font-sans">
      
      {/* Mobile Header */}
      <header className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-30">
        <div>
            <h1 className="font-serif font-black text-xl text-coffee-800">Label<span className="text-coffee-500">Pro</span> 移动版</h1>
        </div>
        <div className="flex gap-4 text-sm font-medium">
            <button 
                onClick={() => setActiveTab('select')}
                className={`pb-1 ${activeTab === 'select' ? 'text-coffee-600 border-b-2 border-coffee-600' : 'text-gray-400'}`}
            >
                选择
            </button>
            <button 
                onClick={() => setActiveTab('queue')}
                className={`pb-1 relative ${activeTab === 'queue' ? 'text-coffee-600 border-b-2 border-coffee-600' : 'text-gray-400'}`}
            >
                队列
                {totalLabels > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                        {totalLabels}
                    </span>
                )}
            </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        
        {/* Hidden Print Area */}
        <div className="fixed top-0 left-[-9999px] overflow-hidden pointer-events-none opacity-0">
             <div style={{ width: '210mm', height: '297mm', background: 'white' }}>
                 <A4PrintLayout queue={printQueue} onRemoveItem={() => {}} printRef={printRef} />
             </div>
        </div>

        {activeTab === 'select' && (
            <div className="grid grid-cols-1 gap-4">
                {savedTemplates.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">
                        暂无模版。<br/>请先在电脑端 (/edit) 创建模版。
                    </div>
                ) : (
                    savedTemplates.map(t => (
                        <div key={t.id} 
                             onClick={() => setSelectedForAdd(t)}
                             className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 active:scale-95 transition-transform"
                        >
                            <div className="pointer-events-none mb-2 rounded overflow-hidden border border-gray-100">
                                <Label bean={t} scale={0.85} showBorder={false} />
                            </div>
                            <div className="flex justify-between items-center px-1">
                                <h3 className="font-bold text-coffee-900">{t.name}</h3>
                                <Plus className="text-coffee-500" size={20} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {activeTab === 'queue' && (
            <div className="space-y-3">
                {printQueue.length === 0 ? (
                     <div className="text-center text-gray-400 mt-10">
                        队列为空。去选择一些标签吧！
                    </div>
                ) : (
                    printQueue.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-coffee-900">{item.bean.name}</h4>
                                <p className="text-xs text-gray-500">数量: {item.quantity}</p>
                            </div>
                            <button 
                                onClick={() => setPrintQueue(printQueue.filter(i => i.id !== item.id))}
                                className="text-red-400 p-2"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ))
                )}
                
                {printQueue.length > 0 && (
                    <div className="mt-8 bg-coffee-50 p-4 rounded-lg text-center text-coffee-800 text-sm">
                        当前页占用: {totalLabels} / 8
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Floating Action Button for Export */}
      {printQueue.length > 0 && (
          <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-40">
              <button 
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="bg-coffee-800 text-white w-full max-w-md py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 font-bold active:scale-95 transition-all disabled:opacity-70"
              >
                  {isExporting ? '处理中...' : (
                      <>
                        <Download size={20} />
                        导出 PDF (A4)
                      </>
                  )}
              </button>
          </div>
      )}

      {/* Add Quantity Modal */}
      {selectedForAdd && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
                  <h3 className="text-lg font-bold text-center mb-4">添加到打印队列</h3>
                  <div className="mb-2 text-center text-coffee-700 font-medium">{selectedForAdd.name}</div>
                  
                  <div className="flex items-center justify-center gap-4 my-6">
                      <button 
                        onClick={() => setAddQty(Math.max(1, addQty - 1))}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600"
                      >-</button>
                      <span className="text-2xl font-bold w-12 text-center">{addQty}</span>
                      <button 
                        onClick={() => setAddQty(Math.min(8, addQty + 1))}
                        className="w-10 h-10 rounded-full bg-coffee-100 flex items-center justify-center text-xl font-bold text-coffee-700"
                      >+</button>
                  </div>

                  <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedForAdd(null)}
                        className="flex-1 py-3 text-gray-500 font-medium"
                      >
                          取消
                      </button>
                      <button 
                        onClick={handleAddToQueue}
                        className="flex-1 bg-coffee-600 text-white py-3 rounded-lg font-bold shadow-md"
                      >
                          确认
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};