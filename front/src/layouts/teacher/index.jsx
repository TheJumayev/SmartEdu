// ============================================
// src/layouts/teacher/index.jsx
// TO'LIQ VA TUZATILGAN - BARCHA KOMPONENTLAR BILAN
// ============================================

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TeacherNavbar from "./navbar/index";
import TeacherSidebar from "./sidebar/index";
import teacherRoutes, { teacherDetailRoutes } from "../../routes/teacher";

// ========== KENGAYTIRILGAN SAVOLLAR BAZASI (KO'PROQ SAVOLLAR) ==========
// ========== YANADA KENGAYTIRILGAN SAVOLLAR BAZASI (50+ SAVOL HAR BIR FAN UCHUN) ==========
const QUESTION_BANKS = {
  mathematics: {
    1: [
      { id: 1, text: "2 + 2 = ?", answer: 4, options: [3, 4, 5, 6] },
      { id: 2, text: "5 - 3 = ?", answer: 2, options: [1, 2, 3, 4] },
      { id: 3, text: "3 × 2 = ?", answer: 6, options: [4, 5, 6, 7] },
      { id: 4, text: "10 ÷ 2 = ?", answer: 5, options: [3, 4, 5, 6] },
      { id: 5, text: "7 + 1 = ?", answer: 8, options: [6, 7, 8, 9] },
      { id: 6, text: "9 - 4 = ?", answer: 5, options: [4, 5, 6, 7] },
      { id: 7, text: "4 × 3 = ?", answer: 12, options: [10, 11, 12, 13] },
      { id: 8, text: "15 ÷ 3 = ?", answer: 5, options: [3, 4, 5, 6] },
      { id: 9, text: "8 + 7 = ?", answer: 15, options: [13, 14, 15, 16] },
      { id: 10, text: "20 - 12 = ?", answer: 8, options: [6, 7, 8, 9] },
      { id: 11, text: "6 + 6 = ?", answer: 12, options: [10, 11, 12, 13] },
      { id: 12, text: "9 - 5 = ?", answer: 4, options: [3, 4, 5, 6] },
      { id: 13, text: "5 × 2 = ?", answer: 10, options: [8, 9, 10, 11] },
      { id: 14, text: "16 ÷ 4 = ?", answer: 4, options: [3, 4, 5, 6] },
      { id: 15, text: "3 + 8 = ?", answer: 11, options: [10, 11, 12, 13] },
      { id: 16, text: "14 - 6 = ?", answer: 8, options: [7, 8, 9, 10] },
      { id: 17, text: "7 × 1 = ?", answer: 7, options: [6, 7, 8, 9] },
      { id: 18, text: "18 ÷ 2 = ?", answer: 9, options: [7, 8, 9, 10] },
      { id: 19, text: "4 + 9 = ?", answer: 13, options: [12, 13, 14, 15] },
      { id: 20, text: "11 - 4 = ?", answer: 7, options: [6, 7, 8, 9] },
      { id: 21, text: "2 × 6 = ?", answer: 12, options: [10, 11, 12, 13] },
      { id: 22, text: "20 ÷ 4 = ?", answer: 5, options: [4, 5, 6, 7] },
      { id: 23, text: "9 + 9 = ?", answer: 18, options: [16, 17, 18, 19] },
      { id: 24, text: "15 - 7 = ?", answer: 8, options: [7, 8, 9, 10] },
      { id: 25, text: "6 × 3 = ?", answer: 18, options: [16, 17, 18, 19] }
    ],
    2: [
      { id: 26, text: "12 - 5 = ?", answer: 7, options: [5, 6, 7, 8] },
      { id: 27, text: "8 × 3 = ?", answer: 24, options: [21, 22, 23, 24] },
      { id: 28, text: "15 + 7 = ?", answer: 22, options: [20, 21, 22, 23] },
      { id: 29, text: "36 ÷ 4 = ?", answer: 9, options: [7, 8, 9, 10] },
      { id: 30, text: "9 × 4 = ?", answer: 36, options: [32, 34, 36, 38] },
      { id: 31, text: "45 + 28 = ?", answer: 73, options: [71, 72, 73, 74] },
      { id: 32, text: "100 - 47 = ?", answer: 53, options: [51, 52, 53, 54] },
      { id: 33, text: "7 × 6 = ?", answer: 42, options: [40, 41, 42, 43] },
      { id: 34, text: "64 ÷ 8 = ?", answer: 8, options: [6, 7, 8, 9] },
      { id: 35, text: "24 + 36 = ?", answer: 60, options: [58, 59, 60, 61] },
      { id: 36, text: "81 ÷ 9 = ?", answer: 9, options: [7, 8, 9, 10] },
      { id: 37, text: "11 × 5 = ?", answer: 55, options: [53, 54, 55, 56] },
      { id: 38, text: "72 - 38 = ?", answer: 34, options: [32, 33, 34, 35] },
      { id: 39, text: "14 + 29 = ?", answer: 43, options: [41, 42, 43, 44] },
      { id: 40, text: "6 × 7 = ?", answer: 42, options: [40, 41, 42, 43] },
      { id: 41, text: "90 - 45 = ?", answer: 45, options: [43, 44, 45, 46] },
      { id: 42, text: "13 × 3 = ?", answer: 39, options: [36, 37, 38, 39] },
      { id: 43, text: "56 ÷ 7 = ?", answer: 8, options: [6, 7, 8, 9] },
      { id: 44, text: "25 + 35 = ?", answer: 60, options: [58, 59, 60, 61] },
      { id: 45, text: "120 - 75 = ?", answer: 45, options: [43, 44, 45, 46] },
      { id: 46, text: "4 × 12 = ?", answer: 48, options: [46, 47, 48, 49] },
      { id: 47, text: "99 ÷ 9 = ?", answer: 11, options: [9, 10, 11, 12] },
      { id: 48, text: "33 + 47 = ?", answer: 80, options: [78, 79, 80, 81] },
      { id: 49, text: "85 - 29 = ?", answer: 56, options: [54, 55, 56, 57] },
      { id: 50, text: "16 × 3 = ?", answer: 48, options: [46, 47, 48, 49] }
    ],
    3: [
      { id: 51, text: "144 ÷ 12 = ?", answer: 12, options: [10, 11, 12, 13] },
      { id: 52, text: "15 × 6 = ?", answer: 90, options: [85, 88, 90, 92] },
      { id: 53, text: "2x + 5 = 15, x = ?", answer: 5, options: [3, 4, 5, 6] },
      { id: 54, text: "3² + 4² = ?", answer: 25, options: [20, 22, 25, 28] },
      { id: 55, text: "120 ÷ 5 = ?", answer: 24, options: [22, 23, 24, 25] },
      { id: 56, text: "18 × 4 = ?", answer: 72, options: [68, 70, 72, 74] },
      { id: 57, text: "x - 8 = 12, x = ?", answer: 20, options: [18, 19, 20, 21] },
      { id: 58, text: "5 × 5 × 2 = ?", answer: 50, options: [45, 48, 50, 52] },
      { id: 59, text: "√169 = ?", answer: 13, options: [11, 12, 13, 14] },
      { id: 60, text: "2³ × 3² = ?", answer: 72, options: [64, 68, 72, 76] },
      { id: 61, text: "3x = 27, x = ?", answer: 9, options: [7, 8, 9, 10] },
      { id: 62, text: "15% of 200 = ?", answer: 30, options: [25, 28, 30, 32] },
      { id: 63, text: "(-5) + (-3) = ?", answer: -8, options: [-8, -2, 2, 8] },
      { id: 64, text: "Area of square with side 5cm?", answer: 25, options: [20, 25, 30, 35] },
      { id: 65, text: "Perimeter of rectangle 3x4?", answer: 14, options: [12, 14, 16, 18] },
      { id: 66, text: "½ + ¼ = ?", answer: "3/4", options: ["1/2", "3/4", "2/3", "4/5"] },
      { id: 67, text: "0.5 × 0.5 = ?", answer: "0.25", options: ["0.25", "0.5", "0.75", "1.0"] },
      { id: 68, text: "√144 = ?", answer: 12, options: [10, 11, 12, 13] },
      { id: 69, text: "2x + 3 = 11, x = ?", answer: 4, options: [2, 3, 4, 5] },
      { id: 70, text: "5y - 2 = 13, y = ?", answer: 3, options: [1, 2, 3, 4] }
    ]
  },
  uzbek: {
    1: [
      { id: 101, text: "'Olma' so'zining ma'nosi?", answer: "Apple", options: ["Apple", "Pear", "Grape", "Banana"] },
      { id: 102, text: "'Kitob' so'zining inglizchasi?", answer: "Book", options: ["Pen", "Book", "Table", "Chair"] },
      { id: 103, text: "'O'qituvchi' so'zining sinonimi?", answer: "Ustoz", options: ["Shogird", "Ustoz", "Talaba", "Maktab"] },
      { id: 104, text: "'Maktab' so'zining ma'nosi?", answer: "School", options: ["School", "Hospital", "Market", "Mosque"] },
      { id: 105, text: "'Qalam' so'zining inglizchasi?", answer: "Pen", options: ["Pen", "Pencil", "Book", "Paper"] },
      { id: 106, text: "'Daftar' so'zining ma'nosi?", answer: "Notebook", options: ["Book", "Notebook", "Paper", "Diary"] },
      { id: 107, text: "'Rahmat' so'zining inglizchasi?", answer: "Thank you", options: ["Sorry", "Hello", "Thank you", "Goodbye"] },
      { id: 108, text: "'Salom' so'zining ma'nosi?", answer: "Hello", options: ["Hello", "Goodbye", "Thank you", "Sorry"] },
      { id: 109, text: "'Kun' so'zining inglizchasi?", answer: "Day", options: ["Night", "Day", "Week", "Month"] },
      { id: 110, text: "'Oy' so'zining ma'nosi?", answer: "Month", options: ["Day", "Week", "Month", "Year"] },
      { id: 111, text: "'Suv' so'zining inglizchasi?", answer: "Water", options: ["Fire", "Air", "Water", "Earth"] },
      { id: 112, text: "'Olov' so'zining ma'nosi?", answer: "Fire", options: ["Water", "Fire", "Air", "Earth"] },
      { id: 113, text: "'Yulduz' so'zining inglizchasi?", answer: "Star", options: ["Sun", "Moon", "Star", "Sky"] },
      { id: 114, text: "'Oy' so'zining inglizchasi?", answer: "Moon", options: ["Sun", "Moon", "Star", "Sky"] },
      { id: 115, text: "'Quyosh' so'zining ma'nosi?", answer: "Sun", options: ["Sun", "Moon", "Star", "Sky"] },
      { id: 116, text: "'Gul' so'zining inglizchasi?", answer: "Flower", options: ["Flower", "Tree", "Grass", "Leaf"] },
      { id: 117, text: "'Daraxt' so'zining ma'nosi?", answer: "Tree", options: ["Flower", "Tree", "Grass", "Leaf"] },
      { id: 118, text: "'Hayvon' so'zining inglizchasi?", answer: "Animal", options: ["Animal", "Bird", "Fish", "Insect"] },
      { id: 119, text: "'Qush' so'zining ma'nosi?", answer: "Bird", options: ["Animal", "Bird", "Fish", "Insect"] },
      { id: 120, text: "'Baliq' so'zining inglizchasi?", answer: "Fish", options: ["Animal", "Bird", "Fish", "Insect"] }
    ],
    2: [
      { id: 121, text: "'Do'st' so'zining antonimi?", answer: "Dushman", options: ["Do'st", "Dushman", "Ota", "Ona"] },
      { id: 122, text: "'Mehr' so'zining ma'nosi?", answer: "Love", options: ["Hate", "Love", "Anger", "Sad"] },
      { id: 123, text: "'Kuchli' so'zining sinonimi?", answer: "Qudratli", options: ["Zaif", "Qudratli", "Kichik", "Katta"] },
      { id: 124, text: "'Go'zal' so'zining antonimi?", answer: "Xunuk", options: ["Chiroyli", "Xunuk", "Yaxshi", "Yomon"] },
      { id: 125, text: "'Tez' so'zining sinonimi?", answer: "Shaftoli", options: ["Shaftoli", "Sekin", "Tez", "Uzoq"] },
      { id: 126, text: "'Keng' so'zining antonimi?", answer: "Tor", options: ["Keng", "Tor", "Uzoq", "Yaqin"] },
      { id: 127, text: "'Yangi' so'zining sinonimi?", answer: "So'nggi", options: ["Eski", "So'nggi", "Qadimgi", "Kecha"] },
      { id: 128, text: "'Baland' so'zining antonimi?", answer: "Past", options: ["Baland", "Past", "Uzoq", "Yaqin"] },
      { id: 129, text: "'Yaxshi' so'zining antonimi?", answer: "Yomon", options: ["Yaxshi", "Yomon", "Katta", "Kichik"] },
      { id: 130, text: "'Ko'p' so'zining antonimi?", answer: "Oz", options: ["Ko'p", "Oz", "Katta", "Kichik"] },
      { id: 131, text: "'Yorug' so'zining antonimi?", answer: "Qorong'u", options: ["Yorug'", "Qorong'u", "Issiq", "Sovuq"] },
      { id: 132, text: "'Issiq' so'zining antonimi?", answer: "Sovuq", options: ["Issiq", "Sovuq", "Yorug'", "Qorong'u"] },
      { id: 133, text: "'Og'ir' so'zining antonimi?", answer: "Yengil", options: ["Og'ir", "Yengil", "Katta", "Kichik"] },
      { id: 134, text: "'Kulgi' so'zining sinonimi?", answer: "Qahqaha", options: ["Qahqaha", "Yig'i", "Xafalik", "G'azab"] },
      { id: 135, text: "'Aqlli' so'zining sinonimi?", answer: "Donishmand", options: ["Donishmand", "Johl", "Nodon", "Sodda"] }
    ],
    3: [
      { id: 136, text: "'Vatan' so'zining ma'nosi?", answer: "Homeland", options: ["Country", "Homeland", "City", "Village"] },
      { id: 137, text: "'Mehnat' so'ziga ma'nodosh so'z?", answer: "Ish", options: ["O'yin", "Ish", "Dam olish", "Uyqu"] },
      { id: 138, text: "'Baxt' so'zining antonimi?", answer: "Qayg'u", options: ["Xursandchilik", "Qayg'u", "Shodlik", "Quvonch"] },
      { id: 139, text: "'Ilm' so'zining ma'nosi?", answer: "Science", options: ["Art", "Science", "Sport", "Music"] },
      { id: 140, text: "'Adolat' so'zining antonimi?", answer: "Zulm", options: ["Adolat", "Zulm", "Mehr", "Shafqat"] },
      { id: 141, text: "'Ozodlik' so'zining ma'nosi?", answer: "Freedom", options: ["Freedom", "Slavery", "Peace", "War"] },
      { id: 142, text: "'Tinchlik' so'zining antonimi?", answer: "Urush", options: ["Tinchlik", "Urush", "Do'stlik", "Adovat"] },
      { id: 143, text: "'Birlik' so'zining ma'nosi?", answer: "Unity", options: ["Unity", "Division", "Peace", "War"] },
      { id: 144, text: "'Hurmat' so'zining sinonimi?", answer: "Ehtirom", options: ["Ehtirom", "Xurmat", "Hurmat", "Izzat"] },
      { id: 145, text: "'Vafo' so'zining ma'nosi?", answer: "Loyalty", options: ["Loyalty", "Betrayal", "Love", "Hate"] },
      { id: 146, text: "'Kamolot' so'zining ma'nosi?", answer: "Perfection", options: ["Perfection", "Growth", "Maturity", "Development"] },
      { id: 147, text: "'Taraqqiyot' so'zining sinonimi?", answer: "Rivojlanish", options: ["Rivojlanish", "Parchalanish", "Yiqilish", "To'xtash"] },
      { id: 148, text: "'G'urur' so'zining antonimi?", answer: "Kibr", options: ["Kibr", "Tavoze", "Kamtar", "Oddiylik"] },
      { id: 149, text: "'Saxovat' so'zining ma'nosi?", answer: "Generosity", options: ["Generosity", "Greed", "Selfishness", "Stinginess"] },
      { id: 150, text: "'Sabr' so'zining sinonimi?", answer: "Taqat", options: ["Taqat", "Shoshqaloqlik", "Be sabrlik", "Jahl"] }
    ]
  },
  english: {
    1: [
      { id: 201, text: "What is 'Apple' in Uzbek?", answer: "Olma", options: ["Olma", "Nok", "Banan", "Uzum"] },
      { id: 202, text: "Translate: 'School'", answer: "Maktab", options: ["Maktab", "Universitet", "Kollej", "Litsey"] },
      { id: 203, text: "What is 'Cat'?", answer: "Mushuk", options: ["It", "Mushuk", "Ot", "Sigir"] },
      { id: 204, text: "Translate: 'House'", answer: "Uy", options: ["Uy", "Kocha", "Do'kon", "Maktab"] },
      { id: 205, text: "What is 'Dog'?", answer: "It", options: ["Mushuk", "It", "Ot", "Sigir"] },
      { id: 206, text: "Translate: 'Mother'", answer: "Ona", options: ["Ota", "Ona", "Aka", "Uka"] },
      { id: 207, text: "What is 'Father'?", answer: "Ota", options: ["Ona", "Ota", "Aka", "Uka"] },
      { id: 208, text: "Translate: 'Brother'", answer: "Aka", options: ["Aka", "Uka", "Opa", "Singil"] },
      { id: 209, text: "What is 'Sister'?", answer: "Singil", options: ["Aka", "Uka", "Opa", "Singil"] },
      { id: 210, text: "Translate: 'Teacher'", answer: "O'qituvchi", options: ["O'qituvchi", "Shogird", "Talaba", "Direktor"] },
      { id: 211, text: "What is 'Student'?", answer: "Talaba", options: ["O'qituvchi", "Shogird", "Talaba", "Direktor"] },
      { id: 212, text: "Translate: 'Book'", answer: "Kitob", options: ["Kitob", "Daftar", "Qalam", "Ruchka"] },
      { id: 213, text: "What is 'Pen'?", answer: "Qalam", options: ["Kitob", "Daftar", "Qalam", "Ruchka"] },
      { id: 214, text: "Translate: 'Table'", answer: "Stol", options: ["Stol", "Kreslo", "Divan", "Shkaf"] },
      { id: 215, text: "What is 'Chair'?", answer: "Kreslo", options: ["Stol", "Kreslo", "Divan", "Shkaf"] }
    ],
    2: [
      { id: 216, text: "Translate: 'Beautiful'", answer: "Go'zal", options: ["Yomon", "Go'zal", "Katta", "Kichik"] },
      { id: 217, text: "What is 'Friend'?", answer: "Do'st", options: ["Dushman", "Do'st", "Ota", "Ona"] },
      { id: 218, text: "Translate: 'Happy'", answer: "Baxtli", options: ["Qayg'uli", "Baxtli", "Kichik", "Katta"] },
      { id: 219, text: "What is 'Sad'?", answer: "Qayg'uli", options: ["Baxtli", "Qayg'uli", "Kichik", "Katta"] },
      { id: 220, text: "Translate: 'Fast'", answer: "Tez", options: ["Sekin", "Tez", "Uzoq", "Yaqin"] },
      { id: 221, text: "What is 'Slow'?", answer: "Sekin", options: ["Tez", "Sekin", "Uzoq", "Yaqin"] },
      { id: 222, text: "Translate: 'Big'", answer: "Katta", options: ["Kichik", "Katta", "Uzoq", "Yaqin"] },
      { id: 223, text: "What is 'Small'?", answer: "Kichik", options: ["Katta", "Kichik", "Uzoq", "Yaqin"] },
      { id: 224, text: "Translate: 'New'", answer: "Yangi", options: ["Eski", "Yangi", "Katta", "Kichik"] },
      { id: 225, text: "What is 'Old'?", answer: "Eski", options: ["Yangi", "Eski", "Katta", "Kichik"] },
      { id: 226, text: "Translate: 'Good'", answer: "Yaxshi", options: ["Yomon", "Yaxshi", "Katta", "Kichik"] },
      { id: 227, text: "What is 'Bad'?", answer: "Yomon", options: ["Yaxshi", "Yomon", "Katta", "Kichik"] },
      { id: 228, text: "Translate: 'Strong'", answer: "Kuchli", options: ["Kuchsiz", "Kuchli", "Tez", "Sekin"] },
      { id: 229, text: "What is 'Weak'?", answer: "Kuchsiz", options: ["Kuchli", "Kuchsiz", "Tez", "Sekin"] },
      { id: 230, text: "Translate: 'Rich'", answer: "Boy", options: ["Boy", "Kambag'al", "Baxtli", "Qayg'uli"] }
    ],
    3: [
      { id: 231, text: "Past tense of 'go'?", answer: "Went", options: ["Goed", "Went", "Gone", "Going"] },
      { id: 232, text: "Opposite of 'big'?", answer: "Small", options: ["Large", "Huge", "Small", "Tiny"] },
      { id: 233, text: "Future tense of 'eat'?", answer: "Will eat", options: ["Ate", "Eating", "Will eat", "Eaten"] },
      { id: 234, text: "Past tense of 'see'?", answer: "Saw", options: ["Seed", "Saw", "Seen", "Seeing"] },
      { id: 235, text: "Opposite of 'hot'?", answer: "Cold", options: ["Warm", "Cool", "Cold", "Freezing"] },
      { id: 236, text: "Past tense of 'run'?", answer: "Ran", options: ["Runed", "Ran", "Runned", "Running"] },
      { id: 237, text: "Opposite of 'fast'?", answer: "Slow", options: ["Quick", "Rapid", "Slow", "Swift"] },
      { id: 238, text: "Future tense of 'write'?", answer: "Will write", options: ["Wrote", "Written", "Will write", "Writing"] },
      { id: 239, text: "Past tense of 'sing'?", answer: "Sang", options: ["Singed", "Sang", "Sung", "Singing"] },
      { id: 240, text: "Opposite of 'happy'?", answer: "Sad", options: ["Joyful", "Glad", "Sad", "Cheerful"] },
      { id: 241, text: "Past tense of 'drink'?", answer: "Drank", options: ["Drinked", "Drank", "Drunk", "Drinking"] },
      { id: 242, text: "Opposite of 'young'?", answer: "Old", options: ["Young", "Old", "New", "Ancient"] },
      { id: 243, text: "Future tense of 'buy'?", answer: "Will buy", options: ["Bought", "Buying", "Will buy", "Buys"] },
      { id: 244, text: "Past tense of 'fly'?", answer: "Flew", options: ["Flown", "Flew", "Flied", "Flying"] },
      { id: 245, text: "Opposite of 'light'?", answer: "Dark", options: ["Heavy", "Dark", "Bright", "Shiny"] }
    ]
  },
  history: {
    1: [
      { id: 301, text: "Amir Temur qachon tug'ilgan?", answer: "1336", options: ["1320", "1336", "1340", "1350"] },
      { id: 302, text: "Navoiy qaysi asrda yashagan?", answer: "15-asr", options: ["14-asr", "15-asr", "16-asr", "17-asr"] },
      { id: 303, text: "Amir Temur qayerda tug'ilgan?", answer: "Shahrisabz", options: ["Samarqand", "Buxoro", "Shahrisabz", "Toshkent"] },
      { id: 304, text: "Mustaqillik qachon e'lon qilingan?", answer: "1991", options: ["1990", "1991", "1992", "1993"] },
      { id: 305, text: "O'zbekistonning birinchi prezidenti?", answer: "Islom Karimov", options: ["Islom Karimov", "Shavkat Mirziyoyev", "Abdulla Oripov", "Shermatov"] },
      { id: 306, text: "Navoiyning eng mashhur asari?", answer: "Xamsa", options: ["Xamsa", "Lison ut-Tayr", "Mahbub ul-Qulub", "Hayrat ul-Abror"] },
      { id: 307, text: "Bobur qachon tug'ilgan?", answer: "1483", options: ["1483", "1490", "1500", "1510"] },
      { id: 308, text: "Ulug'bek rasadxonasi qayerda?", answer: "Samarqand", options: ["Buxoro", "Samarqand", "Toshkent", "Xiva"] },
      { id: 309, text: "Jaloliddin Manguberdi qaysi davrda yashagan?", answer: "13-asr", options: ["12-asr", "13-asr", "14-asr", "15-asr"] },
      { id: 310, text: "Ma'mun akademiyasi qayerda joylashgan?", answer: "Xorazm", options: ["Buxoro", "Samarqand", "Xorazm", "Toshkent"] },
      { id: 311, text: "Beruniy qayerda tug'ilgan?", answer: "Xorazm", options: ["Buxoro", "Samarqand", "Xorazm", "Toshkent"] },
      { id: 312, text: "Ibn Sino qayerda tug'ilgan?", answer: "Buxoro", options: ["Buxoro", "Samarqand", "Xorazm", "Toshkent"] },
      { id: 313, text: "Temuriylar davlatining poytaxti?", answer: "Samarqand", options: ["Buxoro", "Samarqand", "Xiva", "Qo'qon"] },
      { id: 314, text: "Shavkat Mirziyoyev qachon prezident bo'lgan?", answer: "2016", options: ["2015", "2016", "2017", "2018"] },
      { id: 315, text: "O'zbekiston mustaqilligi nechanchi yilda?", answer: "1991", options: ["1990", "1991", "1992", "1993"] }
    ]
  },
  geography: {
    1: [
      { id: 401, text: "O'zbekistonning poytaxti?", answer: "Toshkent", options: ["Samarqand", "Buxoro", "Toshkent", "Andijon"] },
      { id: 402, text: "Eng katta okean?", answer: "Tinch okeani", options: ["Atlantika", "Hind", "Tinch okeani", "Shimoliy"] },
      { id: 403, text: "O'zbekiston qaysi qit'ada?", answer: "Osiyo", options: ["Yevropa", "Afrika", "Osiyo", "Amerika"] },
      { id: 404, text: "Eng baland tog'?", answer: "Everest", options: ["Everest", "Kilimanjaro", "Elbrus", "K2"] },
      { id: 405, text: "Eng uzun daryo?", answer: "Nil", options: ["Amazon", "Nil", "Missisipi", "Yangtze"] },
      { id: 406, text: "O'zbekistonning eng baland nuqtasi?", answer: "Hazrati Sulton", options: ["Hazrati Sulton", "Qoratepa", "Boysuntog", "Zarafshon"] },
      { id: 407, text: "Eng katta cho'l?", answer: "Sahara", options: ["Sahara", "Gobi", "Arabiston", "Karakum"] },
      { id: 408, text: "Eng chuqur okean joyi?", answer: "Mariana cho'kmasi", options: ["Bermuda", "Mariana", "Filippin", "Tonga"] },
      { id: 409, text: "Eng katta materik?", answer: "Osiyo", options: ["Afrika", "Amerika", "Osiyo", "Yevropa"] },
      { id: 410, text: "Eng kichik materik?", answer: "Avstraliya", options: ["Yevropa", "Antarktida", "Avstraliya", "Amerika"] },
      { id: 411, text: "O'zbekistonning sharqiy qo'shnisi?", answer: "Qirg'iziston", options: ["Qozog'iston", "Turkmaniston", "Tojikiston", "Qirg'iziston"] },
      { id: 412, text: "O'zbekistonning g'arbiy qo'shnisi?", answer: "Turkmaniston", options: ["Qozog'iston", "Turkmaniston", "Tojikiston", "Afg'oniston"] },
      { id: 413, text: "Amudaryo qayerga quyiladi?", answer: "Orol dengizi", options: ["Kaspiy dengizi", "Orol dengizi", "Qora dengiz", "Baliq dengizi"] },
      { id: 414, text: "Sirdaryo qayerga quyiladi?", answer: "Orol dengizi", options: ["Kaspiy dengizi", "Orol dengizi", "Qora dengiz", "Baliq dengizi"] },
      { id: 415, text: "Farg'ona vodiysi qaysi davlatlar bilan chegaradosh?", answer: "Qirg'iziston, Tojikiston", options: ["Qozog'iston, Turkmaniston", "Qirg'iziston, Tojikiston", "Afg'oniston, Eron", "Rossiya, Xitoy"] }
    ]
  },
  biology: {
    1: [
      { id: 501, text: "Odamning eng katta organi?", answer: "Teri", options: ["Yurak", "Miya", "Teri", "O'pka"] },
      { id: 502, text: "O'simliklar qanday moddani chiqaradi?", answer: "Kislorod", options: ["Uglerod", "Kislorod", "Vodorod", "Azot"] },
      { id: 503, text: "Inson yuragi necha kameradan iborat?", answer: "4", options: ["2", "3", "4", "5"] },
      { id: 504, text: "Qaysi vitamin ko'rish uchun muhim?", answer: "A", options: ["A", "B", "C", "D"] },
      { id: 505, text: "Eng kichik qon hujayrasi?", answer: "Trombotsit", options: ["Eritrotsit", "Leukotsit", "Trombotsit", "Plazma"] },
      { id: 506, text: "Fotosintez jarayoni qayerda sodir bo'ladi?", answer: "Xloroplast", options: ["Mitoxondriya", "Yadro", "Xloroplast", "Vakuol"] },
      { id: 507, text: "DNK qisqartmasi nimani anglatadi?", answer: "Dezoksiribonuklein kislota", options: ["Dezoksiribonuklein kislota", "Ribonuklein kislota", "Dezoksi kislota", "Nuklein kislota"] },
      { id: 508, text: "Inson tanasida nechta xromosoma bor?", answer: "46", options: ["44", "46", "48", "50"] },
      { id: 509, text: "Qonning qizil rangda bo'lishiga sabab?", answer: "Gemoglobin", options: ["Gemoglobin", "Plazma", "Leukotsit", "Trombotsit"] },
      { id: 510, text: "Inson miyasi nechta yarim shardan iborat?", answer: "2", options: ["1", "2", "3", "4"] },
      { id: 511, text: "Eng katta suyak?", answer: "Son suyagi", options: ["Qo'l suyagi", "Oyoq suyagi", "Son suyagi", "Orqa suyagi"] },
      { id: 512, text: "Eng kichik suyak?", answer: "Teng suyagi", options: ["Barmoq suyagi", "Teng suyagi", "Quloq suyagi", "Burun suyagi"] },
      { id: 513, text: "Nafas olish markazi qayerda joylashgan?", answer: "Miya", options: ["Yurak", "O'pka", "Miya", "Jigar"] },
      { id: 514, text: "Qandli diabet qaysi a'zo bilan bog'liq?", answer: "Oshqozon osti bezi", options: ["Jigar", "Buyrak", "Oshqozon osti bezi", "Qalqonsimon bez"] },
      { id: 515, text: "Inson tanasidagi eng katta bez?", answer: "Jigar", options: ["Jigar", "O'pka", "Yurak", "Buyrak"] }
    ]
  },
  physics: {
    1: [
      { id: 601, text: "Yorug'lik tezligi qancha?", answer: "300000 km/s", options: ["150000", "300000", "450000", "600000"] },
      { id: 602, text: "Og'irlik kuchi qaysi?", answer: "Gravitatsiya", options: ["Magnit", "Gravitatsiya", "Elektr", "Yadro"] },
      { id: 603, text: "Elektr tokining birligi?", answer: "Amper", options: ["Volt", "Amper", "Om", "Vatt"] },
      { id: 604, text: "Qarshilik birligi?", answer: "Om", options: ["Volt", "Amper", "Om", "Joul"] },
      { id: 605, text: "Ovoz tezligi qancha?", answer: "343 m/s", options: ["300 m/s", "343 m/s", "400 m/s", "500 m/s"] },
      { id: 606, text: "Nyutonning 1-qonuni?", answer: "Inersiya", options: ["Inersiya", "F=ma", "Ta'sir va aks ta'sir", "E=mc²"] },
      { id: 607, text: "Energiyaning saqlanish qonuni?", answer: "Energiya yo'qolmaydi", options: ["Energiya yo'qolmaydi", "Energiya o'zgaradi", "Energiya faqat issiqlikka aylanadi", "Energiya faqat mexanik"] },
      { id: 608, text: "Nisbiylik nazariyasi muallifi?", answer: "Albert Einstein", options: ["Isaac Newton", "Albert Einstein", "Galileo", "Nikola Tesla"] },
      { id: 609, text: "Qora tuynuk nima?", answer: "Gravitatsion maydon", options: ["Yulduz", "Gravitatsion maydon", "Planeta", "Galaktika"] },
      { id: 610, text: "Atom qanday zarrachalardan tashkil topgan?", answer: "Proton, neytron, elektron", options: ["Proton, neytron, elektron", "Foton, elektron, neytron", "Proton, foton, elektron", "Neytron, foton, proton"] },
      { id: 611, text: "Kuchning birligi?", answer: "Nyuton", options: ["Joul", "Vatt", "Nyuton", "Paskal"] },
      { id: 612, text: "Bosimning birligi?", answer: "Paskal", options: ["Nyuton", "Joul", "Paskal", "Vatt"] },
      { id: 613, text: "Quvvatning birligi?", answer: "Vatt", options: ["Joul", "Vatt", "Nyuton", "Paskal"] },
      { id: 614, text: "Ishning birligi?", answer: "Joul", options: ["Joul", "Vatt", "Nyuton", "Paskal"] },
      { id: 615, text: "Chastotaning birligi?", answer: "Gers", options: ["Gers", "Sekund", "Metr", "Kg"] }
    ]
  },
  chemistry: {
    1: [
      { id: 701, text: "Suvning kimyoviy formulasi?", answer: "H₂O", options: ["CO₂", "H₂O", "O₂", "NaCl"] },
      { id: 702, text: "Tuzning formulasi?", answer: "NaCl", options: ["HCl", "NaCl", "H₂O", "CO₂"] },
      { id: 703, text: "Kislorodning formulasi?", answer: "O₂", options: ["O", "O₂", "O₃", "H₂O"] },
      { id: 704, text: "Vodorodning formulasi?", answer: "H₂", options: ["H", "H₂", "H₃", "H₂O"] },
      { id: 705, text: "Karbonat angidrid formulasi?", answer: "CO₂", options: ["CO", "CO₂", "C₂O", "O₂C"] },
      { id: 706, text: "Mendeleyev jadvalida nechta element bor?", answer: "118", options: ["108", "118", "128", "98"] },
      { id: 707, text: "Oltinning kimyoviy belgisi?", answer: "Au", options: ["Ag", "Au", "Fe", "Cu"] },
      { id: 708, text: "Kumushning kimyoviy belgisi?", answer: "Ag", options: ["Au", "Ag", "Fe", "Cu"] },
      { id: 709, text: "Temirning kimyoviy belgisi?", answer: "Fe", options: ["Fe", "F", "Ir", "Tm"] },
      { id: 710, text: "Misning kimyoviy belgisi?", answer: "Cu", options: ["C", "Cu", "M", "Mi"] },
      { id: 711, text: "Xlorning kimyoviy belgisi?", answer: "Cl", options: ["Cl", "C", "Ch", "L"] },
      { id: 712, text: "Natriyning kimyoviy belgisi?", answer: "Na", options: ["N", "Na", "Ne", "Ni"] },
      { id: 713, text: "Kaliyning kimyoviy belgisi?", answer: "K", options: ["Ka", "K", "Kl", "Ky"] },
      { id: 714, text: "Magniyning kimyoviy belgisi?", answer: "Mg", options: ["M", "Mg", "Mn", "Mo"] },
      { id: 715, text: "Oltingugurtning kimyoviy belgisi?", answer: "S", options: ["S", "O", "U", "G"] }
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

// ========== ARQON TORTISH O'YINI (KIM BIRINCHI TO'G'RI JAVOB BERSA) ==========
const TugOfWarGame = ({ grade, subject, onBack }) => {
  const [ropePosition, setRopePosition] = useState(50);
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [winner, setWinner] = useState(null);
  const [leftQuestion, setLeftQuestion] = useState(null);
  const [rightQuestion, setRightQuestion] = useState(null);
  const [showLeftModal, setShowLeftModal] = useState(false);
  const [showRightModal, setShowRightModal] = useState(false);
  const [timeLimit, setTimeLimit] = useState(15);
  const [leftTimeLeft, setLeftTimeLeft] = useState(15);
  const [rightTimeLeft, setRightTimeLeft] = useState(15);
  const [leftAnswered, setLeftAnswered] = useState(false);
  const [rightAnswered, setRightAnswered] = useState(false);
  const [leftUserAnswer, setLeftUserAnswer] = useState(null);
  const [rightUserAnswer, setRightUserAnswer] = useState(null);
  const [leftUsedIds, setLeftUsedIds] = useState(new Set());
  const [rightUsedIds, setRightUsedIds] = useState(new Set());
  const [roundActive, setRoundActive] = useState(false);
  const [pullDirection, setPullDirection] = useState(null);
  const [pullMsg, setPullMsg] = useState('');
  const [roundResult, setRoundResult] = useState(null);
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [roundCount, setRoundCount] = useState(1);
  const [leftModalOpen, setLeftModalOpen] = useState(false);
  const [rightModalOpen, setRightModalOpen] = useState(false);
  const [roundWinner, setRoundWinner] = useState(null); // Bu raundda kim yutgani
  const [roundEnded, setRoundEnded] = useState(false);
  
  const leftTimerRef = useRef(null);
  const rightTimerRef = useRef(null);

  const timeOptions = [10, 15, 20, 25];

  const handleTimeChange = (seconds) => {
    setTimeLimit(seconds);
    setLeftTimeLeft(seconds);
    setRightTimeLeft(seconds);
    setShowTimeSettings(false);
  };

  // Savollarni yuklash
  const loadQuestions = useCallback(() => {
    const newLeftQuestion = getUniqueQuestion(subject, grade, leftUsedIds, setLeftUsedIds);
    const newRightQuestion = getUniqueQuestion(subject, grade, rightUsedIds, setRightUsedIds);
    
    if (newLeftQuestion && newRightQuestion) {
      setLeftQuestion(newLeftQuestion);
      setRightQuestion(newRightQuestion);
      setLeftTimeLeft(timeLimit);
      setRightTimeLeft(timeLimit);
      setLeftAnswered(false);
      setRightAnswered(false);
      setLeftUserAnswer(null);
      setRightUserAnswer(null);
      setPullDirection(null);
      setRoundResult(null);
      setRoundWinner(null);
      setRoundEnded(false);
      setRoundActive(true);
      setLeftModalOpen(true);
      setRightModalOpen(true);
      setShowLeftModal(true);
      setShowRightModal(true);
    } else if (newLeftQuestion && !newRightQuestion) {
      setWinner('left');
      setGameStarted(false);
    } else if (!newLeftQuestion && newRightQuestion) {
      setWinner('right');
      setGameStarted(false);
    } else {
      if (leftScore > rightScore) setWinner('left');
      else if (rightScore > leftScore) setWinner('right');
      else setWinner('draw');
      setGameStarted(false);
    }
  }, [subject, grade, leftUsedIds, rightUsedIds, leftScore, rightScore, timeLimit]);

  // O'yinni boshlash
  const startGame = () => {
    setGameStarted(true);
    setWinner(null);
    setRopePosition(50);
    setLeftScore(0);
    setRightScore(0);
    setRoundCount(1);
    setLeftUsedIds(new Set());
    setRightUsedIds(new Set());
    loadQuestions();
  };

  // Chap jamoa javob berganda
  const handleLeftAnswer = (answer) => {
    if (leftAnswered || !roundActive || winner || !gameStarted || roundEnded) return;
    
    const isCorrect = answer === leftQuestion.answer;
    setLeftUserAnswer(answer);
    setLeftAnswered(true);
    setLeftModalOpen(false);
    setShowLeftModal(false);
    clearTimeout(leftTimerRef.current);
    
    // Agar o'ng jamoa hali javob bermagan bo'lsa va bu javob to'g'ri bo'lsa
    if (!rightAnswered && isCorrect && !roundEnded) {
      // Chap jamoa yutdi
      setRoundWinner('left');
      setRoundEnded(true);
      setRoundActive(false);
      setLeftModalOpen(false);
      setRightModalOpen(false);
      setShowLeftModal(false);
      setShowRightModal(false);
      
      // Arqonni tortish
      const pullPower = Math.floor((rightTimeLeft) / 2) + 15;
      const newPosition = Math.max(0, ropePosition - pullPower);
      setRopePosition(newPosition);
      setPullDirection('left');
      setLeftScore(prev => prev + 1);
      setPullMsg(`🎯 Chap jamoa to'g'ri javob berdi! +${pullPower} kuch!`);
      setRoundResult('left');
      
      // G'olibni tekshirish
      if (newPosition <= 0) {
        setWinner('left');
        setGameStarted(false);
      } else {
        // Keyingi raund
        setTimeout(() => {
          if (newPosition > 0 && newPosition < 100 && !winner) {
            setRoundCount(prev => prev + 1);
            loadQuestions();
          }
          setPullMsg('');
          setRoundResult(null);
        }, 2000);
      }
    } 
    // Agar ikkala jamoa ham javob bergan bo'lsa va hali raund tugamagan bo'lsa
    else if (rightAnswered && !roundEnded) {
      checkBothAnswers();
    }
  };

  // O'ng jamoa javob berganda
  const handleRightAnswer = (answer) => {
    if (rightAnswered || !roundActive || winner || !gameStarted || roundEnded) return;
    
    const isCorrect = answer === rightQuestion.answer;
    setRightUserAnswer(answer);
    setRightAnswered(true);
    setRightModalOpen(false);
    setShowRightModal(false);
    clearTimeout(rightTimerRef.current);
    
    // Agar chap jamoa hali javob bermagan bo'lsa va bu javob to'g'ri bo'lsa
    if (!leftAnswered && isCorrect && !roundEnded) {
      // O'ng jamoa yutdi
      setRoundWinner('right');
      setRoundEnded(true);
      setRoundActive(false);
      setLeftModalOpen(false);
      setRightModalOpen(false);
      setShowLeftModal(false);
      setShowRightModal(false);
      
      // Arqonni tortish
      const pullPower = Math.floor((leftTimeLeft) / 2) + 15;
      const newPosition = Math.min(100, ropePosition + pullPower);
      setRopePosition(newPosition);
      setPullDirection('right');
      setRightScore(prev => prev + 1);
      setPullMsg(`🎯 O'ng jamoa to'g'ri javob berdi! +${pullPower} kuch!`);
      setRoundResult('right');
      
      // G'olibni tekshirish
      if (newPosition >= 100) {
        setWinner('right');
        setGameStarted(false);
      } else {
        // Keyingi raund
        setTimeout(() => {
          if (newPosition > 0 && newPosition < 100 && !winner) {
            setRoundCount(prev => prev + 1);
            loadQuestions();
          }
          setPullMsg('');
          setRoundResult(null);
        }, 2000);
      }
    } 
    // Agar ikkala jamoa ham javob bergan bo'lsa va hali raund tugamagan bo'lsa
    else if (leftAnswered && !roundEnded) {
      checkBothAnswers();
    }
  };

  // Ikkala jamoa ham javob berganini tekshirish (hech kim tezroq to'g'ri javob bermagan bo'lsa)
  const checkBothAnswers = () => {
    if (roundEnded) return;
    
    const leftCorrect = leftUserAnswer !== null && leftQuestion && leftUserAnswer === leftQuestion.answer;
    const rightCorrect = rightUserAnswer !== null && rightQuestion && rightUserAnswer === rightQuestion.answer;
    
    // Ikkala jamoa ham bir vaqtda javob bergan
    if (leftCorrect && !rightCorrect) {
      // Chap yutdi
      setRoundWinner('left');
      const pullPower = Math.floor((rightTimeLeft) / 2) + 15;
      const newPosition = Math.max(0, ropePosition - pullPower);
      setRopePosition(newPosition);
      setPullDirection('left');
      setLeftScore(prev => prev + 1);
      setPullMsg(`🎯 Chap jamoa to'g'ri javob berdi! +${pullPower} kuch!`);
      setRoundResult('left');
      
      if (newPosition <= 0) setWinner('left');
    } 
    else if (!leftCorrect && rightCorrect) {
      // O'ng yutdi
      setRoundWinner('right');
      const pullPower = Math.floor((leftTimeLeft) / 2) + 15;
      const newPosition = Math.min(100, ropePosition + pullPower);
      setRopePosition(newPosition);
      setPullDirection('right');
      setRightScore(prev => prev + 1);
      setPullMsg(`🎯 O'ng jamoa to'g'ri javob berdi! +${pullPower} kuch!`);
      setRoundResult('right');
      
      if (newPosition >= 100) setWinner('right');
    }
    else if (leftCorrect && rightCorrect) {
      // Ikkalasi ham to'g'ri - teng kuch
      setPullMsg("⚖️ Ikkala jamoa ham to'g'ri javob berdi! Teng kuch!");
      setRoundResult('draw');
    }
    else {
      // Ikkalasi ham xato
      setPullMsg("😔 Ikkala jamoa ham xato javob berdi! Hech kim ball olmadi!");
      setRoundResult('draw');
    }
    
    setRoundEnded(true);
    setRoundActive(false);
    setLeftModalOpen(false);
    setRightModalOpen(false);
    setShowLeftModal(false);
    setShowRightModal(false);
    
    // Keyingi raund
    setTimeout(() => {
      if (!winner && gameStarted) {
        setRoundCount(prev => prev + 1);
        loadQuestions();
      }
      setPullMsg('');
      setRoundResult(null);
    }, 2000);
  };

  // Vaqt tugaganda (hech kim javob bermasa)
  useEffect(() => {
    if (leftTimeLeft === 0 && !leftAnswered && roundActive && !winner && gameStarted && !roundEnded) {
      setLeftAnswered(true);
      setLeftUserAnswer(null);
      setLeftModalOpen(false);
      setShowLeftModal(false);
      
      // Chap vaqt tugadi, o'ng tekshiriladi
      if (rightAnswered && !roundEnded) {
        checkBothAnswers();
      } else if (!rightAnswered && !roundEnded) {
        // Hech kim javob bermadi, vaqt tugadi
        setTimeout(() => {
          if (!rightAnswered && !roundEnded) {
            setRoundEnded(true);
            setRoundActive(false);
            setLeftModalOpen(false);
            setRightModalOpen(false);
            setPullMsg("⏰ Vaqt tugadi! Hech kim ball olmadi!");
            
            setTimeout(() => {
              if (!winner && gameStarted) {
                setRoundCount(prev => prev + 1);
                loadQuestions();
              }
              setPullMsg('');
            }, 2000);
          }
        }, 500);
      }
    }
  }, [leftTimeLeft, leftAnswered, roundActive, winner, gameStarted, roundEnded, rightAnswered]);

  useEffect(() => {
    if (rightTimeLeft === 0 && !rightAnswered && roundActive && !winner && gameStarted && !roundEnded) {
      setRightAnswered(true);
      setRightUserAnswer(null);
      setRightModalOpen(false);
      setShowRightModal(false);
      
      if (leftAnswered && !roundEnded) {
        checkBothAnswers();
      }
    }
  }, [rightTimeLeft, rightAnswered, roundActive, winner, gameStarted, roundEnded, leftAnswered]);

  // Vaqt hisoblagichlari
  useEffect(() => {
    if (leftModalOpen && leftTimeLeft > 0 && !leftAnswered && roundActive && !winner && gameStarted && !roundEnded) {
      leftTimerRef.current = setTimeout(() => setLeftTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(leftTimerRef.current);
    }
  }, [leftTimeLeft, leftModalOpen, leftAnswered, roundActive, winner, gameStarted, roundEnded]);

  useEffect(() => {
    if (rightModalOpen && rightTimeLeft > 0 && !rightAnswered && roundActive && !winner && gameStarted && !roundEnded) {
      rightTimerRef.current = setTimeout(() => setRightTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(rightTimerRef.current);
    }
  }, [rightTimeLeft, rightModalOpen, rightAnswered, roundActive, winner, gameStarted, roundEnded]);

  const resetGame = () => {
    setGameStarted(false);
    setWinner(null);
    setRopePosition(50);
    setLeftScore(0);
    setRightScore(0);
    setRoundCount(1);
    setLeftUsedIds(new Set());
    setRightUsedIds(new Set());
    setLeftAnswered(false);
    setRightAnswered(false);
    setLeftUserAnswer(null);
    setRightUserAnswer(null);
    setPullDirection(null);
    setPullMsg('');
    setRoundResult(null);
    setLeftModalOpen(false);
    setRightModalOpen(false);
    setShowLeftModal(false);
    setShowRightModal(false);
    setRoundActive(false);
    setRoundWinner(null);
    setRoundEnded(false);
  };

  return (
    <div className="p-4 shadow-xl sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">🪢 Arqon tortish o‘yini</h2>
          <p className="text-xs text-gray-500 sm:text-sm">Sinf: {grade} | Fan: {subject}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <button 
              onClick={() => setShowTimeSettings(!showTimeSettings)}
              className="px-3 py-2 text-sm text-white transition bg-purple-500 rounded-xl sm:px-4 hover:scale-105"
            >
              ⏱️ {timeLimit}s
            </button>
            {showTimeSettings && (
              <div className="absolute right-0 z-20 mt-2 bg-white rounded-lg shadow-lg top-full">
                {timeOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleTimeChange(opt)}
                    className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${timeLimit === opt ? 'bg-purple-100 text-purple-600' : ''}`}
                  >
                    {opt} soniya
                  </button>
                ))}
              </div>
            )}
          </div>
          {!gameStarted && !winner && (
            <button onClick={startGame} className="px-4 py-2 text-sm text-white transition bg-green-500 rounded-xl sm:px-6 hover:scale-105">
              🎮 O'yinni boshlash
            </button>
          )}
          <button onClick={resetGame} className="px-3 py-2 text-sm text-white transition bg-blue-500 rounded-xl sm:px-4 hover:scale-105">🔄 Qayta</button>
          <button onClick={onBack} className="px-3 py-2 text-sm text-gray-700 transition bg-gray-200 rounded-xl sm:px-4 hover:bg-gray-300">← Orqaga</button>
        </div>
      </div>

      {/* O'yin holati */}
      {!gameStarted && !winner && (
        <div className="p-6 mb-6 text-center bg-white shadow-md rounded-2xl">
          <div className="mb-2 text-4xl">🎮</div>
          <h3 className="text-lg font-bold text-gray-700">O'yin boshlanmagan</h3>
          <p className="text-sm text-gray-500">"O'yinni boshlash" tugmasini bosing</p>
        </div>
      )}

      {/* Raund va hisob */}
      {gameStarted && !winner && (
        <div className="mb-4 text-center">
          <div className="inline-block px-4 py-1 text-sm font-bold text-white bg-blue-500 rounded-full">
            {roundCount} - RAUND
          </div>
        </div>
      )}

      {/* Jamoalar va hisob */}
      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 sm:gap-8">
        {/* Chap jamoa */}
        <motion.div 
          animate={{ x: pullDirection === 'left' && !roundActive && roundWinner === 'left' ? -15 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
          className="text-center"
        >
          <div className={`p-4 text-white bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl transition-all ${roundWinner === 'left' && !roundActive ? 'ring-4 ring-yellow-400 scale-105' : ''}`}>
            <div className="flex justify-center gap-2 mb-3">
              <div className="flex items-center justify-center w-10 h-10 text-xl rounded-full sm:w-14 sm:h-14 sm:text-2xl bg-white/20 backdrop-blur">💪</div>
              <div className="flex items-center justify-center w-10 h-10 text-xl rounded-full sm:w-14 sm:h-14 sm:text-2xl bg-white/20 backdrop-blur">👨‍🎓</div>
              <div className="flex items-center justify-center w-10 h-10 text-xl rounded-full sm:w-14 sm:h-14 sm:text-2xl bg-white/20 backdrop-blur">👩‍🎓</div>
            </div>
            <div className="mb-2 text-base font-bold sm:text-xl">CHAP JAMOA</div>
            <div className="text-4xl font-bold sm:text-6xl">{leftScore}</div>
            <div className="mt-2 text-xs text-blue-200 sm:text-sm">
              {leftAnswered && leftUserAnswer !== null && leftQuestion && leftUserAnswer === leftQuestion.answer ? '✅ To\'g\'ri!' : leftAnswered ? '❌ Xato!' : gameStarted && roundActive && leftModalOpen ? '⏳ Javob kutilmoqda' : '⚡ Tayyor'}
            </div>
          </div>
        </motion.div>

        {/* O'ng jamoa */}
        <motion.div 
          animate={{ x: pullDirection === 'right' && !roundActive && roundWinner === 'right' ? 15 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
          className="text-center"
        >
          <div className={`p-4 text-white bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl transition-all ${roundWinner === 'right' && !roundActive ? 'ring-4 ring-yellow-400 scale-105' : ''}`}>
            <div className="flex justify-center gap-2 mb-3">
              <div className="flex items-center justify-center w-10 h-10 text-xl rounded-full sm:w-14 sm:h-14 sm:text-2xl bg-white/20 backdrop-blur">👨‍🎓</div>
              <div className="flex items-center justify-center w-10 h-10 text-xl rounded-full sm:w-14 sm:h-14 sm:text-2xl bg-white/20 backdrop-blur">👩‍🎓</div>
              <div className="flex items-center justify-center w-10 h-10 text-xl rounded-full sm:w-14 sm:h-14 sm:text-2xl bg-white/20 backdrop-blur">💪</div>
            </div>
            <div className="mb-2 text-base font-bold sm:text-xl">O‘NG JAMOA</div>
            <div className="text-4xl font-bold sm:text-6xl">{rightScore}</div>
            <div className="mt-2 text-xs text-pink-200 sm:text-sm">
              {rightAnswered && rightUserAnswer !== null && rightQuestion && rightUserAnswer === rightQuestion.answer ? '✅ To\'g\'ri!' : rightAnswered ? '❌ Xato!' : gameStarted && roundActive && rightModalOpen ? '⏳ Javob kutilmoqda' : '⚡ Tayyor'}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Arqon */}
      <div className="relative mb-8">
        <div className="relative h-8 overflow-hidden rounded-full shadow-inner sm:h-10 bg-amber-700">
          <motion.div 
            className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
            animate={{ width: `${ropePosition}%` }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="w-0.5 h-4 bg-amber-800/50 sm:h-6" />
            ))}
          </div>
        </div>
        
        <div className="absolute transform -translate-x-1/2 left-1/2 -top-4">
          <div className="w-3 h-6 bg-red-500 rounded-full shadow-lg sm:w-4 sm:h-8"></div>
        </div>
        
        {pullDirection && !roundActive && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute text-center transform -translate-x-1/2 -top-8 left-1/2 whitespace-nowrap"
          >
            <div className="px-2 py-0.5 text-xs font-bold text-white bg-orange-500 rounded-full sm:px-3 sm:py-1 sm:text-sm">
              {pullDirection === 'left' ? '← Chap jamoa tortdi!' : 'O‘ng jamoa tortdi! →'}
            </div>
          </motion.div>
        )}
      </div>

      {/* Tortish natijasi xabari */}
      {pullMsg && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2 mb-4 text-sm text-center bg-white shadow-md rounded-xl sm:p-3"
        >
          <p className="text-gray-700">{pullMsg}</p>
        </motion.div>
      )}

      {/* G'olib xabari */}
      {winner && (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 text-center bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl sm:p-6"
        >
          {winner === 'left' && (
            <>
              <div className="mb-2 text-3xl sm:text-5xl">🏆🎉</div>
              <div className="text-xl font-bold text-white sm:text-3xl">CHAP JAMOA G'ALABA QOZONDI!</div>
            </>
          )}
          {winner === 'right' && (
            <>
              <div className="mb-2 text-3xl sm:text-5xl">🏆🎉</div>
              <div className="text-xl font-bold text-white sm:text-3xl">O'NG JAMOA G'ALABA QOZONDI!</div>
            </>
          )}
          {winner === 'draw' && (
            <>
              <div className="mb-2 text-3xl sm:text-5xl">🤝</div>
              <div className="text-xl font-bold text-white sm:text-3xl">DURANG!</div>
            </>
          )}
          <div className="mt-2 text-base text-white/90 sm:text-xl">Hisob: {leftScore} - {rightScore}</div>
          <button onClick={startGame} className="px-4 py-1 mt-3 font-bold text-gray-800 bg-white rounded-xl sm:px-6 sm:py-2 hover:bg-gray-100">🔄 Yangi o'yin</button>
        </motion.div>
      )}

      {/* CHAP JAMOA MODAL */}
      <AnimatePresence>
        {leftModalOpen && leftQuestion && !winner && gameStarted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, x: -50 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.8, opacity: 0, x: -50 }}
              transition={{ type: "spring", damping: 20 }}
              className="absolute left-[5%] top-1/2 -translate-y-1/2 w-72 sm:left-[10%] sm:w-80 overflow-hidden pointer-events-auto shadow-2xl bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl z-[101]"
            >
              <div className="p-3 text-center bg-blue-600/50 sm:p-4">
                <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                  <span className="text-2xl sm:text-3xl">🔵</span>
                  <span className="text-base font-bold text-yellow-300 sm:text-xl">CHAP JAMOA</span>
                </div>
                <div className="text-white">
                  <span className={`text-lg font-bold sm:text-xl ${leftTimeLeft <= 5 ? 'text-red-300 animate-pulse' : ''}`}>⏱️ {leftTimeLeft}</span>
                  <span className="text-sm"> soniya</span>
                </div>
                <div className="mt-1 text-xs text-yellow-200">⚡ Birinchi bo'lib to'g'ri javob bering!</div>
              </div>
              
              <div className="p-3 sm:p-4">
                <div className="p-2 mb-3 text-center bg-white/10 rounded-xl sm:p-3 sm:mb-4">
                  <p className="text-sm font-bold text-white sm:text-base">{leftQuestion.text}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {leftQuestion.options && leftQuestion.options.map((opt, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleLeftAnswer(opt)}
                      className="py-1.5 text-sm font-bold text-white transition rounded-lg sm:py-2 sm:text-base bg-white/20 hover:bg-white/30"
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div className="p-1.5 text-xs text-center text-blue-200 bg-blue-600/30 sm:p-2 sm:text-sm">
                Tez va to'g'ri javob bering!
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* O'NG JAMOA MODAL */}
      <AnimatePresence>
        {rightModalOpen && rightQuestion && !winner && gameStarted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, x: 50 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.8, opacity: 0, x: 50 }}
              transition={{ type: "spring", damping: 20 }}
              className="absolute right-[5%] top-1/2 -translate-y-1/2 w-72 sm:right-[10%] sm:w-80 overflow-hidden pointer-events-auto shadow-2xl bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl z-[101]"
            >
              <div className="p-3 text-center bg-pink-600 sm:p-4">
                <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                  <span className="text-2xl sm:text-3xl">🔴</span>
                  <span className="text-base font-bold text-yellow-300 sm:text-xl">O'NG JAMOA</span>
                </div>
                <div className="text-white">
                  <span className={`text-lg font-bold sm:text-xl ${rightTimeLeft <= 5 ? 'text-red-300 animate-pulse' : ''}`}>⏱️ {rightTimeLeft}</span>
                  <span className="text-sm"> soniya</span>
                </div>
                <div className="mt-1 text-xs text-yellow-200">⚡ Birinchi bo'lib to'g'ri javob bering!</div>
              </div>
              
              <div className="p-3 sm:p-4">
                <div className="p-2 mb-3 text-center bg-white/10 rounded-xl sm:p-3 sm:mb-4">
                  <p className="text-sm font-bold text-white sm:text-base">{rightQuestion.text}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {rightQuestion.options && rightQuestion.options.map((opt, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRightAnswer(opt)}
                      className="py-1.5 text-sm font-bold text-white transition rounded-lg sm:py-2 sm:text-base bg-white/20 hover:bg-white/30"
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div className="p-1.5 text-xs text-center text-pink-200 bg-pink-600 sm:p-2 sm:text-sm">
                Tez va to'g'ri javob bering!
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Javob kutish indikatori */}
      {gameStarted && roundActive && !leftAnswered && !rightAnswered && !winner && leftModalOpen && rightModalOpen && (
        <div className="flex flex-col justify-center gap-3 mt-4 sm:flex-row sm:gap-8">
          <div className="flex items-center justify-center gap-2 text-blue-500">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce sm:w-2 sm:h-2"></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce sm:w-2 sm:h-2" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce sm:w-2 sm:h-2" style={{ animationDelay: '0.4s' }}></div>
            <span className="text-xs sm:text-sm">Chap jamoa javob kutilmoqda...</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-pink-500">
            <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce sm:w-2 sm:h-2"></div>
            <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce sm:w-2 sm:h-2" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce sm:w-2 sm:h-2" style={{ animationDelay: '0.4s' }}></div>
            <span className="text-xs sm:text-sm">O'ng jamoa javob kutilmoqda...</span>
          </div>
        </div>
      )}
    </div>
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
  const [timeLimit, setTimeLimit] = useState(15);
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  
  const timeOptions = [10, 15, 20, 25];

  const handleTimeChange = (seconds) => {
    setTimeLimit(seconds);
    setTimeLeft(seconds);
    setShowTimeSettings(false);
  };

  const loadQuestion = useCallback(() => {
    const newQuestion = getUniqueQuestion(subject, grade, usedIds, setUsedIds);
    if (newQuestion) {
      setCurrentQuestion(newQuestion);
      setTimeLeft(timeLimit);
    } else {
      setGameActive(false);
    }
  }, [subject, grade, usedIds, timeLimit]);

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
    <div className="p-4 bg-white shadow-xl rounded-3xl sm:p-6">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">⚔️ Battle Quiz Arena</h2>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <button onClick={() => setShowTimeSettings(!showTimeSettings)} className="px-3 py-2 text-sm text-white transition bg-purple-500 rounded-xl sm:px-4 hover:scale-105">⏱️ {timeLimit}s</button>
            {showTimeSettings && (
              <div className="absolute right-0 z-20 mt-2 bg-white rounded-lg shadow-lg top-full">
                {timeOptions.map(opt => (
                  <button key={opt} onClick={() => handleTimeChange(opt)} className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${timeLimit === opt ? 'bg-purple-100 text-purple-600' : ''}`}>{opt} soniya</button>
                ))}
              </div>
            )}
          </div>
          <button onClick={resetGame} className="px-3 py-2 text-sm text-white bg-purple-500 rounded-xl sm:px-4">🔄 Yangi</button>
          <button onClick={onBack} className="px-3 py-2 text-sm bg-gray-200 rounded-xl sm:px-4">← Orqaga</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 sm:gap-6">
        <div className={`bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-4 text-white text-center sm:p-6 ${activeTeam === 'A' && gameActive ? 'ring-4 ring-yellow-400' : ''}`}>
          <div className="mb-1 text-2xl sm:mb-2 sm:text-4xl">🔵 A JAMOA</div>
          <div className="text-4xl font-bold sm:text-6xl">{teamAScore}</div>
          <div className="mt-1 text-xs sm:mt-2 sm:text-sm">{round}/10 tur</div>
        </div>
        
        <div className={`bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl p-4 text-white text-center sm:p-6 ${activeTeam === 'B' && gameActive ? 'ring-4 ring-yellow-400' : ''}`}>
          <div className="mb-1 text-2xl sm:mb-2 sm:text-4xl">🔴 B JAMOA</div>
          <div className="text-4xl font-bold sm:text-6xl">{teamBScore}</div>
          <div className="mt-1 text-xs sm:mt-2 sm:text-sm">{round}/10 tur</div>
        </div>
      </div>

      {currentQuestion && gameActive && (
        <div className="p-4 text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl sm:p-6">
          <div className="mb-3 text-center sm:mb-4">
            <div className="inline-block px-3 py-1 text-xs rounded-full sm:px-4 sm:py-2 sm:text-sm bg-white/20">🎯 {activeTeam === 'A' ? 'A jamoasi javob beradi' : 'B jamoasi javob beradi'}</div>
            <div className="mt-1 text-xl font-bold sm:mt-2 sm:text-2xl">⏱️ {timeLeft} soniya</div>
          </div>
          <p className="mb-4 text-lg font-bold text-center sm:mb-6 sm:text-2xl">{currentQuestion.text}</p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {currentQuestion.options && currentQuestion.options.map((opt, idx) => (
              <button key={idx} onClick={() => handleAnswer(activeTeam, opt)} className="p-2 text-sm font-bold text-center transition rounded-lg sm:p-4 sm:text-lg bg-white/20 hover:bg-white/30">
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {!gameActive && (
        <div className="p-6 text-center bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl sm:p-8">
          <div className="mb-1 text-2xl font-bold text-white sm:mb-2 sm:text-4xl">🏆 O'yin yakunlandi!</div>
          <div className="text-base text-white sm:text-2xl">{teamAScore > teamBScore ? 'A jamoasi g\'alaba qozondi!' : teamBScore > teamAScore ? 'B jamoasi g\'alaba qozondi!' : "Durang!"}</div>
          <div className="mt-1 text-sm text-white/80 sm:mt-2">Final: {teamAScore} - {teamBScore}</div>
          <button onClick={resetGame} className="px-4 py-1 mt-3 text-gray-800 bg-white rounded-xl sm:px-6 sm:py-2">Yangi o'yin</button>
        </div>
      )}
    </div>
  );
};

// ========== TIME BOMB QUIZ ==========
const TimeBombQuiz = ({ grade, subject, onBack }) => {
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [exploded, setExploded] = useState(false);
  const [usedIds, setUsedIds] = useState(new Set());
  const [highScore, setHighScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [timeLimit, setTimeLimit] = useState(15);
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  
  const timeOptions = [10, 15, 20, 25];

  const handleTimeChange = (seconds) => {
    setTimeLimit(seconds);
    setTimeLeft(seconds);
    setShowTimeSettings(false);
  };

  const loadQuestion = useCallback(() => {
    const level = getDifficultyLevel(grade);
    const bank = QUESTION_BANKS[subject] || QUESTION_BANKS.mathematics;
    const levelQuestions = bank[level] || bank[1];
    
    const unusedQuestions = levelQuestions.filter(q => !usedIds.has(q.id));
    
    if (unusedQuestions.length === 0) {
      setExploded(true);
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * unusedQuestions.length);
    const question = { ...unusedQuestions[randomIndex] };
    
    if (question.options && Array.isArray(question.options)) {
      question.options = [...question.options].sort(() => Math.random() - 0.5);
    }
    
    setCurrentQuestion(question);
    setTimeLeft(timeLimit);
  }, [subject, grade, usedIds, timeLimit]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  useEffect(() => {
    if (timeLeft > 0 && !exploded && currentQuestion) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !exploded) {
      setExploded(true);
      setStreak(0);
    }
  }, [timeLeft, exploded, currentQuestion]);

  const handleAnswer = (answer) => {
    if (exploded || !currentQuestion) return;
    
    if (answer === currentQuestion.answer) {
      const pointsEarned = 10 + Math.floor(streak / 3) * 5;
      setScore(prev => {
        const newScore = prev + pointsEarned;
        if (newScore > highScore) setHighScore(newScore);
        return newScore;
      });
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        return newStreak;
      });
      setQuestionNumber(prev => prev + 1);
      setUsedIds(prev => new Set([...prev, currentQuestion.id]));
      loadQuestion();
    } else {
      setExploded(true);
      setStreak(0);
    }
  };

  const resetGame = () => {
    setScore(0);
    setExploded(false);
    setUsedIds(new Set());
    setStreak(0);
    setQuestionNumber(1);
    loadQuestion();
  };

  const getStreakBonus = () => {
    if (streak >= 9) return "🔥🔥🔥 Mega Bonus! +25 ball!";
    if (streak >= 6) return "🔥🔥 Super Bonus! +15 ball!";
    if (streak >= 3) return "🔥 Bonus! +5 ball!";
    return "";
  };

  return (
    <div className="p-4 shadow-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl sm:p-6">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">💣 Time Bomb Quiz</h2>
          <p className="text-xs text-gray-500 sm:text-sm">Sinf: {grade} | Fan: {subject}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <button onClick={() => setShowTimeSettings(!showTimeSettings)} className="px-3 py-2 text-sm text-white transition bg-purple-500 rounded-xl sm:px-4 hover:scale-105">⏱️ {timeLimit}s</button>
            {showTimeSettings && (
              <div className="absolute right-0 z-20 mt-2 bg-white rounded-lg shadow-lg top-full">
                {timeOptions.map(opt => (
                  <button key={opt} onClick={() => handleTimeChange(opt)} className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${timeLimit === opt ? 'bg-purple-100 text-purple-600' : ''}`}>{opt} soniya</button>
                ))}
              </div>
            )}
          </div>
          <button onClick={resetGame} className="px-3 py-2 text-sm text-white bg-red-500 rounded-xl sm:px-4">🔄 Qayta</button>
          <button onClick={onBack} className="px-3 py-2 text-sm bg-gray-200 rounded-xl sm:px-4">← Orqaga</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 sm:gap-4">
        <div className="p-2 text-center bg-white shadow-md rounded-xl sm:p-3">
          <div className="text-xs text-gray-500 sm:text-sm">⭐ Joriy ball</div>
          <div className="text-xl font-bold text-purple-500 sm:text-3xl">{score}</div>
        </div>
        <div className="p-2 text-center bg-white shadow-md rounded-xl sm:p-3">
          <div className="text-xs text-gray-500 sm:text-sm">🏆 Eng yaxshi</div>
          <div className="text-xl font-bold text-amber-500 sm:text-3xl">{highScore}</div>
        </div>
        <div className="p-2 text-center bg-white shadow-md rounded-xl sm:p-3">
          <div className="text-xs text-gray-500 sm:text-sm">🔥 Seriya</div>
          <div className="text-xl font-bold text-orange-400 sm:text-3xl">{streak}</div>
        </div>
        <div className="p-2 text-center bg-white shadow-md rounded-xl sm:p-3">
          <div className="text-xs text-gray-500 sm:text-sm">📊 Maks</div>
          <div className="text-xl font-bold text-green-500 sm:text-3xl">{maxStreak}</div>
        </div>
      </div>

      <div className="mb-4 text-center">
        <div className="inline-block px-3 py-1 text-xs text-white rounded-full sm:px-4 sm:py-1 sm:text-sm bg-gradient-to-r from-blue-400 to-purple-400">Savol #{questionNumber}</div>
      </div>

      {!exploded && currentQuestion && (
        <div className="p-4 text-gray-800 border border-purple-100 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl sm:p-6">
          <div className="relative mb-4">
            <div className={`text-center text-5xl ${timeLeft <= 5 ? 'animate-pulse' : ''} sm:text-6xl`}>
              {timeLeft <= 5 ? '💣💥' : '💣'}
            </div>
            <div className={`text-center text-2xl font-bold ${timeLeft <= 5 ? 'animate-pulse text-red-500' : 'text-purple-600'} sm:text-4xl`}>
              ⏱️ {timeLeft}s
            </div>
            <div className="w-full h-2 mt-2 overflow-hidden bg-purple-100 rounded-full sm:h-3">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: timeLimit, ease: "linear" }}
              />
            </div>
          </div>

          {streak > 0 && (
            <div className="mb-3 text-center sm:mb-4">
              <div className="inline-block px-2 py-0.5 text-xs font-bold text-orange-700 bg-orange-100 rounded-full sm:px-3 sm:py-1 sm:text-sm">
                🔥 {streak} ta to'g'ri ketma-ket! {getStreakBonus()}
              </div>
            </div>
          )}

          <p className="mb-4 text-lg font-bold text-center text-gray-800 sm:mb-6 sm:text-2xl">{currentQuestion.text}</p>
          
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {currentQuestion.options && currentQuestion.options.map((opt, idx) => (
              <button key={idx} onClick={() => handleAnswer(opt)} className="p-2 text-sm font-bold text-center text-gray-700 transition border border-purple-200 shadow-sm bg-purple-50 hover:bg-purple-100 rounded-xl sm:p-4 sm:text-lg">
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {exploded && (
        <div className="p-6 text-center border border-red-100 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl sm:p-8">
          <div className="mb-3 text-5xl sm:mb-4 sm:text-7xl">💥💣💥</div>
          <div className="text-xl font-bold text-red-500 sm:text-3xl">BOMB PORTLADI!</div>
          <div className="mt-1 text-xs text-gray-600 sm:mt-2 sm:text-sm">Siz {questionNumber - 1} ta savolga to'g'ri javob berdingiz</div>
          <div className="mt-3 text-2xl font-bold text-purple-600 sm:mt-4 sm:text-4xl">⭐ Ball: {score}</div>
          {streak > 0 && <div className="mt-1 text-orange-500 sm:mt-2">Eng uzoq seriya: {maxStreak} 🔥</div>}
          <div className="flex justify-center gap-3 mt-4 sm:mt-6">
            <button onClick={resetGame} className="px-4 py-1 font-bold text-white transition bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:px-6 sm:py-2 hover:scale-105">🔄 Qayta o'ynash</button>
            <button onClick={onBack} className="px-4 py-1 font-bold text-gray-600 transition bg-gray-100 rounded-xl sm:px-6 sm:py-2 hover:bg-gray-200">← Orqaga</button>
          </div>
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
    <div className="p-4 bg-white shadow-xl rounded-3xl sm:p-6">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">🏆 Speed Run</h2>
        <div className="flex gap-2">
          <button onClick={resetGame} className="px-3 py-2 text-sm text-white bg-green-500 rounded-xl sm:px-4">🔄 Qayta</button>
          <button onClick={onBack} className="px-3 py-2 text-sm bg-gray-200 rounded-xl sm:px-4">← Orqaga</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6 sm:gap-4">
        <div className="p-3 text-center bg-blue-100 rounded-2xl sm:p-4"><div className="text-xl font-bold text-blue-600 sm:text-3xl">⭐ {score}</div><div className="text-xs sm:text-sm">Ball</div></div>
        <div className="p-3 text-center bg-orange-100 rounded-2xl sm:p-4"><div className="text-xl font-bold text-orange-600 sm:text-3xl">⏱️ {timeLeft}</div><div className="text-xs sm:text-sm">soniya</div></div>
      </div>
      {gameActive && currentQuestion && (
        <div className="p-4 text-white bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl sm:p-6">
          <p className="mb-4 text-lg font-bold text-center sm:mb-6 sm:text-2xl">{currentQuestion.text}</p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {currentQuestion.options && currentQuestion.options.map((opt, idx) => (
              <button key={idx} onClick={() => handleAnswer(opt)} className="p-2 text-sm font-bold text-center transition rounded-lg sm:p-4 sm:text-lg bg-white/20 hover:bg-white/30">
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
      {!gameActive && (
        <div className="p-6 text-center bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl sm:p-8">
          <div className="text-xl font-bold text-white sm:text-4xl">🏆 Tugadi!</div>
          <div className="mt-1 text-lg text-white sm:mt-2 sm:text-2xl">Ball: {score}</div>
          <button onClick={resetGame} className="px-4 py-1 mt-3 text-gray-800 bg-white rounded-xl sm:px-6 sm:py-2">Yangi o'yin</button>
        </div>
      )}
    </div>
  );
};

// ========== WORD BUILDER PRO ==========
const WordBuilderPro = ({ grade, subject, onBack }) => {
  const wordsDatabase = {
    mathematics: { 1: ["SON", "RAQAM", "SONIQ", "TENGLIK"], 2: ["KASR", "PROTSENT", "TENGLAMA"], 3: ["INTEGRAL", "LOGARIFM", "ALGEBRA"] },
    uzbek: { 1: ["KITOB", "MAKTAB", "ALIFBO", "DARSLIK"], 2: ["VATAN", "DO'STLIK", "MEHR"], 3: ["MUSTAQILLIK", "JONAJON", "VATANPARVAR"] },
    english: { 1: ["BOOK", "SCHOOL", "TEACHER", "STUDENT"], 2: ["FRIENDSHIP", "KINDNESS", "COURAGE"], 3: ["INDEPENDENCE", "PATRIOTISM", "DEMOCRACY"] },
    history: { 1: ["TEMUR", "NAVOI", "BUXORO", "SAMARQAND"], 2: ["MUSTAQILLIK", "AMIR", "SULTON"], 3: ["ARXEOLOGIYA", "SIVILIZATSIYA", "MANZILGOH"] },
    geography: { 1: ["DARYO", "TOG", "KO'L", "DENGIZ"], 2: ["MATERIK", "IQTISODIY", "TABIIY"], 3: ["ATMOSFERA", "LITOSFERA", "GIDROSFERA"] },
    biology: { 1: ["HURAYRA", "TO'QIMA", "ORGAN"], 2: ["YURAK", "MIYA", "O'PKA"], 3: ["EVOLYUTSIYA", "GENETIKA", "EKOTIZIM"] },
    physics: { 1: ["KUCH", "ENERGIYA", "TEZLIK"], 2: ["GRAVITATSIYA", "ELEKTR", "TO'LQIN"], 3: ["RELATIVISTIK", "TERMODINAMIKA", "NANOTEXNOLOGIYA"] },
    chemistry: { 1: ["SUYUKLIK", "GAZ", "QATTIQ"], 2: ["KISLOROD", "VODOROD", "UGLEROD"], 3: ["REAKSIYA", "KATALIZATOR", "POLIMER"] }
  };
  
  const level = getDifficultyLevel(grade);
  const subjectWords = wordsDatabase[subject] || wordsDatabase.mathematics;
  const wordsList = subjectWords[level] || subjectWords[1] || ["O'YIN"];
  
  const [targetWord, setTargetWord] = useState(null);
  const [letters, setLetters] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [completedWords, setCompletedWords] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadNewWord = useCallback(() => {
    if (isLoading) return;
    if (completedWords.length === wordsList.length) {
      setShowCelebration(true);
      setGameActive(false);
      return;
    }
    const remainingWords = wordsList.filter(w => !completedWords.includes(w));
    if (remainingWords.length === 0) return;
    setIsLoading(true);
    const newWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
    setTargetWord(newWord);
    const shuffled = newWord.split('').sort(() => Math.random() - 0.5);
    setLetters(shuffled);
    setSelectedLetters([]);
    setMessage('');
    setTimeout(() => setIsLoading(false), 100);
  }, [wordsList, completedWords, isLoading]);

  useEffect(() => {
    if (wordsList.length > 0 && !targetWord) {
      const firstWord = wordsList[0];
      setTargetWord(firstWord);
      setLetters(firstWord.split('').sort(() => Math.random() - 0.5));
    }
  }, [wordsList]);

  useEffect(() => {
    if (timeLeft > 0 && gameActive && completedWords.length < wordsList.length && !showCelebration) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameActive) {
      setGameActive(false);
      setMessage('⏰ Vaqt tugadi!');
    }
  }, [timeLeft, gameActive, completedWords.length, wordsList.length, showCelebration]);

  const handleLetterClick = (index) => {
    if (!gameActive || isLoading) return;
    const newLetters = [...letters];
    const letter = newLetters.splice(index, 1)[0];
    setLetters(newLetters);
    setSelectedLetters([...selectedLetters, letter]);
  };

  const handleUndo = () => {
    if (!gameActive || isLoading || selectedLetters.length === 0) return;
    const lastLetter = selectedLetters[selectedLetters.length - 1];
    setSelectedLetters(selectedLetters.slice(0, -1));
    setLetters([...letters, lastLetter]);
  };

  const checkWord = () => {
    if (!gameActive || isLoading || !targetWord) return;
    if (selectedLetters.join('') === targetWord) {
      setMessage('🎉 To‘g‘ri! +10 ball 🎉');
      setScore(prev => prev + 10);
      setCompletedWords(prev => [...prev, targetWord]);
      setTimeout(() => loadNewWord(), 1000);
    } else {
      setMessage(`❌ Noto‘g‘ri! "${selectedLetters.join('')}" emas.`);
    }
  };

  const resetGame = () => {
    setCompletedWords([]);
    setScore(0);
    setTimeLeft(60);
    setGameActive(true);
    setShowCelebration(false);
    setMessage('');
    const firstWord = wordsList[0];
    setTargetWord(firstWord);
    setLetters(firstWord.split('').sort(() => Math.random() - 0.5));
    setSelectedLetters([]);
  };

  if (!targetWord) return <div className="p-12 text-center text-gray-500">Yuklanmoqda...</div>;

  return (
    <div className="p-4 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl sm:p-6">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">🔤 Word Builder Pro</h2>
          <p className="text-xs text-gray-500 sm:text-sm">{wordsList.length - completedWords.length} ta so'z qoldi</p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1 text-sm font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl sm:px-4 sm:py-2">⭐ {score}</div>
          <button onClick={resetGame} className="px-3 py-1 text-sm text-white bg-blue-500 rounded-xl sm:px-4 sm:py-2">🔄 Qayta</button>
          <button onClick={onBack} className="px-3 py-1 text-sm bg-gray-200 rounded-xl sm:px-4 sm:py-2">← Orqaga</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 sm:gap-4">
        <div className="p-2 text-center bg-white shadow-md rounded-xl sm:p-3"><div className="text-xs text-gray-500">⏱️ Vaqt</div><div className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-blue-600'} sm:text-2xl`}>{timeLeft}</div></div>
        <div className="p-2 text-center bg-white shadow-md rounded-xl sm:p-3"><div className="text-xs text-gray-500">📊 Progress</div><div className="text-xl font-bold text-green-600 sm:text-2xl">{completedWords.length}/{wordsList.length}</div></div>
      </div>

      <div className="p-3 mb-4 text-center bg-white shadow-md rounded-xl sm:p-4">
        <div className="text-xs text-gray-500 sm:text-sm">Topish kerak</div>
        <div className="flex justify-center gap-1 mt-1 sm:gap-2">
          {targetWord.split('').map((_, idx) => <div key={idx} className="w-6 h-6 border-b-2 border-blue-400 sm:w-8 sm:h-8"></div>)}
        </div>
        <div className="mt-1 text-xs text-gray-400">{targetWord.length} harf</div>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap justify-center gap-2 p-3 bg-white shadow-inner rounded-xl sm:p-4 sm:gap-3">
          {letters.map((letter, idx) => (
            <button key={idx} onClick={() => handleLetterClick(idx)} className="w-12 h-12 text-xl font-bold text-white transition bg-blue-500 rounded-lg shadow-lg hover:scale-105 sm:w-16 sm:h-16 sm:text-3xl">
              {letter}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap justify-center gap-2 p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl min-h-[80px] sm:p-4 sm:min-h-[100px]">
          {selectedLetters.map((letter, idx) => (
            <div key={idx} className="flex items-center justify-center w-12 h-12 text-xl font-bold text-white bg-green-500 rounded-lg shadow-lg sm:w-16 sm:h-16 sm:text-3xl">{letter}</div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button onClick={handleUndo} className="px-4 py-2 text-sm font-bold text-white bg-orange-500 rounded-xl sm:px-6 sm:py-3">↩️ Orqaga</button>
        <button onClick={checkWord} className="px-6 py-2 text-sm font-bold text-white bg-green-500 rounded-xl sm:px-8 sm:py-3">✅ Tekshirish</button>
      </div>

      {message && <div className={`mt-3 p-2 text-center rounded-lg text-sm ${message.includes('To‘g‘ri') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} sm:p-3`}>{message}</div>}

      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="max-w-md p-6 text-center bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl sm:p-8">
            <div className="mb-2 text-5xl sm:mb-4 sm:text-7xl">🏆🎉</div>
            <h3 className="text-xl font-bold text-white sm:text-3xl">TABRIKLAYMIZ!</h3>
            <p className="text-lg font-bold text-white sm:text-2xl">⭐ Ball: {score}</p>
            <button onClick={resetGame} className="px-4 py-1 mt-3 text-gray-800 bg-white rounded-xl sm:px-6 sm:py-2">🔄 Yangi o'yin</button>
          </div>
        </div>
      )}
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
    const subjects = { mathematics: 'Matematika', uzbek: 'O‘zbek tili', english: 'Ingliz tili', history: 'Tarix', geography: 'Geografiya', biology: 'Biologiya', physics: 'Fizika', chemistry: 'Kimyo' };
    return subjects[subId] || subId;
  };

  return (
    <div className="p-4 bg-white shadow-xl rounded-3xl sm:p-6">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">🎮 O‘yin tanlash</h2>
          <p className="text-xs text-gray-500 sm:text-sm">Sinf: {grade} | Fan: {getSubjectName(subject)}</p>
        </div>
        <button onClick={onBack} className="px-3 py-2 text-sm text-gray-600 rounded-xl hover:bg-gray-100">← Orqaga</button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        {games.map((game) => (
          <button key={game.id} onClick={() => onSelectGame(game.id)} className={`bg-gradient-to-r ${game.color} p-4 rounded-2xl text-white text-left shadow-lg transition-all hover:scale-102 sm:p-5`}>
            <div className="mb-1 text-2xl sm:mb-2 sm:text-4xl">{game.name.split(' ')[0]}</div>
            <h3 className="text-base font-bold sm:text-xl">{game.name}</h3>
            <p className="mt-0.5 text-xs text-white/80 sm:mt-1 sm:text-sm">{game.desc}</p>
          </button>
        ))}
      </div>
    </div>
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
    <div className="max-w-4xl p-4 mx-auto bg-white shadow-2xl rounded-3xl sm:p-8">
      <div className="mb-6 text-center sm:mb-8">
        <div className="mb-3 text-5xl sm:mb-4 sm:text-6xl">🎓</div>
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">EduPlay Arena</h1>
        <p className="mt-1 text-sm text-gray-500 sm:mt-2">O‘yin orqali o‘rganing!</p>
      </div>
      <div className="mb-6 sm:mb-8">
        <label className="block mb-2 text-xs font-medium text-gray-700 sm:text-sm">1. Sinfni tanlang:</label>
        <div className="grid grid-cols-5 gap-1 sm:gap-2 md:grid-cols-11">
          {[...Array(11)].map((_, i) => (
            <button key={i+1} onClick={() => setSelectedGrade(i+1)} className={`py-2 text-xs rounded-xl font-bold transition-all sm:py-3 sm:text-sm ${selectedGrade === i+1 ? 'bg-blue-500 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{i+1}</button>
          ))}
        </div>
      </div>
      <div className="mb-6 sm:mb-8">
        <label className="block mb-2 text-xs font-medium text-gray-700 sm:text-sm">2. Fanni tanlang:</label>
        <div className="grid grid-cols-2 gap-1 sm:gap-2 md:grid-cols-4">
          {subjects.map((sub) => (
            <button key={sub.id} onClick={() => setSelectedSubject(sub.id)} className={`flex items-center gap-1 p-2 text-xs rounded-xl transition-all sm:gap-2 sm:p-3 sm:text-sm ${selectedSubject === sub.id ? `bg-gradient-to-r ${sub.color} text-white shadow-lg` : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
              <span className="text-base sm:text-xl">{sub.icon}</span><span className="text-xs sm:text-sm">{sub.name}</span>
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => onStart(selectedGrade, selectedSubject)} disabled={!selectedGrade || !selectedSubject} className="w-full py-3 text-base font-bold text-white transition bg-gradient-to-r from-green-400 to-blue-500 rounded-xl sm:py-4 sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105">
        🚀 O‘yinlarni boshlash →
      </button>
    </div>
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
          <div className="px-3 py-4 mx-auto max-w-7xl sm:px-4 sm:py-6 lg:px-8">
            {isGamesRoute ? <MainGameView /> : <Routes>{getRoutes(teacherRoutes)}{teacherDetailRoutes.map((prop, key) => <Route path={`/${prop.path}`} element={prop.component} key={key} />)}<Route path="/" element={<Navigate to="/teacher/default" replace />} /></Routes>}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherLayoutComponent;