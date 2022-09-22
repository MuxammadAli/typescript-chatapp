import { v4 as uuid } from "uuid"
import { Tree, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, UpdateDateColumn, } from "typeorm"
import { User } from "./User";
import { ReadMessage } from "./ReadMessage";
import { Participant } from "./Participant";
import { File } from "./File";

@Entity({ name: "messages"})

class Message {
    @PrimaryColumn()
    readonly id: string;

    @Column()
    author_id: string;


    @Column({ nullable: true })
    participant_id: string;

    @Column({ nullable: true})
    reply_to_id: string;

    @OneToOne(() => Message, {
        nullable: true,
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        cascade: true
    })


    @JoinColumn({ name: "reply_to_id"})
    reply_to: Message;

    
    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: "author_id"})
    author: User;

    @ManyToOne(() => Participant, (participant) => participant.id, {
        eager: true,
        nullable: true,
        cascade: true,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      })
      @JoinColumn({ name: "participant_id" })
      participant: Participant;


    @Column({ length: 5000, default: ""})
    message: string;


    @ManyToOne(() => ReadMessage, (rm) => rm.message)
    @JoinColumn()
    read_messages: ReadMessage[];

    @OneToMany(() => File, (file) => file.message, {
        eager: true,
        nullable: true
    })
    @JoinColumn()
    files: File[]


    @UpdateDateColumn()
    updated_at: Date;

    @CreateDateColumn()
    created_at: Date;

    constructor(){
        if(!this.id){
            this.id = uuid()
        }
    }
}

export { Message }