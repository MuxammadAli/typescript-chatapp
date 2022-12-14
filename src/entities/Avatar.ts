import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";
import { v4 as uuid } from "uuid";

@Entity({ name: "avatars" })
class Avatar {
  @PrimaryColumn()
  readonly id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  url: string;

  @Column()
  path: string;

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}

export { Avatar };