package com.example.backend;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.data.domain.Sort;

public interface WorkoutEntryRepository extends JpaRepository<WorkoutEntry, Long> {
    List<WorkoutEntry> findByUserId(String userId, Sort sort);
    List<WorkoutEntry> findByUserIdIsNull(Sort sort);
    Optional<WorkoutEntry> findByIdAndUserId(Long id, String userId);
    Optional<WorkoutEntry> findByIdAndUserIdIsNull(Long id);
}
