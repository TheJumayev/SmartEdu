package com.example.backend.DTO;

import com.example.backend.Enums.TaskType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Task ma'lumotlarini frontendga qaytarish uchun Response DTO.
 * Parol va xavfsiz bo'lmagan ma'lumotlar yo'q.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponseDTO {

    private UUID id;
    private String title;
    private TaskType type;
    private boolean approved;

    /** Vazifani yaratgan o'qituvchi */
    private UserSimpleDTO teacher;

    /** Dars ID va nomi */
    private UUID lessonId;
    private String lessonName;

    /** Bu vazifani ko'rishi mumkin bo'lgan boshqa o'qituvchilar */
    private List<UserSimpleDTO> sharedTeachers;

    /** Savollar ro'yxati */
    private List<QuestionDTO> questions;
}

