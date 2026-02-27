<h1>CI/CD 인프라 구축 및 무중단 배포(Blue-Green) 전략</h1>
<p><strong>Narratix의</strong> 자동화된 빌드, 테스트 및 무중단 배포 환경 구축 과정을 기록합니다.</p>
<h2>1. 개요 및 기본 개념</h2>
<ul>
<li><strong>CI (Continuous Integration):</strong> 코드 변경 사항이 공유 저장소에 병합될 때마다 자동 빌드 및 테스트를 수행하여 초기 결함을 발견합니다.</li>
<li><strong>CD (Continuous Deployment):</strong> 검증된 코드를 운영 서버에 자동으로 배포하여 사용자에게 신속하게 기능을 전달합니다.</li>
<li><strong>무중단 배포:</strong> 새로운 버전을 배포할 때 서버 다운타임(Downtime)을 제거하여 서비스 가용성을 극대화합니다.</li>
</ul>
<hr>
<h2>2. 시스템 아키텍처 (Architecture)</h2>
<h3>2.1. 인프라 구성</h3>
<ul>
<li><strong>Cloud:</strong> AWS EC2 (Ubuntu 24.04 LTS)</li>
<li><strong>Web Server:</strong> Nginx (Reverse Proxy &amp; Port Switching)</li>
<li><strong>Container:</strong> Docker, Docker Hub</li>
<li><strong>Automation:</strong> GitHub Actions, AWS CodeDeploy, AWS S3</li>
<li><strong>Network:</strong> Route53 + Gabia Domain, AWS Elastic IP (EIP)</li>
</ul>
<h3>2.2. 배포 Flow</h3>
<ol>
<li><strong>Code Push:</strong> 개발자가 <code>main</code> 브랜치에 PR/Push.</li>
<li><strong>CI (GitHub Actions):</strong> JDK 설정 → <code>application.yml</code> 생성(Secrets) → 빌드 → Docker 이미지 생성 및 Hub Push.</li>
<li><strong>CD (CodeDeploy):</strong> GitHub Actions가 CodeDeploy 호출</li>
<li><strong>Deployment (EC2):</strong> <code>deploy.sh</code> 실행 → 새로운 포트(Blue or Green)에 컨테이너 구동 → Health Check → Nginx 포트 스위칭 → 기존 컨테이너 종료.</li>
</ol>
<hr>
<h2>3. 무중단 배포 전략: Blue-Green</h2>
<h3>3.1. 무중단 배포 전략들</h3>
<ul>
<li><strong>롤링 배포 (Rolling Update)</strong>
사용 중인 서버를 한 대씩 차례대로 새로운 버전으로 교체하는 방식입니다. 별도의 추가 서버 자원을 확보하지 않고도 배포를 진행할 수 있다는 경제적 장점이 있습니다. 하지만 배포가 진행되는 동안 특정 서버가 내려가 있는 상태이므로 남은 서버들에 트래픽 부하가 가중될 수 있으며, 구버전과 신버전이 공존하는 시간이 길어 두 버전 간의 호환성 유지가 매우 중요합니다.</li>
<li><strong>카나리 배포 (Canary Deployment)</strong>
광산의 카나리아처럼 위험을 사전에 감지하기 위해, 전체 유저 중 아주 적은 비율(예: 5%)에게만 먼저 신버전을 노출하는 방식입니다. 실제 운영 환경에서 신버전의 안정성을 테스트할 수 있고 문제가 발생하면 즉시 롤백이 가능하다는 강력한 장점이 있습니다. 그러나 배포 로직이 복잡하고, 유저별로 다른 버전을 보여줘야 하므로 트래픽 제어 비용이 다른 방식에 비해 높게 발생합니다.</li>
<li><strong>블루-그린 배포 (Blue-Green Deployment)</strong>
현재 운영 중인 환경(Blue)과 동일한 사양의 새로운 환경(Green)을 완전히 따로 구축한 뒤, 트래픽을 한 번에 전환하는 방식입니다. 배포가 완료된 후 스위치만 돌리면 전환이 끝나므로 배포 속도가 매우 빠르고, 전환 직후 문제가 생기면 이전 포트로 다시 돌리기만 하면 되어 롤백이 매우 안정적입니다. 다만, 일시적으로 두 배의 자원을 사용해야 한다는 점이 특징입니다.</li>
</ul>

  | Rolling Update | Canary Deployment | Blue-Green
-- | -- | -- | --
방식 | 서버를 한 대씩 순차적으로 교체 | 일부 유저에게만 선배포 후 확대 | Blue 버전과 Green 버전 전체 교체
장점 | 추가 서버 자원이 거의 필요 없음 | 위험 최소화, 실사용자 피드백 가능 | 배포 속도가 빠르고 롤백이 매우 간편함
단점 | 배포 중 서버 부하 발생 가능성 | 관리 비용 및 설정 복잡도 높음 | 일시적으로 서버 자원이 2배 필요함
중단 시간 | 짧은 다운타임 발생 가능 | 없음 | 거의 없음 (Zero-downtime)

<h3>3.2. 선택 이유</h3>
<p>첫째, 효율적인 방법이라고 생각합니다.
카나리 배포는 대규모 트래픽이 발생하는 서비스에서 리스크를 분산하기 위해 적합한 방식입니다. 하지만 우리 서비스는 현재 개발 초기 단계이며 유저 유입이 폭발적인 대규모 서비스가 아닙니다. 따라서 설정이 복잡하고 비용이 많이 드는 카나리 방식보다는, 빠르고 안정적인 전환이 가능한 블루-그린 방식이 더 효율적이라고 판단했습니다.</p>
<p>둘째, 단일 인스턴스 환경에서의 무중단 구현입니다.
현재 운영 중인 단일 EC2 인스턴스 환경에서 롤링 배포를 수행할 경우, 서버를 내리고 다시 띄우는 과정에서 필연적으로 서비스 중단이 발생합니다. 반면 블루-그린 방식은 단일 인스턴스 내에서 포트(8080, 8081)를 분리하여 신버전을 미리 띄워둘 수 있습니다. 이후 Nginx의 리로드(Reload) 기능을 통해 프록시 대상 포트만 변경하면 사용자 입장에서는 끊김 없는 서비스 이용이 가능해집니다.</p>
<p>셋째, 롤백의 용이성과 환경의 일관성입니다.
배포 직후 Health Check 단계에서 오류가 감지되면, Nginx 설정을 변경하지 않고 기존 컨테이너를 유지하기만 하면 됩니다. 이는 배포 실패 시 서비스에 미치는 영향을 제로에 가깝게 유지하며, 구버전과 신버전이 섞이지 않은 순수한 환경으로의 즉각적인 복귀를 보장합니다.</p>
<h3>3.3. 배포 상세 프로세스 (<code>deploy.sh</code>)</h3>
<ol>
<li><strong>포트 확인:</strong> 현재 8080(Blue)이 구동 중인지, 8081(Green)이 구동 중인지 확인 후 타겟 포트 결정.</li>
<li><strong>이미지 Pull:</strong> Docker Hub로부터 최신 빌드 이미지를 다운로드.</li>
<li><strong>컨테이너 실행:</strong> 결정된 타겟 포트(Idle Port)로 새 컨테이너 실행.</li>
<li><strong>Health Check:</strong> <code>/actuator/health</code> 엔드포인트를 통해 애플리케이션이 정상적으로 구동되었는지 검증(최대 10회 재시도).</li>
<li><strong>Nginx 스위칭:</strong> <code>service-url.inc</code> 파일을 수정하여 프록시 대상을 새 포트로 변경 후 <code>nginx -s reload</code>.</li>
<li><strong>정리:</strong> 배포가 성공하면 이전 버전 컨테이너를 중지 및 삭제.</li>
</ol>
<hr>
<h2>4. 핵심 기술 및 설정 정보</h2>
<h3>4-1. Nginx 리버스 프록시 (Reverse Proxy)</h3>
<ul>
<li><strong>보안:</strong> 실제 WAS(Spring Boot) 포트를 외부에 노출하지 않음.</li>
<li><strong>SSL 종료:</strong> HTTPS 설정을 Nginx 단에서 통합 관리.</li>
<li><strong>성능:</strong> 정적 리소스 캐싱 및 처리 효율 향상.</li>
</ul>
<h3>4-2. 주요 설정 파일</h3>
<h3>Dockerfile</h3>
<p>Dockerfile</p>
<pre><code class="language-sql">FROM openjdk:17-jdk-slim
ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT [&quot;java&quot;, &quot;-jar&quot;, &quot;/app.jar&quot;]
</code></pre>
<h3>GitHub Actions (deploy.yml) 주요 Step</h3>
<ul>
<li><strong>환경변수 동적 생성:</strong> GitHub Secrets를 활용하여 빌드 시점에 <code>application.yml</code> 주입.</li>
<li><strong>Dockerize:</strong> 로컬 환경에 의존하지 않는 일관된 이미지 빌드.</li>
<li><strong>AWS Credentials:</strong> IAM User를 통한 안전한 AWS 접근 권한 제어.</li>
</ul>
<hr>
<h2>5. 인프라 구축 체크리스트 (Step-by-Step)</h2>

단계 | 주요 작업 내용
-- | --
1. AWS 인프라 | EC2 생성, 보안그룹(22, 80, 443, 8080) 설정
2. 권한 설정 | S3, CodeDeploy 권한을 가진 IAM Role 생성 및 EC2 연결
3. 서버 초기화 | Docker, Docker Compose, Nginx, CodeDeploy Agent 설치
4. 도메인 | 가비아 도메인 A 레코드 설정을 통해 EC2 IP와 연결
5. CI/CD 연동 | GitHub Secrets 등록 및 deploy.yml, appspec.yml 작성
6. 검증 | deploy.sh 실행 시 포트 전환 및 무중단 접속 여부 테스트


<hr>

<h2>6. 향후 과제</h2>
<ul>
<li><strong>로그 관리:</strong> Docker 로그가 유실되지 않도록 외부 로그 저장소(AWS CloudWatch 등) 연동 검토.</li>
<li><strong>Monitoring:</strong> 배포 후 CPU/Memory 리소스 사용량 모니터링 대시보드 구축.</li>
<li><strong>자동 롤백:</strong> Health Check 실패 시 GitHub Actions workflow에서 실패 알림 및 자동 대응 로직 고도화.</li>
</ul>
<!-- notionvc: 398ab95d-6938-45fd-8e9a-0dc0536b2657 -->

참고 :

https://www.redhat.com/ko/topics/devops/what-is-ci-cd

https://velog.io/@hooni_/Blue-Green-%EB%AC%B4%EC%A4%91%EB%8B%A8-%EB%B0%B0%ED%8F%AC