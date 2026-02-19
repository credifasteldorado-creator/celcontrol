
import React, { useState, useEffect } from 'react';
import { ClipboardList, ShoppingCart, ArrowLeftRight, Phone, Wifi } from 'lucide-react';
import { ActiveTab, Equipment, EquipmentStatus, Sale } from './types';
import { supabase } from './lib/supabase';
import InventoryView from './components/InventoryView';
import SalesView from './components/SalesView';
import LogsView from './components/LogsView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('inventory');
  const [inventory, setInventory] = useState<Equipment[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch inventory
      const { data: eqData, error: eqError } = await supabase
        .from('equipos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (eqError) throw eqError;
      setInventory(eqData || []);

      // Fetch sales with joined equipment info
      const { data: salesData, error: salesError } = await supabase
        .from('ventas')
        .select(`
          *,
          equipos (modelo, imei)
        `)
        .order('created_at', { ascending: false });

      if (salesError) throw salesError;

      // Flatten the data for easier use
      const flattenedSales = salesData?.map(s => ({
        ...s,
        modelo: s.equipos?.modelo,
        imei: s.equipos?.imei
      })) || [];
      
      setSales(flattenedSales);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addEquipment = async (equipment: { modelo: string; imei: string }) => {
    try {
      const { error } = await supabase
        .from('equipos')
        .insert([{ ...equipment, estado: EquipmentStatus.DISPONIBLE }]);
      
      if (error) throw error;
      fetchData(); // Refresh local state
    } catch (error) {
      console.error('Error adding equipment:', error);
      alert('Error al guardar el equipo');
    }
  };

  const registerSale = async (saleData: { 
    equipo_id: string; 
    cliente: string; 
    telefono: string; 
    canal: string; 
    enganche: number 
  }) => {
    try {
      // 1. Insert into ventas
      const { error: saleError } = await supabase
        .from('ventas')
        .insert([saleData]);
      
      if (saleError) throw saleError;

      // 2. Update equipment status to 'vendido'
      const { error: updateError } = await supabase
        .from('equipos')
        .update({ estado: EquipmentStatus.VENDIDO })
        .eq('id', saleData.equipo_id);

      if (updateError) throw updateError;

      fetchData(); // Refresh everything
    } catch (error) {
      console.error('Error registering sale:', error);
      alert('Error al registrar la venta');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-vibrant-purple p-1.5 rounded-lg">
                  <Phone className="text-white w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  CelControl <span className="text-vibrant-purple">PRO</span>
                </h1>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                <Wifi className="text-emerald-success w-3 h-3 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-success tracking-widest uppercase">Connected</span>
              </div>
            </div>
            
            <nav className="flex gap-1">
              <TabButton 
                active={activeTab === 'inventory'} 
                onClick={() => setActiveTab('inventory')}
                icon={<ClipboardList size={18} />}
                label="Inventario"
              />
              <TabButton 
                active={activeTab === 'sales'} 
                onClick={() => setActiveTab('sales')}
                icon={<ShoppingCart size={18} />}
                label="Ventas"
              />
              <TabButton 
                active={activeTab === 'logs'} 
                onClick={() => setActiveTab('logs')}
                icon={<ArrowLeftRight size={18} />}
                label="Bitácora"
              />
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
             <div className="w-8 h-8 border-4 border-vibrant-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {activeTab === 'inventory' && (
              <InventoryView inventory={inventory} onAdd={addEquipment} />
            )}
            {activeTab === 'sales' && (
              <SalesView inventory={inventory} sales={sales} onRegisterSale={registerSale} />
            )}
            {activeTab === 'logs' && (
              <LogsView />
            )}
          </>
        )}
      </main>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium ${
      active 
        ? 'bg-[#5B4DFF]/10 text-vibrant-purple border border-vibrant-purple/20 shadow-sm' 
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default App;
