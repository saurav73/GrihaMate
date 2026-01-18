package com.grihamate.dto;

import com.grihamate.entity.Feedback;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDto {
    private Long id;
    private String seekerName;
    private String comment;
    private Integer rating;
    private LocalDateTime createdAt;

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
