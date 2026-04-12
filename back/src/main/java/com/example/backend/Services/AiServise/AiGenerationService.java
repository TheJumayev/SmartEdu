package com.example.backend.Services.AiServise;

import com.example.backend.DTO.GenerateTaskResponse;
import com.example.backend.Enums.TaskType;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiGenerationService {

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public GenerateTaskResponse generate(String text, TaskType type, String topic) {

        String prompt = buildPrompt(text, type, topic);

        try {
            String aiResponse = geminiService.generate(prompt);
            log.info("AI raw response: {}", aiResponse);

            String json = cleanJson(aiResponse);

            if (json.startsWith("```")) {
                json = json.replaceAll("(?s)```[a-zA-Z]*\\s*", "")
                        .replace("```", "")
                        .trim();
            }

            log.info("AI cleaned JSON: {}", json);

            return objectMapper.readValue(json, GenerateTaskResponse.class);

        } catch (Exception e) {
            log.error("Ошибка AI парсинга: {}", e.getMessage(), e);
            throw new RuntimeException("AI parse error: " + e.getMessage());
        }
    }

    private String buildPrompt(String text, TaskType type, String topic) {
        String topicLine = (topic != null && !topic.isBlank())
                ? "Dars mavzusi: " + topic + "\n\n"
                : "";

        return topicLine + switch (type) {

            case TEST -> """
                Sen tajribali o‘qituvchisan.
                Matn asosida 5 ta test tuz.

                JSON format:
                {
                  "title": "Mavzu nomi",
                  "questions": [
                    {
                      "question": "...",
                      "optionA": "...",
                      "optionB": "...",
                      "optionC": "...",
                      "optionD": "...",
                      "correctAnswer": "A"
                    }
                  ]
                }

                Faqat JSON qaytar.
                Matn:
                """ + text;

            case ORAL -> """
                Matn asosida og‘zaki savol-javob uchun 5 ta savol tuz.

                JSON:
                {
                  "title": "Og‘zaki savollar",
                  "questions": [
                    {"question": "..."}
                  ]
                }

                Faqat JSON qaytar.
                """ + text;

            case CROSSWORD -> """
                Sen tajribali o‘qituvchisan.
                
                Matn asosida krossvord uchun 6-8 ta so'z va ularning ta'rifini ber.
                
                Qoidalar:
                - "correctAnswer" faqat KATTA LOTIN harflarda bo'lsin (masalan: "HTML", "ATOM")
                - "question" so'zning ta'rifi yoki belgisi bo'lsin
                - So'zlar 3-10 harf uzunligida bo'lsin
                - So'zlar mavzu bilan bog'liq bo'lsin
                
                Faqat JSON qaytar.
                
                Format:
                {
                  "title": "Krossvord",
                  "questions": [
                    {
                      "question": "Web sahifa yaratish tili",
                      "correctAnswer": "HTML"
                    },
                    {
                      "question": "Sahifani bezash uchun ishlatiladi",
                      "correctAnswer": "CSS"
                    }
                  ]
                }
                
                Matn:
                """ + text;

            case TABLE -> """
                Matn asosida jadval to‘ldirish topshiriqlari tuz.

                JSON:
                {
                  "title": "Jadval",
                  "questions": [
                    {"question": "..."}
                  ]
                }
                """ + text;

            case MATCHING -> """
                Sen tajribali o‘qituvchisan.
                
                Moslikni topish topshiriqlari tuz.
                
                5 ta juftlik ber.
                
                Faqat JSON qaytar.
                
                Format:
                {
                  "title": "Moslikni toping",
                  "questions": [
                    {
                      "left": "...",
                      "right": "..."
                    }
                  ]
                }
                
                Matn:
                """ + text;

            case CONTINUE_TEXT -> """
                Gapni davom ettirish topshiriqlari tuz.

                JSON:
                {
                  "title": "Gapni davom ettir",
                  "questions": [
                    {"question": "..."}
                  ]
                }
                """ + text;

            case ESSAY -> """
                Qisqa esse yozish uchun mavzular tuz.

                JSON:
                {
                  "title": "Esse",
                  "questions": [
                    {"question": "..."}
                  ]
                }
                """ + text;

            case PRACTICAL -> """
                Amaliy topshiriqlar tuz.

                JSON:
                {
                  "title": "Amaliy topshiriq",
                  "questions": [
                    {"question": "..."}
                  ]
                }
                """ + text;

            case DIAGRAM -> """
                Diagramma tahlili topshiriqlari tuz.

                JSON:
                {
                  "title": "Diagramma tahlili",
                  "questions": [
                    {"question": "..."}
                  ]
                }
                """ + text;
        };
    }
    private String cleanJson(String json) {
        json = json.trim();

        if (json.startsWith("```")) {
            json = json.replaceAll("(?s)```[a-zA-Z]*\\s*", "")
                    .replace("```", "")
                    .trim();
        }

        // 🔥 если AI добавил текст до JSON
        int start = json.indexOf("{");
        int end = json.lastIndexOf("}");

        if (start != -1 && end != -1) {
            json = json.substring(start, end + 1);
        }

        return json;
    }
}