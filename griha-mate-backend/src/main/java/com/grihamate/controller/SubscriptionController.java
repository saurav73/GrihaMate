package com.grihamate.controller;

import com.grihamate.dto.UserDto;
import com.grihamate.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class SubscriptionController {

    private final UserService userService;

    @PostMapping("/upgrade")
    @PreAuthorize("hasRole('LANDLORD')")
    public ResponseEntity<UserDto> upgradeToPremium(Principal principal) {
        UserDto updatedUser = userService.upgradeToPremium(principal.getName());
        return ResponseEntity.ok(updatedUser);
    }
}
