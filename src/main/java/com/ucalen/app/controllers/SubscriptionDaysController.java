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

    @PostMapping()
    public ResponseEntity<SubscriptionDay> addSubscriptionDay(@RequestBody SubscriptionDayRequest subscriptionDayRequest) {
        Long userId = userRepository.findByUsername(subscriptionDayRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found: " + subscriptionDayRequest.getUsername()))
                .getId();

        SubscriptionDay subscriptionDay = new SubscriptionDay();
        subscriptionDay.setUserId(userId);
        subscriptionDay.setLinkedDate(subscriptionDayRequest.getLinkedDate());
        subscriptionDay.setSubscriptionName(subscriptionDayRequest.getSubscriptionName());
        subscriptionDay.setSubscriptionExpires(subscriptionDayRequest.getSubscriptionExpires());
        subscriptionDay.setSubscriptionPrice(subscriptionDayRequest.getSubscriptionPrice());
        subscriptionDay.setChargedCard(subscriptionDayRequest.getChargedCard());

        SubscriptionDay saved = subscriptionDaysRepository.save(subscriptionDay);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<SubscriptionDay> getSubscriptionDays(Authentication authentication) {
        Long userId = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + authentication.getName()))
                .getId();
        List<SubscriptionDay> days = subscriptionDaysRepository.findByUserId(userId);
        return ResponseEntity.ok(days.isEmpty() ? null : days.get(0));
    }

}
