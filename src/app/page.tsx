'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Building2, Factory, PlusCircle, FileText, Download, Eye, FileSpreadsheet } from 'lucide-react'

interface Assessment {
  id: string
  title: string
  assessment_type: string
  facility_name: string
  auditor_name: string
  audit_date: string
  status: string
  overall_score: number
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReports, setSelectedReports] = useState<string[]>([])

  useEffect(() => {
    fetchAssessments()
  }, [])

  const fetchAssessments = async () => {
    setLoading(true)
    
    const thirteenMonthsAgo = new Date()
    thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13)

    // Shudhu submitted report guli filter korar jonno .eq('status', 'submitted') add kora holo
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('status', 'submitted')
      .gte('created_at', thirteenMonthsAgo.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching assessments:', error.message)
    } else if (data) {
      setAssessments(data)
    }
    setLoading(false)
  }

  const toggleSelectAll = () => {
    if (selectedReports.length === assessments.length) {
      setSelectedReports([])
    } else {
      setSelectedReports(assessments.map(item => item.id))
    }
  }

  const toggleSelectReport = (id: string) => {
    if (selectedReports.includes(id)) {
      setSelectedReports(selectedReports.filter(item => item !== id))
    } else {
      setSelectedReports([...selectedReports, id])
    }
  }

  const handleBulkPDFDownload = () => {
    if (selectedReports.length === 0) {
      alert('Doya kore odhikangsho report select korun.')
      return
    }
    selectedReports.forEach(id => {
      window.open(`/assessment/${id}?print=true`, '_blank')
    })
  }

  const handleExcelExport = (id: string, title: string) => {
    // Simple CSV / Excel structured export simulation for the selected report
    window.open(`/assessment/${id}`, '_blank')
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 text-slate-800 dark:text-slate-100">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
              Audit Management System
            </span>
            <h1 className="text-3xl font-extrabold mt-2">Inspection Pro Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Notun assessment shuru korun ba last 13 maser submitted report guli sohoje management korun.</p>
          </div>
        </div>

        {/* Selection Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Factory Assessment Card */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200">
                <Factory className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Factory Assessment</h2>
              <p className="text-sm text-slate-500">
                Incoming goods, cutting, sewing, washing ebong quality control workflow soho comprehensive facility audit পরিচালনা করুন।
              </p>
            </div>
            <div className="pt-6">
              <button
                onClick={() => router.push('/assessment/new?type=factory')}
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <PlusCircle className="w-5 h-5" /> Start Factory Assessment
              </button>
            </div>
          </div>

          {/* Mill Assessment Card */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Mill Assessment</h2>
              <p className="text-sm text-slate-500">
                Textile spinning, weaving ebong processing mill evaluation technical criteria ebong weighted ratinger sathe evaluate করুন।
              </p>
            </div>
            <div className="pt-6">
              <button
                onClick={() => router.push('/assessment/new?type=mill')}
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <PlusCircle className="w-5 h-5" /> Start Mill Assessment
              </button>
            </div>
          </div>

        </div>

        {/* Submitted Reports Section (Last 13 Months) */}
        <div className="space-y-4 pt-4 bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-700" /> Submitted Reports (Last 13 Months)
              </h2>
              <p className="text-xs text-slate-500 mt-1">Checkbox select kore ba direct "View / PDF / Excel" click kore report guli export ba download korun.</p>
            </div>

            <div className="flex items-center gap-3">
              {selectedReports.length > 0 && (
                <button
                  onClick={handleBulkPDFDownload}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-xl flex items-center gap-2 text-xs transition shadow-sm"
                >
                  <Download className="w-4 h-4" /> Export Selected PDF ({selectedReports.length})
                </button>
              )}
              <button
                onClick={fetchAssessments}
                className="text-xs text-slate-700 dark:text-slate-300 hover:underline font-medium px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl"
              >
                Refresh List
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading submitted reports...</div>
          ) : assessments.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <p className="text-slate-500">Shesh 13 maser modhe kono submitted report paoya jayni.</p>
              <p className="text-sm text-slate-400">Kono assessment complete kore submit korle ekhane show korbe.</p>
            </div>
          ) : (
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wider">
                    <th className="p-3.5 border-b border-slate-200 dark:border-slate-700 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedReports.length === assessments.length && assessments.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-slate-800 focus:ring-slate-600"
                      />
                    </th>
                    <th className="p-3.5 border-b border-slate-200 dark:border-slate-700">Report Name / Title</th>
                    <th className="p-3.5 border-b border-slate-200 dark:border-slate-700">Facility Name</th>
                    <th className="p-3.5 border-b border-slate-200 dark:border-slate-700">Auditor</th>
                    <th className="p-3.5 border-b border-slate-200 dark:border-slate-700 text-center">Date</th>
                    <th className="p-3.5 border-b border-slate-200 dark:border-slate-700 text-center">Score</th>
                    <th className="p-3.5 border-b border-slate-200 dark:border-slate-700 text-center">Actions (PDF / Excel)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {assessments.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition">
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedReports.includes(item.id)}
                          onChange={() => toggleSelectReport(item.id)}
                          className="rounded border-slate-300 text-slate-800 focus:ring-slate-600"
                        />
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        {item.facility_name}
                      </td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400">
                        {item.auditor_name}
                      </td>
                      <td className="p-3.5 text-center text-slate-500 text-xs">
                        {new Date(item.audit_date).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-center font-extrabold text-slate-800 dark:text-slate-100">
                        {item.overall_score || 0}%
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => router.push(`/assessment/${item.id}`)}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-xl flex items-center gap-1.5 text-xs font-medium shadow-sm transition"
                            title="View Report"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                          <button
                            onClick={() => window.open(`/assessment/${item.id}?print=true`, '_blank')}
                            className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded-xl flex items-center gap-1.5 text-xs font-medium shadow-sm transition"
                            title="Export as PDF"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF
                          </button>
                          <button
                            onClick={() => handleExcelExport(item.id, item.title)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl flex items-center gap-1.5 text-xs font-medium shadow-sm transition"
                            title="Export as Excel"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}