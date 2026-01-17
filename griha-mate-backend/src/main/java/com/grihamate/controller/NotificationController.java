package com.grihamate.controller;

import com.grihamate.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class NotificationController {
    private final EmailService emailService;

    @PostMapping("/email")
    public ResponseEntity<?> sendEmail(@RequestBody Map<String, String> request) {
        String to = request.get("to");
        String subject = request.get("subject");
        String body = request.get("body");

        if (to == null || subject == null || body == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
        }

        emailService.sendHtmlEmail(to, subject, body);
        return ResponseEntity.ok(Map.of("message", "Email sent successfully"));
    }
}
