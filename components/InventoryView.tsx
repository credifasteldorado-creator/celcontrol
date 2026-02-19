
import React, { useState } from 'react';
import { Search, Plus, Smartphone, Barcode } from 'lucide-react';
import { Equipment, EquipmentStatus } from '../types';
import Modal from './Modal';

interface InventoryViewProps {
  inventory: Equipment[];
  onAdd: (eq: { modelo: string; imei: string }) => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({ inventory, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ modelo: '', imei: '' });
  const [error, setError] = useState('');

  const filteredInventory = inventory.filter(item => 
    (item.modelo || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.imei || '').includes(searchTerm)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.modelo.trim()) return setError('El modelo es requerido');
    if (!/^\d+$/.test(formData.imei)) return setError('El IMEI debe ser numérico');
    if (formData.imei.length < 10) return setError('El IMEI debe tener al menos 10 dígitos');

    onAdd({ modelo: formData.modelo, imei: formData.imei });
    setFormData({ modelo: '', imei: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por IMEI o Modelo..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B4DFF]/20 focus:border-vibrant-purple transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-vibrant-purple text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#483DD8] transition-colors shadow-lg shadow-purple-200"
        >
          <Plus size={20} />
          ANEXAR A STOCK
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipo</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">IMEI / Serie</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Alta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <Smartphone size={18} className="text-gray-400" />
                        </div>
                        <span className="font-medium text-gray-900">{item.modelo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">{item.imei}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.estado === EquipmentStatus.DISPONIBLE 
                        ? 'bg-emerald-50 text-emerald-success border border-emerald-100' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {item.estado === EquipmentStatus.DISPONIBLE ? 'Disponible' : 'Vendido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                    {searchTerm ? 'No hay resultados para la búsqueda.' : 'No hay equipos registrados.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="NUEVO EQUIPO">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo Comercial</label>
            <input
              type="text"
              placeholder="Ej: iPhone 15 Pro Max"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B4DFF]/20 focus:border-vibrant-purple outline-none transition-all"
              value={formData.modelo}
              onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IMEI / SERIE</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Mínimo 10 dígitos"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B4DFF]/20 focus:border-vibrant-purple outline-none transition-all"
                value={formData.imei}
                onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                required
              />
              <button 
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-vibrant-purple transition-colors"
                title="Escanear código de barras"
              >
                <Barcode size={20} />
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
          <button
            type="submit"
            className="w-full bg-vibrant-purple text-white py-3 rounded-xl font-bold hover:bg-[#483DD8] transition-all mt-4 shadow-lg shadow-purple-100"
          >
            ANEXAR A STOCK
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryView;
