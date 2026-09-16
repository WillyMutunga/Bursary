import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { api } from '../api/client';
import {
  Building2, Plus, Edit2, Trash2, CheckCircle2, AlertCircle,
  X, MapPin, Phone, Mail, User, Shield, Layers, DollarSign, Save
} from 'lucide-react';

export default function ConstituencyManagementModal({ isOpen, onClose }) {
  const { availableConstituencies, reloadAllConstituencies, selectConstituency } = useTenant();

  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create' | 'edit' | 'wards'
  const [selectedConst, setSelectedConst] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State for New / Edit Constituency
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    county: 'Makueni County',
    mp_name: '',
    mp_title: 'Member of National Assembly',
    mp_message: '',
    fund_account_manager: '',
    office_postal_address: '',
    office_location: '',
    office_email: '',
    office_phone: '',
    primary_color: '#0B6B3A',
    // Initial Wards (comma or line separated for convenience)
    wards_input: '',
    // Initial Admin Account
    admin_name: '',
    admin_email: '',
    admin_password: 'William#20',
    admin_phone: '',
  });

  // Ward Add Form State
  const [wardForm, setWardForm] = useState({
    name: '',
    code: '',
    representative_name: '',
    budget_allocation: 5000000,
    population: 40000,
  });

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setFormData({
      name: '',
      code: '',
      county: 'Nairobi County',
      mp_name: '',
      mp_title: 'Member of National Assembly',
      mp_message: 'Committed to empowering all deserving students in our constituency through accessible bursaries.',
      fund_account_manager: 'Constituency Fund Account Manager',
      office_postal_address: 'P.O. Box Accredited',
      office_location: 'NG-CDF Constituency Office',
      office_email: '',
      office_phone: '+254 700 000 000',
      primary_color: '#0B6B3A',
      wards_input: 'Ward 1, Ward 2, Ward 3, Ward 4',
      admin_name: '',
      admin_email: '',
      admin_password: 'William#20',
      admin_phone: '',
    });
    setSuccessMsg('');
    setErrorMsg('');
    setActiveTab('create');
  };

  const handleStartEdit = (c) => {
    setSelectedConst(c);
    setFormData({
      name: c.name || '',
      code: c.code || '',
      county: c.county || '',
      mp_name: c.mp_name || '',
      mp_title: c.mp_title || 'Member of National Assembly',
      mp_message: c.mp_message || '',
      fund_account_manager: c.fund_account_manager || '',
      office_postal_address: c.office_postal_address || '',
      office_location: c.office_location || '',
      office_email: c.office_email || '',
      office_phone: c.office_phone || '',
      primary_color: c.primary_color || '#0B6B3A',
      wards_input: '',
      admin_name: '',
      admin_email: '',
      admin_password: '',
      admin_phone: '',
    });
    setSuccessMsg('');
    setErrorMsg('');
    setActiveTab('edit');
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Parse wards
      const wardNames = formData.wards_input
        ? formData.wards_input.split(/[\n,]+/).map(w => w.trim()).filter(Boolean)
        : [];

      const payload = {
        name: formData.name,
        code: formData.code,
        county: formData.county,
        mp_name: formData.mp_name,
        mp_title: formData.mp_title,
        mp_message: formData.mp_message,
        fund_account_manager: formData.fund_account_manager,
        office_postal_address: formData.office_postal_address,
        office_location: formData.office_location,
        office_email: formData.office_email,
        office_phone: formData.office_phone,
        primary_color: formData.primary_color,
        wards: wardNames.map(w => ({ name: w })),
        admin_name: formData.admin_name,
        admin_email: formData.admin_email,
        admin_password: formData.admin_password,
        admin_phone: formData.admin_phone,
      };

      const res = await api.post('/constituencies', payload);
      if (res && (res.success || res.data)) {
        setSuccessMsg(`Constituency "${formData.name}" registered successfully!`);
        await reloadAllConstituencies();
        if (res.data) selectConstituency(res.data);
        setTimeout(() => {
          setActiveTab('list');
          setSuccessMsg('');
        }, 1500);
      } else {
        setErrorMsg(res?.message || 'Failed to register constituency.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Error onboarding constituency.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedConst) return;
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.put(`/constituencies/${selectedConst.id}`, formData);
      if (res && (res.success || res.data)) {
        setSuccessMsg(`Constituency "${formData.name}" updated successfully!`);
        await reloadAllConstituencies();
        if (res.data) selectConstituency(res.data);
        setTimeout(() => {
          setActiveTab('list');
          setSuccessMsg('');
        }, 1500);
      } else {
        setErrorMsg(res?.message || 'Failed to update constituency.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Error updating constituency.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddWardSubmit = async (e) => {
    e.preventDefault();
    if (!selectedConst) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.post(`/constituencies/${selectedConst.id}/wards`, wardForm);
      if (res && (res.success || res.data)) {
        setSuccessMsg(`Ward "${wardForm.name}" added successfully!`);
        setWardForm({
          name: '',
          code: '',
          representative_name: '',
          budget_allocation: 5000000,
          population: 40000,
        });
        await reloadAllConstituencies();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Error adding ward.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-[#0B6B3A] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#D4A72C]" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Multi-Tenancy & Constituencies Master</h2>
              <p className="text-slate-300 text-xs">
                Register, brand, and manage NG-CDF constituencies across Kenya.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 text-xs font-bold gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2.5 rounded-t-xl transition-colors ${
              activeTab === 'list'
                ? 'bg-white text-[#0B6B3A] border-t-2 border-[#0B6B3A] shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Constituencies Directory ({availableConstituencies.length})
          </button>
          <button
            onClick={handleStartCreate}
            className={`px-4 py-2.5 rounded-t-xl flex items-center gap-1.5 transition-colors ${
              activeTab === 'create'
                ? 'bg-white text-[#0B6B3A] border-t-2 border-[#0B6B3A] shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Onboard New Constituency</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* 1. LIST TAB */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500">
                  Select a constituency to edit its branding, MP details, contacts, or manage its wards.
                </p>
                <button
                  onClick={handleStartCreate}
                  className="bg-[#0B6B3A] hover:bg-[#084e2a] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Constituency</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableConstituencies.map((c) => (
                  <div
                    key={c.id || c.code}
                    className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-[#0B6B3A]/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {c.code || 'CDF'}
                          </span>
                          <h3 className="font-bold text-slate-900 text-base mt-1">
                            {c.name}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>{c.county || 'Kenya'}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleStartEdit(c)}
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Edit Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1 my-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Patron / MP:</span>
                          <span className="font-semibold text-slate-800">{c.mp_name || 'Not Set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Postal Address:</span>
                          <span className="font-mono text-slate-700 truncate max-w-[180px]">{c.office_postal_address || 'P.O. Box'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Phone:</span>
                          <span className="text-slate-700">{c.office_phone || 'None'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          selectConstituency(c);
                          onClose();
                        }}
                        className="text-[#0B6B3A] font-bold hover:underline"
                      >
                        Switch View to this Tenant →
                      </button>
                      <button
                        onClick={() => {
                          setSelectedConst(c);
                          setActiveTab('wards');
                        }}
                        className="text-slate-600 hover:text-slate-900 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg"
                      >
                        Wards ({c.wards_count !== undefined ? c.wards_count : (c.wards?.length || 0)})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. CREATE / EDIT TAB */}
          {(activeTab === 'create' || activeTab === 'edit') && (
            <form onSubmit={activeTab === 'create' ? handleCreateSubmit : handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Constituency Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Kibwezi West, Dagoretti North"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B6B3A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Constituency Code *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={activeTab === 'edit'}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. KBW-015, DGN-020"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-[#0B6B3A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    County *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.county}
                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                    placeholder="e.g. Makueni County, Nairobi County"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B6B3A] outline-none"
                  />
                </div>
              </div>

              {/* MP Details & Branding */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Patron / Member of Parliament Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Hon. MP Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.mp_name}
                      onChange={(e) => setFormData({ ...formData, mp_name: e.target.value })}
                      placeholder="e.g. Hon. Dr. Mwengi Mutuse, MP"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B6B3A] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Fund Account Manager Name / Title
                    </label>
                    <input
                      type="text"
                      value={formData.fund_account_manager}
                      onChange={(e) => setFormData({ ...formData, fund_account_manager: e.target.value })}
                      placeholder="e.g. Constituency Fund Account Manager"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B6B3A] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    MP Welcome / Patron Message (Reflects on Homepage)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.mp_message}
                    onChange={(e) => setFormData({ ...formData, mp_message: e.target.value })}
                    placeholder="Message to students and parents..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B6B3A] outline-none"
                  />
                </div>
              </div>

              {/* Office Contacts & Postal Address */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Official Office Contacts & Letterhead
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Official Postal Address (Reflects on Award Letters)
                    </label>
                    <input
                      type="text"
                      value={formData.office_postal_address}
                      onChange={(e) => setFormData({ ...formData, office_postal_address: e.target.value })}
                      placeholder="e.g. P.O. Box 128 - 90137, Kibwezi, Kenya"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B6B3A] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Physical Office Location
                    </label>
                    <input
                      type="text"
                      value={formData.office_location}
                      onChange={(e) => setFormData({ ...formData, office_location: e.target.value })}
                      placeholder="e.g. NG-CDF Office Building, Makindu"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B6B3A] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Office Telephone
                    </label>
                    <input
                      type="text"
                      value={formData.office_phone}
                      onChange={(e) => setFormData({ ...formData, office_phone: e.target.value })}
                      placeholder="e.g. +254 700 000 000"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B6B3A] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Official Support Email
                    </label>
                    <input
                      type="email"
                      value={formData.office_email}
                      onChange={(e) => setFormData({ ...formData, office_email: e.target.value })}
                      placeholder="e.g. info@kibweziwest-ngcdf.go.ke"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B6B3A] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Initial Wards (Only in Create Mode) */}
              {activeTab === 'create' && (
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Constituency Wards
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    Enter the names of wards for this constituency separated by commas (e.g. "Makindu, Nguumo, Kikumbulyu North, Emali"):
                  </p>
                  <input
                    type="text"
                    value={formData.wards_input}
                    onChange={(e) => setFormData({ ...formData, wards_input: e.target.value })}
                    placeholder="Ward 1, Ward 2, Ward 3, Ward 4..."
                    className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B6B3A] outline-none"
                  />
                </div>
              )}

              {/* Initial Admin Staff User (Only in Create Mode) */}
              {activeTab === 'create' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Initial Fund Account Manager / Admin Account (Optional)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Admin Email
                      </label>
                      <input
                        type="email"
                        value={formData.admin_email}
                        onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                        placeholder="manager@constituency.go.ke"
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Admin Name
                      </label>
                      <input
                        type="text"
                        value={formData.admin_name}
                        onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                        placeholder="e.g. John Musyoka"
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Initial Password
                      </label>
                      <input
                        type="text"
                        value={formData.admin_password}
                        onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#0B6B3A] hover:bg-[#084e2a] text-white px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : activeTab === 'create' ? 'Complete Onboarding' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {/* 3. WARDS MANAGEMENT TAB */}
          {activeTab === 'wards' && selectedConst && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Wards for {selectedConst.name} ({selectedConst.code})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage electoral wards and their respective budget allocations for this constituency.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('list')}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl"
                >
                  ← Back to List
                </button>
              </div>

              {/* Add Ward Form */}
              <form onSubmit={handleAddWardSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  + Add New Ward
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Ward Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={wardForm.name}
                      onChange={(e) => setWardForm({ ...wardForm, name: e.target.value })}
                      placeholder="e.g. Makindu Ward"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      MCA / Ward Representative
                    </label>
                    <input
                      type="text"
                      value={wardForm.representative_name}
                      onChange={(e) => setWardForm({ ...wardForm, representative_name: e.target.value })}
                      placeholder="Hon. Ward Rep"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Budget Allocation (KSh)
                    </label>
                    <input
                      type="number"
                      value={wardForm.budget_allocation}
                      onChange={(e) => setWardForm({ ...wardForm, budget_allocation: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#0B6B3A] text-white px-4 py-1.5 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Ward to Constituency'}
                </button>
              </form>

              {/* Existing Wards List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Existing Wards ({selectedConst.wards?.length || 0})
                </div>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {(selectedConst.wards || []).map((w, idx) => (
                    <div key={w.id || idx} className="p-3.5 bg-white flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-900">{w.name}</span>
                        <span className="ml-2 font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {w.code}
                        </span>
                        {w.representative_name && (
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Representative: {w.representative_name}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-800 font-mono">
                          KSh {Number(w.budget_allocation || 0).toLocaleString()}
                        </span>
                        <p className="text-[10px] text-slate-400">Annual Ward Cap</p>
                      </div>
                    </div>
                  ))}
                  {(!selectedConst.wards || selectedConst.wards.length === 0) && (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No wards registered for this constituency yet. Use the form above to add wards.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
