package com.grihamate.repository;

import com.grihamate.entity.EmailOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {
    Optional<EmailOtp> findByEmailAndOtpAndUsedFalse(String email, String otp);
    
    @Modifying
    @Query("DELETE FROM EmailOtp e WHERE e.email = :email AND e.used = false")
    void deleteUnusedOtpsByEmail(@Param("email") String email);
    
    @Modifying
    @Query("DELETE FROM EmailOtp e WHERE e.expiryDate < :now")
    void deleteExpiredOtps(@Param("now") LocalDateTime now);
}






