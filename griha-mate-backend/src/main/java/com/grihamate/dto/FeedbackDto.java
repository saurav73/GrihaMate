package com.grihamate.dto;

import com.grihamate.entity.Feedback;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Public view of a seeker's feedback on a landlord, with the seeker's name (or Anonymous).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDto {
    private Long id;
    private String seekerName;
    private String comment;
    private Integer rating;
    private LocalDateTime createdAt;

    /**
     * Builds the public view of a feedback entry. The seeker's name is shown, or
     * "Anonymous" when the feedback has no linked seeker.
     *
     * @param feedback persisted feedback entity
     * @return DTO carrying the feedback's id, seeker name, comment, rating and timestamp
     */
    public static FeedbackDto fromEntity(Feedback feedback) {
        FeedbackDto dto = new FeedbackDto();
        dto.setId(feedback.getId());
        dto.setSeekerName(feedback.getSeeker() != null ? feedback.getSeeker().getFullName() : "Anonymous");
        dto.setComment(feedback.getComment());
        dto.setRating(feedback.getRating());
        dto.setCreatedAt(feedback.getCreatedAt());
        return dto;
    }
}
