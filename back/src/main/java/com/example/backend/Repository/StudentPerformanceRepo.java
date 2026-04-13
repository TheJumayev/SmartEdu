package com.example.backend.Repository;

import com.example.backend.Entity.StudentPerformance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentPerformanceRepo extends JpaRepository<StudentPerformance, UUID> {

    Optional<StudentPerformance> findByStudentId(UUID studentId);

    List<StudentPerformance> findByStudentIdIn(List<UUID> studentIds);
}

