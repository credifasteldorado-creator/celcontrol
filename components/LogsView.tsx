
import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, MapPin, Download, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const LogsView: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // Fetch all sales data with joined equipment info
      const { data, error } = await supabase
        .from('ventas')
        .select(`
          cliente,
          telefono,
          canal,
          enganche,
          created_at,
          equipos (modelo, imei)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        alert('No hay ventas registradas para exportar.');
        return;
      }

      // Define CSV headers
      const headers = ['Cliente', 'Modelo', 'IMEI', 'Canal', 'Enganche', 'Fecha'];
      
      // Map data to CSV rows
      const rows = data.map(sale => {
        const equipo = (sale.equipos as any) || {};
        const fecha = sale.created_at ? new Date(sale.created_at).toLocaleDateString() : '';
        return [
          `"${sale.cliente}"`,
          `"${equipo.modelo || ''}"`,
          `"${equipo.imei || ''}"`,
          `"${sale.canal}"`,
          sale.enganche,
          `"${fecha}"`
        ].join(',');
      });

      // Combine headers and rows
      const csvContent = [headers.join(','), ...rows].join('\n');
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ventas_celcontrol_pro_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error al exportar CSV:', err);
      alert('Hubo un error al generar el reporte.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Bitácora y Reportes</h2>
        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <Loader2 size={18} className="animate-spin text-vibrant-purple" />
          ) : (
            <Download size={18} className="text-vibrant-purple" />
          )}
          {isExporting ? 'Generando...' : 'Exportar CSV'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Ventas" value="$12,450" change="+12%" icon={<TrendingUp size={20} />} />
        <StatCard title="Clientes Nuevos" value="24" change="+5%" icon={<Users size={20} />} />
        <StatCard title="Dispositivos" value="156" change="-2" icon={<BarChart3 size={20} />} />
      </div>

      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm min-h-[350px] flex flex-col items-center justify-center text-center space-y-4">
        <div className="bg-slate-50 p-6 rounded-full ring-8 ring-slate-50/50">
          <MapPin size={48} className="text-vibrant-purple animate-pulse" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Análisis Geográfico</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-2">
            Próximamente: Gráficas de rendimiento por sucursal, análisis de canales de venta y mapas de calor de clientes.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="h-2 w-8 bg-gray-200 rounded-full" />
          <div className="h-2 w-12 bg-vibrant-purple rounded-full" />
          <div className="h-2 w-8 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-vibrant-purple/30 transition-colors">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h4 className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">{value}</h4>
      </div>
      <div className="p-2.5 bg-slate-50 rounded-xl text-vibrant-purple group-hover:bg-[#5B4DFF]/10 transition-colors">
        {icon}
      </div>
    </div>
    <div className="mt-4 flex items-center text-xs">
      <span className={change.startsWith('+') ? 'text-emerald-success font-bold bg-emerald-50 px-1.5 py-0.5 rounded' : 'text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded'}>
        {change}
      </span>
      <span className="text-gray-400 ml-1.5">vs último mes</span>
    </div>
  </div>
);

export default LogsView;
