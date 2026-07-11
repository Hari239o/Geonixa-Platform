"use client"
import React from 'react'

export default function VerificationPage() {
  const data = [
    { id: '1', user: 'John Doe', email: 'john.doe@email.com', type: 'Passport', status: 'Pending', date: '2023-11-01', avatar: '/placeholder.png' },
    { id: '2', user: 'John Doe', email: 'john.doe@email.com', type: 'Passport', status: 'Pending', date: '2023-11-01', avatar: '/placeholder.png' },
    { id: '3', user: 'John Doe', email: 'john.doe@email.com', type: 'Passport', status: 'Approved', date: '2023-11-01', avatar: '/placeholder.png' },
    { id: '4', user: 'John Doe', email: 'john.doe@email.com', type: 'Passport', status: 'Pending', date: '2023-11-01', avatar: '/placeholder.png' },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100/50 p-4 sm:p-6 lg:p-8">
      <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-6 lg:mb-8">Verification (KYC/KYB)</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-100 text-[12px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="pb-4 font-bold">User</th>
              <th className="pb-4 font-bold">Document Type</th>
              <th className="pb-4 font-bold">Status</th>
              <th className="pb-4 font-bold">Date</th>
              <th className="pb-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-[14px]">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 flex items-center gap-3">
                  <img src={row.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                  <div>
                    <p className="font-bold text-gray-900 text-[13px]">{row.user}</p>
                    <p className="text-[12px] text-gray-500">{row.email}</p>
                  </div>
                </td>
                <td className="py-4 text-gray-600 text-[13px]">{row.type}</td>
                <td className="py-4">
                  <span className={`inline-flex px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                    row.status === 'Approved' ? 'bg-[#10B981] text-white' : 'bg-orange-50 border border-orange-100 text-[#EF4423]'
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 text-gray-600 text-[13px]">{row.date}</td>
                <td className="py-4 text-right">
                  <button className="px-5 py-2 border border-gray-200 text-gray-600 text-[13px] font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
