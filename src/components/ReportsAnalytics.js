import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  CalendarIcon, 
  DocumentTextIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const ReportsAnalytics = () => {
  const [activeReport, setActiveReport] = useState('daily');
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const dailyData = {
    revenue: 1250.50,
    orders: 45,
    averageOrderValue: 27.79,
    topSellingItems: [
      { name: 'Chicken Burger', sold: 15, revenue: 194.85 },
      { name: 'Caesar Salad', sold: 12, revenue: 107.88 },
      { name: 'Pasta Carbonara', sold: 8, revenue: 119.92 },
      { name: 'Fish & Chips', sold: 6, revenue: 101.94 },
      { name: 'Chocolate Cake', sold: 4, revenue: 27.96 }
    ],
    hourlySales: [
      { hour: '9:00', sales: 120.50 },
      { hour: '10:00', sales: 85.25 },
      { hour: '11:00', sales: 195.75 },
      { hour: '12:00', sales: 320.00 },
      { hour: '13:00', sales: 285.50 },
      { hour: '14:00', sales: 180.25 },
      { hour: '15:00', sales: 95.75 },
      { hour: '16:00', sales: 45.50 }
    ],
    expenses: 245.50,
    profit: 1005.00
  };

  const weeklyData = {
    revenue: 8750.25,
    orders: 315,
    averageOrderValue: 27.78,
    dailyBreakdown: [
      { day: 'Monday', revenue: 1250.50, orders: 45 },
      { day: 'Tuesday', revenue: 1180.25, orders: 42 },
      { day: 'Wednesday', revenue: 1320.75, orders: 48 },
      { day: 'Thursday', revenue: 1450.00, orders: 52 },
      { day: 'Friday', revenue: 1680.50, orders: 58 },
      { day: 'Saturday', revenue: 1890.25, orders: 65 },
      { day: 'Sunday', revenue: 1878.00, orders: 65 }
    ],
    expenses: 1750.25,
    profit: 7000.00
  };

  const monthlyData = {
    revenue: 37500.75,
    orders: 1350,
    averageOrderValue: 27.78,
    weeklyBreakdown: [
      { week: 'Week 1', revenue: 8750.25, orders: 315 },
      { week: 'Week 2', revenue: 9200.50, orders: 330 },
      { week: 'Week 3', revenue: 8950.00, orders: 320 },
      { week: 'Week 4', revenue: 10600.00, orders: 385 }
    ],
    expenses: 7500.15,
    profit: 30000.60
  };

  const getCurrentData = () => {
    switch (activeReport) {
      case 'daily': return dailyData;
      case 'weekly': return weeklyData;
      case 'monthly': return monthlyData;
      default: return dailyData;
    }
  };

  const renderDailyReport = () => {
    const data = getCurrentData();
    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">${data.revenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{data.orders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUpIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-semibold text-gray-900">${data.averageOrderValue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUpIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profit</p>
                <p className="text-2xl font-semibold text-gray-900">${data.profit.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {activeReport === 'daily' ? 'Hourly Sales' : activeReport === 'weekly' ? 'Daily Sales' : 'Weekly Sales'}
              </h3>
            </div>
            <div className="p-6">
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Chart visualization will be implemented here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Top Selling Items</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {data.topSellingItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{item.sold} sold</p>
                      <p className="text-xs text-gray-500">${item.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        {activeReport === 'weekly' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Weekly Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Order</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.dailyBreakdown.map((day, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{day.day}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${day.revenue.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.orders}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${(day.revenue / day.orders).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReport === 'monthly' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Monthly Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Order</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.weeklyBreakdown.map((week, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{week.week}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${week.revenue.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{week.orders}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${(week.revenue / week.orders).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Comprehensive reporting and analytics dashboard</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <DocumentTextIcon className="h-5 w-5" />
            <span>Export Report</span>
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Schedule Report</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveReport('daily')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeReport === 'daily'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Daily Report
          </button>
          <button
            onClick={() => setActiveReport('weekly')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeReport === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Weekly Report
          </button>
          <button
            onClick={() => setActiveReport('monthly')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeReport === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Monthly Report
          </button>
        </div>
      </div>

      {/* Report Content */}
      {renderDailyReport()}

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Peak Hour</span>
              <span className="font-medium">12:00 PM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Busiest Day</span>
              <span className="font-medium">Saturday</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Customer Satisfaction</span>
              <span className="font-medium text-green-600">4.8/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Order Accuracy</span>
              <span className="font-medium text-green-600">98.5%</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-medium text-green-600">${getCurrentData().revenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Expenses</span>
              <span className="font-medium text-red-600">${getCurrentData().expenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Net Profit</span>
              <span className="font-medium text-green-600">${getCurrentData().profit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Profit Margin</span>
              <span className="font-medium text-green-600">{((getCurrentData().profit / getCurrentData().revenue) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Inventory Insights */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Insights</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Low Stock Items</span>
              <span className="font-medium text-yellow-600">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Out of Stock</span>
              <span className="font-medium text-red-600">1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Inventory Value</span>
              <span className="font-medium">$2,450.75</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Turnover Rate</span>
              <span className="font-medium text-green-600">4.2x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
