package com.example.backend.Services.AiServise;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class AiJsonCleanerTest {

    @Test
    void extractFirstJsonObject_shouldExtractJsonInsideMarkdown() {
        String raw = "Before text\n```json\n{\"a\":1,\"b\":{\"c\":2}}\n```\nafter text";
        String json = AiJsonCleaner.extractFirstJsonObject(raw);
        Assertions.assertEquals("{\"a\":1,\"b\":{\"c\":2}}", json);
    }

    @Test
    void extractFirstJsonObject_shouldThrowWhenNoJson() {
        Assertions.assertThrows(IllegalArgumentException.class,
                () -> AiJsonCleaner.extractFirstJsonObject("no object here"));
    }
}

