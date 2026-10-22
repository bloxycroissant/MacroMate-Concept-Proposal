package com.example.backend;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;
import java.time.LocalDate;

public record WorkoutEntryRequest(
        @NotNull @Pattern(regexp = "Walking|Jogging|Running") String workoutType,
        @NotNull @DecimalMin("0.01") @Digits(integer = 4, fraction = 2) BigDecimal distanceKm,
        @NotNull LocalDate workoutDate) {

    public WorkoutEntry toEntity() {
        WorkoutEntry entry = new WorkoutEntry();
        entry.setWorkoutType(workoutType);
        entry.setDistanceKm(distanceKm.doubleValue());
        entry.setWorkoutDate(workoutDate);
        return entry;
    }
}
