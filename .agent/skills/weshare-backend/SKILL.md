---
name: weshare-backend
description: >-
  Expert guide and runbook for developing, refactoring, and verifying the WeShare backend.
  Use whenever creating or modifying NestJS modules, TypeORM entities, database migrations,
  RabbitMQ event producers/consumers, Redis caching/adapter, Supabase storage presigned uploads,
  or Socket.io real-time gateways.
---

# WeShare Backend Engineering Skill

This skill enforces high-standard engineering patterns for the **WeShare Modular Monolith Backend** built with **NestJS**, **TypeORM**, **PostgreSQL 16**, **Redis 7**, **RabbitMQ 3**, and **Supabase Storage**.

---

## 1. Core Architectural Principles

1. **Modular Monolith Bounded Contexts**:
   - Every domain feature lives inside `src/modules/<feature_name>/` (e.g., `auth`, `users`, `posts`, `interactions`, `chat`, `admin`).
   - Cross-module communication must happen via exported services or asynchronous **RabbitMQ events**, never via circular dependencies.
2. **Process Segregation (`main.ts` vs `worker.ts`)**:
   - `src/main.ts`: Launches HTTP REST API, Swagger documentation, and Socket.io WebSocket Gateway. Scales horizontally behind Nginx.
   - `src/worker.ts`: Launches standalone Nest application context without HTTP server (`NestFactory.createApplicationContext`). Executes RabbitMQ consumers and `@nestjs/schedule` cron purge jobs. Runs as a singleton container.
3. **Strict TypeORM Data Mapper Pattern**:
   - Entities must use `SnakeNamingStrategy` with `snake_case` database columns and `camelCase` TypeScript properties.
   - Every primary key is `UUIDv4` using `@PrimaryGeneratedColumn('uuid')`.
   - Audit columns are mandatory: `@CreateDateColumn({ name: 'created_at' })`, `@UpdateDateColumn({ name: 'updated_at' })`, and `@DeleteDateColumn({ name: 'deleted_at' })` for soft-deleted tables.
   - **Never use `synchronize: true` in production or staging**. Always use TypeORM migrations.

---

## 2. Standard Module Blueprint

When creating a new NestJS module (e.g., `src/modules/posts/`), follow this exact layout:

```
src/modules/posts/
├── dto/
│   ├── create-post.dto.ts       # class-validator & class-transformer
│   ├── update-post.dto.ts
│   └── post-response.dto.ts
├── entities/
│   └── post.entity.ts           # TypeORM entity
├── posts.controller.ts          # HTTP Route handler, Swagger docs, Guards
├── posts.service.ts             # Domain business logic & transactions
├── posts.repository.ts          # Optional custom repository or @InjectRepository
└── posts.module.ts              # Exports & imports declaration
```

### Controller Best Practices
```typescript
@ApiTags('Posts')
@Controller('api/v1/posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePostDto,
  ) {
    return this.postsService.create(userId, dto);
  }
}
```

### Service & Transaction Handling
Always wrap multi-table modifications inside TypeORM `DataSource` or `QueryRunner` transactions:
```typescript
@Injectable()
export class PostsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    private readonly rabbitProducer: RabbitMqProducer,
  ) {}

  async create(userId: string, dto: CreatePostDto): Promise<Post> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const post = queryRunner.manager.create(Post, {
        authorId: userId,
        content: dto.content,
        privacy: dto.privacy,
      });
      const savedPost = await queryRunner.manager.save(post);

      await queryRunner.commitTransaction();

      // Emit async event after transaction succeeds
      await this.rabbitProducer.publish('weshare.topic', 'feed.post.created', {
        postId: savedPost.id,
        authorId: userId,
        privacy: savedPost.privacy,
      });

      return savedPost;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
```

---

## 3. Asynchronous Jobs & RabbitMQ Conventions

1. **Exchange**: Use topic exchange `weshare.topic`.
2. **Queues**:
   - `email.send.queue`: Routing key `email.*`
   - `notification.push.queue`: Routing key `notif.*`
   - `feed.fanout.queue`: Routing key `feed.*`
   - `search.sync.queue`: Routing key `search.*`
3. **Dead Letter Exchange (DLX)**:
   - All queues declare `x-dead-letter-exchange: weshare.dlx`.
   - Failed messages retry up to 3 times before moving to `weshare.dead_letter_queue`.
4. **Periodic Data Purging**:
   - Chunked Deletion (1,000 rows batch) with `pg_sleep(0.1)` interval to avoid PostgreSQL table lock.
   - Run daily at 02:00 AM on `weshare-worker`.

---

## 4. Security & Guard Conventions

1. **Public vs Protected Routes**:
   - By default, all routes require `JwtAuthGuard` unless marked with custom `@Public()` decorator.
2. **Role-Based Access Control (RBAC)**:
   - Use `@Roles('ADMIN')` with `RolesGuard` for administrative endpoints.
3. **Rate Limiting**:
   - Apply `ThrottlerGuard` with Redis storage for brute-force protection (e.g., OTP verify max 5 attempts/minute).
4. **Input Validation**:
   - Always enable global `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true, transform: true`.

---

## 5. Verification Commands

Run these checks to verify backend integrity:
```bash
# 1. Type check
cd backend && npm run build

# 2. Run unit tests
npm run test

# 3. Check database migrations status
npm run typeorm migration:show -- -d src/database/data-source.ts
```
