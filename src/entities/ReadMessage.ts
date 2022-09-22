import { v4 as uuid } from "uuid";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, } from "typeorm";
import { User } from "./User";
import { Message } from "./Message";

@Entity({ name: "read_messages"})
class ReadMessage {
    @PrimaryColumn()
    readonly id: string;

    @Column()
    message_id: string;

    @Column()
    user_id: string;

    @ManyToOne(() => User, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        cascade: true,
    })
    @JoinColumn({ name: "user_id"})
    user: User;

    @ManyToOne(() => Message, (message) => message.read_messages, {
        cascade: true,
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    @JoinColumn({ name: "message_id" })
    message: Message;


    @CreateDateColumn()
    read_at: Date;

    constructor(){
        if(!this.id){
            this.id = uuid()
        }
    }
}

export { ReadMessage }