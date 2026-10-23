package com.example.backend;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:account-tests;DB_CLOSE_DELAY=-1", "spring.jpa.hibernate.ddl-auto=create-drop"})
@AutoConfigureMockMvc @ActiveProfiles("firebase")
class AccountIsolationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired FoodEntryRepository foods;
    @Autowired WorkoutEntryRepository workouts;
    @BeforeEach void clear() { foods.deleteAll(); workouts.deleteAll(); }

    @Test void foodEntriesBelongToTheirVerifiedAccount() throws Exception {
        String body = "{\"meal\":\"Breakfast\",\"foodName\":\"Oats\",\"calories\":100,\"protein\":4,\"carbs\":20,\"fat\":2,\"entryDate\":\"2026-10-23\",\"userId\":\"bob\"}";
        String saved = mvc.perform(post("/api/food-entries").with(jwt().jwt(token -> token.subject("alice")))
                .contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value("alice")).andReturn().getResponse().getContentAsString();
        long id = mapper.readTree(saved).get("id").asLong();
        mvc.perform(get("/api/food-entries")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/food-entries").header("Authorization", "Bearer invalid-token")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/food-entries").with(jwt().jwt(token -> token.subject("bob")))).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(delete("/api/food-entries/{id}", id).with(jwt().jwt(token -> token.subject("bob")))).andExpect(status().isNotFound());
        mvc.perform(get("/api/food-entries").with(jwt().jwt(token -> token.subject("alice")))).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(delete("/api/food-entries/{id}", id).with(jwt().jwt(token -> token.subject("alice")))).andExpect(status().isNoContent());
    }

    @Test void workoutsBelongToTheirVerifiedAccount() throws Exception {
        String saved = mvc.perform(post("/api/workouts").with(jwt().jwt(token -> token.subject("alice")))
                .contentType(MediaType.APPLICATION_JSON).content("{\"workoutType\":\"Walking\",\"distanceKm\":2.5,\"workoutDate\":\"2026-10-23\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long id = mapper.readTree(saved).get("id").asLong();
        mvc.perform(get("/api/workouts")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/workouts").with(jwt().jwt(token -> token.subject("bob")))).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(delete("/api/workouts/{id}", id).with(jwt().jwt(token -> token.subject("bob")))).andExpect(status().isNotFound());
        mvc.perform(get("/api/workouts").with(jwt().jwt(token -> token.subject("alice")))).andExpect(jsonPath("$.length()").value(1));
    }

    @Test void unassignedLegacyEntriesAreNotExposedToNewAccounts() throws Exception {
        FoodEntry entry = new FoodEntry(); entry.setFoodName("Legacy local entry"); foods.save(entry);
        mvc.perform(get("/api/food-entries").with(jwt().jwt(token -> token.subject("alice")))).andExpect(jsonPath("$.length()").value(0));
    }
}
