export const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'Approved':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'Pending':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'Rejected':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
};

export const getRiskBadgeColor = (level) => {
  switch (level?.toUpperCase()) {
    case 'HIGH':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
    case 'MEDIUM':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    case 'LOW':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
  }
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};
