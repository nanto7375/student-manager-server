import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from '@src/common/utils/bcrypt';
import { PrismaService } from '@src/configs/prisma/prisma.service';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService, { provide: PrismaService, useValue: {} }, { provide: BcryptService, useValue: {} }],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
