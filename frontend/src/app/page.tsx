"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useWebSocket } from '@/hooks/useWebSockets';
import { ShoppingCart, Clock, CheckCircle, Package, CloudSun } from 'lucide-react';

interface Order {
  id: number;
  customer_name: string;
  amount: number;
  status: string;
  created_at: string;
  amount_usd?: number;
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<string>('Loading...');
  const { messages } = useWebSocket();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'new_order') {
        setOrders(prev => [lastMessage.data, ...prev]);
      } else if (lastMessage.type === 'update_order') {
        setOrders(prev => prev.map(o => o.id === lastMessage.data.id ? { ...o, status: lastMessage.data.status } : o));
      }
    }
  }, [messages]);

  const fetchOrders = async () => {
    try {
      const [ordersRes, summaryRes] = await Promise.all([
        api.get('/orders'),
        api.get('/dashboard/summary')
      ]);
      setOrders(ordersRes.data);
      setWeather(summaryRes.data.weather);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const processingOrders = orders.filter(o => o.status === 'Processing').length;
  const completedOrders = orders.filter(o => o.status === 'Completed').length;
  
  const totalRevenueUSD = orders.reduce((acc, curr) => acc + (curr.amount_usd || 0), 0);
  const totalRevenueINR = orders.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  if (loading) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Orders', value: totalOrders, icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Pending', value: pendingOrders, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Processing', value: processingOrders, icon: ShoppingCart, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Completed', value: completedOrders, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-zinc-400">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-3 flex items-center gap-4">
            <span className="text-zinc-400 text-sm font-medium">Revenue (INR)</span>
            <span className="text-2xl font-bold text-emerald-400">
              ₹{totalRevenueINR.toFixed(2)}
            </span>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-3 flex items-center gap-4 hidden sm:flex">
            <span className="text-zinc-400 text-sm font-medium">Revenue (USD)</span>
            <span className="text-2xl font-bold text-indigo-400">
              ${totalRevenueUSD.toFixed(2)}
            </span>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-3 flex items-center gap-4 hidden md:flex">
            <span className="text-zinc-400 text-sm font-medium flex items-center gap-2">
              <CloudSun className="h-4 w-4" />
              Weather (Delhi)
            </span>
            <span className="text-xl font-bold text-blue-400">
              {weather}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-sm hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
          Recent Activity
        </h2>
        
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No recent orders.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-sm font-medium text-zinc-400">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Amount (INR)</th>
                  <th className="py-4 px-6 text-right">Amount (USD)</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 px-6 text-zinc-300">#{order.id}</td>
                    <td className="py-4 px-6 font-medium text-zinc-100">{order.customer_name}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                        ${order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          order.status === 'Processing' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-zinc-300 font-medium">
                      ₹{order.amount ? order.amount.toFixed(2) : '0.00'}
                    </td>
                    <td className="py-4 px-6 text-right text-emerald-400 font-medium">
                      ${order.amount_usd ? order.amount_usd.toFixed(2) : '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
