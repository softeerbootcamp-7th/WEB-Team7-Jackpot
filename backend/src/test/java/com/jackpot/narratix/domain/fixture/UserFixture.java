package com.jackpot.narratix.domain.fixture;

import com.jackpot.narratix.domain.entity.User;

import static com.jackpot.narratix.domain.fixture.BaseTimeEntityFixture.setAuditFields;

public class UserFixture {

    public static UserFixtureBuilder builder() {
        return new UserFixtureBuilder();
    }

    public static class UserFixtureBuilder {
        private String id = "testUser123";
        private String nickname = "테스트유저";

        public UserFixtureBuilder id(String id) {
            this.id = id;
            return this;
        }

        public UserFixtureBuilder nickname(String nickname) {
            this.nickname = nickname;
            return this;
        }

        public User build() {
            User user = User.builder()
                    .id(id)
                    .nickname(nickname)
                    .build();

            setAuditFields(user);

            return user;
        }
    }
}