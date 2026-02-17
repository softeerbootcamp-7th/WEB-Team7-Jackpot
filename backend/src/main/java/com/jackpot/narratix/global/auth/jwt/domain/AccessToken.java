package com.jackpot.narratix.global.auth.jwt.domain;

import java.util.Date;

public class AccessToken extends Token{

    public AccessToken(String token, String subject, Date issuedAt, Date expiration) {
        super(token, subject, issuedAt, expiration);
    }

    public static AccessToken of(String token, String subject, Date issuedAt, Date expiration) {
        return new AccessToken(token, subject, issuedAt, expiration);
    }
}
