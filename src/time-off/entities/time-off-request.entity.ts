import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

export enum TimeOffRequestStatus {
  PENDING_HCM = 'PENDING_HCM', // Locally reserved, waiting for HCM
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  HCM_SYNC_FAILED = 'HCM_SYNC_FAILED',
  REFUNDED = 'REFUNDED', // Compensating transaction occurred
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
    default: TimeOffRequestStatus.PENDING_HCM,
  })
  status: TimeOffRequestStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
