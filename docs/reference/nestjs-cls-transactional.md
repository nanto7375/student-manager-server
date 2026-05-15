# @nestjs-cls/transactional-adapter-prisma 내부 구현

## 개요

`@Transactional()` 데코레이터는 내부적으로 `AsyncLocalStorage`(CLS)를 사용하여 트랜잭션 클라이언트를 비동기 호출 체인 전체에 전파한다. 실제 트랜잭션 관리는 Prisma의 `$transaction`에 위임한다.

## 동작 흐름

```
@Transactional()
  → Proxy가 메소드 가로챔
    → TransactionHost.withTransaction()
      → cls.run() 으로 새 CLS 컨텍스트 생성
        → prisma.$transaction(async (tx) => { setClient(tx); fn(); })
          → 하위 서비스에서 txHost.tx 접근 시 CLS에서 tx 반환
```

## 1. @Transactional() 데코레이터

메소드를 Proxy로 감싸서 호출을 가로챈다:

```javascript
descriptor.value = new Proxy(original, {
  apply: function (_, outerThis, args) {
    const transactionHost = TransactionHost.getInstance();
    return transactionHost.withTransaction(propagation, options, original.bind(outerThis, ...args));
  },
});
```

## 2. TransactionHost.withTransaction()

전파 모드(기본: `Propagation.Required`)에 따라 분기:

- 이미 활성 트랜잭션이 있으면 → 그대로 재사용
- 없으면 → `runWithTransaction()` 호출

## 3. runWithTransaction()

CLS 컨텍스트 안에서 어댑터의 `wrapWithTransaction`을 호출:

```javascript
runWithTransaction(options, fn) {
  return this.cls.run({ ifNested: 'inherit' }, () =>
    this._options
      .wrapWithTransaction(options, fn, this.setTxInstance.bind(this))
      .finally(() => this.setTxInstance(undefined))
  );
}
```

## 4. Prisma 어댑터의 wrapWithTransaction()

핵심 부분. `prisma.$transaction`을 호출하고 tx 클라이언트를 CLS에 저장:

```javascript
wrapWithTransaction: async (options, fn, setClient) => {
  return await prisma.$transaction(async (p) => {
    setClient(p);  // tx 클라이언트를 CLS에 저장
    return fn();   // 비즈니스 로직 실행
  }, options);
}
```

## 5. TransactionHost.tx getter

하위 서비스에서 `txHost.tx`로 접근 시 CLS에서 트랜잭션 클라이언트를 꺼냄:

```javascript
get tx() {
  return this.cls.get(this.transactionInstanceSymbol)  // CLS에서 tx 꺼냄
    ?? this._options.getFallbackInstance();             // 없으면 일반 prisma client
}
```

## 롤백 메커니즘

`prisma.$transaction(async (p) => { ... })` 안에서 실행되므로:
- 정상 완료 → 자동 커밋
- 예외 발생 → 자동 롤백

별도 롤백 코드 없이 Prisma interactive transaction 동작 그대로.

## 전파 모드 (Propagation)

| 모드 | 동작 |
|------|------|
| Required (기본) | 기존 tx 있으면 재사용, 없으면 새로 생성 |
| RequiresNew | 항상 새 트랜잭션 생성 |
| NotSupported | 트랜잭션 없이 실행 |
| Mandatory | 기존 tx 없으면 에러 |
| Never | 기존 tx 있으면 에러 |
| Supports | 기존 tx 있으면 사용, 없으면 tx 없이 실행 |
| Nested | 기존 tx 있으면 savepoint 사용, 없으면 새로 생성 |

## 사용 예시

```typescript
// 트랜잭션을 시작하는 서비스
@Injectable()
export class CService {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    private readonly aService: AService,
    private readonly bService: BService,
  ) {}

  @Transactional()
  async cMethod() {
    await this.aService.aMethod(); // 같은 tx 공유
    await this.bService.bMethod(); // 같은 tx 공유
  }
}

// 하위 서비스 — tx 파라미터 전달 불필요
@Injectable()
export class AService {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async aMethod() {
    await this.txHost.tx.student.create({ ... });
  }
}
```
