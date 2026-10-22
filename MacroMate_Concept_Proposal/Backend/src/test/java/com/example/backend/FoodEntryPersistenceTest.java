package com.example.backend;

import static org.assertj.core.api.Assertions.assertThat;
import java.nio.file.Path;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;

class FoodEntryPersistenceTest {
    @TempDir Path directory;

    private ConfigurableApplicationContext openDatabase() {
        return new SpringApplicationBuilder(BackendApplication.class).web(WebApplicationType.NONE)
                .run("--spring.datasource.url=jdbc:h2:file:" + directory.resolve("journal").toString().replace('\\', '/') + ";DB_CLOSE_ON_EXIT=FALSE",
                        "--spring.jpa.hibernate.ddl-auto=update", "--spring.main.banner-mode=off");
    }

    @Test void entriesSurviveApplicationRestart() {
        long id;
        long workoutId;
        try (ConfigurableApplicationContext first = openDatabase()) {
            FoodEntry entry = new FoodEntry();
            entry.setMeal("Lunch");
            entry.setFoodName("Rice");
            entry.setCalories(200);
            entry.setProtein(4.0);
            entry.setCarbs(45.0);
            entry.setFat(0.5);
            entry.setEntryDate(LocalDate.of(2026, 10, 14));
            id = first.getBean(FoodEntryRepository.class).saveAndFlush(entry).getId();

            WorkoutEntry workout = new WorkoutEntry();
            workout.setWorkoutType("Walking");
            workout.setDistanceKm(2.5);
            workout.setWorkoutDate(LocalDate.of(2026, 10, 14));
            workoutId = first.getBean(WorkoutEntryRepository.class).saveAndFlush(workout).getId();
        }
        try (ConfigurableApplicationContext second = openDatabase()) {
            FoodEntry saved = second.getBean(FoodEntryRepository.class).findById(id).orElseThrow();
            assertThat(saved.getFoodName()).isEqualTo("Rice");
            assertThat(saved.getCalories()).isEqualTo(200);
            assertThat(saved.getEntryDate()).isEqualTo(LocalDate.of(2026, 10, 14));

            WorkoutEntry savedWorkout = second.getBean(WorkoutEntryRepository.class).findById(workoutId).orElseThrow();
            assertThat(savedWorkout.getWorkoutType()).isEqualTo("Walking");
            assertThat(savedWorkout.getDistanceKm()).isEqualTo(2.5);
            assertThat(savedWorkout.getWorkoutDate()).isEqualTo(LocalDate.of(2026, 10, 14));
        }
    }
}
