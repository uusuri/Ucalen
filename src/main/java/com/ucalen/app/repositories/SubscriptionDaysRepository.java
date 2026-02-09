package com.ucalen.app.repositories;

import com.ucalen.app.models.SubscriptionDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionDaysRepository extends JpaRepository<SubscriptionDay, Long> {
    List<SubscriptionDay> findByUserId(Long userId);
}
