import React from 'react'

const StatusBadge = ({ status }) => {
  let styles = ''
  let text = ''

  switch (status?.toLowerCase()) {
    case 'approved':
      styles = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      text = 'Approved'
      break
    case 'rejected':
      styles = 'bg-red-500/10 text-red-400 border border-red-500/20'
      text = 'Rejected'
      break
    case 'pending':
    default:
      styles = 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      text = 'Pending Review'
      break
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {text}
    </span>
  )
}

export default StatusBadge
