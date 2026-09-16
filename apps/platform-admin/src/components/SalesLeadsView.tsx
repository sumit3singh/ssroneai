import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  RefreshCw, 
  Calendar, 
  Phone, 
  Mail, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ArrowUpRight, 
  Send, 
  UserCheck, 
  Archive,
  MessageCircle,
  FileText,
  X
} from 'lucide-react';
import { LeadInquiry } from '../types';
import { platformAdminApi } from '../api/platformAdmin.api';

interface SalesLeadsViewProps {
  leads: LeadInquiry[];
  onRefresh: () => void;
  isLoading?: boolean;
}

export const SalesLeadsView: React.FC<SalesLeadsViewProps> = ({
  leads,
  onRefresh,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [verticalFilter, setVerticalFilter] = useState<string>('ALL');
  const [selectedLead, setSelectedLead] = useState<LeadInquiry | null>(null);
  const [operatorNotes, setOperatorNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Compute Summary Metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'NEW').length;
  const contactedLeads = leads.filter(l => l.status === 'CONTACTED').length;
  const scheduledLeads = leads.filter(l => l.status === 'DEMO_SCHEDULED').length;
  const convertedLeads = leads.filter(l => l.status === 'CONVERTED').length;

  // Filtered Leads List
  const filteredLeads = leads.filter(lead => {
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    const matchesVertical = verticalFilter === 'ALL' || lead.vertical.toLowerCase() === verticalFilter.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      lead.full_name.toLowerCase().includes(query) ||
      lead.company_name.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.phone.toLowerCase().includes(query);
    return matchesStatus && matchesVertical && matchesSearch;
  });

  const handleStatusChange = async (leadId: number, newStatus: LeadInquiry['status'], notes?: string) => {
    setIsUpdating(true);
    try {
      await platformAdminApi.updateLeadStatus(leadId, newStatus, notes);
      onRefresh();
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(null);
      }
    } catch (err) {
      console.error("Error updating lead status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: LeadInquiry['status']) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            NEW UNCONTACTED
          </span>
        );
      case 'CONTACTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            CONTACTED
          </span>
        );
      case 'DEMO_SCHEDULED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1.5 w-fit">
            <Calendar className="w-3 h-3" />
            DEMO SCHEDULED
          </span>
        );
      case 'CONVERTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            CONVERTED TENANT
          </span>
        );
      case 'ARCHIVED':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20 flex items-center gap-1.5 w-fit">
            ARCHIVED
          </span>
        );
    }
  };

  const getVerticalBadge = (vertical: string) => {
    switch (vertical.toLowerCase()) {
      case 'restaurant':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">Restaurant POS</span>;
      case 'hotel':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">Hotel PMS</span>;
      case 'pg':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">PG Hostel</span>;
      case 'retail':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">Retail ERP</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{vertical.toUpperCase()}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      
      {/* ── 1. Page Header & KPI Summary Cards ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Sales Inquiries & Lead Follow-Up
            </h1>
            {newLeads > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold bg-amber-500 text-white shadow-2xs animate-pulse">
                {newLeads} NEW LEADS
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Real-time sales inquiries & demo booking requests submitted by visitors on SSR One AI Marketing Web.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-2xs self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Database Leads</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Inquiries */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col gap-2 shadow-2xs">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase">Total Inquiries</span>
            <MessageSquare className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {totalLeads}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Submitted via Marketing Portal
          </span>
        </div>

        {/* New Uncontacted */}
        <div className="bg-white dark:bg-slate-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col gap-2 shadow-2xs">
          <div className="flex justify-between items-center text-amber-600 dark:text-amber-400">
            <span className="text-[11px] font-mono font-bold uppercase">New Uncontacted</span>
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono flex items-center gap-2">
            {newLeads}
            {newLeads > 0 && <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">Action Required</span>}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Awaiting Operator Call / WhatsApp
          </span>
        </div>

        {/* Demos Scheduled */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col gap-2 shadow-2xs">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase">Demos Scheduled</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
            {scheduledLeads}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {contactedLeads} Additional Contacted
          </span>
        </div>

        {/* Converted Tenants */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col gap-2 shadow-2xs">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase">Converted Customers</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {convertedLeads}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0}% Conversion Rate
          </span>
        </div>

      </div>

      {/* ── 2. Filter & Search Controls ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-2xs">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lead name, company, phone, email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Filter Dropdowns & Status Tabs */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Vertical Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">Vertical:</span>
            <select
              value={verticalFilter}
              onChange={(e) => setVerticalFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Verticals</option>
              <option value="restaurant">Restaurant POS</option>
              <option value="hotel">Hotel PMS</option>
              <option value="pg">PG Hostel</option>
              <option value="retail">Retail ERP</option>
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {['ALL', 'NEW', 'CONTACTED', 'DEMO_SCHEDULED', 'CONVERTED'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-extrabold transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* ── 3. Leads Data Table ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-2xs">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
            <MessageSquare className="w-10 h-10 stroke-1" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No matching lead inquiries found.</p>
            <p className="text-xs text-slate-400">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Prospect & Company</th>
                  <th className="py-3.5 px-4">Contact Info & WhatsApp</th>
                  <th className="py-3.5 px-4">Vertical & Outlets</th>
                  <th className="py-3.5 px-4">Preferred Slot</th>
                  <th className="py-3.5 px-4">Inquiry Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredLeads.map((lead) => {
                  const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
                  const waUrl = `https://wa.me/${cleanPhone.length <= 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(`Hello ${lead.full_name}, thank you for inquiring about SSR One AI for ${lead.company_name}.`)}`;

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/50 transition-colors">
                      
                      {/* Prospect & Company */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {lead.full_name}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {lead.company_name}
                          </span>
                        </div>
                      </td>

                      {/* Contact Info & Direct WhatsApp */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-mono font-bold transition-all w-fit"
                            title="Direct 1-Click WhatsApp Chat"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{lead.phone}</span>
                            <ArrowUpRight className="w-3 h-3 opacity-60" />
                          </a>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {lead.email}
                          </span>
                        </div>
                      </td>

                      {/* Vertical & Outlets */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          {getVerticalBadge(lead.vertical)}
                          <span className="text-[10px] text-slate-500 font-mono">
                            {lead.outlet_count || '1-3 Outlets'}
                          </span>
                        </div>
                      </td>

                      {/* Preferred Slot */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-0.5 text-[11px]">
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {lead.preferred_date || 'Flexible'}
                          </span>
                          {lead.preferred_time && (
                            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {lead.preferred_time}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Inquiry Type */}
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          lead.inquiry_type === 'SALES_INQUIRY'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                            : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-800'
                        }`}>
                          {lead.inquiry_type === 'SALES_INQUIRY' ? 'Sales Inquiry' : 'Demo Request'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {getStatusBadge(lead.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Quick Change Status Buttons */}
                          {lead.status === 'NEW' && (
                            <button
                              onClick={() => handleStatusChange(lead.id, 'CONTACTED')}
                              disabled={isUpdating}
                              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-extrabold transition-all shadow-2xs cursor-pointer"
                            >
                              Mark Contacted
                            </button>
                          )}

                          {lead.status === 'CONTACTED' && (
                            <button
                              onClick={() => handleStatusChange(lead.id, 'DEMO_SCHEDULED')}
                              disabled={isUpdating}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-extrabold transition-all shadow-2xs cursor-pointer"
                            >
                              Schedule Demo
                            </button>
                          )}

                          {lead.status === 'DEMO_SCHEDULED' && (
                            <button
                              onClick={() => handleStatusChange(lead.id, 'CONVERTED')}
                              disabled={isUpdating}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                            >
                              <UserCheck className="w-3 h-3" />
                              Convert
                            </button>
                          )}

                          {/* Notes / Details Button */}
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setOperatorNotes(lead.operator_notes || '');
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                            title="View Details & Follow-up Notes"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 4. Operator Notes & Lead Detail Modal ── */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 flex flex-col gap-4 shadow-xl relative animate-in fade-in zoom-in duration-200">
            
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">LEAD INQUIRY DETAILS & OPERATOR FOLLOW-UP</span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {selectedLead.full_name} ({selectedLead.company_name})
              </h3>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs flex flex-col gap-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Phone / WhatsApp:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedLead.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedLead.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vertical & Outlets:</span>
                <span className="font-bold">{selectedLead.vertical.toUpperCase()} ({selectedLead.outlet_count || '1-3'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Preferred Slot:</span>
                <span className="font-bold">{selectedLead.preferred_date || 'Flexible'} {selectedLead.preferred_time || ''}</span>
              </div>
              {selectedLead.notes && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1">Customer Message:</span>
                  <p className="text-slate-800 dark:text-slate-200 italic">{selectedLead.notes}</p>
                </div>
              )}
            </div>

            {/* Operator Notes Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Superadmin Operator Follow-Up Notes:
              </label>
              <textarea
                rows={3}
                value={operatorNotes}
                onChange={(e) => setOperatorNotes(e.target.value)}
                placeholder="Enter call notes, demo outcome, custom pricing offer details..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>

            {/* Update Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleStatusChange(selectedLead.id, 'CONTACTED', operatorNotes)}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer"
                >
                  Contacted
                </button>
                <button
                  onClick={() => handleStatusChange(selectedLead.id, 'DEMO_SCHEDULED', operatorNotes)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                >
                  Demo Scheduled
                </button>
                <button
                  onClick={() => handleStatusChange(selectedLead.id, 'CONVERTED', operatorNotes)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                >
                  Converted
                </button>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
