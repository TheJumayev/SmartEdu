package com.example.backend.Repository;

import com.example.backend.Entity.TaskResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskResultRepo extends JpaRepository<TaskResult, UUID> {

    Optional<TaskResult> findByTaskIdAndStudentId(UUID taskId, UUID studentId);

    boolean existsByTaskIdAndStudentId(UUID taskId, UUID studentId);

    List<TaskResult> findByTaskId(UUID taskId);
}
