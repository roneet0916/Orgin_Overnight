import React, { useEffect, useState } from 'react';
import { getClaims, getStates, getDistrictsByState, getClaimDetails, analyzeClaim } from '../services/api';
import ClaimTable from '../components/ClaimTable';
import FilterBar from '../components/FilterBar';
import ClaimDetails from '../components/ClaimDetails';
import Loading from '../components/Loading';
import { FileText, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

const Claims = () => {
  const [claims, setClaims] = useState([]);
  const [totalClaims, setTotalClaims] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');

  // Metadata
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  // Modal
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    if (selectedState !== 'All') {
      fetchDistricts(selectedState);
    } else {
      setDistricts([]);
    }
  }, [selectedState]);

  useEffect(() => {
    fetchClaimsData();
  }, [page, search, selectedState, selectedDistrict, selectedStatus, selectedRisk]);

  const fetchStates = async () => {
    try {
      const data = await getStates();
      setStates(data);
    } catch (err) {
      console.error('Error fetching states:', err);
    }
  };

  const fetchDistricts = async (stateName) => {
    try {
      const data = await getDistrictsByState(stateName);
      setDistricts(data);
    } catch (err) {
      console.error('Error fetching districts:', err);
    }
  };

  const fetchClaimsData = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        search: search || undefined,
        state: selectedState !== 'All' ? selectedState : undefined,
        district: selectedDistrict !== 'All' ? selectedDistrict : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        risk: selectedRisk !== 'All' ? selectedRisk : undefined,
      };

      const res = await getClaims(params);
      setClaims(res.claims);
      setTotalClaims(res.total);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClaim = async (claimId) => {
    try {
      const data = await getClaimDetails(claimId);
      setSelectedClaim(data);
    } catch (err) {
      console.error('Error opening claim detail:', err);
    }
  };

  const handleReanalyze = async (claimId) => {
    try {
      setIsAnalyzing(true);
      const res = await analyzeClaim(claimId);
      if (res.updated_claim) {
        setSelectedClaim(res.updated_claim);
      }
      fetchClaimsData();
    } catch (err) {
      console.error('Error re-analyzing claim:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedState('All');
    setSelectedDistrict('All');
    setSelectedStatus('All');
    setSelectedRisk('All');
    setPage(1);
  };

  const triggerDemoSearch = (claimId) => {
    setSearch(claimId);
    handleSelectClaim(claimId);
  };

  return (
    <div className="space-y-6 pb-16 animate-reveal">
      {/* Title & Hackathon Shortcuts */}
      <div className="forest-card p-8 border border-[#a3b18a]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-[#fefae0] uppercase tracking-wide leading-none flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#ccd5ae]" />
            Forest Rights Claims Registry
          </h1>
          <p className="text-xs text-[#a3b18a] font-medium tracking-[0.2em] uppercase mt-2">
            Master Claims Records • Automated Land Discrepancy Auditing
          </p>
        </div>

        {/* Demo Fast Triggers */}
        <div className="flex items-center gap-2 bg-[#022317] border border-[#134934] p-2 rounded-full">
          <span className="text-[10px] font-bold text-[#a3b18a] px-2 uppercase tracking-[0.2em] flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#ccd5ae]" /> Demo Inspect:
          </span>
          <button
            onClick={() => triggerDemoSearch('FRA-1025')}
            className="px-3.5 py-1.5 rounded-full bg-[#01472e] text-[#fefae0] border border-[#a3b18a]/40 text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-[#a3b18a] hover:text-[#01472e] transition-all shadow-forest-lg"
          >
            FRA-1025 (High Risk)
          </button>
          <button
            onClick={() => triggerDemoSearch('FRA-1001')}
            className="px-3.5 py-1.5 rounded-full bg-[#01472e] text-[#ccd5ae] border border-[#134934] text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-[#a3b18a] hover:text-[#01472e] transition-all"
          >
            FRA-1001 (Approved)
          </button>
        </div>
      </div>

      {/* Filter Component */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedRisk={selectedRisk}
        setSelectedRisk={setSelectedRisk}
        states={states}
        districts={districts}
        onReset={handleResetFilters}
      />

      {/* Table Section */}
      {loading ? (
        <Loading message="Filtering master claims database..." />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.25em] text-[#a3b18a] px-2">
            <span>Showing {claims.length} of {totalClaims} total filings</span>
            <span>Page {page} of {totalPages}</span>
          </div>

          <ClaimTable
            claims={claims}
            onSelectClaim={handleSelectClaim}
            onAnalyzeClaim={handleReanalyze}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-3 rounded-full bg-[#063020] border border-[#134934] text-[#ccd5ae] hover:bg-[#01472e] disabled:opacity-40 transition-all shadow-forest-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#fefae0]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-3 rounded-full bg-[#063020] border border-[#134934] text-[#ccd5ae] hover:bg-[#01472e] disabled:opacity-40 transition-all shadow-forest-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {selectedClaim && (
        <ClaimDetails
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onReanalyze={handleReanalyze}
          isAnalyzing={isAnalyzing}
        />
      )}
    </div>
  );
};

export default Claims;
