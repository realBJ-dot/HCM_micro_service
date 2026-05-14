import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

export enum TimeOffRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  HCM_SYNC_FAILED = 'HCM_SYNC_FAILED',
}

@Entity('time_off_requests')
export class TimeOffRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'employee_id' })
  employeeId: string;

  @Index()
  @Column({ name: 'location_id' })
  locationId: string;

  @Column('float', { name: 'requested_days' })
  requestedDays: number;

  @Column({
    type: 'varchar',
    enum: TimeOffRequestStatus,
    default: TimeOffRequestStatus.PENDING,
  })
  status: TimeOffRequestStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
