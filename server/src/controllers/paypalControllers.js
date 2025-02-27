import { fetchUserByUsername } from "./userController.js";

export const handlePayPalDonation = async (req, res) => {
    const { transactionID, payerEmail, amount } = req.body;
    const { username } = req.params;

    console.log(`Transaction ID: ${transactionID}`);
    console.log(`Payer Email: ${payerEmail}`);
    console.log(`Amount: $${amount}`);
    console.log(`Username: ${username}`);

    try {
        const user = await fetchUserByUsername(username);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (amount >= 1) {
            const badgeExpiryDate = new Date();
            badgeExpiryDate.setMonth(badgeExpiryDate.getMonth() + 1);

            await assignBadgeToUser(user.username, badgeExpiryDate);

            res.status(200).json({ message: "Badge assigned successfully" });
        } else {
            res.status(400).json({ message: "Donation amount is too low" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong." });
    }
};

// TODO: add supporter badges
async function assignBadgeToUser(username, expiryDate) {
    console.log(`Assigning badge to user: ${username}, expiring on ${expiryDate}`);
}
