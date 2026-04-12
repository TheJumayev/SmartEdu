package com.example.backend.Repository;

import com.example.backend.Entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TaskRepo extends JpaRepository<Task, UUID> {
    // Dars bo'yicha barcha vazifalarni olish
    List<Task> findByLessonId(UUID lessonId);

    // O'qituvchi bo'yicha barcha vazifalarni olish
    List<Task> findByTeacherId(UUID teacherId);

    // Tasdiqlanmagan vazifalarni olish
    List<Task> findByApprovedFalse();

    // Tasdiqlanmagan vazifalarni dars bo'yicha olish
    List<Task> findByLessonIdAndApprovedFalse(UUID lessonId);
}