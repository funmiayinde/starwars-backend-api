import { AppModel } from "../../../../_core/app.model";
import {  Column, Entity } from "typeorm";
import AppProcessor from "../../../../_core/app.processor";
import TodoProcessor from "./todo.processor";
import TodoValidation from "./todo.validation";



@Entity({name: 'todos'})
export class Todo extends AppModel {
    public name =  'todos'; 

    public fillables = ['title','description'];

    public uniques = ['title'];

    public softDelete = false;

    @Column({
        type: 'varchar',
    })
    public title: string;

    @Column({
        type: 'varchar',
    })
    public description: string;

    public getProcessor(): AppProcessor {
       return new TodoProcessor(new Todo());
    }

    public getValidation(): TodoValidation {
        return new TodoValidation();
    }

    public static newInstance(): Todo {
        return new Todo();
    }
}