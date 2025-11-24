import React, { useState } from 'react';
import { CoffeeBean, LabelSize } from '../types';
import { Save, LayoutTemplate, Coffee, Droplets } from 'lucide-react';

interface BeanFormProps {
  bean: CoffeeBean;
  onChange: (bean: CoffeeBean) => void;
  onSaveTemplate: () => void;
  onAddToPrint: (quantity: number, weight: number, productionDate: string) => void;
}

const todayString = () => new Date().toISOString().slice(0, 10);

export const BeanForm: React.FC<BeanFormProps> = ({ bean, onChange, onSaveTemplate, onAddToPrint }) => {
  const [printQty, setPrintQty] = useState(1);
  const [printWeight, setPrintWeight] = useState(200);
  const [productionDate, setProductionDate] = useState(todayString());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...bean, [name]: value });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif font-bold text-coffee-900">编辑标签</h2>
        <button 
          onClick={onSaveTemplate}
          className="flex items-center gap-2 text-sm text-coffee-600 hover:text-coffee-800 transition-colors"
        >
          <Save size={16} /> 保存模版
        </button>
      </div>

      <div className="space-y-5 flex-1">
        
        {/* Settings Section */}
        <div className="bg-gray-50 p-3 rounded-lg space-y-3 border border-gray-100">
             <div className="flex items-center gap-2 mb-1">
                <LayoutTemplate size={14} className="text-coffee-600"/>
                <label className="text-xs font-bold text-coffee-800 uppercase tracking-wide">标签规格</label>
             </div>
             <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={() => onChange({...bean, labelSize: '105x74'})}
                    className={`text-xs py-2 px-2 border rounded transition-all ${bean.labelSize === '105x74' || !bean.labelSize ? 'bg-white border-coffee-500 text-coffee-800 font-bold shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-white'}`}
                >
                    105x74 (横版/丰富)
                </button>
                <button 
                     onClick={() => onChange({...bean, labelSize: '60x85'})}
                     className={`text-xs py-2 px-2 border rounded transition-all ${bean.labelSize === '60x85' ? 'bg-white border-coffee-500 text-coffee-800 font-bold shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-white'}`}
                >
                    60x85 (竖版/简约)
                </button>
             </div>

             <div className="flex items-center justify-between pt-1">
                <label className="text-xs font-bold text-coffee-800 uppercase tracking-wide">显示分割线</label>
                <input 
                    type="checkbox" 
                    checked={bean.showDivider} 
                    onChange={(e) => onChange({...bean, showDivider: e.target.checked})}
                    className="accent-coffee-600 w-4 h-4"
                />
             </div>
        </div>

        {/* Name Info */}
        <div className="space-y-3 pb-2 border-b border-gray-100">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">前缀/庄园 (细体)</label>
                    <input 
                        type="text" 
                        name="nameLight" 
                        value={bean.nameLight} 
                        onChange={handleChange} 
                        placeholder="例如: 天堂庄园"
                        className="w-full border border-gray-200 rounded p-2 focus:ring-2 focus:ring-coffee-400 outline-none font-light"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">名称/豆种 (粗体)</label>
                    <input 
                        type="text" 
                        name="nameBold" 
                        value={bean.nameBold} 
                        onChange={handleChange} 
                        placeholder="例如: 瑰夏"
                        className="w-full border border-gray-200 rounded p-2 focus:ring-2 focus:ring-coffee-400 outline-none font-bold"
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">国家 (用于显示国旗)</label>
                <input 
                    type="text" 
                    name="country" 
                    value={bean.country} 
                    onChange={handleChange} 
                    placeholder="例如: 哥伦比亚"
                    className="w-full border border-gray-200 rounded p-2 focus:ring-2 focus:ring-coffee-400 outline-none"
                />
            </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">产地详情 (Origin)</label>
                <input 
                    type="text" 
                    name="origin" 
                    value={bean.origin} 
                    onChange={handleChange}
                    placeholder="例如: 考卡省"
                    className="w-full border border-gray-200 rounded p-2 focus:ring-2 focus:ring-coffee-400 outline-none"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">处理法 (Process)</label>
                <input 
                    type="text" 
                    name="process" 
                    value={bean.process} 
                    onChange={handleChange}
                    placeholder="例如: 双重厌氧水洗"
                    className="w-full border border-gray-200 rounded p-2 focus:ring-2 focus:ring-coffee-400 outline-none"
                />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">海拔 (Altitude)</label>
                <input 
                    type="text" 
                    name="altitude" 
                    value={bean.altitude} 
                    onChange={handleChange}
                    placeholder="例如: 1960m"
                    className="w-full border border-gray-200 rounded p-2 focus:ring-2 focus:ring-coffee-400 outline-none"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">烘焙度</label>
                <select 
                    name="roastLevel" 
                    value={bean.roastLevel} 
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded p-2 focus:ring-2 focus:ring-coffee-400 outline-none bg-white"
                >
                    <option value="浅烘焙">浅烘焙 (Light)</option>
                    <option value="中浅烘焙">中浅烘焙 (Med-Light)</option>
                    <option value="中度烘焙">中度烘焙 (Medium)</option>
                    <option value="中深烘焙">中深烘焙 (Med-Dark)</option>
                    <option value="深度烘焙">深度烘焙 (Dark)</option>
                </select>
            </div>
        </div>

        {/* 105x74 Specifics */}
        {bean.labelSize === '105x74' && (
            <div className="bg-coffee-50 p-3 rounded-lg border border-coffee-100 space-y-3">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wide mb-1">分类</label>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => onChange({...bean, category: 'filter'})}
                                className={`flex-1 py-1.5 text-xs rounded border flex items-center justify-center gap-1 ${bean.category === 'filter' ? 'bg-coffee-600 text-white border-coffee-600' : 'bg-white border-coffee-200 text-coffee-700'}`}
                            >
                                <Droplets size={12} /> 手冲
                            </button>
                            <button 
                                onClick={() => onChange({...bean, category: 'espresso'})}
                                className={`flex-1 py-1.5 text-xs rounded border flex items-center justify-center gap-1 ${bean.category === 'espresso' ? 'bg-coffee-600 text-white border-coffee-600' : 'bg-white border-coffee-200 text-coffee-700'}`}
                            >
                                <Coffee size={12} /> 意式
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wide">酸苦平衡</label>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-coffee-600 font-semibold">更酸</span>
                        <input 
                            type="range" 
                            min="-4" 
                            max="4" 
                            step="1"
                            value={bean.tasteBalance ?? 0}
                            onChange={(e) => onChange({...bean, tasteBalance: parseInt(e.target.value)})}
                            className="flex-1 accent-coffee-600"
                        />
                        <span className="text-[10px] text-coffee-600 font-semibold">更苦</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-coffee-400 uppercase tracking-wide px-1">
                        <span>-4</span>
                        <span>-2</span>
                        <span>0</span>
                        <span>+2</span>
                        <span>+4</span>
                    </div>
                </div>
            </div>
        )}

        {/* Flavors */}
        <div className="pt-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">风味描述 (中文)</label>
            <textarea 
                name="flavorCN" 
                value={bean.flavorCN} 
                onChange={handleChange}
                placeholder="例如: 茉莉花，水蜜桃，佛手柑"
                rows={2}
                className="w-full border border-gray-200 rounded p-2 focus:ring-2 focus:ring-coffee-400 outline-none resize-none mb-2"
            />
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">风味描述 (英文)</label>
            <input 
                type="text"
                name="flavorEN" 
                value={bean.flavorEN} 
                onChange={handleChange}
                placeholder="e.g. Jasmine, Peach, Bergamot"
                className="w-full border border-gray-200 rounded p-2 focus:ring-2 focus:ring-coffee-400 outline-none italic"
            />
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="space-y-4">
            <div className="flex gap-3">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">打印数量</label>
                    <input 
                        type="number" 
                        min="1" 
                        max="99"
                        value={printQty}
                        onChange={(e) => setPrintQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full border border-gray-200 rounded p-2 text-center"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">重量 (g)</label>
                    <input 
                        type="number"
                        min="1"
                        max="9999"
                        value={printWeight}
                        onChange={(e) => setPrintWeight(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full border border-gray-200 rounded p-2 text-center"
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">生产日期</label>
                <input 
                    type="date"
                    value={productionDate}
                    onChange={(e) => setProductionDate(e.target.value)}
                    className="w-full border border-gray-200 rounded p-2"
                />
            </div>
            <button 
                onClick={() => onAddToPrint(printQty, printWeight, productionDate || todayString())}
                className="w-full bg-coffee-600 hover:bg-coffee-700 text-white font-medium py-2 px-4 rounded transition-all shadow-md active:scale-95"
            >
                加入打印队列
            </button>
        </div>
      </div>
    </div>
  );
};
