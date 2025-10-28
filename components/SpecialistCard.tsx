import React, { useState, useEffect, useRef } from 'react';
import { PlanModal } from './PlanModal';

interface SpecialistCardProps {
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    name: string;
    description: string;
    plan: string | null;
    color: string;
}

export const SpecialistCard: React.FC<SpecialistCardProps> = ({ icon: Icon, name, description, plan, color }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
    const contentRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        setCheckedItems(new Set());
    }, [plan]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (contentRef.current) {
                const el = contentRef.current;
                setIsOverflowing(el.scrollHeight > el.clientHeight);
            }
        }, 100); 
        return () => clearTimeout(timer);
    }, [plan]);

    const handleCheck = (index: number) => {
        const newCheckedItems = new Set(checkedItems);
        if (newCheckedItems.has(index)) {
            newCheckedItems.delete(index);
        } else {
            newCheckedItems.add(index);
        }
        setCheckedItems(newCheckedItems);
    };

    const renderPlanContentPreview = () => {
        if (!plan) {
            return <p className="text-gray-500 italic mt-4">Seu plano semanal aparecerá aqui após o check-in.</p>;
        }
        const planLines = plan.split('\n').filter(line => line.trim() !== '');
        
        return planLines.map((line, index) => {
            const match = line.match(/^\s*[-*]\s*(.*)/) || line.match(/^\s*\d+\.\s*(.*)/);
            if (match) {
                const taskText = match[1];
                const isChecked = checkedItems.has(index);
                return (
                     <div key={index} className="flex items-start my-2">
                        <div className={`mt-1.5 mr-3 flex-shrink-0 w-4 h-4 rounded border-2 ${isChecked ? 'bg-[#FFCC33] border-[#FFCC33]' : 'border-gray-400'}`} />
                        <span className={`text-gray-700 ${isChecked ? 'line-through text-gray-500' : ''}`}>
                            {taskText}
                        </span>
                    </div>
                );
            }
             if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                 return <h4 key={index} className="font-bold text-gray-900 mt-4 mb-2">{line.trim().replace(/\*\*/g, '')}</h4>
            }
            return <p key={index} className="my-2">{line}</p>;
        });
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
                <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-full mr-4 ${color}`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{name}</h3>
                        <p className="text-gray-500 text-sm">{description}</p>
                    </div>
                </div>
                
                <div className="relative flex-grow min-h-[50px]">
                     <div
                        ref={contentRef}
                        className="max-h-[280px] overflow-hidden"
                    >
                        <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                            {renderPlanContentPreview()}
                        </div>
                    </div>
                    {isOverflowing && (
                        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    )}
                </div>

                {(isOverflowing) && plan && (
                     <div className="pt-4 mt-auto">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full text-center text-[#FFCC33] hover:text-[#e6b82e] font-semibold text-sm py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[#FFCC33] transition-colors"
                        >
                            Ver Plano Completo
                        </button>
                    </div>
                )}
            </div>

            <PlanModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                icon={Icon}
                name={name}
                plan={plan}
                color={color}
                checkedItems={checkedItems}
                onCheckItem={handleCheck}
            />
        </>
    );
};