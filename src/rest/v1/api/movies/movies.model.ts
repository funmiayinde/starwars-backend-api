import { AppModel } from '../../../../_core/app.model';
import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import AppProcessor from '../../../../_core/app.processor';
import MoviesProcessor from './movies.processor';
import MoviesValidation from './movies.validation';
import { Comments } from '../comment/comment.model';

@Entity({ name: 'movies', synchronize: true })
export class Movies extends AppModel {
  public name = 'movies';

  @Column({
    type: 'varchar',
  })
  public title: string;

  @Column({
    type: 'int',
  })
  public episode_id: number;

  @Column({
    type: 'varchar',
  })
  public opening_crawl: string;

  @Column({
    type: 'varchar',
  })
  public director: string;

  @Column({
    type: 'varchar',
  })
  public release_date: string;

  @Column({
    type: 'simple-json',
  })
  public characters: string[];

  @Column({
    type: 'simple-json',
  })
  public planets: string[];

  @Column({
    type: 'simple-json',
  })
  public starships: string[];

  @Column({
    type: 'simple-json',
  })
  public vehicles: string[];

  @Column({
    type: 'simple-json',
  })
  public species: string[];

  @Column({
    type: 'varchar',
  })
  public url: string;

  @Column({
    type: 'timestamp',
  })
  public created: Date;

  @Column({
    type: 'timestamp',
  })
  public edited: Date;
  
  @Column({
    type: 'int',
    default: 0
  })
  public comment_count: number;


  @Column({
    type: 'varchar',
    nullable: true,
    select: false,
  })
  public comment_id: string;

  @OneToMany(() => Comments, (comments) => comments.movies, { nullable: true })
  @JoinColumn({ name: 'comment_id' })
  public comments: Comments[];

  public config() {
    return {
      softDelete: false,
      uniques: ['title'],
      returnDuplicates: true,
      hiddenFields: ['deleted', 'name'],
    };
  }

  public getProcessor(): AppProcessor {
    return new MoviesProcessor(new Movies());
  }

  public getValidation(): MoviesValidation {
    return new MoviesValidation();
  }

  public static newInstance(): Movies {
    return new Movies();
  }
}
