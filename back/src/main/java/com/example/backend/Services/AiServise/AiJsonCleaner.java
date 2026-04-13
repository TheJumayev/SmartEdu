package com.example.backend.Services.AiServise;

public final class AiJsonCleaner {

    private AiJsonCleaner() {
    }

    public static String cleanMarkdown(String raw) {
        if (raw == null) {
            return "";
        }

        String cleaned = raw.trim();
        cleaned = cleaned.replace("```json", "");
        cleaned = cleaned.replace("```", "");
        return cleaned.trim();
    }

    public static String extractFirstJsonObject(String raw) {
        String text = cleanMarkdown(raw);
        int start = text.indexOf('{');
        if (start < 0) {
            throw new IllegalArgumentException("AI javobida JSON obyekt topilmadi");
        }

        int depth = 0;
        boolean inString = false;
        boolean escaped = false;

        for (int i = start; i < text.length(); i++) {
            char c = text.charAt(i);

            if (inString) {
                if (escaped) {
                    escaped = false;
                } else if (c == '\\') {
                    escaped = true;
                } else if (c == '"') {
                    inString = false;
                }
                continue;
            }

            if (c == '"') {
                inString = true;
                continue;
            }

            if (c == '{') {
                depth++;
            } else if (c == '}') {
                depth--;
                if (depth == 0) {
                    return text.substring(start, i + 1).trim();
                }
            }
        }

        throw new IllegalArgumentException("AI javobida to'liq JSON topilmadi");
    }
}

