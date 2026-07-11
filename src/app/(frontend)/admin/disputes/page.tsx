"use client"
import React from 'react'
import { MoreHorizontal } from 'lucide-react'

export default function DisputesPage() {
  const data = [
    { id: '1', user: 'John Doe', email: 'john.doe@email.com', reason: 'Transaction Error', status: 'Pending', date: '2023-11-01', avatar: '/placeholder.png' },
    { id: '2', user: 'John Doe', email: 'john.doe@email.com', reason: 'Transaction Error', status: 'Pending', date: '2023-11-01', avatar: '/placeholder.png' },
    { id: '3', user: 'John Doe', email: 'john.doe@email.com', reason: 'Transaction Error', status: 'Resolved', date: '2023-11-01', avatar: '/placeholder.png' },
    { id: '4', user: 'John Doe', email: 'john.doe@email.com', reason: 'Transaction Error', status: 'Pending', date: '2023-11-01', avatar: '/placeholder.png' },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100/50 p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-8">Dispute Management</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-[12px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="pb-4">User</th>
              <th className="pb-4">Reason</th>
              <th className="pb-4">Status</th>
              <th className="pb-4">Date</th>
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
                <td className="py-4 text-gray-600 text-[13px]">{row.reason}</td>
                <td className="py-4">
                  <span className={`inline-flex px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                    row.status === 'Resolved' ? 'bg-[#EF4423] text-white' : 'bg-orange-50 border border-orange-100 text-[#EF4423]'
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 text-gray-600 text-[13px]">{row.date}</td>
                <td className="py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors ml-auto">
                    <MoreHorizontal className="w-5 h-5" />
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
