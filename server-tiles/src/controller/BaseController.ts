import {Request, Response, NextFunction} from "express";
import {NodePgDatabase} from "drizzle-orm/node-postgres";

import * as schema from "../db/schema";
export enum ICode {
  CREATE = 201,
  UPDATE = 202,
  DELETE = 204,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,
}

export type ValidationError = {
  key: string;
  message: string;
};

export type ValidationResult<T> = T extends true ? "OK" : ValidationError;

export abstract class BaseController<V> {
  /**
   * Create a new record in the database
   * @param data - The data to create
   * @returns A response indicating the result of the operation
   */
  abstract create: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;

  /**
   * Read a record from the database by ID
   * @param id - The ID of the record to retrieve
   * @returns A response containing the retrieved record or an error
   */
  abstract read: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;

  /**
   * Update a record in the database
   * @param id - The ID of the record to update
   * @param data - The new data to apply
   * @returns A response indicating the result of the update operation
   */
  abstract update: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;

  /**
   * Delete a record from the database
   * @param id - The ID of the record to delete
   * @returns A response indicating the result of the delete operation
   */
  abstract delete: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;

  /**
   * Bulk insert records into the database
   * @param data - An array of records to insert
   * @returns A response indicating the result of the operation
   */
  abstract bulkInsert: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;

  /**
   * Find a record by ID
   * @param id - The ID of the record to find
   * @returns A response containing the found record or an error
   */
  abstract findById: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;

  /**
   * Find records by a dynamic query
   * @param query - The query object used to filter records
   * @returns A response containing the found records or an error
   */
  abstract findByDynamicQuery: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;

  /**
   *
   */
  constructor(public db: NodePgDatabase<typeof schema>) {}
}
