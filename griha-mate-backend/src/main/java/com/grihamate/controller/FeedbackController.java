package com.grihamate.controller;

import com.grihamate.dto.FeedbackDto;
import com.grihamate.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class FeedbackController {
    private final FeedbackService feedbackService;

    @PostMapping("/submit")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<FeedbackDto> submitFeedback(@RequestBody Map<String, Object> request, Principal principal) {
        String comment = (String) request.get("comment");
        Integer rating = (Integer) request.get("rating");
        return ResponseEntity.ok(feedbackService.submitFeedback(principal.getName(), comment, rating));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeedbackDto>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackService.getAllFeedback());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteFeedback(@PathVariable Long id) {
        try {
            feedbackService.deleteFeedback(id);
            return ResponseEntity.ok(Map.of("message", "Feedback deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/check")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<Map<String, Boolean>> checkFeedbackStatus(Principal principal) {
        boolean hasSubmitted = feedbackService.hasUserSubmittedFeedback(principal.getName());
        return ResponseEntity.ok(Map.of("hasSubmitted", hasSubmitted));
    }
}
