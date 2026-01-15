package com.grihamate.dto;

import com.grihamate.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotNull(message = "User type is required")
    private User.Role userType;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotBlank(message = "Password is required")
    private String password;

    // Profile image
    private String profileImageUrl;

    // Seeker specific
    private String citizenshipNumber;
    private String citizenshipFrontUrl;
    private String citizenshipBackUrl;

    // Landlord specific
    private User.KycDocumentType kycDocumentType;
    private String kycDocumentUrl;
    private String propertyAddress;
    private String propertyDocumentUrl;
}

