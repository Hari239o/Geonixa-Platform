import React from 'react';
import TotalStudentsCard from './cards/TotalStudentsCard';
import SlotWiseReports from './reports/SlotWiseReports';
import RoundWiseMarks from './reports/RoundWiseMarks';
import AIViolations from './reports/AIViolations';
import CodingPerformance from './reports/CodingPerformance';
import TypingAccuracy from './reports/TypingAccuracy';
import PassFailReports from './reports/PassFailReports';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-cards">
        <TotalStudentsCard />
      </div>
      <div className="dashboard-reports">
        <SlotWiseReports />
        <RoundWiseMarks />
        <AIViolations />
        <CodingPerformance />
        <TypingAccuracy />
        <PassFailReports />
      </div>
      <div className="dashboard-actions">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all">Add User</button>
        <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all ml-4">Generate Report</button>
      </div>
    </div>
  );
};

export default AdminDashboard;