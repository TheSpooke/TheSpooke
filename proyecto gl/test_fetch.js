const token = "GL_RP_Secure_Key_8492_XyZ!";
fetch('http://216.173.77.115:30120/gl_store_api/redeem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        token: token,
        id: "123",
        user: { fivemId: "license:test" },
        items: [{ name: "coin", amount_coins: 10 }]
    })

}).then(r => r.text().then(t => console.log("STATUS:", r.status, "BODY:", t))).catch(e => console.error("NETWORK ERROR:", e));
