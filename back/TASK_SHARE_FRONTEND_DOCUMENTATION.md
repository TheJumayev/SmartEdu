# Task Share Frontend Documentation

## Base URL

`http://localhost:8080/api/v1/task`

## Maqsad

Bu hujjat frontendda `task` ni boshqa o'qituvchilar bilan ulashish (`share`) funksiyasini tez ulash uchun yozilgan.

---

## 1) Task ni share qilish

### Endpoint

`POST /api/v1/task/{taskId}/share`

### Path param

- `taskId` (`UUID`) — ulashiladigan task ID

### Request body

```json
{
  "teacherIds": [
    "8f2b0d2f-9f15-4e35-b51b-1a9f2c3349c1",
    "be3dbdf1-53a4-44c5-aea7-36c5f42d4f64"
  ]
}
```

> Eslatma: bu endpoint `sharedTeachers` ro'yxatini **to'liq almashtiradi** (append qilmaydi).

### Success response (`200`)

`TaskResponseDTO` qaytadi.

```json
{
  "id": "c6c9b37f-cdf6-4ef8-a8ee-e2e7efc9e0f1",
  "title": "Tarmoqlar bo'yicha test",
  "type": "TEST",
  "approved": false,
  "teacher": {
    "id": "9c9f2c96-3e35-48aa-9461-e5667aa5c112",
    "name": "Asadbek Karimov",
    "phone": "+998901112233"
  },
  "lessonId": "f4f91984-53b2-4c6a-9d89-163587b08b9b",
  "lessonName": "Kompyuter tarmoqlari",
  "sharedTeachers": [
    {
      "id": "8f2b0d2f-9f15-4e35-b51b-1a9f2c3349c1",
      "name": "Dilshod Ergashev",
      "phone": "+998901234567"
    },
    {
      "id": "be3dbdf1-53a4-44c5-aea7-36c5f42d4f64",
      "name": "Madina Sobirova",
      "phone": "+998909998877"
    }
  ],
  "questions": []
}
```

### Xatoliklar

- `400 Bad Request` — `teacherIds` bo'sh yoki yo'q
- `500 Internal Server Error` — serverdagi runtime xatolik

---

## 2) O'qituvchiga share qilingan tasklar

### Endpoint

`GET /api/v1/task/shared/{teacherId}`

### Success response (`200`)

`TaskResponseDTO[]`.

Bu listda faqat boshqa o'qituvchi yaratgan va ushbu `teacherId` ga ulashilgan tasklar bo'ladi.

---

## 3) O'qituvchi uchun barcha ko'rinadigan tasklar

### Endpoint

`GET /api/v1/task/accessible/{teacherId}`

### Success response (`200`)

`TaskResponseDTO[]`.

Bu list:
- o'qituvchining o'zi yaratgan tasklar
- unga ulashilgan tasklar

Dashboard uchun eng qulay endpoint.

---

## 4) Task yaratishda share berish (ixtiyoriy)

### Endpoint

`POST /api/v1/task/save/{userId}/{lessonId}`

### Request body (`TaskDTO`)

```json
{
  "title": "Kiberxavfsizlik test",
  "type": "TEST",
  "sharedTeacherIds": [
    "8f2b0d2f-9f15-4e35-b51b-1a9f2c3349c1"
  ],
  "questions": [
    {
      "question": "Firewall nima?",
      "optionA": "Tarmoq himoyasi vositasi",
      "optionB": "Operatsion tizim",
      "optionC": "Brauzer",
      "optionD": "IDE",
      "correctAnswer": "A"
    }
  ]
}
```

---

## TypeScript tiplari

```ts
export type TaskType =
  | "TEST"
  | "ORAL"
  | "CROSSWORD"
  | "TABLE"
  | "MATCHING"
  | "CONTINUE_TEXT"
  | "ESSAY"
  | "PRACTICAL"
  | "DIAGRAM";

export interface UserSimpleDTO {
  id: string;
  name: string;
  phone: string;
}

export interface QuestionDTO {
  question: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  left?: string;
  right?: string;
}

export interface TaskResponseDTO {
  id: string;
  title: string;
  type: TaskType;
  approved: boolean;
  teacher: UserSimpleDTO;
  lessonId: string;
  lessonName: string;
  sharedTeachers: UserSimpleDTO[];
  questions: QuestionDTO[];
}

export interface TaskShareRequestDTO {
  teacherIds: string[];
}
```

---

## `fetch` bilan ishlatish

```javascript
export async function shareTask(taskId, teacherIds) {
  const res = await fetch(`/api/v1/task/${taskId}/share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teacherIds })
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `Share failed: ${res.status}`);
  }

  return data; // TaskResponseDTO
}

export async function getSharedTasks(teacherId) {
  const res = await fetch(`/api/v1/task/shared/${teacherId}`);
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return res.json(); // TaskResponseDTO[]
}

export async function getAccessibleTasks(teacherId) {
  const res = await fetch(`/api/v1/task/accessible/${teacherId}`);
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return res.json(); // TaskResponseDTO[]
}
```

---

## UI bo'yicha tavsiyalar

1. Share modalda teacher multiselect ishlating (`teacherIds[]`).
2. Share saqlangandan keyin task detaildagi `sharedTeachers` ni refresh qiling.
3. Teacher kabinetida asosiy list uchun `accessible` endpointdan foydalaning.
4. Agar `teacherIds` bo'sh yuborilsa `400` qaytadi — submitdan oldin validatsiya qiling.
5. Role asosida (teacher/admin) share tugmasini ko'rsatishni cheklang.

