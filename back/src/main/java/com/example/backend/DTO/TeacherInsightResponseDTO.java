package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherInsightResponseDTO {

    private List<TopStudentDTO> topStudents;
    private List<LowStudentDTO> lowStudents;
    private String generalFeedback;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopStudentDTO {
        private String fullName;
        private Integer score;
        private List<String> potentialCareers;
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LowStudentDTO {
        private String fullName;
        private Integer score;
        private List<String> recommendations;
    }
}

