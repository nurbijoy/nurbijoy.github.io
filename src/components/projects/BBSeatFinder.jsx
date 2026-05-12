import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiMapPin, FiCalendar, FiClock, FiBriefcase, FiDownload } from 'react-icons/fi'

const BBSeatFinder = () => {
  const [rollNumber, setRollNumber] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  // Load available exams on component mount
  useEffect(() => {
    loadExams()
  }, [])

  const loadExams = async () => {
    setLoading(true)
    try {
      // Try to fetch from API endpoint (if you set up serverless function)
      // For now, we'll use a fallback static data file
      const response = await fetch('/data/bb-exams.json')
      if (response.ok) {
        const data = await response.json()
        setExams(data.exams || [])
        if (data.exams && data.exams.length > 0) {
          setSelectedExam(data.exams[0])
        }
      } else {
        // Fallback to hardcoded data if file doesn't exist
        loadFallbackData()
      }
    } catch (err) {
      console.error('Error loading exams:', err)
      loadFallbackData()
    } finally {
      setLoading(false)
    }
  }

  const loadFallbackData = () => {
    // Fallback data structure
    const fallbackExams = [
      {
        id: '25101',
        title: 'Senior Officer (General) — MCQ Exam 2026',
        jobId: '25101',
        grade: 'Grade-9',
        examDate: '15 May 2026',
        examDay: 'Thursday',
        examTime: '10:00 AM – 11:00 AM',
        noticeNo: 'BSCS Notice No. 173/2026',
        centers: [
          { sl: 1, name: "Shamsul Hoque Khan School and College (School Campus)", address: "Paradogar, Matuail, Demra, Dhaka-1362", start: 100001, end: 111655 },
          { sl: 2, name: "Shamsul Hoque Khan School and College (College Campus)", address: "Paradogar, Matuail, Demra, Dhaka-1362", start: 111657, end: 114575 },
          { sl: 3, name: "A. K. School & College (Main Campus)", address: "Dania, Jatrabari, Dhaka-1236", start: 114577, end: 118450 },
          { sl: 4, name: "A. K. School & College (New Campus)", address: "Dania, Jatrabari, Dhaka-1236", start: 118451, end: 120618 },
          { sl: 5, name: "Barnamala Adarsha High School and College", address: "Dania, Jatrabari, Dhaka-1236", start: 120619, end: 124846 },
          { sl: 6, name: "Dania College", address: "Dania, Jatrabari, Dhaka-1236", start: 124847, end: 132865 },
          { sl: 7, name: "Dr. Mahbubur Rahman Molla College", address: "Matuail, Demra Road, Jatrabari, Dhaka-1362", start: 132866, end: 142567 },
          { sl: 8, name: "Jatrabari Ideal School & College", address: "Jatrabari, Dhaka-1204", start: 142569, end: 146199 },
          { sl: 9, name: "Ahmed Bawany Academy School & College", address: "3-5, K P Ghosh Street, Armanitola, Babubazar, Dhaka-1100", start: 146200, end: 151043 },
          { sl: 10, name: "Armanitola Government High School", address: "Armanitola, Dhaka-1100", start: 151044, end: 154089 },
          { sl: 11, name: "Fazlul Haque Mohila College", address: "12, Akashay Das Lane, Gandaria, Dhaka-1204", start: 154090, end: 157711 },
          { sl: 12, name: "Kabi Nazrul Govt. College", address: "1 No, Municipality Street, Dhaka", start: 157712, end: 161356 },
          { sl: 13, name: "Motijheel Model School and College (Motijheel Branch)", address: "Motijheel, Dhaka-1000", start: 161357, end: 168684 },
          { sl: 14, name: "Central Womens College", address: "13/2, Abhay Das Ln, Dhaka 1203", start: 168686, end: 171960 },
          { sl: 15, name: "Ali Ahmed School & College", address: "South Goran, Khilgaon, Dhaka-1219", start: 171961, end: 174998 },
          { sl: 16, name: "Khilgaon Govt. High School", address: "Khilgaon, Dhaka-1219", start: 175000, end: 178012 },
          { sl: 17, name: "Khilgaon Model College", address: "Block-C, 721/1, Khilgaon, Chowrasta, Dhaka 1219", start: 178013, end: 182203 },
          { sl: 18, name: "Sabujbagh Government College", address: "70/3 South Basabo (Near Balur Mat), Sabujbagh, Dhaka-1214", start: 182204, end: 185844 },
          { sl: 19, name: "Kadamtala Purba Basabo School & College", address: "Basabo, Dhaka-1214", start: 185846, end: 190179 },
          { sl: 20, name: "Mirpur Bangla School and College (Boys Section)", address: "Section 11, Pallabi, Dhaka-1216", start: 190180, end: 194397 },
          { sl: 21, name: "Mirpur Girls Ideal College", address: "Mirpur-10, Dhaka-1216", start: 194398, end: 198694 },
          { sl: 22, name: "Govt. Rupnagar Model School & College", address: "Road No-16, Rupnagar R/A Mirpur, Dhaka-1216", start: 198695, end: 201701 },
          { sl: 23, name: "Sher-E-Bangla Nagar Govt. Boys High School", address: "Sher-E-Bangla Nagar, Dhaka-1207", start: 201702, end: 205261 },
          { sl: 24, name: "Sher-E-Bangla Nagar Govt. Girls High School", address: "Sher-E-Bangla Nagar, Dhaka-1100", start: 205262, end: 208928 },
          { sl: 25, name: "Mogbazar Girls High School", address: "52, Siddheswari, Ramna, Dhaka-1217", start: 208929, end: 212330 },
          { sl: 26, name: "Siddheswari College", address: "25, Shahid Shangbadik Selina Parveen Sarak, Moghbazar, Dhaka-1217", start: 212331, end: 217182 },
          { sl: 27, name: "Siddheswari Girls' College", address: "148, New Baily Rd, Dhaka-1000", start: 217183, end: 221776 },
          { sl: 28, name: "Govt. Science College", address: "446, Tejgaon Shilpa Alaka, Dhaka-1208", start: 221777, end: 226047 },
          { sl: 29, name: "Tejgaon Adarsha School & College", address: "446 Bir Uttam Mir Shawkat Sarak, Dhaka 1208", start: 226049, end: 229685 },
          { sl: 30, name: "Dhanmondi Govt. Boys High School", address: "27 Mirpur Rd, Dhaka-1207", start: 229686, end: 233093 },
          { sl: 31, name: "Mohammadpur Kendriya College", address: "312/3, Noorjahan Road, Mohammadpur, Dhaka-1207", start: 233094, end: 237353 },
          { sl: 32, name: "Lalmatia Girls' High School & College", address: "9/15 Block # D, Lalmatia, Mohammadpur, Dhaka-1207", start: 237354, end: 240388 },
          { sl: 33, name: "Anandamoyee Girls' High School", address: "17/18 Kazimuddin Siddiqui Lane, Armanitola, Dhaka-1100", start: 240389, end: 243796 },
          { sl: 34, name: "Anwara Begum Muslim Girls High School And College", address: "13 Nazimuddin Road, Dhaka-1100", start: 243797, end: 246821 },
          { sl: 35, name: "Shaikh Borhanuddin Post Graduate College", address: "62, Nazimuddin Road, Dhaka-1100", start: 246822, end: 249877 },
          { sl: 36, name: "Azimpur Govt. Girls School & College", address: "Azimpur, Dhaka-1205", start: 249879, end: 254405 },
        ]
      }
    ]
    setExams(fallbackExams)
    setSelectedExam(fallbackExams[0])
  }

  const findSeat = () => {
    if (!selectedExam) {
      setError('Please select an exam first.')
      return
    }

    const roll = parseInt(rollNumber)

    if (!rollNumber || isNaN(roll)) {
      setError('Please enter a valid roll number.')
      setResult(null)
      return
    }

    setSearching(true)
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      const center = selectedExam.centers.find(c => roll >= c.start && roll <= c.end)

      if (center) {
        setResult(center)
        setError('')
      } else {
        const minRoll = Math.min(...selectedExam.centers.map(c => c.start))
        const maxRoll = Math.max(...selectedExam.centers.map(c => c.end))
        setResult(null)
        setError(`Roll number ${roll} was not found in the seat plan. Valid range: ${minRoll.toLocaleString()} – ${maxRoll.toLocaleString()}. Please double-check your roll number.`)
      }
      setSearching(false)
    }, 300)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      findSeat()
    }
  }

  const openInMaps = () => {
    if (result) {
      const mapQuery = encodeURIComponent(`${result.name}, ${result.address}`)
      window.open(`https://www.google.com/maps/search/?api=1&query=${mapQuery}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-12 px-4 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading exam data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Back Button */}
        <Link
          to="/projects"
          className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back to Projects
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">🏦</div>
            <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-2">
              Bangladesh Bank Seat Finder
            </h1>
            <p className="text-gray-600 text-sm">
              Find your exam center for Bangladesh Bank recruitment exams
            </p>
          </div>

          {/* Exam Selection Dropdown */}
          {exams.length > 0 && (
            <div className="mb-6">
              <label htmlFor="exam-select" className="block text-gray-800 font-semibold mb-3 text-sm">
                Select Exam
              </label>
              <select
                id="exam-select"
                value={selectedExam?.id || ''}
                onChange={(e) => {
                  const exam = exams.find(ex => ex.id === e.target.value)
                  setSelectedExam(exam)
                  setResult(null)
                  setError('')
                  setRollNumber('')
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base focus:border-green-600 focus:outline-none transition-colors bg-white"
              >
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title} (Job ID: {exam.jobId})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Exam Info */}
          {selectedExam && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-8">
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-green-800">
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-lg" />
                  <span>
                    <strong>{selectedExam.examDate}</strong> ({selectedExam.examDay})
                  </span>
                </div>
                <span className="hidden sm:inline text-green-400">|</span>
                <div className="flex items-center gap-2">
                  <FiClock className="text-lg" />
                  <span>{selectedExam.examTime}</span>
                </div>
                <span className="hidden sm:inline text-green-400">|</span>
                <div className="flex items-center gap-2">
                  <FiBriefcase className="text-lg" />
                  <span>
                    Job ID: <strong>{selectedExam.jobId}</strong> | {selectedExam.grade}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Input Section */}
          {selectedExam && (
            <div className="mb-6">
              <label htmlFor="roll" className="block text-gray-800 font-semibold mb-3 text-sm">
                Enter Your Roll Number
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  id="roll"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g. 142000"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-lg tracking-wider focus:border-green-600 focus:outline-none transition-colors"
                />
                <button
                  onClick={findSeat}
                  disabled={searching}
                  className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {searching ? '⏳' : '🔍'} Find
                </button>
              </div>
            </div>
          )}

          {/* No Exams Available */}
          {exams.length === 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-yellow-800 font-semibold mb-2">No exams available at the moment</p>
              <p className="text-yellow-700 text-sm">Please check back later for upcoming exam schedules.</p>
            </div>
          )}

          {/* Result Section */}
          {result && (
            <div className="bg-green-50 border-2 border-green-600 rounded-xl p-6 animate-fadeIn">
              <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-4">
                ✅ Exam Center Found
              </div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-start gap-2">
                  <FiMapPin className="text-green-600 mt-1 flex-shrink-0" />
                  <span>{result.name}</span>
                </h2>
                <p className="text-gray-600 text-sm ml-7">{result.address}</p>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-green-700 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Roll: {rollNumber}
                </span>
                <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Center No. {result.sl}
                </span>
                <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Range: {result.start.toLocaleString()} – {result.end.toLocaleString()}
                </span>
              </div>
              <button
                onClick={openInMaps}
                className="text-green-700 hover:text-green-800 font-semibold text-sm hover:underline"
              >
                🗺️ Open in Google Maps →
              </button>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 animate-fadeIn">
              <div className="text-xs font-bold text-red-700 uppercase tracking-wider mb-4">
                ⚠️ {result === null && rollNumber ? 'Not Found' : 'Invalid Input'}
              </div>
              <p className="text-red-700 font-semibold mb-2">{error}</p>
            </div>
          )}

          {/* Footer */}
          {selectedExam && (
            <div className="text-center mt-8 text-xs text-gray-400">
              Data source: {selectedExam.noticeNo} — Bangladesh Bank
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BBSeatFinder
