package com.jackpot.narratix.global.config;

import com.jackpot.narratix.global.interceptor.StompChannelInterceptor;
import com.jackpot.narratix.global.websocket.GlobalStompErrorHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final StompChannelInterceptor stompChannelInterceptor;
    private final GlobalStompErrorHandler globalStompErrorHandler;

    private static final String SUBSCRIBE_PREFIX = "/sub";
    private static final String PUBLISH_PREFIX = "/pub";
    private static final String CONNECT_ENDPOINT = "/ws/connect";

    private static final long OUTGOING_INTERVAL_HEARTBEAT_TIME = 4 * 1000L; // 4초 / 서버가 클라이언트에게 보내는 heart beat 간격
    private static final long INGOING_INTERVAL_HEARTBEAT_TIME = 4 * 1000L; // 4초 / 클라이언트가 서버에게 보내는 heart beat 간격

    @Value("${cors.allowed-origins}")
    private String[] allowedOrigins;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker(SUBSCRIBE_PREFIX)
                .setHeartbeatValue(new long[]{OUTGOING_INTERVAL_HEARTBEAT_TIME, INGOING_INTERVAL_HEARTBEAT_TIME})
                .setTaskScheduler(heartbeatTaskScheduler());
        config.setApplicationDestinationPrefixes(PUBLISH_PREFIX); // 클라이언트가 보낼 경로 (클라이언트 -> 서버)
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint(CONNECT_ENDPOINT)
//                .setAllowedOrigins(allowedOrigins)
                .setAllowedOriginPatterns("*") // TODO: 배포 전 테스트를 위해 모든 Origin 허용
                .withSockJS();  // SockJS fallback 옵션 활성화 (웹소켓을 지원하지 않는 브라우저에 대한 대체 솔루션 제공)

        registry.setErrorHandler(globalStompErrorHandler);
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(stompChannelInterceptor);
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(128 * 1024); // 128KB
        registration.setSendTimeLimit(20 * 1000); // 20초
        registration.setSendBufferSizeLimit(512 * 1024); // 512KB
    }

    @Bean
    public ThreadPoolTaskScheduler heartbeatTaskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("ws-heartbeat-");
        scheduler.initialize();
        return scheduler;
    }
}