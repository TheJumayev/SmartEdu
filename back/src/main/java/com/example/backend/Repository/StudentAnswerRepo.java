package com.example.backend.Repository;

import com.example.backend.Entity.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentAnswerRepo extends JpaRepository<StudentAnswer, UUID> {

    Optional<StudentAnswer> findByStudentIdAndTaskId(UUID studentId, UUID taskId);

    List<StudentAnswer> findByTaskId(UUID taskId);

    List<StudentAnswer> findByStudentId(UUID studentId);

    List<StudentAnswer> findByStudentIdIn(List<UUID> ids);
}
