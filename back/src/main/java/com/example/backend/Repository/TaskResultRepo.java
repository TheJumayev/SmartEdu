package com.example.backend.Repository;

import com.example.backend.Entity.TaskResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskResultRepo extends JpaRepository<TaskResult, UUID> {

    Optional<TaskResult> findByTaskIdAndStudentId(UUID taskId, UUID studentId);

    boolean existsByTaskIdAndStudentId(UUID taskId, UUID studentId);

    List<TaskResult> findByTaskId(UUID taskId);

    List<TaskResult> findByStudentId(UUID studentId);

    @Query("SELECT tr FROM TaskResult tr " +
           "LEFT JOIN FETCH tr.task t " +
           "LEFT JOIN FETCH t.lesson " +
           "LEFT JOIN FETCH t.teacher " +
           "WHERE tr.student.id = :studentId")
    List<TaskResult> findByStudentIdWithDetails(@Param("studentId") UUID studentId);

    List<TaskResult> findByStudent_GroupsId(UUID groupId);

    List<TaskResult> findByTask_LessonId(UUID lessonId);

    List<TaskResult> findByStudent_IdIn(List<UUID> studentIds);

    List<TaskResult> findByTask_LessonIdAndStudent_IdIn(UUID lessonId, List<UUID> studentIds);
}
