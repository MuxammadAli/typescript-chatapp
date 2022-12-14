import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateAvatars1656822150445 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
              name: "avatars",
              columns: [
                {
                  name: "id",
                  type: "uuid",
                  isPrimary: true,
                },
                {
                  name: "name",
                  type: "varchar",
                },
                {
                  name: "url",
                  type: "varchar",
                  isUnique: true,
                },
                {
                  name: "path",
                  type: "varchar",
                },
                {
                  name: "created_at",
                  type: "timestamp",
                  default: "now()",
                },
              ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("avatars");
    }

}
