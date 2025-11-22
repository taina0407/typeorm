import "reflect-metadata"
import { expect } from "chai"
import { DataSource } from "../../../../src/data-source/DataSource"
import {
    closeTestingConnections,
    createTestingConnections,
    reloadTestingDatabases,
} from "../../../utils/test-utils"
import { User, resetUuidCounter } from "./entity/User"
import { Product } from "./entity/Product"

describe("PrimaryGeneratedColumn with custom generator", () => {
    let connections: DataSource[]

    before(async () => {
        connections = await createTestingConnections({
            entities: [User, Product],
            schemaCreate: true,
            dropSchema: true,
        })
    })

    beforeEach(() => {
        resetUuidCounter()
        return reloadTestingDatabases(connections)
    })

    after(() => closeTestingConnections(connections))

    // Note: Custom generators with @PrimaryGeneratedColumn ONLY work for UUID strategy.
    // Numeric auto-increment columns cannot accept explicit values in most databases.
    // For custom numeric ID generation, use @PrimaryColumn with @BeforeInsert (see Post.ts).

    it("should call custom generator for UUID when id is undefined", () =>
        Promise.all(
            connections.map(async (connection) => {
                const userRepo = connection.getRepository(User)

                const user1 = new User()
                user1.name = "User One"
                await userRepo.save(user1)

                const user2 = new User()
                user2.name = "User Two"
                await userRepo.save(user2)

                // Custom UUID generator creates predictable valid UUIDs for testing
                expect(user1.id).to.equal(
                    "00000000-0000-4000-8000-000000000001",
                )
                expect(user2.id).to.equal(
                    "00000000-0000-4000-8000-000000000002",
                )

                // Verify they were persisted correctly
                const loadedUser1 = await userRepo.findOneBy({ id: user1.id })
                const loadedUser2 = await userRepo.findOneBy({ id: user2.id })

                expect(loadedUser1).to.exist
                expect(loadedUser1!.name).to.equal("User One")
                expect(loadedUser2).to.exist
                expect(loadedUser2!.name).to.equal("User Two")
            }),
        ))

    it("should NOT call custom UUID generator when id is manually provided", () =>
        Promise.all(
            connections.map(async (connection) => {
                const userRepo = connection.getRepository(User)

                const user = new User()
                user.id = "12345678-1234-4234-8234-123456789012" // Manually set UUID
                user.name = "Manual UUID User"
                await userRepo.save(user)

                expect(user.id).to.equal("12345678-1234-4234-8234-123456789012")

                const loadedUser = await userRepo.findOneBy({
                    id: "12345678-1234-4234-8234-123456789012",
                })
                expect(loadedUser).to.exist
                expect(loadedUser!.id).to.equal(
                    "12345678-1234-4234-8234-123456789012",
                )
                expect(loadedUser!.name).to.equal("Manual UUID User")
            }),
        ))

    it("should work with saving multiple entities using custom UUID generator", () =>
        Promise.all(
            connections.map(async (connection) => {
                const userRepo = connection.getRepository(User)

                const users = [
                    Object.assign(new User(), { name: "User 1" }),
                    Object.assign(new User(), { name: "User 2" }),
                    Object.assign(new User(), { name: "User 3" }),
                ]

                await userRepo.save(users)

                expect(users[0].id).to.equal(
                    "00000000-0000-4000-8000-000000000001",
                )
                expect(users[1].id).to.equal(
                    "00000000-0000-4000-8000-000000000002",
                )
                expect(users[2].id).to.equal(
                    "00000000-0000-4000-8000-000000000003",
                )

                const loadedUsers = await userRepo.find({
                    order: { id: "ASC" },
                })
                expect(loadedUsers).to.have.lengthOf(3)
                expect(loadedUsers[0].name).to.equal("User 1")
                expect(loadedUsers[1].name).to.equal("User 2")
                expect(loadedUsers[2].name).to.equal("User 3")
            }),
        ))

    it("should still work with default UUID generation when no custom generator provided", () =>
        Promise.all(
            connections.map(async (connection) => {
                const productRepo = connection.getRepository(Product)

                const product = new Product()
                product.name = "Test Product"
                await productRepo.save(product)

                // Should have a UUID generated (either by database or uuid library)
                expect(product.id).to.exist
                expect(product.id).to.be.a("string")
                expect(product.id.length).to.be.greaterThan(0)

                // Should NOT match our custom format
                expect(product.id).to.not.equal(
                    "00000000-0000-4000-8000-000000000001",
                )

                const loadedProduct = await productRepo.findOneBy({
                    id: product.id,
                })
                expect(loadedProduct).to.exist
                expect(loadedProduct!.name).to.equal("Test Product")
            }),
        ))

    it("should handle null ID same as undefined for custom UUID generator", () =>
        Promise.all(
            connections.map(async (connection) => {
                const userRepo = connection.getRepository(User)

                const user = new User()
                user.id = null as any // Explicitly set to null
                user.name = "Null ID User"
                await userRepo.save(user)

                // Custom generator should be called for null values
                expect(user.id).to.equal("00000000-0000-4000-8000-000000000001")

                const loadedUser = await userRepo.findOneBy({ id: user.id })
                expect(loadedUser).to.exist
                expect(loadedUser!.name).to.equal("Null ID User")
            }),
        ))
})
