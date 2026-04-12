# 📚 Student Vazifalarini Olish API - Dokumentatsiya Index

## 📖 Dokumentatsiya Fayllar

Quyidagi dokumentatsiya fayllar yaratilgan:

### 1. **QUICK_START.md** 🚀
- **Maqsad:** Tez boshlash uchun qo'llanma
- **Ichida:** 5 ta asosiy endpoint, misollari
- **Kim uchun:** Shoshilganlar
- **Vaqti:** 5-10 daqiqa

### 2. **TASK_API_DOCUMENTATION.md** 📋
- **Maqsad:** To'liq API dokumentatsiyasi
- **Ichida:** Barcha endpoint'lar, parameter'lar, response'lar
- **Kim uchun:** Frontend dasturchilari
- **Vaqti:** 15-20 daqiqa

### 3. **FRONTEND_EXAMPLES.md** 💻
- **Maqsad:** Frontend komponentlari va hook'lar
- **Ichida:** React komponentlari, custom hooks, Context API
- **Kim uchun:** React dasturchilari
- **Vaqti:** 30 daqiqa

### 4. **TESTING_GUIDE.md** 🧪
- **Maqsad:** API test qilish qo'llanmasi
- **Ichida:** Postman test cases, Frontend testing, Error testing
- **Kim uchun:** QA va dasturchilari
- **Vaqti:** 20 daqiqa

### 5. **Postman_Collection.json** 📦
- **Maqsad:** API'ni tez test qilish
- **Ichida:** Barcha endpoint'lar, test so'rovlari
- **Kim uchun:** Hamma (Postman yoki Thunder Client'da import qiling)
- **Vaqti:** 1 minuta

---

## 🛠️ Backend o'zgarishlari

### Yangi Metodlar Qo'shilgan:

#### TaskRepository.java
```java
List<Task> findByLessonId(UUID lessonId);
List<Task> findByTeacherId(UUID teacherId);
List<Task> findByApprovedFalse();
List<Task> findByLessonIdAndApprovedFalse(UUID lessonId);
```

#### TaskService.java
```java
List<Task> getTasksByLesson(UUID lessonId);
List<Task> getTasksByTeacher(UUID teacherId);
List<Task> getUnapprovedTasksByLesson(UUID lessonId);
Task getTaskById(UUID taskId);
```

#### TaskController.java
```java
GET  /api/v1/task/lesson/{lessonId}
GET  /api/v1/task/teacher/{teacherId}
GET  /api/v1/task/lesson/{lessonId}/unapproved
GET  /api/v1/task/{taskId}
POST /api/v1/task/save/{userId}/{lessonId}
```

---

## 📱 Frontend Integration

### Recommended Structure:
```
frontend/
├── src/
│   ├── hooks/
│   │   └── useTaskService.js       ← Custom hook
│   ├── components/
│   │   ├── LessonTaskList.jsx      ← Task list component
│   │   ├── TaskDetail.jsx          ← Task detail page
│   │   └── TaskCard.jsx            ← Single task card
│   ├── context/
│   │   └── TaskContext.js          ← State management
│   ├── pages/
│   │   ├── StudentTasksPage.jsx    ← Main page
│   │   └── TaskDetailPage.jsx      ← Detail page
│   └── utils/
│       └── axiosConfig.js          ← Axios interceptors
```

---

## 🎯 Integration Steps

### Step 1: Backend (✅ Bajarildi)
- [x] TaskRepository yangilandi
- [x] TaskService yangilandi
- [x] TaskController yangilandi
- [x] DTO'lar to'g'rilandi
- [x] @CrossOrigin qo'shildi

### Step 2: Frontend
- [ ] Custom hook yaratish (`useTaskService.js`)
- [ ] Komponentlarni yaratish
- [ ] Router'da ro'yxatdan o'tkazish
- [ ] API testing

### Step 3: Deployment
- [ ] Production URL'ni sozlash
- [ ] Environment variable'larni o'rnatish
- [ ] Security tekshiruvi
- [ ] Performance testing

---

## 🔑 API Endpoints Summary

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/v1/task/lesson/{lessonId}` | Dars bo'yicha vazifalar |
| GET | `/api/v1/task/{taskId}` | Bitta vazifa detallar |
| GET | `/api/v1/task/teacher/{teacherId}` | O'qituvchi vazifalairi |
| GET | `/api/v1/task/lesson/{lessonId}/unapproved` | Tasdiq kutmoqda |
| POST | `/api/v1/task/save/{userId}/{lessonId}` | Yangi vazifa yaratish |

---

## 📊 Response Tuzilishi

### Vazifa Objekti
```json
{
  "id": "uuid",
  "title": "string",
  "type": "TEST|SELF|MATCHING|CROSSWORD",
  "approved": "boolean",
  "teacherName": "string",
  "teacherId": "uuid",
  "lessonName": "string",
  "lessonId_response": "uuid",
  "questions": [
    {
      "question": "string",
      "optionA": "string",
      "optionB": "string",
      "optionC": "string",
      "optionD": "string",
      "correctAnswer": "A|B|C|D"
    }
  ]
}
```

---

## 🚀 Quick Start

### 1. Backend'da Test Qilish
```bash
# Compile va ishga tushirish
mvn clean compile
mvn spring-boot:run
```

### 2. API Test Qilish
- Postman Collection'ni import qiling
- Endpoint'larni sinov qiling
- Response'larni tekshiring

### 3. Frontend'da Integrate Qilish
- Dokumentatsiyasini o'qing
- Hook'larni qo'shish
- Komponentlarni implement qiling

---

## 📞 Support & Help

### Muammo Yuz Bersa:
1. **QUICK_START.md** ni o'qing
2. **TESTING_GUIDE.md** da tekshiring
3. **FRONTEND_EXAMPLES.md** dan misol oling
4. Browser konsol'da xatoni qidiring

### Common Issues:

**Q: 401 Unauthorized qaytardi**
A: Token'ni to'g'ri o'tkazganizni tekshiring
```javascript
const token = localStorage.getItem('access_token');
```

**Q: CORS error**
A: Backend'da @CrossOrigin annotation'i bor ekanligini tekshiring

**Q: 404 Not Found**
A: URL'ni va ID'larni tekshiring

**Q: Vazifalar yuklanmaydi**
A: Network tab'da so'rovni tekshiring va response'ni ko'ring

---

## 📈 Next Steps

1. ✅ Backend'da GET endpoint'lari qo'shildi
2. 🔄 Frontend'da hook'lar yaratish (FRONTEND_EXAMPLES.md'ni o'qing)
3. 🎨 Komponentlarni style qilish
4. 🧪 E2E testing
5. 📦 Production'ga deploy qilish

---

## 📚 Additional Resources

- **Spring Boot Docs:** https://spring.io/projects/spring-boot
- **React Docs:** https://react.dev
- **REST API Best Practices:** https://restfulapi.net
- **Postman Docs:** https://learning.postman.com

---

## ✅ Completion Checklist

- [x] Backend endpoint'lari yaratildi
- [x] API dokumentatsiyasi yozildi
- [x] Frontend misollari berildi
- [x] Testing guide'i qo'shildi
- [x] Postman collection qo'shildi
- [ ] Frontend'da implement qilish
- [ ] QA test qilish
- [ ] Production'ga deploy qilish

---

**Boshqa savol bo'lsa, `QUICK_START.md` yoki `TASK_API_DOCUMENTATION.md`'ni o'qing!** 📖

