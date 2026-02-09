import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  Index,
} from "typeorm";
import { Country } from "./Country";

@Entity()
@Unique(["country", "year"])
export class Population {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Country, (c) => c.populations)
  country!: Country;

  @Index()
  @Column()
  year!: number;

  @Column("bigint", { nullable: true })
  population!: number | null;
}
//deleting country and 