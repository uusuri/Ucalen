package com.ucalen.app.models.requests;

import lombok.Data;

@Data
public class SigninRequest {
    private String username;
    private String password;
}
