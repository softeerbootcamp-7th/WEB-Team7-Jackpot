package com.jackpot.narratix.global.auth.jwt.domain;

import com.jackpot.narratix.global.auth.jwt.JwtConstants;

import java.util.Date;

public class AccessToken extends Token{

    private AccessToken(String token, String subject, Date issuedAt, Date expiration) {
        super(token, subject, issuedAt, expiration);
    }

    public static AccessToken of(String token, String subject, Date issuedAt, Date expiration) {
        String bearerToken = JwtConstants.BEARER + token;
        return new AccessToken(bearerToken, subject, issuedAt, expiration);
    }
}
