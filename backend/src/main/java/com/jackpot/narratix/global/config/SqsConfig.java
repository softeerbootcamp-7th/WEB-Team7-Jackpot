package com.jackpot.narratix.global.config;

import io.awspring.cloud.sqs.config.SqsMessageListenerContainerFactory;
import io.awspring.cloud.sqs.listener.acknowledgement.handler.AcknowledgementMode;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import software.amazon.awssdk.services.sqs.SqsAsyncClient;

import java.time.Duration;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
public class SqsConfig {

    private static final int CORE_POOL_SIZE = 3;
    private static final int MAX_POOL_SIZE = 3;
    private static final int QUEUE_CAPACITY = 0;


    @Bean(name = "aiLabellingTaskExecutor")
    public ThreadPoolTaskExecutor aiLabellingTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        executor.setCorePoolSize(CORE_POOL_SIZE);
        executor.setMaxPoolSize(MAX_POOL_SIZE);
        executor.setQueueCapacity(QUEUE_CAPACITY);
        executor.setThreadNamePrefix("ai-worker-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.AbortPolicy());
        executor.initialize();
        return executor;
    }

    @Bean
    public SqsMessageListenerContainerFactory<Object> sqsMessageListenerContainerFactory(
            SqsAsyncClient sqsAsyncClient
    ) {
        return SqsMessageListenerContainerFactory
                .builder()
                .sqsAsyncClient(sqsAsyncClient)
                .configure(options -> options
                        .maxConcurrentMessages(CORE_POOL_SIZE)
                        .maxMessagesPerPoll(MAX_POOL_SIZE)
                        .pollTimeout(Duration.ofSeconds(20))
                        .acknowledgementMode(AcknowledgementMode.ON_SUCCESS)
                )
                .build();
    }
}
