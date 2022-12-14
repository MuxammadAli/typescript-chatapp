import { MigrationInterface, QueryRunner, Table } from "typeorm"
import { ParticipantRole, ParticipantStatus } from "../enums/participants";

export class CreateParticipants1656822208500 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
              name: "participants",
              columns: [
                {
                  name: "id",
                  type: "uuid",
                  isPrimary: true,
                },
                {
                  name: "user_id",
                  type: "uuid",
                },
                {
                  name: "status",
                  type: "varchar",
                  default: "OFFLINE"
                },
                {
                  name: "state",
                  type: "varchar",
                  isNullable: true
                },
                {
                  name: "role",
                  type: "varchar",
                  default: ParticipantRole.PARTICIPANT
                },
                {
                  name: "participating_since",
                  type: "timestamp",
                  default: "now()",
                },
              ],
              foreignKeys: [
                {
                  name: "FKParticipantID",
                  referencedTableName: "participants",
                  columnNames: ["user_id"],
                  referencedColumnNames: ["id"],
                },
              ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("participants");
    }

}
