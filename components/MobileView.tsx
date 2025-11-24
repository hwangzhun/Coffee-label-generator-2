import React, { useState, useEffect } from 'react';
import { CoffeeBean, PrintJobItem } from '../types';
import { A4PrintLayout } from './A4PrintLayout';
import { Label } from './Label';
import { Download, Plus, X, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const uid = () => Math.random().toString(36).substr(2, 9);

export const MobileView: React.FC = () => {
  const [savedTemplates, setSavedTemplates] = useState<CoffeeBean[]>([]);
  const [printQueue, setPrintQueue] = useState<PrintJobItem[]>([]);
  const [activeTab, setActiveTab] = useState<'select' | 'queue'>('select');
  const [selectedForAdd, setSelectedForAdd] = useState<CoffeeBean | null>(null);
  const [addQty, setAddQty] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('beanTemplates');
    if (saved) {
      setSavedTemplates(JSON.parse(saved));
    }
  }, []);

  const handleAddToQueue = () => {
    if (!selectedForAdd) return;
    
    // Check size mismatch
    const size = selectedForAdd.labelSize || '105x74';
    if (printQueue.length > 0) {
         const queueSize = printQueue[0].bean.labelSize || '105x74';
         if (queueSize !== size) {
             if (!confirm(`队列中已有 ${queueSize} 标签。添加 ${size} 标签可能导致打印错乱。继续？`)) {
                 return;
             }
         }
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
    const pages = document.querySelectorAll('.print-page');
    if (pages.length === 0) return;

    setIsExporting(true);
    await new Promise(r => setTimeout(r, 100)); // UI update

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      for (let i = 0; i < pages.length; i++) {
          const pageElement = pages[i] as HTMLElement;
          const canvas = await html2canvas(pageElement, {
            scale: 2, 
            useCORS: true
          });
          const imgData = canvas.toDataURL('image/png');
          
          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      }

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
        
        {/* Hidden Print Area for generation */}
        <div className="fixed top-0 left-[-9999px] pointer-events-none opacity-0">
             <A4PrintLayout queue={printQueue} onRemoveItem={() => {}} />
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
                            <div className="pointer-events-none mb-2 rounded overflow-hidden border border-gray-100 bg-gray-50 flex justify-center py-2">
                                <Label bean={t} scale={0.6} showBorder={false} />
                            </div>
                            <div className="flex justify-between items-center px-1 border-t pt-2">
                                <div>
                                    <h3 className="font-bold text-coffee-900">{t.nameBold || "未命名"}</h3>
                                    <p className="text-[10px] text-gray-400">
                                        {t.labelSize === '60x85' ? '竖版 (60x85)' : '横版 (105x74)'}
                                    </p>
                                </div>
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
                                <h4 className="font-bold text-coffee-900">{item.bean.nameBold}</h4>
                                <p className="text-xs text-gray-500">数量: {item.quantity} | 尺寸: {item.bean.labelSize || '105x74'}</p>
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
                  {isExporting ? '生成 PDF 中...' : (
                      <>
                        <Download size={20} />
                        导出 PDF ({totalLabels}个)
                      </>
                  )}
              </button>
          </div>
      )}

      {/* Add Quantity Modal */}
      {selectedForAdd && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
                  <h3 className="text-lg font-bold text-center mb-1">添加到打印队列</h3>
                  <p className="text-center text-xs text-gray-400 mb-4">尺寸: {selectedForAdd.labelSize || '105x74'}</p>
                  
                  {printQueue.length > 0 && (printQueue[0].bean.labelSize || '105x74') !== (selectedForAdd.labelSize || '105x74') && (
                      <div className="mb-4 bg-amber-50 text-amber-800 text-xs p-2 rounded flex gap-2 items-start">
                          <AlertTriangle size={16} className="shrink-0" />
                          <span>当前队列尺寸与该标签不同。建议分开打印。</span>
                      </div>
                  )}

                  <div className="mb-2 text-center text-coffee-700 font-medium">{selectedForAdd.nameBold}</div>
                  
                  <div className="flex items-center justify-center gap-4 my-6">
                      <button 
                        onClick={() => setAddQty(Math.max(1, addQty - 1))}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600"
                      >-</button>
                      <span className="text-2xl font-bold w-12 text-center">{addQty}</span>
                      <button 
                        onClick={() => setAddQty(addQty + 1)}
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
