package com.jackpot.narratix.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

@Configuration
@EnableScheduling
public class SchedulingConfig {

    private static final String TASK_THREAD_NAME_PREFIX = "scheduled-";
    private static final int TASK_THREAD_POOL_SIZE = 2;

    @Bean
    public ThreadPoolTaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(TASK_THREAD_POOL_SIZE);
        scheduler.setThreadNamePrefix(TASK_THREAD_NAME_PREFIX);
        return scheduler;
    }

}
