package com.example.backend.DTO;

import com.example.backend.Enums.TaskType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Task yaratish / yangilash uchun Request DTO.
 * POST /api/v1/task/save/{userId}/{lessonId}
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TaskDTO {

    /** Vazifa sarlavhasi */
    private String title;

    /** Vazifa turi: TEST, ORAL, CROSSWORD, TABLE, MATCHING, CONTINUE_TEXT, ESSAY, PRACTICAL, DIAGRAM */
    private TaskType type;

    /** Bu vazifani ko'rishi mumkin bo'lgan o'qituvchilar ID-lari (ixtiyoriy) */
    private List<UUID> sharedTeacherIds;

    /** Savollar ro'yxati (TEST va MATCHING uchun) */
    private List<QuestionDTO> questions;
}
