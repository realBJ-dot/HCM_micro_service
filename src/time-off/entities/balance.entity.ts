import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn, Index } from 'typeorm';

@Entity('balances')
export class Balance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'employee_id' })
  employeeId: string;

  @Index()
  @Column({ name: 'location_id' })
  locationId: string;

  @Column('float', { name: 'available_days' })
  availableDays: number;

  @UpdateDateColumn({ name: 'last_synced_at' })
  lastSyncedAt: Date;

  @VersionColumn({ default: 1 })
  version: number;
}
