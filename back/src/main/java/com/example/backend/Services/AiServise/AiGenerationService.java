package com.example.backend.Services.AiServise;

import com.example.backend.DTO.GenerateTaskResponse;
import com.example.backend.DTO.QuestionDTO;
import com.example.backend.Enums.TaskType;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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

            GenerateTaskResponse response = objectMapper.readValue(json, GenerateTaskResponse.class);

            // CONTINUE_TEXT: map prefix → question; options list → optionA/B/C/D for storage
            if (type == TaskType.CONTINUE_TEXT && response.getQuestions() != null) {
                response.getQuestions().forEach(q -> {
                    if (q.getPrefix() != null && !q.getPrefix().isBlank()) {
                        q.setQuestion(q.getPrefix());
                    }
                    List<String> opts = q.getOptions();
                    if (opts != null) {
                        if (opts.size() > 0) q.setOptionA(opts.get(0));
                        if (opts.size() > 1) q.setOptionB(opts.get(1));
                        if (opts.size() > 2) q.setOptionC(opts.get(2));
                        if (opts.size() > 3) q.setOptionD(opts.get(3));
                    }
                });
            }

            // TABLE: serialize {columns, rows, options, answers} into a single synthetic question for storage
            if (type == TaskType.TABLE && response.getColumns() != null) {
                Map<String, Object> tableData = new LinkedHashMap<>();
                tableData.put("columns", response.getColumns());
                tableData.put("rows", response.getRows());
                if (response.getOptions() != null) tableData.put("options", response.getOptions());
                tableData.put("answers", response.getAnswers());
                String tableJson = objectMapper.writeValueAsString(tableData);
                QuestionDTO synthetic = new QuestionDTO();
                synthetic.setQuestion(tableJson);
                response.setQuestions(List.of(synthetic));
            }

            return response;

        } catch (Exception e) {
            log.error("AI parse error: {}", e.getMessage(), e);
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
                Sen zamonaviy pedagogik metodlardan foydalanadigan o'qituvchisan.
                
                Matn asosida jadval to'ldirish topshiriq tuz.
                
                Talaba yozmasdan tanlash orqali javob berishi kerak (mobile-friendly).
                
                Faqat JSON qaytar.
                
                Format:
                {
                  "title": "Jadvalni to'ldiring",
                  "columns": ["Tushuncha", "Tavsif"],
                  "rows": [
                    ["Konfidensiallik", ""],
                    ["Yaxlitlik", ""]
                  ],
                  "options": [
                    "Axborotni himoyalash",
                    "O'zgartirishdan himoya",
                    "Ruxsatsiz kirish"
                  ],
                  "answers": [
                    ["Konfidensiallik", "Ruxsatsiz kirish"],
                    ["Yaxlitlik", "O'zgartirishdan himoya"]
                  ]
                }
                
                Talablar:
                - options chalkashtirilgan bo'lsin (to'g'ri javoblar + chalg'ituvchilar)
                - 2-3 ta variant bo'lsin
                - rows va answers bir xil o'lchamda bo'lsin
                - bo'sh kataklarga mos to'g'ri javoblar answers ichida bo'lsin
                - qisqa va aniq bo'lsin
                
                Matn:
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
                Sen tajribali o'qituvchisan.
                
                Matn asosida gapni davom ettirish topshiriqlari tuz.
                
                Talaba variantlardan tanlab javob beradi (yozmaydi).
                
                Faqat JSON qaytar.
                
                Format:
                {
                  "title": "Gapni davom ettir",
                  "questions": [
                    {
                      "prefix": "HTML bu",
                      "options": [
                        "programming language",
                        "markup language",
                        "database"
                      ],
                      "correctAnswer": "markup language"
                    }
                  ]
                }
                
                Talablar:
                - 5 ta savol ber
                - har bir savolda 3-4 ta variant bo'lsin
                - faqat 1 ta to'g'ri javob bo'lsin
                - chalg'ituvchi variantlar ham bo'lsin
                - prefix qisqa (4-8 so'z) bo'lsin
                
                Matn:
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