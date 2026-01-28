package com.jackpot.narratix.global.auth.jwt.domain;

import java.util.Date;

public class RefreshToken extends Token{

    public RefreshToken(String token, String subject, Date issuedAt, Date expiration) {
        super(token, subject, issuedAt, expiration);
    }

    public static RefreshToken of(String token, String subject, Date issuedAt, Date expiration) {
        return new RefreshToken(token, subject, issuedAt, expiration);
    }
}
