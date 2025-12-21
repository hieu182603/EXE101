// src/product/category.entity.ts

import { Entity, OneToMany } from "typeorm";
import { Product } from "../product.entity";
import { NamedEntity } from "@/common/NamedEntity";

@Entity("categories")
export class Category extends NamedEntity{
    @OneToMany(() => Product, (product) => product.category)
    products: Product[];
}
