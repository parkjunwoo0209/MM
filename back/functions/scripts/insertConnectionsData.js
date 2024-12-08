// MM/functions/scripts/insertConnectionsData.js

const admin = require("firebase-admin");
const serviceAccount = require("../../firebaseKey.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://metro-map-5f2e7-default-rtdb.asia-southeast1.firebasedatabase.app"
    });
}

const db = admin.firestore();

async function insertConnectionsData() {
    try {
        // 가중치 데이터 정의
        const connectionsData = [
            { startStation: "101", endStation: "102", time: 200, distance: 500, cost: 200 },
            { startStation: "102", endStation: "103", time: 300, distance: 400, cost: 300 },
            { startStation: "103", endStation: "104", time: 1000, distance: 600, cost: 500 },
            { startStation: "104", endStation: "105", time: 500, distance: 200, cost: 340 },
            { startStation: "105", endStation: "106", time: 150, distance: 600, cost: 450 },
            { startStation: "106", endStation: "107", time: 320, distance: 200, cost: 120 },
            { startStation: "107", endStation: "108", time: 400, distance: 700, cost: 650 },
            { startStation: "108", endStation: "109", time: 800, distance: 350, cost: 200 },
            { startStation: "109", endStation: "110", time: 900, distance: 250, cost: 430 },
            { startStation: "110", endStation: "111", time: 500, distance: 650, cost: 120 },
            { startStation: "111", endStation: "112", time: 1000, distance: 400, cost: 890 },
            { startStation: "112", endStation: "113", time: 2000, distance: 500, cost: 800 },
            { startStation: "113", endStation: "114", time: 500, distance: 500, cost: 700 },
            { startStation: "114", endStation: "115", time: 220, distance: 400, cost: 540 },
            { startStation: "115", endStation: "116", time: 230, distance: 600, cost: 330 },
            { startStation: "116", endStation: "117", time: 300, distance: 200, cost: 280 },
            { startStation: "117", endStation: "118", time: 500, distance: 600, cost: 800 },
            { startStation: "118", endStation: "119", time: 480, distance: 200, cost: 1000 },
            { startStation: "119", endStation: "120", time: 500, distance: 700, cost: 2000 },
            { startStation: "120", endStation: "121", time: 400, distance: 350, cost: 700 },
            { startStation: "121", endStation: "122", time: 900, distance: 250, cost: 650 },
            { startStation: "122", endStation: "123", time: 300, distance: 650, cost: 440 },
            { startStation: "123", endStation: "101", time: 480, distance: 400, cost: 200 },
            { startStation: "101", endStation: "201", time: 1000, distance: 500, cost: 300 },
            { startStation: "201", endStation: "202", time: 250, distance: 500, cost: 500 },
            { startStation: "202", endStation: "203", time: 480, distance: 400, cost: 340 },
            { startStation: "203", endStation: "204", time: 400, distance: 600, cost: 450 },
            { startStation: "204", endStation: "205", time: 250, distance: 200, cost: 120 },
            { startStation: "205", endStation: "206", time: 500, distance: 600, cost: 650 },
            { startStation: "206", endStation: "207", time: 320, distance: 200, cost: 200 },
            { startStation: "207", endStation: "208", time: 250, distance: 700, cost: 430 },
            { startStation: "208", endStation: "209", time: 300, distance: 350, cost: 120 },
            { startStation: "209", endStation: "210", time: 150, distance: 250, cost: 890 },
            { startStation: "210", endStation: "211", time: 900, distance: 650, cost: 800 },
            { startStation: "211", endStation: "212", time: 320, distance: 400, cost: 700 },
            { startStation: "212", endStation: "213", time: 150, distance: 500, cost: 540 },
            { startStation: "213", endStation: "214", time: 500, distance: 500, cost: 330 },
            { startStation: "214", endStation: "215", time: 210, distance: 400, cost: 280 },
            { startStation: "215", endStation: "216", time: 150, distance: 600, cost: 800 },
            { startStation: "216", endStation: "217", time: 500, distance: 200, cost: 1000 },
            { startStation: "207", endStation: "301", time: 300, distance: 600, cost: 2000 },
            { startStation: "301", endStation: "302", time: 300, distance: 200, cost: 700 },
            { startStation: "302", endStation: "303", time: 480, distance: 700, cost: 650 },
            { startStation: "303", endStation: "304", time: 400, distance: 350, cost: 440 },
            { startStation: "304", endStation: "123", time: 250, distance: 250, cost: 200 },
            { startStation: "123", endStation: "305", time: 300, distance: 650, cost: 300 },
            { startStation: "305", endStation: "306", time: 250, distance: 400, cost: 500 },
            { startStation: "306", endStation: "307", time: 900, distance: 500, cost: 340 },
            { startStation: "307", endStation: "308", time: 480, distance: 500, cost: 450 },
            { startStation: "308", endStation: "107", time: 400, distance: 400, cost: 120 },
            { startStation: "104", endStation: "401", time: 1000, distance: 600, cost: 650 },
            { startStation: "401", endStation: "307", time: 150, distance: 200, cost: 200 },
            { startStation: "307", endStation: "402", time: 300, distance: 600, cost: 430 },
            { startStation: "402", endStation: "403", time: 210, distance: 200, cost: 120 },
            { startStation: "403", endStation: "404", time: 320, distance: 700, cost: 890 },
            { startStation: "404", endStation: "405", time: 210, distance: 350, cost: 800 },
            { startStation: "405", endStation: "406", time: 500, distance: 250, cost: 700 },
            { startStation: "406", endStation: "407", time: 300, distance: 650, cost: 540 },
            { startStation: "407", endStation: "115", time: 320, distance: 400, cost: 330 },
            { startStation: "115", endStation: "408", time: 480, distance: 500, cost: 280 },
            { startStation: "408", endStation: "409", time: 300, distance: 340, cost: 800 },
            { startStation: "409", endStation: "410", time: 480, distance: 500, cost: 1000 },
            { startStation: "410", endStation: "411", time: 300, distance: 400, cost: 2000 },
            { startStation: "411", endStation: "412", time: 900, distance: 600, cost: 700 },
            { startStation: "412", endStation: "413", time: 400, distance: 200, cost: 650 },
            { startStation: "413", endStation: "414", time: 430, distance: 600, cost: 440 },
            { startStation: "414", endStation: "415", time: 150, distance: 200, cost: 200 },
            { startStation: "415", endStation: "416", time: 1000, distance: 700, cost: 300 },
            { startStation: "416", endStation: "417", time: 500, distance: 350, cost: 500 },
            { startStation: "417", endStation: "216", time: 900, distance: 250, cost: 340 },
            { startStation: "209", endStation: "501", time: 320, distance: 650, cost: 450 },
            { startStation: "501", endStation: "502", time: 320, distance: 400, cost: 120 },
            { startStation: "502", endStation: "503", time: 430, distance: 500, cost: 650 },
            { startStation: "503", endStation: "504", time: 210, distance: 500, cost: 200 },
            { startStation: "504", endStation: "122", time: 320, distance: 400, cost: 430 },
            { startStation: "122", endStation: "505", time: 480, distance: 600, cost: 120 },
            { startStation: "505", endStation: "506", time: 300, distance: 200, cost: 890 },
            { startStation: "506", endStation: "403", time: 320, distance: 600, cost: 800 },
            { startStation: "403", endStation: "507", time: 300, distance: 200, cost: 700 },
            { startStation: "507", endStation: "109", time: 1000, distance: 700, cost: 540 },
            { startStation: "601", endStation: "602", time: 150, distance: 350, cost: 330 },
            { startStation: "602", endStation: "121", time: 700, distance: 250, cost: 280 },
            { startStation: "121", endStation: "603", time: 500, distance: 650, cost: 800 },
            { startStation: "603", endStation: "604", time: 300, distance: 400, cost: 1000 },
            { startStation: "604", endStation: "605", time: 430, distance: 200, cost: 2000 },
            { startStation: "605", endStation: "606", time: 480, distance: 300, cost: 700 },
            { startStation: "606", endStation: "116", time: 320, distance: 400, cost: 650 },
            { startStation: "116", endStation: "607", time: 250, distance: 200, cost: 440 },
            { startStation: "607", endStation: "608", time: 500, distance: 600, cost: 200 },
            { startStation: "608", endStation: "609", time: 700, distance: 200, cost: 300 },
            { startStation: "609", endStation: "412", time: 320, distance: 700, cost: 500 },
            { startStation: "412", endStation: "610", time: 1000, distance: 350, cost: 340 },
            { startStation: "610", endStation: "611", time: 700, distance: 250, cost: 450 },
            { startStation: "611", endStation: "612", time: 700, distance: 650, cost: 120 },
            { startStation: "612", endStation: "613", time: 150, distance: 400, cost: 650 },
            { startStation: "613", endStation: "614", time: 430, distance: 200, cost: 200 },
            { startStation: "614", endStation: "615", time: 500, distance: 300, cost: 430 },
            { startStation: "615", endStation: "616", time: 700, distance: 400, cost: 120 },
            { startStation: "616", endStation: "417", time: 480, distance: 200, cost: 890 },
            { startStation: "417", endStation: "617", time: 320, distance: 600, cost: 800 },
            { startStation: "617", endStation: "618", time: 300, distance: 200, cost: 700 },
            { startStation: "618", endStation: "619", time: 250, distance: 700, cost: 540 },
            { startStation: "619", endStation: "620", time: 700, distance: 350, cost: 330 },
            { startStation: "620", endStation: "621", time: 320, distance: 250, cost: 280 },
            { startStation: "621", endStation: "622", time: 480, distance: 650, cost: 800 },
            { startStation: "622", endStation: "601", time: 150, distance: 400, cost: 1000 },
            { startStation: "202", endStation: "303", time: 1000, distance: 200, cost: 2000 },
            { startStation: "303", endStation: "503", time: 700, distance: 300, cost: 700 },
            { startStation: "503", endStation: "601", time: 500, distance: 400, cost: 650 },
            { startStation: "601", endStation: "701", time: 430, distance: 200, cost: 440 },
            { startStation: "701", endStation: "702", time: 150, distance: 600, cost: 200 },
            { startStation: "702", endStation: "703", time: 600, distance: 200, cost: 300 },
            { startStation: "703", endStation: "704", time: 700, distance: 700, cost: 500 },
            { startStation: "704", endStation: "705", time: 250, distance: 350, cost: 340 },
            { startStation: "705", endStation: "706", time: 600, distance: 250, cost: 450 },
            { startStation: "706", endStation: "416", time: 300, distance: 650, cost: 120 },
            { startStation: "416", endStation: "707", time: 430, distance: 400, cost: 650 },
            { startStation: "707", endStation: "614", time: 480, distance: 200, cost: 200 },
            { startStation: "113", endStation: "801", time: 600, distance: 300, cost: 430 },
            { startStation: "801", endStation: "802", time: 1000, distance: 400, cost: 120 },
            { startStation: "802", endStation: "803", time: 700, distance: 200, cost: 890 },
            { startStation: "803", endStation: "409", time: 600, distance: 600, cost: 800 },
            { startStation: "409", endStation: "608", time: 500, distance: 200, cost: 700 },
            { startStation: "608", endStation: "804", time: 700, distance: 700, cost: 540 },
            { startStation: "804", endStation: "805", time: 150, distance: 350, cost: 330 },
            { startStation: "805", endStation: "806", time: 210, distance: 250, cost: 280 },
            { startStation: "806", endStation: "705", time: 600, distance: 650, cost: 800 },
            { startStation: "705", endStation: "618", time: 250, distance: 400, cost: 1000 },
            { startStation: "618", endStation: "214", time: 700, distance: 200, cost: 2000 },
            { startStation: "112", endStation: "901", time: 600, distance: 300, cost: 700 },
            { startStation: "901", endStation: "406", time: 300, distance: 400, cost: 650 },
            { startStation: "406", endStation: "605", time: 210, distance: 200, cost: 440 },
            { startStation: "605", endStation: "902", time: 480, distance: 600, cost: 280 },
            { startStation: "902", endStation: "119", time: 430, distance: 200, cost: 800 },
            { startStation: "119", endStation: "903", time: 1000, distance: 700, cost: 1000 },
            { startStation: "903", endStation: "702", time: 150, distance: 350, cost: 2000 },
            { startStation: "702", endStation: "904", time: 500, distance: 250, cost: 700 },
            { startStation: "904", endStation: "621", time: 250, distance: 650, cost: 650 },
            { startStation: "621", endStation: "211", time: 300, distance: 400, cost: 440 }
        ];

        // Firestore에 양방향 연결 데이터 삽입
        for (const connection of connectionsData) {
            const { startStation, endStation, time, distance, cost } = connection;

            // 문서 이름을 "startStation의 값 - endStation의 값"으로 설정
            const docName = `${startStation}-${endStation}`;
            const reverseDocName = `${endStation}-${startStation}`;

            // 연결 정보 Firestore에 저장 (원래 방향)
            await db.collection("Connections").doc(docName).set({
                startStation,
                endStation,
                time,
                distance,
                cost,
            });

            // 연결 정보 Firestore에 저장 (반대 방향)
            await db.collection("Connections").doc(reverseDocName).set({
                startStation: endStation,
                endStation: startStation,
                time,
                distance,
                cost,
            });

            console.log(`Connection from ${startStation} to ${endStation} and from ${endStation} to ${startStation} added successfully`);
        }

        console.log("All connection data inserted successfully");

    } catch (error) {
        console.error("Error inserting connection data:", error);
    }
}

// 데이터베이스에 삽입 함수 실행
insertConnectionsData();