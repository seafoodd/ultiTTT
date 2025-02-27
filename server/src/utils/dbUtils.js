import prisma from "../../prisma/prismaClient.js";
import {calculateRatingChange} from "./ratingUtils.js";

/**
 * Saves the game result to the database and updates player ELO ratings.
 */
export const saveGameResult = async (gameId, game, overallWinner, isRanked, status) => {
    try {
        const [playerX, playerO] = await Promise.all(
            game.players.map(player =>
                prisma.user.findUnique({
                    where: {username: player.username},
                    select: {
                        username: true,
                        perfs: {
                            select: {
                                bullet: {select: {elo: true, rd: true, vol: true}},
                                blitz: {select: {elo: true, rd: true, vol: true}},
                                rapid: {select: {elo: true, rd: true, vol: true}},
                                standard: {select: {elo: true, rd: true, vol: true}},
                            },
                        },
                    },
                })
            )
        );

        if (!playerX || !playerO) return;

        let playerXEloChange = 0;
        let playerOEloChange = 0;

        const gameType = game.gameType;

        if (isRanked) {
            const [playerXOutcome, playerOOutcome] = [
                overallWinner === game.players[0].symbol ? 1 : overallWinner ? 0 : 0.5,
                overallWinner === game.players[1].symbol ? 1 : overallWinner ? 0 : 0.5,
            ];

            const {newElo: newEloX, newRd: newRdX, newVol: newVolX} = calculateRatingChange(
                playerX.perfs[gameType].elo,
                playerX.perfs[gameType].rd,
                playerX.perfs[gameType].vol,
                playerO.perfs[gameType].elo,
                playerO.perfs[gameType].rd,
                playerXOutcome
            );

            const {newElo: newEloO, newRd: newRdO, newVol: newVolO} = calculateRatingChange(
                playerO.perfs[gameType].elo,
                playerO.perfs[gameType].rd,
                playerO.perfs[gameType].vol,
                playerX.perfs[gameType].elo,
                playerX.perfs[gameType].rd,
                playerOOutcome
            );

            playerXEloChange = newEloX - playerX.perfs[gameType].elo;
            playerOEloChange = newEloO - playerO.perfs[gameType].elo;

            await Promise.all([
                updatePerformance(playerX.username, gameType, newEloX, newRdX, newVolX),
                updatePerformance(playerO.username, gameType, newEloO, newRdO, newVolO),
            ]);
        }

        const winnerUsername = overallWinner
            ? overallWinner === game.players[0].symbol
                ? playerX.username
                : playerO.username
            : null;

        await prisma.game.create({
            data: {
                id: gameId,
                board: game.board,
                winner: winnerUsername,
                moveHistory: game.moveHistory,
                gameType: gameType,
                players: {
                    create: [
                        {symbol: "X", userId: playerX.username, playerElo: playerX.perfs[gameType].elo, playerEloChange: playerXEloChange},
                        {symbol: "O", userId: playerO.username, playerElo: playerO.perfs[gameType].elo, playerEloChange: playerOEloChange},
                    ],
                },
                isRanked,
                status,
            },
        });
    } catch (error) {
        console.error("Error saving game result:", error);
    }
};


const updatePerformance = async (username, gameType, newElo, newRd, newVol) => {
    const performance = await prisma.performance.findUnique({
        where: { userId: username },
    });

    if (!performance) {
        throw new Error(`Performance data not found for user: ${username}`);
    }

    const gameTypeMap = {
        blitz: prisma.blitzPerf,
        bullet: prisma.bulletPerf,
        rapid: prisma.rapidPerf,
        standard: prisma.standardPerf,
    };

    const gamePerfModel = gameTypeMap[gameType];

    if (!gamePerfModel) {
        throw new Error(`Unknown game type: ${gameType}`);
    }

    return gamePerfModel.update({
        where: { perfId: performance.id },
        data: { elo: newElo, rd: newRd, vol: newVol },
    });
};
