package com.grihamate.repository;

import com.grihamate.entity.Feedback;
import com.grihamate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    Optional<Feedback> findBySeeker(User seeker);
    
    @Query("SELECT f FROM Feedback f JOIN FETCH f.seeker ORDER BY f.createdAt DESC")
    List<Feedback> findAllWithSeeker();
}
