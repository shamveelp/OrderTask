"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useWebSocket } from '@/hooks/useWebSockets';
import { Search, Plus, Filter, ArrowRight, Loader2, X, Dices } from 'lucide-react';

interface Order {
  id: number;
  customer_name: string;
  amount: number;
  status: string;
  created_at: string;
  amount_usd?: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Create Order Form State
  const [newCustomer, setNewCustomer] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [creating, setCreating] = useState(false);
  
  const { messages } = useWebSocket();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'new_order') {
        // Prevent duplicate if we just created it
        setOrders(prev => {
          if (prev.find(o => o.id === lastMessage.data.id)) return prev;
          return [lastMessage.data, ...prev];
        });
      } else if (lastMessage.type === 'update_order') {
        setOrders(prev => prev.map(o => o.id === lastMessage.data.id ? { ...o, status: lastMessage.data.status } : o));
      }
    }
  }, [messages]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await api.post('/orders', {
        customer_name: newCustomer,
        amount: parseFloat(newAmount),
        status: 'Pending'
      });
      // WebSockets will broadcast this, but we can optimistically update
      setOrders(prev => {
        if (prev.find(o => o.id === response.data.id)) return prev;
        return [response.data, ...prev];
      });
      setIsCreateModalOpen(false);
      setNewCustomer('');
      setNewAmount('');
    } catch (error) {
      console.error('Failed to create order', error);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await api.put(`/orders/${id}`, { status: newStatus });
      // WS will broadcast to others. Local optimistic update is handled by the server response and broadcast
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error('Failed to update order status', error);
    }
  };

  const handleRandomCustomer = async () => {
    try {
      const response = await api.get('/orders/random-customer');
      setNewCustomer(response.data.name);
    } catch (error) {
      console.error('Failed to fetch random customer', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto w-full relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Order Management</h1>
          <p className="text-zinc-400">View, create and update all orders.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Order
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search by ID or Customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-zinc-500" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-900/80 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none min-w-[150px]"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center">
            <div className="bg-zinc-800/50 p-4 rounded-full mb-4">
              <Search className="h-8 w-8 text-zinc-600" />
            </div>
            <p>No orders found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-zinc-800 text-sm font-medium text-zinc-400 bg-zinc-900/80">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Created At</th>
                  <th className="py-4 px-6">Base Amount (INR)</th>
                  <th className="py-4 px-6">Amount (USD)</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-zinc-300">#{order.id}</td>
                    <td className="py-4 px-6 text-zinc-100">{order.customer_name}</td>
                    <td className="py-4 px-6 text-zinc-400 text-sm">
                      {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="py-4 px-6 text-zinc-300">
                      ₹{order.amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 font-medium text-emerald-400">
                      ${order.amount_usd ? order.amount_usd.toFixed(2) : 'Loading...'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                        ${order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          order.status === 'Processing' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right flex items-center justify-end gap-2">
                      <select 
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className="bg-zinc-950 border border-zinc-700 rounded-md px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Pending">Set Pending</option>
                        <option value="Processing">Set Processing</option>
                        <option value="Completed">Set Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">Create New Order</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateOrder} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5 flex justify-between items-center">
                  <span>Customer Name</span>
                  <button 
                    type="button" 
                    onClick={handleRandomCustomer}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    title="Generate from Random User API"
                  >
                    <Dices className="h-3 w-3" /> Randomize
                  </button>
                </label>
                <input 
                  type="text"
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Amount (INR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">₹</span>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-2">Will be automatically converted to USD on display.</p>
              </div>
              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
