import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiDollarSign, FiTrendingUp, FiPieChart, FiBarChart2, FiArrowLeft } from 'react-icons/fi'

const InterestCalculator = () => {
  const [activeTab, setActiveTab] = useState('simple')
  
  // Simple Interest State
  const [siPrincipal, setSiPrincipal] = useState('')
  const [siRate, setSiRate] = useState('')
  const [siTime, setSiTime] = useState('')
  const [siResult, setSiResult] = useState(null)
  
  // Compound Interest State
  const [ciPrincipal, setCiPrincipal] = useState('')
  const [ciRate, setCiRate] = useState('')
  const [ciTime, setCiTime] = useState('')
  const [ciFrequency, setCiFrequency] = useState('12')
  const [ciResult, setCiResult] = useState(null)
  
  // Investment Growth State
  const [igInitial, setIgInitial] = useState('')
  const [igMonthly, setIgMonthly] = useState('')
  const [igRate, setIgRate] = useState('')
  const [igYears, setIgYears] = useState('')
  const [igResult, setIgResult] = useState(null)
  
  // Loan EMI State
  const [loanAmount, setLoanAmount] = useState('')
  const [loanRate, setLoanRate] = useState('')
  const [loanTenure, setLoanTenure] = useState('')
  const [emiResult, setEmiResult] = useState(null)

  // Simple Interest Calculation
  const calculateSimpleInterest = () => {
    if (!siPrincipal || !siRate || !siTime) return
    
    const P = parseFloat(siPrincipal)
    const R = parseFloat(siRate)
    const T = parseFloat(siTime)
    
    const interest = (P * R * T) / 100
    const totalAmount = P + interest
    
    setSiResult({
      principal: P.toFixed(2),
      interest: interest.toFixed(2),
      total: totalAmount.toFixed(2),
      rate: R,
      time: T
    })
  }

  // Compound Interest Calculation
  const calculateCompoundInterest = () => {
    if (!ciPrincipal || !ciRate || !ciTime) return
    
    const P = parseFloat(ciPrincipal)
    const R = parseFloat(ciRate) / 100
    const T = parseFloat(ciTime)
    const n = parseFloat(ciFrequency)
    
    // A = P(1 + r/n)^(nt)
    const amount = P * Math.pow((1 + R / n), n * T)
    const interest = amount - P
    
    const frequencyLabels = {
      '1': 'Annually',
      '2': 'Semi-Annually',
      '4': 'Quarterly',
      '12': 'Monthly',
      '365': 'Daily'
    }
    
    setCiResult({
      principal: P.toFixed(2),
      interest: interest.toFixed(2),
      total: amount.toFixed(2),
      rate: parseFloat(ciRate),
      time: T,
      frequency: frequencyLabels[ciFrequency]
    })
  }

  // Investment Growth Calculation (with monthly contributions)
  const calculateInvestmentGrowth = () => {
    if (!igInitial || !igRate || !igYears) return
    
    const P = parseFloat(igInitial)
    const PMT = parseFloat(igMonthly) || 0
    const r = parseFloat(igRate) / 100 / 12 // monthly rate
    const n = parseFloat(igYears) * 12 // total months
    
    // Future value of initial investment
    const FV_initial = P * Math.pow(1 + r, n)
    
    // Future value of monthly contributions
    let FV_contributions = 0
    if (PMT > 0) {
      FV_contributions = PMT * ((Math.pow(1 + r, n) - 1) / r)
    }
    
    const totalValue = FV_initial + FV_contributions
    const totalInvested = P + (PMT * n)
    const totalGains = totalValue - totalInvested
    
    setIgResult({
      invested: totalInvested.toFixed(2),
      gains: totalGains.toFixed(2),
      total: totalValue.toFixed(2),
      initial: P.toFixed(2),
      monthly: PMT.toFixed(2),
      years: parseFloat(igYears)
    })
  }

  // Loan EMI Calculation
  const calculateEMI = () => {
    if (!loanAmount || !loanRate || !loanTenure) return
    
    const P = parseFloat(loanAmount)
    const r = parseFloat(loanRate) / 100 / 12 // monthly rate
    const n = parseFloat(loanTenure) * 12 // total months
    
    // EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    const totalPayment = emi * n
    const totalInterest = totalPayment - P
    
    setEmiResult({
      emi: emi.toFixed(2),
      principal: P.toFixed(2),
      interest: totalInterest.toFixed(2),
      total: totalPayment.toFixed(2),
      tenure: parseFloat(loanTenure)
    })
  }

  const tabs = [
    { id: 'simple', label: 'Simple Interest', icon: FiDollarSign },
    { id: 'compound', label: 'Compound Interest', icon: FiTrendingUp },
    { id: 'investment', label: 'Investment Growth', icon: FiPieChart },
    { id: 'emi', label: 'Loan EMI', icon: FiBarChart2 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#0a192f]">
      {/* Header with Back Button */}
      <header className="bg-[#112240] border-b border-gray/20 px-6 py-4 sticky top-0 z-50">
        <div className="container mx-auto">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] hover:bg-[#2a4a7f] text-light rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-lg" />
            <span>Back to Projects</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Interest Calculator
          </h1>
          <p className="text-gray-400 text-lg">
            Calculate interest, investment growth, and loan payments
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-secondary text-primary font-semibold'
                    : 'bg-[#112240] text-gray-400 hover:text-white'
                }`}
              >
                <Icon />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Calculator Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#112240] rounded-xl p-8 shadow-2xl"
        >
          {/* Simple Interest Calculator */}
          {activeTab === 'simple' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Simple Interest Calculator</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 mb-2">Principal Amount ($)</label>
                  <input
                    type="number"
                    value={siPrincipal}
                    onChange={(e) => setSiPrincipal(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Interest Rate (% per year)</label>
                  <input
                    type="number"
                    value={siRate}
                    onChange={(e) => setSiRate(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Time Period (years)</label>
                  <input
                    type="number"
                    value={siTime}
                    onChange={(e) => setSiTime(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="3"
                  />
                </div>
              </div>
              <button
                onClick={calculateSimpleInterest}
                className="w-full mt-6 bg-secondary text-primary font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-all"
              >
                Calculate Simple Interest
              </button>
              
              {siResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 bg-[#0a192f] rounded-lg"
                >
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-[#112240] rounded-lg">
                      <div className="text-gray-400 text-sm">Principal</div>
                      <div className="text-2xl font-bold text-blue-400">
                        ${siResult.principal}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-[#112240] rounded-lg">
                      <div className="text-gray-400 text-sm">Interest Earned</div>
                      <div className="text-2xl font-bold text-green-400">
                        ${siResult.interest}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-[#112240] rounded-lg">
                      <div className="text-gray-400 text-sm">Total Amount</div>
                      <div className="text-2xl font-bold text-secondary">
                        ${siResult.total}
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm text-center">
                    At {siResult.rate}% per year for {siResult.time} years
                  </div>
                  <div className="mt-4 p-4 bg-[#112240] rounded-lg">
                    <div className="text-gray-400 text-sm mb-2">Formula:</div>
                    <div className="text-white font-mono text-sm">
                      Simple Interest = (P × R × T) / 100
                    </div>
                    <div className="text-gray-500 text-xs mt-2">
                      Where P = Principal, R = Rate, T = Time
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Compound Interest Calculator */}
          {activeTab === 'compound' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Compound Interest Calculator</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 mb-2">Principal Amount ($)</label>
                  <input
                    type="number"
                    value={ciPrincipal}
                    onChange={(e) => setCiPrincipal(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Interest Rate (% per year)</label>
                  <input
                    type="number"
                    value={ciRate}
                    onChange={(e) => setCiRate(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Time Period (years)</label>
                  <input
                    type="number"
                    value={ciTime}
                    onChange={(e) => setCiTime(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Compounding Frequency</label>
                  <select
                    value={ciFrequency}
                    onChange={(e) => setCiFrequency(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="1">Annually</option>
                    <option value="2">Semi-Annually</option>
                    <option value="4">Quarterly</option>
                    <option value="12">Monthly</option>
                    <option value="365">Daily</option>
                  </select>
                </div>
              </div>
              <button
                onClick={calculateCompoundInterest}
                className="w-full mt-6 bg-secondary text-primary font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-all"
              >
                Calculate Compound Interest
              </button>
              
              {ciResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 bg-[#0a192f] rounded-lg"
                >
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-[#112240] rounded-lg">
                      <div className="text-gray-400 text-sm">Principal</div>
                      <div className="text-2xl font-bold text-blue-400">
                        ${ciResult.principal}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-[#112240] rounded-lg">
                      <div className="text-gray-400 text-sm">Interest Earned</div>
                      <div className="text-2xl font-bold text-green-400">
                        ${ciResult.interest}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-[#112240] rounded-lg">
                      <div className="text-gray-400 text-sm">Total Amount</div>
                      <div className="text-2xl font-bold text-secondary">
                        ${ciResult.total}
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm text-center mb-4">
                    At {ciResult.rate}% per year for {ciResult.time} years, compounded {ciResult.frequency}
                  </div>
                  <div className="p-4 bg-[#112240] rounded-lg">
                    <div className="text-gray-400 text-sm mb-2">Formula:</div>
                    <div className="text-white font-mono text-sm">
                      A = P(1 + r/n)^(nt)
                    </div>
                    <div className="text-gray-500 text-xs mt-2">
                      Where A = Final Amount, P = Principal, r = Rate, n = Frequency, t = Time
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Investment Growth Calculator */}
          {activeTab === 'investment' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Investment Growth Calculator</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 mb-2">Initial Investment ($)</label>
                  <input
                    type="number"
                    value={igInitial}
                    onChange={(e) => setIgInitial(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Monthly Contribution ($)</label>
                  <input
                    type="number"
                    value={igMonthly}
                    onChange={(e) => setIgMonthly(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Expected Return (% per year)</label>
                  <input
                    type="number"
                    value={igRate}
                    onChange={(e) => setIgRate(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="8"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Investment Period (years)</label>
                  <input
                    type="number"
                    value={igYears}
                    onChange={(e) => setIgYears(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="10"
                  />
                </div>
              </div>
              <button
                onClick={calculateInvestmentGrowth}
                className="w-full mt-6 bg-secondary text-primary font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-all"
              >
                Calculate Investment Growth
              </button>
              
              {igResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 bg-[#0a192f] rounded-lg"
                >
                  <div className="text-center mb-6">
                    <div className="text-gray-400 mb-2">Future Value</div>
                    <div className="text-5xl font-bold text-secondary">
                      ${igResult.total}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-4 bg-[#112240] rounded-lg">
                      <div className="text-gray-400 text-sm">Total Invested</div>
                      <div className="text-2xl font-bold text-blue-400">
                        ${igResult.invested}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        Initial: ${igResult.initial} + Monthly: ${igResult.monthly}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-[#112240] rounded-lg">
                      <div className="text-gray-400 text-sm">Total Gains</div>
                      <div className="text-2xl font-bold text-green-400">
                        ${igResult.gains}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        Over {igResult.years} years
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-[#112240] rounded-lg">
                    <div className="text-gray-400 text-sm mb-2">💡 Investment Breakdown:</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-300">
                        <span>Initial Investment:</span>
                        <span className="font-semibold">${igResult.initial}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Monthly Contributions:</span>
                        <span className="font-semibold">${igResult.monthly} × {igResult.years * 12} months</span>
                      </div>
                      <div className="flex justify-between text-green-400 font-semibold pt-2 border-t border-gray-700">
                        <span>Investment Returns:</span>
                        <span>${igResult.gains}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Loan EMI Calculator */}
          {activeTab === 'emi' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Loan EMI Calculator</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 mb-2">Loan Amount ($)</label>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Interest Rate (% per year)</label>
                  <input
                    type="number"
                    value={loanRate}
                    onChange={(e) => setLoanRate(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="7"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Loan Tenure (years)</label>
                  <input
                    type="number"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="5"
                  />
                </div>
              </div>
              <button
                onClick={calculateEMI}
                className="w-full mt-6 bg-secondary text-primary font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-all"
              >
                Calculate EMI
              </button>
              
              {emiResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 bg-[#0a192f] rounded-lg"
                >
                  <div className="text-center mb-6">
                    <div className="text-gray-400 mb-2">Monthly EMI</div>
                    <div className="text-5xl font-bold text-secondary">
                      ${emiResult.emi}
                    </div>
                    <div className="text-gray-500 text-sm mt-2">
                      for {emiResult.tenure * 12} months
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-[#112240] rounded-lg">
                      <div className="text-gray-400 text-sm">Principal</div>
                      <div className="text-2xl font-bold text-blue-400">
                        ${emiResult.principal}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-[#112240] rounded-lg">
                      <div className="text-gray-400 text-sm">Total Interest</div>
                      <div className="text-2xl font-bold text-red-400">
                        ${emiResult.interest}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-[#112240] rounded-lg">
                      <div className="text-gray-400 text-sm">Total Payment</div>
                      <div className="text-2xl font-bold text-yellow-400">
                        ${emiResult.total}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-[#112240] rounded-lg">
                    <div className="text-gray-400 text-sm mb-2">Formula:</div>
                    <div className="text-white font-mono text-sm">
                      EMI = [P × r × (1+r)^n] / [(1+r)^n - 1]
                    </div>
                    <div className="text-gray-500 text-xs mt-2">
                      Where P = Principal, r = Monthly Rate, n = Number of Months
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg"
        >
          <p className="text-yellow-400 text-sm text-center">
            ⚠️ Disclaimer: These calculators provide estimates for educational purposes. 
            For actual financial planning, please consult with a financial advisor.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default InterestCalculator
