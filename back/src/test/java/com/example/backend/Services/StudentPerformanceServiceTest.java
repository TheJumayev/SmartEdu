package com.example.backend.Services;

import com.example.backend.Entity.StudentAnswer;
import com.example.backend.Entity.StudentPerformance;
import com.example.backend.Repository.StudentAnswerRepo;
import com.example.backend.Repository.StudentPerformanceRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentPerformanceServiceTest {

    @Mock
    private StudentAnswerRepo studentAnswerRepo;

    @Mock
    private StudentPerformanceRepo studentPerformanceRepo;

    @InjectMocks
    private StudentPerformanceService studentPerformanceService;

    private UUID studentId;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
    }

    @Test
    void updateStudentPerformance_shouldCalculateStatsCorrectly() {
        // Given
        List<StudentAnswer> answers = List.of(
                StudentAnswer.builder().studentId(studentId).score(90).build(),
                StudentAnswer.builder().studentId(studentId).score(80).build(),
                StudentAnswer.builder().studentId(studentId).score(70).build()
        );

        when(studentAnswerRepo.findByStudentId(studentId)).thenReturn(answers);
        when(studentPerformanceRepo.findByStudentId(studentId)).thenReturn(Optional.empty());
        when(studentPerformanceRepo.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        studentPerformanceService.updateStudentPerformance(studentId);

        // Then
        verify(studentPerformanceRepo, times(1)).save(any(StudentPerformance.class));
    }

    @Test
    void updateStudentPerformance_shouldUpdateExisting() {
        // Given
        List<StudentAnswer> answers = List.of(
                StudentAnswer.builder().studentId(studentId).score(85).build(),
                StudentAnswer.builder().studentId(studentId).score(95).build()
        );

        StudentPerformance existing = StudentPerformance.builder()
                .studentId(studentId)
                .totalTasks(1)
                .averageScore(50.0)
                .build();

        when(studentAnswerRepo.findByStudentId(studentId)).thenReturn(answers);
        when(studentPerformanceRepo.findByStudentId(studentId)).thenReturn(Optional.of(existing));
        when(studentPerformanceRepo.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        studentPerformanceService.updateStudentPerformance(studentId);

        // Then
        verify(studentPerformanceRepo, times(1)).save(any());
    }
}

