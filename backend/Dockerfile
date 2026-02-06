FROM amazoncorretto:17-alpine

WORKDIR /app
COPY ./build/libs/narratix-0.0.1.jar /app/app.jar

ENV TZ=Asia/Seoul
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080

ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-jar", \
    "app.jar"]