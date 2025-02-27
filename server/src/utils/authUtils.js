import jwt from "jsonwebtoken";
import prisma from "../../prisma/prismaClient.js";

export const getUserByToken = async (token) => {
    if (!token) throw new Error("No token provided");

    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
            if (err) return reject(new Error("Token verification failed"));
            if (user.role === "guest") {
                const guest = {username: user.identifier, role: "guest"};
                resolve(guest);
            }
            try {
                const dbUser = await prisma.user.findFirst({
                    where: {
                        OR: [{ email: user.identifier }, { username: user.identifier }],
                    },
                    select: {
                        username: true,
                        email: true,
                        supporter: true,
                        perfs: {
                            select: {
                                bullet: {
                                    select: {
                                        elo: true,
                                        rd: true,
                                        vol:true,
                                    },
                                },
                                blitz: {
                                    select: {
                                        elo: true,
                                        rd: true,
                                        vol:true,
                                    },
                                },
                                rapid: {
                                    select: {
                                        elo: true,
                                        rd: true,
                                        vol:true,
                                    },
                                },
                                standard: {
                                    select: {
                                        elo: true,
                                        rd: true,
                                        vol:true,
                                    },
                                },
                            },
                        },
                        playtime: true,
                        games: true,
                    },
                });


                // console.log(dbUser)

                if (!dbUser) return reject(new Error("User not found"));
                resolve({...dbUser, role: "user"});
            } catch (error) {
                reject(new Error("Database query failed"));
            }
        });
    });
};
