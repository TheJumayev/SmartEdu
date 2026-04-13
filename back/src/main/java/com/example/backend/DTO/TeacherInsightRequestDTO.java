package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherInsightRequestDTO {

    private UUID lessonId;

    private List<StudentInsightInputDTO> students;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentInsightInputDTO {
        private UUID studentId;
        private String fullName;
        private Integer score;
        private Integer completedTasks;
        private Integer averageTime;
        private List<String> strengths;
        private List<String> weaknesses;
    }
}

