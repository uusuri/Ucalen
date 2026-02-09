package com.ucalen.app.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Entity
@Table(name = "subscription_days")
@Getter
@Setter
public class SubscriptionDay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "linked_date", nullable = false)
    private Date linkedDate;

    @Column(name = "subscription_name", nullable = false)
    private String subscriptionName;

    @Column(name = "subscription_expires", nullable = false)
    private Date subscriptionExpires;

    @Column(name = "subscription_price")
    private Double subscriptionPrice;

    @Column(name = "charged_card")
    private String chargedCard;
}
