'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, ArrowRight } from 'lucide-react'

// Initial data for Key components
const initialComponents = [
  { item: 'Yarn', made: 'Outsource', test_cap: 'In-house/3rd party', equipment: 'Light box, Moisture Meter, Humidity MC' },
  { item: 'Zipper', made: 'Outsource', test_cap: 'In-house/3rd party', equipment: 'Metal Detector MC, Measuring Tape' },
  { item: 'Button', made: 'Outsource', test_cap: 'In-house/3rd party', equipment: 'Pull Test MC' },
  { item: 'Polybag', made: 'Outsource', test_cap: 'In-house/3rd party', equipment: 'Poly Thickness Checking Meter' },
  { item: 'Carton', made: 'Outsource', test_cap: 'In-house/3rd party', equipment: 'N/A' },
  { item: 'Tags', made: 'Outsource', test_cap: 'In-house/3rd party', equipment: 'Barcode Scanner MC' },
  { item: 'Labels', made: 'Outsource', test_cap: 'In-house/3rd party', equipment: 'QR code Scanner MC' },
  { item: 'Sewing Thread', made: 'Outsource', test_cap: 'In-house/3rd party', equipment: 'N/A' },
  { item: 'Sticker', made: 'Outsource', test_cap: 'In-house/3rd party', equipment: 'Barcode Scanner / QR code Scanner MC' },
  { item: 'Elastic Thread', made: 'Outsource', test_cap: 'In-house/3rd party', equipment: 'N/A' },
]

// Initial data for Manufacturing Process
const initialProcesses = [
  { process: 'Winding', prod_cap: 'N/A', control_points: 'Measurements', equipment: 'Traffic Light System, Quality Inspection.', test_cap: 'In-house' },
  { process: 'Knitting', prod_cap: 'N/A', control_points: '', equipment: 'Quality Inspection, Lab Test', test_cap: 'In-house' },
  { process: 'Linking', prod_cap: 'N/A', control_points: '', equipment: 'Quality Inspection', test_cap: 'In-house' },
  { process: 'Washing', prod_cap: 'In-house', control_points: '', equipment: 'Final Inspection, Lab Test', test_cap: 'In-house' },
  { process: 'Sewing', prod_cap: 'In-house', control_points: '', equipment: '', test_cap: '' },
  { process: 'Embroidery', prod_cap: 'In-house', control_points: '', equipment: '', test_cap: '' },
  { process: 'Ironing', prod_cap: 'In-house', control_points: '', equipment: '', test_cap: '' },
  { process: 'Packing', prod_cap: 'In-house', control_points: '', equipment: '', test_cap: '' },
]

function AssessmentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const auditType = searchParams.get('type') || 'factory'

  const [formData, setFormData] = useState({
    title: auditType === 'mill' ? 'Mill Qualification Assessment - Woven' : 'Preliminary Factory Assessment - Soorty Textiles',
    vendor_name: 'Nice Denim Mills Ltd.',
    factory_name: 'Nice Denim Mills Ltd.',
    factory_address: 'Sreepur, Gazipur',
    contact_person: 'Saad Group',
    telephone: '',
    current_products: 'Woven fabrics',
    potential_products: 'Woven fabrics',
    total_persons: '2935',
    qc_persons: '86',
    production_lines: '27',
    packing_lines: '18',
    monthly_production: '1.7 Million',
    yearly_production: '14.4 Million',
    capacity_percentage: '0.88',
    auditor_name: 'Sumon Dey',
  })

  const [components, setComponents] = useState(initialComponents)
  const [processes, setProcesses] = useState(initialProcesses)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase
      .from('assessments')
      .insert([
        {
          title: formData.title,
          facility_name: formData.factory_name,
          auditor_name: formData.auditor_name,
          audit_date: new Date().toISOString().split('T')[0],
          overall_score: 0,
        },
      ])
      .select()
      .single()

    setLoading(false)

    if (error) {
      alert('Error creating assessment: ' + error.message)
    } else if (data) {
      if (auditType === 'mill') {
        router.push(`/assessment/mill/${data.id}`)
      } else {
        router.push(`/assessment/${data.id}`)
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <span className={`text-xs uppercase tracking-wider font-semibold px-3 py-1 rounded-full ${auditType === 'mill' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
          {auditType === 'mill' ? 'Mill Assessment Setup' : 'Step 1: Capability & Capacity'}
        </span>
      </div>

      <form onSubmit={handleNext} className="space-y-6">
        {/* Section 1: Factory Information */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className={`text-white px-6 py-3 font-bold text-center uppercase tracking-wide text-sm ${auditType === 'mill' ? 'bg-emerald-800' : 'bg-slate-800'}`}>
            {auditType === 'mill' ? 'Mill Information' : 'Factory information'}
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col">
              <label className="font-semibold text-slate-600 dark:text-slate-400 mb-1">Assessment Title:</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="p-2.5 border rounded-xl bg-transparent border-slate-300" required />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold text-slate-600 dark:text-slate-400 mb-1">Vendor name:</label>
              <input type="text" name="vendor_name" value={formData.vendor_name} onChange={handleChange} className="p-2.5 border rounded-xl bg-transparent border-slate-300" required />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold text-slate-600 dark:text-slate-400 mb-1">Factory Name:</label>
              <input type="text" name="factory_name" value={formData.factory_name} onChange={handleChange} className="p-2.5 border rounded-xl bg-transparent border-slate-300" required />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold text-slate-600 dark:text-slate-400 mb-1">Auditor Name:</label>
              <input type="text" name="auditor_name" value={formData.auditor_name} onChange={handleChange} className="p-2.5 border rounded-xl bg-transparent border-slate-300" required />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="font-semibold text-slate-600 dark:text-slate-400 mb-1">Factory address:</label>
              <input type="text" name="factory_address" value={formData.factory_address} onChange={handleChange} className="p-2.5 border rounded-xl bg-transparent border-slate-300" />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="font-semibold text-slate-600 dark:text-slate-400 mb-1">Fty contact person / Position / e-mail:</label>
              <input type="text" name="contact_person" value={formData.contact_person} onChange={handleChange} className="p-2.5 border rounded-xl bg-transparent border-slate-300" />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold text-slate-600 dark:text-slate-400 mb-1">Telephone:</label>
              <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} className="p-2.5 border rounded-xl bg-transparent border-slate-300" />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold text-slate-600 dark:text-slate-400 mb-1">Current Products:</label>
              <input type="text" name="current_products" value={formData.current_products} onChange={handleChange} className="p-2.5 border rounded-xl bg-transparent border-slate-300" />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="font-semibold text-slate-600 dark:text-slate-400 mb-1">Potential products for CTC:</label>
              <input type="text" name="potential_products" value={formData.potential_products} onChange={handleChange} className="p-2.5 border rounded-xl bg-transparent border-slate-300" />
            </div>
          </div>
        </div>

        {/* Proceed Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3.5 text-white font-semibold rounded-xl flex items-center gap-2 shadow-md transition disabled:opacity-50 ${auditType === 'mill' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Saving Data...' : auditType === 'mill' ? 'Start Mill Assessment Questionnaire' : 'Next: Factory Assessment Questionnaire'} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default function NewAssessmentPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 text-slate-800 dark:text-slate-100">
      <Suspense fallback={<div className="text-center p-8">Loading assessment setup...</div>}>
        <AssessmentForm />
      </Suspense>
    </main>
  )
}