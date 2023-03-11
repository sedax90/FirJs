import { Vector } from "../models";

export function subtract(v1: Vector, v2: Vector): Vector {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y
    } as Vector;
}

export function distance(vector: Vector): number {
    return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
}