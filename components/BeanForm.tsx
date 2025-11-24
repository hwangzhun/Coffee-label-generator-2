import React, { useState } from 'react';
import { CoffeeBean } from '../types';
import { Wand2, Loader2, Save } from 'lucide-react';
import { generateBeanDetails } from '../services/geminiService';

interface BeanFormProps {
  bean: CoffeeBean;
  onChange: (bean: CoffeeBean) => void;
  onSaveTemplate: () => void;
  onAddToPrint: (quantity: number) => void;
}

export const BeanForm: React.FC<BeanFormProps> = ({ bean, onChange, onSaveTemplate, onAddToPrint }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [printQty, setPrintQty] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...bean, [name]: value });
  };

  const handleGenerateAI = async () => {
    if (!bean.name && !bean.origin) {
      alert("请至少输入名称和产地。");
      return;
    }
    setIsGenerating(true);
    const result = await generateBeanDetails(bean.name, bean.origin, bean.process);
    setIsGenerating(false);
    
    if (result) {
      onChange({
        ...bean,
        flavorNotes: result.flavorNotes,
        description: result.description
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif font-bold text-coffee-900">标签详情</h2>
        <button 
          onClick={onSaveTemplate}
          className="flex items-center gap-2 text-sm text-coffee-600 hover:text-coffee-800 transition-colors"
        >
          <Save size={16} /> 保存模版
        </button>
      </div>

      <div className="space-y-4 flex-1">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">名称 (Name)</label>
                <input 
                    type="text" 
                    name="name" 
                    value={bean.name} 
                    onChange={handleChange} 
                    placeholder="例如: 埃塞俄比亚 耶加雪菲"
                    className="w-full border border-gray-200 rounded p-2 focus:ring-2 focus:ring-coffee-400 outline-none"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">产地 (Origin)</label>
                <input 
                    type="text" 
                    name="origin" 
                    value={bean.origin} 
                    onChange={handleChange}
                    placeholder="例如: 盖德奥产区"
                    className="w-full border border-gray-200 rounded p-2 focus:ring-2 focus:ring-coffee-400 outline-none"
                />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">处理法 (Process)</label>
                <input 
                    type="text" 
                    name="process" 
                    value={bean.process} 
                    onChange={handleChange}
                    placeholder="例如: 日晒处理"
                    className="w-full border border-gray-200 rounded p-2 focus:ring-2 focus:ring-coffee-400 outline-none"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">海拔 (Altitude)</label>
                <input 
                    type="text" 
                    name="altitude" 
                    value={bean.altitude} 
                    onChange={handleChange}
                    placeholder="例如: 1800m"
                    className="w-full border border-gray-200 rounded p-2 focus:ring-2 focus:ring-coffee-400 outline-none"
                />
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">烘焙度 (Roast Level)</label>
            <select 
                name="roastLevel" 
                value={bean.roastLevel} 
                onChange={handleChange}
                className="w-full border border-gray-200 rounded p-2 focus:ring-2 focus:ring-coffee-400 outline-none"
            >
                <option value="浅烘焙">浅烘焙 (Light)</option>
                <option value="中浅烘焙">中浅烘焙 (Medium-Light)</option>
                <option value="中度烘焙">中度烘焙 (Medium)</option>
                <option value="中深烘焙">中深烘焙 (Medium-Dark)</option>
                <option value="深度烘焙">深度烘焙 (Dark)</option>
            </select>
        </div>

        {/* AI Section */}
        <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">风味描述</label>
                <button 
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1 hover:bg-purple-100 transition-colors disabled:opacity-50"
                >
                    {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                    AI 自动生成
                </button>
            </div>
            <textarea 
                name="flavorNotes" 
                value={bean.flavorNotes} 
                onChange={handleChange}
                placeholder="例如: 茉莉花香，桃子，红茶感"
                rows={3}
                className="w-full border border-gray-200 rounded p-2 focus:ring-2 focus:ring-coffee-400 outline-none resize-none"
            />
        </div>

        <div>
             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">背景底图 URL</label>
             <input 
                type="text" 
                name="backgroundImageUrl" 
                value={bean.backgroundImageUrl || ''} 
                onChange={handleChange}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded p-2 focus:ring-2 focus:ring-coffee-400 outline-none text-xs"
            />
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-end gap-2">
            <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">打印数量</label>
                <input 
                    type="number" 
                    min="1" 
                    max="8"
                    value={printQty}
                    onChange={(e) => setPrintQty(parseInt(e.target.value) || 1)}
                    className="w-full border border-gray-200 rounded p-2 text-center"
                />
            </div>
            <button 
                onClick={() => onAddToPrint(printQty)}
                className="flex-[2] bg-coffee-600 hover:bg-coffee-700 text-white font-medium py-2 px-4 rounded transition-all shadow-md active:scale-95"
            >
                加入打印队列
            </button>
        </div>
      </div>
    </div>
  );
};