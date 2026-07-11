"use client"
import React from 'react'
import { MoreHorizontal } from 'lucide-react'

export default function ContentFlagsPage() {
  const data = [
    { id: '1', flagId: 'flag_265', creatorId: 'content_4757', status: 'Resolved', category: 'Harassment', time: '10 hrs', date: '2023-11-01' },
    { id: '2', flagId: 'flag_316', creatorId: 'content_4757', status: 'Pending', category: 'Misinformation', time: '12 hrs', date: '2023-11-01' },
    { id: '3', flagId: 'flag_435', creatorId: 'content_4757', status: 'Resolved', category: 'Copyright', time: '22 hrs', date: '2023-11-01' },
    { id: '4', flagId: 'flag_569', creatorId: 'content_4757', status: 'Resolved', category: 'Nudity', time: '24 hrs', date: '2023-11-01' },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100/50 p-4 sm:p-6 lg:p-8">
      <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-6 lg:mb-8">Content Flags</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-100 text-[12px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="pb-4">Flag ID</th>
              <th className="pb-4">Creator ID</th>
              <th className="pb-4">Status</th>
              <th className="pb-4">Category</th>
              <th className="pb-4">Ending Time / Actions</th>
              <th className="pb-4">Date</th>
              <th className="pb-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-[14px]">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 text-gray-900 font-medium text-[13px]">{row.flagId}</td>
                <td className="py-4 text-gray-500 text-[13px]">{row.creatorId}</td>
                <td className="py-4">
                  <span className={`inline-flex px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                    row.status === 'Resolved' ? 'bg-[#10B981] text-white' : 'bg-orange-50 border border-orange-100 text-[#EF4423]'
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 text-gray-600 text-[13px]">{row.category}</td>
                <td className="py-4 text-gray-600 text-[13px]">{row.time}</td>
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
