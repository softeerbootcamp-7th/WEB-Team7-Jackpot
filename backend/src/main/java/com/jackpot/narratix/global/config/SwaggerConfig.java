package com.jackpot.narratix.global.config;

import com.jackpot.narratix.global.auth.jwt.JwtConstants;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Value("${springdoc.server.prod-url}")
    private String prodServerUrl;

    @Value("${springdoc.server.local-url}")
    private String localServerUrl;

    @Bean
    public OpenAPI openAPI() {
        Components components = new Components()
                .addSecuritySchemes(JwtConstants.JWT, new SecurityScheme()
                        .name(HttpHeaders.AUTHORIZATION)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat(JwtConstants.JWT)
                );

        return new OpenAPI()
                .components(components)
                .info(apiInfo());
    }

    private Info apiInfo() {
        return new Info()
                .title("Narratix API")
                .description("자기소개서 관리 시스템 API 문서")
                .version("1.0.0");
    }

    @Bean
    public OpenApiCustomizer serverUrlCustomizer() {
        return openApi -> openApi.servers(
                List.of(
                        new Server().url(prodServerUrl).description("Production Server"),
                        new Server().url(localServerUrl).description("Local Server")
                )
        );
    }
}