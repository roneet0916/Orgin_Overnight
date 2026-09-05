import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

const FilterBar = ({
  search,
  setSearch,
  selectedState,
  setSelectedState,
  selectedDistrict,
  setSelectedDistrict,
  selectedStatus,
  setSelectedStatus,
  selectedRisk,
  setSelectedRisk,
  states = [],
  districts = [],
  onReset
}) => {
  return (
    <div className="p-6 bg-[#063020] border border-[#134934] rounded-[2rem] shadow-forest-lg space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-3 w-4 h-4 text-[#a3b18a]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH BY CLAIM ID (FRA-1025), APPLICANT, DISTRICT..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#022317] border border-[#134934] text-xs font-semibold text-[#fefae0] placeholder-[#a3b18a]/60 uppercase tracking-[0.15em] focus:outline-none focus:border-[#a3b18a] transition-colors"
          />
        </div>

        {/* State Filter */}
        <div className="w-44">
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedDistrict('All');
            }}
            className="w-full px-4 py-2.5 rounded-full bg-[#022317] border border-[#134934] text-xs font-bold text-[#ccd5ae] uppercase tracking-[0.15em] focus:outline-none focus:border-[#a3b18a]"
          >
            <option value="All">All States</option>
            {states.map((s) => (
              <option key={s.id || s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* District Filter */}
        <div className="w-44">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full px-4 py-2.5 rounded-full bg-[#022317] border border-[#134934] text-xs font-bold text-[#ccd5ae] uppercase tracking-[0.15em] focus:outline-none focus:border-[#a3b18a]"
          >
            <option value="All">All Districts</option>
            {districts.map((d) => (
              <option key={d.id || d.name} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-36">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2.5 rounded-full bg-[#022317] border border-[#134934] text-xs font-bold text-[#ccd5ae] uppercase tracking-[0.15em] focus:outline-none focus:border-[#a3b18a]"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Risk Filter */}
        <div className="w-36">
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="w-full px-4 py-2.5 rounded-full bg-[#022317] border border-[#134934] text-xs font-bold text-[#ccd5ae] uppercase tracking-[0.15em] focus:outline-none focus:border-[#a3b18a]"
          >
            <option value="All">All Risk</option>
            <option value="HIGH">HIGH Risk</option>
            <option value="MEDIUM">MEDIUM Risk</option>
            <option value="LOW">LOW Risk</option>
          </select>
        </div>

        {/* Reset Filters */}
        <button
          onClick={onReset}
          className="px-4 py-2.5 rounded-full bg-[#01472e] hover:bg-[#a3b18a] hover:text-[#01472e] text-[#fefae0] text-[10px] font-bold uppercase tracking-[0.25em] flex items-center gap-2 transition-all ml-auto shadow-forest-lg border border-[#a3b18a]/30"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
