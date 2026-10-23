'use client'
import { useEffect, useState, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Camera, Image as ImageIcon, Trash2 } from 'lucide-react'

interface Assessment {
  id: string
  title: string
  assessment_type: string
  facility_name: string
  auditor_name: string
  audit_date: string
  overall_score: number
  header_data?: any
  sections_data?: any
  corrective_actions?: any
  factory_profile?: any
  market_breakdown?: any
  factory_photos?: any
}

const initialWovenMillSections = [
  {
    category: 'Part 1 - SPINNING',
    items: [
      { id: 'wm1', sl: '1.1', text: 'A) Type and number of Equipments. B) SOP and records documenting the process of checking incoming materials. C) Equipments and records for the temperature and humidity control. D) The environmental condition of the warehouse of the fiber and yarns.', weight: 3, rating: 0, comments: '', photos: [] as string[] },
      { id: 'wm2', sl: '1.2', text: 'A) Valid testing equipments corresponding to testing methods which must be in place. B) Testing reports and the condition of testing facilities.', weight: 3, rating: 0, comments: '', photos: [] as string[] },
    ],
  },
  {
    category: 'Part 2 - Weaving',
    items: [
      { id: 'wm3', sl: '3.1', text: 'A) Valid the equipment type and numbers of weaving/knitting capability.', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'wm4', sl: '3.2', text: 'A) Check if they have suitable process and records for the inventory control.', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'wm5', sl: '3.3', text: 'A) They have suitable process and records for the Humidity control.', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'wm6', sl: '3.4', text: 'A) Check if all fabric rolls being stored off ground and easy identified?', weight: 2, rating: 0, comments: '', photos: [] as string[] },
    ],
  },
  {
    category: 'Part 3 - Fabric Inspection',
    items: [
      { id: 'wm7', sl: '4.1', text: 'A) Do they have QC procedure and the records for the inspection of the greige fabrics.', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'wm8', sl: '4.2', text: 'A) Do they have process to communicate quality issues of greige fabric inspection team.', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'wm9', sl: '4.3', text: 'A) Valid if the specified inspection system (4-point system or others), documents and records are available and followed? B) Check the inspection equipments. C) Check if the inspection reports being analyzed and traced back to the production process. D) Check if they have SOP to segregate the different classes of products.', weight: 3, rating: 0, comments: '', photos: [] as string[] },
    ],
  },
  {
    category: 'Part 4 - Preparation',
    items: [
      { id: 'wm10', sl: '5.1', text: 'A) Check if the prepared fabric is tested for PH, whiteness and strength to ensure it is adapted to the dyeing process.', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'wm11', sl: '5.2', text: 'A) Check if they have the procedure to ensure treatment and testing applied on the incoming water.', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'wm12', sl: '5.3', text: 'A) Check if they have procedure and records (external and internal) of incoming chemicals and dyestuffs.', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'wm13', sl: '5.4', text: 'A) Valid the condition for the storage of chemicals to maintain the quality of dyestuffs.', weight: 2, rating: 0, comments: '', photos: [] as string[] },
    ],
  },
  {
    category: 'Part 5 - Dyeing/Finishing/Printing',
    items: [
      { id: 'wm14', sl: '6.1', text: 'A) Valid if the dyeing equipment type and numbers complied with the dyeing capability and capacity.', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'wm15', sl: '6.2', text: 'A) Check if they have WIP control procedure and information is clearly marked to prevent the mis-dyeing on the wrong fabric.', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'wm16', sl: '6.3', text: 'A) Check if the records of dyeing formula and color lot cards being well kept for the traceability of the dye lots.', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'wm17', sl: '6.4', text: 'A) Check if they have procedure to regularly check the quality of dyed/printed fabric with the correction protocols.', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'wm18', sl: '6.5', text: 'A) Check what functional finish or treatment the mill has capability to produce, check the corresponding equipments.', weight: 2, rating: 0, comments: '', photos: [] as string[] },
    ],
  },
  {
    category: 'Part 6 - Color Process',
    items: [
      { id: 'wm19', sl: '7.1', text: 'A) Check if they have suitable equipments and well trained technicians used for color process.', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'wm20', sl: '7.2', text: 'A) Valid if the spectrophotometer, light box and automated dye dispensing system are available to ensure the consistency of the coloring results and comply to the clients requirements on coloring process. B) Check if they have process describing how to operate the spectrophotometer of visual assessment using the light box to ensure systematically control on the coloring process.', weight: 3, rating: 0, comments: '', photos: [] as string[] },
      { id: 'wm21', sl: '7.3', text: 'A) Valid the calibration records for the spectrophotometer and the light box being in place for the accuracy and stability of the equipments.', weight: 2, rating: 0, comments: '', photos: [] as string[] },
    ],
  },
  {
    category: 'Part 7 - Fabric Testing Laboratory',
    items: [
      { id: 'wm22', sl: '8.1', text: 'A) Valid testing equipments and testing capabilities', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'wm23', sl: '8.2', text: 'A) Check if the documents and records of the control of the temperature and humidity being available to ensure the stability of the testing results and comply to the international testing methods. B) Check if they have the standard documents of all the testing methods that can be performed in the fabric laboratory.', weight: 3, rating: 0, comments: '', photos: [] as string[] },
    ],
  },
  {
    category: 'Part 8 - Social Compliance',
    items: [
      { id: 'wm24', sl: '9.1', text: 'A) Was a BSCI audit conducted for this factory and passed? (take a picture of BSCI report and record passing grade A, B, C or D). B) Can factory provide document evidence of having permits to operate as a factory.', weight: 3, rating: 0, comments: '', photos: [] as string[] },
      { id: 'wm25', sl: '9.2', text: 'A) Does the factory maintain employee records? Do they record age of workers? Their hours of work? B) Are workers provided with PPE (Personal Protective Equipment)?', weight: 2, rating: 0, comments: '', photos: [] as string[] },
      { id: 'wm26', sl: '9.3', text: 'A) Are there fire exits? Are they blocked? Are they clearly marked? Are there sprinklers and/or fire extinguishers? Is there document evidence of fire drills? B) Rolling doors without locking mechanisms.', weight: 3, rating: 0, comments: '', photos: [] as string[] },
      { id: 'wm27', sl: '9.4', text: 'A) Bangladesh Factories: Do they have Alliance/Accord assessment?', weight: 3, rating: 0, comments: '', photos: [] as string[] },
      { id: 'wm28', sl: '9.5', text: 'A) First aid kits with missing/expired medicines. B) No first aiders assigned. C) Smoke detectors not functioning/missing. D) Fire alarm system not functioning/missing. E) Exit signs missing/not lit. F) Fire extinguishers missing/not mounted correctly. G) Emergency lights missing. H) Escape routes not clearly marked. I) No fire hydrants. J) No washing facility in workplace with toxic substances.', weight: 3, rating: 0, comments: '', photos: [] as string[] },
    ],
  },
]

export default function MillAssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [sections, setSections] = useState(initialWovenMillSections)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [headerData, setHeaderData] = useState({
    millName: 'Nice Denim Mills Ltd.',
    vendorName: 'Nice Denim Mills Ltd.',
    currentProducts: 'Woven fabrics',
    potentialProducts: 'Woven fabrics',
    auditorComments: 'Saad Group founded in 2009, the Saad Group of companies has consistently woven fabrics acclaim for its unwavering commitment to professionalism, ethical conduct, and the delivery of top-quality products.',
    auditedBy: 'Sumon Dey & Team',
    auditDate: '2024-07-03',
    requestedBy: 'Sayed Asif Ahamed Joy',
    division: 'Woven',
    homeOfficePqaManager: '',
    homeOfficeCbm: '',
    proMerchandisingManager: '',
    socialComplianceManager: '',
    totalPersons: '2935',
    qcPersons: '86',
  })

  const [areasNeedImproved, setAreasNeedImproved] = useState([
    'They need to install humidity room or climet control system in fabric wearhouse.',
    'Fabric inspection need to more clear and inspector need to train properly.',
    '', '', '', '', ''
  ])

  const [factoryProfile, setFactoryProfile] = useState({
    address: 'Mawna, Sreepur, Gazipur',
    contactPerson: 'Md. Anwar Hossain, Sr. General Manager-Operation',
    telephone: '+8801709-994589',
    canadaInfra: 'No',
    tollFreeNumber: 'N/A',
    canadaContact: 'Nill',
    yearsInLocation: '17 Years',
    managementMakeup: 'Local',
    yearsInBusiness: '20 Years',
    annualTurnover: '191,686,298 USD',
    annualQuantity: '10 Million Yds',
    lineCost: '',
    capacityPercentage: '80%',
  })

  const [marketBreakdown, setMarketBreakdown] = useState([
    { sl: 1, customer: 'Inditex', market: 'Europe', production: '15%' },
    { sl: 2, customer: 'Costco', market: 'USA', production: '12%' },
    { sl: 3, customer: 'Jack & Jones', market: 'Europe', production: '10%' },
    { sl: 4, customer: 'H&M', market: 'Europe', production: '10%' },
    { sl: 5, customer: 'C&A', market: 'Europe', production: '8%' },
    { sl: 6, customer: 'NEXT', market: 'Europe', production: '8%' },
    { sl: 7, customer: 'MANGO', market: 'Europe', production: '7%' },
    { sl: 8, customer: 'Others', market: '', production: '30%' },
  ])

  // Factory View Photos State
  const [factoryPhotos, setFactoryPhotos] = useState<string[]>([])
  const generalCameraRef = useRef<HTMLInputElement | null>(null)
  const generalGalleryRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)
  const galleryInputRef = useRef<HTMLInputElement | null>(null)
  const [activeTarget, setActiveTarget] = useState<{ catIdx: number; itemIdx: number } | null>(null)

  useEffect(() => {
    fetchAssessmentDetail()
  }, [])

  const fetchAssessmentDetail = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('assessments').select('*').eq('id', resolvedParams.id).single()
    if (data) {
      setAssessment(data)
      if (data.header_data) setHeaderData(data.header_data)
      if (data.sections_data) setSections(data.sections_data)
      if (data.corrective_actions) setAreasNeedImproved(data.corrective_actions)
      if (data.factory_profile) setFactoryProfile(data.factory_profile)
      if (data.market_breakdown) setMarketBreakdown(data.market_breakdown)
      if (data.factory_photos) setFactoryPhotos(data.factory_photos)
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

  // Factory Photos Handlers
  const handleGeneralFileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const imageUrl = uploadEvent.target?.result as string
      if (imageUrl) {
        setFactoryPhotos([...factoryPhotos, imageUrl])
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const deleteFactoryPhoto = (pIdx: number) => {
    const updated = [...factoryPhotos]
    updated.splice(pIdx, 1)
    setFactoryPhotos(updated)
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
  let auditStatus = 'Not recommended (< 70%)'
  let statusBadgeColor = 'bg-red-100 text-red-800'
  let scoreColorClass = 'text-red-600'
  
  if (currentScore >= 80) {
    auditStatus = 'Recommended (>= 80%)'
    statusBadgeColor = 'bg-emerald-100 text-emerald-800'
    scoreColorClass = 'text-emerald-600'
  } else if (currentScore >= 70) {
    auditStatus = 'Recommended with corrective actions (70 to 80%)'
    statusBadgeColor = 'bg-amber-100 text-amber-800'
    scoreColorClass = 'text-amber-600'
  }

  const handleSaveAssessment = async () => {
    setSaving(true)
    const { error } = await supabase.from('assessments').update({
      overall_score: currentScore,
      status: 'submitted',
      facility_name: headerData.millName,
      auditor_name: headerData.auditedBy,
      audit_date: new Date().toISOString(),
    }).eq('id', resolvedParams.id)

    setSaving(false)
    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert(`Woven Mill Assessment Submitted Successfully! Score: ${currentScore}%`)
      router.push('/')
    }
  }

  if (loading) return <div className="p-12 text-center">Loading mill assessment...</div>
  if (!assessment) return <div className="p-12 text-center text-red-500">Assessment not found.</div>

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 text-slate-800 dark:text-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileCapture} className="hidden" />
        <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleFileCapture} className="hidden" />
        <input type="file" accept="image/*" capture="environment" ref={generalCameraRef} onChange={handleGeneralFileCapture} className="hidden" />
        <input type="file" accept="image/*" ref={generalGalleryRef} onChange={handleGeneralFileCapture} className="hidden" />
        
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-sm text-slate-600 font-medium hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Header Metadata Layout */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-300 shadow-sm overflow-hidden break-inside-avoid">
          <div className="bg-emerald-800 text-white px-6 py-4 text-center">
            <h1 className="text-xl font-extrabold uppercase">MILL QUALIFICATION ASSESSMENT</h1>
            <p className="text-sm text-emerald-100 mt-1">Canadian Tire Corporation</p>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-b border-slate-200">
            <div>
              <label className="font-semibold text-slate-500 text-xs">Factory Name:</label>
              <input type="text" value={headerData.millName} onChange={(e) => setHeaderData({...headerData, millName: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent font-medium" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">Vender name:</label>
              <input type="text" value={headerData.vendorName} onChange={(e) => setHeaderData({...headerData, vendorName: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent font-medium" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">Current Products :</label>
              <input type="text" value={headerData.currentProducts} onChange={(e) => setHeaderData({...headerData, currentProducts: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent font-medium" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">Potential products for CTC:</label>
              <input type="text" value={headerData.potentialProducts} onChange={(e) => setHeaderData({...headerData, potentialProducts: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent font-medium" />
            </div>
            <div className="md:col-span-2 p-3 bg-slate-50 rounded border">
              <label className="font-semibold text-slate-700 text-xs block mb-1">Overall Factory Assessment:</label>
              <ul className="text-xs text-slate-600 space-y-1 mb-2">
                <li>• Recommended (80%)</li>
                <li>• Recommended with corrective actions (70 to 80%)</li>
                <li>• Not recommended (&lt; 70%)</li>
              </ul>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className={`px-3 py-1 text-xs font-bold rounded ${statusBadgeColor}`}>{auditStatus}</span>
                <span className={`text-3xl font-extrabold ${scoreColorClass}`}>{currentScore}%</span>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="font-semibold text-slate-500 text-xs">Auditor's overall comments:</label>
              <textarea rows={3} value={headerData.auditorComments} onChange={(e) => setHeaderData({...headerData, auditorComments: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent text-xs" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">Audited by:</label>
              <input type="text" value={headerData.auditedBy} onChange={(e) => setHeaderData({...headerData, auditedBy: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent font-medium" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">Date of audit:</label>
              <input type="date" value={headerData.auditDate} onChange={(e) => setHeaderData({...headerData, auditDate: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent font-medium" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">Requested by:</label>
              <input type="text" value={headerData.requestedBy} onChange={(e) => setHeaderData({...headerData, requestedBy: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent font-medium" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">Division:</label>
              <input type="text" value={headerData.division} onChange={(e) => setHeaderData({...headerData, division: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent font-medium" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">Home office PQA Manager :</label>
              <input type="text" value={headerData.homeOfficePqaManager} onChange={(e) => setHeaderData({...headerData, homeOfficePqaManager: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent text-xs" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">Home office CBM:</label>
              <input type="text" value={headerData.homeOfficeCbm} onChange={(e) => setHeaderData({...headerData, homeOfficeCbm: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent text-xs" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">PRO Merchandising Manager:</label>
              <input type="text" value={headerData.proMerchandisingManager} onChange={(e) => setHeaderData({...headerData, proMerchandisingManager: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent text-xs" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">Social Compliance Manager:</label>
              <input type="text" value={headerData.socialComplianceManager} onChange={(e) => setHeaderData({...headerData, socialComplianceManager: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent text-xs" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">How many persons in this factory?</label>
              <input type="text" value={headerData.totalPersons} onChange={(e) => setHeaderData({...headerData, totalPersons: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent text-xs" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">How manay QC&QA persons?</label>
              <input type="text" value={headerData.qcPersons} onChange={(e) => setHeaderData({...headerData, qcPersons: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent text-xs" />
            </div>
          </div>
        </div>

        {/* 3 Summary Boxes before Part 1 */}
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
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => generalCameraRef.current?.click()} className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition">
                <Camera className="w-4 h-4" /> Capture Photo
              </button>
              <button type="button" onClick={() => generalGalleryRef.current?.click()} className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition">
                <ImageIcon className="w-4 h-4" /> Upload from Gallery
              </button>
            </div>
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
                  <button type="button" onClick={() => deleteFactoryPhoto(pIdx)} className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Questionnaire Sections */}
        <div className="space-y-8">
          {sections.map((section, catIdx) => (
            <div key={section.category} className="bg-white dark:bg-slate-800 rounded-2xl border shadow-sm overflow-hidden break-inside-avoid">
              <div className="bg-emerald-900 text-white px-6 py-3 font-bold text-sm uppercase">{section.category}</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-700 text-xs uppercase">
                      <th className="p-3 w-16 text-center border-b">#</th>
                      <th className="p-3 border-b">Questions</th>
                      <th className="p-3 w-20 text-center border-b">Weights assigned</th>
                      <th className="p-3 w-28 text-center border-b">Auditor's rating (0-3)</th>
                      <th className="p-3 w-24 text-center border-b">Weighted rating</th>
                      <th className="p-3 w-56 border-b">Auditor's Comments</th>
                      <th className="p-3 w-40 text-center border-b">Photos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.items.map((item, itemIdx) => (
                      <tr key={item.id} className="border-b hover:bg-slate-50/50">
                        <td className="p-3 text-center font-bold text-slate-500 border-r">{item.sl}</td>
                        <td className="p-3 text-xs border-r leading-relaxed">{item.text}</td>
                        <td className="p-3 text-center font-semibold border-r">{item.weight}</td>
                        <td className="p-3 text-center border-r">
                          <select value={item.rating} onChange={(e) => handleRatingChange(catIdx, itemIdx, parseFloat(e.target.value))} className="w-full p-2 border rounded text-xs font-bold text-slate-800 dark:text-white bg-transparent text-center">
                            <option value={0}>0 - Fail</option>
                            <option value={1}>1 - Poor</option>
                            <option value={2}>2 - Good</option>
                            <option value={3}>3 - Excellent</option>
                          </select>
                        </td>
                        <td className="p-3 text-center font-extrabold text-slate-800 dark:text-white border-r">{item.weight * item.rating}</td>
                        <td className="p-3 border-r">
                          <textarea rows={2} value={item.comments} onChange={(e) => handleCommentChange(catIdx, itemIdx, e.target.value)} placeholder="Comments..." className="w-full p-2 border rounded text-xs bg-transparent" />
                        </td>
                        <td className="p-3 text-center align-middle">
                          <div className="flex flex-col gap-2 items-center">
                            <div className="flex items-center gap-1.5">
                              <button type="button" onClick={() => openCamera(catIdx, itemIdx)} className="px-2 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs flex items-center gap-1 shadow-sm">
                                <Camera className="w-3 h-3" /> Cam
                              </button>
                              <button type="button" onClick={() => openGallery(catIdx, itemIdx)} className="px-2 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs flex items-center gap-1 shadow-sm">
                                <ImageIcon className="w-3 h-3" /> Gallery
                              </button>
                            </div>
                            {item.photos.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1 justify-center">
                                {item.photos.map((photo, pIdx) => (
                                  <div key={pIdx} className="relative group w-9 h-9 rounded overflow-hidden border">
                                    <img src={photo} alt="evidence" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => deletePhoto(catIdx, itemIdx, pIdx)} className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                      <Trash2 className="w-3 h-3 text-red-400" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Areas Need Improved Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border shadow-sm overflow-hidden break-inside-avoid">
          <div className="bg-slate-800 text-white px-6 py-3 font-bold text-sm uppercase text-center">Areas Need Improved</div>
          <div className="p-6 space-y-3">
            {areasNeedImproved.map((area, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="w-8 text-center font-bold text-slate-500">{index + 1}</span>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => {
                    const updated = [...areasNeedImproved]
                    updated[index] = e.target.value
                    setAreasNeedImproved(updated)
                  }}
                  placeholder={`Improvement area ${index + 1}...`}
                  className="w-full p-2 border rounded text-xs bg-transparent"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Factory Profile Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border shadow-sm overflow-hidden break-inside-avoid">
          <div className="bg-slate-800 text-white px-6 py-3 font-bold text-sm uppercase text-center">Factory Profile</div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-semibold text-slate-500 text-xs">Factory address:</label>
              <input type="text" value={factoryProfile.address} onChange={(e) => setFactoryProfile({...factoryProfile, address: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent text-xs" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">Factory contact person / Position / E-mail address:</label>
              <input type="text" value={factoryProfile.contactPerson} onChange={(e) => setFactoryProfile({...factoryProfile, contactPerson: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent text-xs" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">Telephone:</label>
              <input type="text" value={factoryProfile.telephone} onChange={(e) => setFactoryProfile({...factoryProfile, telephone: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent text-xs" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">Does the factory have any infrastructure in Canada / US:</label>
              <input type="text" value={factoryProfile.canadaInfra} onChange={(e) => setFactoryProfile({...factoryProfile, canadaInfra: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent text-xs" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">Does the factory / vendor have a customer toll free number?</label>
              <input type="text" value={factoryProfile.tollFreeNumber} onChange={(e) => setFactoryProfile({...factoryProfile, tollFreeNumber: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent text-xs" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">Factory’s contact person in Canada or US / E-mail address?</label>
              <input type="text" value={factoryProfile.canadaContact} onChange={(e) => setFactoryProfile({...factoryProfile, canadaContact: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent text-xs" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">Years in current location?</label>
              <input type="text" value={factoryProfile.yearsInLocation} onChange={(e) => setFactoryProfile({...factoryProfile, yearsInLocation: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent text-xs" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">Management makeup (e.g. Local, Expatriate, etc.):</label>
              <input type="text" value={factoryProfile.managementMakeup} onChange={(e) => setFactoryProfile({...factoryProfile, managementMakeup: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent text-xs" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">How long have they been in business?</label>
              <input type="text" value={factoryProfile.yearsInBusiness} onChange={(e) => setFactoryProfile({...factoryProfile, yearsInBusiness: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent text-xs" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">Annual turnover (US$):</label>
              <input type="text" value={factoryProfile.annualTurnover} onChange={(e) => setFactoryProfile({...factoryProfile, annualTurnover: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent text-xs" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">Annual quantity of products produced:</label>
              <input type="text" value={factoryProfile.annualQuantity} onChange={(e) => setFactoryProfile({...factoryProfile, annualQuantity: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent text-xs" />
            </div>
            <div>
              <label className="font-semibold text-slate-500 text-xs">What is the % of current capacity compared to max capacity?</label>
              <input type="text" value={factoryProfile.capacityPercentage} onChange={(e) => setFactoryProfile({...factoryProfile, capacityPercentage: e.target.value})} className="w-full p-2 border rounded mt-1 bg-transparent text-xs" />
            </div>
          </div>
        </div>

        {/* Market Breakdown Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border shadow-sm overflow-hidden break-inside-avoid">
          <div className="bg-slate-800 text-white px-6 py-3 font-bold text-sm uppercase text-center">Market Breakdown</div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-xs uppercase">
                  <th className="p-3 border text-center w-16">Sl.No</th>
                  <th className="p-3 border">Major Customer</th>
                  <th className="p-3 border">Market</th>
                  <th className="p-3 border">% of production</th>
                </tr>
              </thead>
              <tbody>
                {marketBreakdown.map((row, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2 border text-center font-bold text-slate-500">{row.sl}</td>
                    <td className="p-2 border"><input type="text" value={row.customer} onChange={(e) => {
                      const updated = [...marketBreakdown]
                      updated[idx].customer = e.target.value
                      setMarketBreakdown(updated)
                    }} className="w-full p-1 bg-transparent text-xs" /></td>
                    <td className="p-2 border"><input type="text" value={row.market} onChange={(e) => {
                      const updated = [...marketBreakdown]
                      updated[idx].market = e.target.value
                      setMarketBreakdown(updated)
                    }} className="w-full p-1 bg-transparent text-xs" /></td>
                    <td className="p-2 border"><input type="text" value={row.production} onChange={(e) => {
                      const updated = [...marketBreakdown]
                      updated[idx].production = e.target.value
                      setMarketBreakdown(updated)
                    }} className="w-full p-1 bg-transparent text-xs" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Auditor's Rating Explanation Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border shadow-sm overflow-hidden break-inside-avoid">
          <div className="bg-slate-800 text-white px-6 py-3 font-bold text-sm uppercase text-center">Auditor's Rating Explanation</div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-xs uppercase">
                  <th className="p-3 border text-center w-32">Auditor's Rating</th>
                  <th className="p-3 border">Explanation</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 border text-center font-bold text-slate-800 dark:text-white">3</td>
                  <td className="p-3 border text-xs leading-relaxed">Meets 100% requirement. No deficiencies found. There is a proven continuous improvement process in place.</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 border text-center font-bold text-slate-800 dark:text-white">2</td>
                  <td className="p-3 border text-xs leading-relaxed">Meets about 75% of the requirement. Minor deficiencies found (e.g., documentations are not clear). Needs some <b>minor</b> improvements / corrective actions</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 border text-center font-bold text-slate-800 dark:text-white">1</td>
                  <td className="p-3 border text-xs leading-relaxed">Meets about 50% of the requirement. Major / significant deficiencies found (e.g., no documentations at all). Needs <b>major</b> improvements / corrective actions</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 border text-center font-bold text-slate-800 dark:text-white">0</td>
                  <td className="p-3 border text-xs leading-relaxed">Doesn't meet the requirement. No system at all.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pb-12 break-inside-avoid">
          <button type="button" onClick={() => window.print()} className="px-6 py-4 bg-slate-700 text-white font-bold rounded-2xl shadow">🖨️ Print / Save as PDF</button>
          <button onClick={handleSaveAssessment} disabled={saving} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow flex items-center gap-2">
            <Save className="w-5 h-5" /> {saving ? 'Submitting...' : 'Submit Woven Mill Assessment'}
          </button>
        </div>
      </div>
    </main>
  )
}