import { Entity } from "../../../../../src/decorator/entity/Entity"
import { PrimaryGeneratedColumn } from "../../../../../src/decorator/columns/PrimaryGeneratedColumn"
import { Column } from "../../../../../src/decorator/columns/Column"

// Generate valid UUIDs for testing
// We use a counter to make UUIDs predictable for testing
let uuidCounter = 1

export function customUuidGenerator(): string {
    // Generate a valid UUID v4 format but with predictable values for testing
    // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const counter = (uuidCounter++).toString().padStart(12, "0")
    return `00000000-0000-4000-8000-${counter}`
}

export function resetUuidCounter() {
    uuidCounter = 1
}

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid", {
        generator: () => customUuidGenerator(),
    })
    id: string

    @Column()
    name: string
}
