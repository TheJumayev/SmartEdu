package com.example.backend.Controller;

import com.example.backend.DTO.StudentResultDTO;
import com.example.backend.DTO.SubmitTestDTO;
import com.example.backend.Entity.Groups;
import com.example.backend.Entity.Student;
import com.example.backend.Entity.StudentAnswer;
import com.example.backend.Repository.StudentRepo;
import com.example.backend.Services.TestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/test")
@RequiredArgsConstructor
@CrossOrigin
public class TestController {

    private final TestService testService;
    private final StudentRepo studentRepo;

    /**
     * Submit test answers.
     * POST /api/v1/test/submit
     */
    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submit(@RequestBody SubmitTestDTO dto) {
        Map<String, Object> result = testService.checkTest(dto);
        return ResponseEntity.ok(result);
    }

    /**
     * Check if student already submitted this task.
     * GET /api/v1/test/result/{taskId}/{studentId}
     */
    @GetMapping("/result/{taskId}/{studentId}")
    public ResponseEntity<?> getResult(
            @PathVariable UUID taskId,
            @PathVariable UUID studentId
    ) {
        Optional<StudentAnswer> result = testService.getPreviousResult(taskId, studentId);
        return result.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(null));
    }

    /**
     * Get all results for a task (teacher view).
     * GET /api/v1/test/task/{taskId}/results
     * Returns: List<StudentResultDTO> with groupId/groupName included.
     */
    @GetMapping("/task/{taskId}/results")
    public ResponseEntity<List<StudentResultDTO>> getTaskResults(@PathVariable UUID taskId) {
        List<StudentAnswer> answers = testService.getTaskResults(taskId);
        List<StudentResultDTO> dtos = answers.stream().map(a -> {
            UUID groupId = null;
            String groupName = null;
            Optional<Student> student = studentRepo.findById(a.getStudentId());
            if (student.isPresent() && student.get().getGroups() != null) {
                Groups g = student.get().getGroups();
                groupId = g.getId();
                groupName = g.getName();
            }
            return StudentResultDTO.builder()
                    .id(a.getId())
                    .studentId(a.getStudentId())
                    .studentName(a.getStudentName())
                    .score(a.getScore())
                    .correct(a.getCorrect())
                    .total(a.getTotal())
                    .feedback(a.getFeedback())
                    .submittedAt(a.getSubmittedAt())
                    .groupId(groupId)
                    .groupName(groupName)
                    .type("TEST")
                    .build();
        }).toList();
        return ResponseEntity.ok(dtos);
    }
}
