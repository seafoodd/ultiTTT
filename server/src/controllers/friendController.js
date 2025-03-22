import prisma from "../../prisma/prismaClient.js";

export const sendFriendRequest = async (req, res) => {
  if (!req.user) return;
  if (req.user.role === "guest") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { username } = req.params;
  const from = req.user.username;

  if (username === from) {
    return res
      .status(403)
      .json({ error: "You cannot add yourself as a friend. :(" });
  }

  try {
    const toUser = await prisma.user.findUnique({
      where: { username },
    });

    if (!toUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const fromUser = await prisma.user.findUnique({
      where: { username: from },
      select: { friendships1: true, friendships2: true },
    });

    if (!fromUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingFriendship = await prisma.friend.findFirst({
      where: {
        OR: [
          { user1Username: from, user2Username: username },
          { user1Username: username, user2Username: from },
        ],
      },
    });

    if (existingFriendship) {
      return res
        .status(400)
        .json({ error: "You are already friends with this user" });
    }

    const existingReverseRequest = await prisma.friendRequest.findFirst({
      where: {
        fromUsername: username,
        toUsername: from,
      },
      select: { id: true },
    });

    if (existingReverseRequest) {
      await prisma.friendRequest.delete({
        where: {
          id: existingReverseRequest.id,
        },
      });
      await prisma.friend.create({
        data: {
          user1Username: from,
          user2Username: username,
        },
      });
      return res.status(200).json({ message: "Friend request accepted" });
    }

    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        fromUsername: from,
        toUsername: username,
      },
      select: { id: true },
    });

    if (existingRequest) {
      await prisma.friendRequest.delete({
        where: {
          id: existingRequest.id,
        },
      });
      return res.status(200).json({ error: "Friend request cancelled" });
    }

    await prisma.friendRequest.create({
      data: {
        fromUsername: from,
        toUsername: username,
      },
    });

    console.log(`${from} sent friend request to ${username}`);
    res.status(200).json({ message: "Friend request sent" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Something went wrong." });
  }
};

export const removeFriend = async (req, res) => {
  if (!req.user) return;
  if (req.user.role === "guest") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { username } = req.params;
  const from = req.user.username;

  try {
    const existingFriendship = await prisma.friend.findFirst({
      where: {
        OR: [
          { user1Username: from, user2Username: username },
          { user1Username: username, user2Username: from },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!existingFriendship)
      return res
        .status(404)
        .json({ message: "You are not friends with the user" });

    await prisma.friend.delete({ where: { id: existingFriendship.id } });

    res.status(200).json({ message: "Removed friend successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Something went wrong." });
  }
};

// export const acceptRequest = async (req, res) => {
//   const username = req.user.username;
//   const { id } = req.params;
//
//   try {
//     const request = await prisma.friendRequest.findUnique({
//       where: { AND: [{ toUsername: username }, { id }] },
//       select: { fromUsername: true, toUsername: true },
//     });
//
//     if (!request) {
//       return res.json(404).json({ error: "Friend request not found" });
//     }
//
//     await prisma.friend.create({
//       data: {
//         user1Username: request.fromUsername,
//         user2Username: request.toUsername,
//       },
//     });
//
//     res.status(200).json({ message: "Friend request accepted" });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: "Something went wrong." });
//   }
// };

export const getFriends = async (req, res) => {
  if (!req.user) return;
  if (req.user.role === "guest") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const username = req.user.username;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        friendships1: true,
        friendships2: true,
        sentFriendRequests: true,
        receivedFriendRequests: true,
      },
    });

    const friends = [];
    const incomingRequests = user.receivedFriendRequests;
    const outgoingRequests = user.sentFriendRequests;

    for (const friendship of [...user.friendships1, ...user.friendships2]) {
      const { user1Username, user2Username } = friendship;

      friends.push(user1Username === username ? user2Username : user1Username);
    }

    res.status(200).json({ friends, incomingRequests, outgoingRequests });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Something went wrong." });
  }
};
