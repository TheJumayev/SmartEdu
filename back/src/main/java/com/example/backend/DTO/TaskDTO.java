package com.example.backend.DTO;

import com.example.backend.Enums.TaskType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TaskDTO {
    // Create uchun
    private UUID userId;
    private UUID lessonId;

    // Response uchun
    private UUID id;
    private String title;
    private TaskType type;
    private boolean approved;
    private String teacherName;
    private UUID teacherId;
    private String lessonName;
    private UUID lessonId_response;
    private List<QuestionDTO> questions;
}
