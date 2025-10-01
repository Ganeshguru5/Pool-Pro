
function generateFixture(players, weightCategory) {
    const numPlayers = players.length;
    if (numPlayers === 0) {
        console.log("No players to generate fixture for.");
        return;
    }

    let numPages = 1;
    if (numPlayers > 50) {
        numPages = 4;
    } else if (numPlayers > 25) {
        numPages = 2;
    }

    const pool1 = players.slice(0, Math.ceil(numPlayers / 2));
    const pool2 = players.slice(Math.ceil(numPlayers / 2));

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        console.log(`Page ${pageNum} of ${numPages}`);
        console.log("36th Tamil Nadu State Taekwondo Championships - 2025");
        console.log("Venue: Annai Sathya (SDAT) Indoor Stadium, Thanjavur District");
        console.log("From: 12/09/2025 To: 14/09/2025");
        console.log("Organised By: Taekwondo Sports Association Thanjavur");
        console.log(`${''.padEnd(80)}Wt: ${weightCategory}`);
        console.log("\n");

        // Players for the current page from Pool 1
        const start_index_p1 = (pageNum - 1) * Math.ceil(pool1.length / numPages);
        const end_index_p1 = pageNum * Math.ceil(pool1.length / numPages);
        const page_pool1 = pool1.slice(start_index_p1, end_index_p1);

        console.log("Pool 1");
        console.log("S.No | District Code | Player Name");
        page_pool1.forEach((player, i) => {
            console.log(`${start_index_p1 + i + 1}) ${player[1]} ${player[0]}`);
        });

        console.log("\n");

        // Players for the current page from Pool 2
        const start_index_p2 = (pageNum - 1) * Math.ceil(pool2.length / numPages);
        const end_index_p2 = pageNum * Math.ceil(pool2.length / numPages);
        const page_pool2 = pool2.slice(start_index_p2, end_index_p2);

        console.log("Pool 2");
        console.log("S.No | District Code | Player Name");
        page_pool2.forEach((player, i) => {
            console.log(`${start_index_p2 + i + 1}) ${player[1]} ${player[0]}`);
        });

        if (pageNum < numPages) {
            console.log("\n" + "-".repeat(80) + "\n");
        }
    }
}

// Example usage with 30 dummy players
const dummyPlayers = [
    ["Mahesh Natarajan .S", "TVY"],
    ["Kavin Kumar .R", "CBE"],
    ["Suresh Kannan .P", "MDU"],
    ["Balaji Murugan .V", "TNJ"],
    ["Vigneshwaran .M", "CHE"],
    ["Arun Pandian .L", "TVL"],
    ["Karthik Raja .G", "ERO"],
    ["Dinesh Kumar .S", "DGL"],
    ["Prabhu .C", "KPM"],
    ["Sriram .V", "NAM"],
    ["Hariharan .S", "SAL"],
    ["Gokulakrishnan .R", "TVR"],
    ["Ashok Kumar .M", "CUD"],
    ["Karthikeyan .S", "KAN"],
    ["Vignesh .R", "NIL"],
    ["Saravanan .K", "TVY"],
    ["Prakash .M", "CBE"],
    ["Rajesh Kumar .S", "MDU"],
    ["Senthil Nathan .R", "TNJ"],
    ["Mohamed Riyaz .A", "CHE"],
    ["Prasanna .G", "TVL"],
    ["Vijay Kumar .B", "ERO"],
    ["Anand .P", "DGL"],
    ["Ganesan .S", "KPM"],
    ["Manikandan .R", "NAM"],
    ["Karthik .S", "SAL"],
    ["Yuvan Shankar .R", "TVR"],
    ["Praveen Kumar .M", "CUD"],
    ["Sarath Kumar .S", "KAN"],
    ["Santhosh .R", "NIL"],
];
generateFixture(dummyPlayers, "Over 87kg");

console.log("\n\n" + "=".repeat(80) + "\n\n");

// Example usage with 55 dummy players
const dummyPlayers55 = dummyPlayers.concat(
    Array.from({ length: 25 }, (_, i) => [`Player ${i}`, `DST${i % 5}`])
);
generateFixture(dummyPlayers55, "Under 80kg");
