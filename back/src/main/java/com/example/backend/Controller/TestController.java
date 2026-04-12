package com.example.backend.Controller;

import com.example.backend.DTO.SubmitTestDTO;
import com.example.backend.Entity.StudentAnswer;
import com.example.backend.Services.TestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/test")
@RequiredArgsConstructor
@CrossOrigin
public class TestController {

    private final TestService testService;

    /**
     * Submit test answers.
     * POST /api/v1/test/submit
     * Body: { taskId, studentId, answers: { "questionUUID": "A" } }
     * Returns: { score, correct, total, breakdown, feedback? }
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
     * Get all results for a task (for teacher view).
     * GET /api/v1/test/task/{taskId}/results
     */
    @GetMapping("/task/{taskId}/results")
    public ResponseEntity<?> getTaskResults(@PathVariable UUID taskId) {
        // Delegate to repo via service — placeholder for teacher dashboard
        Optional<StudentAnswer> dummy = testService.getPreviousResult(taskId, UUID.randomUUID());
        return ResponseEntity.ok(Map.of("message", "Use /result/{taskId}/{studentId} per student"));
    }
}
