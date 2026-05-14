# 카페24 VPC 서버 세팅 가이드

## 목차
1. [방화벽 설정](#1-방화벽-설정)
2. [SSH 접속 및 보안 설정](#2-ssh-접속-및-보안-설정)
3. [서버 환경 구축](#3-서버-환경-구축)
4. [MySQL 설정](#4-mysql-설정)
5. [Nginx 설정](#5-nginx-설정)
6. [PM2 설정](#6-pm2-설정)
7. [CI/CD 설정 (GitHub Actions)](#7-cicd-설정-github-actions)
8. [DB 클라이언트 접속 (DBeaver)](#8-db-클라이언트-접속-dbeaver)

---

## 1. 방화벽 설정

카페24 VPC 콘솔에서 방화벽 규칙을 설정한다.

### 인바운드 (외부 → 서버)

| 포트 | 프로토콜 | 소스 | 용도 |
|------|----------|------|------|
| {포트} | TCP | 0.0.0.0/0 | SSH (기본 22에서 변경) |
| 80 | TCP | 0.0.0.0/0 | HTTP |
| 443 | TCP | 0.0.0.0/0 | HTTPS |

- MySQL(3306) 포트는 **열지 않는다**. 같은 서버 내에서 localhost로 접근하므로 외부 노출 불필요.
- SSH 포트를 기본 22가 아닌 {포트}로 사용하여 자동 스캔 봇을 회피한다.

### 아웃바운드 (서버 → 외부)

| 포트 | 프로토콜 | 목적지 | 용도 |
|------|----------|--------|------|
| 1-65535 | TCP | 0.0.0.0/0 | 모든 외부 통신 허용 |

- 아웃바운드를 열어야 apt 패키지 설치, git clone 등이 가능하다.
- TCP/UDP 포트 번호는 16비트(2^16 - 1 = 65535)로 정의되어 있어 최대 65535까지 존재한다.

---

## 2. SSH 접속 및 보안 설정

### 최초 접속

```bash
ssh root@서버IP주소
```
- 카페24 VPC 생성 시 설정한 root 비밀번호로 접속한다.

### SSH 포트 변경

기본 22번 포트를 {포트}로 변경하여 보안을 강화한다.

```bash
vi /etc/ssh/sshd_config
```

파일에서 `Port 22`를 찾아 수정:
```
Port {포트}
```

SSH 데몬 재시작:
```bash
systemctl restart sshd
# systemctl: 시스템 서비스를 관리하는 명령어
# restart sshd: SSH 데몬을 재시작하여 변경된 설정을 적용
```

> ⚠️ **중요**: 현재 SSH 세션을 유지한 채로 새 터미널에서 변경된 포트로 접속 확인 후 기존 세션을 종료할 것. 확인 없이 끊으면 접속 방법이 없어질 수 있다.

```bash
ssh -p {포트} root@서버IP주소
# -p {포트}: 접속할 포트를 지정
```

접속 확인 후 카페24 방화벽에서 22번 포트를 제거한다.

### SSH 키 인증 설정

비밀번호 대신 공개키 방식으로 인증하면 보안이 강화된다.

**로컬에서 키 생성 (이미 있으면 스킵):**
```bash
ls ~/.ssh/id_*          # 기존 키 확인
ssh-keygen -t ed25519   # 없으면 새로 생성
# -t ed25519: 키 알고리즘 지정 (ed25519는 현재 가장 권장되는 알고리즘)
```

**공개키를 서버에 복사:**
```bash
ssh-copy-id -p {포트} root@서버IP주소
# 로컬의 공개키(~/.ssh/id_ed25519.pub)를 서버의 ~/.ssh/authorized_keys에 등록
# 이후 비밀번호 없이 키로 접속 가능
```

### SSH config 설정 (편의)

매번 IP와 포트를 입력하지 않도록 로컬에 설정:

```bash
vi ~/.ssh/config
```

```
Host leo_server
    HostName 서버IP주소
    User root
    Port {포트}
```

이후 `ssh leo_server`만으로 접속 가능.

---

## 3. 서버 환경 구축

### 시스템 업데이트

```bash
apt update && apt upgrade -y
# apt update: 패키지 목록을 최신으로 갱신
# apt upgrade -y: 설치된 패키지를 최신 버전으로 업그레이드 (-y: 자동 승인)
```

### 필수 패키지 설치

```bash
apt install -y curl git
# curl: URL로 데이터를 전송하는 도구 (Node.js 설치 스크립트 다운로드에 필요)
# git: 소스 코드 버전 관리 도구
```

### Node.js 설치 (nvm 방식)

nvm(Node Version Manager)을 사용하면 Node.js 버전을 쉽게 관리할 수 있다.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# nvm 설치 스크립트를 다운로드하여 실행

source ~/.bashrc
# 현재 쉘에 nvm 환경변수를 로드 (새 터미널을 열면 자동 적용됨)

nvm install 20
# Node.js 20 LTS 버전 설치
```

확인:
```bash
node -v   # Node.js 버전 확인
npm -v    # npm 버전 확인
```

### MySQL 설치

```bash
apt install -y mysql-server
# MySQL 데이터베이스 서버 설치
```

### Nginx 설치

```bash
apt install -y nginx
# Nginx 웹 서버 설치 (리버스 프록시 + 정적 파일 서빙용)
```

### Redis 설치

```bash
apt install -y redis-server
# Redis 인메모리 데이터 저장소 설치 (캐시, 세션 관리용)
```

실행 확인:
```bash
systemctl status redis
# active (running)이면 정상
```

### PM2 설치

```bash
npm install -g pm2
# PM2: Node.js 프로세스 매니저 (서버 크래시 시 자동 재시작, 로그 관리 등)
# -g: 글로벌 설치 (어디서든 pm2 명령어 사용 가능)
```

---

## 4. MySQL 설정

### 초기 보안 설정

```bash
mysql_secure_installation
```

질문에 대한 권장 답변:
1. VALIDATE PASSWORD component → `n`
2. root 비밀번호 설정 → 복잡한 비밀번호 입력
3. Remove anonymous users → `y`
4. Disallow root login remotely → `y`
5. Remove test database → `y`
6. Reload privilege tables → `y`

### root 비밀번호 설정/변경

```bash
mysql    # MySQL 접속 (초기에는 비밀번호 없이 접속 가능)
```

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '비밀번호';
-- root 유저의 비밀번호를 설정
-- mysql_native_password: 인증 방식 지정

FLUSH PRIVILEGES;
-- 권한 테이블을 즉시 반영

EXIT;
```

비밀번호 생성 팁:
```bash
openssl rand -base64 24
# 랜덤한 24바이트 문자열 생성 (비밀번호로 사용)
```

### 데이터베이스 및 유저 생성

```bash
mysql -u root -p
# -u root: root 유저로 접속
# -p: 비밀번호 입력 프롬프트 표시
```

```sql
CREATE DATABASE leo_library;
-- 애플리케이션용 데이터베이스 생성

CREATE USER 'leo_server'@'localhost' IDENTIFIED BY '비밀번호';
-- 애플리케이션 전용 유저 생성
-- 'leo_server'@'localhost': localhost에서만 접속 가능한 유저

GRANT ALL PRIVILEGES ON leo_library.* TO 'leo_server'@'localhost';
-- leo_server 유저에게 leo_library DB에 대한 모든 권한 부여
-- leo_library.* : 해당 DB의 모든 테이블에 대해
-- 다른 DB나 시스템 설정은 접근 불가

FLUSH PRIVILEGES;
EXIT;
```

> root는 DB 관리용, student는 애플리케이션용으로 분리하여 사용한다.

### DB 덤프 리스토어 (SSH 터널링)

로컬에 있는 덤프 파일을 서버 DB에 넣을 때, SSH 터널을 사용하면 방화벽에 3306을 열지 않아도 된다.

**터미널 1 — SSH 터널 생성:**
```bash
ssh -p {포트} -L 13306:localhost:3306 root@서버IP주소
# -L 13306:localhost:3306: 로컬의 13306 포트를 서버의 localhost:3306으로 연결
# 로컬 13306 → [SSH 암호화 터널] → 서버 내부 MySQL(3306)
# 13306을 사용하는 이유: 로컬에도 MySQL이 3306에서 돌고 있을 수 있어 충돌 방지
```

**터미널 2 — 리스토어 실행:**
```bash
mysql -u root -p --host=127.0.0.1 --port=13306 leo_library < "/경로/덤프파일.sql"
# --host=127.0.0.1 --port=13306: 로컬 13306에 접속 → 터널을 통해 서버 MySQL로 전달
# < 덤프파일.sql: SQL 파일의 내용을 서버 MySQL로 전송
# 파일 경로에 공백이나 특수문자가 있으면 따옴표로 감싸야 함
```

---

## 5. Nginx 설정

Nginx는 도메인별로 요청을 분기한다:
- `admin.example.com` → React 정적 파일 서빙
- `api.example.com` → NestJS API 서버로 전달
- `example.com` → 접속 차단

### 설정 파일 생성

```bash
vi /etc/nginx/sites-available/leo-server
```

```nginx
# 루트 도메인 → 접속 차단
server {
    listen 80;
    server_name example.com;
    return 444;
    # 444: Nginx 전용 코드. 응답 없이 연결을 즉시 끊음
}

# 클라이언트 (React SPA)
server {
    listen 80;
    server_name admin.example.com;

    location / {
        root /var/www/leo-client;
        index index.html;
        try_files $uri $uri/ /index.html;
        # try_files: 요청된 파일이 없으면 index.html을 반환
        # SPA는 클라이언트에서 라우팅하므로 모든 경로에서 index.html을 반환해야 함
    }
}

# API 서버 리버스 프록시
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://localhost:3000;
        # 요청을 그대로 NestJS 서버로 전달 (prefix 제거 불필요)
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        # proxy_set_header: 원본 요청 정보를 백엔드 서버에 전달
    }
}
```

### 설정 활성화

```bash
ln -s /etc/nginx/sites-available/leo-server /etc/nginx/sites-enabled/
# 심볼릭 링크 생성으로 설정 활성화

rm /etc/nginx/sites-enabled/default
# 기본 설정 제거

nginx -t
# 설정 문법 검사 (OK가 나와야 함)

systemctl restart nginx
# Nginx 재시작하여 설정 적용
```

---

## 6. PM2 설정

PM2는 Node.js 애플리케이션을 백그라운드에서 실행하고, 크래시 시 자동 재시작해주는 프로세스 매니저다.

### 애플리케이션 실행

```bash
cd /var/www/leo-server
pm2 start dist/main.js --name leo-server
# dist/main.js: NestJS 빌드 결과물의 진입점
# --name leo-api: 프로세스에 이름 부여 (관리 편의)
```

### 서버 재부팅 시 자동 시작

```bash
pm2 startup
# 시스템 부팅 시 PM2가 자동 실행되도록 설정
# 출력되는 명령어를 복사하여 실행해야 할 수 있음

pm2 save
# 현재 실행 중인 프로세스 목록을 저장 (재부팅 후 자동 복원)
```

### 주요 명령어

```bash
pm2 status              # 실행 중인 프로세스 상태 확인
pm2 logs                # 로그 실시간 확인
pm2 logs leo-api        # 특정 프로세스 로그만 확인
pm2 restart leo-api     # 재시작
pm2 stop leo-api        # 중지
pm2 delete leo-api      # 프로세스 제거
```

---

## 7. CI/CD 설정 (GitHub Actions)

### 사전 준비: 배포용 SSH 키

GitHub Actions에서 서버에 접속하려면 passphrase 없는 SSH 키가 필요하다.

**로컬에서 키 생성:**
```bash
ssh-keygen -t ed25519 -f ~/.ssh/deploy_key -N "" -C "github-actions"
# -f ~/.ssh/deploy_key: 파일명 지정
# -N "": passphrase 없음 (CI에서 자동 사용하려면 필수)
# -C "github-actions": 키 설명 (식별용)
```

**공개키를 서버에 등록:**
```bash
ssh-copy-id -i ~/.ssh/deploy_key.pub -p {포트} root@서버IP주소
```

**개인키를 GitHub Secrets에 등록:**
```bash
cat ~/.ssh/deploy_key
# 출력된 내용 전체를 복사 (-----BEGIN ~ -----END 포함)
```

### GitHub Secrets 등록

리포지토리 Settings → Secrets and variables → Actions에 추가:

| Secret 이름 | 값 |
|---|---|
| SSH_HOST | 서버 IP |
| SSH_USER |  |
| SSH_PORT |  |
| SSH_PRIVATE_KEY | 배포용 개인키 전체 내용 |
| VITE_API_URL | http://본인도메인 (클라이언트 리포만) |

### 클라이언트 배포 Workflow

`.github/workflows/deploy.yml`:

```yaml
name: Deploy Client

on:
  push:
    branches: [prod]  # prod 브랜치에 push(머지)될 때 실행

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm install
      - run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          # Vite는 빌드 시점에 환경변수를 코드에 삽입함

      - name: Deploy to server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.SSH_PORT }}
          source: "build/client/*"
          target: "/var/www/leo-client"
          strip_components: 2
          # strip_components: 2 → build/client/ 경로를 제거하고 내용물만 전송
```

### API 서버 배포 Workflow

`.github/workflows/deploy.yml`:

```yaml
name: Deploy API Server

on:
  push:
    branches: [prod]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: yarn install --frozen-lockfile
        # --frozen-lockfile: lockfile과 정확히 일치하는 버전만 설치 (CI 안정성)
      - run: yarn build

      - name: Copy files to server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.SSH_PORT }}
          source: "dist/*,node_modules/*,package.json,prisma/*"
          target: "/var/www/leo-server"
          # CI에서 빌드한 결과물만 서버에 전송
          # 서버에서 install/build를 하지 않으므로 메모리 부담 없음

      - name: Restart server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.SSH_PORT }}
          script: |
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
            # nvm 환경을 로드 (non-interactive 쉘에서는 자동 로드되지 않음)
            # [ -s 파일 ]: 파일이 존재하고 크기가 0이 아닌지 확인
            # && . 파일: 조건이 참이면 해당 파일을 현재 쉘에 로드 (source와 동일)
            cd /var/www/leo-server
            pm2 restart leo-api || pm2 start dist/main.js --name leo-api
            # restart 실패 시(첫 배포) start로 실행
```

---

## 8. DB 클라이언트 접속 (DBeaver)

방화벽에 3306을 열지 않고 SSH 터널을 통해 안전하게 접속한다.

### DBeaver 연결 설정

**SSH 탭:**
- Use SSH Tunnel: 체크
- Host: 서버 IP
- Port: 
- Username: 
- Authentication Method: Public Key
- Private Key:

**Main 탭:**
- Host: localhost
- Port: 3306
- Database: leo_library
- Username: db user name
- Password: db user password

---

## 서버 디렉토리 구조

```
/var/www/
├── leo-server/          ← API 서버 (NestJS 빌드 결과물)
│   ├── dist/            ← 컴파일된 JS
│   ├── node_modules/    ← 의존성
│   ├── prisma/          ← Prisma 스키마
│   ├── package.json
│   └── .env             ← 환경변수 (수동 관리, Git에 포함하지 않음)
└── leo-client/          ← 클라이언트 (React 빌드 결과물)
    ├── index.html
    └── assets/          ← JS, CSS, 이미지
```

---

## .env 파일 (API 서버)

서버의 `/var/www/leo-server/.env`에 수동으로 생성:

```env
SM_ENV=production
SM_PORT=3000
SM_SERVER_VERSION=1

SM_MYSQL_DB=leo_library
SM_MYSQL_DB_USER=leo_server
SM_MYSQL_DB_PASSWORD=
SM_MYSQL_DB_HOST=
SM_MYSQL_DB_PORT=
SM_DB_SYNC="false"    # production에서는 자동 스키마 변경 비활성화

SM_BYCRYPT_SALT=10

SM_JWT_SECRET=랜덤문자열    # openssl rand -hex 32 로 생성
SM_JWT_REFRESH_SECRET=랜덤문자열

SM_JWT_ACCESS_LIFETIME=
SM_JWT_REFRESH_LIFETIME=
SM_JWT_REFRESH_TOKEN_RENEWAL_PERIOD=

SM_REDIS_HOST=
SM_REDIS_PORT=
SM_SIGNIN_FAILED_ATTEMPTS_CLEAR_TTL=
```

---

## 유용한 명령어 모음

```bash
# 시스템
free -h                      # 메모리 사용량 확인
systemctl status mysql       # MySQL 상태 확인
systemctl status nginx       # Nginx 상태 확인
systemctl status redis       # Redis 상태 확인

# Nginx
nginx -t                     # 설정 문법 검사
systemctl restart nginx      # 재시작

# PM2
pm2 status                   # 프로세스 상태
pm2 logs                     # 로그 확인
pm2 restart leo-api          # 재시작

# apt 패키지
apt list --installed         # 설치된 패키지 목록
apt update                   # 패키지 목록 갱신
```

---

## 9. 도메인 설정

### 도메인 구매 후 DNS 설정

도메인 관리 페이지에서 레코드 추가:

**A 레코드 (루트 도메인):**
- 호스트: `@` (또는 빈칸)
- 값: 서버 IP

**CNAME 레코드 (서브도메인):**
- 호스트: `admin`
- 값: 루트 도메인 (예: `example.com`)

- 호스트: `api`
- 값: 루트 도메인 (예: `example.com`)

CNAME은 IP를 찾기 위한 별칭이다. `admin.example.com`으로 요청하면 DNS가 `example.com`의 IP를 찾아서 연결해주지만, 실제 HTTP 요청의 Host 헤더는 `admin.example.com`으로 유지된다.

### DNS 전파 확인

```bash
nslookup admin.example.com
nslookup api.example.com
# 서버 IP가 나오면 전파 완료 (수 분~수 시간 소요)
```

Nginx의 `server_name`은 HTTP 요청의 `Host` 헤더를 확인하여 어떤 server 블록으로 라우팅할지 결정한다. 같은 IP에 여러 도메인을 연결해도 도메인별로 다르게 처리할 수 있는 이유가 이것이다.

---

## 10. HTTPS (SSL) 설정

### Let's Encrypt + certbot

Let's Encrypt는 무료 SSL 인증서를 제공한다. certbot이 발급/갱신/Nginx 설정을 자동으로 처리해준다.

**전제 조건:**
- 본인 소유 도메인이 있어야 함 (카페24 기본 도메인으로는 발급 불가)
- DNS가 서버 IP로 전파 완료되어 있어야 함

### 설치 및 인증서 발급

```bash
apt install -y certbot python3-certbot-nginx
# certbot: Let's Encrypt 인증서 발급/관리 도구
# python3-certbot-nginx: Nginx 설정을 자동으로 수정해주는 플러그인

certbot --nginx -d admin.example.com
certbot --nginx -d api.example.com
# -d: 인증서를 발급할 도메인 지정
# --nginx: Nginx 설정에 HTTPS를 자동 적용
# 이메일 입력 + 약관 동의 필요
# 서브도메인별로 각각 발급해야 함
```

certbot이 자동으로 처리하는 것:
- SSL 인증서 발급
- Nginx에 443(HTTPS) 리스닝 추가
- HTTP → HTTPS 리다이렉트 설정

### 인증서 자동 갱신

Let's Encrypt 인증서는 90일마다 만료된다. certbot이 하루 2번 갱신 시도하며, 만료 30일 전부터 실제 갱신이 실행된다. 횟수 제한 없이 무한 연장 가능.

**자동 갱신 테스트:**
```bash
certbot renew --dry-run
# 에러 없으면 자동 갱신 정상 동작
```

**자동 갱신 비활성화 (권장하지 않음):**
```bash
systemctl disable certbot.timer
systemctl stop certbot.timer
```

**다시 활성화:**
```bash
systemctl enable certbot.timer
systemctl start certbot.timer
```

### HTTPS 적용 후 할 일

1. GitHub Secrets에서 `VITE_API_URL`을 `https://api.example.com`으로 변경
2. 클라이언트 재배포 (API 요청이 HTTPS로 나가도록)
