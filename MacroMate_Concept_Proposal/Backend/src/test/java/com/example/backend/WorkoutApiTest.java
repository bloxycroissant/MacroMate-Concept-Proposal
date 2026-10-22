package com.example.backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:workout-tests;DB_CLOSE_DELAY=-1", "spring.jpa.hibernate.ddl-auto=create-drop"})
@AutoConfigureMockMvc
class WorkoutApiTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired WorkoutEntryRepository repository;

    @BeforeEach void resetDatabase() { repository.deleteAll(); }

    private ObjectNode workout(String type, double distance, String date) {
        return mapper.createObjectNode()
                .put("workoutType", type)
                .put("distanceKm", distance)
                .put("workoutDate", date);
    }

    private long create(ObjectNode workout) throws Exception {
        String content = mvc.perform(post("/api/workouts").contentType(MediaType.APPLICATION_JSON).content(workout.toString()))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return mapper.readTree(content).get("id").asLong();
    }

    @Test void createsListsAndDeletesWorkouts() throws Exception {
        long newerId = create(workout("Running", 3.25, "2026-10-14"));
        create(workout("Walking", 1.5, "2026-10-13"));
        mvc.perform(get("/api/workouts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(newerId))
                .andExpect(jsonPath("$[0].workoutType").value("Running"))
                .andExpect(jsonPath("$[0].distanceKm").value(3.25))
                .andExpect(jsonPath("$[0].workoutDate").value("2026-10-14"));

        mvc.perform(delete("/api/workouts/{id}", newerId)).andExpect(status().isNoContent());
        mvc.perform(get("/api/workouts")).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(delete("/api/workouts/{id}", newerId)).andExpect(status().isNotFound());
    }

    @ParameterizedTest
    @CsvSource({"Cycling,2", "Walking,0", "Running,-1", "Jogging,10000", "Jogging,1.234"})
    void rejectsInvalidWorkoutTypeOrDistance(String type, String distance) throws Exception {
        mvc.perform(post("/api/workouts").contentType(MediaType.APPLICATION_JSON)
                        .content(workout(type, Double.parseDouble(distance), "2026-10-14").toString()))
                .andExpect(status().isBadRequest());
        assertThat(repository.count()).isZero();
    }

    @ParameterizedTest
    @ValueSource(strings = {"workoutType", "distanceKm", "workoutDate"})
    void rejectsMissingWorkoutFields(String field) throws Exception {
        ObjectNode body = workout("Walking", 2.5, "2026-10-14");
        body.remove(field);
        mvc.perform(post("/api/workouts").contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields." + field).exists());
    }

    @Test void rejectsMalformedWorkoutDate() throws Exception {
        mvc.perform(post("/api/workouts").contentType(MediaType.APPLICATION_JSON)
                        .content(workout("Jogging", 2, "not-a-date").toString()))
                .andExpect(status().isBadRequest());
        assertThat(repository.count()).isZero();
    }
}
