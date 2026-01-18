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
import java.util.Optional;
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

        // Check if user has already submitted feedback
        Optional<Feedback> existingFeedback = feedbackRepository.findBySeeker(seeker);
        if (existingFeedback.isPresent()) {
            throw new RuntimeException("You have already submitted feedback. Only one feedback per user is allowed.");
        }

        Feedback feedback = new Feedback();
        feedback.setSeeker(seeker);
        feedback.setComment(comment);
        feedback.setRating(rating);

        Feedback savedFeedback = feedbackRepository.save(feedback);
        return FeedbackDto.fromEntity(savedFeedback);
    }

    public boolean hasUserSubmittedFeedback(String seekerEmail) {
        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        return feedbackRepository.findBySeeker(seeker).isPresent();
    }

    @Transactional(readOnly = true)
    public List<FeedbackDto> getAllFeedback() {
        List<Feedback> feedbacks = feedbackRepository.findAllWithSeeker();
        return feedbacks.stream()
                .map(FeedbackDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteFeedback(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));
        feedbackRepository.delete(feedback);
    }
}
