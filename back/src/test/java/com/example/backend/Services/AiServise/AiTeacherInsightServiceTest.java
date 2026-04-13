package com.example.backend.Services.AiServise;

import com.example.backend.DTO.TeacherInsightRequestDTO;
import com.example.backend.DTO.TeacherInsightResponseDTO;
import com.example.backend.Entity.StudentPerformance;
import com.example.backend.Repository.StudentPerformanceRepo;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiTeacherInsightServiceTest {

    @Mock
    private GeminiService geminiService;

    @Mock
    private StudentPerformanceRepo studentPerformanceRepo;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private AiTeacherInsightService aiTeacherInsightService;

    @BeforeEach
    void setUp() {
        aiTeacherInsightService = new AiTeacherInsightService(geminiService, objectMapper, studentPerformanceRepo);
    }

    @Test
    void generateInsight_shouldAnalyzeOnlyStudentsExistingInStudentPerformance() {
        UUID validStudentId = UUID.randomUUID();
        UUID missingStudentId = UUID.randomUUID();

        TeacherInsightRequestDTO request = TeacherInsightRequestDTO.builder()
                .lessonId(UUID.randomUUID())
                .students(List.of(
                        TeacherInsightRequestDTO.StudentInsightInputDTO.builder()
                                .studentId(validStudentId)
                                .fullName("Ali Valiyev")
                                .score(50)
                                .completedTasks(5)
                                .strengths(List.of("mantiqiy"))
                                .weaknesses(List.of("nazariya"))
                                .build(),
                        TeacherInsightRequestDTO.StudentInsightInputDTO.builder()
                                .studentId(missingStudentId)
                                .fullName("Vali Karimov")
                                .score(20)
                                .completedTasks(2)
                                .strengths(List.of("muloqot"))
                                .weaknesses(List.of("diqqat"))
                                .build()
                ))
                .build();

        StudentPerformance performance = StudentPerformance.builder()
                .studentId(validStudentId)
                .totalTasks(12)
                .averageScore(55.0)
                .minScore(60.0)
                .maxScore(90.0)
                .build();

        when(studentPerformanceRepo.findByStudentIdIn(any())).thenReturn(List.of(performance));
        when(geminiService.generate(any())).thenReturn("""
                {
                  "topStudents": [],
                  "lowStudents": [],
                  "generalFeedback": "Tahlil tayyor"
                }
                """);

        TeacherInsightResponseDTO response = aiTeacherInsightService.generateInsight(request);

        Assertions.assertEquals("Tahlil tayyor", response.getGeneralFeedback());
        Assertions.assertNotNull(response.getTopStudents());
        Assertions.assertNotNull(response.getLowStudents());

        ArgumentCaptor<String> promptCaptor = ArgumentCaptor.forClass(String.class);
        verify(geminiService).generate(promptCaptor.capture());
        String prompt = promptCaptor.getValue();

        Assertions.assertTrue(prompt.contains("Ali Valiyev"));
        Assertions.assertFalse(prompt.contains("Vali Karimov"));
    }

    @Test
    void generateInsight_shouldThrowWhenNoPerformanceFound() {
        UUID studentId = UUID.randomUUID();

        TeacherInsightRequestDTO request = TeacherInsightRequestDTO.builder()
                .lessonId(UUID.randomUUID())
                .students(List.of(
                        TeacherInsightRequestDTO.StudentInsightInputDTO.builder()
                                .studentId(studentId)
                                .fullName("No Data Student")
                                .score(30)
                                .completedTasks(1)
                                .build()
                ))
                .build();

        when(studentPerformanceRepo.findByStudentIdIn(any())).thenReturn(List.of());

        IllegalArgumentException ex = Assertions.assertThrows(IllegalArgumentException.class,
                () -> aiTeacherInsightService.generateInsight(request));

        Assertions.assertTrue(ex.getMessage().contains("StudentPerformance"));
    }

    @Test
    void generateInsight_shouldThrowWhenAllStudentIdsAreMissing() {
        TeacherInsightRequestDTO request = TeacherInsightRequestDTO.builder()
                .lessonId(UUID.randomUUID())
                .students(List.of(
                        TeacherInsightRequestDTO.StudentInsightInputDTO.builder()
                                .fullName("Ali Valiyev")
                                .score(40)
                                .completedTasks(3)
                                .build()
                ))
                .build();

        IllegalArgumentException ex = Assertions.assertThrows(IllegalArgumentException.class,
                () -> aiTeacherInsightService.generateInsight(request));

        Assertions.assertTrue(ex.getMessage().contains("studentId"));
    }
}

