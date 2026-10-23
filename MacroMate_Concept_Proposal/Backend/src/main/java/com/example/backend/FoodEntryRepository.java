package com.example.backend;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.data.domain.Sort;

public interface FoodEntryRepository extends JpaRepository<FoodEntry, Long> {
    List<FoodEntry> findByEntryDateOrderByIdAsc(LocalDate entryDate);
    List<FoodEntry> findByUserId(String userId, Sort sort);
    List<FoodEntry> findByUserIdIsNull(Sort sort);
    Optional<FoodEntry> findByIdAndUserId(Long id, String userId);
    Optional<FoodEntry> findByIdAndUserIdIsNull(Long id);
}