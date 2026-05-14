import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

@Entity()
export class Balance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column()
  locationId: string;

  @Column('float')
  availableDays: number;

  @UpdateDateColumn()
  lastSyncedAt: Date;

  @VersionColumn({ default: 1 })
  version: number;
}
