package com.ucalen.app.controllers;

import com.ucalen.app.models.SubscriptionDay;
import com.ucalen.app.models.requests.SubscriptionDayRequest;
import com.ucalen.app.repositories.SubscriptionDaysRepository;
import com.ucalen.app.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subscription-days")
public class SubscriptionDaysController {
    private final UserRepository userRepository;
    private final SubscriptionDaysRepository subscriptionDaysRepository;

    public SubscriptionDaysController(UserRepository userRepository, SubscriptionDaysRepository subscriptionDaysRepository) {
        this.subscriptionDaysRepository = subscriptionDaysRepository;
        this.userRepository = userRepository;
    }

    private static Long getUserIdFromUsername(UserRepository userRepository, Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + authentication.getName()))
                .getId();
    }

    private static SubscriptionDay getSubscriptionDay(SubscriptionDayRequest subscriptionDayRequest, Long userId) {
        SubscriptionDay subscriptionDay = new SubscriptionDay();
        subscriptionDay.setUserId(userId);
        subscriptionDay.setLinkedDate(subscriptionDayRequest.getLinkedDate());
        subscriptionDay.setSubscriptionName(subscriptionDayRequest.getSubscriptionName());
        subscriptionDay.setSubscriptionExpires(subscriptionDayRequest.getSubscriptionExpires());
        subscriptionDay.setSubscriptionPrice(subscriptionDayRequest.getSubscriptionPrice());
        subscriptionDay.setChargedCard(subscriptionDayRequest.getChargedCard());
        return subscriptionDay;
    }

    @PostMapping()
    public ResponseEntity<SubscriptionDay> addSubscriptionDay(@RequestBody SubscriptionDayRequest subscriptionDayRequest,
                                                              Authentication authentication) {
        Long userId = getUserIdFromUsername(userRepository, authentication);
        SubscriptionDay subscriptionDay = getSubscriptionDay(subscriptionDayRequest, userId);
        SubscriptionDay saved = subscriptionDaysRepository.save(subscriptionDay);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionDay>> getSubscriptionDays(Authentication authentication) {
        Long userId = getUserIdFromUsername(userRepository, authentication);
        List<SubscriptionDay> days = subscriptionDaysRepository.findByUserId(userId);
        return ResponseEntity.ok(days);
    }

    @PutMapping("/update")
    public ResponseEntity<SubscriptionDay> updateSubscriptionDay(@RequestBody SubscriptionDayRequest subscriptionDayRequest,
                                                                 Authentication authentication) {
        Long userId = getUserIdFromUsername(userRepository, authentication);
        SubscriptionDay subscriptionDay = getSubscriptionDay(subscriptionDayRequest, userId);
        subscriptionDay.setId(subscriptionDayRequest.getId());
        SubscriptionDay saved = subscriptionDaysRepository.save(subscriptionDay);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteSubscriptionDay(@PathVariable Long id, Authentication authentication) {
        Long userId = getUserIdFromUsername(userRepository, authentication);
        SubscriptionDay subscriptionDay = subscriptionDaysRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription day not found with id: " + id));
        if (!subscriptionDay.getUserId().equals(userId)) {
            return ResponseEntity.status(403).body("You are not authorized to delete this subscription day");
        }
        subscriptionDaysRepository.delete(subscriptionDay);
        return ResponseEntity.ok("Subscription day deleted successfully");
    }
}