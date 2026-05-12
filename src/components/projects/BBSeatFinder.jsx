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
      const response = await fetch('/data/bb-exams.json')
      if (response.ok) {
        const data = await response.json()
        setExams(data.exams || [])
        if (data.exams && data.exams.length > 0) {
          setSelectedExam(data.exams[0])
        }
      } else {
        console.error('Failed to load exam data')
        setExams([])
      }
    } catch (err) {
      console.error('Error loading exams:', err)
      setExams([])
    } finally {
      setLoading(false)
    }
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
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-6 sm:py-12 px-3 sm:px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Back Button */}
        <Link
          to="/projects"
          className="inline-flex items-center text-white/80 hover:text-white mb-6 sm:mb-8 transition-colors text-sm sm:text-base"
        >
          <FiArrowLeft className="mr-2" />
          Back to Projects
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="text-5xl sm:text-6xl mb-2 sm:mb-3">🏦</div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 sm:mb-3 leading-tight">
              Bangladesh Bank Seat Finder
            </h1>
            <p className="text-gray-800 text-sm sm:text-base md:text-lg font-semibold px-2">
              Find your exam center for Bangladesh Bank recruitment exams
            </p>
          </div>

          {/* Exam Selection Dropdown */}
          {exams.length > 0 && (
            <div className="mb-5 sm:mb-6">
              <label htmlFor="exam-select" className="block text-gray-900 font-extrabold mb-2 sm:mb-3 text-base sm:text-lg">
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
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-500 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg font-bold text-gray-900 focus:border-green-600 focus:outline-none transition-colors bg-white"
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
            <div className="bg-green-100 border-2 border-green-400 rounded-lg sm:rounded-xl p-3 sm:p-5 mb-5 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm md:text-base text-gray-900 font-bold">
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-base sm:text-lg md:text-xl text-green-800 flex-shrink-0" />
                  <span className="text-center sm:text-left">
                    <strong className="font-extrabold">{selectedExam.examDate}</strong> ({selectedExam.examDay})
                  </span>
                </div>
                <span className="hidden sm:inline text-gray-700">|</span>
                <div className="flex items-center gap-2">
                  <FiClock className="text-base sm:text-lg md:text-xl text-green-800 flex-shrink-0" />
                  <span className="font-bold">{selectedExam.examTime}</span>
                </div>
                <span className="hidden sm:inline text-gray-700">|</span>
                <div className="flex items-center gap-2">
                  <FiBriefcase className="text-base sm:text-lg md:text-xl text-green-800 flex-shrink-0" />
                  <span>
                    Job ID: <strong className="font-extrabold">{selectedExam.jobId}</strong> | {selectedExam.grade}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Input Section */}
          {selectedExam && (
            <div className="mb-5 sm:mb-6">
              <label htmlFor="roll" className="block text-gray-900 font-extrabold mb-2 sm:mb-3 text-base sm:text-lg">
                Enter Your Roll Number
              </label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <input
                  type="number"
                  id="roll"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g. 142000"
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-500 rounded-lg sm:rounded-xl text-lg sm:text-xl text-gray-900 font-bold tracking-wider focus:border-green-600 focus:outline-none transition-colors placeholder:text-gray-500"
                />
                <button
                  onClick={findSeat}
                  disabled={searching}
                  className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-green-700 hover:bg-green-800 text-white font-extrabold text-base sm:text-lg rounded-lg sm:rounded-xl transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {searching ? '⏳' : '🔍'} Find
                </button>
              </div>
            </div>
          )}

          {/* No Exams Available */}
          {exams.length === 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📋</div>
              <p className="text-yellow-800 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">No exams available at the moment</p>
              <p className="text-yellow-700 text-xs sm:text-sm">Please check back later for upcoming exam schedules.</p>
            </div>
          )}

          {/* Result Section */}
          {result && (
            <div className="bg-green-50 border-2 border-green-600 rounded-lg sm:rounded-xl p-4 sm:p-6 animate-fadeIn">
              <div className="text-xs font-bold text-green-800 uppercase tracking-wider mb-3 sm:mb-4">
                ✅ EXAM CENTER FOUND
              </div>
              <div className="mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 flex items-start gap-2">
                  <FiMapPin className="text-green-700 mt-1 flex-shrink-0 text-xl sm:text-2xl" />
                  <span className="leading-tight">{result.name}</span>
                </h2>
                <p className="text-gray-700 text-sm sm:text-base font-medium ml-7 sm:ml-8">{result.address}</p>
              </div>
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                <span className="bg-green-700 text-white px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                  Roll: {rollNumber}
                </span>
                <span className="bg-gray-700 text-white px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                  Center No. {result.sl}
                </span>
                <span className="bg-gray-700 text-white px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                  Range: {result.start.toLocaleString()} – {result.end.toLocaleString()}
                </span>
              </div>
              <button
                onClick={openInMaps}
                className="text-green-800 hover:text-green-900 font-bold text-sm sm:text-base hover:underline inline-flex items-center gap-1"
              >
                🗺️ Open in Google Maps →
              </button>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="bg-red-50 border-2 border-red-500 rounded-lg sm:rounded-xl p-4 sm:p-6 animate-fadeIn">
              <div className="text-xs font-bold text-red-700 uppercase tracking-wider mb-3 sm:mb-4">
                ⚠️ {result === null && rollNumber ? 'Not Found' : 'Invalid Input'}
              </div>
              <p className="text-red-700 font-semibold text-sm sm:text-base mb-2">{error}</p>
            </div>
          )}

          {/* Footer */}
          {selectedExam && (
            <div className="text-center mt-6 sm:mt-8 text-xs sm:text-sm md:text-base text-gray-800 font-bold px-2">
              Data source: {selectedExam.noticeNo} — Bangladesh Bank
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BBSeatFinder
