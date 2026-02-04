package com.jackpot.narratix.domain.service;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.mindrot.jbcrypt.BCrypt;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class PasswordHashUtil {

    private static final int BCRYPT_SALT_ROUNDS = 11;

    public static String hashPassword(String password){
        return BCrypt.hashpw(password, BCrypt.gensalt(BCRYPT_SALT_ROUNDS));
    }

    public static boolean checkPassword(String plaintext, String hashed){
        return BCrypt.checkpw(plaintext, hashed);
    }
}
