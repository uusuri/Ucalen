package com.ucalen.app.models.requests;

import lombok.Data;

import java.util.Date;

@Data
public class SubscriptionDayRequest {
    private String username;
    private Date linkedDate;
    private String subscriptionName;
    private Date subscriptionExpires;
    private Double subscriptionPrice;
    private String chargedCard;
}
