import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { Population } from "./Population";

@Entity()
export class Country {
  @PrimaryColumn()
  code!: string;

  @Column()
  name!: string;
  @Column()
  continent!: string;
  @Column()
  state!: string;

  @OneToMany(() => Population, (p) => p.country)
  populations!: Population[];
}

