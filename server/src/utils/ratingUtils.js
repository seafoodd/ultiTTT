/**
 * Calculates the ELO change for a player based on the game outcome.
 * I tried making something similar to glicko-2 but i'm too stupid for it
 * TODO: Actually implement glicko-2 elo system.
 */
export const calculateRatingChange = (
  playerElo,
  playerRd,
  playerVol,
  opponentElo,
  opponentRd,
  outcome,
) => {
  const q = Math.log(10) / 400;
  const g = (rd) =>
    1 / Math.sqrt(1 + (3 * q * q * rd * rd) / (Math.PI * Math.PI));
  const E = (rating, opponentRating, rd) =>
    1 / (1 + Math.pow(10, (-g(rd) * (rating - opponentRating)) / 400));

  const d2 =
    1 /
    (q *
      q *
      g(opponentRd) *
      g(opponentRd) *
      E(playerElo, opponentElo, opponentRd) *
      (1 - E(playerElo, opponentElo, opponentRd)));

  const newElo =
    playerElo +
    (q / (1 / (playerRd * playerRd) + 1 / d2)) *
      g(opponentRd) *
      (outcome - E(playerElo, opponentElo, opponentRd));
  const newVol = Math.min(800, Math.sqrt(playerVol * playerVol + d2));
  const newRd = Math.max(
    120,
    1 / Math.sqrt(1 / (playerRd * playerRd) + 1 / d2),
  );

  return { newElo, newRd, newVol };
};
