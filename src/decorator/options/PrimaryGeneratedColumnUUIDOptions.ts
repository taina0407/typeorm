/**
 * Describes all options for PrimaryGeneratedColumn decorator with numeric uuid strategy.
 */
export interface PrimaryGeneratedColumnUUIDOptions {
    /**
     * Column name in the database.
     */
    name?: string

    /**
     * Column comment. Not supported by all database types.
     */
    comment?: string

    /**
     * Name of the primary key constraint.
     */
    primaryKeyConstraintName?: string

    /**
     * Custom generator function that will be called to generate the UUID value
     * when the id is null or undefined during insertion.
     * This is useful for implementing custom UUID generation algorithms like UUIDv7.
     *
     * @example
     * ```typescript
     * @PrimaryGeneratedColumn("uuid", {
     *   generator: () => uuidv7()
     * })
     * id: string
     * ```
     */
    generator?: () => string
}
