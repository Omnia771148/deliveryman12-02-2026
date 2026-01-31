
async function testNotification() {
    try {
        console.log("Sending test notification...");
        const response = await fetch('https://deliverymanmain.vercel.app/api/deliveryboy/broadcast-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "Test Notification 🚀",
                body: "If you see this, the system is working perfectly!"
            })
        });
        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

testNotification();
