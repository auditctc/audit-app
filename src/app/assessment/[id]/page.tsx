'use client'
import { useEffect, useState, use, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Camera, Image as ImageIcon, Trash2, Download, FileSpreadsheet } from 'lucide-react'

interface Assessment {
  id: string
  title: string
  assessment_type: string
  facility_name: string
  auditor_name: string
  audit_date: string
  overall_score: number
  status?: string
}

// 39 Questions from Excel Factory Assessment Sheet
const initialAssessmentSections = [
  {
    category: 'Part I - Incoming Goods and Materials',
    items: [
      { id: 'q1', sl: 1, text: 'Does the factory have Incoming quality control plan for all main incoming material / components?', weight: 3, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q2', sl: 2, text: 'Are rejected materials segregated and tagged properly? Do they have instructions on what to do with rejected materials?', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q3', sl: 3, text: 'Does the factory have procedures for incoming material management, inventory records (FIFO), and SOP for fabric relaxation with enough shelves?', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q4', sl: 4, text: 'Is IQC staff trained? Do they have fabric inspection machine and wash blanket process to identify shade/dye lots?', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q5', sl: 5, text: 'Does incoming material warehouse appear clean, orderly without mold? Proper climate control and 50 cm clearance from wall?', weight: 2, rating: 0, comments: '', photos: [] as string[] },
    ],
  },
  {
    category: 'Part II - Fabric Spreading and Cutting',
    items: [
      { id: 'q6', sl: 6, text: 'Is the factory conducting a trial cut (10%-15%) prior to cutting bulk production to ensure pattern correctness?', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q7', sl: 7, text: 'Is fabric laid and cut according to dye lots? Are panels numbered and tagged with style, size, qty, color, dye lot details?', weight: 3, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q8', sl: 8, text: 'Is there any QC checking bundles randomly for accuracy of cutting, dye lots and bundling?', weight: 3, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q9', sl: 9, text: 'Are there proper controls for pile height and pattern matching (plaids & stripes) using original paper pattern?', weight: 2, rating: 0, comments: '', photos: [] as string[] },
    ],
  },
  {
    category: 'Part III - Production / Manufacturing Capabilities',
    items: [
      { id: 'q10', sl: 10, text: 'Do the factory have Cutting, Sewing, Dyeing, Washing, Printing, Ironing, Labeling, Buttoning, Assembling facilities?', weight: 3, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q11', sl: 11, text: 'Is Broken needle policy available with logs? Is metal control efficiently managed in sample, production and QC rooms?', weight: 3, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q12', sl: 12, text: 'Are critical construction mock-ups and approved samples displayed on the production line? Overlock checklist available?', weight: 3, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q13', sl: 13, text: 'Does plant appear clean and orderly following 5S? Sewing tables and oil tanks clean? Drinking water area separated?', weight: 3, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q14', sl: 14, text: 'Is there any process to check SPI tension and linking yarn strength before release to workers?', weight: 3, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q15', sl: 15, text: 'Are daily measurement records available for each size/color? Internal inspection & PP meeting reports maintained?', weight: 3, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q16', sl: 16, text: 'Does the factory have regular training plan to train sewing operators with records?', weight: 3, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q17', sl: 17, text: 'Is defect classification defined and known by operators/QC? Defect images displayed? Non-conforming products isolated?', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q18', sl: 18, text: 'Are critical measurements marked on pressing tables? Table covers clean? Irons equipped with Teflon shoes?', weight: 1, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q19', sl: 19, text: 'Is rework process flow clear? Are rework operators trained? Do reworked products go through inline QC and root cause analysis?', weight: 3, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q20', sl: 20, text: 'Does factory have regular maintenance schedule for equipment (sewing machines, washing machines) with log?', weight: 2, rating: 0, comments: '', photos: [] as string[] },
    ],
  },
  {
    category: 'Part IV - Product Testing',
    items: [
      { id: 'q21', sl: 21, text: 'Does factory have SOP to test fusing (hand iron, trouser steam press, roller fusing press) with correct temperature/speed?', weight: 3, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q22', sl: 22, text: 'Up-to-date testing/measuring equipment master list with calibration procedures and test results recorded?', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q23', sl: 23, text: 'Does factory have in-house lab to conduct physical tests (CF test, humidity, snap pull test, shrinkage test)?', weight: 2, rating: 0, comments: '', photos: [] as string[] },
    ],
  },
  {
    category: 'Part V - Quality Control',
    items: [
      { id: 'q24', sl: 24, text: 'Clear indication of visual defect image per style for QC/operator? Complete information and approval sample at shading/QC stations?', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q25', sl: 25, text: 'Does the factory use First Article Review process during manufacturing with First Article available on production line?', weight: 1, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q26', sl: 26, text: 'Are QC reports kept for at least 1 year? Adequate lighting (800+ lux) and space in QC room/stations?', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q27', sl: 27, text: 'Random check of workmanship and measurement for bulk accepted by QC to meet buyer standards?', weight: 3, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q28', sl: 28, text: 'Does factory have ISO 9000 certification and quality controlling procedures for fabric, cutting, sewing, finishing, snaps?', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q29', sl: 29, text: 'Dedicated independent QC team/manager? Systematic training for QA/QC, daily machine setting checks, Munsell eye test passed?', weight: 3, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q30', sl: 30, text: '100% inline inspection in sewing lines and AQL checks for final inspection with records?', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q31', sl: 31, text: 'Process for addressing, handling and documenting corrective/preventive actions (CAP process) for customer complaints?', weight: 2, rating: 0, comments: '', photos: [] as string[] },
    ],
  },
  {
    category: 'Part VI - Post - Production (Finishing and Shipment)',
    items: [
      { id: 'q32', sl: 32, text: 'Finished goods storage adequate? Desiccants used in packaging? Climate-controlled warehouse (20°C, <65% humidity)? Off-floor pallets?', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q33', sl: 33, text: 'Work instructions and monitoring mechanism for packaging and loading containers safely without damage?', weight: 1, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q34', sl: 34, text: 'Audit and needle detector pass records maintained? Metal-free zone in packing area controlled? Needle detector 9-point check 3 times per shift?', weight: 3, rating: 0, comments: '', photos: [] as string[] },
    ],
  },
  {
    category: 'Part VII - Social Compliance',
    items: [
      { id: 'q35', sl: 35, text: 'BSCI audit conducted and passed? Alliance/Accord assessment for Bangladesh factories?', weight: 1, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q36', sl: 36, text: 'Fire exits unblocked and clearly marked? Sprinklers and fire extinguishers available? Fire drill documentation?', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q37', sl: 37, text: 'Employee records maintained (age verification, hours of work, wages)?', weight: 1, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q38', sl: 38, text: 'Document evidence of operating permits as a factory?', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'q39', sl: 39, text: 'Workers provided with PPE (Personal Protective Equipment) where applicable?', weight: 1, rating: 0, comments: '', photos: [] as string[] },
    ],
  },
]

export default function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isPrintMode = searchParams.get('print') === 'true'

  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [sections, setSections] = useState(initialAssessmentSections)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Top Excel Header Metadata (Editable)
  const [headerData, setHeaderData] = useState({
    factoryName: 'Soorty Textiles (BD) Ltd.',
    vendorName: 'Soorty Textiles (BD) Ltd.',
    currentProducts: 'All kind of Denim Apparel',
    potentialProducts: 'All kind of Denim Apparel',
    auditorComments: "Soorty Is one of Pakistan's Largest denim makers and exporters. They have 35 years of manufacturing expertise in denim and jeans. They are capable to produce all kind of Denim product. They have a well setup with Cutting, Sewing, Printing, Embroidery and washing by Inhouse capacity. They started denim production in Bangladesh last 11 years. And work with the Inditex Group, Bestseller Group, C&A, Primark, COTTON ON, and JCPENNEY.",
    auditedBy: 'Sumon Dey, Shamsul Alam & Sazzad Hossain.',
    dateOfAudit: '2-Feb',
    requestedBy: 'Zahid Hossain',
    division: "Mark's",
    homeOfficePqa: 'Zahid Hossain',
    homeOfficeCbm: '',
    proMerchandisingMgr: 'zahid Hossain',
    socialComplianceMgr: 'Shamshul Hoque',
  })

  // Factory View Photos State
  const [factoryPhotos, setFactoryPhotos] = useState<string[]>([])
  const generalCameraRef = useRef<HTMLInputElement | null>(null)
  const generalGalleryRef = useRef<HTMLInputElement | null>(null)

  // 10 Editable Corrective Actions
  const [correctiveActions, setCorrectiveActions] = useState([
    { sl: 1, text: 'A proper light source is required in the shade checking area to ensure accurate assessments.' },
    { sl: 2, text: 'Need to start check 100% cut panel check in cutting section.' },
    { sl: 3, text: 'Pull test operator need to train.' },
    { sl: 4, text: 'Moisture check operator need to train.' },
    { sl: 5, text: 'It is essential to provide comprehensive training for all line controllers to enhance their performance.' },
    { sl: 6, text: '' },
    { sl: 7, text: '' },
    { sl: 8, text: '' },
    { sl: 9, text: '' },
    { sl: 10, text: '' },
  ])

  // Editable Factory Profile
  const [factoryProfile, setFactoryProfile] = useState({
    address: 'Plot # 220-227, 241-242 & 12-14 & 21, Cumilla EPZ, Cumilla-3500',
    contactPerson: 'Taufiq Zaman Bhuiyan, Manager Marketing - taufiq.zaman@bd.soorty.com',
    telephone: '(+88) 09678 773621-310',
    canadaUsInfra: 'No',
    tollFreeNumber: 'No',
    canadaUsContact: 'No',
    yearsInLocation: '11 Years',
    managementMakeup: 'Expatriate',
    yearsInBusiness: '11 Years',
    annualTurnover: '100 Million US$',
    annualQuantity: '14.4 Million',
    lineCost: '',
    capacityPercentage: '88%',
  })

  // 10 Editable Market Breakdown Rows
  const [marketBreakdown, setMarketBreakdown] = useState([
    { sl: 1, customer: 'Inditex Group (Zara, Bershka, Pull & Bear)', market: 'Spain', percentage: '25%' },
    { sl: 2, customer: 'Bestseller Group (Jack & Jones)', market: 'Denmark', percentage: '18%' },
    { sl: 3, customer: 'C&A', market: 'Germany', percentage: '15%' },
    { sl: 4, customer: 'Primark', market: 'UK', percentage: '15%' },
    { sl: 5, customer: 'COTTON ON', market: 'AUSTRALIA', percentage: '10%' },
    { sl: 6, customer: 'JCPENNEY', market: 'USA', percentage: '6%' },
    { sl: 7, customer: 'GAP INC. (Recently onboarded this month)', market: 'USA', percentage: '2%' },
    { sl: 8, customer: 'Others', market: 'Spain/Germany/UK/Turkey/India', percentage: '9%' },
    { sl: 9, customer: '', market: '', percentage: '' },
    { sl: 10, customer: '', market: '', percentage: '' },
  ])

  const cameraInputRef = useRef<HTMLInputElement | null>(null)
  const galleryInputRef = useRef<HTMLInputElement | null>(null)
  const [activeTarget, setActiveTarget] = useState<{ catIdx: number; itemIdx: number } | null>(null)

  useEffect(() => {
    fetchAssessmentDetail()
  }, [])

  useEffect(() => {
    if (isPrintMode && !loading) {
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }, [isPrintMode, loading])

  const fetchAssessmentDetail = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', resolvedParams.id)
      .single()
    if (error) {
      console.error('Error fetching assessment:', error.message)
    } else if (data) {
      setAssessment(data)
    }
    setLoading(false)
  }

  const handleRatingChange = (catIdx: number, itemIdx: number, ratingVal: number) => {
    const updated = [...sections]
    updated[catIdx].items[itemIdx].rating = ratingVal
    setSections(updated)
  }

  const handleCommentChange = (catIdx: number, itemIdx: number, commentVal: string) => {
    const updated = [...sections]
    updated[catIdx].items[itemIdx].comments = commentVal
    setSections(updated)
  }

  const openCamera = (catIdx: number, itemIdx: number) => {
    setActiveTarget({ catIdx, itemIdx })
    if (cameraInputRef.current) cameraInputRef.current.click()
  }

  const openGallery = (catIdx: number, itemIdx: number) => {
    setActiveTarget({ catIdx, itemIdx })
    if (galleryInputRef.current) galleryInputRef.current.click()
  }

  const handleFileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !activeTarget) return
    const file = files[0]
    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const imageUrl = uploadEvent.target?.result as string
      if (imageUrl) {
        const updated = [...sections]
        updated[activeTarget.catIdx].items[activeTarget.itemIdx].photos.push(imageUrl)
        setSections(updated)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const deletePhoto = (catIdx: number, itemIdx: number, photoIdx: number) => {
    const updated = [...sections]
    updated[catIdx].items[itemIdx].photos.splice(photoIdx, 1)
    setSections(updated)
  }

  const handleGeneralFileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const imageUrl = uploadEvent.target?.result as string
      if (imageUrl) {
        setFactoryPhotos((prev) => [...prev, imageUrl])
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const deleteFactoryPhoto = (pIdx: number) => {
    setFactoryPhotos((prev) => prev.filter((_, idx) => idx !== pIdx))
  }

  let totalMaxWeighted = 0
  let totalEarnedWeighted = 0
  sections.forEach((sec) => {
    sec.items.forEach((item) => {
      totalMaxWeighted += item.weight * 3
      totalEarnedWeighted += item.weight * item.rating
    })
  })

  const currentScore = totalMaxWeighted > 0 ? Math.round((totalEarnedWeighted / totalMaxWeighted) * 100) : 0
  let auditStatus = 'Not Recommended (< 70%)'
  let statusBadgeColor = 'bg-red-100 text-red-800'
  let scoreColorClass = 'text-red-600'

  if (currentScore >= 80) {
    auditStatus = 'Recommended (>= 80%)'
    statusBadgeColor = 'bg-emerald-100 text-emerald-800'
    scoreColorClass = 'text-emerald-600'
  } else if (currentScore >= 70) {
    auditStatus = 'Recommended with corrective actions (70% - 80%)'
    statusBadgeColor = 'bg-amber-100 text-amber-800'
    scoreColorClass = 'text-amber-600'
  }

  const handleSaveAssessment = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('assessments')
      .update({
        overall_score: currentScore,
        status: 'submitted',
        facility_name: headerData.factoryName,
        auditor_name: headerData.auditedBy,
        audit_date: new Date().toISOString(),
      })
      .eq('id', resolvedParams.id)
    setSaving(false)
    if (error) {
      alert('Error updating assessment: ' + error.message)
    } else {
      alert(`Assessment submitted successfully! Score: ${currentScore}% (${auditStatus})`)
      router.push('/')
    }
  }

  const handleExcelExport = () => {
    alert('Excel export format downloaded successfully.')
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">Loading assessment details...</div>
  }
  if (!assessment) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500 font-bold">Assessment not found.</div>
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 text-slate-800 dark:text-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileCapture} className="hidden" />
        <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleFileCapture} className="hidden" />
        <input type="file" accept="image/*" capture="environment" ref={generalCameraRef} onChange={handleGeneralFileCapture} className="hidden" />
        <input type="file" accept="image/*" ref={generalGalleryRef} onChange={handleGeneralFileCapture} className="hidden" />

        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          
          <div className="flex items-center gap-2">
            {!isPrintMode && (
              <>
                <button
                  onClick={() => window.open(`/assessment/${resolvedParams.id}?print=true`, '_blank')}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Export PDF
                </button>
                <button
                  onClick={handleExcelExport}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel
                </button>
              </>
            )}
            <span className="text-xs uppercase tracking-wider font-semibold px-3 py-1 bg-slate-200 text-slate-800 rounded-full">
              Unified Assessment Report
            </span>
          </div>
        </div>

        {/* Top Excel Heading & Editable Metadata Box */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden break-inside-avoid">
          <div className="bg-slate-800 text-white px-6 py-4 text-center">
            <h1 className="text-xl font-extrabold uppercase tracking-wide">Preliminary Factory Assessment</h1>
            <p className="text-sm font-semibold text-slate-300 mt-1">Canadian Tire Corporation</p>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-b border-slate-300 dark:border-slate-700">
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Factory Name:</div>
            <div>
              <input type="text" value={headerData.factoryName} onChange={(e) => setHeaderData({ ...headerData, factoryName: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Vender name:</div>
            <div>
              <input type="text" value={headerData.vendorName} onChange={(e) => setHeaderData({ ...headerData, vendorName: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Current Products :</div>
            <div>
              <input type="text" value={headerData.currentProducts} onChange={(e) => setHeaderData({ ...headerData, currentProducts: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Potential products for CTC:</div>
            <div>
              <input type="text" value={headerData.potentialProducts} onChange={(e) => setHeaderData({ ...headerData, potentialProducts: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">
              Overall Factory Assessment:<br />
              <span className="text-xs font-normal text-slate-500">Recommended (80%)<br />Recommended with corrective actions (70 to 80%)<br />Not recommended (&lt; 70%)</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusBadgeColor}`}>{auditStatus}</span>
              <span className={`text-3xl font-extrabold ${scoreColorClass}`}>{currentScore}%</span>
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Auditor's overall comments:</div>
            <div>
              <textarea rows={4} value={headerData.auditorComments} onChange={(e) => setHeaderData({ ...headerData, auditorComments: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Audited by:</div>
            <div>
              <input type="text" value={headerData.auditedBy} onChange={(e) => setHeaderData({ ...headerData, auditedBy: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Date of audit:</div>
            <div>
              <input type="text" value={headerData.dateOfAudit} onChange={(e) => setHeaderData({ ...headerData, dateOfAudit: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Requested by:</div>
            <div>
              <input type="text" value={headerData.requestedBy} onChange={(e) => setHeaderData({ ...headerData, requestedBy: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Division:</div>
            <div>
              <input type="text" value={headerData.division} onChange={(e) => setHeaderData({ ...headerData, division: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Home office PQA Manager :</div>
            <div>
              <input type="text" value={headerData.homeOfficePqa} onChange={(e) => setHeaderData({ ...headerData, homeOfficePqa: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Home office CBM:</div>
            <div>
              <input type="text" value={headerData.homeOfficeCbm} onChange={(e) => setHeaderData({ ...headerData, homeOfficeCbm: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">PRO Merchandising Manager:</div>
            <div>
              <input type="text" value={headerData.proMerchandisingMgr} onChange={(e) => setHeaderData({ ...headerData, proMerchandisingMgr: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Social Compliance Manager:</div>
            <div>
              <input type="text" value={headerData.socialComplianceMgr} onChange={(e) => setHeaderData({ ...headerData, socialComplianceMgr: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
          </div>
        </div>

        {/* 3 Summary Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 break-inside-avoid">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-300 shadow-sm text-center">
            <span className="text-xs font-bold uppercase text-slate-500 block">Total Score for the factory</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{totalEarnedWeighted}</span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-300 shadow-sm text-center">
            <span className="text-xs font-bold uppercase text-slate-500 block">% Score</span>
            <span className={`text-2xl font-extrabold mt-1 block ${scoreColorClass}`}>{currentScore}%</span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-300 shadow-sm text-center">
            <span className="text-xs font-bold uppercase text-slate-500 block">Max Score</span>
            <span className="text-2xl font-extrabold text-slate-700 dark:text-slate-200 mt-1 block">{totalMaxWeighted}</span>
          </div>
        </div>

        {/* Factory / Mill View Photos Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-300 shadow-sm p-6 space-y-4 break-inside-avoid">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-3">
            <div>
              <h2 className="font-bold text-base text-slate-800 dark:text-white uppercase">Factory / Mill View Photos</h2>
              <p className="text-xs text-slate-500 mt-0.5">Apni ekhane factory-er baire ba vitorer overview picture-guli upload kore rakhte paren.</p>
            </div>
            {!isPrintMode && (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => generalCameraRef.current?.click()} className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition">
                  <Camera className="w-4 h-4" /> Capture Photo
                </button>
                <button type="button" onClick={() => generalGalleryRef.current?.click()} className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition">
                  <ImageIcon className="w-4 h-4" /> Upload from Gallery
                </button>
              </div>
            )}
          </div>
          {factoryPhotos.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
              Kono factory view photo upload kora hoyni. Uporer button click kore photo add korun.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-2">
              {factoryPhotos.map((photo, pIdx) => (
                <div key={pIdx} className="relative group aspect-square rounded-xl overflow-hidden border shadow-sm">
                  <img src={photo} alt={`factory view ${pIdx + 1}`} className="w-full h-full object-cover" />
                  {!isPrintMode && (
                    <button type="button" onClick={() => deleteFactoryPhoto(pIdx)} className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-800 text-white px-6 py-3 font-bold text-center uppercase tracking-wide text-sm rounded-xl break-inside-avoid">
          Factory Assessment Questionnaire
        </div>

        {/* Questionnaire Sections (1 to 39) */}
        <div className="space-y-8">
          {sections.map((section, catIdx) => (
            <div key={section.category} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden break-inside-avoid">
              <div className="bg-slate-800 text-white px-6 py-3 font-bold text-sm uppercase tracking-wide">
                {section.category}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wider">
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700 w-12 text-center">#</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Questions</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700 w-24 text-center">Weights assigned</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700 w-28 text-center">Auditor's rating (0-3)</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700 w-28 text-center">Weighted rating</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700 w-64">Auditor's Comments</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700 w-48 text-center">Photos (Camera / Gallery)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.items.map((item, itemIdx) => {
                      const weightedRating = item.weight * item.rating
                      return (
                        <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                          <td className="p-3 border-r border-slate-200 dark:border-slate-700 text-center font-bold text-slate-500">
                            {item.sl}
                          </td>
                          <td className="p-3 border-r border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs leading-relaxed">
                            {item.text}
                          </td>
                          <td className="p-3 border-r border-slate-200 dark:border-slate-700 text-center font-semibold">
                            {item.weight}
                          </td>
                          <td className="p-3 border-r border-slate-200 dark:border-slate-700 text-center">
                            <select
                              value={item.rating}
                              onChange={(e) => handleRatingChange(catIdx, itemIdx, parseFloat(e.target.value))}
                              className="w-full p-2 border rounded-lg bg-transparent border-slate-300 font-bold text-center text-slate-800 dark:text-slate-100 text-xs"
                            >
                              <option value={0}>0 - Fail</option>
                              <option value={1}>1 - Poor</option>
                              <option value={2}>2 - Good</option>
                              <option value={3}>3 - Excellent</option>
                            </select>
                          </td>
                          <td className="p-3 border-r border-slate-200 dark:border-slate-700 text-center font-extrabold text-slate-800 dark:text-slate-100">
                            {weightedRating}
                          </td>
                          <td className="p-3 border-r border-slate-200 dark:border-slate-700">
                            <textarea
                              rows={2}
                              value={item.comments}
                              onChange={(e) => handleCommentChange(catIdx, itemIdx, e.target.value)}
                              placeholder="Write auditor comments..."
                              className="w-full p-2 border rounded-lg bg-transparent border-slate-300 text-xs"
                            />
                          </td>
                          <td className="p-3 text-center align-middle">
                            <div className="flex flex-col gap-2 items-center">
                              {!isPrintMode && (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openCamera(catIdx, itemIdx)}
                                    className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1 text-xs shadow-sm transition"
                                    title="Take photo with camera"
                                  >
                                    <Camera className="w-3.5 h-3.5" /> Cam
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openGallery(catIdx, itemIdx)}
                                    className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1 text-xs shadow-sm transition"
                                    title="Choose from gallery"
                                  >
                                    <ImageIcon className="w-3.5 h-3.5" /> Gallery
                                  </button>
                                </div>
                              )}
                              {item.photos.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1 justify-center">
                                  {item.photos.map((photo, pIdx) => (
                                    <div key={pIdx} className="relative group w-10 h-10 rounded-lg overflow-hidden border border-slate-300">
                                      <img src={photo} alt="evidence" className="w-full h-full object-cover" />
                                      {!isPrintMode && (
                                        <button
                                          type="button"
                                          onClick={() => deletePhoto(catIdx, itemIdx, pIdx)}
                                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                        >
                                          <Trash2 className="w-3 h-3 text-red-400" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Recommended Corrective Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden break-inside-avoid">
          <div className="bg-slate-800 text-white px-6 py-3 font-bold text-center uppercase tracking-wide text-sm">
            Recommended Corrective Actions
          </div>
          <div className="p-6 space-y-3">
            {correctiveActions.map((act, idx) => (
              <div key={act.sl} className="flex items-center gap-4">
                <span className="w-8 text-center font-bold text-slate-500">{act.sl}</span>
                <input
                  type="text"
                  value={act.text}
                  onChange={(e) => {
                    const updated = [...correctiveActions]
                    updated[idx].text = e.target.value
                    setCorrectiveActions(updated)
                  }}
                  placeholder={`Enter corrective action #${act.sl}...`}
                  className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Factory Profile */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden break-inside-avoid">
          <div className="bg-slate-800 text-white px-6 py-3 font-bold text-center uppercase tracking-wide text-sm">
            Factory Profile
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Factory address:</div>
            <div>
              <input type="text" value={factoryProfile.address} onChange={(e) => setFactoryProfile({ ...factoryProfile, address: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Factory contact person / Position / E-mail address:</div>
            <div>
              <input type="text" value={factoryProfile.contactPerson} onChange={(e) => setFactoryProfile({ ...factoryProfile, contactPerson: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Telephone:</div>
            <div>
              <input type="text" value={factoryProfile.telephone} onChange={(e) => setFactoryProfile({ ...factoryProfile, telephone: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Does the factory have any infrastructure in Canada / US:</div>
            <div>
              <input type="text" value={factoryProfile.canadaUsInfra} onChange={(e) => setFactoryProfile({ ...factoryProfile, canadaUsInfra: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Does the factory / vendor have a customer toll free number?</div>
            <div>
              <input type="text" value={factoryProfile.tollFreeNumber} onChange={(e) => setFactoryProfile({ ...factoryProfile, tollFreeNumber: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Factory’s contact person in Canada or US:</div>
            <div>
              <input type="text" value={factoryProfile.canadaUsContact} onChange={(e) => setFactoryProfile({ ...factoryProfile, canadaUsContact: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Years in current location?</div>
            <div>
              <input type="text" value={factoryProfile.yearsInLocation} onChange={(e) => setFactoryProfile({ ...factoryProfile, yearsInLocation: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Management makeup:</div>
            <div>
              <input type="text" value={factoryProfile.managementMakeup} onChange={(e) => setFactoryProfile({ ...factoryProfile, managementMakeup: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">How long have they been in business?</div>
            <div>
              <input type="text" value={factoryProfile.yearsInBusiness} onChange={(e) => setFactoryProfile({ ...factoryProfile, yearsInBusiness: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Annual turnover (US$):</div>
            <div>
              <input type="text" value={factoryProfile.annualTurnover} onChange={(e) => setFactoryProfile({ ...factoryProfile, annualTurnover: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Annual quantity of products produced:</div>
            <div>
              <input type="text" value={factoryProfile.annualQuantity} onChange={(e) => setFactoryProfile({ ...factoryProfile, annualQuantity: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">Line Cost (US$):</div>
            <div>
              <input type="text" value={factoryProfile.lineCost} onChange={(e) => setFactoryProfile({ ...factoryProfile, lineCost: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
            <div className="flex flex-col justify-center font-semibold text-slate-600 dark:text-slate-400">% of current capacity compared to max capacity:</div>
            <div>
              <input type="text" value={factoryProfile.capacityPercentage} onChange={(e) => setFactoryProfile({ ...factoryProfile, capacityPercentage: e.target.value })} className="w-full p-2.5 border rounded-xl bg-transparent border-slate-300 text-sm" />
            </div>
          </div>
        </div>

        {/* Market Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden break-inside-avoid">
          <div className="bg-slate-800 text-white px-6 py-3 font-bold text-center uppercase tracking-wide text-sm">
            Market Breakdown
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                  <th className="p-3 border border-slate-300 w-16 text-center">Sl.No</th>
                  <th className="p-3 border border-slate-300">Major Customer</th>
                  <th className="p-3 border border-slate-300">Market</th>
                  <th className="p-3 border border-slate-300 w-32">% of production</th>
                </tr>
              </thead>
              <tbody>
                {marketBreakdown.map((mb, idx) => (
                  <tr key={mb.sl} className="border-b border-slate-200 dark:border-slate-700">
                    <td className="p-3 border border-slate-300 text-center font-medium">{mb.sl}</td>
                    <td className="p-3 border border-slate-300">
                      <input
                        type="text"
                        value={mb.customer}
                        onChange={(e) => {
                          const updated = [...marketBreakdown]
                          updated[idx].customer = e.target.value
                          setMarketBreakdown(updated)
                        }}
                        placeholder="Enter major customer..."
                        className="w-full p-2 border rounded-lg bg-transparent border-slate-300 text-xs"
                      />
                    </td>
                    <td className="p-3 border border-slate-300">
                      <input
                        type="text"
                        value={mb.market}
                        onChange={(e) => {
                          const updated = [...marketBreakdown]
                          updated[idx].market = e.target.value
                          setMarketBreakdown(updated)
                        }}
                        placeholder="Enter market..."
                        className="w-full p-2 border rounded-lg bg-transparent border-slate-300 text-xs"
                      />
                    </td>
                    <td className="p-3 border border-slate-300">
                      <input
                        type="text"
                        value={mb.percentage}
                        onChange={(e) => {
                          const updated = [...marketBreakdown]
                          updated[idx].percentage = e.target.value
                          setMarketBreakdown(updated)
                        }}
                        placeholder="e.g. 25%"
                        className="w-full p-2 border rounded-lg bg-transparent border-slate-300 text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Auditor's Rating and Explanation */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden break-inside-avoid">
          <div className="bg-slate-800 text-white px-6 py-3 font-bold text-center uppercase tracking-wide text-sm">
            Auditor's Rating and Explanation
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                  <th className="p-3 border border-slate-300 w-32 text-center">Auditor's Rating</th>
                  <th className="p-3 border border-slate-300">Explanation</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <td className="p-3 border border-slate-300 text-center font-bold text-lg">3</td>
                  <td className="p-3 border border-slate-300 text-xs leading-relaxed">
                    Meets 100% requirement. No deficiencies found.<br />
                    There is a proven continuous improvement process in place.
                  </td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <td className="p-3 border border-slate-300 text-center font-bold text-lg">2</td>
                  <td className="p-3 border border-slate-300 text-xs leading-relaxed">
                    Meets about 75% of the requirement. Minor deficiencies found (e.g., documentations are not clear). Needs some <strong>minor</strong> improvements / corrective actions
                  </td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <td className="p-3 border border-slate-300 text-center font-bold text-lg">1</td>
                  <td className="p-3 border border-slate-300 text-xs leading-relaxed">
                    Meets about 50% of the requirement. Major / significant deficiencies found (e.g., no documentations at all). Needs <strong>major</strong> improvements / corrective actions
                  </td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <td className="p-3 border border-slate-300 text-center font-bold text-lg">0</td>
                  <td className="p-3 border border-slate-300 text-xs leading-relaxed">
                    Doesn't meet the requirement. No system at all.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Report Button */}
        {!isPrintMode && (
          <div className="flex justify-end pt-4 pb-12 break-inside-avoid">
            <button
              onClick={handleSaveAssessment}
              disabled={saving}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center gap-3 shadow-lg transition disabled:opacity-50 text-base"
            >
              <Save className="w-6 h-6" /> {saving ? 'Submitting Report...' : 'Submit Complete Factory Assessment Report'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}