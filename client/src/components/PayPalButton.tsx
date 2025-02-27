import React, { useEffect } from 'react';
import { useAuth } from "../context/AuthContext";

const PayPalButton = () => {
    const { currentUser, isAuth } = useAuth();

    if (!currentUser || !isAuth) {
        return <div>Please log in to donate.</div>;
    }

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://www.paypal.com/sdk/js?client-id=AZySSDK_vq-EymM5x3yR4neQXDpqtOyE_UwyzLIG-uJWB6WooVB97bHLwY3PVFyQBXPaqOhPuzdlBYqk';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            window.paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: '1.00',
                            }
                        }]
                    });
                },
                onApprove: (data, actions) => {
                    return actions.order.capture().then((details) => {
                        fetch(`http://localhost:5000/paypal-webhook/${currentUser.username}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                transactionID: details.id,
                                payerEmail: details.payer.email_address,
                                amount: details.purchase_units[0].amount.value,
                            }),
                        })
                            .then(response => response.json())
                            .then(() => {
                                alert('Thank you for your donation!');
                            });
                    });
                }
            }).render('#paypal-button-container');
        };
    }, [currentUser]);

    return <div className='bg-color-accent-300' id="paypal-button-container">DONATE</div>;
};

export default PayPalButton;
