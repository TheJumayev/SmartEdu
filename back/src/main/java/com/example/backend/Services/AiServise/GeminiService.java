package com.example.backend.Services.AiServise;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.models:gemini-3-flash-preview,gemini-2.0-flash,gemini-2.0-flash-lite,gemini-1.5-flash}")
    private String configuredModels;

    @Value("${gemini.retry.max-attempts:3}")
    private int maxAttempts;

    @Value("${gemini.retry.base-delay-ms:700}")
    private long baseDelayMs;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generate(String prompt) {
        List<String> models = resolveModels();
        Exception lastError = null;

        for (String model : models) {
            try {
                return callWithRetry(model, prompt);
            } catch (RestClientResponseException ex) {
                lastError = ex;
                if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                    log.warn("Gemini model unsupported/not found: {}. Trying next model.", model);
                    continue;
                }
                log.warn("Gemini model {} failed with status {}. Trying next model.", model, ex.getStatusCode());
            } catch (Exception ex) {
                lastError = ex;
                log.warn("Gemini model {} failed: {}", model, ex.getMessage());
            }
        }

        throw new RuntimeException("AI xizmati vaqtincha ishlamayapti. Keyinroq qayta urinib ko'ring.", lastError);
    }

    private String callWithRetry(String model, String prompt) {
        Exception last = null;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                String result = callGemini(model, prompt);
                log.info("Gemini success. model={}, attempt={}", model, attempt);
                return result;
            } catch (RestClientResponseException ex) {
                last = ex;
                if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                    throw ex;
                }

                if (isRetryableStatus(ex.getStatusCode().value()) && attempt < maxAttempts) {
                    long delay = baseDelayMs * attempt;
                    log.warn("Gemini retry. model={}, attempt={}, status={}, delayMs={}",
                            model, attempt, ex.getStatusCode().value(), delay);
                    sleep(delay);
                    continue;
                }
                throw ex;
            } catch (Exception ex) {
                last = ex;
                if (attempt < maxAttempts) {
                    long delay = baseDelayMs * attempt;
                    log.warn("Gemini retry after error. model={}, attempt={}, delayMs={}, error={}",
                            model, attempt, delay, ex.getMessage());
                    sleep(delay);
                    continue;
                }
                throw ex;
            }
        }

        throw new RuntimeException("Gemini chaqirig'ida xatolik", last);
    }

    private boolean isRetryableStatus(int status) {
        return status == 429 || status >= 500;
    }

    private void sleep(long ms) {
        try {
            TimeUnit.MILLISECONDS.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Retry kutish jarayoni to'xtatildi", e);
        }
    }

    private List<String> resolveModels() {
        List<String> models = new ArrayList<>();
        if (configuredModels != null && !configuredModels.isBlank()) {
            Arrays.stream(configuredModels.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .forEach(models::add);
        }

        if (models.isEmpty()) {
            models = List.of("gemini-3-flash-preview", "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash");
        }
        return models;
    }

    private String callGemini(String model, String prompt) {

        String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                + model + ":generateContent?key=" + apiKey;

        Map<String, Object> request = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<?> entity = new HttpEntity<>(request, headers);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<>() {}
        );
        Map<String, Object> body = response.getBody();
        if (body == null) {
            throw new RuntimeException("Gemini javobi bo'sh keldi");
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
        if (candidates == null || candidates.isEmpty()) {
            throw new RuntimeException("Gemini javobida candidates yo'q");
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        if (content == null) {
            throw new RuntimeException("Gemini javobida content yo'q");
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        if (parts == null || parts.isEmpty() || parts.get(0).get("text") == null) {
            throw new RuntimeException("Gemini javobida text yo'q");
        }

        return parts.get(0).get("text").toString();
    }
}