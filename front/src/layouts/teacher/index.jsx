// ============================================
// src/layouts/teacher/index.jsx
// TO'LIQ VA TUZATILGAN - ARQON TORTISH O'YINI YAXSHILANGAN
// ============================================

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TeacherNavbar from "./navbar/index";
import TeacherSidebar from "./sidebar/index";
import teacherRoutes, { teacherDetailRoutes } from "../../routes/teacher";

// ========== FANLAR BO'YICHA SAVOLLAR BAZASI ==========
const QUESTION_BANKS = {
  mathematics: {
    1: [
      { id: 1, text: "2 + 2 = ?", answer: 4, options: [3, 4, 5, 6] },
      { id: 2, text: "5 - 3 = ?", answer: 2, options: [1, 2, 3, 4] },
      { id: 3, text: "3 × 2 = ?", answer: 6, options: [4, 5, 6, 7] },
      { id: 4, text: "10 ÷ 2 = ?", answer: 5, options: [3, 4, 5, 6] },
      { id: 5, text: "7 + 1 = ?", answer: 8, options: [6, 7, 8, 9] }
    ],
    2: [
      { id: 11, text: "12 - 5 = ?", answer: 7, options: [5, 6, 7, 8] },
      { id: 12, text: "8 × 3 = ?", answer: 24, options: [21, 22, 23, 24] },
      { id: 13, text: "15 + 7 = ?", answer: 22, options: [20, 21, 22, 23] },
      { id: 14, text: "36 ÷ 4 = ?", answer: 9, options: [7, 8, 9, 10] },
      { id: 15, text: "9 × 4 = ?", answer: 36, options: [32, 34, 36, 38] }
    ],
    3: [
      { id: 21, text: "144 ÷ 12 = ?", answer: 12, options: [10, 11, 12, 13] },
      { id: 22, text: "15 × 6 = ?", answer: 90, options: [85, 88, 90, 92] },
      { id: 23, text: "2x + 5 = 15, x = ?", answer: 5, options: [3, 4, 5, 6] },
      { id: 24, text: "3² + 4² = ?", answer: 25, options: [20, 22, 25, 28] }
    ]
  },
  uzbek: {
    1: [
      { id: 101, text: "'Olma' so'zining ma'nosi?", answer: "Apple", options: ["Apple", "Pear", "Grape", "Banana"] },
      { id: 102, text: "'Kitob' so'zining inglizchasi?", answer: "Book", options: ["Pen", "Book", "Table", "Chair"] },
      { id: 103, text: "'O'qituvchi' so'zining sinonimi?", answer: "Ustoz", options: ["Shogird", "Ustoz", "Talaba", "Maktab"] }
    ],
    2: [
      { id: 105, text: "'Do'st' so'zining antonimi?", answer: "Dushman", options: ["Do'st", "Dushman", "Ota", "Ona"] },
      { id: 106, text: "'Mehr' so'zining ma'nosi?", answer: "Love", options: ["Hate", "Love", "Anger", "Sad"] }
    ],
    3: [
      { id: 108, text: "'Vatan' so'zining ma'nosi?", answer: "Homeland", options: ["Country", "Homeland", "City", "Village"] }
    ]
  },
  english: {
    1: [
      { id: 201, text: "What is 'Apple' in Uzbek?", answer: "Olma", options: ["Olma", "Nok", "Banan", "Uzum"] },
      { id: 202, text: "Translate: 'School'", answer: "Maktab", options: ["Maktab", "Universitet", "Kollej", "Litsey"] },
      { id: 203, text: "What is 'Cat'?", answer: "Mushuk", options: ["It", "Mushuk", "Ot", "Sigir"] }
    ],
    2: [
      { id: 204, text: "Translate: 'Beautiful'", answer: "Go'zal", options: ["Yomon", "Go'zal", "Katta", "Kichik"] },
      { id: 205, text: "What is 'Friend'?", answer: "Do'st", options: ["Dushman", "Do'st", "Ota", "Ona"] }
    ],
    3: [
      { id: 206, text: "Past tense of 'go'?", answer: "Went", options: ["Goed", "Went", "Gone", "Going"] }
    ]
  },
  history: {
    1: [
      { id: 301, text: "Amir Temur qachon tug'ilgan?", answer: "1336", options: ["1320", "1336", "1340", "1350"] },
      { id: 302, text: "Navoiy qaysi asrda yashagan?", answer: "15-asr", options: ["14-asr", "15-asr", "16-asr", "17-asr"] }
    ],
    2: [
      { id: 303, text: "Mustaqillik qachon e'lon qilingan?", answer: "1991", options: ["1990", "1991", "1992", "1993"] }
    ]
  },
  geography: {
    1: [
      { id: 401, text: "O'zbekistonning poytaxti?", answer: "Toshkent", options: ["Samarqand", "Buxoro", "Toshkent", "Andijon"] },
      { id: 402, text: "Eng katta okean?", answer: "Tinch okeani", options: ["Atlantika", "Hind", "Tinch okeani", "Shimoliy"] }
    ]
  },
  biology: {
    1: [
      { id: 501, text: "Odamning eng katta organi?", answer: "Teri", options: ["Yurak", "Miya", "Teri", "O'pka"] },
      { id: 502, text: "O'simliklar qanday moddani chiqaradi?", answer: "Kislorod", options: ["Uglerod", "Kislorod", "Vodorod", "Azot"] }
    ]
  },
  physics: {
    1: [
      { id: 601, text: "Yorug'lik tezligi qancha?", answer: "300000 km/s", options: ["150000", "300000", "450000", "600000"] },
      { id: 602, text: "Og'irlik kuchi qaysi?", answer: "Gravitatsiya", options: ["Magnit", "Gravitatsiya", "Elektr", "Yadro"] }
    ]
  },
  chemistry: {
    1: [
      { id: 701, text: "Suvning kimyoviy formulasi?", answer: "H₂O", options: ["CO₂", "H₂O", "O₂", "NaCl"] },
      { id: 702, text: "Tuzning formulasi?", answer: "NaCl", options: ["HCl", "NaCl", "H₂O", "CO₂"] }
    ]
  }
};

// Sinfga qarab qiyinlik darajasini aniqlash
const getDifficultyLevel = (grade) => {
  if (grade <= 2) return 1;
  if (grade <= 4) return 2;
  return 3;
};

// Savol olish - takrorlanmaydigan
const getUniqueQuestion = (subject, grade, usedIds, setUsedIds) => {
  const level = getDifficultyLevel(grade);
  const bank = QUESTION_BANKS[subject] || QUESTION_BANKS.mathematics;
  
  let availableQuestions = [];
  for (let l = level; l >= 1; l--) {
    if (bank[l]) {
      availableQuestions = [...availableQuestions, ...bank[l]];
    }
  }
  
  if (availableQuestions.length === 0) {
    availableQuestions = bank[1] || [];
  }
  
  const unusedQuestions = availableQuestions.filter(q => !usedIds.has(q.id));
  
  if (unusedQuestions.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * unusedQuestions.length);
  const question = { ...unusedQuestions[randomIndex] };
  
  if (question.options && Array.isArray(question.options)) {
    question.options = [...question.options].sort(() => Math.random() - 0.5);
  }
  
  return question;
};

// ========== ARQON TORTISH O'YINI (TO'LIQ QAYTA YOZILGAN) ==========
const TugOfWarGame = ({ grade, subject, onBack }) => {
  const [ropePosition, setRopePosition] = useState(50);
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [winner, setWinner] = useState(null);
  const [leftQuestion, setLeftQuestion] = useState(null);
  const [rightQuestion, setRightQuestion] = useState(null);
  const [showLeftModal, setShowLeftModal] = useState(false);
  const [showRightModal, setShowRightModal] = useState(false);
  const [leftTimeLeft, setLeftTimeLeft] = useState(15);
  const [rightTimeLeft, setRightTimeLeft] = useState(15);
  const [leftAnswered, setLeftAnswered] = useState(false);
  const [rightAnswered, setRightAnswered] = useState(false);
  const [leftUserAnswer, setLeftUserAnswer] = useState(null);
  const [rightUserAnswer, setRightUserAnswer] = useState(null);
  const [leftUsedIds, setLeftUsedIds] = useState(new Set());
  const [rightUsedIds, setRightUsedIds] = useState(new Set());
  const [roundActive, setRoundActive] = useState(true);
  const [pullDirection, setPullDirection] = useState(null);
  const [pullMsg, setPullMsg] = useState('');
  
  const leftTimerRef = useRef(null);
  const rightTimerRef = useRef(null);

  // Yangi savollarni yuklash
  const loadQuestions = useCallback(() => {
    const newLeftQuestion = getUniqueQuestion(subject, grade, leftUsedIds, setLeftUsedIds);
    const newRightQuestion = getUniqueQuestion(subject, grade, rightUsedIds, setRightUsedIds);
    
    if (newLeftQuestion && newRightQuestion) {
      setLeftQuestion(newLeftQuestion);
      setRightQuestion(newRightQuestion);
      setLeftTimeLeft(15);
      setRightTimeLeft(15);
      setLeftAnswered(false);
      setRightAnswered(false);
      setLeftUserAnswer(null);
      setRightUserAnswer(null);
      setPullDirection(null);
      // Ikkala modalni bir vaqtda ochish
      setShowLeftModal(true);
      setShowRightModal(true);
      setRoundActive(true);
    } else if (newLeftQuestion && !newRightQuestion) {
      setWinner('left');
    } else if (!newLeftQuestion && newRightQuestion) {
      setWinner('right');
    } else {
      if (leftScore > rightScore) setWinner('left');
      else if (rightScore > leftScore) setWinner('right');
      else setWinner('draw');
    }
  }, [subject, grade, leftUsedIds, rightUsedIds, leftScore, rightScore]);

  // Chap jamoa vaqt hisoblagichi
  useEffect(() => {
    if (showLeftModal && leftTimeLeft > 0 && !leftAnswered && roundActive && !winner) {
      leftTimerRef.current = setTimeout(() => setLeftTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(leftTimerRef.current);
    } else if (leftTimeLeft === 0 && !leftAnswered && roundActive && !winner) {
      setLeftAnswered(true);
      setLeftUserAnswer(null);
      setShowLeftModal(false);
    }
  }, [leftTimeLeft, showLeftModal, leftAnswered, roundActive, winner]);

  // O'ng jamoa vaqt hisoblagichi
  useEffect(() => {
    if (showRightModal && rightTimeLeft > 0 && !rightAnswered && roundActive && !winner) {
      rightTimerRef.current = setTimeout(() => setRightTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(rightTimerRef.current);
    } else if (rightTimeLeft === 0 && !rightAnswered && roundActive && !winner) {
      setRightAnswered(true);
      setRightUserAnswer(null);
      setShowRightModal(false);
    }
  }, [rightTimeLeft, showRightModal, rightAnswered, roundActive, winner]);

  // Ikkala jamoa ham javob berganini tekshirish
  useEffect(() => {
    if (leftAnswered && rightAnswered && roundActive && !winner) {
      calculatePull();
    }
  }, [leftAnswered, rightAnswered, roundActive, winner]);

  // Arqonni tortish kuchini hisoblash
  const calculatePull = () => {
    const leftCorrect = leftUserAnswer !== null && leftQuestion && leftUserAnswer === leftQuestion.answer;
    const rightCorrect = rightUserAnswer !== null && rightQuestion && rightUserAnswer === rightQuestion.answer;
    
    let leftPower = 0;
    let rightPower = 0;
    let msg = '';
    
    if (leftCorrect && rightCorrect) {
      leftPower = 10;
      rightPower = 10;
      msg = "⚖️ Ikkala jamoa ham to'g'ri javob berdi! Teng kuch!";
    } 
    else if (leftCorrect && !rightCorrect) {
      const timeBonus = Math.floor((rightTimeLeft) / 3);
      leftPower = 15 + timeBonus;
      rightPower = 5;
      msg = `💪 Chap jamoa to'g'ri javob berdi! +${leftPower - 5} kuch!`;
    } 
    else if (!leftCorrect && rightCorrect) {
      const timeBonus = Math.floor((leftTimeLeft) / 3);
      leftPower = 5;
      rightPower = 15 + timeBonus;
      msg = `💪 O'ng jamoa to'g'ri javob berdi! +${rightPower - 5} kuch!`;
    } 
    else {
      leftPower = 3;
      rightPower = 3;
      msg = "😔 Ikkala jamoa ham xato javob berdi! Kuchsiz tortish!";
    }
    
    // Tez javob bergan jamoa uchun qo'shimcha bonus
    if (leftAnswered && rightAnswered) {
      if (leftTimeLeft > rightTimeLeft + 5) {
        leftPower += 5;
        msg += " ⚡ Chap jamoa tezroq javob berdi!";
      } else if (rightTimeLeft > leftTimeLeft + 5) {
        rightPower += 5;
        msg += " ⚡ O'ng jamoa tezroq javob berdi!";
      }
    }
    
    // Arqonni tortish
    const totalPower = leftPower + rightPower;
    const leftPullPercent = (leftPower / totalPower) * 20;
    const rightPullPercent = (rightPower / totalPower) * 20;
    
    let newPosition = ropePosition;
    
    if (leftPower > rightPower) {
      newPosition = Math.max(0, ropePosition - leftPullPercent);
      setPullDirection('left');
    } else if (rightPower > leftPower) {
      newPosition = Math.min(100, ropePosition + rightPullPercent);
      setPullDirection('right');
    }
    
    // Ball qo'shish
    if (leftPower > rightPower) {
      setLeftScore(prev => prev + 1);
    } else if (rightPower > leftPower) {
      setRightScore(prev => prev + 1);
    }
    
    setRopePosition(newPosition);
    
    // G'olibni tekshirish
    if (newPosition <= 0) {
      setWinner('left');
    } else if (newPosition >= 100) {
      setWinner('right');
    }
    
    setPullMsg(msg);
    setRoundActive(false);
    
    // Keyingi raund
    setTimeout(() => {
      if (newPosition > 0 && newPosition < 100 && !winner) {
        loadQuestions();
      }
      setPullMsg('');
    }, 2000);
  };

  const handleLeftAnswer = (answer) => {
    if (leftAnswered || !roundActive || winner) return;
    setLeftUserAnswer(answer);
    setLeftAnswered(true);
    setShowLeftModal(false);
    clearTimeout(leftTimerRef.current);
  };

  const handleRightAnswer = (answer) => {
    if (rightAnswered || !roundActive || winner) return;
    setRightUserAnswer(answer);
    setRightAnswered(true);
    setShowRightModal(false);
    clearTimeout(rightTimerRef.current);
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const resetGame = () => {
    setRopePosition(50);
    setLeftScore(0);
    setRightScore(0);
    setWinner(null);
    setLeftUsedIds(new Set());
    setRightUsedIds(new Set());
    setLeftAnswered(false);
    setRightAnswered(false);
    setLeftUserAnswer(null);
    setRightUserAnswer(null);
    setPullDirection(null);
    setPullMsg('');
    loadQuestions();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🪢 Arqon tortish o‘yini</h2>
          <p className="text-sm text-gray-500">Sinf: {grade} | Fan: {subject}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={resetGame} className="px-4 py-2 text-white transition bg-blue-500 rounded-xl hover:scale-105">🔄 Qayta</button>
          <button onClick={onBack} className="px-4 py-2 text-gray-700 transition bg-gray-200 rounded-xl hover:bg-gray-300">← Orqaga</button>
        </div>
      </div>

      {/* Jamoalar va hisob */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <motion.div 
          animate={{ x: pullDirection === 'left' && !roundActive ? -10 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 10 }}
          className="text-center"
        >
          <div className="p-4 text-white bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl">
            <div className="flex justify-center gap-2 mb-3">
              <motion.div 
                animate={{ rotateZ: pullDirection === 'left' && !roundActive ? [-5, 5, -5] : 0 }}
                className="flex items-center justify-center text-2xl rounded-full w-14 h-14 bg-white/20 backdrop-blur"
              >
                💪
              </motion.div>
              <div className="flex items-center justify-center text-2xl rounded-full w-14 h-14 bg-white/20 backdrop-blur">👨‍🎓</div>
              <div className="flex items-center justify-center text-2xl rounded-full w-14 h-14 bg-white/20 backdrop-blur">👩‍🎓</div>
            </div>
            <div className="mb-2 text-xl font-bold">CHAP JAMOA</div>
            <div className="text-6xl font-bold">{leftScore}</div>
            <div className="mt-2 text-sm text-blue-200">
              {leftAnswered && leftUserAnswer !== null && leftQuestion && leftUserAnswer === leftQuestion.answer ? '✅ To\'g\'ri!' : leftAnswered ? '❌ Xato!' : '⏳ Javob kutilmoqda'}
            </div>
          </div>
        </motion.div>

        <motion.div 
          animate={{ x: pullDirection === 'right' && !roundActive ? 10 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 10 }}
          className="text-center"
        >
          <div className="p-4 text-white bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl">
            <div className="flex justify-center gap-2 mb-3">
              <div className="flex items-center justify-center text-2xl rounded-full w-14 h-14 bg-white/20 backdrop-blur">👨‍🎓</div>
              <div className="flex items-center justify-center text-2xl rounded-full w-14 h-14 bg-white/20 backdrop-blur">👩‍🎓</div>
              <motion.div 
                animate={{ rotateZ: pullDirection === 'right' && !roundActive ? [5, -5, 5] : 0 }}
                className="flex items-center justify-center text-2xl rounded-full w-14 h-14 bg-white/20 backdrop-blur"
              >
                💪
              </motion.div>
            </div>
            <div className="mb-2 text-xl font-bold">O‘NG JAMOA</div>
            <div className="text-6xl font-bold">{rightScore}</div>
            <div className="mt-2 text-sm text-pink-200">
              {rightAnswered && rightUserAnswer !== null && rightQuestion && rightUserAnswer === rightQuestion.answer ? '✅ To\'g\'ri!' : rightAnswered ? '❌ Xato!' : '⏳ Javob kutilmoqda'}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Arqon */}
      <div className="relative mb-8">
        <div className="relative h-10 overflow-hidden rounded-full shadow-inner bg-amber-700">
          <motion.div 
            className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
            animate={{ width: `${ropePosition}%` }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
            {[...Array(19)].map((_, i) => (
              <div key={i} className="w-0.5 h-6 bg-amber-800/50" />
            ))}
          </div>
        </div>
        
        {/* Markaz belgisi */}
        <div className="absolute transform -translate-x-1/2 left-1/2 -top-4">
          <div className="w-4 h-8 bg-red-500 rounded-full shadow-lg"></div>
        </div>
        
        {/* Tortish kuchi animatsiyasi */}
        {pullDirection && !roundActive && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute text-center transform -translate-x-1/2 -top-8 left-1/2"
          >
            <div className="px-3 py-1 text-sm font-bold text-white bg-orange-500 rounded-full whitespace-nowrap">
              {pullDirection === 'left' ? '← Chap tortdi!' : 'O‘ng tortdi! →'}
            </div>
          </motion.div>
        )}
      </div>

      {/* Tortish natijasi xabari */}
      {pullMsg && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 mb-4 text-center bg-white shadow-md rounded-xl"
        >
          <p className="text-gray-700">{pullMsg}</p>
        </motion.div>
      )}

      {/* G'olib xabari */}
      {winner && (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 text-center bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl"
        >
          {winner === 'left' && (
            <>
              <div className="mb-2 text-5xl">🏆🎉</div>
              <div className="text-3xl font-bold text-white">CHAP JAMOA G'ALABA QOZONDI!</div>
            </>
          )}
          {winner === 'right' && (
            <>
              <div className="mb-2 text-5xl">🏆🎉</div>
              <div className="text-3xl font-bold text-white">O'NG JAMOA G'ALABA QOZONDI!</div>
            </>
          )}
          {winner === 'draw' && (
            <>
              <div className="mb-2 text-5xl">🤝</div>
              <div className="text-3xl font-bold text-white">DURANG!</div>
            </>
          )}
          <div className="mt-2 text-xl text-white/90">Hisob: {leftScore} - {rightScore}</div>
          <button onClick={resetGame} className="px-6 py-2 mt-4 font-bold text-gray-800 bg-white rounded-xl">🔄 Yangi o'yin</button>
        </motion.div>
      )}

      {/* Chap jamoa modal */}
      <AnimatePresence>
        {showLeftModal && leftQuestion && !winner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="w-full max-w-md mx-4 overflow-hidden shadow-2xl bg-gradient-to-br from-blue-900 to-indigo-900 rounded-3xl"
            >
              <div className="p-4 text-center bg-blue-800/50">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-4xl">🔵</span>
                  <span className="text-2xl font-bold text-yellow-400">CHAP JAMOA</span>
                </div>
                <div className="text-white">
                  <span className={`text-2xl font-bold ${leftTimeLeft <= 5 ? 'text-red-400 animate-pulse' : ''}`}>⏱️ {leftTimeLeft}</span>
                  <span> soniya</span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="p-4 mb-4 text-center bg-white/10 rounded-2xl">
                  <p className="text-xl font-bold text-white">{leftQuestion.text}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {leftQuestion.options && leftQuestion.options.map((opt, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleLeftAnswer(opt)}
                      className="py-3 text-lg font-bold text-white transition bg-white/20 hover:bg-white/30 rounded-xl"
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div className="p-3 text-sm text-center text-blue-300 bg-blue-800/30">
                Javob berish uchun variantlardan birini tanlang
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* O'ng jamoa modal */}
      <AnimatePresence>
        {showRightModal && rightQuestion && !winner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="w-full max-w-md mx-4 overflow-hidden shadow-2xl bg-gradient-to-br from-pink-900 to-rose-900 rounded-3xl"
            >
              <div className="p-4 text-center bg-pink-800/50">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-4xl">🔴</span>
                  <span className="text-2xl font-bold text-yellow-400">O'NG JAMOA</span>
                </div>
                <div className="text-white">
                  <span className={`text-2xl font-bold ${rightTimeLeft <= 5 ? 'text-red-400 animate-pulse' : ''}`}>⏱️ {rightTimeLeft}</span>
                  <span> soniya</span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="p-4 mb-4 text-center bg-white/10 rounded-2xl">
                  <p className="text-xl font-bold text-white">{rightQuestion.text}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {rightQuestion.options && rightQuestion.options.map((opt, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRightAnswer(opt)}
                      className="py-3 text-lg font-bold text-white transition bg-white/20 hover:bg-white/30 rounded-xl"
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div className="p-3 text-sm text-center text-pink-300 bg-pink-800/30">
                Javob berish uchun variantlardan birini tanlang
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Javob kutish indikatori */}
      {roundActive && !leftAnswered && !rightAnswered && !winner && (
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-blue-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            <span className="text-sm">Chap jamoa javob kutilmoqda...</span>
          </div>
          <div className="flex items-center gap-2 text-pink-600">
            <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            <span className="text-sm">O'ng jamoa javob kutilmoqda...</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ========== BATTLE QUIZ ARENA ==========
const BattleQuizArena = ({ grade, subject, onBack }) => {
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [activeTeam, setActiveTeam] = useState('A');
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(true);
  const [round, setRound] = useState(1);
  const [usedIds, setUsedIds] = useState(new Set());

  const loadQuestion = useCallback(() => {
    const newQuestion = getUniqueQuestion(subject, grade, usedIds, setUsedIds);
    if (newQuestion) {
      setCurrentQuestion(newQuestion);
      setTimeLeft(15);
    } else {
      setGameActive(false);
    }
  }, [subject, grade, usedIds]);

  useEffect(() => {
    loadQuestion();
  }, [round, loadQuestion]);

  useEffect(() => {
    if (timeLeft > 0 && gameActive && currentQuestion) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameActive) {
      setActiveTeam(prev => prev === 'A' ? 'B' : 'A');
      loadQuestion();
    }
  }, [timeLeft, gameActive, currentQuestion, loadQuestion]);

  const handleAnswer = (team, answer) => {
    if (!currentQuestion || !gameActive) return;
    
    if (answer === currentQuestion.answer) {
      if (team === 'A') setTeamAScore(prev => prev + 10);
      else setTeamBScore(prev => prev + 10);
      
      if (round >= 10) {
        setGameActive(false);
      } else {
        setRound(prev => prev + 1);
        setActiveTeam(prev => prev === 'A' ? 'B' : 'A');
        loadQuestion();
      }
    } else {
      setActiveTeam(prev => prev === 'A' ? 'B' : 'A');
      loadQuestion();
    }
  };

  const resetGame = () => {
    setTeamAScore(0);
    setTeamBScore(0);
    setRound(1);
    setGameActive(true);
    setUsedIds(new Set());
    setActiveTeam('A');
    loadQuestion();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-white shadow-xl rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">⚔️ Battle Quiz Arena</h2>
        <div className="flex gap-2">
          <button onClick={resetGame} className="px-4 py-2 text-white bg-purple-500 rounded-xl">🔄 Yangi</button>
          <button onClick={onBack} className="px-4 py-2 bg-gray-200 rounded-xl">← Orqaga</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className={`bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white text-center ${activeTeam === 'A' && gameActive ? 'ring-4 ring-yellow-400' : ''}`}>
          <div className="mb-2 text-4xl">🔵 A JAMOA</div>
          <div className="text-6xl font-bold">{teamAScore}</div>
          <div className="mt-2 text-sm">{round}/10 tur</div>
        </div>
        
        <div className={`bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl p-6 text-white text-center ${activeTeam === 'B' && gameActive ? 'ring-4 ring-yellow-400' : ''}`}>
          <div className="mb-2 text-4xl">🔴 B JAMOA</div>
          <div className="text-6xl font-bold">{teamBScore}</div>
          <div className="mt-2 text-sm">{round}/10 tur</div>
        </div>
      </div>

      {currentQuestion && gameActive && (
        <div className="p-6 text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl">
          <div className="mb-4 text-center">
            <div className="inline-block px-4 py-2 text-sm rounded-full bg-white/20">🎯 {activeTeam === 'A' ? 'A jamoasi javob beradi' : 'B jamoasi javob beradi'}</div>
            <div className="mt-2 text-2xl font-bold">⏱️ {timeLeft} soniya</div>
          </div>
          <p className="mb-6 text-2xl font-bold text-center">{currentQuestion.text}</p>
          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options && currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(activeTeam, opt)}
                className="p-4 text-lg font-bold text-center transition bg-white/20 hover:bg-white/30 rounded-xl"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {!gameActive && (
        <div className="p-8 text-center bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl">
          <div className="mb-2 text-4xl font-bold text-white">🏆 O'yin yakunlandi!</div>
          <div className="text-2xl text-white">{teamAScore > teamBScore ? 'A jamoasi g\'alaba qozondi!' : teamBScore > teamAScore ? 'B jamoasi g\'alaba qozondi!' : "Durang!"}</div>
          <div className="mt-2 text-white/80">Final: {teamAScore} - {teamBScore}</div>
          <button onClick={resetGame} className="px-6 py-2 mt-4 text-gray-800 bg-white rounded-xl">Yangi o'yin</button>
        </div>
      )}
    </motion.div>
  );
};

// ========== TIME BOMB QUIZ ==========
const TimeBombQuiz = ({ grade, subject, onBack }) => {
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [exploded, setExploded] = useState(false);
  const [usedIds, setUsedIds] = useState(new Set());

  const loadQuestion = useCallback(() => {
    const newQuestion = getUniqueQuestion(subject, grade, usedIds, setUsedIds);
    if (newQuestion) {
      setCurrentQuestion(newQuestion);
      setTimeLeft(10);
    } else {
      setExploded(true);
    }
  }, [subject, grade, usedIds]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  useEffect(() => {
    if (timeLeft > 0 && !exploded && currentQuestion) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !exploded) {
      setExploded(true);
    }
  }, [timeLeft, exploded, currentQuestion]);

  const handleAnswer = (answer) => {
    if (exploded || !currentQuestion) return;
    if (answer === currentQuestion.answer) {
      setScore(prev => prev + 10);
      loadQuestion();
    } else {
      setExploded(true);
    }
  };

  const resetGame = () => {
    setScore(0);
    setExploded(false);
    setUsedIds(new Set());
    loadQuestion();
  };

  return (
    <div className="p-6 bg-white shadow-xl rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">💣 Time Bomb Quiz</h2>
        <div className="flex gap-2">
          <button onClick={resetGame} className="px-4 py-2 text-white bg-red-500 rounded-xl">🔄 Qayta</button>
          <button onClick={onBack} className="px-4 py-2 bg-gray-200 rounded-xl">← Orqaga</button>
        </div>
      </div>
      <div className="mb-6 text-center">
        <div className="text-4xl font-bold text-purple-600">⭐ {score} ball</div>
      </div>
      {!exploded && currentQuestion && (
        <div className="p-6 text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl">
          <div className={`text-center mb-4 text-4xl font-bold ${timeLeft <= 3 ? 'animate-pulse text-yellow-300' : ''}`}>💣 {timeLeft}s</div>
          <p className="mb-6 text-2xl font-bold text-center">{currentQuestion.text}</p>
          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options && currentQuestion.options.map((opt, idx) => (
              <button key={idx} onClick={() => handleAnswer(opt)} className="p-4 text-lg font-bold text-center transition bg-white/20 hover:bg-white/30 rounded-xl">
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
      {exploded && (
        <div className="p-8 text-center bg-red-500 rounded-2xl">
          <div className="mb-4 text-6xl">💥</div>
          <div className="text-3xl font-bold text-white">BOMB PORTLADI!</div>
          <div className="mt-2 text-white/80">Ball: {score}</div>
          <button onClick={resetGame} className="px-6 py-2 mt-4 text-gray-800 bg-white rounded-xl">Yangi o'yin</button>
        </div>
      )}
    </div>
  );
};

// ========== SPEED RUN ==========
const SpeedRun = ({ grade, subject, onBack }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [gameActive, setGameActive] = useState(true);
  const [usedIds, setUsedIds] = useState(new Set());

  const loadQuestion = useCallback(() => {
    const newQuestion = getUniqueQuestion(subject, grade, usedIds, setUsedIds);
    if (newQuestion) {
      setCurrentQuestion(newQuestion);
    } else {
      setGameActive(false);
    }
  }, [subject, grade, usedIds]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  useEffect(() => {
    if (timeLeft > 0 && gameActive) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameActive(false);
    }
  }, [timeLeft, gameActive]);

  const handleAnswer = (answer) => {
    if (!gameActive || !currentQuestion) return;
    if (answer === currentQuestion.answer) {
      setScore(prev => prev + 10);
      loadQuestion();
    } else {
      loadQuestion();
    }
  };

  const resetGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameActive(true);
    setUsedIds(new Set());
    loadQuestion();
  };

  return (
    <div className="p-6 bg-white shadow-xl rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🏆 Speed Run</h2>
        <div className="flex gap-2">
          <button onClick={resetGame} className="px-4 py-2 text-white bg-green-500 rounded-xl">🔄 Qayta</button>
          <button onClick={onBack} className="px-4 py-2 bg-gray-200 rounded-xl">← Orqaga</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 text-center bg-blue-100 rounded-2xl"><div className="text-3xl font-bold text-blue-600">⭐ {score}</div><div className="text-sm">Ball</div></div>
        <div className="p-4 text-center bg-orange-100 rounded-2xl"><div className="text-3xl font-bold text-orange-600">⏱️ {timeLeft}</div><div className="text-sm">soniya</div></div>
      </div>
      {gameActive && currentQuestion && (
        <div className="p-6 text-white bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl">
          <p className="mb-6 text-2xl font-bold text-center">{currentQuestion.text}</p>
          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options && currentQuestion.options.map((opt, idx) => (
              <button key={idx} onClick={() => handleAnswer(opt)} className="p-4 text-lg font-bold text-center transition bg-white/20 hover:bg-white/30 rounded-xl">
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
      {!gameActive && (
        <div className="p-8 text-center bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl">
          <div className="text-4xl font-bold text-white">🏆 Tugadi!</div>
          <div className="mt-2 text-2xl text-white">Ball: {score}</div>
          <button onClick={resetGame} className="px-6 py-2 mt-4 text-gray-800 bg-white rounded-xl">Yangi o'yin</button>
        </div>
      )}
    </div>
  );
};

// ========== WORD BUILDER PRO ==========
const WordBuilderPro = ({ grade, subject, onBack }) => {
  const words = {
    mathematics: { 1: "SON", 2: "RAQAM", 3: "TENGLAMA" },
    uzbek: { 1: "KITOB", 2: "MAKTAB", 3: "DO'ST" },
    english: { 1: "BOOK", 2: "SCHOOL", 3: "FRIEND" },
    history: { 1: "TEMUR", 2: "NAVOI", 3: "MUSTAQILLIK" },
    geography: { 1: "TOSHKENT", 2: "OKEAN", 3: "MATERIK" },
    biology: { 1: "HURAYRA", 2: "ORGAN", 3: "EKOTIZIM" },
    physics: { 1: "KUCH", 2: "ENERGIYA", 3: "GRAVITATSIYA" },
    chemistry: { 1: "SUYUKLIK", 2: "GAZ", 3: "REAKSIYA" }
  };
  
  const level = getDifficultyLevel(grade);
  const targetWord = words[subject]?.[level] || words[subject]?.[1] || "O'YIN";
  
  const [letters, setLetters] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);

  useEffect(() => {
    const shuffled = targetWord.split('').sort(() => Math.random() - 0.5);
    setLetters(shuffled);
    setSelectedLetters([]);
  }, [targetWord]);

  const handleLetterClick = (index) => {
    const newLetters = [...letters];
    const letter = newLetters.splice(index, 1)[0];
    setLetters(newLetters);
    setSelectedLetters([...selectedLetters, letter]);
  };

  const handleUndo = () => {
    if (selectedLetters.length === 0) return;
    const lastLetter = selectedLetters[selectedLetters.length - 1];
    setSelectedLetters(selectedLetters.slice(0, -1));
    setLetters([...letters, lastLetter]);
  };

  const checkWord = () => {
    if (selectedLetters.join('') === targetWord) {
      setMessage('🎉 To‘g‘ri! Ajoyib! 🎉');
      setScore(score + 10);
      setTimeout(() => {
        const shuffled = targetWord.split('').sort(() => Math.random() - 0.5);
        setLetters(shuffled);
        setSelectedLetters([]);
        setMessage('');
      }, 1500);
    } else {
      setMessage('❌ Noto‘g‘ri! Qayta urinib ko‘ring!');
    }
  };

  const resetGame = () => {
    const shuffled = targetWord.split('').sort(() => Math.random() - 0.5);
    setLetters(shuffled);
    setSelectedLetters([]);
    setMessage('');
    setScore(0);
  };

  return (
    <div className="p-6 bg-white shadow-xl rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🔤 Word Builder</h2>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-yellow-100 rounded-xl">⭐ {score}</div>
          <button onClick={resetGame} className="px-4 py-2 text-white bg-blue-500 rounded-xl">🔄 Qayta</button>
          <button onClick={onBack} className="px-4 py-2 bg-gray-200 rounded-xl">← Orqaga</button>
        </div>
      </div>
      <div className="mb-6">
        <div className="mb-2 text-center text-gray-600">Harflar:</div>
        <div className="flex flex-wrap justify-center gap-3 p-4 bg-gray-100 rounded-2xl">
          {letters.map((letter, idx) => (
            <button key={idx} onClick={() => handleLetterClick(idx)} className="w-16 h-16 text-3xl font-bold text-white transition bg-blue-500 shadow-lg rounded-xl hover:scale-110">
              {letter}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <div className="mb-2 text-center text-gray-600">So'zingiz:</div>
        <div className="flex flex-wrap justify-center gap-3 p-4 bg-blue-50 rounded-2xl min-h-[100px]">
          {selectedLetters.map((letter, idx) => (
            <div key={idx} className="flex items-center justify-center w-16 h-16 text-3xl font-bold text-white bg-green-500 shadow-lg rounded-xl">
              {letter}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-4">
        <button onClick={handleUndo} className="px-6 py-3 text-lg font-bold text-white bg-orange-500 rounded-xl">↩️ Orqaga</button>
        <button onClick={checkWord} className="px-8 py-3 text-lg font-bold text-white bg-green-500 rounded-xl">✅ Tekshirish</button>
      </div>
      {message && <div className={`mt-4 text-center p-4 rounded-xl ${message.includes('To‘g‘ri') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}
    </div>
  );
};

// ========== O'YIN TANLASH EKRANI ==========
const GameSelectionScreen = ({ grade, subject, onBack, onSelectGame }) => {
  const games = [
    { id: 'tug_of_war', name: '🪢 Arqon tortish', desc: '2 jamoa, kim kuchli?', color: 'from-orange-400 to-red-500' },
    { id: 'battle_quiz', name: '⚔️ Battle Quiz Arena', desc: '2 jamoa, kim tez va to‘g‘ri?', color: 'from-purple-400 to-pink-500' },
    { id: 'time_bomb', name: '💣 Time Bomb', desc: 'Xato javob - bomba portlaydi!', color: 'from-red-400 to-red-600' },
    { id: 'speed_run', name: '🏆 Speed Run', desc: '60 soniyada maksimal ball', color: 'from-green-400 to-teal-500' },
    { id: 'word_builder', name: '🔤 Word Builder', desc: 'Harflardan so‘z tuzing', color: 'from-blue-400 to-indigo-500' }
  ];

  const getSubjectName = (subId) => {
    const subjects = {
      mathematics: 'Matematika', uzbek: 'O‘zbek tili', english: 'Ingliz tili',
      history: 'Tarix', geography: 'Geografiya', biology: 'Biologiya',
      physics: 'Fizika', chemistry: 'Kimyo'
    };
    return subjects[subId] || subId;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-white shadow-xl rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🎮 O‘yin tanlash</h2>
          <p className="mt-1 text-gray-500">Sinf: {grade} | Fan: {getSubjectName(subject)}</p>
        </div>
        <button onClick={onBack} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">← Orqaga</button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {games.map((game) => (
          <motion.button key={game.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onSelectGame(game.id)} className={`bg-gradient-to-r ${game.color} p-5 rounded-2xl text-white text-left shadow-lg transition-all`}>
            <div className="mb-2 text-4xl">{game.name.split(' ')[0]}</div>
            <h3 className="text-xl font-bold">{game.name}</h3>
            <p className="mt-1 text-sm text-white/80">{game.desc}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

// ========== START SCREEN ==========
const StartScreen = ({ onStart }) => {
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const subjects = [
    { id: 'mathematics', name: 'Matematika', icon: '📐', color: 'from-blue-400 to-blue-600' },
    { id: 'uzbek', name: 'O‘zbek tili', icon: '📖', color: 'from-green-400 to-green-600' },
    { id: 'english', name: 'Ingliz tili', icon: '🇬🇧', color: 'from-red-400 to-red-600' },
    { id: 'history', name: 'Tarix', icon: '🏛️', color: 'from-amber-400 to-amber-600' },
    { id: 'geography', name: 'Geografiya', icon: '🌍', color: 'from-emerald-400 to-emerald-600' },
    { id: 'biology', name: 'Biologiya', icon: '🧬', color: 'from-lime-400 to-lime-600' },
    { id: 'physics', name: 'Fizika', icon: '⚡', color: 'from-cyan-400 to-cyan-600' },
    { id: 'chemistry', name: 'Kimyo', icon: '🧪', color: 'from-violet-400 to-violet-600' }
  ];

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl p-8 mx-auto bg-white shadow-2xl rounded-3xl">
      <div className="mb-8 text-center">
        <div className="mb-4 text-6xl">🎓</div>
        <h1 className="text-3xl font-bold text-gray-800">EduPlay Arena</h1>
        <p className="mt-2 text-gray-500">O‘yin orqali o‘rganing!</p>
      </div>
      <div className="mb-8">
        <label className="block mb-2 text-sm font-medium text-gray-700">1. Sinfni tanlang:</label>
        <div className="grid grid-cols-5 gap-2 md:grid-cols-11">
          {[...Array(11)].map((_, i) => (
            <button key={i+1} onClick={() => setSelectedGrade(i+1)} className={`py-3 rounded-xl font-bold transition-all ${selectedGrade === i+1 ? 'bg-blue-500 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{i+1}</button>
          ))}
        </div>
      </div>
      <div className="mb-8">
        <label className="block mb-2 text-sm font-medium text-gray-700">2. Fanni tanlang:</label>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {subjects.map((sub) => (
            <button key={sub.id} onClick={() => setSelectedSubject(sub.id)} className={`flex items-center gap-2 p-3 rounded-xl transition-all ${selectedSubject === sub.id ? `bg-gradient-to-r ${sub.color} text-white shadow-lg` : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
              <span className="text-xl">{sub.icon}</span><span className="text-sm">{sub.name}</span>
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => onStart(selectedGrade, selectedSubject)} disabled={!selectedGrade || !selectedSubject} className="w-full py-4 text-lg font-bold text-white transition bg-gradient-to-r from-green-400 to-blue-500 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105">
        🚀 O‘yinlarni boshlash →
      </button>
    </motion.div>
  );
};

// ========== MAIN GAME VIEW ==========
const MainGameView = () => {
  const [showStart, setShowStart] = useState(true);
  const [grade, setGrade] = useState(null);
  const [subject, setSubject] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);

  const handleStart = (g, s) => { setGrade(g); setSubject(s); setShowStart(false); };
  const handleBackToStart = () => { setShowStart(true); setGrade(null); setSubject(null); setSelectedGame(null); };
  const handleBackToGames = () => { setSelectedGame(null); };

  if (showStart) return <StartScreen onStart={handleStart} />;
  if (!selectedGame) return <GameSelectionScreen grade={grade} subject={subject} onBack={handleBackToStart} onSelectGame={setSelectedGame} />;
  
  const games = { tug_of_war: TugOfWarGame, battle_quiz: BattleQuizArena, time_bomb: TimeBombQuiz, speed_run: SpeedRun, word_builder: WordBuilderPro };
  const GameComp = games[selectedGame];
  return <GameComp grade={grade} subject={subject} onBack={handleBackToGames} />;
};

// ========== TEACHER LAYOUT ==========
const TeacherLayoutComponent = (props) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState("Bosh sahifa");

  useEffect(() => {
    const handleResize = () => window.innerWidth < 1200 ? setOpen(false) : setOpen(true);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getRoutes = (routes) => routes.map((prop, key) => prop.layout === "/teacher" ? <Route path={`/${prop.path}`} element={prop.component} key={key} /> : null);
  const isGamesRoute = location.pathname === "/teacher/games";

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <TeacherSidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TeacherNavbar onOpenSidenav={() => setOpen(true)} logoText="" brandText={isGamesRoute ? "O‘yinlar" : currentRoute} {...props} />
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {isGamesRoute ? <MainGameView /> : <Routes>{getRoutes(teacherRoutes)}{teacherDetailRoutes.map((prop, key) => <Route path={`/${prop.path}`} element={prop.component} key={key} />)}<Route path="/" element={<Navigate to="/teacher/default" replace />} /></Routes>}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherLayoutComponent;