package com.example.backend.Services.AiServise;

import com.example.backend.DTO.TeacherInsightRequestDTO;
import com.example.backend.DTO.TeacherInsightResponseDTO;
import com.example.backend.Entity.StudentPerformance;
import com.example.backend.Repository.StudentPerformanceRepo;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * AI-based teacher insight service using aggregated StudentPerformance data.
 * Optimized for performance compared to raw StudentAnswer queries.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiTeacherInsightService {

    private static final long CACHE_TTL_SECONDS = 300;

    private static final String FINAL_PROMPT = """
            Siz ta'lim sohasida ishlovchi sun'iy intellekt yordamchisiz.
            
            Vazifa:
            Berilgan o'quvchilar ma'lumotlarini tahlil qiling va:
            1. Yuqori natijali o'quvchilarni aniqlang va ularga mos kasblarni ko'rsating.
            2. Past natijali o'quvchilar uchun aniq pedagogik tavsiyalar bering.
            3. Sinf bo'yicha umumiy qisqa xulosa yozing.
            
            Qoidalar:
            - Javob faqat O'zbek tilida bo'lsin
            - Faqat JSON formatda qaytaring
            - Ortiqcha izoh yozmang
            
            Qo'shimcha qoidalar:
            - topStudents: averageScore >= 80 bo'lgan o'quvchilar
            - lowStudents: averageScore < 50 bo'lgan o'quvchilar
            - potentialCareers kamida 2 ta bo'lsin
            - lowStudents.recommendations kamida 3 ta bo'lsin
            - Tavsiyalar aniq, darsda qo'llasa bo'ladigan bo'lsin
            - Kasb mosligi uchun sababni qisqa va aniq yozing
            
            Chiqish formati (strict):
            {
              "topStudents": [
                {
                  "fullName": "...",
                  "score": 90,
                  "potentialCareers": ["...", "..."],
                  "reason": "..."
                }
              ],
              "lowStudents": [
                {
                  "fullName": "...",
                  "score": 45,
                  "recommendations": ["...", "...", "..."]
                }
              ],
              "generalFeedback": "..."
            }
            
            Ma'lumotlar:
            {students_json}
            """;

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;
    private final StudentPerformanceRepo studentPerformanceRepo;

    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    public TeacherInsightResponseDTO generateInsight(TeacherInsightRequestDTO request) {
        validateRequest(request);

        TeacherInsightRequestDTO filteredRequest = filterStudentsByPerformance(request);

        String cacheKey = buildCacheKey(filteredRequest);
        TeacherInsightResponseDTO cached = getFromCache(cacheKey);
        if (cached != null) {
            return cached;
        }

        String studentsJson;
        try {
            studentsJson = objectMapper.writeValueAsString(filteredRequest);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Teacher insight request JSON ga o'tkazilmadi", e);
        }

        String prompt = FINAL_PROMPT.replace("{students_json}", studentsJson);

        String rawAiResponse = geminiService.generate(prompt);
        log.info("Teacher insight raw AI response: {}", rawAiResponse);

        String cleanedJson;
        try {
            cleanedJson = AiJsonCleaner.extractFirstJsonObject(rawAiResponse);
        } catch (Exception e) {
            log.error("Teacher insight JSON cleaning error. raw={}", rawAiResponse, e);
            throw new RuntimeException("AI javobidan JSON ajratib bo'lmadi", e);
        }
        log.info("Teacher insight cleaned JSON: {}", cleanedJson);

        try {
            TeacherInsightResponseDTO parsed = objectMapper.readValue(cleanedJson, TeacherInsightResponseDTO.class);
            normalizeResponse(parsed);
            putIntoCache(cacheKey, parsed);
            return parsed;
        } catch (JsonProcessingException e) {
            log.error("Teacher insight JSON parse error. cleanedJson={}", cleanedJson, e);
            throw new RuntimeException("AI javobini JSON ga parse qilishda xatolik", e);
        }
    }

    private void validateRequest(TeacherInsightRequestDTO request) {
        if (request == null || request.getStudents() == null || request.getStudents().isEmpty()) {
            throw new IllegalArgumentException("students bo'sh bo'lmasligi kerak");
        }
    }

    private TeacherInsightRequestDTO filterStudentsByPerformance(TeacherInsightRequestDTO request) {
        List<UUID> studentIds = request.getStudents().stream()
                .map(TeacherInsightRequestDTO.StudentInsightInputDTO::getStudentId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        if (studentIds.isEmpty()) {
            throw new IllegalArgumentException("teacher-insight uchun studentId yuborilishi kerak");
        }

        List<StudentPerformance> performances = studentPerformanceRepo.findByStudentIdIn(studentIds);
        if (performances.isEmpty()) {
            throw new IllegalArgumentException("StudentPerformance ichida mos talabalar topilmadi");
        }

        Map<UUID, StudentPerformance> performanceMap = performances.stream()
                .collect(Collectors.toMap(StudentPerformance::getStudentId, p -> p));

        List<TeacherInsightRequestDTO.StudentInsightInputDTO> existingStudents = request.getStudents().stream()
                .filter(student -> student.getStudentId() != null)
                .filter(student -> performanceMap.containsKey(student.getStudentId()))
                .map(student -> buildEnrichedStudent(student, performanceMap.get(student.getStudentId())))
                .collect(Collectors.toList());

        if (existingStudents.isEmpty()) {
            throw new IllegalArgumentException("StudentPerformance ichida bor talabalar topilmadi");
        }

        List<TeacherInsightRequestDTO.StudentInsightInputDTO> lowScoreStudents = existingStudents.stream()
                .filter(student -> student.getScore() != null && student.getScore() < 60)
                .collect(Collectors.toList());

        List<TeacherInsightRequestDTO.StudentInsightInputDTO> resultStudents =
                lowScoreStudents.isEmpty() ? existingStudents : lowScoreStudents;

        log.info("Teacher insight performance filter: incoming={}, existingInPerformance={}, sentToAi={}",
                request.getStudents().size(), existingStudents.size(), resultStudents.size());

        TeacherInsightRequestDTO filtered = new TeacherInsightRequestDTO();
        filtered.setLessonId(request.getLessonId());
        filtered.setStudents(resultStudents);
        return filtered;
    }

    private TeacherInsightRequestDTO.StudentInsightInputDTO buildEnrichedStudent(
            TeacherInsightRequestDTO.StudentInsightInputDTO student,
            StudentPerformance perf) {
        TeacherInsightRequestDTO.StudentInsightInputDTO enriched = new TeacherInsightRequestDTO.StudentInsightInputDTO();
        enriched.setStudentId(student.getStudentId());
        enriched.setFullName(student.getFullName());
        enriched.setScore((int) Math.round(perf.getAverageScore()));
        enriched.setCompletedTasks(perf.getTotalTasks());
        enriched.setAverageTime(student.getAverageTime());
        enriched.setStrengths(student.getStrengths() != null ? new ArrayList<>(student.getStrengths()) : null);
        enriched.setWeaknesses(student.getWeaknesses() != null ? new ArrayList<>(student.getWeaknesses()) : null);
        return enriched;
    }

    private void normalizeResponse(TeacherInsightResponseDTO dto) {
        if (dto.getTopStudents() == null) {
            dto.setTopStudents(List.of());
        }
        if (dto.getLowStudents() == null) {
            dto.setLowStudents(List.of());
        }
        if (dto.getGeneralFeedback() == null) {
            dto.setGeneralFeedback("");
        }
    }

    private String buildCacheKey(TeacherInsightRequestDTO request) {
        try {
            return objectMapper.writeValueAsString(request);
        } catch (JsonProcessingException e) {
            return String.valueOf(request.hashCode());
        }
    }

    private TeacherInsightResponseDTO getFromCache(String key) {
        CacheEntry entry = cache.get(key);
        if (entry == null) {
            return null;
        }
        if (Instant.now().isAfter(entry.expiresAt())) {
            cache.remove(key);
            return null;
        }
        return entry.payload();
    }

    private void putIntoCache(String key, TeacherInsightResponseDTO payload) {
        cache.put(key, new CacheEntry(payload, Instant.now().plusSeconds(CACHE_TTL_SECONDS)));
    }

    private record CacheEntry(TeacherInsightResponseDTO payload, Instant expiresAt) {
    }
}

