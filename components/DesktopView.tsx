import React, { useState, useEffect } from 'react';
import { CoffeeBean, INITIAL_BEAN, PrintJobItem } from '../types';
import { BeanForm } from './BeanForm';
import { TemplateList } from './TemplateList';
import { Label } from './Label';
import { A4PrintLayout } from './A4PrintLayout';
import { Printer, Download, Plus } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const uid = () => Math.random().toString(36).substr(2, 9);
const normalizeBean = (bean: CoffeeBean): CoffeeBean => ({
  ...bean,
  tasteBalance: typeof bean.tasteBalance === 'number' ? bean.tasteBalance : 0,
});

export const DesktopView: React.FC = () => {
  const [currentBean, setCurrentBean] = useState<CoffeeBean>(INITIAL_BEAN);
  const [savedTemplates, setSavedTemplates] = useState<CoffeeBean[]>([]);
  const [printQueue, setPrintQueue] = useState<PrintJobItem[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('beanTemplates');
    if (saved) {
      const parsed: CoffeeBean[] = JSON.parse(saved);
      setSavedTemplates(parsed.map(normalizeBean));
    }
  }, []);

  const handleSaveTemplate = () => {
    if (!currentBean.nameLight && !currentBean.nameBold) return alert("需要输入名称才能保存模版");
    
    const beanToSave = normalizeBean(currentBean);
    const existingIndex = savedTemplates.findIndex(t => t.id === beanToSave.id);
    let updated;
    
    if (existingIndex >= 0) {
       updated = [...savedTemplates];
       updated[existingIndex] = beanToSave;
    } else {
       const newTemplate = { ...beanToSave, id: uid() };
       updated = [...savedTemplates, newTemplate];
       setCurrentBean(newTemplate);
    }
    
    setSavedTemplates(updated.map(normalizeBean));
    localStorage.setItem('beanTemplates', JSON.stringify(updated));
    alert("模版已保存!");
  };

  const handleDeleteTemplate = (id: string) => {
    if(!confirm("确定要删除这个模版吗？")) return;
    const updated = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updated);
    localStorage.setItem('beanTemplates', JSON.stringify(updated));
    if (currentBean.id === id) {
        setCurrentBean(INITIAL_BEAN);
    }
  };

  const handleSelectTemplate = (bean: CoffeeBean) => {
    setCurrentBean(normalizeBean({ ...bean }));
  };

  const handleAddToPrint = (qty: number, weight: number, productionDate: string) => {
    // Dynamic size check
    const size = currentBean.labelSize || '105x74';
    if (printQueue.length > 0) {
        const queueSize = printQueue[0].bean.labelSize || '105x74';
        if (queueSize !== size) {
            if (!confirm(`当前队列是 ${queueSize} 尺寸，您正在添加 ${size} 尺寸。这可能导致排版错误。是否继续？`)) {
                return;
            }
        }
    }
    const snapshot = normalizeBean({ ...currentBean });
    setPrintQueue([...printQueue, { id: uid(), bean: snapshot, quantity: qty, weight, productionDate }]);
  };

  const handleRemoveFromQueue = (jobId: string) => {
    setPrintQueue(printQueue.filter(j => j.id !== jobId));
  };

  const handleDownloadPDF = async () => {
    const pages = document.querySelectorAll('.print-page');
    if (pages.length === 0) return;
    
    setIsExporting(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;

      for (let i = 0; i < pages.length; i++) {
          const pageElement = pages[i] as HTMLElement;
          const canvas = await html2canvas(pageElement, {
            scale: 2, 
            useCORS: true,
            logging: false
          });
          const imgData = canvas.toDataURL('image/png');
          
          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }
      
      pdf.save('coffee-labels.pdf');
    } catch (err) {
      console.error(err);
      alert("生成 PDF 出错，请检查控制台。");
    } finally {
      setIsExporting(false);
    }
  };

  const handleClear = () => {
      setCurrentBean({ ...INITIAL_BEAN, id: uid() });
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden text-slate-800 font-sans">
      
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white p-4 hidden md:flex flex-col">
        <div className="mb-6">
            <h1 className="font-serif font-black text-2xl text-coffee-800 tracking-tight">BeanLabel<span className="text-coffee-500">Pro</span></h1>
            <p className="text-xs text-gray-400 mt-1">专业标签制作 (PC端)</p>
        </div>
        <button 
            onClick={handleClear}
            className="mb-4 w-full flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg p-3 text-sm text-gray-500 hover:border-coffee-400 hover:text-coffee-600 transition-all"
        >
            <Plus size={16} /> 新建标签
        </button>
        <div className="flex-1 overflow-hidden">
             <TemplateList 
                templates={savedTemplates} 
                onSelect={handleSelectTemplate} 
                onDelete={handleDeleteTemplate} 
            />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        
        {/* Editor */}
        <div className="w-full md:w-[400px] lg:w-[450px] p-4 bg-gray-50 border-r border-gray-200 flex flex-col gap-4 overflow-hidden">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col items-center justify-center min-h-[320px] relative">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide absolute top-4 left-4">实时预览</h3>
                <div className={`transform ${currentBean.labelSize === '60x85' ? 'scale-[1]' : 'scale-[0.8]'} origin-center shadow-xl transition-all duration-300`}>
                    <Label bean={currentBean} />
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <BeanForm 
                    bean={currentBean} 
                    onChange={setCurrentBean} 
                    onSaveTemplate={handleSaveTemplate} 
                    onAddToPrint={handleAddToPrint}
                />
            </div>
        </div>

        {/* Layout */}
        <div className="flex-1 bg-gray-100 flex flex-col relative">
            <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-2">
                    <Printer className="text-coffee-600" />
                    <h2 className="font-bold text-gray-800">打印队列 (自动分页)</h2>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setPrintQueue([])} 
                        className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded font-medium"
                    >
                        清空
                    </button>
                    <button 
                        onClick={handleDownloadPDF}
                        disabled={printQueue.length === 0 || isExporting}
                        className="flex items-center gap-2 bg-coffee-800 hover:bg-coffee-900 text-white px-6 py-2 rounded-lg font-medium shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? '处理中...' : (
                            <>
                                <Download size={18} />
                                导出 PDF
                            </>
                        )}
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-hidden relative">
                <A4PrintLayout 
                    queue={printQueue} 
                    onRemoveItem={handleRemoveFromQueue} 
                />
            </div>
        </div>

      </div>
    </div>
  );
};
