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

/**
 * Service implementing user feedback business logic.
 */
@Service
@RequiredArgsConstructor
public class FeedbackService {
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    @Transactional
    /**
     * Saves one feedback entry for a seeker. Each seeker may submit feedback only once;
     * a second attempt is rejected.
     *
     * @param seekerEmail email of the seeker submitting feedback
     * @param comment feedback text
     * @param rating numeric rating given by the seeker
     * @return the saved feedback, as a DTO
     * @throws RuntimeException if the seeker is missing or has already submitted feedback
     */
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

    /**
     * Checks whether a seeker has already submitted feedback, so the UI can hide the
     * feedback form after the one allowed submission.
     *
     * @param seekerEmail email of the seeker to check
     * @return true if the seeker has already submitted feedback
     * @throws RuntimeException if no user with that email exists
     */
    public boolean hasUserSubmittedFeedback(String seekerEmail) {
        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        return feedbackRepository.findBySeeker(seeker).isPresent();
    }

    @Transactional(readOnly = true)
    /**
     * Lists all submitted feedback with its seeker, for the admin view.
     *
     * @return all feedback entries, as DTOs
     */
    public List<FeedbackDto> getAllFeedback() {
        List<Feedback> feedbacks = feedbackRepository.findAllWithSeeker();
        return feedbacks.stream()
                .map(FeedbackDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    /**
     * Deletes one feedback entry (admin action).
     *
     * @param id feedback id
     * @throws RuntimeException if no feedback with that id exists
     */
    public void deleteFeedback(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));
        feedbackRepository.delete(feedback);
    }
}
