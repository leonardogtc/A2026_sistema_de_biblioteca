/*
  Warnings:

  - Added the required column `senha` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "foto" BYTEA,
ADD COLUMN     "foto_mime_type" VARCHAR(50),
ADD COLUMN     "senha" VARCHAR(255) NOT NULL;
