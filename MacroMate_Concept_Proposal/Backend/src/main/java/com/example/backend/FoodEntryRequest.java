package com.example.backend;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record FoodEntryRequest(
        @NotBlank @Pattern(regexp = "Breakfast|Lunch|Dinner|Snacks") String meal,
        @NotBlank @Size(max = 120) String foodName,
        @NotNull @Min(0) @Max(1000000) Integer calories,
        @NotNull @DecimalMin("0") @DecimalMax("100000") BigDecimal protein,
        @NotNull @DecimalMin("0") @DecimalMax("100000") BigDecimal carbs,
        @NotNull @DecimalMin("0") @DecimalMax("100000") BigDecimal fat,
        @NotNull LocalDate entryDate) {

    public FoodEntry toEntity() {
        FoodEntry entry = new FoodEntry();
        entry.setMeal(meal);
        entry.setFoodName(foodName.trim());
        entry.setCalories(calories);
        entry.setProtein(protein.doubleValue());
        entry.setCarbs(carbs.doubleValue());
        entry.setFat(fat.doubleValue());
        entry.setEntryDate(entryDate);
        return entry;
    }
}
