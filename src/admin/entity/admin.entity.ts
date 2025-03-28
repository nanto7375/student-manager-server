import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum AdminRoleType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
}

export const getAdminRoleLevel = (role: AdminRoleType) => {
  switch (role) {
    case AdminRoleType.SUPER_ADMIN:
      return 4;
    case AdminRoleType.ADMIN:
      return 3;
    case AdminRoleType.MANAGER:
      return 2;
    case AdminRoleType.STAFF:
      return 1;
    default:
      return 0;
  }
};

@Entity()
export class Admin {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50 })
  password: string;

  @Column({ type: 'varchar', length: 30 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', length: 14, nullable: true, comment: '010-1234-5678' })
  phone: string;

  @Column({ type: 'varchar', length: 20, default: AdminRoleType.STAFF, comment: 'super_admin, admin, manager, staff' })
  role: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  get roleLevel() {
    return getAdminRoleLevel(this.role as AdminRoleType);
  }

  get withoutPassword() {
    const { password, ...admin } = this;
    return admin;
  }

  static of(adminOf: AdminOf) {
    const admin = new Admin();
    admin.password = adminOf.password;
    admin.name = adminOf.name;
    admin.email = adminOf.email;
    admin.phone = adminOf.phone;
    admin.role = adminOf.role;
    return admin;
  }
}

export class AdminOf {
  password: string;
  name: string;
  email: string;
  phone: string;
  role: AdminRoleType;
}
