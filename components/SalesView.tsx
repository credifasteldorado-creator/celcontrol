
import React, { useState } from 'react';
import { ShoppingCart, User, Smartphone, Tag, DollarSign } from 'lucide-react';
import { Equipment, EquipmentStatus, Sale } from '../types';
import Modal from './Modal';

interface SalesViewProps {
  inventory: Equipment[];
  sales: Sale[];
  onRegisterSale: (data: { 
    equipo_id: string; 
    cliente: string; 
    telefono: string; 
    canal: string; 
    enganche: number 
  }) => void;
}

const SalesView: React.FC<SalesViewProps> = ({ inventory, sales, onRegisterSale }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    equipo_id: '',
    cliente: '',
    telefono: '',
    canal: 'Local',
    enganche: ''
  });
  const [error, setError] = useState('');

  const availableEquipment = inventory.filter(e => e.estado === EquipmentStatus.DISPONIBLE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.equipo_id) return setError('Selecciona un equipo');
    if (!formData.cliente.trim()) return setError('Ingresa el nombre del cliente');
    if (!/^\d{10}$/.test(formData.telefono)) return setError('El teléfono debe tener 10 dígitos');
    if (parseFloat(formData.enganche) < 0) return setError('El enganche no puede ser negativo');

    onRegisterSale({
      equipo_id: formData.equipo_id,
      cliente: formData.cliente,
      telefono: formData.telefono,
      canal: formData.canal,
      enganche: parseFloat(formData.enganche) || 0
    });

    setFormData({ equipo_id: '', cliente: '', telefono: '', canal: 'Local', enganche: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Registro de Ventas</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-success text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#008f65] transition-colors shadow-lg shadow-emerald-100"
        >
          <ShoppingCart size={20} />
          REGISTRAR VENTA
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Modelo / IMEI</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Canal</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Enganche</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{sale.cliente}</span>
                        <span className="text-xs text-gray-500">{sale.telefono}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 text-sm">{sale.modelo}</span>
                        <span className="text-xs font-mono text-gray-500">{sale.imei}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                        {sale.canal}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-success">
                      ${sale.enganche.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {sale.created_at ? new Date(sale.created_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                    No se han registrado ventas en la base de datos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="REGISTRAR VENTA">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipo a Vender</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B4DFF]/20 focus:border-vibrant-purple outline-none appearance-none bg-white transition-all cursor-pointer"
                value={formData.equipo_id}
                onChange={(e) => setFormData({ ...formData, equipo_id: e.target.value })}
                required
              >
                <option value="">Selecciona un equipo disponible...</option>
                {availableEquipment.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.modelo} - {eq.imei}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Nombre completo"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B4DFF]/20 focus:border-vibrant-purple outline-none transition-all"
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="text"
                maxLength={10}
                placeholder="10 dígitos"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B4DFF]/20 focus:border-vibrant-purple outline-none transition-all"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Canal/Tag</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B4DFF]/20 focus:border-vibrant-purple outline-none appearance-none bg-white transition-all cursor-pointer"
                  value={formData.canal}
                  onChange={(e) => setFormData({ ...formData, canal: e.target.value })}
                >
                  <option value="Local">Local</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Referido">Referido</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enganche</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-success" size={18} />
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B4DFF]/20 focus:border-vibrant-purple outline-none font-bold text-emerald-success transition-all"
                value={formData.enganche}
                onChange={(e) => setFormData({ ...formData, enganche: e.target.value })}
                required
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
          <button
            type="submit"
            className="w-full bg-emerald-success text-white py-3 rounded-xl font-bold hover:bg-[#008f65] transition-all mt-4 shadow-lg shadow-emerald-50"
          >
            FINALIZAR VENTA
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default SalesView;
