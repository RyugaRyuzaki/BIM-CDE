import {AnyColumn, SQL, inArray, is, sql} from "drizzle-orm";
import {PgTimestampString, SelectedFields} from "drizzle-orm/pg-core";
import {SelectResultFields} from "drizzle-orm/query-builders/select.types";

export function jsonBuildObject<T extends SelectedFields>(shape: T) {
  const chunks: SQL[] = [];

  Object.entries(shape).forEach(([key, value]) => {
    if (chunks.length > 0) {
      chunks.push(sql.raw(`,`));
    }

    chunks.push(sql.raw(`'${key}',`));

    // json_build_object formats to ISO 8601 ...
    if (is(value, PgTimestampString)) {
      chunks.push(sql`timezone('UTC', ${value})`);
    } else {
      chunks.push(sql`${value}`);
    }
  });

  return sql<SelectResultFields<T>>`coalesce(json_build_object(${sql.join(
    chunks
  )}), '{}')`;
}

export function jsonAggBuildObject<
  T extends SelectedFields,
  Column extends AnyColumn
>(
  shape: T,
  options?: {orderBy?: {colName: Column; direction: "ASC" | "DESC"}}
) {
  return sql<SelectResultFields<T>[]>`coalesce(jsonb_agg(${jsonBuildObject(
    shape
  )}${
    options?.orderBy
      ? sql`order by ${options.orderBy.colName} ${sql.raw(
          options.orderBy.direction
        )}`
      : undefined
  }), '${sql`[]`}')`;
}

export function inJsonArray<T extends SQL.Aliased<unknown[]>>(
  jsonArray: T,
  key: keyof T["_"]["type"][number],
  values: string[]
) {
  const element = sql.raw(`${String(key)}_array_element`);

  return sql`EXISTS (
		SELECT 1
		FROM jsonb_array_elements(${jsonArray}) AS ${element}
		WHERE ${inArray(sql`${element}->>${key}`, values)}
	  )`;
}

export function distinctOn<Column extends AnyColumn>(column: Column) {
  return sql<Column["_"]["data"]>`distinct on (${column}) ${column}`;
}
