package com.grihamate.dto;

import com.grihamate.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String profileImageUrl;
    private User.Role role;
    private Boolean active;
    private Boolean emailVerified;
    private String citizenshipNumber;
    private User.VerificationStatus verificationStatus;
    private User.SubscriptionStatus subscriptionStatus;
    private LocalDateTime subscriptionExpiry;
    private LocalDateTime createdAt;

    public static UserDto fromEntity(User user) {
        return new UserDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getProfileImageUrl(),
                user.getRole(),
                user.getActive(),
                user.getEmailVerified(),
                user.getCitizenshipNumber(),
                user.getVerificationStatus(),
                user.getSubscriptionStatus(),
                user.getSubscriptionExpiry(),
                user.getCreatedAt());
    }
}
