import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1770384111051 implements MigrationInterface {
    name = 'Init1770384111051'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "country" ADD "continent" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "country" ADD "state" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "country" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "country" DROP COLUMN "continent"`);
    }

}
