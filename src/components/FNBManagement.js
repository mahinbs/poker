import React, { useState } from 'react';
import MenuInventoryTab from './fnb/MenuInventoryTab';
import OrderManagementTab from './fnb/OrderManagementTab';
import SupplierManagementTab from './fnb/SupplierManagementTab';
import KitchenOperationsTab from './fnb/KitchenOperationsTab';

/**
 * Main FNB Management Component
 * Contains 4 tabs: Menu & Inventory, Order Management, Supplier Management, Kitchen Operations
 */
export default function FNBManagement({ clubId }) {
  const [activeTab, setActiveTab] = useState('menu-inventory');

  const tabs = [
    { id: 'menu-inventory', label: 'Menu & Inventory', icon: '📋' },
    { id: 'order-management', label: 'Order Management', icon: '🍽️' },
    { id: 'supplier-management', label: 'Supplier Management', icon: '🚚' },
    { id: 'kitchen-operations', label: 'Kitchen Operations', icon: '👨‍🍳' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-red-500 to-pink-500 p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-2">
          Food & Beverage Management
        </h1>
        <p className="text-white/90">
          Complete F&B management system for your poker club
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 rounded-xl p-2 shadow-lg">
        <div className="flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'menu-inventory' && <MenuInventoryTab clubId={clubId} />}
        {activeTab === 'order-management' && <OrderManagementTab clubId={clubId} />}
        {activeTab === 'supplier-management' && <SupplierManagementTab clubId={clubId} />}
        {activeTab === 'kitchen-operations' && <KitchenOperationsTab clubId={clubId} />}
      </div>
    </div>
  );
}

