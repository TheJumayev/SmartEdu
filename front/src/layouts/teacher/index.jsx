// ============================================
// src/layouts/teacher/index.jsx
// TO'LIQ QAYTA YOZILGAN - SAVOLLAR TAKRORLANMAYDI
// ============================================

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TeacherNavbar from "./navbar/index";
import TeacherSidebar from "./sidebar/index";
import teacherRoutes, { teacherDetailRoutes } from "../../routes/teacher";

// ========== FANLAR BO'YICHA SAVOLLAR BAZASI (TAKRORLANMAYDIGAN) ==========
const QUESTION_BANKS = {
  mathematics: {
    1: [
      { text: "2 + 2 = ?", answer: 4, options: [3, 4, 5, 6] },
      { text: "5 - 3 = ?", answer: 2, options: [1, 2, 3, 4] },
      { text: "3 × 2 = ?", answer: 6, options: [4, 5, 6, 7] },
      { text: "10 ÷ 2 = ?", answer: 5, options: [3, 4, 5, 6] },
      { text: "7 + 1 = ?", answer: 8, options: [6, 7, 8, 9] }
    ],
    2: [
      { text: "12 - 5 = ?", answer: 7, options: [5, 6, 7, 8] },
      { text: "8 × 3 = ?", answer: 24, options: [21, 22, 23, 24] },
      { text: "15 + 7 = ?", answer: 22, options: [20, 21, 22, 23] },
      { text: "36 ÷ 4 = ?", answer: 9, options: [7, 8, 9, 10] },
      { text: "9 × 4 = ?", answer: 36, options: [32, 34, 36, 38] }
    ],
    3: [
      { text: "144 ÷ 12 = ?", answer: 12, options: [10, 11, 12, 13] },
      { text: "15 × 6 = ?", answer: 90, options: [85, 88, 90, 92] },
      { text: "2x + 5 = 15, x = ?", answer: 5, options: [3, 4, 5, 6] },
      { text: "3² + 4² = ?", answer: 25, options: [20, 22, 25, 28] }
    ]
  },
  uzbek: {
    1: [
      { text: "'Olma' so'zining ma'nosi?", answer: "Apple", options: ["Apple", "Pear", "Grape", "Banana"] },
      { text: "'Kitob' so'zining inglizchasi?", answer: "Book", options: ["Pen", "Book", "Table", "Chair"] },
      { text: "'O'qituvchi' so'zining sinonimi?", answer: "Ustoz", options: ["Shogird", "Ustoz", "Talaba", "Maktab"] }
    ],
    2: [
      { text: "'Do'st' so'zining antonimi?", answer: "Dushman", options: ["Do'st", "Dushman", "Ota", "Ona"] },
      { text: "'Mehr' so'zining ma'nosi?", answer: "Love", options: ["Hate", "Love", "Anger", "Sad"] }
    ]
  },
  english: {
    1: [
      { text: "What is 'Apple' in Uzbek?", answer: "Olma", options: ["Olma", "Nok", "Banan", "Uzum"] },
      { text: "Translate: 'School'", answer: "Maktab", options: ["Maktab", "Universitet", "Kollej", "Litsey"] },
      { text: "What is 'Cat'?", answer: "Mushuk", options: ["It", "Mushuk", "Ot", "Sigir"] }
    ],
    2: [
      { text: "Translate: 'Beautiful'", answer: "Go'zal", options: ["Yomon", "Go'zal", "Katta", "Kichik"] },
      { text: "What is 'Friend'?", answer: "Do'st", options: ["Dushman", "Do'st", "Ota", "Ona"] }
    ]
  },
  history: {
    1: [
      { text: "Amir Temur qachon tug'ilgan?", answer: "1336", options: ["1320", "1336", "1340", "1350"] },
      { text: "Navoiy qaysi asrda yashagan?", answer: "15-asr", options: ["14-asr", "15-asr", "16-asr", "17-asr"] }
    ]
  },
  geography: {
    1: [
      { text: "O'zbekistonning poytaxti?", answer: "Toshkent", options: ["Samarqand", "Buxoro", "Toshkent", "Andijon"] },
      { text: "Eng katta okean?", answer: "Tinch okeani", options: ["Atlantika", "Hind", "Tinch okeani", "Shimoliy"] }
    ]
  },
  biology: {
    1: [
      { text: "Odamning eng katta organi?", answer: "Teri", options: ["Yurak", "Miya", "Teri", "O'pka"] },
      { text: "O'simliklar qanday moddani chiqaradi?", answer: "Kislorod", options: ["Uglerod", "Kislorod", "Vodorod", "Azot"] }
    ]
  },
  physics: {
    1: [
      { text: "Yorug'lik tezligi qancha?", answer: "300000 km/s", options: ["150000", "300000", "450000", "600000"] },
      { text: "Og'irlik kuchi qaysi?",
        answer: "Gravitatsiya", options: ["Magnit", "Gravitatsiya", "Elektr", "Yadro"] }
    ]
  },
  chemistry: {
    1: [
      { text: "Suvning kimyoviy formulasi?", answer: "H2O", options: ["CO2", "H2O", "O2", "NaCl"] },
      { text: "Tuzning formulasi?", answer: "NaCl", options: ["HCl", "NaCl", "H2O", "CO2"] }
    ]
  }
};

// Har bir fan uchun qo'shimcha savollar yaratish funksiyasi
const generateMoreQuestions = (subject, grade, count = 20) => {
  const questions = [];
  const baseQuestions = QUESTION_BANKS[subject]?.[Math.min(grade, 3)] || QUESTION_BANKS.mathematics[1];
  
  for (let i = 0; i < count; i++) {
    const template = baseQuestions[i % baseQuestions.length];
    const newQuestion = {
      ...template,
      text: template.text,
      answer: template.answer,
      options: [...template.options].sort(() => Math.random() - 0.5)
    };
    questions.push(newQuestion);
  }
  return questions;
};

// Savol olish - takrorlanmaydigan
const getUniqueQuestion = (subject, grade, usedQuestions, setUsedQuestions) => {
  const level = Math.min(Math.ceil(grade / 4), 3);
  const bank = QUESTION_BANKS[subject] || QUESTION_BANKS.mathematics;
  const levelQuestions = bank[level] || bank[1];
  
  const availableQuestions = levelQuestions.filter(q => !usedQuestions.includes(JSON.stringify(q)));
  
  if (availableQuestions.length === 0) {
    // Agar barcha savollar ishlatilgan bo'lsa, yangi savol yaratish
    const newQuestion = {
      text: `${subject === 'mathematics' ? Math.floor(Math.random() * 50) + 1 : 'Yangi'} ${Math.floor(Math.random() * 100)}?`,
      answer: Math.floor(Math.random() * 50) + 1,
      options: [1, 2, 3, 4].map(() => Math.floor(Math.random() * 100) + 1)
    };
    setUsedQuestions(prev => [...prev, JSON.stringify(newQuestion)]);
    return newQuestion;
  }
  
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  const question = availableQuestions[randomIndex];
  setUsedQuestions(prev => [...prev, JSON.stringify(question)]);
  
  return {
    ...question,
    options: [...question.options].sort(() => Math.random() - 0.5)
  };
};

// ========== ARQON TORTISH O'YINI (YANGILANGAN) ==========
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
  const [roundActive, setRoundActive] = useState(true);
  const [leftUsedQuestions, setLeftUsedQuestions] = useState([]);
  const [rightUsedQuestions, setRightUsedQuestions] = useState([]);
  
  const leftTimerRef = useRef(null);
  const rightTimerRef = useRef(null);

  // Yangi savollar yuklash
  const loadQuestions = useCallback(() => {
    const newLeftQuestion = getUniqueQuestion(subject, grade, leftUsedQuestions, setLeftUsedQuestions);
    const newRightQuestion = getUniqueQuestion(subject, grade, rightUsedQuestions, setRightUsedQuestions);
    
    setLeftQuestion(newLeftQuestion);
    setRightQuestion(newRightQuestion);
    setLeftTimeLeft(15);
    setRightTimeLeft(15);
    setLeftAnswered(false);
    setRightAnswered(false);
    setShowLeftModal(true);
    setShowRightModal(true);
    setRoundActive(true);
  }, [subject, grade, leftUsedQuestions, rightUsedQuestions]);

  // Vaqt hisoblagichlari
  useEffect(() => {
    if (showLeftModal && leftTimeLeft > 0 && !leftAnswered && roundActive) {
      leftTimerRef.current = setTimeout(() => setLeftTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(leftTimerRef.current);
    } else if (leftTimeLeft === 0 && !leftAnswered && roundActive) {
      setLeftAnswered(true);
      setShowLeftModal(false);
    }
  }, [leftTimeLeft, showLeftModal, leftAnswered, roundActive]);

  useEffect(() => {
    if (showRightModal && rightTimeLeft > 0 && !rightAnswered && roundActive) {
      rightTimerRef.current = setTimeout(() => setRightTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(rightTimerRef.current);
    } else if (rightTimeLeft === 0 && !rightAnswered && roundActive) {
      setRightAnswered(true);
      setShowRightModal(false);
    }
  }, [rightTimeLeft, showRightModal, rightAnswered, roundActive]);

  // Javobni tekshirish va g'olibni aniqlash
  const checkAnswers = useCallback(() => {
    if (!roundActive) return;
    
    const leftCorrect = leftAnswered && leftQuestion && leftQuestion.answer === leftUserAnswer;
    const rightCorrect = rightAnswered && rightQuestion && rightQuestion.answer === rightUserAnswer;
    
    if (leftCorrect && !rightCorrect) {
      // Chap jamoa yutdi
      const newPosition = Math.max(0, ropePosition - 20);
      setRopePosition(newPosition);
      setLeftScore(prev => prev + 1);
      if (newPosition <= 0) setWinner('left');
    } else if (!leftCorrect && rightCorrect) {
      // O'ng jamoa yutdi
      const newPosition = Math.min(100, ropePosition + 20);
      setRopePosition(newPosition);
      setRightScore(prev => prev + 1);
      if (newPosition >= 100) setWinner('right');
    } else if (leftCorrect && rightCorrect) {
      // Ikkalasi ham to'g'ri - hech kim yutmadi
      // Hech narsa o'zgarmaydi
    } else {
      // Ikkalasi ham noto'g'ri - hech kim yutmadi
    }
    
    setRoundActive(false);
    
    setTimeout(() => {
      if (!winner) {
        loadQuestions();
      }
    }, 1500);
  }, [leftAnswered, rightAnswered, leftQuestion, rightQuestion, ropePosition, roundActive, winner]);

  const [leftUserAnswer, setLeftUserAnswer] = useState(null);
  const [rightUserAnswer, setRightUserAnswer] = useState(null);

  const handleLeftAnswer = (answer) => {
    if (leftAnswered || !roundActive) return;
    setLeftUserAnswer(answer);
    setLeftAnswered(true);
    setShowLeftModal(false);
    clearTimeout(leftTimerRef.current);
    checkAnswers();
  };

  const handleRightAnswer = (answer) => {
    if (rightAnswered || !roundActive) return;
    setRightUserAnswer(answer);
    setRightAnswered(true);
    setShowRightModal(false);
    clearTimeout(rightTimerRef.current);
    checkAnswers();
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const resetGame = () => {
    setRopePosition(50);
    setLeftScore(0);
    setRightScore(0);
    setWinner(null);
    setLeftUsedQuestions([]);
    setRightUsedQuestions([]);
    loadQuestions();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🪢 Arqon tortish o‘yini</h2>
        <div className="flex gap-2">
          <button onClick={resetGame} className="px-4 py-2 text-white transition bg-blue-500 rounded-xl hover:scale-105">🔄 Qayta</button>
          <button onClick={onBack} className="px-4 py-2 text-gray-700 transition bg-gray-200 rounded-xl hover:bg-gray-300">← Orqaga</button>
        </div>
      </div>

      {/* Ikkala jamoa */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Chap jamoa */}
        <div className="text-center">
          <div className="p-4 text-white bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl">
            <div className="mb-2 text-3xl">👥 Chap jamoa</div>
            <div className="flex justify-center gap-2 mb-3">
              {[1, 2, 3].map(i => (
                <motion.div 
                  key={i}
                  animate={{ y: leftAnswered && !winner ? [0, -10, 0] : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center text-2xl rounded-full w-14 h-14 bg-white/20 backdrop-blur"
                >
                  {i === 1 ? '👨‍🎓' : i === 2 ? '👩‍🎓' : '🧑‍🎓'}
                </motion.div>
              ))}
            </div>
            <div className="text-5xl font-bold">{leftScore}</div>
            {leftAnswered && leftUserAnswer && leftQuestion && leftUserAnswer === leftQuestion.answer && (
              <div className="mt-2 text-green-300">✅ To'g'ri!</div>
            )}
            {leftAnswered && leftUserAnswer && leftQuestion && leftUserAnswer !== leftQuestion.answer && (
              <div className="mt-2 text-red-300">❌ Xato!</div>
            )}
          </div>
        </div>

        {/* O'ng jamoa */}
        <div className="text-center">
          <div className="p-4 text-white bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl">
            <div className="mb-2 text-3xl">👥 O‘ng jamoa</div>
            <div className="flex justify-center gap-2 mb-3">
              {[1, 2, 3].map(i => (
                <motion.div 
                  key={i}
                  animate={{ y: rightAnswered && !winner ? [0, -10, 0] : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center text-2xl rounded-full w-14 h-14 bg-white/20 backdrop-blur"
                >
                  {i === 1 ? '👨‍🎓' : i === 2 ? '👩‍🎓' : '🧑‍🎓'}
                </motion.div>
              ))}
            </div>
            <div className="text-5xl font-bold">{rightScore}</div>
            {rightAnswered && rightUserAnswer && rightQuestion && rightUserAnswer === rightQuestion.answer && (
              <div className="mt-2 text-green-300">✅ To'g'ri!</div>
            )}
            {rightAnswered && rightUserAnswer && rightQuestion && rightUserAnswer !== rightQuestion.answer && (
              <div className="mt-2 text-red-300">❌ Xato!</div>
            )}
          </div>
        </div>
      </div>

      {/* Arqon animatsiyasi */}
      <div className="relative mb-8">
        <div className="h-8 overflow-hidden rounded-full shadow-inner bg-amber-700">
          <motion.div 
            className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
            animate={{ width: `${ropePosition}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        </div>
        {/* Arqon markeri */}
        <motion.div 
          className="absolute w-3 h-12 -translate-y-1/2 bg-red-500 rounded-full shadow-lg top-1/2"
          animate={{ left: `${ropePosition}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
        {/* Arqon iplari */}
        <div className="absolute left-0 right-0 flex justify-between px-4 -top-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-0.5 h-4 bg-amber-600" />
          ))}
        </div>
      </div>

      {/* G'olib xabari */}
      {winner && (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 text-center bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl"
        >
          <div className="text-4xl font-bold text-white">🏆 {winner === 'left' ? 'Chap jamoa' : 'O‘ng jamoa'} g‘alaba qozondi! 🏆</div>
          <div className="mt-2 text-lg text-white/90">Hisob: {leftScore} - {rightScore}</div>
        </motion.div>
      )}

      {/* Chap jamoa uchun modal */}
      <AnimatePresence>
        {showLeftModal && leftQuestion && !winner && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <div className="w-full max-w-md p-8 mx-4 shadow-2xl bg-gradient-to-br from-blue-900 to-indigo-900 rounded-3xl">
              <div className="mb-4 text-center">
                <div className="mb-2 text-5xl">🔵</div>
                <div className="text-2xl font-bold text-yellow-400">Chap jamoa</div>
                <div className="text-lg text-white/80">⏱️ {leftTimeLeft} soniya</div>
              </div>
              <div className="p-6 mb-6 bg-white/10 rounded-2xl backdrop-blur">
                <p className="text-2xl font-bold text-center text-white">{leftQuestion.text}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {leftQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLeftAnswer(opt)}
                    className="py-3 text-lg font-bold text-white transition bg-white/20 hover:bg-white/30 rounded-xl hover:scale-105"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* O'ng jamoa uchun modal */}
      <AnimatePresence>
        {showRightModal && rightQuestion && !winner && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <div className="w-full max-w-md p-8 mx-4 shadow-2xl bg-gradient-to-br from-pink-900 to-rose-900 rounded-3xl">
              <div className="mb-4 text-center">
                <div className="mb-2 text-5xl">🔴</div>
                <div className="text-2xl font-bold text-yellow-400">O'ng jamoa</div>
                <div className="text-lg text-white/80">⏱️ {rightTimeLeft} soniya</div>
              </div>
              <div className="p-6 mb-6 bg-white/10 rounded-2xl backdrop-blur">
                <p className="text-2xl font-bold text-center text-white">{rightQuestion.text}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {rightQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRightAnswer(opt)}
                    className="py-3 text-lg font-bold text-white transition bg-white/20 hover:bg-white/30 rounded-xl hover:scale-105"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [usedQuestions, setUsedQuestions] = useState([]);

  const loadQuestion = useCallback(() => {
    const newQuestion = getUniqueQuestion(subject, grade, usedQuestions, setUsedQuestions);
    setCurrentQuestion(newQuestion);
    setTimeLeft(15);
  }, [subject, grade, usedQuestions]);

  useEffect(() => {
    loadQuestion();
  }, [round]);

  useEffect(() => {
    if (timeLeft > 0 && gameActive && currentQuestion) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameActive) {
      setActiveTeam(prev => prev === 'A' ? 'B' : 'A');
      loadQuestion();
    }
  }, [timeLeft, gameActive]);

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
    }
  };

  const resetGame = () => {
    setTeamAScore(0);
    setTeamBScore(0);
    setRound(1);
    setGameActive(true);
    setUsedQuestions([]);
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
        <motion.div whileHover={{ scale: 1.02 }} className={`bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white text-center ${activeTeam === 'A' && gameActive ? 'ring-4 ring-yellow-400' : ''}`}>
          <div className="mb-2 text-4xl">🔵 A JAMOA</div>
          <div className="text-6xl font-bold">{teamAScore}</div>
          <div className="mt-2 text-sm">{round}/10 tur</div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className={`bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl p-6 text-white text-center ${activeTeam === 'B' && gameActive ? 'ring-4 ring-yellow-400' : ''}`}>
          <div className="mb-2 text-4xl">🔴 B JAMOA</div>
          <div className="text-6xl font-bold">{teamBScore}</div>
          <div className="mt-2 text-sm">{round}/10 tur</div>
        </motion.div>
      </div>

      {currentQuestion && gameActive && (
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="p-6 text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl">
          <div className="mb-4 text-center">
            <div className="inline-block px-4 py-2 text-sm rounded-full bg-white/20">🎯 {activeTeam === 'A' ? 'A jamoasi javob beradi' : 'B jamoasi javob beradi'}</div>
            <div className="mt-2 text-2xl font-bold">⏱️ {timeLeft} soniya</div>
          </div>
          <p className="mb-6 text-2xl font-bold text-center">{currentQuestion.text}</p>
          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(activeTeam, opt)}
                className="p-4 text-lg font-bold text-center transition bg-white/20 hover:bg-white/30 rounded-xl hover:scale-105"
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {!gameActive && (
        <div className="p-8 text-center bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl">
          <div className="mb-2 text-4xl font-bold text-white">🏆 O'yin yakunlandi!</div>
          <div className="text-2xl text-white">{teamAScore > teamBScore ? 'A jamoasi g\'alaba qozondi!' : teamBScore > teamAScore ? 'B jamoasi g\'alaba qozondi!' : "Durang!"}</div>
          <div className="mt-2 text-white/80">Final: {teamAScore} - {teamBScore}</div>
        </div>
      )}
    </motion.div>
  );
};

// ========== BOSHQA O'YINLAR (SODDA VERSIYADA) ==========
const TimeBombQuiz = ({ grade, subject, onBack }) => {
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [exploded, setExploded] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState([]);

  const loadQuestion = useCallback(() => {
    const newQuestion = getUniqueQuestion(subject, grade, usedQuestions, setUsedQuestions);
    setCurrentQuestion(newQuestion);
    setTimeLeft(10);
  }, [subject, grade, usedQuestions]);

  useEffect(() => {
    loadQuestion();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !exploded && currentQuestion) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !exploded) {
      setExploded(true);
    }
  }, [timeLeft, exploded]);

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
    setUsedQuestions([]);
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
            {currentQuestion.options.map((opt, idx) => (
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
        </div>
      )}
    </div>
  );
};

const SpeedRun = ({ grade, subject, onBack }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [gameActive, setGameActive] = useState(true);
  const [usedQuestions, setUsedQuestions] = useState([]);

  const loadQuestion = useCallback(() => {
    const newQuestion = getUniqueQuestion(subject, grade, usedQuestions, setUsedQuestions);
    setCurrentQuestion(newQuestion);
  }, [subject, grade, usedQuestions]);

  useEffect(() => {
    loadQuestion();
  }, []);

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

  return (
    <div className="p-6 bg-white shadow-xl rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🏆 Speed Run</h2>
        <button onClick={onBack} className="px-4 py-2 bg-gray-200 rounded-xl">← Orqaga</button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 text-center bg-blue-100 rounded-2xl"><div className="text-3xl font-bold text-blue-600">⭐ {score}</div><div className="text-sm">Ball</div></div>
        <div className="p-4 text-center bg-orange-100 rounded-2xl"><div className="text-3xl font-bold text-orange-600">⏱️ {timeLeft}</div><div className="text-sm">soniya</div></div>
      </div>
      {gameActive && currentQuestion && (
        <div className="p-6 text-white bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl">
          <p className="mb-6 text-2xl font-bold text-center">{currentQuestion.text}</p>
          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options.map((opt, idx) => (
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
        </div>
      )}
    </div>
  );
};

const WordBuilderPro = ({ grade, subject, onBack }) => {
  const words = {
    1: { uzbek: "KITOB", english: "BOOK", mathematics: "SON", history: "TEMUR" },
    2: { uzbek: "MAKTAB", english: "SCHOOL", mathematics: "RAQAM", history: "NAVOI" },
    3: { uzbek: "DO'ST", english: "FRIEND", mathematics: "TENGLAMA", history: "AMIR" }
  };
  
  const targetWord = words[Math.min(grade, 3)]?.[subject] || words[1].uzbek;
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

  return (
    <div className="p-6 bg-white shadow-xl rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🔤 Word Builder</h2>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-yellow-100 rounded-xl">⭐ {score}</div>
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
        <div className="flex flex-wrap justify-center gap-3 p-4 bg-blue-50 rounded-2xl">
          {selectedLetters.map((letter, idx) => (
            <div key={idx} className="flex items-center justify-center w-16 h-16 text-3xl font-bold text-white bg-green-500 shadow-lg rounded-xl">
              {letter}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center">
        <button onClick={checkWord} className="px-8 py-3 text-lg font-bold text-white bg-green-500 rounded-xl">✅ Tekshirish</button>
      </div>
      {message && <div className={`mt-4 text-center p-4 rounded-xl ${message.includes('To‘g‘ri') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}
    </div>
  );
};

// ========== O'YIN TANLASH EKRANI ==========
const GameSelectionScreen = ({ grade, subject, onBack, onSelectGame }) => {
  const games = [
    { id: 'battle_quiz', name: '⚔️ Battle Quiz Arena', desc: '2 jamoa, kim tez va to‘g‘ri?', color: 'from-purple-400 to-pink-500' },
    { id: 'tug_of_war', name: '🪢 Arqon tortish', desc: 'Bir vaqtda savol, kim birinchi to‘g‘ri javob bersa?', color: 'from-orange-400 to-red-500' },
    { id: 'time_bomb', name: '💣 Time Bomb', desc: 'Xato javob - bomba portlaydi!', color: 'from-red-400 to-red-600' },
    { id: 'speed_run', name: '🏆 Speed Run', desc: '60 soniyada maksimal ball', color: 'from-green-400 to-teal-500' },
    { id: 'word_builder', name: '🔤 Word Builder', desc: 'Harflardan so‘z tuzing', color: 'from-blue-400 to-indigo-500' }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-white shadow-xl rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold text-gray-800">🎮 O‘yin tanlash</h2><p className="mt-1 text-gray-500">Sinf: {grade} | Fan: {subject}</p></div>
        <button onClick={onBack} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">← Orqaga</button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {games.map((game) => (
          <motion.button key={game.id} whileHover={{ scale: 1.02 }} onClick={() => onSelectGame(game.id)} className={`bg-gradient-to-r ${game.color} p-5 rounded-2xl text-white text-left shadow-lg`}>
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
      <div className="mb-8 text-center"><div className="mb-4 text-6xl">🎓</div><h1 className="text-3xl font-bold text-gray-800">EduPlay Arena</h1><p className="mt-2 text-gray-500">O‘yin orqali o‘rganing!</p></div>
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
  
  const games = { battle_quiz: BattleQuizArena, tug_of_war: TugOfWarGame, time_bomb: TimeBombQuiz, speed_run: SpeedRun, word_builder: WordBuilderPro };
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