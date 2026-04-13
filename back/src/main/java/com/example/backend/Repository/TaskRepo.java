package com.example.backend.Repository;

import com.example.backend.Entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    // Ulashilgan (sharedTeachers) vazifalarni olish
    @Query("SELECT t FROM Task t JOIN t.sharedTeachers st WHERE st.id = :teacherId")
    List<Task> findBySharedTeacherId(@Param("teacherId") UUID teacherId);

    // O'qituvchining o'zi yaratgan va unga ulashilgan barcha vazifalar
    @Query("SELECT DISTINCT t FROM Task t LEFT JOIN t.sharedTeachers st " +
           "WHERE t.teacher.id = :teacherId OR st.id = :teacherId")
    List<Task> findAllAccessibleByTeacher(@Param("teacherId") UUID teacherId);
}