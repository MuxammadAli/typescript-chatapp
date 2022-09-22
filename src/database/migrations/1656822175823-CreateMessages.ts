import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateMessages1656822175823 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
              name: "messages",
              columns: [
                {
                  name: "id",
                  type: "uuid",
                  isPrimary: true,
                },
                {
                  name: "author_id",
                  type: "uuid",
                },
                {
                  name: "participant_id",
                  type: "uuid",
                  isNullable: true
                },
                {
                  name: "reply_to_id",
                  type: "uuid",
                  isNullable: true
                },
                {
                  name: "message",
                  type: "varchar",
                  length: "5000",
                  isNullable: true
                },
                {
                  name: "updated_at",
                  type: "timestamp",
                  default: "now()",
                },
                {
                  name: "created_at",
                  type: "timestamp",
                  default: "now()",
                },
              ],
              foreignKeys: [
                {
                  name: "FKAuthorID",
                  referencedTableName: "users",
                  referencedColumnNames: ["id"],
                  columnNames: ["author_id"],
                  onDelete: "CASCADE",
                  onUpdate: "CASCADE",
                },
                {
                  name: "FKReplyToID",
                  referencedTableName: "messages",
                  referencedColumnNames: ["id"],
                  columnNames: ["reply_to_id"],
                  onDelete: "CASCADE",
                  onUpdate: "CASCADE",
                },
                {
                  name: "FKParticipantID",
                  referencedTableName: "participants",
                  referencedColumnNames: ["id"],
                  columnNames: ["participant_id"],
                  onDelete: "CASCADE",
                  onUpdate: "CASCADE",
                },
              ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("messages");
    }

}
