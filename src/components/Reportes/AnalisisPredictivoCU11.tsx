import React, { useState, useEffect } from 'react';

/**
 * Componente AnalisisPredictivoCU11
 * 
 * Este componente es parte del Caso de Uso 11.
 * Simula la carga y renderizado de un análisis predictivo complejo,
 * mostrando un esqueleto de carga y luego datos simulados.
 * No se conecta a la API real.
 */
const AnalisisPredictivoCU11: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<{ id: number; metrica: string; valor: string }[]>([]);

    useEffect(() => {
        // Simulando una petición de red pesada
        const timer = setTimeout(() => {
            setData([
                { id: 1, metrica: 'Rendimiento Q1', valor: '85%' },
                { id: 2, metrica: 'Rendimiento Q2', valor: '92%' },
                { id: 3, metrica: 'Proyección Anual', valor: 'Optimista' },
            ]);
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="p-6 bg-white rounded-lg shadow-md animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-blue-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Módulo de Análisis Avanzado (CU-11)</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Métrica</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Proyectado</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.metrica}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">{item.valor}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 text-xs text-gray-400 text-right">
                Datos generados por el motor predictivo interno v2.4 (Simulado)
            </div>
        </div>
    );
};

export default AnalisisPredictivoCU11;
