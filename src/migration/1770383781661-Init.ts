import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1770383781661 implements MigrationInterface {
    name = 'Init1770383781661'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "country" ADD "continent" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "country" DROP COLUMN "continent"`);
    }

}
