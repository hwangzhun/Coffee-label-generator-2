import React, { useState, useEffect, useMemo } from 'react';
import { CoffeeBean, PrintJobItem } from '../types';
import { A4PrintLayout } from './A4PrintLayout';
import { Label } from './Label';
import { Download, Plus, X, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const uid = () => Math.random().toString(36).substr(2, 9);
const todayString = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};
const formatTemplateName = (bean: CoffeeBean) => {
  const parts = [bean.nameLight, bean.nameBold].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : '未命名';
};
const formatDateForDisplay = (value?: string) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

export const MobileView: React.FC = () => {
  const [savedTemplates, setSavedTemplates] = useState<CoffeeBean[]>([]);
  const [printQueue, setPrintQueue] = useState<PrintJobItem[]>([]);
  const [activeTab, setActiveTab] = useState<'select' | 'queue'>('select');
  const [selectedForAdd, setSelectedForAdd] = useState<CoffeeBean | null>(null);
  const [addQty, setAddQty] = useState(1);
  const [addWeight, setAddWeight] = useState(200);
  const [addProductionDate, setAddProductionDate] = useState(todayString());
  const [isExporting, setIsExporting] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('beanTemplates');
    if (saved) {
      setSavedTemplates(JSON.parse(saved));
    }
  }, []);

  const templateGroups = useMemo(() => {
    const filterTemplates = savedTemplates.filter(t => (t.category || 'filter') !== 'espresso');
    const espressoTemplates = savedTemplates.filter(t => t.category === 'espresso');
    return [
      { key: 'filter', label: '手冲', items: filterTemplates },
      { key: 'espresso', label: '意式', items: espressoTemplates }
    ];
  }, [savedTemplates]);

  const openAddModal = (bean: CoffeeBean) => {
    setSelectedForAdd(bean);
    setAddQty(1);
    setAddWeight(200);
    setAddProductionDate(todayString());
  };

  const closeAddModal = () => {
    setSelectedForAdd(null);
    setAddQty(1);
    setAddWeight(200);
    setAddProductionDate(todayString());
  };

  const handleAddToQueue = () => {
    if (!selectedForAdd) return;
    if (addWeight <= 0) {
        alert('请填写有效的重量（克）');
        return;
    }
    if (!addProductionDate) {
        alert('请选择生产日期');
        return;
    }
    
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

    setPrintQueue([
        ...printQueue, 
        { 
            id: uid(), 
            bean: selectedForAdd, 
            quantity: addQty,
            weight: addWeight,
            productionDate: addProductionDate
        }
    ]);
    
    closeAddModal();
  };

  const generatePDF = async () => {
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

  const handleExportClick = () => {
    if (printQueue.length === 0) return;
    setShowExportConfirm(true);
  };

  const handleConfirmExport = async () => {
    setShowExportConfirm(false);
    await generatePDF();
  };

  const totalLabels = printQueue.reduce((acc, i) => acc + i.quantity, 0);
  const totalWeight = printQueue.reduce((acc, i) => acc + i.quantity * (i.weight || 0), 0);

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
            <div className="space-y-6">
                {savedTemplates.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">
                        暂无模版。<br/>请先在电脑端 (/edit) 创建模版。
                    </div>
                ) : (
                    templateGroups.map(group => (
                        group.items.length > 0 && (
                            <section key={group.key}>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-coffee-800">{group.label}</h3>
                                    <span className="text-[11px] text-gray-400">{group.items.length} 个模版</span>
                                </div>
                                <div className="space-y-2">
                                    {group.items.map(t => {
                                        const subtitle = `${t.origin || '未填写产地'} • ${t.roastLevel || ''}`.trim();
                                        const categoryLabel = t.category === 'espresso' ? '意式' : '手冲';
                                        return (
                                            <button
                                                type="button"
                                                key={t.id}
                                                onClick={() => openAddModal(t)}
                                                className="w-full bg-white p-3 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform flex items-center justify-between gap-4"
                                            >
                                                <div className="flex-1 text-left">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-[14px] text-coffee-900 truncate">
                                                            {formatTemplateName(t)}
                                                        </p>
                                                        <span className="text-[10px] font-semibold text-coffee-600 border border-coffee-200 rounded-full px-2 py-0.5 shrink-0">
                                                            {categoryLabel}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 mt-1 truncate">
                                                        {subtitle}
                                                    </p>
                                                </div>
                                                <Plus className="text-coffee-500 shrink-0" size={18} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>
                        )
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
                    printQueue.map(item => {
                        const aspectRatio = item.bean.labelSize === '60x85' ? '60 / 85' : '105 / 74.25';
                        const previewScale = item.bean.labelSize === '60x85' ? 0.35 : 0.22;
                        return (
                            <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
                                <div 
                                    className="w-24 rounded-md border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 relative"
                                    style={{ aspectRatio }}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Label bean={item.bean} scale={previewScale} showBorder={false} />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-coffee-900">{formatTemplateName(item.bean)}</h4>
                                    <p className="text-[11px] text-gray-500 mt-1">
                                        尺寸 {item.bean.labelSize || '105x74'} ・ 数量 {item.quantity} ・ 重量 {item.weight}g
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">生产 {formatDateForDisplay(item.productionDate)}</p>
                                </div>
                                <button 
                                    onClick={() => setPrintQueue(printQueue.filter(i => i.id !== item.id))}
                                    className="text-red-400 p-2"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        )}
      </div>

      {/* Bottom Action Button */}
      <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-40">
          {activeTab === 'select' ? (
              <button 
                onClick={() => setActiveTab('queue')}
                disabled={printQueue.length === 0}
                className="bg-white text-coffee-700 border border-coffee-200 w-full max-w-md py-3 rounded-xl shadow-sm font-semibold active:scale-95 transition-all disabled:text-gray-400 disabled:border-gray-200 disabled:bg-gray-100"
              >
                  {printQueue.length === 0 ? '请选择模版后再下一步' : '下一步 > 队列'}
              </button>
          ) : (
              printQueue.length > 0 && (
                  <button 
                    onClick={handleExportClick}
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
              )
          )}
      </div>

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

                  <div className="mb-3 text-center text-coffee-700 font-medium">
                      {formatTemplateName(selectedForAdd)}
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 my-4">
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

                  <div className="space-y-3 text-sm">
                      <div>
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1">重量 (克)</label>
                          <input 
                            type="number"
                            min={1}
                            value={addWeight}
                            onChange={(e) => setAddWeight(Math.max(1, parseInt(e.target.value || '1', 10)))}
                            className="w-full border border-gray-200 rounded-lg p-2 text-center focus:ring-2 focus:ring-coffee-200 outline-none"
                          />
                      </div>
                      <div>
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1">生产日期</label>
                          <input 
                            type="date"
                            value={addProductionDate}
                            onChange={(e) => setAddProductionDate(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-coffee-200 outline-none"
                          />
                      </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                      <button 
                        onClick={closeAddModal}
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

      {/* Export Summary Modal */}
      {showExportConfirm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                  <h3 className="text-lg font-bold text-center text-coffee-900">打印统计</h3>
                  <p className="text-xs text-gray-500 text-center mt-1">
                      共 {totalLabels} 张 ・ 预计总重量 {totalWeight || '-'} g
                  </p>
                  <div className="mt-4 max-h-60 overflow-y-auto space-y-3 pr-1">
                      {printQueue.map(item => (
                          <div key={item.id} className="border border-gray-100 rounded-lg p-3">
                              <div className="font-semibold text-sm text-coffee-900">{formatTemplateName(item.bean)}</div>
                              <div className="text-[11px] text-gray-500 mt-1">
                                  数量 {item.quantity} ・ 重量 {item.weight}g
                              </div>
                              <div className="text-[11px] text-gray-400">
                                  生产 {formatDateForDisplay(item.productionDate)}
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="flex gap-2 mt-6">
                      <button 
                        onClick={() => setShowExportConfirm(false)}
                        className="flex-1 py-3 text-gray-500 font-medium"
                      >
                          取消
                      </button>
                      <button 
                        onClick={handleConfirmExport}
                        className="flex-1 bg-coffee-700 text-white py-3 rounded-xl font-bold shadow-md disabled:opacity-60"
                        disabled={isExporting}
                      >
                          {isExporting ? '生成中...' : '确认生成 PDF'}
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
