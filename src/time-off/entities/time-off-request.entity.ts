import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TimeOffRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  HCM_SYNC_FAILED = 'HCM_SYNC_FAILED',
}

@Entity()
export class TimeOffRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column()
  locationId: string;

  @Column('float')
  requestedDays: number;

  @Column({
    type: 'varchar',
    enum: TimeOffRequestStatus,
    default: TimeOffRequestStatus.PENDING,
  })
  status: TimeOffRequestStatus;

  @CreateDateColumn()
  createdAt: Date;
}
