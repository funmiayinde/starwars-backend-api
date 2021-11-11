import { AppModel } from '../../../../_core/app.model';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import AppProcessor from '../../../../_core/app.processor';
import CommentProcessor from './comment.processor';
import CommentValidation from './comment.validation';
import { Movies } from '../movies/movies.model';

@Entity({ name: 'comments', synchronize: true })
export class Comments extends AppModel {
  public name = 'comments';

  @Column({
    type: 'varchar',
  })
  public text: string;

  @Column({
    type: 'varchar',
  })
  public ip_address: string;
  
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public comment_date: Date;
  
  @Column({
    type: 'varchar',
  })
  public movie_id: string;
  
  @ManyToOne(() => Movies, movie => movie.comments )
  @JoinColumn({ name: 'movie_id' })
  public movies: Movies;
  

  public config() {
    return {
      softDelete: false,
      hiddenFields: ['deleted', 'name'],
      excludeField: ['deleted', 'name'],
    };
  }

  public getProcessor(): AppProcessor {
    return new CommentProcessor(new Comments());
  }

  public getValidation(): CommentValidation {
    return new CommentValidation();
  }

  public static newInstance(): Comments {
    return new Comments();
  }
}
