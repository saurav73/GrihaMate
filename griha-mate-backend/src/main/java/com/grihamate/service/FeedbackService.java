package com.grihamate.service;

import com.grihamate.dto.FeedbackDto;
import com.grihamate.entity.Feedback;
import com.grihamate.entity.User;
import com.grihamate.repository.FeedbackRepository;
import com.grihamate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    @Transactional
    public FeedbackDto submitFeedback(String seekerEmail, String comment, Integer rating) {
        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));

        Feedback feedback = new Feedback();
        feedback.setSeeker(seeker);
        feedback.setComment(comment);
        feedback.setRating(rating);

        Feedback savedFeedback = feedbackRepository.save(feedback);
        return FeedbackDto.fromEntity(savedFeedback);
    }

    public List<FeedbackDto> getAllFeedback() {
        return feedbackRepository.findAll().stream()
                .map(FeedbackDto::fromEntity)
                .collect(Collectors.toList());
    }
}
