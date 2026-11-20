import React from 'react';

export default function Badge({ children, status, size = 'md', className = '' }) {
  const norm = (status || children || '').toString().toLowerCase();

  let styles = 'bg-[#EFE7D5] text-text-main border-[#D4CBBA]';

  if (norm.includes('completed') || norm.includes('verified') || norm.includes('active')) {
    styles = 'bg-[#EDF7ED] text-[#1E4620] border-[#C8E6C9]';
  } else if (norm.includes('in progress') || norm.includes('work started') || norm.includes('on the way')) {
    styles = 'bg-[#E3F2FD] text-[#0D47A1] border-[#BBDEFB]';
  } else if (norm.includes('confirmed') || norm.includes('assigned') || norm.includes('accepted')) {
    styles = 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]';
  } else if (norm.includes('pending')) {
    styles = 'bg-[#FFF8E1] text-[#B78103] border-[#FFE082]';
  } else if (norm.includes('cancelled') || norm.includes('rejected') || norm.includes('suspended')) {
    styles = 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]';
  }

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeStyles} ${styles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {children}
    </span>
  );
}
