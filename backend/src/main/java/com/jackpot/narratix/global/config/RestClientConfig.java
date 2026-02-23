package com.jackpot.narratix.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient geminiRestClient(
            @Value("${gemini.base-url}") String baseUrl,
            @Value("${gemini.connect-timeout-ms}") long connectTimeoutMs,
            @Value("${gemini.read-timeout-ms}") long readTimeoutMs
    ) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();

        factory.setConnectTimeout(Duration.ofSeconds(connectTimeoutMs));
        factory.setReadTimeout(Duration.ofSeconds(readTimeoutMs));

        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }
}
