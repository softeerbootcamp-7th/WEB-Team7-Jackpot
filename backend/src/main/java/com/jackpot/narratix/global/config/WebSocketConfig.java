package com.jackpot.narratix.global.config;

import com.jackpot.narratix.global.interceptor.StompChannelInterceptor;
import com.jackpot.narratix.global.websocket.GlobalStompErrorHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
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

    @Value("${cors.allowed-origins}")
    private String[] allowedOrigins;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/sub"); // 클라이언트가 구독할 경로 (서버 -> 클라이언트)
        // TODO: 추후 redis pub/sub 구조의 Message Broker를 사용해야 함
        config.setApplicationDestinationPrefixes("/pub"); // 클라이언트가 보낼 경로 (클라이언트 -> 서버)
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/connect")
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
}