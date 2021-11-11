/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BaseEntity,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  getConnection,
} from 'typeorm';
import { AppMiddleware } from './app.middleware';
import AppProcessor from './app.processor';
import AppValidation from './app.validation';
import { getRepository } from 'typeorm';
import ModelConfig from 'model-type';

export abstract class AppModel extends BaseEntity {
  abstract name: string;

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({
    type: 'boolean',
    default: false,
    select: false,
  })
  public deleted: boolean;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  @CreateDateColumn()
  public created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  @UpdateDateColumn()
  public updated_at: Date;

  public static newInstance () {
     return new BaseEntity();
  }
  
  public repository (tableName?: string) {
     return getRepository(tableName || this.name.toLowerCase());
  }

  public static getRepo(tableName: string){
    return getConnection().getRepository(tableName);
  }

  public config(): ModelConfig {
    return {
      softDelete: true,
      returnDuplicate: true,
      overrideExisting: true,
      slugify: null,
      fillables: [],
      updateFillables: [],
      excludeFields: ['deleted'],
      hiddenFields: ['deleted'],
      uniques: [],
      dateFilters: [],
    };
  }

  public getValidation(): any | AppValidation {
    return new AppValidation();
  }
  public static getMiddleware(): AppMiddleware {
    return new AppMiddleware();
  }
  public static searchQuery(query: string): any {
    return null;
  }
  public static likeSearchQuery(query: string): any {
    return null;
  }
  abstract getProcessor(model?: AppModel): any | AppProcessor;
}
