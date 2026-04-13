package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Unified result DTO returned to teacher for both TEST (StudentAnswer)
 * and non-TEST (TaskResult) task submissions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResultDTO {
    private UUID id;
    private UUID studentId;
    private String studentName;

    /** The task this result belongs to */
    private UUID taskId;
    private String taskTitle;
    private String lessonName;
    private String teacherName;

    /** Percentage score 0-100 */
    private int score;
    private int correct;
    private int total;

    /** AI feedback text (TEST only) */
    private String feedback;

    private LocalDateTime submittedAt;

    private UUID groupId;
    private String groupName;
    private String type;
}
