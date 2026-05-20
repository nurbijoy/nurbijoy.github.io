import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiActivity, FiHeart, FiTrendingUp, FiInfo, FiArrowLeft } from 'react-icons/fi'

const HealthIndex = () => {
  const [activeTab, setActiveTab] = useState('bmi')
  const [gender, setGender] = useState('male')
  
  // BMI State
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [bmiResult, setBmiResult] = useState(null)
  
  // BMR State
  const [age, setAge] = useState('')
  const [bmrHeight, setBmrHeight] = useState('')
  const [bmrWeight, setBmrWeight] = useState('')
  const [activityLevel, setActivityLevel] = useState('1.2')
  const [bmrResult, setBmrResult] = useState(null)
  
  // Body Fat State
  const [bfHeight, setBfHeight] = useState('')
  const [bfWeight, setBfWeight] = useState('')
  const [bfAge, setBfAge] = useState('')
  const [bodyFatResult, setBodyFatResult] = useState(null)
  
  // Ideal Weight State
  const [iwHeight, setIwHeight] = useState('')
  const [idealWeightResult, setIdealWeightResult] = useState(null)
  
  // Water Intake State
  const [wiWeight, setWiWeight] = useState('')
  const [exerciseTime, setExerciseTime] = useState('')
  const [waterResult, setWaterResult] = useState(null)

  // BMI Calculation
  const calculateBMI = () => {
    if (!height || !weight) return
    const heightInMeters = parseFloat(height) / 100
    const weightInKg = parseFloat(weight)
    const bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1)
    
    let category = ''
    let color = ''
    let advice = ''
    
    if (bmi < 18.5) {
      category = 'Underweight'
      color = 'text-blue-400'
      advice = 'Consider increasing calorie intake with nutrient-rich foods.'
    } else if (bmi >= 18.5 && bmi < 25) {
      category = 'Normal weight'
      color = 'text-green-400'
      advice = 'Great! Maintain your healthy lifestyle.'
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Overweight'
      color = 'text-yellow-400'
      advice = 'Consider a balanced diet and regular exercise.'
    } else {
      category = 'Obese'
      color = 'text-red-400'
      advice = 'Consult a healthcare professional for personalized advice.'
    }
    
    setBmiResult({ bmi, category, color, advice })
  }

  // BMR Calculation (Mifflin-St Jeor Equation)
  const calculateBMR = () => {
    if (!bmrWeight || !bmrHeight || !age) return
    
    const w = parseFloat(bmrWeight)
    const h = parseFloat(bmrHeight)
    const a = parseFloat(age)
    
    let bmr
    if (gender === 'male') {
      bmr = (10 * w) + (6.25 * h) - (5 * a) + 5
    } else {
      bmr = (10 * w) + (6.25 * h) - (5 * a) - 161
    }
    
    const tdee = bmr * parseFloat(activityLevel)
    
    const activityLabels = {
      '1.2': 'Sedentary (little or no exercise)',
      '1.375': 'Lightly active (1-3 days/week)',
      '1.55': 'Moderately active (3-5 days/week)',
      '1.725': 'Very active (6-7 days/week)',
      '1.9': 'Extra active (athlete level)'
    }
    
    setBmrResult({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      activityLabel: activityLabels[activityLevel],
      weightLoss: Math.round(tdee - 500),
      weightGain: Math.round(tdee + 500)
    })
  }

  // Body Fat Percentage (US Navy Method)
  const calculateBodyFat = () => {
    if (!bfWeight || !bfHeight || !bfAge) return
    
    const w = parseFloat(bfWeight)
    const h = parseFloat(bfHeight)
    const a = parseFloat(bfAge)
    
    let bodyFat
    if (gender === 'male') {
      bodyFat = (1.20 * (w / ((h / 100) * (h / 100)))) + (0.23 * a) - 16.2
    } else {
      bodyFat = (1.20 * (w / ((h / 100) * (h / 100)))) + (0.23 * a) - 5.4
    }
    
    bodyFat = Math.max(0, Math.min(100, bodyFat))
    
    let category = ''
    let color = ''
    
    if (gender === 'male') {
      if (bodyFat < 6) { category = 'Essential Fat'; color = 'text-blue-400' }
      else if (bodyFat < 14) { category = 'Athletes'; color = 'text-green-400' }
      else if (bodyFat < 18) { category = 'Fitness'; color = 'text-green-300' }
      else if (bodyFat < 25) { category = 'Average'; color = 'text-yellow-400' }
      else { category = 'Obese'; color = 'text-red-400' }
    } else {
      if (bodyFat < 14) { category = 'Essential Fat'; color = 'text-blue-400' }
      else if (bodyFat < 21) { category = 'Athletes'; color = 'text-green-400' }
      else if (bodyFat < 25) { category = 'Fitness'; color = 'text-green-300' }
      else if (bodyFat < 32) { category = 'Average'; color = 'text-yellow-400' }
      else { category = 'Obese'; color = 'text-red-400' }
    }
    
    setBodyFatResult({
      bodyFat: bodyFat.toFixed(1),
      category,
      color
    })
  }

  // Ideal Weight (Devine Formula)
  const calculateIdealWeight = () => {
    if (!iwHeight) return
    
    const h = parseFloat(iwHeight)
    let idealWeight
    
    if (gender === 'male') {
      idealWeight = 50 + 2.3 * ((h / 2.54) - 60)
    } else {
      idealWeight = 45.5 + 2.3 * ((h / 2.54) - 60)
    }
    
    const minWeight = idealWeight * 0.9
    const maxWeight = idealWeight * 1.1
    
    setIdealWeightResult({
      ideal: idealWeight.toFixed(1),
      range: `${minWeight.toFixed(1)} - ${maxWeight.toFixed(1)}`
    })
  }

  // Water Intake Calculation
  const calculateWaterIntake = () => {
    if (!wiWeight) return
    
    const w = parseFloat(wiWeight)
    const exercise = parseFloat(exerciseTime) || 0
    
    // Base: 30-35ml per kg of body weight
    const baseWater = w * 33
    // Add 12ml per minute of exercise
    const exerciseWater = exercise * 12
    const totalWater = baseWater + exerciseWater
    
    setWaterResult({
      liters: (totalWater / 1000).toFixed(1),
      glasses: Math.round(totalWater / 250),
      ml: Math.round(totalWater)
    })
  }

  const tabs = [
    { id: 'bmi', label: 'BMI Calculator', icon: FiActivity },
    { id: 'bmr', label: 'BMR & TDEE', icon: FiTrendingUp },
    { id: 'bodyfat', label: 'Body Fat %', icon: FiHeart },
    { id: 'idealweight', label: 'Ideal Weight', icon: FiInfo },
    { id: 'water', label: 'Water Intake', icon: FiActivity }
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
            Health Index Calculator
          </h1>
          <p className="text-gray-400 text-lg">
            Track your health metrics with scientific calculations
          </p>
        </motion.div>

        {/* Gender Selection */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-[#112240] rounded-lg p-1 inline-flex">
            <button
              onClick={() => setGender('male')}
              className={`px-6 py-2 rounded-md transition-all ${
                gender === 'male'
                  ? 'bg-secondary text-primary font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Male
            </button>
            <button
              onClick={() => setGender('female')}
              className={`px-6 py-2 rounded-md transition-all ${
                gender === 'female'
                  ? 'bg-secondary text-primary font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Female
            </button>
          </div>
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
          {/* BMI Calculator */}
          {activeTab === 'bmi' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Body Mass Index (BMI)</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="170"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="70"
                  />
                </div>
              </div>
              <button
                onClick={calculateBMI}
                className="w-full mt-6 bg-secondary text-primary font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-all"
              >
                Calculate BMI
              </button>
              
              {bmiResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 bg-[#0a192f] rounded-lg"
                >
                  <div className="text-center mb-4">
                    <div className={`text-5xl font-bold ${bmiResult.color}`}>
                      {bmiResult.bmi}
                    </div>
                    <div className={`text-xl mt-2 ${bmiResult.color}`}>
                      {bmiResult.category}
                    </div>
                  </div>
                  <div className="text-gray-400 text-center">
                    {bmiResult.advice}
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>BMI Categories:</p>
                    <p>• Underweight: &lt; 18.5</p>
                    <p>• Normal: 18.5 - 24.9</p>
                    <p>• Overweight: 25 - 29.9</p>
                    <p>• Obese: ≥ 30</p>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* BMR Calculator */}
          {activeTab === 'bmr' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Basal Metabolic Rate (BMR) & Total Daily Energy Expenditure (TDEE)
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={bmrWeight}
                    onChange={(e) => setBmrWeight(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="70"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={bmrHeight}
                    onChange={(e) => setBmrHeight(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="170"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Age (years)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Activity Level</label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="1.2">Sedentary</option>
                    <option value="1.375">Lightly Active</option>
                    <option value="1.55">Moderately Active</option>
                    <option value="1.725">Very Active</option>
                    <option value="1.9">Extra Active</option>
                  </select>
                </div>
              </div>
              <button
                onClick={calculateBMR}
                className="w-full mt-6 bg-secondary text-primary font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-all"
              >
                Calculate BMR & TDEE
              </button>
              
              {bmrResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 bg-[#0a192f] rounded-lg"
                >
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-4 bg-[#112240] rounded-lg">
                      <div className="text-gray-400 text-sm">BMR</div>
                      <div className="text-3xl font-bold text-secondary">
                        {bmrResult.bmr}
                      </div>
                      <div className="text-gray-500 text-xs">calories/day</div>
                    </div>
                    <div className="text-center p-4 bg-[#112240] rounded-lg">
                      <div className="text-gray-400 text-sm">TDEE</div>
                      <div className="text-3xl font-bold text-green-400">
                        {bmrResult.tdee}
                      </div>
                      <div className="text-gray-500 text-xs">calories/day</div>
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm mb-4">
                    Activity: {bmrResult.activityLabel}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#112240] rounded-lg">
                      <div className="text-gray-400 text-sm">Weight Loss</div>
                      <div className="text-xl font-bold text-blue-400">
                        {bmrResult.weightLoss} cal/day
                      </div>
                      <div className="text-gray-500 text-xs">-500 cal deficit</div>
                    </div>
                    <div className="p-4 bg-[#112240] rounded-lg">
                      <div className="text-gray-400 text-sm">Weight Gain</div>
                      <div className="text-xl font-bold text-yellow-400">
                        {bmrResult.weightGain} cal/day
                      </div>
                      <div className="text-gray-500 text-xs">+500 cal surplus</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Body Fat Calculator */}
          {activeTab === 'bodyfat' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Body Fat Percentage</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={bfWeight}
                    onChange={(e) => setBfWeight(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="70"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={bfHeight}
                    onChange={(e) => setBfHeight(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="170"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Age (years)</label>
                  <input
                    type="number"
                    value={bfAge}
                    onChange={(e) => setBfAge(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="25"
                  />
                </div>
              </div>
              <button
                onClick={calculateBodyFat}
                className="w-full mt-6 bg-secondary text-primary font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-all"
              >
                Calculate Body Fat
              </button>
              
              {bodyFatResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 bg-[#0a192f] rounded-lg text-center"
                >
                  <div className={`text-5xl font-bold ${bodyFatResult.color}`}>
                    {bodyFatResult.bodyFat}%
                  </div>
                  <div className={`text-xl mt-2 ${bodyFatResult.color}`}>
                    {bodyFatResult.category}
                  </div>
                  <div className="mt-4 text-sm text-gray-500 text-left">
                    <p className="font-semibold mb-2">Body Fat Categories ({gender === 'male' ? 'Male' : 'Female'}):</p>
                    {gender === 'male' ? (
                      <>
                        <p>• Essential Fat: 2-5%</p>
                        <p>• Athletes: 6-13%</p>
                        <p>• Fitness: 14-17%</p>
                        <p>• Average: 18-24%</p>
                        <p>• Obese: 25%+</p>
                      </>
                    ) : (
                      <>
                        <p>• Essential Fat: 10-13%</p>
                        <p>• Athletes: 14-20%</p>
                        <p>• Fitness: 21-24%</p>
                        <p>• Average: 25-31%</p>
                        <p>• Obese: 32%+</p>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Ideal Weight Calculator */}
          {activeTab === 'idealweight' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Ideal Body Weight</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={iwHeight}
                    onChange={(e) => setIwHeight(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="170"
                  />
                </div>
              </div>
              <button
                onClick={calculateIdealWeight}
                className="w-full mt-6 bg-secondary text-primary font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-all"
              >
                Calculate Ideal Weight
              </button>
              
              {idealWeightResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 bg-[#0a192f] rounded-lg text-center"
                >
                  <div className="text-gray-400 mb-2">Ideal Weight</div>
                  <div className="text-5xl font-bold text-secondary">
                    {idealWeightResult.ideal} kg
                  </div>
                  <div className="text-gray-400 mt-4">Healthy Range</div>
                  <div className="text-2xl font-bold text-green-400 mt-2">
                    {idealWeightResult.range} kg
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    Based on Devine Formula. Individual results may vary based on body composition and frame size.
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Water Intake Calculator */}
          {activeTab === 'water' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Daily Water Intake</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={wiWeight}
                    onChange={(e) => setWiWeight(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="70"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Exercise Time (minutes/day)</label>
                  <input
                    type="number"
                    value={exerciseTime}
                    onChange={(e) => setExerciseTime(e.target.value)}
                    className="w-full bg-[#0a192f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="30"
                  />
                </div>
              </div>
              <button
                onClick={calculateWaterIntake}
                className="w-full mt-6 bg-secondary text-primary font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-all"
              >
                Calculate Water Intake
              </button>
              
              {waterResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 bg-[#0a192f] rounded-lg"
                >
                  <div className="text-center mb-6">
                    <div className="text-gray-400 mb-2">Daily Water Intake</div>
                    <div className="text-5xl font-bold text-blue-400">
                      {waterResult.liters} L
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-[#112240] rounded-lg">
                      <div className="text-gray-400 text-sm">Glasses</div>
                      <div className="text-3xl font-bold text-secondary">
                        {waterResult.glasses}
                      </div>
                      <div className="text-gray-500 text-xs">(250ml each)</div>
                    </div>
                    <div className="text-center p-4 bg-[#112240] rounded-lg">
                      <div className="text-gray-400 text-sm">Milliliters</div>
                      <div className="text-3xl font-bold text-green-400">
                        {waterResult.ml} ml
                      </div>
                      <div className="text-gray-500 text-xs">per day</div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>💧 Tip: Drink water consistently throughout the day</p>
                    <p>💧 Increase intake during hot weather or intense exercise</p>
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
            ⚠️ Disclaimer: These calculators provide estimates based on standard formulas. 
            For personalized health advice, please consult with a healthcare professional.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default HealthIndex
