import React from 'react';
import { CoffeeBean } from '../types';
import { Coffee, Trash2, ArrowRight } from 'lucide-react';

interface TemplateListProps {
  templates: CoffeeBean[];
  onSelect: (bean: CoffeeBean) => void;
  onDelete: (id: string) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({ templates, onSelect, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-serif font-bold text-coffee-900 flex items-center gap-2">
          <Coffee size={20} className="text-coffee-600" />
          保存的模版
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2 no-scrollbar">
        {templates.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
                暂无保存的模版
            </div>
        ) : (
            templates.map((t) => (
                <div key={t.id} className="group relative bg-gray-50 hover:bg-coffee-50 rounded-lg p-3 transition-colors border border-transparent hover:border-coffee-200">
                    <div className="cursor-pointer" onClick={() => onSelect(t)}>
                        <h3 className="font-bold text-coffee-900 text-sm truncate">{t.nameBold || t.nameLight || "未命名"}</h3>
                        <p className="text-xs text-coffee-600 truncate">{t.origin} • {t.roastLevel}</p>
                    </div>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(t.id);
                        }}
                        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        title="删除"
                    >
                        <Trash2 size={14} />
                    </button>
                    <div 
                        onClick={() => onSelect(t)}
                        className="absolute bottom-2 right-2 text-coffee-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                        <ArrowRight size={14} />
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};