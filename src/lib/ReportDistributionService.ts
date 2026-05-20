/**
 * Report Distribution Utility Service
 * Centralized service for sending assessment reports and result notifications to students
 * 
 * Usage:
 * 1. After exam submission: await ReportDistributionService.sendExamResultNotification(studentId, examId)
 * 2. After evaluation: await ReportDistributionService.sendQualificationResult(studentId, examId, 'QUALIFIED')
 * 3. For interview invitations: await ReportDistributionService.sendInterviewInvitation(studentId, interviewDate)
 * 4. Bulk distribution: await ReportDistributionService.bulkSendReports(examId, adminKey)
 */

interface SendReportOptions {
  studentId: string;
  examId?: string;
  reportType: 'RESULT_QUALIFIED' | 'RESULT_REJECTED' | 'INTERVIEW_INVITATION' | 'FULL_REPORT';
  metadata?: Record<string, any>;
}

interface BulkReportOptions {
  examId: string;
  adminKey: string;
  filterCriteria?: {
    status?: 'QUALIFIED' | 'NOT QUALIFIED' | 'DISQUALIFIED';
    domain?: string;
  };
}

export class ReportDistributionService {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  /**
   * Send exam result notification to student
   * Automatically determines QUALIFIED or NOT QUALIFIED based on score
   */
  static async sendExamResultNotification(studentId: string, examId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/results/send-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          examId,
          reportType: 'FULL_REPORT',
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send exam result notification:', error);
      return false;
    }
  }

  /**
   * Send qualification result (QUALIFIED or NOT QUALIFIED)
   */
  static async sendQualificationResult(
    studentId: string,
    examId: string,
    qualificationStatus: 'QUALIFIED' | 'NOT QUALIFIED' | 'DISQUALIFIED'
  ): Promise<boolean> {
    try {
      const reportType = qualificationStatus === 'QUALIFIED' ? 'RESULT_QUALIFIED' : 'RESULT_REJECTED';

      const response = await fetch(`${this.BASE_URL}/api/results/send-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          examId,
          reportType,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send qualification result:', error);
      return false;
    }
  }

  /**
   * Send interview invitation email
   */
  static async sendInterviewInvitation(
    studentId: string,
    interviewDate?: string,
    interviewLink?: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/results/send-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          reportType: 'INTERVIEW_INVITATION',
          metadata: {
            interviewDate,
            interviewLink,
          },
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send interview invitation:', error);
      return false;
    }
  }

  /**
   * Send full assessment report with all details
   */
  static async sendFullAssessmentReport(studentId: string, examId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/results/send-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          examId,
          reportType: 'FULL_REPORT',
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send full assessment report:', error);
      return false;
    }
  }

  /**
   * Bulk send reports to all students for an exam (Admin only)
   */
  static async bulkSendReports(options: BulkReportOptions): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/results/bulk-send-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Bulk report distribution failed:', error);
      throw error;
    }
  }

  /**
   * Check report distribution status for an exam
   */
  static async checkDistributionStatus(
    examId: string,
    adminKey: string
  ): Promise<{
    examId: string;
    totalStudents: number;
    reportsSent: number;
    pendingReports: number;
    distributionPercentage: string;
  }> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/api/results/bulk-send-reports?examId=${examId}&adminKey=${adminKey}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to check distribution status:', error);
      throw error;
    }
  }

  /**
   * Send report with custom template data
   */
  static async sendCustomReport(
    studentId: string,
    examId: string,
    reportType: SendReportOptions['reportType'],
    customData?: Record<string, any>
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/results/send-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          examId,
          reportType,
          metadata: customData,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send custom report:', error);
      return false;
    }
  }
}

export default ReportDistributionService;
