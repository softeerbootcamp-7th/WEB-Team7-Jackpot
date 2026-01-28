package com.jackpot.narratix.global.auth.jwt.domain;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Date;

@Getter
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class Token {
    private final String token;
    private final String subject;
    private final Date issuedAt;
    private final Date expiration;

    public boolean isExpired() {
        return expiration.before(new Date());
    }

    public static Token of(String token, String subject, Date issuedAt, Date expiration) {
        return new Token(token, subject, issuedAt, expiration);
    }
}
