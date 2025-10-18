import React, { useState } from 'react';
import { 
  ShoppingCartIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const OrderManagement = () => {
  const [orders, setOrders] = useState([
    {
      id: 'ORD-001',
      customer: 'John Doe',
      items: [
        { name: 'Chicken Burger', quantity: 2, price: 12.99 },
        { name: 'Caesar Salad', quantity: 1, price: 8.99 }
      ],
      total: 34.97,
      status: 'Processing',
      orderTime: '2024-01-15 14:30',
      tableNumber: 5,
      notes: 'Extra mayo on burger'
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      items: [
        { name: 'Pasta Carbonara', quantity: 1, price: 14.99 },
        { name: 'Chocolate Cake', quantity: 1, price: 6.99 }
      ],
      total: 21.98,
      status: 'Completed',
      orderTime: '2024-01-15 14:15',
      tableNumber: 3,
      notes: ''
    },
    {
      id: 'ORD-003',
      customer: 'Mike Johnson',
      items: [
        { name: 'Fish & Chips', quantity: 2, price: 16.99 },
        { name: 'Caesar Salad', quantity: 1, price: 8.99 },
        { name: 'Chocolate Cake', quantity: 2, price: 6.99 }
      ],
      total: 56.95,
      status: 'Pending',
      orderTime: '2024-01-15 14:45',
      tableNumber: 8,
      notes: 'No salt on fish'
    }
  ]);

  const [activeTab, setActiveTab] = useState('orders');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrder, setNewOrder] = useState({
    customer: '',
    tableNumber: '',
    items: [],
    notes: ''
  });

  const menuItems = [
    { id: 1, name: 'Chicken Burger', price: 12.99, category: 'Burgers' },
    { id: 2, name: 'Caesar Salad', price: 8.99, category: 'Salads' },
    { id: 3, name: 'Pasta Carbonara', price: 14.99, category: 'Pasta' },
    { id: 4, name: 'Fish & Chips', price: 16.99, category: 'Seafood' },
    { id: 5, name: 'Chocolate Cake', price: 6.99, category: 'Desserts' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircleIcon className="h-5 w-5" />;
      case 'Processing': return <ClockIcon className="h-5 w-5" />;
      case 'Pending': return <ClockIcon className="h-5 w-5" />;
      case 'Cancelled': return <XCircleIcon className="h-5 w-5" />;
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const calculateTotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const renderOrders = () => (
    <div className="space-y-6">
      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {orders.filter(order => order.status === 'Pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-2xl font-semibold text-gray-900">
                {orders.filter(order => order.status === 'Processing').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {orders.filter(order => order.status === 'Completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Orders</h3>
            <button
              onClick={() => setShowOrderModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>New Order</span>
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {orders.map((order) => (
            <div key={order.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{order.id}</h4>
                    <p className="text-sm text-gray-600">Customer: {order.customer}</p>
                    <p className="text-sm text-gray-600">Table: {order.tableNumber} • {order.orderTime}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {order.items.length} items • ${order.total.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Processing')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Process
                      </button>
                    )}
                    {order.status === 'Processing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Completed')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBillGeneration = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Bill Generation</h3>
          <p className="text-gray-600">Generate and manage bills for completed orders</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
          <DocumentTextIcon className="h-5 w-5" />
          <span>Generate Bill</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">Recent Bills</h4>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {orders.filter(order => order.status === 'Completed').map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{order.id}</p>
                  <p className="text-sm text-gray-600">{order.customer} • Table {order.tableNumber}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-900">${order.total.toFixed(2)}</span>
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                    View Bill
                  </button>
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                    Print
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderExpenseLogging = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Expense Logging</h3>
          <p className="text-gray-600">Track and manage business expenses</p>
        </div>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2">
          <PlusIcon className="h-5 w-5" />
          <span>Add Expense</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Today's Expenses</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Food Supplies</span>
              <span className="font-medium">$245.50</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Utilities</span>
              <span className="font-medium">$85.25</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Equipment</span>
              <span className="font-medium">$120.00</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>$450.75</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">This Week</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Monday</span>
              <span className="font-medium">$425.50</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tuesday</span>
              <span className="font-medium">$380.25</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Wednesday</span>
              <span className="font-medium">$445.00</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>$1,250.75</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Categories</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Food & Supplies</span>
              <span className="font-medium">65%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Utilities</span>
              <span className="font-medium">20%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Equipment</span>
              <span className="font-medium">15%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600">Manage orders, generate bills, and track expenses</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('bills')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bills'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bill Generation
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'expenses'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Expense Logging
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'orders' && renderOrders()}
      {activeTab === 'bills' && renderBillGeneration()}
      {activeTab === 'expenses' && renderExpenseLogging()}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Order Details - {selectedOrder.id}</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                    <p className="text-sm text-gray-900">{selectedOrder.customer}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Table Number</label>
                    <p className="text-sm text-gray-900">{selectedOrder.tableNumber}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Items</label>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{item.name} x {item.quantity}</span>
                        <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedOrder.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-sm text-gray-900">{selectedOrder.notes}</p>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total</span>
                    <span className="text-lg font-bold">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
                {selectedOrder.status === 'Pending' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'Processing');
                      setSelectedOrder(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Start Processing
                  </button>
                )}
                {selectedOrder.status === 'Processing' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'Completed');
                      setSelectedOrder(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
